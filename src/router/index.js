// src\router\index.js
import { createRouter, createWebHistory } from "vue-router"
// import authRoutes from "@router/modules/auth"
import adminRoutes from '@router/modules/admin'
import { useAuthStore } from "@stores/auth"
import orgRoutes from "@router/modules/org"
import opsRoutes from "@router/modules/ops"
import eventsRoutes from "@router/modules/events"
import meRoutes from "@router/modules/me"
import reviewRoutes from "@router/modules/reviews"
import authenticatedRoutes from "@router/modules/authenticated"
import dutyRoutes from "@router/modules/duty"

import publicRoutes from "@router/modules/public"
import api from "@/utils/api";

const routes = [
    ...publicRoutes,
    // {
    //     path: "/",
    //     name: "Landing",
    //     component: () => import("@views/Landing.vue"),
    // },
    // {
    //     path: '/dashboard',
    //     name: 'user.dashboard',
    //     component: () => import('@/views/user/Dashboard.vue'),
    //     meta: { requiresAuth: true }
    // },
    {
        path: "/typography",
        name: "typography",
        component: () => import("@components/ui/Typography.vue"),
    },
    ...authenticatedRoutes,
    ...adminRoutes,
    ...orgRoutes,
    ...opsRoutes,
    ...eventsRoutes,
    ...meRoutes,
    ...dutyRoutes,
    // ...reviewRoutes,

    // {
    //     path: "/:pathMatch(.*)*",
    //     name: "NotFound",
    //     component: () => import("@views/NotFound.vue"),
    // },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

// src/router/index.js

// router.beforeEach(async (to, from, next) => {
//     const auth = useAuthStore();

//     // Determine if the route needs authentication
//     const requiresAuth = to.matched.some((r) => r.meta.requiresAuth);

//     // If user not yet loaded, check session from backend once
//     if (!auth.user && !auth.isLoading) {
//         try {
//             const { data } = await api.get("/api/user");
//             auth.user = data;
//         } catch {
//             auth.user = null;
//         }
//     }

//     const isAuthenticated = !!auth.user;

//     // --- Route protection logic ---

//     // 1️⃣  Needs login but user not logged in → redirect to login
//     if (requiresAuth && !isAuthenticated) {
//         return next({ name: "Login", query: { redirect: to.fullPath } });
//     }

//     // 2️⃣  Logged-in user trying to visit Login/Signup → send to dashboard
//     if (
//         (to.name === "Login" || to.name === "SignUp") &&
//         isAuthenticated
//     ) {
//         return next({ name: "Dashboard" });
//     }

//     // 3️⃣  Otherwise → allow
//     next();
// });

export default router
