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

            <SidebarGroupLabel text="Main" />

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

            <!-- <SidebarNavItem :to="{ name: 'admin.overview' }" title="Overview">
                <template #icon :class="text-electric-lime-100">
                    <BarChart3     color="platinum-300"
    size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem> -->

            <!-- <SidebarNavItem :to="{ name: 'admin.files' }" title="Files">
                <template #icon :class="text-electric-lime-100">
                    <FileStack     color="platinum-300"
    size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem> -->

            <!-- ===== OPERATIONS (day-to-day) ===== -->
            <SidebarGroupLabel text="Operations (Daily)" />

            <SidebarNavDropdown label="Ops Schedule" :matchPaths="[
                // '/admin/ops',
                // '/admin/ops/calendar',
                // '/admin/ops/shifts',
                // '/admin/ops/attendance',
                // '/admin/ops/excuses',
                // '/admin/ops/reports'
            ]">
                <template #icon :class="text - electric - lime - 100">
                    <CalendarClock size="16" strokeWidth={1.25} />
                </template>

                <SidebarNavItem :to="{ name: 'ops.calendar' }" title="Calendar">
                    <template #icon :class="text - electric - lime - 100">
                        <Calendar size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>

                <SidebarNavItem :to="{ name: 'ops.shifts' }" title="Shifts / Slots">
                    <template #icon :class="text - electric - lime - 100">
                        <Layers size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>

                <SidebarNavItem :to="{ name: 'ops.attendance' }" title="Attendance">
                    <template #icon :class="text - electric - lime - 100">
                        <ClipboardCheck size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>

                <SidebarNavItem :to="{ name: 'ops.excuses' }" :badge="pendingOpsExcuses || undefined"
                    title="Excuse Requests">
                    <template #icon :class="text - electric - lime - 100">
                        <ShieldCheck size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>

                <SidebarNavItem :to="{ name: 'ops.reports' }" title="Reports">
                    <template #icon :class="text - electric - lime - 100">
                        <BarChart3 size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>
            </SidebarNavDropdown>

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

                <SidebarNavItem :to="{ name: 'duty.available-swaps', params: { id: currentOrgId } }" title="Available Swaps">
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




            <!-- <SidebarNavItem :to="{ name: 'duty.calendar', params: { id: currentOrgId } }" title="Calendar">
                <template #icon :class="text - electric - lime - 100">
                    <Calendar size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>

            <SidebarNavItem :to="{ name: 'duty.schedules', params: { id: currentOrgId } }" title="Schedule">
                <template #icon :class="text - electric - lime - 100">
                    <Users size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>

            <SidebarNavItem :to="{ name: 'duty.availability', params: { id: currentOrgId } }" title="Availability">
                <template #icon :class="text - electric - lime - 100">
                    <ClipboardCheck size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>

            <SidebarNavItem :to="{ name: 'duty.assignments', params: { id: currentOrgId } }"
                :badge="pendingEventExcuses || undefined" title="Assignments">
                <template #icon :class="text - electric - lime - 100">
                    <ShieldCheck size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>

            <SidebarNavItem :to="{ name: 'duty.swaps', params: { id: currentOrgId } }" title="Swaps">
                <template #icon :class="text - electric - lime - 100">
                    <BarChart3 size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>

            <SidebarNavItem :to="{ name: 'duty.reports', params: { id: currentOrgId } }" title="Reports">
                <template #icon :class="text - electric - lime - 100">
                    <BarChart3 size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem> -->





            <!-- <SidebarNavDropdown label="Event Schedule" :matchPaths="[]">
                <template #icon :class="text - electric - lime - 100">
                    <CalendarClock size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavDropdown> -->


            <!-- ===== DOCUMENTS ===== -->
            <SidebarGroupLabel text="Document Storage" />

            <!-- <SidebarNavItem :to="{ name: 'org.doc-storage' }" title="Document Vault">
                <template #icon :class="text - electric - lime - 100">
                    <FileStack size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem> -->

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

            <!-- <SidebarNavItem :to="{ name: 'admin.reviewer-groups' }" title="Reviewer Groups">
                <template #icon :class="text - electric - lime - 100">
                    <Users size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem> -->

            <SidebarNavItem v-if="hasCurrentOrg" :to="{ name: 'admin.reviewer-groups', params: { id: currentOrgId } }"
                title="Reviewer Groups">
                <template #icon>
                    <Users size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>






            <!-- <SidebarNavItem :to="{ name: 'reviewer-groups' }" title="Reviewer Groups">
                <template #icon :class="text - electric - lime - 100">
                    <Users size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem> -->

            <!-- admin pov -->
            <!-- create ng group -->
            <!-- form sa paggawa ng group, group name, contact email at phone  -->

            <!-- admin pov -->
            <!-- members management -->
            <!-- panel para kita yung mga members at anong role, kelan nagjoin at pano nagjoin (invited or requested),  then if active, 
                 or remove member, link para sa member account view -->

            <!-- sa invites, no ang mga inivited na user (email papakita), expiration date ng invitation,-->
            <!-- logs, dito na alng ipakita kung inaccept or declined ang invite-->

            <!-- sa requests, no. ng mga nagrequest (email papakita), tabs para sa mga accepted at declined-->
            <!-- logs/history/tracking, ref:shoppe delivery; timestamp, 
                 dito na alng ipakita kung inaccept or declined ang invite-->

            <!-- requester pov -->
            <!-- request page para magjoin -->
            <!-- tab or page para sa mga requests nya sa pagjoin ng group -->
            <!-- hindi na maglagay ng page para sa pagmonitor ng mga updates sa pagjoin ng orgs
                sama na lang sa notifs -->
            <!-- dashboard para sa groups info and members (di dito kasama yung mga documents ng groups)  -->

            <!-- settings (mismong account na to)-->
            <!-- user profile para sa pagchange ng password, basic info, di pede magpalit ng email -->


            <!-- ===== ORGANIZATIONS ===== -->
            <SidebarGroupLabel text="Organizations" />

            <!-- Admin POV -->
            <SidebarNavDropdown v-if="isOfficer" label="Organization Admin" :matchPaths="[
                '/admin/org',
                '/admin/org/create',
                '/admin/org/members',
                '/admin/org/invites',
                '/admin/org/requests',
                '/admin/org/logs'
            ]">
                <template #icon :class="text - electric - lime - 100">
                    <Building2 size="16" strokeWidth={1.25} />
                </template>

                <!-- If you want separate screens -->
                <SidebarNavItem :to="{ name: 'org.manage-details' }" title="Create Group">
                    <template #icon :class="text - electric - lime - 100">
                        <PlusCircle size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>

                <SidebarNavItem :to="{ name: 'org.members' }" title="Members">
                    <template #icon :class="text - electric - lime - 100">
                        <Users size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>

                <SidebarNavItem :to="{ name: 'org.requests-invites' }" title="Requests & Invites"
                    :badge="(pendingRequests + pendingInvites) || undefined">
                    <template #icon :class="text - electric - lime - 100">
                        <Layers size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>

                <SidebarNavItem :to="{ name: 'org.logs' }" title="Audit Logs">
                    <template #icon :class="text - electric - lime - 100">
                        <History size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>
            </SidebarNavDropdown>

            <!-- Requester POV (members) -->
            <SidebarNavDropdown label="My Organizations" :matchPaths="['/discover', '/my/requests']">
                <template #icon :class="text - electric - lime - 100">
                    <Building2 size="16" strokeWidth={1.25} />
                </template>

                <!-- <SidebarNavItem :to="{ name: 'discover.join' }" title="Discover & Join">
                    <template #icon :class="text - electric - lime - 100">
                        <Compass size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem>

                <SidebarNavItem :to="{ name: 'my.join-requests' }" title="My Join Requests">
                    <template #icon :class="text - electric - lime - 100">
                        <ClipboardList size="16" strokeWidth={1.25} />
                    </template>
                </SidebarNavItem> -->
            </SidebarNavDropdown>

            <SidebarGroupLabel text="Account" />
            <SidebarNavItem :to="{ name: 'profile-settings' }" title="Profile Settings">
                <template #icon :class="text - electric - lime - 100">
                    <Settings size="16" strokeWidth={1.25} />
                </template>
            </SidebarNavItem>
        </div>
    </aside>
</template>
