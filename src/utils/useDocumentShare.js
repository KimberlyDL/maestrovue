// src/composables/useDocumentShare.js
import { ref } from 'vue'
import axios from '@/utils/api'
import { useToast } from '@/utils/useToast'

export function useDocumentShare() {
    const toast = useToast()

    const loading = ref(false)
    const saving = ref(false)
    const share = ref(null)
    const stats = ref(null)
    const error = ref('')

    /**
     * Load share configuration for a document
     */
    async function loadShare(documentId, organizationId) {
        loading.value = true
        error.value = ''

        try {
            const { data } = await axios.get(
                `/api/org/${organizationId}/storage/documents/${documentId}/share`
            )
            share.value = data
            return data
        } catch (err) {
            console.error('Failed to load share:', err)
            error.value = err.response?.data?.message || 'Failed to load share settings'
            toast.error(error.value)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Update share configuration
     */
    async function updateShare(documentId, organizationId, settings) {
        saving.value = true
        error.value = ''

        try {
            const { data } = await axios.patch(
                `/api/org/${organizationId}/storage/documents/${documentId}/share`,
                settings
            )

            share.value = { ...share.value, ...data.share }
            toast.success('Share settings updated successfully')
            return data.share
        } catch (err) {
            console.error('Failed to update share:', err)
            error.value = err.response?.data?.message || 'Failed to update share settings'
            toast.error(error.value)
            throw err
        } finally {
            saving.value = false
        }
    }

    /**
     * Revoke share link
     */
    async function revokeShare(documentId, organizationId) {
        saving.value = true
        error.value = ''

        try {
            await axios.post(
                `/api/org/${organizationId}/storage/documents/${documentId}/share/revoke`
            )

            // Reset share to org_only
            if (share.value) {
                share.value.access_level = 'org_only'
                share.value.revoked_at = new Date().toISOString()
            }

            toast.success('Share link revoked successfully')
            return true
        } catch (err) {
            console.error('Failed to revoke share:', err)
            error.value = err.response?.data?.message || 'Failed to revoke share'
            toast.error(error.value)
            throw err
        } finally {
            saving.value = false
        }
    }

    /**
     * Load share statistics
     */
    async function loadStats(documentId, organizationId) {
        loading.value = true
        error.value = ''

        try {
            const { data } = await axios.get(
                `/api/org/${organizationId}/storage/documents/${documentId}/share/stats`
            )
            stats.value = data
            return data
        } catch (err) {
            console.error('Failed to load stats:', err)
            error.value = err.response?.data?.message || 'Failed to load statistics'
            toast.error(error.value)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Load access logs
     */
    async function loadLogs(documentId, organizationId, options = {}) {
        loading.value = true
        error.value = ''

        try {
            const { data } = await axios.get(
                `/api/org/${organizationId}/storage/documents/${documentId}/share/logs`,
                { params: options }
            )
            return data
        } catch (err) {
            console.error('Failed to load logs:', err)
            error.value = err.response?.data?.message || 'Failed to load access logs'
            toast.error(error.value)
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Copy share link to clipboard
     */
    async function copyShareLink() {
        if (!share.value?.share_url) {
            toast.error('No share link available')
            return false
        }

        try {
            await navigator.clipboard.writeText(share.value.share_url)
            toast.success('Link copied to clipboard')
            return true
        } catch (err) {
            console.error('Failed to copy:', err)
            toast.error('Failed to copy link')
            return false
        }
    }

    /**
     * Generate shareable link with password
     */
    function getShareLinkWithPassword(password) {
        if (!share.value?.share_token) return ''

        const baseUrl = share.value.share_url ||
            `${window.location.origin}/share/${share.value.share_token}`

        if (password) {
            return `${baseUrl}?password=${encodeURIComponent(password)}`
        }

        return baseUrl
    }

    /**
     * Check if document is publicly shared
     */
    function isPubliclyShared() {
        return share.value?.access_level === 'link' ||
            share.value?.access_level === 'public'
    }

    /**
     * Check if share is valid
     */
    function isShareValid() {
        if (!share.value) return false
        if (share.value.revoked_at) return false

        if (share.value.expires_at) {
            const expiry = new Date(share.value.expires_at)
            if (expiry <= new Date()) return false
        }

        return true
    }

    /**
     * Get remaining downloads
     */
    function getRemainingDownloads() {
        if (!share.value?.max_downloads) return null
        return Math.max(0, share.value.max_downloads - (share.value.download_count || 0))
    }

    /**
     * Check if download limit reached
     */
    function isDownloadLimitReached() {
        const remaining = getRemainingDownloads()
        return remaining !== null && remaining <= 0
    }

    return {
        // State
        loading,
        saving,
        share,
        stats,
        error,

        // Methods
        loadShare,
        updateShare,
        revokeShare,
        loadStats,
        loadLogs,
        copyShareLink,
        getShareLinkWithPassword,

        // Computed helpers
        isPubliclyShared,
        isShareValid,
        getRemainingDownloads,
        isDownloadLimitReached,
    }
}