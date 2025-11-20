<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/api'
import { usePermissions, PERMISSIONS } from '@/utils/usePermissions'
import {
    ArrowLeft, LayoutGrid, Megaphone, Users, MailOpen, Cog, Loader2, Image, Home
} from 'lucide-vue-next'

import OverviewTab from '@/components/org/OverviewTab.vue'
import AnnouncementsTab from '@/components/org/AnnouncementsTab.vue'
import MembersTab from '@/components/org/MembersTab.vue'
import RequestsInvitesTab from '@/components/org/RequestsInvitesTab.vue'
import SettingsTab from '@/components/org/SettingsTab.vue'

const route = useRoute()
const router = useRouter()

const organizationId = computed(() => route.params.id)
const organization = ref(null)
const loading = ref(true)
const activeTab = ref('overview')

// Get permissions
const {
    hasPermission,
    hasAnyPermission,
    isAdmin,
    isMember,
    loadPermissions,
    loading: permissionsLoading
} = usePermissions(organizationId.value)

// Load permissions on mount
onMounted(async () => {
    await loadPermissions(organizationId.value)
})

// Define tabs with permission requirements
const tabs = computed(() => {
    const allTabs = [
        {
            key: 'overview',
            label: 'Overview',
            icon: LayoutGrid,
            // Overview is always accessible to all members
            visible: true
        },
        {
            key: 'announcements',
            label: 'Announcements',
            icon: Megaphone,
            visible: hasPermission(PERMISSIONS.VIEW_ANNOUNCEMENTS) ||
                hasPermission(PERMISSIONS.CREATE_ANNOUNCEMENTS) ||
                isAdmin.value
        },
        {
            key: 'members',
            label: 'Members',
            icon: Users,
            visible: hasPermission(PERMISSIONS.VIEW_MEMBERS) || isAdmin.value
        },
        {
            key: 'requests',
            label: 'Requests & Invites',
            icon: MailOpen,
            visible: hasPermission(PERMISSIONS.APPROVE_JOIN_REQUESTS) ||
                hasPermission(PERMISSIONS.MANAGE_INVITE_CODES) ||
                isAdmin.value
        },
        {
            key: 'settings',
            label: 'Settings',
            icon: Cog,
            visible: hasPermission(PERMISSIONS.VIEW_ORG_SETTINGS) ||
                hasPermission(PERMISSIONS.MANAGE_ORG_SETTINGS) ||
                isAdmin.value
        }
    ]

    // Filter to only visible tabs
    return allTabs.filter(tab => tab.visible)
})

onMounted(async () => {
    // Check for a specific tab in the URL query
    const queryTab = route.query.tab
    if (queryTab && tabs.value.some(t => t.key === queryTab)) {
        activeTab.value = queryTab
    } else if (!tabs.value.some(t => t.key === activeTab.value)) {
        // If current tab is not visible, default to overview
        activeTab.value = 'overview'
    }

    await loadOrganization()
})

async function loadOrganization() {
    loading.value = true
    try {
        const { data } = await axios.get(`/api/org/${organizationId.value}/overview`)
        console.log("org data")
        console.log(data)
        organization.value = data
    } catch (error) {
        console.error('Failed to load organization:', error)

        // If user doesn't have permission to view overview, try basic org info
        if (error.response?.status === 403) {
            try {
                const { data } = await axios.get(`/api/organizations/${organizationId.value}`)
                organization.value = {
                    id: data.id,
                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    logo: data.logo
                }
            } catch (err) {
                alert('Failed to load organization details')
            }
        } else {
            alert('Failed to load organization details')
        }
    } finally {
        loading.value = false
    }
}

function getLogoUrl(path) {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return path // S3/R2 URLs are already full URLs from backend
}

function setActiveTab(key) {
    // Check if user has access to this tab
    const tab = tabs.value.find(t => t.key === key)
    if (!tab) {
        console.warn(`Tab ${key} is not accessible`)
        return
    }

    activeTab.value = key
    router.push({ query: { tab: key } })
}

function goBack() {
    router.push({ name: 'user.dashboard' })
}

// Watch for tab changes in URL
watch(() => route.query.tab, (newTab) => {
    if (newTab && tabs.value.some(t => t.key === newTab)) {
        activeTab.value = newTab
    }
})
</script>

<template>
    <div class="min-h-screen bg-gray-100 dark:bg-abyss-900">
        <header
            class="border-b border-gray-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 sticky top-0 z-10 shadow-lg">
            <div class="max-w-7xl mx-auto px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-5">
                        <div
                            class="w-12 h-12 bg-gray-200 dark:bg-abyss-700 rounded-lg flex items-center justify-center p-1 shadow-inner ring-1 ring-gray-300 dark:ring-platinum-700">
                            <img v-if="organization?.logo" :src="getLogoUrl(organization.logo)"
                                :alt="`${organization?.name} logo`" class="w-full h-full rounded-lg object-cover" />
                            <Image v-else class="w-7 h-7 text-gray-500 dark:text-platinum-500" />
                        </div>

                        <div>
                            <h1 class="text-2xl font-bold text-gray-800 dark:text-platinum-50">{{ organization?.name }}
                            </h1>
                            <p class="text-gray-500 dark:text-platinum-500 text-sm">@{{ organization?.slug }}</p>
                        </div>
                    </div>

                    <button @click="goBack"
                        class="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-abyss-700 border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-600 transition-colors shadow-sm flex items-center gap-2">
                        <ArrowLeft class="w-4 h-4" /> Back
                    </button>
                </div>
            </div>
        </header>

        <!-- Loading State for Permissions -->
        <div v-if="permissionsLoading" class="flex justify-center items-center py-8">
            <Loader2 class="animate-spin h-8 w-8 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
        </div>

        <!-- Tabs (only show tabs user has access to) -->
        <div v-else class="border-b border-gray-200 dark:border-abyss-700 bg-gray-50 dark:bg-abyss-800 shadow-inner">
            <div class="max-w-7xl mx-auto px-6">
                <div class="flex gap-2 overflow-x-auto">
                    <button v-for="tab in tabs" :key="tab.key" @click="setActiveTab(tab.key)" :class="[
                        'px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center gap-2',
                        activeTab === tab.key
                            ? 'border-kaitoke-green-600 text-kaitoke-green-700 dark:text-kaitoke-green-300'
                            : 'border-transparent text-gray-500 dark:text-platinum-400 hover:text-gray-800 dark:hover:text-platinum-50 hover:border-gray-400 dark:hover:border-platinum-700'
                    ]">
                        <component :is="tab.icon" class="w-4 h-4" />
                        {{ tab.label }}
                    </button>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-6 py-8">
            <div v-if="loading"
                class="flex flex-col items-center justify-center py-20 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-xl">
                <Loader2 class="animate-spin h-10 w-10 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                <span class="mt-4 text-gray-600 dark:text-platinum-300 text-lg">Loading organization data...</span>
            </div>

            <div v-else>
                <div v-if="activeTab === 'overview'">
                    <OverviewTab :organization="organization" @updated="loadOrganization"
                        @logo-updated="loadOrganization" />
                </div>

                <div v-else-if="activeTab === 'announcements'">
                    <AnnouncementsTab :organization-id="organizationId" />
                </div>

                <div v-else-if="activeTab === 'members'">
                    <MembersTab :organization-id="organizationId" />
                </div>

                <div v-else-if="activeTab === 'requests'">
                    <RequestsInvitesTab :organization-id="organizationId" />
                </div>

                <div v-else-if="activeTab === 'settings'">
                    <SettingsTab :organization="organization" @updated="loadOrganization" />
                </div>
            </div>
        </div>
    </div>
</template>