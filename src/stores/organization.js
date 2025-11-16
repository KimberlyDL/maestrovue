// src/stores/organization.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOrganizationStore = defineStore('organization', () => {
    const currentOrgId = ref(null)
    const currentOrg = ref(null)

    function setCurrentOrg(orgId, orgData = null) {
        currentOrgId.value = orgId
        currentOrg.value = orgData
        // Optionally save to localStorage for persistence
        if (orgId) {
            localStorage.setItem('current_org_id', orgId)
        } else {
            localStorage.removeItem('current_org_id')
        }
    }

    function clearCurrentOrg() {
        currentOrgId.value = null
        currentOrg.value = null
        localStorage.removeItem('current_org_id')
    }

    // Restore from localStorage on app load
    function restoreCurrentOrg() {
        const savedOrgId = localStorage.getItem('current_org_id')
        if (savedOrgId) {
            currentOrgId.value = savedOrgId
        }
    }

    const hasCurrentOrg = computed(() => !!currentOrgId.value)

    return {
        currentOrgId,
        currentOrg,
        hasCurrentOrg,
        setCurrentOrg,
        clearCurrentOrg,
        restoreCurrentOrg
    }
})