// src\router\modules\auth.js
const meRoutes = [
    {
        path: '/me',
        component: () => import("@layouts/EmptyLayout.vue"),
        children: [
            {
                path: "profile/settings",
                name: "profile-settings",
                component: () => import("@/views/auth/ProfileSettings.vue"),
            },
        ],
    },
]

export default meRoutes
