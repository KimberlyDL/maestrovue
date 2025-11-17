<script setup>
import { ref, computed } from 'vue'
import { useOrganizationStore } from '@/stores/organization'
import SidebarNavItem from './sidebar_nav_item.vue'
import SidebarNavDropdown from './sidebar_nav_dropdown.vue'
import SidebarGroupLabel from './sidebar_group_label.vue'

/**
 * Icons
 * Import only what you use (lucide-vue-next).
 * Replace icons anytime; labels stay the same.
 */
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
    Building2,       // Organizations group icon
    PlusCircle,      // Create Group
    Users,           // Members
    MailPlus,        // Invites
    UserCheck,       // Join Requests (admin)
    Layers,          // Requests & Invites (combined alt)
    History,         // Audit Logs
    Compass,         // Discover & Join
    ClipboardList,   // My Join Requests
    Settings,         // Profile Settings
    ArrowRightLeft
} from 'lucide-vue-next'



const orgStore = useOrganizationStore()

// /**
//  * Example counters (wire these to your store/API)
//  */
// const pendingOpsExcuses = ref(2)
// const pendingEventExcuses = ref(1)
// const unreadThreads = ref(3)
// const pendingReviews = ref(4)




// // Wire these from your auth/store later
// const user = ref({
//     roles: ['officer'], // ['member'] for requester pov only
//     hasPrimaryOrg: true
// })

// const isOfficer = computed(() =>
//     user.value.roles.includes('officer') || user.value.roles.includes('admin')
// )

// // Example counters (optional)
// const pendingRequests = ref(3)
// const pendingInvites = ref(2)

// Get current org ID from store
const currentOrgId = computed(() => orgStore.currentOrgId)
const hasCurrentOrg = computed(() => orgStore.hasCurrentOrg)

// Wire these from your auth/store later
const user = ref({
    roles: ['member'],
    hasPrimaryOrg: true
})

const isOfficer = computed(() =>
    user.value.roles.includes('member') || user.value.roles.includes('admin')
)

const pendingRequests = ref(3)
const pendingInvites = ref(2)
const pendingReviews = ref(4)

</script>

<template>
    <aside class="w-64 shrink-0 bg-platinum-50 dark:bg-abyss-900 h-screen sticky top-0 overflow-y-auto">
        <div class="p-3">
            <!-- Header -->
            <div class="mb-4 px-3 pt-6 text-lg font-semibold text-gray-800 dark:text-gray-100">
                Admin
            </div>

            <!-- Top-level -->
            <!-- <SidebarNavItem :to="{ name: 'orgs.feed' }" title="Feed">
                <template #icon :class="text - electric - lime - 100">
                    <House size="16" strokeWidth={1.25} />
                </template>

            </SidebarNavItem> -->

            <SidebarGroupLabel text="Home" />

            <!-- Top-level -->
            <SidebarNavItem :to="{ name: 'admin.dashboard' }" title="Home">
                <template #icon :class="text - electric - lime - 100">
                    <House size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>

            <SidebarNavItem :to="{ name: 'admin.announcements' }" title="Announcements">
                <template #icon :class="text - electric - lime - 100">
                    <Megaphone size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>

            <SidebarNavItem v-if="hasCurrentOrg" :to="{ name: 'org.manage', params: { id: currentOrgId } }"
                title="Manage Organization">
                <template #icon>
                    <Settings size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>

            <!-- ===== EVENTS (one-off / multi-day) ===== -->
            <SidebarGroupLabel text="Events" />

            <SidebarNavItem :to="{ name: 'duty.calendar', params: { id: currentOrgId } }" title="Calendar">
                <template #icon>
                    <Calendar size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>

            <SidebarNavItem :to="{ name: 'duty.schedules', params: { id: currentOrgId } }" title="Schedules">
                <template #icon>
                    <CalendarClock size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>


            <!-- My Duty Items (Member View) -->
            <SidebarNavDropdown label="My Duties" :matchPaths="[
                `/org/${currentOrgId}/duty/my/assignments`,
                `/org/${currentOrgId}/duty/my/availability`,
                `/org/${currentOrgId}/duty/my/swap`,
                `/org/${currentOrgId}/duty/my/performance`
            ]">
                <template #icon>
                    <User size="16" strokeWidth={1.25} />
                </template>

                <SidebarNavItem :to="{ name: 'duty.assignments', params: { id: currentOrgId } }" title="My Assignments">
                    <template #icon>
                        <ClipboardCheck size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>

                <SidebarNavItem :to="{ name: 'duty.availability', params: { id: currentOrgId } }"
                    title="My Availability">
                    <template #icon>
                        <Calendar size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>

                <SidebarNavItem :to="{ name: 'duty.my_swap', params: { id: currentOrgId } }" title="My Swap Requests">
                    <template #icon>
                        <ArrowRightLeft size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>

                <SidebarNavItem :to="{ name: 'duty.available-swaps', params: { id: currentOrgId } }"
                    title="Available Swaps">
                    <template #icon>
                        <ArrowRightLeft size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>

                <SidebarNavItem :to="{ name: 'duty.my_performance', params: { id: currentOrgId } }"
                    title="My Performance">
                    <template #icon>
                        <BarChart3 size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>
            </SidebarNavDropdown>


            <!-- Admin Duty Management -->
            <SidebarNavDropdown v-if="isOfficer" label="Duty Admin" :matchPaths="[
                `/org/${currentOrgId}/duty/swaps`,
                `/org/${currentOrgId}/duty/reports`
            ]">
                <template #icon>
                    <CheckCircle size="16" strokeWidth={1.25} />
                </template>

                <SidebarNavItem :to="{ name: 'duty.swaps', params: { id: currentOrgId } }" title="Swap Requests">
                    <template #icon>
                        <ArrowRightLeft size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>

                <SidebarNavItem :to="{ name: 'duty.reports', params: { id: currentOrgId } }" title="Org Reports">
                    <template #icon>
                        <BarChart3 size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>
            </SidebarNavDropdown>


            <!-- ===== DOCUMENTS ===== -->
            <SidebarGroupLabel text="Document Storage" />

            <SidebarNavItem v-if="hasCurrentOrg" :to="{ name: 'org.doc-storage', params: { id: currentOrgId } }"
                title="Document Vault">
                <template #icon>
                    <FileStack size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>


            <!-- ===== Repository ===== -->
            <SidebarGroupLabel text="Repository" />

            <SidebarNavDropdown label="Documents" :matchPaths="[
                '/documents',
                '/document-review',
                '/approved',
                '/returned'
            ]">
                <template #icon :class="text - electric - lime - 100">
                    <FolderKanban size="16" strokeWidth={1.25} />
                </template>


            </SidebarNavDropdown>

            <!-- <SidebarNavItem :to="{ name: 'org.doc-review' }" title="Document Review"
                :badge="pendingReviews || undefined">
                <template #icon :class="text - electric - lime - 100">
                    <FileCheck size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>

            <SidebarNavItem :to="{ name: 'org.doc-submit' }" title="Submit Document">
                <template #icon :class="text - electric - lime - 100">
                    <Users size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>

            <SidebarNavItem :to="{ name: 'org.doc-submission' }" title="Submissions">
                <template #icon :class="text - electric - lime - 100">
                    <Users size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem> -->


            <SidebarNavItem v-if="hasCurrentOrg" :to="{ name: 'org.doc-review', params: { id: currentOrgId } }"
                title="Document Review" :badge="pendingReviews || undefined">
                <template #icon>
                    <FileCheck size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>

            <SidebarNavItem v-if="hasCurrentOrg" :to="{ name: 'org.doc-submit', params: { id: currentOrgId } }"
                title="Submit Document">
                <template #icon>
                    <Users size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>

            <SidebarNavItem v-if="hasCurrentOrg" :to="{ name: 'org.doc-submission', params: { id: currentOrgId } }"
                title="Submissions">
                <template #icon>
                    <Users size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>

            <SidebarNavItem v-if="hasCurrentOrg" :to="{ name: 'reviewer.mailbox', params: { id: currentOrgId } }"
                title="Reviews" :badge="pendingReviews || undefined">
                <template #icon>
                    <FileCheck size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>
        </div>
    </aside>
</template>
