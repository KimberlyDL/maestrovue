// src/router/index.js
import { createRouter, createWebHistory } from "vue-router"
import adminRoutes from '@router/modules/admin'
import { useAuthStore } from "@stores/auth"
import { usePermissions, PERMISSIONS } from "@/utils/usePermissions"
import meRoutes from "@router/modules/me"
import authenticatedRoutes from "@router/modules/authenticated"
import dutyRoutes from "@router/modules/duty"
import publicRoutes from "@router/modules/public"
import api from "@/utils/api"

const routes = [
    ...publicRoutes,
    {
        path: "/typography",
        name: "typography",
        component: () => import("@components/ui/Typography.vue"),
    },
    ...authenticatedRoutes,
    ...adminRoutes,
    ...meRoutes,
    ...dutyRoutes,
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: () => import("@views/NotFound.vue"),
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

// Helper function to check permissions
async function checkRoutePermissions(to, auth) {
    const orgId = to.params.id
    
    // Routes that don't need permission checks
    if (!to.meta.requiresPermission && !to.meta.requiresAdmin && !to.meta.requiresMember) {
        return true
    }

    if (!orgId) {
        console.warn('No organization ID found for permission check')
        return true // Let the component handle it
    }

    const { loadPermissions, isAdmin, isMember, hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions(orgId)
    
    try {
        await loadPermissions(orgId)

        // Check admin requirement
        if (to.meta.requiresAdmin && !isAdmin.value) {
            return { name: 'org.manage', params: { id: orgId }, query: { error: 'admin_required' } }
        }

        // Check member requirement
        if (to.meta.requiresMember && !isMember.value) {
            return { name: 'home', query: { error: 'not_member' } }
        }

        // Check specific permissions
        if (to.meta.requiresPermission) {
            const permission = to.meta.requiresPermission
            
            if (typeof permission === 'string') {
                if (!hasPermission(permission)) {
                    return { name: 'org.manage', params: { id: orgId }, query: { error: 'insufficient_permissions' } }
                }
            } else if (Array.isArray(permission)) {
                const requireAll = to.meta.requiresAllPermissions === true
                const hasAccess = requireAll 
                    ? hasAllPermissions(permission)
                    : hasAnyPermission(permission)
                
                if (!hasAccess) {
                    return { name: 'org.manage', params: { id: orgId }, query: { error: 'insufficient_permissions' } }
                }
            }
        }

        return true
    } catch (error) {
        console.error('Permission check failed:', error)
        return { name: 'home', query: { error: 'permission_check_failed' } }
    }
}

router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore()

    // Determine if the route needs authentication
    const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)

    // If user not yet loaded, check session from backend once
    if (!auth.user && !auth.isLoading) {
        try {
            await auth.restoreSession()
        } catch {
            auth.user = null
        }
    }

    const isAuthenticated = !!auth.user

    // 1️⃣ Needs login but user not logged in → redirect to login
    if (requiresAuth && !isAuthenticated) {
        return next({ name: "login", query: { redirect: to.fullPath } })
    }

    // 2️⃣ Logged-in user trying to visit Login/Signup → send to home
    if ((to.name === "login" || to.name === "signup") && isAuthenticated) {
        return next({ name: "home" })
    }

    // 3️⃣ Check permissions for organization routes
    if (isAuthenticated && (to.meta.requiresPermission || to.meta.requiresAdmin || to.meta.requiresMember)) {
        const permissionCheck = await checkRoutePermissions(to, auth)
        
        if (permissionCheck !== true) {
            return next(permissionCheck)
        }
    }

    // 4️⃣ Otherwise → allow
    next()
})

// Optional: Add error handling for navigation errors
router.onError((error) => {
    console.error('Router error:', error)
})

export default router