// src/utils/usePermissions.js
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'

// Define all available permissions
export const PERMISSIONS = {
    // Organization Management
    MANAGE_ORG_SETTINGS: 'manage_organization_settings',
    MANAGE_ORG_MEMBERS: 'manage_organization_members',
    INVITE_MEMBERS: 'invite_members',
    REMOVE_MEMBERS: 'remove_members',
    
    // Duty Management
    MANAGE_DUTY_SCHEDULES: 'manage_duty_schedules',
    VIEW_DUTY_SCHEDULES: 'view_duty_schedules',
    ASSIGN_DUTIES: 'assign_duties',
    
    // Document Management
    MANAGE_DOCUMENTS: 'manage_documents',
    VIEW_DOCUMENTS: 'view_documents',
    UPLOAD_DOCUMENTS: 'upload_documents',
    
    // Review System
    CREATE_REVIEWS: 'create_reviews',
    MANAGE_REVIEWS: 'manage_reviews',
    
    // Announcements
    CREATE_ANNOUNCEMENTS: 'create_announcements',
    MANAGE_ANNOUNCEMENTS: 'manage_announcements',
}

// Role-based permission mappings
const ROLE_PERMISSIONS = {
    admin: [
        PERMISSIONS.MANAGE_ORG_SETTINGS,
        PERMISSIONS.MANAGE_ORG_MEMBERS,
        PERMISSIONS.INVITE_MEMBERS,
        PERMISSIONS.REMOVE_MEMBERS,
        PERMISSIONS.MANAGE_DUTY_SCHEDULES,
        PERMISSIONS.VIEW_DUTY_SCHEDULES,
        PERMISSIONS.ASSIGN_DUTIES,
        PERMISSIONS.MANAGE_DOCUMENTS,
        PERMISSIONS.VIEW_DOCUMENTS,
        PERMISSIONS.UPLOAD_DOCUMENTS,
        PERMISSIONS.CREATE_REVIEWS,
        PERMISSIONS.MANAGE_REVIEWS,
        PERMISSIONS.CREATE_ANNOUNCEMENTS,
        PERMISSIONS.MANAGE_ANNOUNCEMENTS,
    ],
    member: [
        PERMISSIONS.VIEW_DUTY_SCHEDULES,
        PERMISSIONS.VIEW_DOCUMENTS,
        PERMISSIONS.UPLOAD_DOCUMENTS,
        PERMISSIONS.CREATE_REVIEWS,
    ],
    viewer: [
        PERMISSIONS.VIEW_DUTY_SCHEDULES,
        PERMISSIONS.VIEW_DOCUMENTS,
    ],
}

export function usePermissions(organizationId = null) {
    const authStore = useAuthStore()
    const route = useRoute()

    // Get organization ID from parameter or route
    const orgId = computed(() => {
        return organizationId || route.params.organizationId || route.params.orgId
    })

    // Get user's role in the current organization
    const userRole = computed(() => {
        if (!authStore.isAuthenticated || !orgId.value) return null
        
        const user = authStore.user
        
        // Check if user has organizations array
        if (!user?.organizations) return null
        
        // Find the organization and return the role
        const org = user.organizations.find(o => 
            o.id === parseInt(orgId.value) || o.id === orgId.value
        )
        
        return org?.role || null
    })

    // Check if user has a specific permission
    function hasPermission(permission) {
        if (!authStore.isAuthenticated) return false
        if (!userRole.value) return false
        
        const rolePerms = ROLE_PERMISSIONS[userRole.value] || []
        return rolePerms.includes(permission)
    }

    // Check if user has any of the given permissions
    function hasAnyPermission(permissions) {
        return permissions.some(permission => hasPermission(permission))
    }

    // Check if user has all of the given permissions
    function hasAllPermissions(permissions) {
        return permissions.every(permission => hasPermission(permission))
    }

    // Check if user is admin
    const isAdmin = computed(() => {
        return userRole.value === 'admin'
    })

    // Check if user is member or higher
    const isMember = computed(() => {
        return ['admin', 'member'].includes(userRole.value)
    })

    // Check if user can manage the organization
    const canManageOrg = computed(() => {
        return hasPermission(PERMISSIONS.MANAGE_ORG_SETTINGS)
    })

    // Check if user can manage members
    const canManageMembers = computed(() => {
        return hasPermission(PERMISSIONS.MANAGE_ORG_MEMBERS)
    })

    // Check if user can manage duty schedules
    const canManageDuties = computed(() => {
        return hasPermission(PERMISSIONS.MANAGE_DUTY_SCHEDULES)
    })

    return {
        // State
        userRole,
        isAdmin,
        isMember,
        canManageOrg,
        canManageMembers,
        canManageDuties,
        
        // Methods
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    }
}

// Optional: Create a directive for v-permission
export const permissionDirective = {
    mounted(el, binding) {
        const { hasPermission } = usePermissions()
        const permission = binding.value
        
        if (!hasPermission(permission)) {
            el.style.display = 'none'
        }
    },
    updated(el, binding) {
        const { hasPermission } = usePermissions()
        const permission = binding.value
        
        if (!hasPermission(permission)) {
            el.style.display = 'none'
        } else {
            el.style.display = ''
        }
    }
}

// Helper to check permissions without composable context
export function checkPermission(userRole, permission) {
    const rolePerms = ROLE_PERMISSIONS[userRole] || []
    return rolePerms.includes(permission)
}