const publicRoutes = [
    {
        path: "/",
        name: "Landing",
        component: () => import("@views/Landing.vue"),
    },

    {
        path: '/account',
        component: () => import("@layouts/BlankLayout.vue"),
        children: [
            { path: 'login', name: 'login', component: () => import('@views/auth/Login.vue'), meta: { title: 'Login' }, alias: ['/login'] },
            { path: 'signup', name: 'signup', component: () => import('@views/auth/SignUp.vue'), meta: { title: 'Sign Up' }, alias: ['/signup'] },
            { path: 'forgot-password', name: 'forgotPassword', component: () => import('@views/auth/ForgotPassword.vue'), meta: { title: 'Forgot Password' }, alias: ['/forgot-password'] },
            { path: 'verify', name: 'verify-notice', component: () => import('@views/auth/VerifyNotice.vue'), meta: { guest: true } },
            { path: 'reset-password', name: 'resetPassword', component: () => import('@views/auth/ResetPassword.vue'), meta: { title: 'Reset Password' }, alias: ['/reset-password'] },
        ],
    },

    {
        path: '/oauth/callback',
        name: 'oauth.callback',
        component: () => import('@/views/auth/OAuthCallback.vue'),
        meta: { requiresAuth: false }
    }
]

export default publicRoutes
