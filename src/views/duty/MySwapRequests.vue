<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from '@/utils/api'
import { useToast } from '@/utils/useToast'
import {
    RefreshCw, Filter, Calendar, Clock, User, MessageSquare,
    CheckCircle, XCircle, AlertCircle, ArrowRightLeft, Edit2, Trash2, Send, Info, XCircle as XCircleIcon
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const organizationId = computed(() => route.params.id)
const swapRequests = ref([])
const loading = ref(false)
const error = ref('')

const filterStatus = ref('all')
const showEditModal = ref(false)
const selectedSwap = ref(null)
const editForm = ref({
    to_officer_id: null,
    reason: ''
})
const officers = ref([])

const filteredRequests = computed(() => {
    let filtered = swapRequests.value.filter(r => r.from_officer_id === authStore.user.id)

    if (filterStatus.value !== 'all') {
        filtered = filtered.filter(r => r.status === filterStatus.value)
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const stats = computed(() => {
    const myRequests = swapRequests.value.filter(r => r.from_officer_id === authStore.user.id)
    return {
        total: myRequests.length,
        pending: myRequests.filter(r => r.status === 'pending').length,
        accepted: myRequests.filter(r => r.status === 'accepted').length,
        declined: myRequests.filter(r => r.status === 'declined').length,
        cancelled: myRequests.filter(r => r.status === 'cancelled').length,
    }
})

onMounted(async () => {
    await loadSwapRequests()
    await loadOfficers()
})

async function loadSwapRequests() {
    loading.value = true
    error.value = ''
    try {
        const { data } = await axios.get(`/api/org/${organizationId.value}/duty-swaps`, {
            params: { member_view: true }
        })
        swapRequests.value = data.data || data
    } catch (e) {
        error.value = e?.response?.data?.message || 'Failed to load swap requests'
        toast.error(error.value)
    } finally {
        loading.value = false
    }
}

async function loadOfficers() {
    try {
        // Assuming members endpoint also contains officers
        const { data } = await axios.get(`/api/organizations/${organizationId.value}/members`)
        officers.value = data.filter(o => o.id !== authStore.user.id)
    } catch (error) {
        console.error('Failed to load officers:', error)
    }
}

function openEditModal(swap) {
    selectedSwap.value = swap
    editForm.value = {
        to_officer_id: swap.to_officer_id,
        reason: swap.reason
    }
    showEditModal.value = true
}

async function saveEdit() {
    if (!editForm.value.reason.trim()) {
        toast.error('Please provide a reason')
        return
    }

    try {
        // Since there's no official update endpoint, we'll cancel and create new
        await axios.post(`/api/org/${organizationId.value}/duty-swaps/${selectedSwap.value.id}/cancel`)

        await axios.post(
            `/api/org/${organizationId.value}/duty-assignments/${selectedSwap.value.duty_assignment_id}/swap`,
            editForm.value
        )

        toast.success('Swap request updated successfully')
        showEditModal.value = false
        await loadSwapRequests()
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to update swap request')
    }
}

async function cancelSwap(swapId) {
    if (!confirm('Are you sure you want to cancel this swap request?')) return

    try {
        await axios.post(`/api/org/${organizationId.value}/duty-swaps/${swapId}/cancel`)
        toast.success('Swap request cancelled')
        await loadSwapRequests()
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to cancel swap')
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
    <div class="max-w-7xl px-4 sm:px-6 py-6 lg:px-8">
        <div class="h-full flex flex-col gap-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                        My Swap Requests
                    </h1>
                    <p class="text-sm text-gray-600 dark:text-platinum-400">
                        Manage your duty swap requests
                    </p>
                </div>
                <button @click="loadSwapRequests"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 shadow-sm transition-colors hover:-translate-y-0.5 active:translate-y-0">
                    <RefreshCw class="w-4 h-4" />
                    Refresh
                </button>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div
                    class="p-4 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                    <p class="text-xs text-gray-600 dark:text-platinum-400">Total</p>
                    <p class="text-3xl font-bold text-gray-800 dark:text-platinum-100">{{ stats.total }}</p>
                </div>
                <div
                    class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-300 dark:border-amber-900/50 shadow-lg">
                    <p class="text-xs text-amber-700 dark:text-amber-400">Pending</p>
                    <p class="text-3xl font-bold text-amber-900 dark:text-amber-300">{{ stats.pending }}</p>
                </div>
                <div
                    class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-300 dark:border-emerald-900/50 shadow-lg">
                    <p class="text-xs text-emerald-700 dark:text-emerald-400">Accepted</p>
                    <p class="text-3xl font-bold text-emerald-900 dark:text-emerald-300">{{ stats.accepted }}</p>
                </div>
                <div
                    class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-300 dark:border-red-900/50 shadow-lg">
                    <p class="text-xs text-red-700 dark:text-red-400">Declined</p>
                    <p class="text-3xl font-bold text-red-900 dark:text-red-300">{{ stats.declined }}</p>
                </div>
                <div
                    class="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-xl border border-gray-300 dark:border-gray-900/50 shadow-lg">
                    <p class="text-xs text-gray-700 dark:text-gray-400">Cancelled</p>
                    <p class="text-3xl font-bold text-gray-900 dark:text-gray-300">{{ stats.cancelled }}</p>
                </div>
            </div>

            <div
                class="flex items-center gap-4 p-4 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                <div class="flex items-center gap-2">
                    <Filter class="w-5 h-5 text-gray-600 dark:text-platinum-400" />
                    <span class="text-base font-semibold text-gray-800 dark:text-platinum-300">Status:</span>
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
                    <span class="text-sm font-medium">{{ error }}</span>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto space-y-4 pb-4">
                <div v-if="loading" class="text-center py-12">
                    <RefreshCw
                        class="h-8 w-8 animate-spin mx-auto text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                </div>

                <div v-else-if="filteredRequests.length === 0"
                    class="text-center py-12 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                    <ArrowRightLeft class="h-12 w-12 mx-auto text-gray-400 dark:text-platinum-600 mb-4" />
                    <p class="text-gray-600 dark:text-platinum-400">No outgoing swap requests found.</p>
                </div>

                <div v-else class="space-y-4">
                    <div v-for="swap in filteredRequests" :key="swap.id"
                        class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 hover:border-kaitoke-green-500 shadow-md transition-all duration-200 hover:-translate-y-1">

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
                                    <span v-if="swap.to_officer">
                                        Requested to: <strong class="text-gray-800 dark:text-platinum-200">
                                            {{ swap.to_officer?.name }}
                                        </strong>
                                    </span>
                                    <span v-else class="text-amber-600 dark:text-amber-400 font-medium">
                                        Open to anyone
                                    </span>
                                </div>
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

                        <div
                            class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-300 dark:border-blue-700/50">
                            <div class="flex items-start gap-2 text-sm">
                                <MessageSquare class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                <div class="flex-1">
                                    <p class="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1">My Reason</p>
                                    <p class="text-blue-900 dark:text-blue-300">{{ swap.reason }}</p>
                                </div>
                            </div>
                        </div>

                        <div v-if="swap.review_notes"
                            class="mb-4 p-3 bg-gray-50 dark:bg-abyss-700 rounded-xl border border-gray-300 dark:border-abyss-600">
                            <div class="flex items-start gap-2 text-sm">
                                <Info class="w-4 h-4 text-gray-600 dark:text-platinum-400 mt-0.5 shrink-0" />
                                <div class="flex-1">
                                    <p class="text-xs text-gray-700 dark:text-platinum-300 font-medium mb-1">
                                        Admin/Officer Response
                                    </p>
                                    <p class="text-gray-800 dark:text-platinum-200">{{ swap.review_notes }}</p>
                                </div>
                            </div>
                        </div>

                        <div v-if="swap.status === 'pending'"
                            class="flex gap-3 pt-2 border-t border-gray-200 dark:border-abyss-700">
                            <button @click="openEditModal(swap)"
                                class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 text-sm font-medium shadow-sm transition-colors hover:-translate-y-0.5">
                                <Edit2 class="w-4 h-4" />
                                Edit Request
                            </button>
                            <button @click="cancelSwap(swap.id)"
                                class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium shadow-sm transition-colors hover:-translate-y-0.5">
                                <Trash2 class="w-4 h-4" />
                                Cancel Request
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="showEditModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                <div
                    class="bg-white dark:bg-abyss-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-abyss-700">
                    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-abyss-700">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                            <Edit2 class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Edit Swap
                            Request
                        </h3>
                        <button @click="showEditModal = false"
                            class="p-2 hover:bg-gray-100 dark:hover:bg-abyss-800 rounded-lg text-gray-700 dark:text-platinum-300">
                            <XCircleIcon class="w-5 h-5" />
                        </button>
                    </div>

                    <div class="p-6 space-y-4">
                        <div
                            class="p-3 bg-gray-50 dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700">
                            <p class="text-sm font-medium text-gray-800 dark:text-platinum-100 mb-1">
                                {{ selectedSwap?.duty_assignment?.duty_schedule?.title }}
                            </p>
                            <p class="text-xs text-gray-600 dark:text-platinum-400">
                                {{ formatDate(selectedSwap?.duty_assignment?.duty_schedule?.date) }}
                            </p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                                Swap With (Optional)
                            </label>
                            <select v-model="editForm.to_officer_id"
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-800 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600">
                                <option :value="null">Anyone available</option>
                                <option v-for="officer in officers" :key="officer.id" :value="officer.id">
                                    {{ officer.name }}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                                Reason *
                            </label>
                            <textarea v-model="editForm.reason" rows="4" required
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-800 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600"
                                placeholder="Explain why you need to swap this duty..."></textarea>
                        </div>

                        <div class="flex gap-3 pt-2">
                            <button @click="showEditModal = false"
                                class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 font-medium transition-colors hover:scale-[1.02] active:scale-[0.98]">
                                Cancel
                            </button>
                            <button @click="saveEdit"
                                class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-semibold shadow-md transition-colors hover:scale-[1.02] active:scale-[0.98]">
                                <Send class="w-4 h-4" /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>