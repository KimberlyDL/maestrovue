// src\router\modules\events.js
export default [
    {
        path: '/admin/events',
        component: () => import('@/layouts/AdminLayout.vue'),
        // meta: { requiresAuth: true },
        children: [
            {
                path: 'create',
                name: 'events.calendar',
                component: () => import('@views/events/Calendar.vue'),
                meta: { title: 'Dashboard' },
            },
            {
                path: 'volunteers',
                name: 'events.volunteers',
                component: () => import('@views/events/Volunteers.vue'),
                meta: { title: 'Dashboard' },
            },
            {
                path: 'attendance',
                name: 'events.attendance',
                component: () => import('@views/events/Attendance.vue'),
                meta: { title: 'Document Review' },
            },
            {
                path: 'shifts',
                name: 'events.shifts',
                component: () => import('@views/events/Shifts.vue'),
                meta: { title: 'Reviewer Groups' },
            },
            {
                path: 'excuses',
                name: 'events.excuses',
                component: () => import('@views/events/Excuses.vue'),
                meta: { title: 'Reviewer Groups' },
            },
            {
                path: 'reports',
                name: 'events.reports',
                component: () => import('@views/events/Reports.vue'),
                meta: { title: 'Reviewer Groups' },
            },
        ],
    },
]