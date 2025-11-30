<template>
    <div class="space-y-6">
        <h2 class="text-2xl font-semibold text-platinum-50">Organizations</h2>

        <div class="mb-6">
            <div class="flex gap-2 bg-abyss-800 p-1 rounded-lg border border-abyss-700 inline-flex">
                <button @click="activeListTab = 'mine'" :class="['px-4 py-2 rounded-md text-sm font-medium transition-all', activeListTab === 'mine'
                    ? 'bg-kaitoke-green-600 text-abyss-900'
                    : 'text-platinum-400 hover:text-platinum-50']">
                    My Organizations
                </button>
                <button @click="activeListTab = 'browse'" :class="['px-4 py-2 rounded-md text-sm font-medium transition-all', activeListTab === 'browse'
                    ? 'bg-kaitoke-green-600 text-abyss-900'
                    : 'text-platinum-400 hover:text-platinum-50']">
                    Browse Organizations
                </button>
            </div>
        </div>

        <div v-if="activeListTab === 'mine'">
            <MyOrganizations :organizations="myOrgs" :loading="loadingMyOrgs" @view-org="viewOrg" />
            <div v-if="!loadingMyOrgs && myOrgs.length === 0"
                class="p-6 bg-abyss-800 border border-abyss-700 rounded-lg text-center text-platinum-400">
                You haven't joined any organizations yet.
            </div>
        </div>

        <div v-else-if="activeListTab === 'browse'">
            <BrowseOrganizations :organizations="otherOrgs" :loading="loadingAllOrgs" @view-org="viewOrg"
                @request-join="requestJoinOrg" />
            <div v-if="!loadingAllOrgs && otherOrgs.length === 0"
                class="p-6 bg-abyss-800 border border-abyss-700 rounded-lg text-center text-platinum-400">
                No other organizations available to join.
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/api'
import { useToast } from '@/utils/useToast'

import MyOrganizations from '@components/user/MyOrganizations.vue' // Assuming this path is correct
import BrowseOrganizations from '@components/user/BrowseOrganizations.vue' // Assuming this path is correct

const router = useRouter()
const toast = useToast()
const activeListTab = ref('mine') // default to My Organizations

// Data
const myOrgs = ref([])
const allOrgs = ref([])

// Loading states
const loadingMyOrgs = ref(false)
const loadingAllOrgs = ref(false)

// Computed
const otherOrgs = computed(() => {
    const myOrgIds = myOrgs.value.map(org => org.id)
    return allOrgs.value.filter(org => !myOrgIds.includes(org.id))
})

// Load data
onMounted(async () => {
    await Promise.all([
        loadMyOrganizations(),
        loadAllOrganizations(),
    ])
})

async function loadMyOrganizations() {
    loadingMyOrgs.value = true
    try {
        const { data } = await axios.get('/api/organizations', { params: { scope: 'mine' } })
        myOrgs.value = data
    } catch (error) {
        console.error('Failed to load my organizations:', error)
    } finally {
        loadingMyOrgs.value = false
    }
}

async function loadAllOrganizations() {
    loadingAllOrgs.value = true
    try {
        const { data } = await axios.get('/api/organizations', { params: { scope: 'others' } })
        allOrgs.value = data
    } catch (error) {
        console.error('Failed to load all organizations:', error)
    } finally {
        loadingAllOrgs.value = false
    }
}

// Actions
function viewOrg(orgId) {
    router.push({ name: 'orgs.org', params: { id: orgId } })
}

async function requestJoinOrg(org) {
    try {
        await axios.post('/api/organizations/join/request', {
            organization_name: org.name
        })
        toast.success(`Join request sent to ${org.name}`)
        // Optionally, reload requests or update the UI
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send request')
    }
}
</script>