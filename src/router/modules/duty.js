export default [
    {
        path: '/org/:id/duty',
        component: () => import('@/layouts/AdminLayout.vue'),
        children: [
            {
                path: '',
                name: 'duty.calendar',
                component: () => import('@views/duty/DutyCalendar.vue'),
                meta: { title: 'Duty Calendar' },
            },
            {
                path: 'schedules',
                name: 'duty.schedules',
                component: () => import('@views/duty/DutySchedules.vue'),
                meta: { title: 'Duty Schedules' },
            },
            {
                path: 'my/availability',
                name: 'duty.availability',
                component: () => import('@views/duty/MyAvailability.vue'),
                meta: { title: 'My Availability' },
            },
            {
                path: 'my/assignments',
                name: 'duty.assignments',
                component: () => import('@views/duty/MyAssignments.vue'),
                meta: { title: 'My Assignments' },
            },
            {
                path: 'swaps',
                name: 'duty.swaps',
                component: () => import('@views/duty/SwapRequests.vue'),
                meta: { title: 'Swap Requests' },
            },
            {
                path: 'my/my-requests',
                name: 'duty.my_swap',
                component: () => import('@views/duty/MySwapRequests.vue'),
                meta: { title: 'Swap Marketplace' },
            },
            {
                path: 'swaps/available',
                name: 'duty.available-swaps',
                component: () => import('@views/duty/AvailableSwaps.vue'),
                meta: { title: 'Available Swaps' },
            },
            // NEW: Member reports
            {
                path: 'my/performance',
                name: 'duty.my_performance',
                component: () => import('@views/duty/MemberDutyReports.vue'),
                meta: { title: 'My Performance' },
            },
            {
                path: 'reports',
                name: 'duty.reports',
                component: () => import('@views/duty/AdminDutyReports.vue'),
                meta: { title: 'Duty Reports' },
            },
        ],
    },
]