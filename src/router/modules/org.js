// src/router/modules/admin.js
export default [
    {
        path: '/admin/org',
        component: () => import('@/layouts/AdminLayout.vue'),
        // meta: { requiresAuth: true },
        children: [
            {
                path: 'create',
                name: 'org.manage-details',
                component: () => import('@views/org/ManageOrgDetails.vue'),
                meta: { title: 'Dashboard' },
            },
            {
                path: 'members',
                name: 'org.members',
                component: () => import('@views/org/Members.vue'),
                meta: { title: 'Dashboard' },
            },
            {
                path: 'membership',
                name: 'org.requests-invites',
                component: () => import('@views/org/RequestsInvites.vue'),
                meta: { title: 'Document Review' },
            },
            {
                path: 'logs',
                name: 'org.logs',
                component: () => import('@views/org/Logs.vue'),
                meta: { title: 'Reviewer Groups' },
            },
            {
                path: 'members/:id',
                name: 'org.member.profile',
                component: () => import('@/views/org/MemberProfile.vue'),
                // meta: { requiresAuth: true }
            }
        ],
    },
]