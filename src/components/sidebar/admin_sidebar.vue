<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useOrganizationStore } from '@/stores/organization'
// REMOVED: import { usePermissions } from '@/utils/usePermissions'
import { usePermissionStore } from '@/stores/permission' // NEW: Import Pinia store
import { PERMISSIONS } from '@/utils/permissions' // NEW: Import constants from the new location
import axios from '@/utils/api'
import SidebarNavItem from './sidebar_nav_item.vue'
import SidebarNavDropdown from './sidebar_nav_dropdown.vue'
import SidebarGroupLabel from './sidebar_group_label.vue'

import {
    House, Megaphone, Calendar, CalendarClock, ClipboardCheck,
    FileStack, FileCheck, FolderKanban, ShieldCheck, BarChart3,
    Building2, Users, MailPlus, Settings, ArrowRightLeft,
    User, CheckCircle, Upload, Inbox, Cog, Eye, Info
} from 'lucide-vue-next'

const route = useRoute()
const orgStore = useOrganizationStore()
const permissionStore = usePermissionStore() // NEW: Initialize permission store

// State
const organization = ref(null)
const loading = ref(true)
const pendingRequests = ref(0)
const pendingReviews = ref(4)

// Get current org ID from store and route
const currentOrgId = computed(() => {
    return orgStore.currentOrgId || route.params.id
})
const hasCurrentOrg = computed(() => !!currentOrgId.value)

// Permissions - NEW implementation using the store

// Use store getters to create reactive references
const userRole = computed(() => {
    const org = permissionStore.getOrg(currentOrgId.value)
    // The store's cache holds the userRole
    return org ? org.userRole : null
})

const isAdmin = computed(() => {
    return permissionStore.isAdmin(currentOrgId.value)
})

const isMember = computed(() => {
    return permissionStore.isMember(currentOrgId.value)
})

function hasPermission(permissionKey) {
    return permissionStore.hasPermission(currentOrgId.value, permissionKey)
}

// REMOVED: Incomplete local PERMISSIONS definition
/*
const PERMISSIONS = {
    ...
}
*/

// Role badge display (Uses the new userRole computed property)
const userRoleBadge = computed(() => {
    const roleMap = {
        admin: '🛡️ Admin',
        owner: '👑 Owner',
        member: '👤 Member',
        viewer: '👁️ Viewer'
    }
    return roleMap[userRole.value] || '👤 Member'
})

// Computed permissions (Uses the new hasPermission function and isAdmin computed)
const canManageRequests = computed(() =>
    hasPermission(PERMISSIONS.APPROVE_JOIN_REQUESTS) ||
    hasPermission(PERMISSIONS.MANAGE_INVITE_CODES) ||
    isAdmin.value
)

const canManageSettings = computed(() =>
    hasPermission(PERMISSIONS.MANAGE_ORG_SETTINGS) || isAdmin.value
)

const canManagePermissions = computed(() =>
    // NOTE: MANAGE_PERMISSIONS is now correctly imported from the centralized PERMISSIONS object
    hasPermission(PERMISSIONS.MANAGE_PERMISSIONS) || isAdmin.value
)

// Load organization data (Updated to use store.load)
async function loadOrganizationData() {
    if (!currentOrgId.value) {
        loading.value = false
        return
    }

    loading.value = true
    try {
        // Run both API calls in parallel:
        // 1. Get organization overview (for name/info display)
        const orgResponsePromise = axios.get(`/api/organizations/${currentOrgId.value}`)

        // 2. Load/Refresh permissions via the store (this handles authentication checks and caching)
        const permissionsLoadedPromise = permissionStore.load(currentOrgId.value)

        const [orgResponse] = await Promise.all([
            orgResponsePromise,
            permissionsLoadedPromise
        ])

        organization.value = orgResponse.data

        // Load pending requests count for those with permission
        if (canManageRequests.value) {
            try {
                const { data } = await axios.get(`/api/org/${currentOrgId.value}/join-requests`, {
                    params: { status: 'pending' }
                })
                pendingRequests.value = data.length
            } catch (error) {
                console.error('Failed to load pending requests:', error)
            }
        }
    } catch (error) {
        console.error('Failed to load organization:', error)
    } finally {
        loading.value = false
    }
}

// Watch for org ID changes
watch(() => currentOrgId.value, (newId) => {
    if (newId) {
        loadOrganizationData()
    }
})

onMounted(() => {
    if (currentOrgId.value) {
        loadOrganizationData()
    } else {
        loading.value = false
    }
})
</script>

<template>
    <aside class="w-64 shrink-0 bg-platinum-50 dark:bg-abyss-900 h-screen sticky top-0 overflow-y-auto">
        <div class="p-3">
            <div class="mb-4 px-3 pt-6">
                <div v-if="loading && hasCurrentOrg" class="animate-pulse">
                    <div class="h-5 bg-gray-200 dark:bg-abyss-700 rounded w-3/4 mb-2"></div>
                    <div class="h-3 bg-gray-200 dark:bg-abyss-700 rounded w-1/2"></div>
                </div>
                <div v-else-if="organization" class="space-y-1">
                    <div class="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {{ organization.name }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                        {{ userRoleBadge }}
                    </div>
                </div>
                <div v-else class="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Admin
                </div>
            </div>

            <template v-if="loading && hasCurrentOrg">
                <div v-for="i in 8" :key="i" class="animate-pulse mb-2">
                    <div class="h-9 bg-gray-200 dark:bg-abyss-700 rounded-lg"></div>
                </div>
            </template>

            <template v-else>
                <SidebarGroupLabel text="Home" />

                <SidebarNavItem :to="{ name: 'home' }" title="Feed">
                    <template #icon>
                        <House :size="16" :stroke-width="1.25" />
                    </template>
                </SidebarNavItem>

                <template v-if="hasCurrentOrg && isMember">
                    <SidebarGroupLabel text="Organization" />

                    <SidebarNavItem :to="{ name: 'org.overview', params: { id: currentOrgId } }" title="Overview">
                        <template #icon>
                            <Info :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>

                    <SidebarNavItem :to="{ name: 'org.announcements', params: { id: currentOrgId } }"
                        title="Announcements">
                        <template #icon>
                            <Megaphone :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>

                    <SidebarNavItem :to="{ name: 'org.members', params: { id: currentOrgId } }" title="Members">
                        <template #icon>
                            <Users :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>
                </template>

                <template v-if="hasCurrentOrg && hasPermission(PERMISSIONS.VIEW_STORAGE)">
                    <SidebarGroupLabel text="Document Storage" />

                    <SidebarNavItem :to="{ name: 'org.doc-storage', params: { id: currentOrgId } }"
                        title="Document Vault">
                        <template #icon>
                            <FileStack :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>
                </template>

                <template v-if="hasCurrentOrg && hasPermission(PERMISSIONS.CREATE_REVIEWS)">
                    <SidebarGroupLabel text="Repository" />

                    <SidebarNavItem :to="{ name: 'org.doc-review', params: { id: currentOrgId } }"
                        title="Document Review" :badge="pendingReviews || undefined">
                        <template #icon>
                            <FileCheck :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>

                    <SidebarNavDropdown label="My Submissions" :matchPaths="[
                        `/org/${currentOrgId}/documents/submit`,
                        `/org/${currentOrgId}/documents/reviews`
                    ]">
                        <template #icon>
                            <FolderKanban :size="16" :stroke-width="1.25" />
                        </template>

                        <SidebarNavItem :to="{ name: 'org.doc-submit', params: { id: currentOrgId } }"
                            title="Submit Document">
                            <template #icon>
                                <Upload :size="16" :stroke-width="1.25" />
                            </template>
                        </SidebarNavItem>

                        <SidebarNavItem :to="{ name: 'reviewer.mailbox', params: { id: currentOrgId } }"
                            title="My Reviews" :badge="pendingReviews || undefined">
                            <template #icon>
                                <Inbox :size="16" :stroke-width="1.25" />
                            </template>
                        </SidebarNavItem>
                    </SidebarNavDropdown>

                    <SidebarNavItem v-if="hasPermission(PERMISSIONS.MANAGE_REVIEWS)"
                        :to="{ name: 'org.doc-submission', params: { id: currentOrgId } }" title="All Submissions">
                        <template #icon>
                            <FileStack :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>
                </template>

                <template v-if="hasCurrentOrg && hasPermission(PERMISSIONS.VIEW_DUTY_SCHEDULES)">
                    <SidebarGroupLabel text="Duty Schedule" />

                    <SidebarNavItem :to="{ name: 'duty.calendar', params: { id: currentOrgId } }" title="Calendar">
                        <template #icon>
                            <Calendar :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>

                    <SidebarNavDropdown label="My Duties" :matchPaths="[
                        `/org/${currentOrgId}/duty/my/assignments`,
                        `/org/${currentOrgId}/duty/my/availability`,
                        `/org/${currentOrgId}/duty/my/my-requests`,
                        `/org/${currentOrgId}/duty/swaps/available`,
                        `/org/${currentOrgId}/duty/my/performance`
                    ]">
                        <template #icon>
                            <User :size="16" :stroke-width="1.25" />
                        </template>

                        <SidebarNavItem :to="{ name: 'duty.assignments', params: { id: currentOrgId } }"
                            title="My Assignments">
                            <template #icon>
                                <ClipboardCheck :size="16" :stroke-width="1.25" />
                            </template>
                        </SidebarNavItem>

                        <SidebarNavItem :to="{ name: 'duty.availability', params: { id: currentOrgId } }"
                            title="My Availability">
                            <template #icon>
                                <CalendarClock :size="16" :stroke-width="1.25" />
                            </template>
                        </SidebarNavItem>

                        <SidebarNavItem :to="{ name: 'duty.my_swap', params: { id: currentOrgId } }"
                            title="My Swap Requests">
                            <template #icon>
                                <ArrowRightLeft :size="16" :stroke-width="1.25" />
                            </template>
                        </SidebarNavItem>

                        <SidebarNavItem :to="{ name: 'duty.available-swaps', params: { id: currentOrgId } }"
                            title="Available Swaps">
                            <template #icon>
                                <ArrowRightLeft :size="16" :stroke-width="1.25" />
                            </template>
                        </SidebarNavItem>

                        <SidebarNavItem :to="{ name: 'duty.my_performance', params: { id: currentOrgId } }"
                            title="My Performance">
                            <template #icon>
                                <BarChart3 :size="16" :stroke-width="1.25" />
                            </template>
                        </SidebarNavItem>
                    </SidebarNavDropdown>
                </template>

                <template v-if="isAdmin || canManageRequests || canManageSettings || canManagePermissions">
                    <div class="px-3 pt-5 pb-2">
                        <div class="flex items-center gap-2">
                            <div class="flex-1 h-px bg-gray-300 dark:bg-abyss-700"></div>
                            <span
                                class="text-[11px] uppercase tracking-wider text-kaitoke-green-500 dark:text-kaitoke-green-800">
                                Admin
                            </span>
                            <div class="flex-1 h-px bg-gray-300 dark:bg-abyss-700"></div>
                        </div>
                    </div>

                    <template v-if="hasPermission(PERMISSIONS.CREATE_DUTY_SCHEDULES)">
                        <SidebarNavDropdown label="Duty Admin" :matchPaths="[
                            `/org/${currentOrgId}/duty/schedules`,
                            `/org/${currentOrgId}/duty/swaps`,
                            `/org/${currentOrgId}/duty/reports`
                        ]">
                            <template #icon>
                                <CheckCircle :size="16" :stroke-width="1.25" />
                            </template>

                            <SidebarNavItem :to="{ name: 'duty.schedules', params: { id: currentOrgId } }"
                                title="Manage Schedules">
                                <template #icon>
                                    <CalendarClock :size="16" :stroke-width="1.25" />
                                </template>
                            </SidebarNavItem>

                            <SidebarNavItem v-if="hasPermission(PERMISSIONS.APPROVE_DUTY_SWAPS)"
                                :to="{ name: 'duty.swaps', params: { id: currentOrgId } }" title="Approve Swaps">
                                <template #icon>
                                    <ArrowRightLeft :size="16" :stroke-width="1.25" />
                                </template>
                            </SidebarNavItem>

                            <SidebarNavItem v-if="hasPermission(PERMISSIONS.VIEW_STATISTICS)"
                                :to="{ name: 'duty.reports', params: { id: currentOrgId } }" title="Org Reports">
                                <template #icon>
                                    <BarChart3 :size="16" :stroke-width="1.25" />
                                </template>
                            </SidebarNavItem>
                        </SidebarNavDropdown>
                    </template>

                    <SidebarNavItem v-if="canManageRequests"
                        :to="{ name: 'org.requests', params: { id: currentOrgId } }" title="Requests & Invites"
                        :badge="pendingRequests || undefined">
                        <template #icon>
                            <MailPlus :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>

                    <SidebarNavItem v-if="canManagePermissions"
                        :to="{ name: 'org.permissions', params: { id: currentOrgId } }" title="Permissions">
                        <template #icon>
                            <ShieldCheck :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>

                    <SidebarNavItem v-if="canManageSettings"
                        :to="{ name: 'org.settings', params: { id: currentOrgId } }" title="Settings">
                        <template #icon>
                            <Cog :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>
                </template>
            </template>
        </div>
    </aside>
</template>