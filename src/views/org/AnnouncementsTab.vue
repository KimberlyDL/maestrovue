<template>
    <div class="max-w-5xl mx-auto space-y-6 p-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-bold text-abyss-900 dark:text-platinum-50 flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-lg bg-electric-lime-100 dark:bg-electric-lime-900/30 flex items-center justify-center">
                        <Megaphone class="w-6 h-6 text-electric-lime-600 dark:text-electric-lime-400" />
                    </div>
                    Announcements
                </h1>
                <p class="text-platinum-600 dark:text-platinum-400 mt-1">Stay updated with organization news</p>
            </div>
            <button @click="showCreateModal = true"
                class="px-5 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-medium transition-all flex items-center gap-2">
                <Plus class="w-5 h-5" /> Create Announcement
            </button>
        </div>

        <div class="bg-white dark:bg-abyss-800 border border-sun-200 dark:border-abyss-700 rounded-xl p-5">
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1 relative">
                    <Search class="absolute left-3 top-3 w-5 h-5 text-platinum-400 dark:text-platinum-600" />
                    <input v-model="filters.search" type="text" placeholder="Search announcements..."
                        @input="handleSearchChange"
                        class="w-full pl-10 pr-3 py-2.5 rounded-lg bg-sun-50 dark:bg-abyss-900 border border-sun-200 dark:border-abyss-700 text-abyss-800 dark:text-platinum-50 placeholder-platinum-400 dark:placeholder-platinum-600 focus:outline-none focus:border-kaitoke-green-600 focus:ring-2 focus:ring-kaitoke-green-600/20" />
                </div>
                <select v-model="filters.priority" @change="handleFilterChange"
                    class="md:w-auto w-full px-4 py-2.5 rounded-lg bg-sun-50 dark:bg-abyss-900 border border-sun-200 dark:border-abyss-700 text-abyss-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-2 focus:ring-kaitoke-green-600/20">
                    <option value="">All Announcements</option>
                    <option value="pinned">Pinned Only</option>
                    <option value="regular">Regular Only</option>
                </select>
            </div>
        </div>

        <div v-if="initialLoading" class="space-y-4">
            <div v-for="i in 3" :key="i"
                class="animate-pulse bg-white dark:bg-abyss-800 rounded-xl border border-sun-200 dark:border-abyss-700 p-6">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="h-6 bg-sun-200 dark:bg-abyss-700 rounded w-3/4 mb-2"></div>
                        <div class="h-4 bg-sun-200 dark:bg-abyss-700 rounded w-1/2"></div>
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="h-4 bg-sun-200 dark:bg-abyss-700 rounded"></div>
                    <div class="h-4 bg-sun-200 dark:bg-abyss-700 rounded w-5/6"></div>
                </div>
            </div>
        </div>

        <div v-else-if="!announcements.length && !initialLoading"
            class="text-center py-16 bg-white dark:bg-abyss-800 rounded-xl border border-sun-200 dark:border-abyss-700">
            <MessageSquare class="w-12 h-12 text-platinum-400 dark:text-platinum-600 mx-auto mb-4" />
            <p class="text-platinum-600 dark:text-platinum-400 mb-6 text-lg">
                {{ filters.search ? 'No announcements match your search.' : 'No announcements have been posted yet.' }}
            </p>
            <button v-if="!filters.search" @click="showCreateModal = true"
                class="px-6 py-3 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-semibold transition-all flex items-center gap-2 mx-auto">
                <Plus class="w-5 h-5" /> Create First Announcement
            </button>
        </div>

        <div v-else class="space-y-4" ref="scrollContainer">
            <div v-for="announcement in announcements" :key="announcement.id"
                class="rounded-xl border border-sun-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 overflow-hidden transition-all duration-200">

                <div v-if="announcement.priority" class="bg-gradient-to-r from-sun-500 to-electric-lime-500 px-4 py-2">
                    <div class="flex items-center gap-2 text-abyss-900">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span class="text-sm font-semibold">Priority Announcement</span>
                    </div>
                </div>

                <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <h2
                                class="text-xl font-bold text-abyss-900 dark:text-platinum-50 mb-2 flex items-center gap-2">
                                {{ announcement.title }}
                                <span v-if="announcement.is_public"
                                    class="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700/50 flex items-center gap-1 font-medium">
                                    <Users class="w-3 h-3" /> Public
                                </span>
                                <span v-else
                                    class="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600/50 flex items-center gap-1 font-medium">
                                    <Lock class="w-3 h-3" /> Private
                                </span>
                            </h2>
                            <div class="flex items-center gap-3 text-sm text-platinum-600 dark:text-platinum-400">
                                <span>By {{ announcement.author_name || 'Unknown' }}</span>
                                <span class="text-platinum-400 dark:text-platinum-600">•</span>
                                <span>{{ formatDate(announcement.created_at) }}</span>
                            </div>
                        </div>
                        <div class="flex gap-2 flex-shrink-0">
                            <button @click="editAnnouncement(announcement)"
                                class="px-3 py-1.5 text-sm rounded-lg border border-sun-200 dark:border-abyss-600 text-abyss-700 dark:text-platinum-200 hover:bg-sun-100 dark:hover:bg-abyss-700 transition-colors flex items-center gap-1">
                                <Pencil class="w-4 h-4" /> Edit
                            </button>
                            <button @click="confirmDelete(announcement.id)"
                                class="px-3 py-1.5 text-sm rounded-lg border border-rose-300 dark:border-rose-700/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex items-center gap-1">
                                <Trash2 class="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </div>

                    <div class="prose prose-sm dark:prose-invert max-w-none mb-4">
                        <p class="text-abyss-800 dark:text-platinum-200 whitespace-pre-wrap">{{ announcement.content }}
                        </p>
                    </div>

                    <div v-if="announcement.image_path" class="mb-4 rounded-lg overflow-hidden">
                        <img :src="getImageUrl(announcement.image_path)" :alt="announcement.title"
                            class="w-full h-auto object-cover max-h-96 rounded-lg" />
                    </div>

                    <div v-if="announcement.tags && announcement.tags.length" class="flex flex-wrap gap-2">
                        <span v-for="tag in announcement.tags" :key="tag"
                            class="px-3 py-1 text-xs font-medium rounded-full bg-sun-100 text-abyss-900 dark:bg-abyss-700 dark:text-platinum-300 border border-sun-200 dark:border-abyss-600">
                            <Hash class="w-3 h-3 inline mr-1" /> {{ tag }}
                        </span>
                    </div>
                </div>
            </div>

            <div v-if="loadingMore" class="py-8 flex justify-center">
                <div class="flex items-center gap-3 text-platinum-600 dark:text-platinum-400">
                    <Loader2 class="w-5 h-5 animate-spin" />
                    <span>Loading more...</span>
                </div>
            </div>

            <div v-if="!hasMore && announcements.length > 0"
                class="py-8 text-center text-platinum-500 dark:text-platinum-500 text-sm">
                You've reached the end
            </div>
        </div>

        <AnnouncementModal v-if="showCreateModal" :announcement="editingAnnouncement" :organization-id="organizationId"
            @close="closeModal" @saved="handleSaved" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from '@/utils/api'
import AnnouncementModal from '@/components/org/AnnouncementModal.vue'
import {
    Megaphone, Plus, Loader2, MessageSquare, Users, Lock,
    Pencil, Trash2, Hash, Search
} from 'lucide-vue-next'

const props = defineProps({
    organizationId: { type: [String, Number], required: true }
})

const R2_WORKER_ENDPOINT = import.meta.env.VITE_R2_WORKER_ENDPOINT

const announcements = ref([])
const initialLoading = ref(false)
const loadingMore = ref(false)
const showCreateModal = ref(false)
const editingAnnouncement = ref(null)
const scrollContainer = ref(null)

// Pagination state
const currentPage = ref(1)
const hasMore = ref(true)

// Filters
const filters = ref({
    search: '',
    priority: ''
})
let searchTimeout = null

// Get full image URL for Cloudflare R2
function getImageUrl(path) {
    if (!path) return ''
    if (path.startsWith('http')) return path

    if (R2_WORKER_ENDPOINT) {
        const cleanEndpoint = R2_WORKER_ENDPOINT.replace(/\/$/, '')
        const cleanPath = path.startsWith('/') ? path.substring(1) : path
        return `${cleanEndpoint}/${cleanPath}`
    }

    return path
}

// Load announcements with pagination
async function loadAnnouncements(reset = false) {
    if (reset) {
        initialLoading.value = true
        currentPage.value = 1
        announcements.value = []
        hasMore.value = true
    } else {
        loadingMore.value = true
    }

    try {
        const params = {
            page: currentPage.value,
            per_page: 10
        }

        if (filters.value.search) {
            params.search = filters.value.search
        }
        if (filters.value.priority) {
            params.priority = filters.value.priority === 'pinned'
        }

        const { data } = await axios.get(`/api/org/${props.organizationId}/announcements`, {
            params
        })

        // Process image URLs
        const processedData = data.map(announcement => ({
            ...announcement,
            image_url: announcement.image_path ? getImageUrl(announcement.image_path) : null
        }))

        if (reset) {
            announcements.value = processedData
        } else {
            announcements.value.push(...processedData)
        }

        hasMore.value = processedData.length === params.per_page
        currentPage.value++

    } catch (error) {
        console.error('Failed to load announcements:', error)
    } finally {
        initialLoading.value = false
        loadingMore.value = false
    }
}

// Handle scroll for infinite loading
function handleScroll() {
    if (loadingMore.value || !hasMore.value) return

    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight

    if (scrollTop + clientHeight >= scrollHeight - 300) {
        loadAnnouncements()
    }
}

// Handle search with debounce
function handleSearchChange() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        loadAnnouncements(true)
    }, 500)
}

// Handle filter change
function handleFilterChange() {
    loadAnnouncements(true)
}

// Edit announcement
function editAnnouncement(announcement) {
    editingAnnouncement.value = announcement
    showCreateModal.value = true
}

// Confirm delete
async function confirmDelete(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
        await axios.delete(`/api/org/${props.organizationId}/announcements/${id}`)
        announcements.value = announcements.value.filter(a => a.id !== id)
    } catch (error) {
        alert('Failed to delete announcement')
    }
}

// Close modal
function closeModal() {
    showCreateModal.value = false
    editingAnnouncement.value = null
}

// Handle saved announcement
function handleSaved() {
    closeModal()
    loadAnnouncements(true)
}

// Format date
function formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

onMounted(() => {
    console.log('📢 AnnouncementsTab mounted with orgId:', props.organizationId)
    loadAnnouncements(true)
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (searchTimeout) clearTimeout(searchTimeout)
})
</script>