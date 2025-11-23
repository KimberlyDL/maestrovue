<template>
    <div class="max-w-5xl mx-auto space-y-6 p-6">
        <!-- Organization Header Card -->
        <div
            class="bg-white dark:bg-abyss-800 rounded-xl border border-sun-200 dark:border-abyss-700 overflow-hidden shadow-lg">
            <!-- Header Banner -->
            <div class="h-32 bg-gradient-to-r from-kaitoke-green-500 via-electric-lime-500 to-sun-500"></div>

            <!-- Content -->
            <div class="p-8 -mt-16">
                <div class="flex items-start gap-6">
                    <!-- Logo -->
                    <div class="flex-shrink-0">
                        <div v-if="organization?.logo"
                            class="w-24 h-24 rounded-xl overflow-hidden border-4 border-white dark:border-abyss-800 shadow-lg bg-white">
                            <img :src="getLogoUrl(organization.logo)" :alt="organization.name"
                                class="w-full h-full object-cover" />
                        </div>
                        <div v-else
                            class="w-24 h-24 rounded-xl border-4 border-white dark:border-abyss-800 bg-kaitoke-green-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {{ getInitials(organization?.name) }}
                        </div>
                    </div>

                    <!-- Info -->
                    <div class="flex-1 pt-6">
                        <div class="flex items-start justify-between mb-2">
                            <div>
                                <h1 class="text-3xl font-bold text-abyss-900 dark:text-platinum-50 mb-2">
                                    {{ organization?.name }}
                                </h1>
                                <p class="text-platinum-600 dark:text-platinum-300 text-lg">
                                    {{ organization?.description || 'No description provided' }}
                                </p>
                            </div>
                            <router-link v-if="isAdmin" :to="{ name: 'org.settings', params: { id: organizationId } }"
                                class="px-4 py-2 rounded-lg bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-medium transition-colors shadow-md flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit
                            </router-link>
                        </div>

                        <!-- Quick Links -->
                        <div class="flex flex-wrap gap-4 mt-4">
                            <a v-if="organization?.website" :href="organization.website" target="_blank"
                                class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sun-100 dark:bg-abyss-700 text-abyss-900 dark:text-platinum-200 hover:bg-sun-200 dark:hover:bg-abyss-600 transition-colors text-sm">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                                Website
                            </a>
                            <span v-if="organization?.location?.address"
                                class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sun-100 dark:bg-abyss-700 text-abyss-900 dark:text-platinum-200 text-sm">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {{ organization.location.address }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mission & Vision Cards -->
        <div class="grid md:grid-cols-2 gap-6">
            <div
                class="bg-white dark:bg-abyss-800 rounded-xl border border-sun-200 dark:border-abyss-700 p-6 shadow-md">
                <div class="flex items-center gap-3 mb-4">
                    <div
                        class="w-10 h-10 rounded-lg bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 flex items-center justify-center">
                        <svg class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-abyss-900 dark:text-platinum-50">Mission</h3>
                </div>
                <p class="text-platinum-600 dark:text-platinum-300 leading-relaxed">
                    {{ organization?.mission || 'No mission statement provided' }}
                </p>
            </div>

            <div
                class="bg-white dark:bg-abyss-800 rounded-xl border border-sun-200 dark:border-abyss-700 p-6 shadow-md">
                <div class="flex items-center gap-3 mb-4">
                    <div
                        class="w-10 h-10 rounded-lg bg-electric-lime-100 dark:bg-electric-lime-900/30 flex items-center justify-center">
                        <svg class="w-5 h-5 text-electric-lime-600 dark:text-electric-lime-400" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-abyss-900 dark:text-platinum-50">Vision</h3>
                </div>
                <p class="text-platinum-600 dark:text-platinum-300 leading-relaxed">
                    {{ organization?.vision || 'No vision statement provided' }}
                </p>
            </div>
        </div>

        <!-- Members Section -->
        <div
            class="bg-white dark:bg-abyss-800 rounded-xl border border-sun-200 dark:border-abyss-700 overflow-hidden shadow-md">
            <div class="p-6 border-b border-sun-200 dark:border-abyss-700">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-lg bg-sun-100 dark:bg-sun-900/30 flex items-center justify-center">
                            <svg class="w-5 h-5 text-sun-600 dark:text-sun-400" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-abyss-900 dark:text-platinum-50">Team Members</h3>
                    </div>
                    <router-link v-if="canViewMembers" :to="{ name: 'org.members', params: { id: organizationId } }"
                        class="text-sm font-medium text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:underline">
                        View All →
                    </router-link>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loadingMembers" class="p-8">
                <div class="space-y-3">
                    <div v-for="i in 3" :key="i" class="animate-pulse h-16 bg-sun-100 dark:bg-abyss-900 rounded-lg">
                    </div>
                </div>
            </div>

            <!-- Members List -->
            <div v-else-if="recentMembers.length > 0" class="divide-y divide-sun-200 dark:divide-abyss-700">
                <div v-for="member in recentMembers" :key="member.id" @click="goToMemberProfile(member.id)"
                    class="p-4 hover:bg-sun-50 dark:hover:bg-abyss-900 transition-colors cursor-pointer">
                    <div class="flex items-center gap-4">
                        <div v-if="member.avatar"
                            class="w-12 h-12 rounded-full overflow-hidden border-2 border-sun-200 dark:border-abyss-600">
                            <img :src="member.avatar" :alt="member.name" class="w-full h-full object-cover" />
                        </div>
                        <div v-else
                            class="w-12 h-12 rounded-full bg-kaitoke-green-600 flex items-center justify-center text-white font-bold text-lg border-2 border-sun-200 dark:border-abyss-600">
                            {{ getInitials(member.name) }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="font-semibold text-abyss-900 dark:text-platinum-50 truncate">{{ member.name }}
                            </div>
                            <div class="text-sm text-platinum-600 dark:text-platinum-400 truncate">{{ member.email }}
                            </div>
                        </div>
                        <span :class="[
                            'px-3 py-1 rounded-full text-xs font-bold',
                            member.role === 'admin'
                                ? 'bg-kaitoke-green-100 text-kaitoke-green-800 dark:bg-kaitoke-green-900/30 dark:text-kaitoke-green-300'
                                : 'bg-sun-100 text-sun-800 dark:bg-sun-900/30 dark:text-sun-300'
                        ]">
                            {{ member.role.toUpperCase() }}
                        </span>
                    </div>
                </div>
            </div>

            <div v-else class="p-12 text-center text-platinum-500 dark:text-platinum-500">
                No members to display
            </div>
        </div>

        <!-- Recent Announcements -->
        <div
            class="bg-white dark:bg-abyss-800 rounded-xl border border-sun-200 dark:border-abyss-700 overflow-hidden shadow-md">
            <div class="p-6 border-b border-sun-200 dark:border-abyss-700">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-lg bg-electric-lime-100 dark:bg-electric-lime-900/30 flex items-center justify-center">
                            <svg class="w-5 h-5 text-electric-lime-600 dark:text-electric-lime-400" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-abyss-900 dark:text-platinum-50">Recent Updates</h3>
                    </div>
                    <router-link v-if="canViewAnnouncements"
                        :to="{ name: 'org.announcements', params: { id: organizationId } }"
                        class="text-sm font-medium text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:underline">
                        View All →
                    </router-link>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loadingAnnouncements" class="p-8">
                <div class="space-y-4">
                    <div v-for="i in 3" :key="i" class="animate-pulse h-24 bg-sun-100 dark:bg-abyss-900 rounded-lg">
                    </div>
                </div>
            </div>

            <!-- Announcements List -->
            <div v-else-if="recentAnnouncements.length > 0" class="divide-y divide-sun-200 dark:divide-abyss-700">
                <div v-for="announcement in recentAnnouncements" :key="announcement.id"
                    class="p-6 hover:bg-sun-50 dark:hover:bg-abyss-900 transition-colors">
                    <div v-if="announcement.priority"
                        class="mb-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-sun-500 to-electric-lime-500 text-abyss-900 text-xs font-bold">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        PRIORITY
                    </div>
                    <h4 class="text-lg font-bold text-abyss-900 dark:text-platinum-50 mb-2">{{ announcement.title }}
                    </h4>
                    <!-- Content -->
                    <div class="prose prose-sm dark:prose-invert max-w-none mb-4">
                        <p class="text-abyss-800 dark:text-platinum-200 whitespace-pre-wrap">{{ announcement.content }}
                        </p>
                    </div>

                    <!-- Image -->
                    <div v-if="announcement.image_path" class="mb-4 rounded-lg overflow-hidden">
                        <img :src="getImageUrl(announcement.image_path)" :alt="announcement.title"
                            class="w-full h-auto object-cover max-h-96 rounded-lg shadow-md" />
                    </div>

                    <!-- Tags -->
                    <div v-if="announcement.tags && announcement.tags.length" class="flex flex-wrap gap-2 mb-2">
                        <span v-for="tag in announcement.tags" :key="tag"
                            class="px-3 py-1 text-xs font-medium rounded-full bg-sun-100 text-abyss-900 dark:bg-abyss-700 dark:text-platinum-300 border border-sun-200 dark:border-abyss-600">
                            <Hash class="w-3 h-3 inline mr-1" /> {{ tag }}
                        </span>
                    </div>
                    <div class="flex items-center gap-3 text-xs text-platinum-500 dark:text-platinum-500">
                        <span>{{ announcement.author_name || 'Admin' }}</span>
                        <span>•</span>
                        <span>{{ formatDate(announcement.created_at) }}</span>
                    </div>
                </div>
            </div>

            <div v-else class="p-12 text-center text-platinum-500 dark:text-platinum-500">
                No announcements yet
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { usePermissionStore } from '@/stores/permission'
import { PERMISSIONS } from '@/utils/permissions'
import api from '@/utils/api'

const R2_WORKER_ENDPOINT = import.meta.env.VITE_R2_WORKER_ENDPOINT

// Get route params
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const orgStore = useOrganizationStore()
const permissionStore = usePermissionStore()

// Get organizationId from route
const organizationId = computed(() => route.params.id)

// Get organization from store
const organization = computed(() => orgStore.getOrganization(organizationId.value))

const loadingMembers = ref(false)
const loadingAnnouncements = ref(false)
const recentMembers = ref([])
const recentAnnouncements = ref([])

// Permission checks
const isAdmin = computed(() => permissionStore.isAdmin(organizationId.value))
const isMember = computed(() => permissionStore.isMember(organizationId.value))
const canViewMembers = computed(() => isMember.value || isAdmin.value)
const canViewAnnouncements = computed(() => isMember.value || isAdmin.value)

const getLogoUrl = (logoPath) => {
    if (!logoPath) return ''
    if (logoPath.startsWith('http')) return logoPath

    if (R2_WORKER_ENDPOINT) {
        const cleanEndpoint = R2_WORKER_ENDPOINT.replace(/\/$/, '')
        const cleanPath = logoPath.startsWith('/') ? logoPath.substring(1) : logoPath
        return `${cleanEndpoint}/${cleanPath}`
    }

    return logoPath
}

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

const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase()
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const goToMemberProfile = (memberId) => {
    if (!isMember.value && !isAdmin.value) return
    router.push({
        name: 'member.profile',
        params: {
            id: organizationId.value,
            memberId: memberId
        }
    })
}

const fetchMembers = async () => {
    if (!canViewMembers.value) return

    loadingMembers.value = true
    try {
        const response = await api.get(`/api/org/${organizationId.value}/members?limit=5`)
        recentMembers.value = response.data.slice(0, 5)
    } catch (error) {
        console.error('Failed to fetch members:', error)
    } finally {
        loadingMembers.value = false
    }
}

const fetchAnnouncements = async () => {
    loadingAnnouncements.value = true
    try {
        const response = await api.get(`/api/org/${organizationId.value}/announcements`)
        recentAnnouncements.value = response.data.slice(0, 3)
    } catch (error) {
        console.error('Failed to fetch announcements:', error)
    } finally {
        loadingAnnouncements.value = false
    }
}

onMounted(async () => {
    // Load organization data if not in store
    if (!organization.value && organizationId.value) {
        await orgStore.fetchOrganization(organizationId.value)
    }

    // Load permissions
    await permissionStore.load(organizationId.value)

    // Fetch data
    await Promise.all([
        fetchMembers(),
        fetchAnnouncements()
    ])
})
</script>