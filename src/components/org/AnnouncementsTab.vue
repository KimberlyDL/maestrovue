<template>
    <div class="space-y-8">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                <Megaphone class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Announcements
            </h2>
            <button @click="showCreateModal = true"
                class="px-5 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-medium transition-colors shadow-md hover:shadow-lg flex items-center gap-2">
                <Plus class="w-5 h-5" /> Create Announcement
            </button>
        </div>

        <!-- Filters -->
        <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-5 shadow-lg">
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1 relative">
                    <Search class="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-platinum-600" />
                    <input v-model="filters.search" type="text" placeholder="Search announcements..."
                        @input="handleSearchChange"
                        class="w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 placeholder-gray-400 dark:placeholder-platinum-600 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner" />
                </div>
                <select v-model="filters.priority" @change="handleFilterChange"
                    class="md:w-auto w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner">
                    <option value="">All Announcements</option>
                    <option value="pinned">Pinned Only</option>
                    <option value="regular">Regular Only</option>
                </select>
            </div>
        </div>

        <!-- Skeleton Loading (Initial Load) -->
        <div v-if="initialLoading" class="space-y-4">
            <div v-for="i in 3" :key="i"
                class="animate-pulse bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 p-6">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="h-6 bg-gray-200 dark:bg-abyss-700 rounded w-3/4 mb-2"></div>
                        <div class="h-4 bg-gray-200 dark:bg-abyss-700 rounded w-1/2"></div>
                    </div>
                    <div class="flex gap-2">
                        <div class="h-8 w-16 bg-gray-200 dark:bg-abyss-700 rounded"></div>
                        <div class="h-8 w-16 bg-gray-200 dark:bg-abyss-700 rounded"></div>
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="h-4 bg-gray-200 dark:bg-abyss-700 rounded"></div>
                    <div class="h-4 bg-gray-200 dark:bg-abyss-700 rounded w-5/6"></div>
                    <div class="h-4 bg-gray-200 dark:bg-abyss-700 rounded w-4/6"></div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!announcements.length && !initialLoading"
            class="text-center py-16 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-xl">
            <MessageSquare class="w-12 h-12 text-gray-400 dark:text-platinum-600 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-platinum-400 mb-6 text-lg">
                {{ filters.search ? 'No announcements match your search.' : 'No announcements have been posted yet.' }}
            </p>
            <button v-if="!filters.search" @click="showCreateModal = true"
                class="px-6 py-3 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-semibold transition-colors shadow-lg flex items-center gap-2 mx-auto">
                <Plus class="w-5 h-5" /> Create First Announcement
            </button>
        </div>

        <!-- Announcements List -->
        <div v-else class="space-y-4" ref="scrollContainer">
            <div v-for="announcement in announcements" :key="announcement.id"
                class="rounded-xl border border-gray-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-6 shadow-md hover:shadow-lg transition-all duration-200">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-50">{{ announcement.title
                                }}</h3>
                            <span v-if="announcement.priority"
                                class="px-2 py-0.5 text-xs rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50 flex items-center gap-1 font-medium">
                                <MapPin class="w-3 h-3" /> Pinned
                            </span>
                            <span :class="[
                                'px-2 py-0.5 text-xs rounded-full flex items-center gap-1 font-medium',
                                announcement.is_public
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700/50'
                                    : 'bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600/50'
                            ]">
                                <Users class="w-3 h-3" v-if="announcement.is_public" />
                                <Lock class="w-3 h-3" v-else />
                                {{ announcement.is_public ? 'Public' : 'Private' }}
                            </span>
                        </div>
                        <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-platinum-400">
                            <span>By {{ announcement.author_name || 'Unknown' }}</span>
                            <span class="text-gray-400 dark:text-platinum-600">|</span>
                            <span>{{ formatDate(announcement.created_at) }}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 flex-shrink-0">
                        <button @click="editAnnouncement(announcement)"
                            class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 transition-colors flex items-center gap-1">
                            <Pencil class="w-4 h-4" /> Edit
                        </button>
                        <button @click="confirmDelete(announcement.id)"
                            class="px-3 py-1.5 text-sm rounded-lg border border-rose-300 dark:border-rose-700/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex items-center gap-1">
                            <Trash2 class="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>

                <!-- Image -->
                <div v-if="announcement.image_url" class="mb-4">
                    <img :src="getImageUrl(announcement.image_path)" :alt="announcement.title"
                        class="max-w-full h-auto rounded-lg border border-gray-300 dark:border-abyss-700 max-h-96 object-cover shadow-md" />
                </div>

                <p class="text-gray-700 dark:text-platinum-300 whitespace-pre-wrap mb-4">{{ announcement.content }}</p>

                <div v-if="announcement.tags && announcement.tags.length" class="flex flex-wrap gap-2">
                    <span v-for="tag in announcement.tags" :key="tag"
                        class="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-abyss-700 text-gray-600 dark:text-platinum-400 border border-gray-300 dark:border-abyss-600 font-medium">
                        <Hash class="w-3 h-3 inline mr-1" /> {{ tag }}
                    </span>
                </div>
            </div>

            <!-- Load More Indicator -->
            <div v-if="loadingMore" class="py-8 flex justify-center">
                <div class="flex items-center gap-3 text-gray-600 dark:text-platinum-400">
                    <Loader2 class="w-5 h-5 animate-spin" />
                    <span>Loading more...</span>
                </div>
            </div>

            <!-- End of List -->
            <div v-if="!hasMore && announcements.length > 0"
                class="py-8 text-center text-gray-500 dark:text-platinum-500 text-sm">
                You've reached the end
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <AnnouncementModal v-if="showCreateModal" :announcement="editingAnnouncement" :organization-id="organizationId"
            @close="closeModal" @saved="handleSaved" />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from '@/utils/api'
import AnnouncementModal from '@/components/org/AnnouncementModal.vue'
import {
    Megaphone, Plus, Loader2, MessageSquare, MapPin, Users, Lock,
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

/**
 * Get full image URL for Cloudflare R2
 */
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

/**
 * Load announcements with pagination
 */
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

        // Add filters if set
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

        // Update pagination state
        hasMore.value = processedData.length === params.per_page
        currentPage.value++

    } catch (error) {
        console.error('Failed to load announcements:', error)
    } finally {
        initialLoading.value = false
        loadingMore.value = false
    }
}

/**
 * Load more when scrolling near bottom
 */
function handleScroll() {
    if (loadingMore.value || !hasMore.value) return

    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight

    // Load more when 300px from bottom
    if (scrollTop + clientHeight >= scrollHeight - 300) {
        loadAnnouncements()
    }
}

/**
 * Handle search input with debounce
 */
function handleSearchChange() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        loadAnnouncements(true)
    }, 500)
}

/**
 * Handle filter change
 */
function handleFilterChange() {
    loadAnnouncements(true)
}

/**
 * Edit announcement
 */
function editAnnouncement(announcement) {
    editingAnnouncement.value = announcement
    showCreateModal.value = true
}

/**
 * Confirm delete
 */
async function confirmDelete(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
        await axios.delete(`/api/org/${props.organizationId}/announcements/${id}`)
        // Remove from local array
        announcements.value = announcements.value.filter(a => a.id !== id)
    } catch (error) {
        alert('Failed to delete announcement')
    }
}

/**
 * Close modal
 */
function closeModal() {
    showCreateModal.value = false
    editingAnnouncement.value = null
}

/**
 * Handle saved announcement
 */
function handleSaved() {
    closeModal()
    loadAnnouncements(true)
}

/**
 * Format date
 */
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
    loadAnnouncements(true)
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (searchTimeout) clearTimeout(searchTimeout)
})
</script>