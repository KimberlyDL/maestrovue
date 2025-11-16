<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/utils/api'
import { useToast } from '@/utils/useToast'
import {
    RefreshCw, Filter, Calendar, Clock, User, MessageSquare,
    CheckCircle, XCircle, AlertCircle, ArrowRightLeft, Info,
    Search, ThumbsUp, ThumbsDown, XCircle as XCircleIcon, Send
} from 'lucide-vue-next'

const route = useRoute()
const toast = useToast()

const organizationId = computed(() => route.params.id)
const swapRequests = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')

const filterStatus = ref('pending')
const selectedSwap = ref(null)
const showReviewModal = ref(false)
const reviewAction = ref('approve')
const reviewNotes = ref('')
const processingReview = ref(false)

const filteredRequests = computed(() => {
    let filtered = swapRequests.value

    // Filter by status
    if (filterStatus.value !== 'all') {
        filtered = filtered.filter(r => r.status === filterStatus.value)
    }

    // Search
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        filtered = filtered.filter(r =>
            r.duty_assignment?.duty_schedule?.title?.toLowerCase().includes(q) ||
            r.from_officer?.name?.toLowerCase().includes(q) ||
            r.to_officer?.name?.toLowerCase().includes(q)
        )
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const stats = computed(() => {
    return {
        total: swapRequests.value.length,
        pending: swapRequests.value.filter(r => r.status === 'pending').length,
        accepted: swapRequests.value.filter(r => r.status === 'accepted').length,
        declined: swapRequests.value.filter(r => r.status === 'declined').length,
        cancelled: swapRequests.value.filter(r => r.status === 'cancelled').length,
    }
})

onMounted(loadSwapRequests)

async function loadSwapRequests() {
    loading.value = true
    error.value = ''
    try {
        const { data } = await axios.get(`/api/org/${organizationId.value}/duty-swaps`)
        swapRequests.value = data.data || data
    } catch (e) {
        console.error('Failed to load swap requests:', e)
        error.value = e?.response?.data?.message || 'Failed to load swap requests'
    } finally {
        loading.value = false
    }
}

function openReviewModal(swap, action) {
    selectedSwap.value = swap
    reviewAction.value = action
    reviewNotes.value = ''
    showReviewModal.value = true
}

async function submitReview() {
    if (!selectedSwap.value) return

    processingReview.value = true
    try {
        await axios.post(
            `/api/org/${organizationId.value}/duty-swaps/${selectedSwap.value.id}/review`,
            {
                action: reviewAction.value,
                review_notes: reviewNotes.value || null
            }
        )
        toast.success(`Swap request ${reviewAction.value}d successfully`)
        showReviewModal.value = false
        selectedSwap.value = null
        reviewNotes.value = ''
        await loadSwapRequests()
    } catch (e) {
        console.error('Failed to review swap:', e)
        toast.error(e?.response?.data?.message || 'Failed to review swap request')
    } finally {
        processingReview.value = false
    }
}

function getStatusColor(status) {
    const colors = {
        pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        accepted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    }
    return colors[status] || colors.pending
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

function formatDateTime(dateStr) {
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })
}

function formatTime(timeStr) {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
}
</script>

<template>
    <div class="h-full flex flex-col gap-8">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                    <ArrowRightLeft class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Duty Swap Management
                </h1>
                <p class="text-sm text-gray-600 dark:text-platinum-400">
                    Review and manage all officer duty swap requests
                </p>
            </div>
            <button @click="loadSwapRequests"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 shadow-sm transition-colors hover:scale-[1.02] active:scale-[0.98]">
                <RefreshCw class="w-4 h-4" />
                Refresh
            </button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div class="p-4 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                <p class="text-xs text-gray-600 dark:text-platinum-400">Total</p>
                <p class="text-3xl font-bold text-gray-800 dark:text-platinum-100">{{ stats.total }}</p>
            </div>
            <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-300 dark:border-amber-900/50 shadow-lg">
                <p class="text-xs text-amber-700 dark:text-amber-400">Pending</p>
                <p class="text-3xl font-bold text-amber-900 dark:text-amber-300">{{ stats.pending }}</p>
            </div>
            <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-300 dark:border-emerald-900/50 shadow-lg">
                <p class="text-xs text-emerald-700 dark:text-emerald-400">Accepted</p>
                <p class="text-3xl font-bold text-emerald-900 dark:text-emerald-300">{{ stats.accepted }}</p>
            </div>
            <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-300 dark:border-red-900/50 shadow-lg">
                <p class="text-xs text-red-700 dark:text-red-400">Declined</p>
                <p class="text-3xl font-bold text-red-900 dark:text-red-300">{{ stats.declined }}</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-xl border border-gray-300 dark:border-gray-900/50 shadow-lg">
                <p class="text-xs text-gray-700 dark:text-gray-400">Cancelled</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-gray-300">{{ stats.cancelled }}</p>
            </div>
        </div>

        <div class="flex items-center gap-4 p-4 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
            <div class="relative flex-1">
                <Search class="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-platinum-600" />
                <input v-model="searchQuery" type="text" placeholder="Search swap requests..."
                    class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600 text-sm" />
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
                <Filter class="w-5 h-5 text-gray-600 dark:text-platinum-400" />
            </div>
            <select v-model="filterStatus"
                class="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600 text-sm">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="cancelled">Cancelled</option>
            </select>
        </div>

        <div v-if="error"
            class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-300 dark:border-red-900/50 shadow-md">
            <div class="flex items-center gap-2 text-red-700 dark:text-red-400">
                <XCircleIcon class="w-5 h-5" />
                <p class="text-sm font-medium">{{ error }}</p>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto space-y-4">
            <div v-if="loading" class="text-center py-12">
                <RefreshCw class="h-8 w-8 animate-spin mx-auto text-kaitoke-green-600 dark:text-kaitoke-green-400" />
            </div>

            <div v-else-if="filteredRequests.length === 0" class="text-center py-12 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                <ArrowRightLeft class="h-12 w-12 mx-auto text-gray-400 dark:text-platinum-600 mb-4" />
                <p class="text-gray-600 dark:text-platinum-400">No swap requests found.</p>
            </div>

            <div v-else class="space-y-4">
                <div v-for="swap in filteredRequests" :key="swap.id"
                    class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 hover:border-kaitoke-green-500 shadow-md transition hover:scale-[1.005]">

                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-100">
                                    {{ swap.duty_assignment?.duty_schedule?.title || 'Untitled Duty' }}
                                </h3>
                                <span class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                                    :class="getStatusColor(swap.status)">
                                    {{ swap.status }}
                                </span>
                            </div>
                            <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-platinum-400">
                                <span>From: <strong class="text-gray-800 dark:text-platinum-200">
                                        {{ swap.from_officer?.name || 'Unknown' }}
                                    </strong></span>
                                <span v-if="swap.to_officer">
                                    To: <strong class="text-gray-800 dark:text-platinum-200">
                                        {{ swap.to_officer?.name }}
                                    </strong>
                                </span>
                                <span v-else class="text-amber-600 dark:text-amber-400 font-medium">
                                    Open to anyone
                                </span>
                            </div>
                        </div>
                        <div class="flex gap-2 flex-shrink-0">
                            <button v-if="swap.status === 'pending'" @click="openReviewModal(swap, 'approve')"
                                class="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors hover:scale-[1.05] active:scale-[0.98]">
                                <ThumbsUp class="w-5 h-5" />
                            </button>
                            <button v-if="swap.status === 'pending'" @click="openReviewModal(swap, 'decline')"
                                class="p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors hover:scale-[1.05] active:scale-[0.98]">
                                <ThumbsDown class="w-5 h-5" />
                            </button>
                            <button v-else @click="openReviewModal(swap, 'view')"
                                class="p-2 rounded-xl text-gray-600 dark:text-platinum-400 hover:bg-gray-100 dark:hover:bg-abyss-700 transition-colors hover:scale-[1.05] active:scale-[0.98]">
                                <Info class="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div
                        class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 dark:bg-abyss-700 rounded-xl border border-gray-200 dark:border-abyss-600 shadow-inner">
                        <div>
                            <p class="text-xs text-gray-600 dark:text-platinum-400 mb-1">Duty Date</p>
                            <div class="flex items-center gap-2 text-sm">
                                <Calendar class="w-4 h-4 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                                <span class="font-medium text-gray-800 dark:text-platinum-100">
                                    {{ formatDate(swap.duty_assignment?.duty_schedule?.date) }}
                                </span>
                            </div>
                        </div>

                        <div>
                            <p class="text-xs text-gray-600 dark:text-platinum-400 mb-1">Time</p>
                            <div class="flex items-center gap-2 text-sm">
                                <Clock class="w-4 h-4 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                                <span class="font-medium text-gray-800 dark:text-platinum-100">
                                    {{ formatTime(swap.duty_assignment?.duty_schedule?.start_time) }} -
                                    {{ formatTime(swap.duty_assignment?.duty_schedule?.end_time) }}
                                </span>
                            </div>
                        </div>

                        <div>
                            <p class="text-xs text-gray-600 dark:text-platinum-400 mb-1">Requested</p>
                            <div class="flex items-center gap-2 text-sm">
                                <User class="w-4 h-4 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                                <span class="font-medium text-gray-800 dark:text-platinum-100">
                                    {{ formatDateTime(swap.created_at) }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-300 dark:border-blue-700/50">
                        <div class="flex items-start gap-2 text-sm">
                            <MessageSquare class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <div class="flex-1">
                                <p class="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1">Reason</p>
                                <p class="text-blue-900 dark:text-blue-300">{{ swap.reason }}</p>
                            </div>
                        </div>
                    </div>

                    <div v-if="swap.review_notes" class="mb-4 p-3 bg-gray-50 dark:bg-abyss-700 rounded-xl border border-gray-300 dark:border-abyss-600">
                        <div class="flex items-start gap-2 text-sm">
                            <AlertCircle class="w-4 h-4 text-gray-600 dark:text-platinum-400 mt-0.5 shrink-0" />
                            <div class="flex-1">
                                <p class="text-xs text-gray-700 dark:text-platinum-300 font-medium mb-1">
                                    Admin Review
                                </p>
                                <p class="text-gray-800 dark:text-platinum-200">{{ swap.review_notes }}</p>
                                <p v-if="swap.reviewer" class="text-xs text-gray-600 dark:text-platinum-400 mt-1">
                                    by {{ swap.reviewer?.name }} on {{ formatDateTime(swap.reviewed_at) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showReviewModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div class="bg-white dark:bg-abyss-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-abyss-700">
                <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-abyss-700">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-platinum-50">
                        {{ reviewAction === 'approve' ? 'Approve' : (reviewAction === 'decline' ? 'Decline' : 'View') }} Swap Request
                    </h3>
                    <button @click="showReviewModal = false"
                        class="p-2 hover:bg-gray-100 dark:hover:bg-abyss-800 rounded-lg text-gray-700 dark:text-platinum-300">
                        <XCircleIcon class="w-5 h-5" />
                    </button>
                </div>

                <div class="p-6 space-y-4">
                    <div class="p-3 bg-gray-50 dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700">
                        <p class="text-sm font-medium text-gray-800 dark:text-platinum-100 mb-1">
                            {{ selectedSwap?.duty_assignment?.duty_schedule?.title }}
                        </p>
                        <p class="text-xs text-gray-600 dark:text-platinum-400">
                            From: {{ selectedSwap?.from_officer?.name }}
                            <span v-if="selectedSwap?.to_officer">
                                → To: {{ selectedSwap?.to_officer?.name }}
                            </span>
                        </p>
                    </div>

                    <div v-if="reviewAction !== 'view'">
                        <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                            Admin Notes (Optional)
                        </label>
                        <textarea v-model="reviewNotes" rows="4"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-800 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600"
                            :placeholder="`Add notes about this ${reviewAction}...`"></textarea>
                    </div>

                    <div v-else>
                        <h4 class="text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">Review Status</h4>
                        <div class="p-3 rounded-xl"
                            :class="getStatusColor(selectedSwap?.status)">
                            <p class="text-sm font-semibold uppercase">{{ selectedSwap?.status }}</p>
                            <p v-if="selectedSwap?.review_notes" class="text-xs mt-1">{{ selectedSwap.review_notes }}</p>
                        </div>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button @click="showReviewModal = false"
                            class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 font-medium transition-colors hover:scale-[1.02] active:scale-[0.98]">
                            {{ reviewAction === 'view' ? 'Close' : 'Cancel' }}
                        </button>
                        <button v-if="reviewAction !== 'view'" @click="submitReview" :disabled="processingReview"
                            :class="reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'"
                            class="flex-1 px-4 py-2.5 rounded-xl text-white font-semibold shadow-md transition-colors disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]">
                            {{ processingReview ? 'Processing...' : (reviewAction === 'approve' ? 'Approve' : 'Decline')
                            }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>