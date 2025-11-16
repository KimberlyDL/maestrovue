<template>
    <div class="space-y-4">
        <!-- Loading Skeleton -->
        <div v-if="loading" class="space-y-4">
            <div v-for="i in 3" :key="`skeleton-${i}`"
                class="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 animate-pulse">
                <div class="flex items-start gap-4 mb-4">
                    <div class="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <div class="flex-1">
                        <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                </div>
                <div class="h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
        </div>

        <!-- Announcements -->
        <div v-else-if="announcements && announcements.length > 0" class="space-y-4">
            <div v-for="announcement in announcements" :key="announcement.id" :class="[
                'rounded-lg overflow-hidden transition-all duration-300 border',
                announcement.priority
                    ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-600 hover:border-yellow-500'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-lg'
            ]">

                <!-- Header -->
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
                    <div class="flex items-center gap-3 flex-1">
                        <div class="flex-shrink-0">
                            <div
                                class="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-lime-400 flex items-center justify-center">
                                <span class="text-gray-900 dark:text-gray-100 font-bold text-lg">
                                    {{ getInitials(announcement.author_name) }}
                                </span>
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-gray-900 dark:text-gray-100 font-semibold truncate">{{
                                announcement.author_name }}</h3>
                            <p class="text-gray-500 dark:text-gray-400 text-xs">{{ formatDate(announcement.created_at)
                                }}</p>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div class="px-6 py-4">
                    <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{{ announcement.title }}</h2>
                    <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">{{
                        announcement.content }}</p>
                </div>

                <!-- Image -->
                <div v-if="announcement.image_url || announcement.image_path" class="px-6 py-3">
                    <img @click="$emit('view-image', getImageUrl(announcement))" :src="getImageUrl(announcement)"
                        :alt="announcement.title"
                        class="w-full h-40 object-cover rounded-lg border border-gray-300 dark:border-gray-700 hover:border-green-400 cursor-pointer transition-colors" />
                </div>

                <!-- Tags -->
                <div v-if="announcement.tags && announcement.tags.length > 0"
                    class="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex flex-wrap gap-2">
                        <span v-for="tag in announcement.tags" :key="tag"
                            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-800 text-green-600 dark:text-green-400 border border-gray-300 dark:border-gray-700 hover:border-green-400 transition-colors cursor-pointer">
                            #{{ tag }}
                        </span>
                    </div>
                </div>

                <!-- Footer -->
                <div
                    class="px-6 py-3 bg-gray-100 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                    <span>{{ formatTime(announcement.created_at) }}</span>
                    <span v-if="announcement.updated_at !== announcement.created_at">
                        Edited {{ formatTime(announcement.updated_at) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- No Announcements -->
        <div v-else
            class="p-12 bg-gray-100 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
            <svg class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4 opacity-40" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p class="text-gray-600 dark:text-gray-400 text-lg font-medium mb-1">No announcements yet</p>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Check back soon for organization updates and
                announcements</p>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const R2_WORKER_ENDPOINT = import.meta.env.VITE_R2_WORKER_ENDPOINT

const props = defineProps({
    announcements: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false }
})

// Get author initials for avatar
function getInitials(name) {
    return name
        .split(' ')
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toUpperCase()
}

function getImageUrl(announcement) {
    if (!announcement.image_url && !announcement.image_path) return ''

    // If it's already a full URL, return it
    if (announcement.image_url && announcement.image_url.startsWith('http')) {
        return announcement.image_url
    }

    const path = announcement.image_path || announcement.image_url
    if (!path) return ''
    if (path.startsWith('http')) return path

    if (R2_WORKER_ENDPOINT) {
        const cleanEndpoint = R2_WORKER_ENDPOINT.replace(/\/$/, '')
        const cleanPath = path.startsWith('/') ? path.substring(1) : path
        return `${cleanEndpoint}/${cleanPath}`
    }

    return ''
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m ago`
    return `${Math.floor(diffDays / 365)}y ago`
}

// Format time for footer
function formatTime(dateString) {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>