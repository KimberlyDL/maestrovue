// src/router/modules/admin.js
export default [
    {
        path: '/admin',
        component: () => import('@/layouts/AdminLayout.vue'),
        // meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'admin.dashboard',
                component: () => import('@views/admin/Dashboard.vue'),
                meta: { title: 'Dashboard' },
            },
            {
                path: '',
                name: 'admin.announcements',
                component: () => import('@views/admin/Announcements.vue'),
                meta: { title: 'Dashboard' },
            },
        ],
    },
]
