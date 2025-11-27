<!-- src/views/user/Dashboard.vue -->
<template>
    <div class="min-h-screen bg-abyss-900">
        <!-- Header -->
        <header class="border-b border-abyss-700 bg-abyss-800">
            <div class="max-w-7xl mx-auto px-6 py-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-platinum-50">Dashboard</h1>
                        <p class="text-platinum-500 text-sm">Welcome back, {{ user?.name }}</p>
                    </div>
                    <div class="flex gap-3">
                        <button @click="showCreateOrgModal = true"
                            class="px-4 py-2 rounded-md bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-abyss-900 font-medium">
                            Create Organization
                        </button>
                        <button @click="showJoinOrgModal = true"
                            class="px-4 py-2 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-700">
                            Join Organization
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-6 py-6">
            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="My Organizations" :value="myOrgs.length" icon="🏢" />
                <StatCard title="Pending Requests" :value="pendingRequests" icon="⏳" />
                <StatCard title="Announcements" :value="announcements.length" icon="📢" />
                <StatCard title="All Organizations" :value="allOrgs.length" icon="🌐" />
            </div>

            <!-- Tabs -->
            <div class="mb-6">
                <div class="flex gap-2 bg-abyss-800 p-1 rounded-lg border border-abyss-700 inline-flex">
                    <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" :class="['px-4 py-2 rounded-md text-sm font-medium transition-all', activeTab === tab.key
                        ? 'bg-kaitoke-green-600 text-abyss-900'
                        : 'text-platinum-400 hover:text-platinum-50']">
                        {{ tab.label }}
                    </button>
                </div>
            </div>

            <!-- Tab Content -->
            <div class="space-y-6">
                <!-- Announcements Tab -->
                <div v-if="activeTab === 'announcements'">
                    <AnnouncementsList :announcements="announcements" :loading="loadingAnnouncements" />
                </div>

                <!-- My Organizations Tab -->
                <div v-else-if="activeTab === 'my-orgs'">
                    <MyOrganizations :organizations="myOrgs" :loading="loadingMyOrgs" @view-org="viewOrg" />
                </div>

                <!-- Browse Organizations Tab -->
                <div v-else-if="activeTab === 'browse'">
                    <BrowseOrganizations :organizations="otherOrgs" :loading="loadingAllOrgs" @view-org="viewOrg"
                        @request-join="requestJoinOrg" />
                </div>

                <!-- My Requests Tab -->
                <div v-else-if="activeTab === 'requests'">
                    <MyRequests :requests="myRequests" :loading="loadingRequests" @cancel-request="cancelRequest" />
                </div>
            </div>
        </div>

        <!-- Modals -->
        <JoinOrgModal v-if="showJoinOrgModal" @close="showJoinOrgModal = false" @joined="handleOrgJoined" />
        <CreateOrgModal v-if="showCreateOrgModal" @close="showCreateOrgModal = false" @created="handleOrgCreated" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/api'
import { useAuthStore } from '@stores/auth'

import StatCard from '@components/user/StatCard.vue'
import AnnouncementsList from '@components/user/AnnouncementsList.vue'
import MyOrganizations from '@components/user/MyOrganizations.vue'
import BrowseOrganizations from '@components/user/BrowseOrganizations.vue'
import MyRequests from '@components/user/MyRequests.vue'
import JoinOrgModal from '@components/user/JoinOrgModal.vue'
import CreateOrgModal from '@components/user/CreateOrgModal.vue'

const router = useRouter()
const auth = useAuthStore()
const user = computed(() => auth.user)

const tabs = [
    { key: 'announcements', label: 'Announcements' },
    { key: 'my-orgs', label: 'My Organizations' },
    { key: 'browse', label: 'Browse Organizations' },
    { key: 'requests', label: 'My Requests' }
]

const activeTab = ref('announcements')
const showJoinOrgModal = ref(false)
const showCreateOrgModal = ref(false)

// Data
const myOrgs = ref([])
const allOrgs = ref([])
const announcements = ref([])
const myRequests = ref([])

// Loading states
const loadingMyOrgs = ref(false)
const loadingAllOrgs = ref(false)
const loadingAnnouncements = ref(false)
const loadingRequests = ref(false)

// Computed
const otherOrgs = computed(() => {
    const myOrgIds = myOrgs.value.map(org => org.id)
    return allOrgs.value.filter(org => !myOrgIds.includes(org.id))
})

const pendingRequests = computed(() => {
    return myRequests.value.filter(req => req.status === 'pending').length
})

// Load data
onMounted(async () => {
    await Promise.all([
        loadMyOrganizations(),
        loadAllOrganizations(),
        loadAnnouncements(),
        loadMyRequests()
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

async function loadAnnouncements() {
    loadingAnnouncements.value = true
    try {
        const { data } = await axios.get('/api/announcements')
        announcements.value = data

        console.log(data)
    } catch (error) {
        console.error('Failed to load announcements:', error)
        // Mock data for now
        announcements.value = []
    } finally {
        loadingAnnouncements.value = false
    }
}

async function loadMyRequests() {
    loadingRequests.value = true
    try {
        const { data } = await axios.get('/api/organizations/my-requests')
        myRequests.value = data
    } catch (error) {
        console.error('Failed to load requests:', error)
        // Mock data for now
        myRequests.value = []
    } finally {
        loadingRequests.value = false
    }
}

// Actions
function viewOrg(orgId) {
    router.push({ name: 'orgs.detail', params: { id: orgId } })
}

async function requestJoinOrg(org) {
    try {
        await axios.post('/api/organizations/join/request', {
            organization_name: org.name
        })
        alert(`Join request sent to ${org.name}`)
        await loadMyRequests()
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to send request')
    }
}

async function cancelRequest(requestId) {
    try {
        await axios.delete(`/api/organizations/requests/${requestId}`)
        await loadMyRequests()
    } catch (error) {
        alert('Failed to cancel request')
    }
}

function handleOrgJoined() {
    showJoinOrgModal.value = false
    loadMyOrganizations()
    loadAllOrganizations()
}

function handleOrgCreated() {
    showCreateOrgModal.value = false
    loadMyOrganizations()
    activeTab.value = 'my-orgs'
}
</script>