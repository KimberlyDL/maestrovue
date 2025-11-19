<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useOrganizationStore } from '@/stores/organization'
import { usePermissions } from '@/utils/usePermissions'
import axios from '@/utils/api'
import SidebarNavItem from './sidebar_nav_item.vue'
import SidebarNavDropdown from './sidebar_nav_dropdown.vue'
import SidebarGroupLabel from './sidebar_group_label.vue'

import {
    House,
    Megaphone,
    Calendar,
    CalendarClock,
    ClipboardCheck,
    TicketCheck,
    MessageSquare,
    FileStack,
    FileCheck,
    FolderKanban,
    QrCode,
    ShieldCheck,
    BarChart3,
    Building2,
    PlusCircle,
    Users,
    MailPlus,
    UserCheck,
    Layers,
    History,
    Compass,
    ClipboardList,
    Settings,
    ArrowRightLeft,
    User,
    CheckCircle,
    Upload,
    Inbox,
    Eye,
    Cog
} from 'lucide-vue-next'

const route = useRoute()
const orgStore = useOrganizationStore()

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

// Permissions
const { userRole, isAdmin, loadPermissions } = usePermissions(currentOrgId.value)

// Role badge display
const userRoleBadge = computed(() => {
    const roleMap = {
        admin: '🛡️ Admin',
        owner: '👑 Owner',
        member: '👤 Member',
        viewer: '👁️ Viewer'
    }
    return roleMap[userRole.value] || '👤 Member'
})

// Load organization data
async function loadOrganizationData() {
    if (!currentOrgId.value) {
        loading.value = false
        return
    }

    loading.value = true
    try {
        const [orgResponse, permissionsLoaded] = await Promise.all([
            axios.get(`/api/organizations/${currentOrgId.value}`),
            loadPermissions(currentOrgId.value)
        ])

        organization.value = orgResponse.data

        // Load pending requests count for admins
        if (isAdmin.value) {
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
            <!-- Organization Header -->
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

            <!-- Skeleton Loading -->
            <template v-if="loading && hasCurrentOrg">
                <div v-for="i in 8" :key="i" class="animate-pulse mb-2">
                    <div class="h-9 bg-gray-200 dark:bg-abyss-700 rounded-lg"></div>
                </div>
            </template>

            <!-- Actual Navigation -->
            <template v-else>
                <!-- ===== HOME ===== -->
                <SidebarGroupLabel text="Home" />

                <SidebarNavItem :to="{ name: 'home' }" title="Feed">
                    <template #icon>
                        <House :size="16" :stroke-width="1.25" />
                    </template>
                </SidebarNavItem>

                <!-- Overview (All members can view - read-only for non-admins) -->
                <SidebarNavItem v-if="hasCurrentOrg"
                    :to="{ name: 'org.manage', params: { id: currentOrgId }, query: { tab: 'overview' } }"
                    title="Overview">
                    <template #icon>
                        <Building2 :size="16" :stroke-width="1.25" />
                    </template>
                    <template v-if="!isAdmin" #badge>
                        <span class="text-[10px] opacity-70">View</span>
                    </template>
                </SidebarNavItem>

                <!-- Announcements (All members - full CRUD) -->
                <SidebarNavItem v-if="hasCurrentOrg"
                    :to="{ name: 'org.manage', params: { id: currentOrgId }, query: { tab: 'announcements' } }"
                    title="Announcements">
                    <template #icon>
                        <Megaphone :size="16" :stroke-width="1.25" />
                    </template>
                </SidebarNavItem>

                <!-- Members (All members can view) -->
                <SidebarNavItem v-if="hasCurrentOrg"
                    :to="{ name: 'org.manage', params: { id: currentOrgId }, query: { tab: 'members' } }"
                    title="Members">
                    <template #icon>
                        <Users :size="16" :stroke-width="1.25" />
                    </template>
                    <template v-if="!isAdmin" #badge>
                        <span class="text-[10px] opacity-70">View</span>
                    </template>
                </SidebarNavItem>

                <!-- ===== DOCUMENT STORAGE ===== -->
                <SidebarGroupLabel text="Document Storage" />

                <!-- Storage (All members - full access) -->
                <SidebarNavItem v-if="hasCurrentOrg" :to="{ name: 'org.doc-storage', params: { id: currentOrgId } }"
                    title="Document Vault">
                    <template #icon>
                        <FileStack :size="16" :stroke-width="1.25" />
                    </template>
                </SidebarNavItem>

                <!-- ===== REPOSITORY ===== -->
                <SidebarGroupLabel text="Repository" />

                <!-- Document Review Overview -->
                <SidebarNavItem v-if="hasCurrentOrg" :to="{ name: 'org.doc-review', params: { id: currentOrgId } }"
                    title="Document Review" :badge="pendingReviews || undefined">
                    <template #icon>
                        <FileCheck :size="16" :stroke-width="1.25" />
                    </template>
                </SidebarNavItem>

                <!-- Repository Dropdown -->
                <SidebarNavDropdown v-if="hasCurrentOrg" label="My Submissions" :matchPaths="[
                    `/org/${currentOrgId}/documents/submit`,
                    `/org/${currentOrgId}/documents/reviews`
                ]">
                    <template #icon>
                        <FolderKanban :size="16" :stroke-width="1.25" />
                    </template>

                    <!-- Submit Document (All members) -->
                    <SidebarNavItem :to="{ name: 'org.doc-submit', params: { id: currentOrgId } }"
                        title="Submit Document">
                        <template #icon>
                            <Upload :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>

                    <!-- My Reviews (All members) -->
                    <SidebarNavItem :to="{ name: 'reviewer.mailbox', params: { id: currentOrgId } }" title="My Reviews"
                        :badge="pendingReviews || undefined">
                        <template #icon>
                            <Inbox :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>
                </SidebarNavDropdown>

                <!-- All Submissions (Admin only) -->
                <SidebarNavItem v-if="hasCurrentOrg && isAdmin"
                    :to="{ name: 'org.doc-submission', params: { id: currentOrgId } }" title="All Submissions">
                    <template #icon>
                        <FileStack :size="16" :stroke-width="1.25" />
                    </template>
                </SidebarNavItem>

                <!-- ===== DUTY CALENDAR ===== -->
                <SidebarGroupLabel text="Duty Schedule" />

                <!-- Calendar (All members can view) -->
                <SidebarNavItem v-if="hasCurrentOrg" :to="{ name: 'duty.calendar', params: { id: currentOrgId } }"
                    title="Calendar">
                    <template #icon>
                        <Calendar :size="16" :stroke-width="1.25" />
                    </template>
                    <template v-if="!isAdmin" #badge>
                        <span class="text-[10px] opacity-70">View</span>
                    </template>
                </SidebarNavItem>

                <!-- My Duty Items (All members) -->
                <SidebarNavDropdown v-if="hasCurrentOrg" label="My Duties" :matchPaths="[
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

                <!-- ===== ADMIN SECTION ===== -->
                <template v-if="isAdmin">
                    <!-- Admin Divider -->
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

                    <!-- Duty Admin -->
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

                        <SidebarNavItem :to="{ name: 'duty.swaps', params: { id: currentOrgId } }"
                            title="Approve Swaps">
                            <template #icon>
                                <ArrowRightLeft :size="16" :stroke-width="1.25" />
                            </template>
                        </SidebarNavItem>

                        <SidebarNavItem :to="{ name: 'duty.reports', params: { id: currentOrgId } }"
                            title="Org Reports">
                            <template #icon>
                                <BarChart3 :size="16" :stroke-width="1.25" />
                            </template>
                        </SidebarNavItem>
                    </SidebarNavDropdown>

                    <!-- Requests & Invites -->
                    <SidebarNavItem
                        :to="{ name: 'org.manage', params: { id: currentOrgId }, query: { tab: 'requests' } }"
                        title="Requests & Invites" :badge="pendingRequests || undefined">
                        <template #icon>
                            <MailPlus :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>

                    <!-- Permissions -->
                    <SidebarNavItem :to="{ name: 'permission', params: { id: currentOrgId } }" title="Permissions">
                        <template #icon>
                            <ShieldCheck :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>

                    <!-- Organization Settings -->
                    <SidebarNavItem
                        :to="{ name: 'org.manage', params: { id: currentOrgId }, query: { tab: 'settings' } }"
                        title="Settings">
                        <template #icon>
                            <Cog :size="16" :stroke-width="1.25" />
                        </template>
                    </SidebarNavItem>
                </template>
            </template>
        </div>
    </aside>
</template>