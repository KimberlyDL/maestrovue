// src/router/modules/duty.js
import { PERMISSIONS } from '@/utils/permissions'

export default [
    {
        path: '/org/:id/duty',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: { requiresAuth: true, requiresMember: true },
        children: [
            // ===== DUTY CALENDAR (Requires permission) =====
            {
                path: '',
                name: 'duty.calendar',
                component: () => import('@views/duty/DutyCalendar.vue'),
                meta: {
                    title: 'Duty Calendar',
                    requiresPermission: PERMISSIONS.VIEW_DUTY_SCHEDULES
                },
            },

            // ===== DUTY SCHEDULES LIST (Requires permission) =====
            {
                path: 'schedules',
                name: 'duty.schedules',
                component: () => import('@views/duty/DutySchedules.vue'),
                meta: {
                    title: 'Duty Schedules',
                    requiresPermission: PERMISSIONS.VIEW_DUTY_SCHEDULES
                },
            },

            // ===== MY AVAILABILITY (All members - implicit permission) =====
            {
                path: 'my/availability',
                name: 'duty.availability',
                component: () => import('@views/duty/MyAvailability.vue'),
                meta: {
                    title: 'My Availability',
                    requiresMember: true // Implicit: manage_own_availability
                },
            },

            // ===== MY ASSIGNMENTS (All members - implicit permission) =====
            {
                path: 'my/assignments',
                name: 'duty.assignments',
                component: () => import('@views/duty/MyAssignments.vue'),
                meta: {
                    title: 'My Assignments',
                    requiresMember: true // Implicit: view_own_assignments
                },
            },

            // ===== ADMIN SWAP REQUESTS (Requires permission) =====
            {
                path: 'swaps',
                name: 'duty.swaps',
                component: () => import('@views/duty/SwapRequests.vue'),
                meta: {
                    title: 'Swap Requests',
                    requiresPermission: PERMISSIONS.APPROVE_DUTY_SWAPS
                },
            },

            // ===== MY SWAP REQUESTS (All members - implicit permission) =====
            {
                path: 'my/my-requests',
                name: 'duty.my_swap',
                component: () => import('@views/duty/MySwapRequests.vue'),
                meta: {
                    title: 'My Swap Requests',
                    requiresMember: true // Implicit: request_duty_swap
                },
            },

            // ===== SWAP MARKETPLACE (All members) =====
            {
                path: 'swaps/available',
                name: 'duty.available-swaps',
                component: () => import('@views/duty/AvailableSwaps.vue'),
                meta: {
                    title: 'Available Swaps',
                    requiresMember: true // Implicit: request_duty_swap
                },
            },

            // ===== MY PERFORMANCE (All members - implicit permission) =====
            {
                path: 'my/performance',
                name: 'duty.my_performance',
                component: () => import('@views/duty/MemberDutyReports.vue'),
                meta: {
                    title: 'My Performance',
                    requiresMember: true // Implicit: view_own_statistics
                },
            },

            // ===== ADMIN REPORTS (Requires permission) =====
            {
                path: 'reports',
                name: 'duty.reports',
                component: () => import('@views/duty/AdminDutyReports.vue'),
                meta: {
                    title: 'Duty Reports',
                    requiresPermission: PERMISSIONS.VIEW_STATISTICS
                },
            },
        ],
    },
]