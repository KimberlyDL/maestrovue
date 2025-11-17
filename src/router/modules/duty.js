// src/router/modules/duty.js
import { PERMISSIONS } from '@/utils/usePermissions'

export default [
    {
        path: '/org/:id/duty',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: { requiresAuth: true, requiresMember: true },
        children: [
            {
                path: '',
                name: 'duty.calendar',
                component: () => import('@views/duty/DutyCalendar.vue'),
                meta: { 
                    title: 'Duty Calendar',
                    requiresPermission: PERMISSIONS.VIEW_DUTY_SCHEDULES
                },
            },
            {
                path: 'schedules',
                name: 'duty.schedules',
                component: () => import('@views/duty/DutySchedules.vue'),
                meta: { 
                    title: 'Duty Schedules',
                    requiresPermission: PERMISSIONS.VIEW_DUTY_SCHEDULES
                },
            },
            {
                path: 'my/availability',
                name: 'duty.availability',
                component: () => import('@views/duty/MyAvailability.vue'),
                meta: { 
                    title: 'My Availability',
                    requiresMember: true // Any member can view
                },
            },
            {
                path: 'my/assignments',
                name: 'duty.assignments',
                component: () => import('@views/duty/MyAssignments.vue'),
                meta: { 
                    title: 'My Assignments',
                    requiresMember: true // Any member can view
                },
            },
            {
                path: 'swaps',
                name: 'duty.swaps',
                component: () => import('@views/duty/SwapRequests.vue'),
                meta: { 
                    title: 'Swap Requests',
                    requiresPermission: PERMISSIONS.APPROVE_DUTY_SWAPS
                },
            },
            {
                path: 'my/my-requests',
                name: 'duty.my_swap',
                component: () => import('@views/duty/MySwapRequests.vue'),
                meta: { 
                    title: 'Swap Marketplace',
                    requiresMember: true // Any member can view
                },
            },
            {
                path: 'swaps/available',
                name: 'duty.available-swaps',
                component: () => import('@views/duty/AvailableSwaps.vue'),
                meta: { 
                    title: 'Available Swaps',
                    requiresMember: true // Any member can view
                },
            },
            {
                path: 'my/performance',
                name: 'duty.my_performance',
                component: () => import('@views/duty/MemberDutyReports.vue'),
                meta: { 
                    title: 'My Performance',
                    requiresMember: true // Any member can view their own stats
                },
            },
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