// src/utils/usePermissions.js
import { ref, computed, watch } from 'vue'
import axios from './api'

// Global permission cache to avoid redundant API calls
const permissionCache = new Map()

export const usePermissions = (organizationId) => {
    const permissions = ref([])
    const userRole = ref(null)
    const userId = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // Computed
    const isAdmin = computed(() => userRole.value === 'admin' || userRole.value === 'owner')
    const isMember = computed(() => !!userRole.value)

    const hasPermission = (permission) => {
        if (!permission) return true
        if (isAdmin.value) return true
        return permissions.value.includes(permission)
    }

    const hasAnyPermission = (permissionList) => {
        if (!permissionList || permissionList.length === 0) return true
        if (isAdmin.value) return true
        return permissionList.some(p => permissions.value.includes(p))
    }

    const hasAllPermissions = (permissionList) => {
        if (!permissionList || permissionList.length === 0) return true
        if (isAdmin.value) return true
        return permissionList.every(p => permissions.value.includes(p))
    }

    // Check cache first
    const getCachedPermissions = (orgId) => {
        const cacheKey = `org_${orgId}`
        return permissionCache.get(cacheKey)
    }

    const setCachedPermissions = (orgId, data) => {
        const cacheKey = `org_${orgId}`
        permissionCache.set(cacheKey, {
            permissions: data.permissions || [],
            userRole: data.userRole,
            userId: data.userId,
            timestamp: Date.now()
        })
    }

    const clearCache = (orgId = null) => {
        if (orgId) {
            permissionCache.delete(`org_${orgId}`)
        } else {
            permissionCache.clear()
        }
    }

    // Actions
    const loadPermissions = async (orgId = organizationId) => {
        if (!orgId) {
            console.warn('Organization ID is required for permission checks')
            return false
        }

        // Check cache first (valid for 5 minutes)
        const cached = getCachedPermissions(orgId)
        if (cached && (Date.now() - cached.timestamp < 300000)) {
            permissions.value = cached.permissions
            userRole.value = cached.userRole
            userId.value = cached.userId
            return true
        }

        loading.value = true
        error.value = null

        try {
            // Get user's role in organization
            const { data: orgData } = await axios.get(`/api/organizations/${orgId}`)
            userRole.value = orgData.user_role
            userId.value = orgData.user_id

            // If admin, don't need to load individual permissions
            if (userRole.value === 'admin' || userRole.value === 'owner') {
                permissions.value = []
                setCachedPermissions(orgId, {
                    permissions: [],
                    userRole: userRole.value,
                    userId: userId.value
                })
                return true
            }

            // Load user's permissions
            const { data } = await axios.get(`/api/organizations/${orgId}/permissions/users/${userId.value}`)

            // 🛑 DEBUGGING: Print the raw response to check the field name
            console.log("Permission API Response:", data);

            // 🟢 MAPPING FIX: Use granted_permissions, but fall back to 'permissions' if necessary.
            permissions.value = data.granted_permissions || data.permissions || []

            // 🛑 DEBUGGING: Print the resulting array
            console.log("Loaded Permissions Array:", permissions.value);

            // Cache the result
            setCachedPermissions(orgId, {
                permissions: permissions.value,
                userRole: userRole.value,
                userId: userId.value
            })

            return true
        } catch (err) {
            console.error('Failed to load permissions:', err)
            error.value = err.response?.data?.message || 'Failed to load permissions'
            permissions.value = []
            userRole.value = null
            userId.value = null
            return false
        } finally {
            loading.value = false
        }
    }

    // Watch for organization changes
    if (organizationId) {
        watch(() => organizationId, (newId) => {
            if (newId) {
                loadPermissions(newId)
            }
        }, { immediate: true })
    }

    return {
        permissions,
        userRole,
        userId,
        loading,
        error,
        isAdmin,
        isMember,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        loadPermissions,
        clearCache
    }
}

// Permission definitions for easy reference
export const PERMISSIONS = {
    // Storage
    VIEW_STORAGE: 'view_storage',
    UPLOAD_DOCUMENTS: 'upload_documents',
    CREATE_FOLDERS: 'create_folders',
    DELETE_DOCUMENTS: 'delete_documents',
    MANAGE_DOCUMENT_SHARING: 'manage_document_sharing',

    // Reviews
    VIEW_REVIEWS: 'view_reviews',
    CREATE_REVIEWS: 'create_reviews',
    MANAGE_REVIEWS: 'manage_reviews',
    COMMENT_ON_REVIEWS: 'comment_on_reviews',
    ASSIGN_REVIEWERS: 'assign_reviewers',

    // Organization
    VIEW_ORG_SETTINGS: 'view_org_settings',
    MANAGE_ORG_SETTINGS: 'manage_org_settings',
    EDIT_ORG_PROFILE: 'edit_org_profile',
    UPLOAD_ORG_LOGO: 'upload_org_logo',

    // Members
    VIEW_MEMBERS: 'view_members',
    MANAGE_MEMBER_ROLES: 'manage_member_roles',
    REMOVE_MEMBERS: 'remove_members',
    APPROVE_JOIN_REQUESTS: 'approve_join_requests',
    MANAGE_INVITE_CODES: 'manage_invite_codes',

    // Duties
    VIEW_DUTY_SCHEDULES: 'view_duty_schedules',
    CREATE_DUTY_SCHEDULES: 'create_duty_schedules',
    EDIT_DUTY_SCHEDULES: 'edit_duty_schedules',
    DELETE_DUTY_SCHEDULES: 'delete_duty_schedules',
    ASSIGN_DUTIES: 'assign_duties',
    APPROVE_DUTY_SWAPS: 'approve_duty_swaps',
    MANAGE_DUTY_TEMPLATES: 'manage_duty_templates',

    // Announcements
    VIEW_ANNOUNCEMENTS: 'view_announcements',
    CREATE_ANNOUNCEMENTS: 'create_announcements',
    EDIT_ANNOUNCEMENTS: 'edit_announcements',
    DELETE_ANNOUNCEMENTS: 'delete_announcements',

    // Statistics & Logs
    VIEW_STATISTICS: 'view_statistics',
    VIEW_ACTIVITY_LOGS: 'view_activity_logs',
    EXPORT_DATA: 'export_data',

    // Advanced
    ARCHIVE_ORGANIZATION: 'archive_organization',
    TRANSFER_OWNERSHIP: 'transfer_ownership'
}