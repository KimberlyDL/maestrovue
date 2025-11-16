<!-- src\views\org\RequestsInvites.vue -->
<template>
    <div class="min-h-screen bg-slate-900 p-6">
        <div class="max-w-6xl mx-auto">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-white mb-2">Join Requests</h1>
                <p class="text-slate-400">Manage pending club membership requests</p>
            </div>

            <!-- Auto-Accept Settings -->
            <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-1">Auto-Accept Valid Requests</h3>
                        <p class="text-slate-400 text-sm">Automatically accept join requests if the organization code is
                            valid</p>
                    </div>
                    <label class="flex items-center cursor-pointer">
                        <input v-model="autoAcceptEnabled" type="checkbox" @change="updateAutoAcceptSetting"
                            class="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500" />
                        <span class="ml-3 text-white font-medium">{{ autoAcceptEnabled ? 'Enabled' : 'Disabled'
                            }}</span>
                    </label>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex gap-3 mb-6">
                <button @click="filterStatus = 'pending'" :class="[
                    'px-4 py-2 rounded-lg font-medium transition-colors',
                    filterStatus === 'pending'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                ]">
                    Pending ({{ pendingCount }})
                </button>
                <button @click="filterStatus = 'approved'" :class="[
                    'px-4 py-2 rounded-lg font-medium transition-colors',
                    filterStatus === 'approved'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                ]">
                    Approved ({{ approvedCount }})
                </button>
                <button @click="filterStatus = 'declined'" :class="[
                    'px-4 py-2 rounded-lg font-medium transition-colors',
                    filterStatus === 'declined'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                ]">
                    Declined ({{ declinedCount }})
                </button>
            </div>

            <!-- Requests List -->
            <div class="space-y-4">
                <div v-for="request in filteredRequests" :key="request.id"
                    class="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-semibold text-white">{{ request.userName }}</h3>
                            <p class="text-slate-400 text-sm">{{ request.userEmail }}</p>
                        </div>
                        <span :class="[
                            'px-3 py-1 rounded-full text-sm font-medium',
                            request.status === 'pending' && 'bg-yellow-900/30 text-yellow-400',
                            request.status === 'approved' && 'bg-green-900/30 text-green-400',
                            request.status === 'declined' && 'bg-red-900/30 text-red-400'
                        ]">
                            {{ request.status.charAt(0).toUpperCase() + request.status.slice(1) }}
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                            <p class="text-slate-500">Desired Position</p>
                            <p class="text-white font-medium">{{ request.position }}</p>
                        </div>
                        <div>
                            <p class="text-slate-500">Submitted</p>
                            <p class="text-white font-medium">{{ formatDate(request.createdAt) }}</p>
                        </div>
                    </div>

                    <div v-if="request.message" class="mb-4 p-3 bg-slate-700/50 rounded border border-slate-600">
                        <p class="text-slate-300 text-sm">{{ request.message }}</p>
                    </div>

                    <div v-if="request.status === 'pending'" class="flex gap-3">
                        <button @click="approveRequest(request.id)" :disabled="isProcessing"
                            class="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors">
                            Approve
                        </button>
                        <button @click="declineRequest(request.id)" :disabled="isProcessing"
                            class="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors">
                            Decline
                        </button>
                    </div>
                </div>

                <div v-if="filteredRequests.length === 0" class="text-center py-12">
                    <p class="text-slate-400">No {{ filterStatus }} requests found</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const filterStatus = ref('pending')
const autoAcceptEnabled = ref(false)
const isProcessing = ref(false)

const requests = ref([
    {
        id: 1,
        userName: 'John Doe',
        userEmail: 'john@example.com',
        position: 'Member',
        message: 'I would like to join your club to participate in activities.',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
        id: 2,
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        position: 'Coordinator',
        message: 'Interested in helping organize events.',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
        id: 3,
        userName: 'Mike Johnson',
        userEmail: 'mike@example.com',
        position: 'Member',
        message: '',
        status: 'approved',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
        id: 4,
        userName: 'Sarah Williams',
        userEmail: 'sarah@example.com',
        position: 'Officer',
        message: 'Looking to take on leadership role.',
        status: 'declined',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
])

const pendingCount = computed(() => requests.value.filter(r => r.status === 'pending').length)
const approvedCount = computed(() => requests.value.filter(r => r.status === 'approved').length)
const declinedCount = computed(() => requests.value.filter(r => r.status === 'declined').length)

const filteredRequests = computed(() => {
    return requests.value.filter(r => r.status === filterStatus.value)
})

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const approveRequest = (requestId) => {
    isProcessing.value = true
    console.log('[v0] Approving request:', requestId)

    setTimeout(() => {
        const request = requests.value.find(r => r.id === requestId)
        if (request) request.status = 'approved'
        isProcessing.value = false
    }, 500)
}

const declineRequest = (requestId) => {
    isProcessing.value = true
    console.log('[v0] Declining request:', requestId)

    setTimeout(() => {
        const request = requests.value.find(r => r.id === requestId)
        if (request) request.status = 'declined'
        isProcessing.value = false
    }, 500)
}

const updateAutoAcceptSetting = () => {
    console.log('[v0] Auto-accept setting updated:', autoAcceptEnabled.value)
}
</script>
