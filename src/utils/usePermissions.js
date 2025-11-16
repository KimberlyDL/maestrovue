import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'

/**
 * Vue composable for checking user permissions in the current organization
 */
export const usePermissions = () => {
    const authStore = useAuthStore()
    const orgStore = useOrganizationStore()

    const currentUser = computed(() => authStore.user)
    const currentOrg = computed(() => orgStore.currentOrganization)

    /**
     * Check if current user is admin/owner (has all permissions)
     */
    const isAdmin = computed(() => {
        if (!currentOrg.value || !currentUser.value) return false
        const role = currentOrg.value.user_role
        return ['admin', 'owner'].includes(role)
    })

    /**
     * Get user's role in current organization
     */
    const userRole = computed(() => {
        return currentOrg.value?.user_role || null
    })

    /**
     * Check if user has a specific permission
     * @param {string} permission - Permission name (e.g., 'manage_members')
     * @returns {boolean}
     */
    const hasPermission = (permission) => {
        if (!currentOrg.value || !currentUser.value) return false

        // Admins have all permissions
        if (isAdmin.value) return true

        // Check if user has the specific permission
        const userPermissions = currentOrg.value.user_permissions || []
        return userPermissions.includes(permission)
    }

    /**
     * Check if user has ANY of the given permissions
     * @param {string[]} permissions - Array of permission names
     * @returns {boolean}
     */
    const hasAnyPermission = (permissions) => {
        if (!currentOrg.value || !currentUser.value) return false
        if (isAdmin.value) return true

        return permissions.some(permission => hasPermission(permission))
    }

    /**
     * Check if user has ALL of the given permissions
     * @param {string[]} permissions - Array of permission names
     * @returns {boolean}
     */
    const hasAllPermissions = (permissions) => {
        if (!currentOrg.value || !currentUser.value) return false
        if (isAdmin.value) return true

        return permissions.every(permission => hasPermission(permission))
    }

    /**
     * Permission checks for specific features
     */
    const can = {
        // Members
        manageMembers: computed(() => hasPermission('manage_members')),
        approveJoinRequests: computed(() => hasPermission('approve_join_requests')),
        manageInvites: computed(() => hasPermission('manage_invites')),

        // Documents
        manageDocuments: computed(() => hasPermission('manage_documents')),
        uploadDocuments: computed(() => hasPermission('upload_documents')),
        deleteDocuments: computed(() => hasPermission('delete_documents')),

        // Reviews
        createReviews: computed(() => hasPermission('create_reviews')),
        manageReviews: computed(() => hasPermission('manage_reviews')),

        // Announcements
        createAnnouncements: computed(() => hasPermission('create_announcements')),
        manageAnnouncements: computed(() => hasPermission('manage_announcements')),

        // Duty
        manageDutySchedules: computed(() => hasPermission('manage_duty_schedules')),
        assignDutyOfficers: computed(() => hasPermission('assign_duty_officers')),
        approveDutySwaps: computed(() => hasPermission('approve_duty_swaps')),

        // Settings
        manageSettings: computed(() => hasPermission('manage_settings')),
        viewStatistics: computed(() => hasPermission('view_statistics')),
    }

    return {
        // State
        isAdmin,
        userRole,

        // Methods
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,

        // Specific checks
        can,
    }
}