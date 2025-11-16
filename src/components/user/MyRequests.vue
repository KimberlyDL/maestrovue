<!-- src/components/user/MyRequests.vue -->
<template>
    <div>
        <div class="flex items-center justify-between mb-4">
            <!-- Updated heading colors for light and dark mode -->
            <h2 class="text-xl font-semibold text-abyss-900 dark:text-platinum-50">My Join Requests</h2>
            <div class="flex gap-2">
                <button v-for="status in statuses" :key="status.key" @click="filterStatus = status.key" :class="[
                    'px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
                    filterStatus === status.key
                        ? 'bg-kaitoke-green-600 text-abyss-900'
                        : 'border border-sun-200 dark:border-abyss-700 text-abyss-700 dark:text-platinum-400 hover:text-abyss-900 dark:hover:text-platinum-50'
                ]">
                    {{ status.label }}
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-kaitoke-green-600"></div>
            <span class="ml-3 text-abyss-700 dark:text-platinum-400">Loading requests...</span>
        </div>

        <!-- Empty State -->
        <!-- Updated empty state styling for light and dark mode -->
        <div v-else-if="!filteredRequests.length"
            class="text-center py-12 bg-sun-50 dark:bg-abyss-800 rounded-lg border border-sun-200 dark:border-abyss-700">
            <div class="text-4xl mb-3">📝</div>
            <p class="text-abyss-700 dark:text-platinum-400">No {{ filterStatus === 'all' ? '' : filterStatus }}
                requests found</p>
        </div>

        <!-- Requests List -->
        <div v-else class="space-y-4">
            <!-- Updated card styling with light and dark mode colors -->
            <div v-for="request in filteredRequests" :key="request.id"
                class="rounded-lg border border-sun-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-5 hover:border-kaitoke-green-400 dark:hover:border-kaitoke-green-700/50 transition-colors">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50 mb-1">{{
                            request.organization_name }}</h3>
                        <div class="flex items-center gap-3 text-sm text-abyss-700 dark:text-platinum-400">
                            <span>📅 {{ formatDate(request.created_at) }}</span>
                            <span v-if="request.updated_at !== request.created_at">
                                • Updated {{ formatDate(request.updated_at) }}
                            </span>
                        </div>
                    </div>
                    <span :class="[
                        'px-3 py-1 text-xs rounded-full font-medium',
                        request.status === 'pending' && 'bg-yellow-900/30 text-yellow-300 border border-yellow-700/50',
                        request.status === 'approved' && 'bg-green-900/30 text-green-300 border border-green-700/50',
                        request.status === 'declined' && 'bg-rose-900/30 text-rose-300 border border-rose-700/50'
                    ]">
                        {{ request.status.charAt(0).toUpperCase() + request.status.slice(1) }}
                    </span>
                </div>

                <!-- Updated message box styling for light and dark mode -->
                <div v-if="request.message"
                    class="mb-3 p-3 bg-sun-100 dark:bg-abyss-700/50 rounded border border-sun-200 dark:border-abyss-600">
                    <p class="text-abyss-800 dark:text-platinum-300 text-sm">{{ request.message }}</p>
                </div>

                <!-- Updated admin note styling for light and dark mode -->
                <div v-if="request.admin_note && request.status !== 'pending'" class="mb-3 p-3 rounded border"
                    :class="request.status === 'approved' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700/50'">
                    <p class="text-xs text-abyss-700 dark:text-platinum-500 mb-1">Admin Response:</p>
                    <p class="text-abyss-800 dark:text-platinum-300 text-sm">{{ request.admin_note }}</p>
                </div>

                <div class="flex gap-2">
                    <!-- Updated button styling for light and dark mode -->
                    <button v-if="request.status === 'pending'" @click="$emit('cancel-request', request.id)"
                        class="px-4 py-2 text-sm rounded-md border border-rose-200 dark:border-rose-700/50 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors">
                        Cancel Request
                    </button>
                    <button v-if="request.status === 'declined'" @click="$emit('resubmit-request', request)"
                        class="px-4 py-2 text-sm rounded-md border border-sun-200 dark:border-platinum-700 text-abyss-900 dark:text-platinum-200 hover:bg-sun-100 dark:hover:bg-abyss-700 transition-colors">
                        Resubmit
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    requests: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false }
})

defineEmits(['cancel-request', 'resubmit-request'])

const statuses = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'declined', label: 'Declined' }
]

const filterStatus = ref('all')

const filteredRequests = computed(() => {
    if (filterStatus.value === 'all') return props.requests
    return props.requests.filter(req => req.status === filterStatus.value)
})

function formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
