// src/stores/announcements.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useAnnouncementStore = defineStore('announcements', () => {
    const announcements = ref([])
    const loading = ref(false)
    const error = ref(null)
    const lastFetch = ref(null)
    
    // Pagination state
    const currentPage = ref(1)
    const perPage = ref(10)
    const totalItems = ref(0)
    const hasMore = ref(true)
    const isLoadingMore = ref(false)

    // Cache duration: 5 minutes
    const CACHE_DURATION = 5 * 60 * 1000

    const isStale = computed(() => {
        if (!lastFetch.value) return true
        return Date.now() - lastFetch.value > CACHE_DURATION
    })

    const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value))

    /**
     * Fetch public announcements with pagination (infinite scroll)
     * Uses cache to avoid redundant API calls on initial load
     */
    async function fetchPublicAnnouncements(force = false) {
        // Use cached data if available and not stale (only for first page)
        if (!force && currentPage.value === 1 && !isStale.value && announcements.value.length > 0) {
            return announcements.value
        }

        loading.value = true
        error.value = null

        try {
            const { data } = await api.get('/api/announcements/feed', {
                params: {
                    page: currentPage.value,
                    per_page: perPage.value
                }
            })
            
            // Replace announcements on first page or force refresh
            if (currentPage.value === 1 || force) {
                announcements.value = data.data || []
            }
            
            // Update pagination metadata
            totalItems.value = data.total || 0
            currentPage.value = data.current_page || 1
            hasMore.value = data.current_page < data.last_page
            
            lastFetch.value = Date.now()
            return announcements.value
        } catch (err) {
            console.error('Failed to fetch announcements:', err)
            error.value = err.response?.data?.message || 'Failed to fetch announcements'
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Load more announcements (infinite scroll)
     */
    async function loadMoreAnnouncements() {
        if (!hasMore.value || isLoadingMore.value) {
            return
        }

        isLoadingMore.value = true
        error.value = null

        try {
            const nextPage = currentPage.value + 1
            const { data } = await api.get('/api/announcements/feed', {
                params: {
                    page: nextPage,
                    per_page: perPage.value
                }
            })

            // Append new announcements
            const newAnnouncements = data.data || []
            announcements.value.push(...newAnnouncements)

            // Update pagination state
            currentPage.value = data.current_page || nextPage
            totalItems.value = data.total || totalItems.value
            hasMore.value = data.current_page < data.last_page

            return newAnnouncements
        } catch (err) {
            console.error('Failed to load more announcements:', err)
            error.value = err.response?.data?.message || 'Failed to load more announcements'
            throw err
        } finally {
            isLoadingMore.value = false
        }
    }

    /**
     * Fetch announcements for a specific organization
     */
    async function fetchOrganizationAnnouncements(organizationId) {
        loading.value = true
        error.value = null

        try {
            const { data } = await api.get('/api/announcements', {
                params: { organization_id: organizationId }
            })
            return data || []
        } catch (err) {
            console.error('Failed to fetch organization announcements:', err)
            error.value = err.response?.data?.message || 'Failed to fetch announcements'
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Create a new announcement (admin only)
     */
    async function createAnnouncement(payload) {
        loading.value = true
        error.value = null

        try {
            const { data } = await api.post('/api/announcements', payload)
            
            // Add to local cache if public
            if (payload.is_public !== false) {
                announcements.value.unshift(data.announcement)
            }
            
            return data.announcement
        } catch (err) {
            console.error('Failed to create announcement:', err)
            error.value = err.response?.data?.message || 'Failed to create announcement'
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Clear cache (force refresh on next fetch)
     */
    function clearCache() {
        announcements.value = []
        lastFetch.value = null
        error.value = null
    }

    return {
        // State
        announcements,
        loading,
        error,
        isStale,

        // Actions
        fetchPublicAnnouncements,
        fetchOrganizationAnnouncements,
        createAnnouncement,
        clearCache
    }
})