// src/router/modules/doc.js
export default [
    {
        path: '/reviews',
        component: () => import('@/layouts/AdminLayout.vue'), // ✅ parent layout for all doc pages
        // meta: { requiresAuth: true, title: 'Document Management' },
        children: [
            {
                path: 'inbox',
                name: 'reviewer.mailbox',
                component: () => import('@views/reviewer/ReviewMailBox.vue'),
                meta: { title: 'Review Mails' },
            },
        ],
    },
]
