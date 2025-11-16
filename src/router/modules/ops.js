// src\router\modules\ops.js
export default [
    {
        path: '/admin/ops',
        component: () => import('@/layouts/AdminLayout.vue'),
        // meta: { requiresAuth: true },
        children: [
            {
                path: 'create',
                name: 'ops.calendar',
                component: () => import('@views/ops/Calendar.vue'),
                meta: { title: 'Dashboard' },
            },
            {
                path: 'shifts',
                name: 'ops.shifts',
                component: () => import('@views/ops/Shifts.vue'),
                meta: { title: 'Dashboard' },
            },
            {
                path: 'attendance',
                name: 'ops.attendance',
                component: () => import('@views/ops/Attendance.vue'),
                meta: { title: 'Document Review' },
            },
            {
                path: 'excuses',
                name: 'ops.excuses',
                component: () => import('@views/ops/Excuses.vue'),
                meta: { title: 'Reviewer Groups' },
            },
            {
                path: 'reports',
                name: 'ops.reports',
                component: () => import('@views/ops/Reports.vue'),
                meta: { title: 'Reviewer Groups' },
            },
        ],
    },
]