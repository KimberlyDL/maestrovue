<script setup>
import { ref, computed } from 'vue'
import { Search, CheckCircle, XCircle, Clock } from 'lucide-vue-next'
import { useOpsStore } from '@/stores/ops_store.js'

// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const opsStore = useOpsStore()

const searchQuery = ref('')
const filterStatus = ref('all')

const filteredExcuses = computed(() => {
    return opsStore.excuses.filter(excuse => {
        const matchesSearch = excuse.staffName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            excuse.reason.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesStatus = filterStatus.value === 'all' || excuse.status === filterStatus.value
        return matchesSearch && matchesStatus
    })
})

function getStatusIcon(status) {
    switch (status) {
        case 'approved': return CheckCircle
        case 'rejected': return XCircle
        case 'pending': return Clock
        default: return null
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'approved': return 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-200'
        case 'rejected': return 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-200'
        case 'pending': return 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200'
        default: return 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200'
    }
}

function handleApprove(excuseId) {
    opsStore.approveExcuse(excuseId)
}

function handleReject(excuseId) {
    opsStore.rejectExcuse(excuseId)
}
</script>

<template>
    <div class="space-y-4">
        <!-- Header -->
        <h2 class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">Excuse Requests</h2>

        <!-- Filters -->
        <div class="flex gap-3">
            <div class="flex-1 relative">
                <Search :size="18" class="absolute left-3 top-2.5 text-gray-400" />
                <input v-model="searchQuery" type="text" placeholder="Search by staff or reason..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300" />
            </div>
            <select v-model="filterStatus"
                class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>
        </div>

        <!-- Excuses List -->
        <div class="space-y-3">
            <div v-for="excuse in filteredExcuses" :key="excuse.id"
                class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">

                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h3 class="font-semibold text-abyss-900 dark:text-platinum-300">{{ excuse.staffName }}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ excuse.reason }}</p>
                    </div>
                    <span
                        :class="['px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1', getStatusColor(excuse.status)]">
                        <component :is="getStatusIcon(excuse.status)" :size="14" />
                        {{ excuse.status }}
                    </span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <div>
                        <p class="font-medium">Submitted</p>
                        <p>{{ excuse.submittedAt }}</p>
                    </div>
                    <div v-if="excuse.approvedAt">
                        <p class="font-medium">Approved</p>
                        <p>{{ excuse.approvedAt }}</p>
                    </div>
                </div>

                <div v-if="excuse.status === 'pending'" class="flex gap-2">
                    <button @click="handleApprove(excuse.id)"
                        class="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium">
                        Approve
                    </button>
                    <button @click="handleReject(excuse.id)"
                        class="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium">
                        Reject
                    </button>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredExcuses.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No excuse requests found</p>
        </div>
    </div>
</template>
