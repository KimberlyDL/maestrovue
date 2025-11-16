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
            {
                path: 'reviewer-groups',
                name: 'admin.reviewer-groups',
                component: () => import('@views/admin/ReviewerGroups.vue'),
                meta: { title: 'Reviewer Groups' },
            },
            // {
            //     path: "/admin/invites",
            //     name: "admin-invites",
            //     component: () => import("@views/admin/InviteManagementPage.vue"),
            // },

            // my org
            // {
            //     path: '/discover',
            //     name: 'discover.join',
            //     component: () => import('@views/org/JoinClub.vue'),
            //     meta: { title: 'Join' },
            // },
            // {
            //     path: "/my/requests",
            //     name: "my.join-requests",
            //     component: () => import("@views/admin/MyRequests.vue"),
            //     meta: { title: 'My Requests' },
            // },
            // account settings
            {
                path: "/account/profile",
                name: "profile-settings",
                component: () => import("@views/auth/ProfileSettings.vue"),
                meta: { title: 'Account' },
            },

            // you can add more admin routes here:
            // { path: 'files', name: 'admin.files', component: () => import('@views/admin/Files.vue') },
            // { path: 'chat', name: 'admin.chat', component: () => import('@views/admin/Chat.vue') },
        ],
    },
]
