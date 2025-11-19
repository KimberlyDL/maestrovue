<!-- src/views/admin/OverviewTab.vue - READ ONLY -->
<template>
    <div class="space-y-8">
        <!-- Organization Details Card -->
        <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-8 shadow-xl">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                    <Info class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Organization Details
                </h2>
                <router-link v-if="isAdmin" :to="{ name: 'org.admin.settings', params: { id: organizationId } }"
                    class="px-4 py-2 rounded-lg bg-kaitoke-green-600 text-white hover:bg-kaitoke-green-500 transition-colors flex items-center gap-2">
                    <Pencil class="w-4 h-4" /> Edit Settings
                </router-link>
            </div>

            <!-- Logo & Basic Info -->
            <div class="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-abyss-700">
                <div class="flex-shrink-0">
                    <div v-if="organization?.logo"
                        class="h-24 w-24 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-abyss-600">
                        <img :src="getLogoUrl(organization.logo)" :alt="organization.name"
                            class="h-full w-full object-cover" />
                    </div>
                    <div v-else
                        class="h-24 w-24 rounded-lg bg-kaitoke-green-600 flex items-center justify-center text-white text-3xl font-bold">
                        {{ getInitials(organization?.name) }}
                    </div>
                </div>

                <div class="flex-1">
                    <h3 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 mb-2">{{ organization?.name }}
                    </h3>
                    <p class="text-gray-600 dark:text-platinum-300 mb-3">
                        {{ organization?.description || 'No description provided' }}</p>
                    <div class="flex flex-wrap gap-3 text-sm">
                        <a v-if="organization?.website" :href="organization.website" target="_blank"
                            class="flex items-center gap-1 text-kaitoke-green-600 hover:underline">
                            <ExternalLink class="w-4 h-4" /> {{ organization.website }}
                        </a>
                        <span v-if="organization?.location?.address"
                            class="flex items-center gap-1 text-gray-600 dark:text-platinum-400">
                            <MapPin class="w-4 h-4" /> {{ organization.location.address }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Mission & Vision -->
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 class="text-sm font-semibold text-gray-700 dark:text-platinum-400 mb-2 flex items-center gap-2">
                        <Target class="w-4 h-4" /> Mission
                    </h4>
                    <p
                        class="text-gray-800 dark:text-platinum-200 text-sm bg-gray-50 dark:bg-abyss-900 p-4 rounded-lg border border-gray-200 dark:border-abyss-700">
                        {{ organization?.mission || 'No mission statement' }}
                    </p>
                </div>
                <div>
                    <h4 class="text-sm font-semibold text-gray-700 dark:text-platinum-400 mb-2 flex items-center gap-2">
                        <Eye class="w-4 h-4" /> Vision
                    </h4>
                    <p
                        class="text-gray-800 dark:text-platinum-200 text-sm bg-gray-50 dark:bg-abyss-900 p-4 rounded-lg border border-gray-200 dark:border-abyss-700">
                        {{ organization?.vision || 'No vision statement' }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Members Summary -->
        <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-8 shadow-xl">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                    <Users class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Members
                </h3>
                <router-link v-if="canViewMembers" :to="{ name: 'org.admin.members', params: { id: organizationId } }"
                    class="text-sm text-kaitoke-green-600 hover:underline">
                    View All
                </router-link>
            </div>

            <!-- Loading -->
            <div v-if="loadingMembers" class="space-y-3">
                <div v-for="i in 3" :key="i" class="animate-pulse h-16 bg-gray-100 dark:bg-abyss-900 rounded-lg"></div>
            </div>

            <!-- Members List -->
            <div v-else-if="recentMembers.length > 0" class="space-y-2">
                <div v-for="member in recentMembers" :key="member.id" @click="goToMemberProfile(member.id)"
                    class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-abyss-700 hover:bg-gray-50 dark:hover:bg-abyss-900 transition-colors cursor-pointer">
                    <div v-if="member.avatar" class="h-10 w-10 rounded-full overflow-hidden">
                        <img :src="member.avatar" :alt="member.name" class="h-full w-full object-cover" />
                    </div>
                    <div v-else
                        class="h-10 w-10 rounded-full bg-kaitoke-green-600 flex items-center justify-center text-white font-medium">
                        {{ getInitials(member.name) }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-medium text-gray-800 dark:text-platinum-50 truncate">{{ member.name }}</div>
                        <div class="text-sm text-gray-600 dark:text-platinum-400 truncate">{{ member.email }}</div>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full" :class="member.role === 'admin'
                        ? 'bg-kaitoke-green-100 text-kaitoke-green-800 dark:bg-kaitoke-green-900/30 dark:text-kaitoke-green-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        ">
                        {{ member.role }}
                    </span>
                </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500 dark:text-platinum-500">
                No members yet
            </div>
        </div>

        <!-- Recent Announcements -->
        <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-8 shadow-xl">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                    <Megaphone class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Recent
                    Announcements
                </h3>
                <router-link v-if="canViewAnnouncements"
                    :to="{ name: 'org.admin.announcements', params: { id: organizationId } }"
                    class="text-sm text-kaitoke-green-600 hover:underline">
                    View All
                </router-link>
            </div>

            <!-- Loading -->
            <div v-if="loadingAnnouncements" class="space-y-3">
                <div v-for="i in 3" :key="i" class="animate-pulse h-20 bg-gray-100 dark:bg-abyss-900 rounded-lg"></div>
            </div>

            <!-- Announcements List -->
            <div v-else-if="recentAnnouncements.length > 0" class="space-y-3">
                <div v-for="announcement in recentAnnouncements" :key="announcement.id"
                    class="p-4 rounded-lg border border-gray-200 dark:border-abyss-700 hover:bg-gray-50 dark:hover:bg-abyss-900 transition-colors">
                    <div v-if="announcement.priority"
                        class="h-1 bg-gradient-to-r from-sun-500 via-electric-lime-500 to-kaitoke-green-500 rounded-full mb-2 -mt-2 -mx-2">
                    </div>
                    <h4 class="font-semibold text-gray-800 dark:text-platinum-50 mb-1">{{ announcement.title }}</h4>
                    <p class="text-sm text-gray-600 dark:text-platinum-400 line-clamp-2">{{ announcement.content }}</p>
                    <div class="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-platinum-500">
                        <span>{{ announcement.author_name || 'Admin' }}</span>
                        <span>•</span>
                        <span>{{ formatDate(announcement.created_at) }}</span>
                    </div>
                </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500 dark:text-platinum-500">
                No announcements yet
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Info, Pencil, ExternalLink, MapPin, Target, Eye, Users, Megaphone } from 'lucide-vue-next'
import api from '@/utils/api'

const props = defineProps({
    organization: { type: Object, required: true },
    organizationId: { type: [String, Number], required: true }
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loadingMembers = ref(false)
const loadingAnnouncements = ref(false)
const recentMembers = ref([])
const recentAnnouncements = ref([])

const R2_WORKER_ENDPOINT = import.meta.env.VITE_R2_WORKER_ENDPOINT

// Check if current user is admin
const isAdmin = computed(() => {
    // You should check this from your organization data or auth store
    return authStore.user?.role === 'admin' || props.organization?.user_role === 'admin'
})

const canViewMembers = computed(() => {
    return isAdmin.value // Only admins can view members tab by default
})

const canViewAnnouncements = computed(() => {
    return isAdmin.value // Only admins can view announcements tab by default
})

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
    if (!canViewMembers.value) return
    router.push({
        name: 'member.profile',
        params: {
            id: props.organizationId,
            memberId: memberId
        }
    })
}

const fetchMembers = async () => {
    if (!canViewMembers.value) return

    loadingMembers.value = true
    try {
        const response = await api.get(`/api/org/${props.organizationId}/members?limit=5`)
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
        const response = await api.get(`/api/org/${props.organizationId}/announcements`)
        recentAnnouncements.value = response.data.slice(0, 3)
    } catch (error) {
        console.error('Failed to fetch announcements:', error)
    } finally {
        loadingAnnouncements.value = false
    }
}

onMounted(() => {
    fetchMembers()
    fetchAnnouncements()
})
</script>