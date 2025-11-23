// stores/organization.js
import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useOrganizationStore = defineStore('organization', {
    state: () => ({
        organizations: {},
        currentOrgId: null,
        loading: false,
        error: null
    }),

    getters: {
        getOrganization: (state) => (orgId) => {
            return state.organizations[orgId] || null
        },

        currentOrganization: (state) => {
            return state.currentOrgId ? state.organizations[state.currentOrgId] : null
        },

        allOrganizations: (state) => {
            return Object.values(state.organizations)
        }
    },

    actions: {
        setCurrentOrg(orgId, orgData = null) {
            this.currentOrgId = String(orgId)

            // Store in localStorage
            try {
                localStorage.setItem('currentOrgId', this.currentOrgId)
            } catch (e) {
                console.warn('Failed to save currentOrgId to localStorage:', e)
            }

            // If org data is provided, cache it
            if (orgData) {
                this.organizations[this.currentOrgId] = orgData
            }
        },

        restoreCurrentOrg() {
            try {
                const savedOrgId = localStorage.getItem('currentOrgId')
                if (savedOrgId) {
                    this.currentOrgId = savedOrgId
                    return savedOrgId
                }
            } catch (e) {
                console.warn('Failed to restore currentOrgId from localStorage:', e)
            }
            return null
        },

        clearCurrentOrg() {
            this.currentOrgId = null
            try {
                localStorage.removeItem('currentOrgId')
            } catch (e) {
                console.warn('Failed to remove currentOrgId from localStorage:', e)
            }
        },

        async fetchOrganization(orgId, force = false) {
            orgId = String(orgId)

            // Return cached if available and not forcing
            if (!force && this.organizations[orgId]) {
                return this.organizations[orgId]
            }

            this.loading = true
            this.error = null

            try {
                const { data } = await api.get(`/api/organizations/${orgId}`)

                // Cache the organization
                this.organizations[orgId] = data

                return data
            } catch (error) {
                console.error('Failed to fetch organization:', error)
                this.error = error.response?.data?.message || 'Failed to load organization'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchMyOrganizations() {
            this.loading = true
            this.error = null

            try {
                const { data } = await api.get('/api/organizations?scope=mine')

                // Cache all organizations
                data.forEach(org => {
                    this.organizations[org.id] = org
                })

                return data
            } catch (error) {
                console.error('Failed to fetch my organizations:', error)
                this.error = error.response?.data?.message || 'Failed to load organizations'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchOtherOrganizations() {
            try {
                const { data } = await api.get('/api/organizations?scope=others')

                // Cache these organizations too
                data.forEach(org => {
                    this.organizations[org.id] = org
                })

                return data
            } catch (error) {
                console.error('Failed to fetch other organizations:', error)
                throw error
            }
        },

        updateOrganizationCache(orgId, updates) {
            orgId = String(orgId)

            if (this.organizations[orgId]) {
                this.organizations[orgId] = {
                    ...this.organizations[orgId],
                    ...updates
                }
            }
        },

        clearCache(orgId = null) {
            if (orgId) {
                delete this.organizations[String(orgId)]
            } else {
                this.organizations = {}
            }
        }
    }
})