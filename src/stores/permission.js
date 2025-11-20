import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const usePermissionStore = defineStore('permission', () => {
    const allPermissions = ref({})
    const memberPermissions = ref([])
    const loading = ref(false)

    
    // Computed
    const permissionsByCategory = computed(() => allPermissions.value)

    // Fetch all available permissions
    async function fetchAllPermissions() {
        loading.value = true
        try {
            const { data } = await api.get('/api/permissions')
            allPermissions.value = data
            return data
        } catch (error) {
            console.error('Failed to fetch permissions:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // Fetch members with their permissions
    async function fetchMemberPermissions(organizationId) {
        loading.value = true
        try {
            const { data } = await api.get(`/api/organizations/${organizationId}/permissions/members`)
            memberPermissions.value = data
            return data
        } catch (error) {
            console.error('Failed to fetch member permissions:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // Get specific user's permissions
    async function getUserPermissions(organizationId, userId) {
        try {
            const { data } = await api.get(
                `/api/organizations/${organizationId}/permissions/users/${userId}`
            )

            console.log("Permissions fetched for user:", userId, " in org:", organizationId);
        console.log("Raw Permissions Data:", data);
        console.log("Granted Permissions Array:", data.granted_permissions);
        
            return data
        } catch (error) {
            console.error('Failed to fetch user permissions:', error)
            throw error
        }
    }

    // Grant single permission
    async function grantPermission(organizationId, userId, permission) {
        try {
            const { data } = await api.post(
                `/api/organizations/${organizationId}/permissions/users/${userId}/grant`,
                { permission }
            )
            // Update local state
            const member = memberPermissions.value.find(m => m.id === userId)
            if (member) {
                member.permissions = data.permissions
                member.permissions_count = data.permissions.length
            }
            return data
        } catch (error) {
            console.error('Failed to grant permission:', error)
            throw error
        }
    }

    // Revoke single permission
    async function revokePermission(organizationId, userId, permission) {
        try {
            const { data } = await api.post(
                `/api/organizations/${organizationId}/permissions/users/${userId}/revoke`,
                { permission }
            )
            // Update local state
            const member = memberPermissions.value.find(m => m.id === userId)
            if (member) {
                member.permissions = data.permissions
                member.permissions_count = data.permissions.length
            }
            return data
        } catch (error) {
            console.error('Failed to revoke permission:', error)
            throw error
        }
    }

    // Bulk update permissions
    async function bulkUpdatePermissions(organizationId, userId, permissions) {
        try {
            const { data } = await api.post(
                `/api/organizations/${organizationId}/permissions/users/${userId}/bulk`,
                { permissions }
            )
            // Update local state
            const member = memberPermissions.value.find(m => m.id === userId)
            if (member) {
                member.permissions = data.permissions
                member.permissions_count = data.permissions.length
            }
            return data
        } catch (error) {
            console.error('Failed to update permissions:', error)
            throw error
        }
    }

    // Check if user has permission (client-side check)
    function hasPermission(userId, permission) {
        const member = memberPermissions.value.find(m => m.id === userId)
        if (!member) return false
        if (member.is_admin) return true
        return member.permissions.includes(permission)
    }

    // Reset store
    function $reset() {
        allPermissions.value = {}
        memberPermissions.value = []
        loading.value = false
    }

    return {
        // State
        allPermissions,
        memberPermissions,
        loading,

        // Computed
        permissionsByCategory,

        // Actions
        fetchAllPermissions,
        fetchMemberPermissions,
        getUserPermissions,
        grantPermission,
        revokePermission,
        bulkUpdatePermissions,
        hasPermission,
        $reset,
    }
})