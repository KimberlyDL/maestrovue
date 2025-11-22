// stores/permission.js - Optimized permission caching (uses your existing auth)
import { defineStore } from 'pinia'
import axios from '@/utils/api' // Your existing API utils
import { useAuthStore } from './auth'

// Cache validity: 5 minutes (adjust based on your needs)
const CACHE_VALIDITY = 5 * 60 * 1000

// Implicit permissions that ALL members have (no DB check needed)
const IMPLICIT_MEMBER_PERMISSIONS = [
    'view_own_assignments',
    'manage_own_availability',
    'request_duty_swap',
    'check_in_duty',
    'check_out_duty',
    'respond_to_assignment',
    'leave_organization',
    'view_own_statistics',
]

export const usePermissionStore = defineStore('permission', {
    state: () => ({
        // Cache structure: { [orgId]: { permissions, userRole, userId, lastLoaded, loading } }
        cache: {},
        loadingOrgs: new Set(),
        lastInvalidated: {},
    }),

    getters: {
        /**
         * Get cached org data
         */
        getOrg: (state) => (orgId) => {
            return state.cache[orgId] || null
        },

        /**
         * Check if org cache is valid
         */
        isCacheValid: (state) => (orgId) => {
            const cached = state.cache[orgId]
            if (!cached) return false

            const age = Date.now() - cached.lastLoaded
            return age < CACHE_VALIDITY
        },

        /**
         * Check if user is admin in org
         */
        isAdmin: (state) => (orgId) => {
            const org = state.cache[orgId]
            if (!org) return false
            return ['admin'].includes(org.userRole)
        },

        /**
         * Check if user is member of org
         */
        isMember: (state) => (orgId) => {
            const org = state.cache[orgId]
            return !!org?.userRole
        },

        /**
         * Check if user has specific permission
         */
        hasPermission: (state) => (orgId, permission) => {
            if (!permission) return true

            const org = state.cache[orgId]
            if (!org) return false

            if (['admin', 'owner'].includes(org.userRole)) {
                return true
            }

            if (IMPLICIT_MEMBER_PERMISSIONS.includes(permission)) {
                return true
            }

            return org.permissions.includes(permission)
        },


        /**
         * Check if user has any of the given permissions
         */
        hasAnyPermission: (state) => (orgId, permissionList) => {
            if (!permissionList || permissionList.length === 0) return true

            const org = state.cache[orgId]
            if (!org) return false

            if (['admin', 'owner'].includes(org.userRole)) {
                return true
            }

            return permissionList.some(perm => {
                if (IMPLICIT_MEMBER_PERMISSIONS.includes(perm)) return true
                return org.permissions.includes(perm)
            })
        },

        /**
         * Check if user has all of the given permissions
         */
        hasAllPermissions: (state) => (orgId, permissionList) => {
            if (!permissionList || permissionList.length === 0) return true

            const org = state.cache[orgId]
            if (!org) return false

            if (['admin', 'owner'].includes(org.userRole)) {
                return true
            }

            return permissionList.every(perm => {
                if (IMPLICIT_MEMBER_PERMISSIONS.includes(perm)) return true
                return org.permissions.includes(perm)
            })
        },

        /**
         * Get all permissions for org (including implicit)
         */
        getAllPermissions: (state) => (orgId) => {
            const org = state.cache[orgId]
            if (!org) return []

            if (['admin', 'owner'].includes(org.userRole)) {
                return ['*']
            }

            return [...new Set([...org.permissions, ...IMPLICIT_MEMBER_PERMISSIONS])]
        },

        /**
         * Check if currently loading an org
         */
        isLoading: (state) => (orgId) => {
            return state.loadingOrgs.has(orgId)
        },
    },

    actions: {
        /**
         * Load permissions for an organization
         * @param {string|number} orgId - Organization ID
         * @param {boolean} force - Force reload even if cached
         */
        async load(orgId, force = false) {
            if (!orgId) {
                console.warn('Permission load: orgId is required')
                return false
            }

            // Normalize orgId to string
            orgId = String(orgId)

            // Check if already loading
            if (this.loadingOrgs.has(orgId)) {
                console.debug('Permission load: already loading', orgId)
                // Wait for existing load to complete
                return this.waitForLoad(orgId)
            }

            // Check cache validity
            if (!force && this.isCacheValid(orgId)) {
                console.debug('Permission cache hit for org', orgId)
                return true
            }

            // Mark as loading
            this.loadingOrgs.add(orgId)

            try {
                console.debug('Permission load: fetching for org', orgId)

                // Get user's role in organization
                const { data: orgData } = await axios.get(`/api/organizations/${orgId}`)
                const userRole = orgData.user_role
                const userId = orgData.user_id

                if (!userRole) {
                    // User is not a member
                    console.warn('User is not a member of organization', orgId)
                    this.cache[orgId] = {
                        permissions: [],
                        userRole: null,
                        userId: null,
                        lastLoaded: Date.now(),
                    }
                    return false
                }

                let permissions = []

                // Only fetch permissions if not admin (admins have all permissions)
                if (!['admin', 'owner'].includes(userRole)) {
                    try {
                        const { data: permData } = await axios.get(
                            `/api/organizations/${orgId}/permissions/users/${userId}`
                        )

                        // Handle different response formats
                        permissions = permData.granted_permissions || permData.permissions || []

                        console.debug('Loaded permissions for org', orgId, permissions)
                    } catch (permError) {
                        console.error('Failed to load user permissions:', permError)
                        // Continue with empty permissions rather than failing completely
                        permissions = []
                    }
                }

                // Update cache
                this.cache[orgId] = {
                    permissions,
                    userRole,
                    userId,
                    lastLoaded: Date.now(),
                }

                return true
            } catch (error) {
                console.error('Failed to load permissions for org', orgId, error)

                // Clear cache entry on error
                delete this.cache[orgId]

                throw error
            } finally {
                // Remove from loading set
                this.loadingOrgs.delete(orgId)
            }
        },

        /**
         * Wait for an org that's currently loading
         */
        async waitForLoad(orgId, timeout = 5000) {
            const startTime = Date.now()

            while (this.loadingOrgs.has(orgId)) {
                if (Date.now() - startTime > timeout) {
                    throw new Error('Timeout waiting for permission load')
                }
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            return !!this.cache[orgId]
        },

        /**
         * Refresh permissions for an organization
         */
        async refresh(orgId) {
            return this.load(orgId, true)
        },

        /**
         * Clear cache for specific organization
         */
        clearOrg(orgId) {
            if (orgId) {
                orgId = String(orgId)
                delete this.cache[orgId]
                console.debug('Cleared permission cache for org', orgId)
            }
        },

        /**
         * Clear all cached permissions
         */
        clearAll() {
            this.cache = {}
            this.loadingOrgs.clear()
            console.debug('Cleared all permission caches')
        },

        /**
         * Prefetch permissions for multiple orgs
         */
        async prefetchOrgs(orgIds) {
            const promises = orgIds.map(id => this.load(id))
            await Promise.allSettled(promises)
        },

        /**
         * Check cache age for debugging
         */
        getCacheAge(orgId) {
            const cached = this.cache[orgId]
            if (!cached) return null

            const ageMs = Date.now() - cached.lastLoaded
            return {
                ageMs,
                ageSeconds: Math.floor(ageMs / 1000),
                isValid: ageMs < CACHE_VALIDITY,
            }
        },

        /**
         * Get cache stats for debugging
         */
        getCacheStats() {
            const orgs = Object.keys(this.cache)
            return {
                totalOrgs: orgs.length,
                loadingOrgs: Array.from(this.loadingOrgs),
                cacheDetails: orgs.map(orgId => ({
                    orgId,
                    age: this.getCacheAge(orgId),
                    role: this.cache[orgId].userRole,
                    permissionCount: this.cache[orgId].permissions.length,
                })),
            }
        },
    },
})