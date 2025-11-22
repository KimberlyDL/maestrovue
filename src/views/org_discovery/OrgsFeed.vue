<!-- src/views/org_discovery/OrgsFeed.vue -->
<template>
    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Welcome Header -->
        <div class="bg-white dark:bg-abyss-800 rounded-lg p-6 border border-sun-200 dark:border-abyss-700">
            <h1 class="text-2xl font-bold text-abyss-900 dark:text-platinum-50">
                Welcome back, {{ userName }}!
            </h1>
            <p class="text-platinum-600 dark:text-platinum-400 mt-1">
                Stay updated with the latest announcements from your organizations
            </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-kaitoke-green-600"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error"
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p class="text-red-800 dark:text-red-200">{{ error }}</p>
            <button @click="fetchAnnouncements" class="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline">
                Try again
            </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="!announcements.length"
            class="bg-white dark:bg-abyss-800 rounded-lg p-12 border border-sun-200 dark:border-abyss-700 text-center">
            <div class="text-platinum-400 dark:text-platinum-600 mb-4">
                <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50 mb-2">
                No announcements yet
            </h3>
            <p class="text-platinum-600 dark:text-platinum-400">
                Check back later for updates from organizations
            </p>
        </div>

        <!-- Announcements Feed -->
        <div v-else class="space-y-4">
            <div v-for="announcement in announcements" :key="announcement.id"
                class="bg-white dark:bg-abyss-800 rounded-lg border border-sun-200 dark:border-abyss-700 overflow-hidden hover:shadow-lg transition-shadow">

                <!-- Priority Badge -->
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
                    <!-- Header -->
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <h2 class="text-xl font-bold text-abyss-900 dark:text-platinum-50 mb-2">
                                {{ announcement.title }}
                            </h2>
                            <div class="flex items-center gap-4 text-sm text-platinum-600 dark:text-platinum-400">
                                <router-link :to="{ name: 'orgs.org', params: { id: announcement.organization_id } }"
                                    class="flex items-center gap-2 hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    {{ announcement.organization_name }}
                                </router-link>
                                <span class="flex items-center gap-1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {{ formatDate(announcement.created_at) }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="prose prose-sm dark:prose-invert max-w-none mb-4">
                        <p class="text-abyss-800 dark:text-platinum-200 whitespace-pre-wrap">{{
                            announcement.content }}</p>
                    </div>

                    <!-- Image if exists -->
                    <div v-if="announcement.image_path" class="mb-4 rounded-lg overflow-hidden">
                        <img :src="getImagePath(announcement.image_path)" :alt="announcement.title"
                            class="w-full h-auto object-cover" />
                    </div>



                    <!-- Tags -->
                    <div v-if="announcement.tags && announcement.tags.length" class="flex flex-wrap gap-2 mb-4">
                        <span v-for="tag in announcement.tags" :key="tag"
                            class="px-3 py-1 text-xs font-medium rounded-full bg-sun-100 text-abyss-900 dark:bg-abyss-700 dark:text-platinum-300">
                            {{ tag }}
                        </span>
                    </div>

                    <!-- Footer -->
                    <div class="flex items-center justify-between pt-4 border-t border-sun-200 dark:border-abyss-700">
                        <div class="text-sm text-platinum-600 dark:text-platinum-400">
                            Posted by {{ announcement.author_name || 'Organization Admin' }}
                        </div>
                        <router-link :to="{ name: 'orgs.org', params: { id: announcement.organization_id } }"
                            class="text-sm font-medium text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:underline">
                            View Organization →
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <!-- Load More Button -->
        <div v-if="announcements.length > 0 && !loading" class="text-center py-6">
            <button @click="fetchAnnouncements"
                class="px-6 py-2 rounded-full border border-sun-200 dark:border-abyss-700 text-abyss-900 dark:text-platinum-200 hover:bg-sun-100 dark:hover:bg-abyss-700 transition">
                Refresh Feed
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@stores/auth'
import { useAnnouncementStore } from '@stores/announcements'
import { formatDistanceToNow } from '@/utils/dateUtils'

const authStore = useAuthStore()
const announcementStore = useAnnouncementStore()
const R2_WORKER_ENDPOINT = import.meta.env.VITE_R2_WORKER_ENDPOINT

const loading = ref(false)
const error = ref(null)

const userName = computed(() => authStore.user?.name || 'User')
const announcements = computed(() => announcementStore.announcements)

const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
        return formatDistanceToNow(dateString)
    } catch {
        return new Date(dateString).toLocaleDateString()
    }
}

// [ADD THIS FUNCTION] Image URL calculation logic from AnnouncementsTab.vue
const getImagePath = (path) => {
    if (!path) return ''
    if (path.startsWith('http')) return path

    if (R2_WORKER_ENDPOINT) {
        const cleanEndpoint = R2_WORKER_ENDPOINT.replace(/\/$/, '')
        const cleanPath = path.startsWith('/') ? path.substring(1) : path
        return `${cleanEndpoint}/${cleanPath}`
    }

    // Fallback: This might be necessary if some images are in local storage/public
    return path
}

const fetchAnnouncements = async () => {
    loading.value = true
    error.value = null

    try {
        await announcementStore.fetchPublicAnnouncements()
    } catch (err) {
        console.error('Failed to fetch announcements:', err)
        error.value = err.response?.data?.message || 'Failed to load announcements'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchAnnouncements()
})
</script>