<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from '@/utils/api'
import { useToast } from '@/utils/useToast'
import {
    RefreshCw, Search, Calendar, Clock, User, MessageSquare,
    ArrowRightLeft, ThumbsUp, ThumbsDown, MapPin, XCircle, Info, XCircle as XCircleIcon, Save
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const organizationId = computed(() => route.params.id)
const availableSwaps = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')

const showAcceptModal = ref(false)
const showDeclineModal = ref(false)
const selectedSwap = ref(null)
const actionNotes = ref('')
const processing = ref(false)

const filteredSwaps = computed(() => {
    let filtered = availableSwaps.value

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        filtered = filtered.filter(s =>
            s.duty_assignment?.duty_schedule?.title?.toLowerCase().includes(q) ||
            s.from_officer?.name?.toLowerCase().includes(q) ||
            s.reason?.toLowerCase().includes(q)
        )
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

onMounted(loadAvailableSwaps)

async function loadAvailableSwaps() {
    loading.value = true
    error.value = ''
    try {
        const { data } = await axios.get(`/api/org/${organizationId.value}/duty-swaps`, {
            params: {
                member_view: true,
                status: 'pending'
            }
        })

        // Filter to only show swaps from other members
        availableSwaps.value = (data.data || data).filter(swap =>
            swap.from_officer_id !== authStore.user.id &&
            swap.status === 'pending'
        )
    } catch (e) {
        console.error('Failed to load available swaps:', e)
        error.value = e?.response?.data?.message || 'Failed to load available swaps'
        toast.error(error.value)
    } finally {
        processing.value = false
        loading.value = false
    }
}

function openAcceptModal(swap) {
    selectedSwap.value = swap
    actionNotes.value = ''
    showAcceptModal.value = true
}

function openDeclineModal(swap) {
    selectedSwap.value = swap
    actionNotes.value = ''
    showDeclineModal.value = true
}

async function acceptSwap() {
    if (!selectedSwap.value) return

    processing.value = true
    try {
        await axios.post(
            `/api/org/${organizationId.value}/duty-swaps/${selectedSwap.value.id}/accept`,
            { notes: actionNotes.value || null }
        )
        toast.success('Swap accepted successfully! The duty is now yours.')
        showAcceptModal.value = false
        selectedSwap.value = null
        actionNotes.value = ''
        await loadAvailableSwaps()
    } catch (e) {
        console.error('Failed to accept swap:', e)
        toast.error(e?.response?.data?.message || 'Failed to accept swap')
    } finally {
        processing.value = false
    }
}

async function declineSwap() {
    if (!selectedSwap.value) return

    processing.value = true
    try {
        await axios.post(
            `/api/org/${organizationId.value}/duty-swaps/${selectedSwap.value.id}/decline`,
            { reason: actionNotes.value || null }
        )
        toast.success('Swap request declined')
        showDeclineModal.value = false
        selectedSwap.value = null
        actionNotes.value = ''
        await loadAvailableSwaps()
    } catch (e) {
        console.error('Failed to decline swap:', e)
        toast.error(e?.response?.data?.message || 'Failed to decline swap')
    } finally {
        processing.value = false
    }
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
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

function canAcceptSwap(swap) {
    // Check if swap is directed to me or open to all
    return swap.to_officer_id === null || swap.to_officer_id === authStore.user.id
}
</script>

<template>
    <div class="h-full flex flex-col gap-8">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                    <ArrowRightLeft class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Available Swaps
                </h1>
                <p class="text-sm text-gray-600 dark:text-platinum-400">
                    Browse and accept duty swap requests from other members
                </p>
            </div>
            <button @click="loadAvailableSwaps"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 shadow-sm transition-colors hover:scale-[1.02] active:scale-[0.98]">
                <RefreshCw class="w-4 h-4" />
                Refresh
            </button>
        </div>

        <div class="relative p-4 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
            <Search class="absolute left-7 top-6 w-5 h-5 text-gray-400 dark:text-platinum-600" />
            <input v-model="searchQuery" type="text" placeholder="Search available swaps..."
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600 text-sm" />
        </div>

        <div v-if="error"
            class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-300 dark:border-red-900/50 shadow-md">
            <div class="flex items-center gap-2 text-red-700 dark:text-red-400">
                <XCircle class="w-5 h-5" />
                <p class="text-sm font-medium">{{ error }}</p>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto space-y-4">
            <div v-if="loading" class="text-center py-12">
                <RefreshCw class="h-8 w-8 animate-spin mx-auto text-kaitoke-green-600 dark:text-kaitoke-green-400" />
            </div>

            <div v-else-if="filteredSwaps.length === 0" class="text-center py-12 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                <ArrowRightLeft class="h-12 w-12 mx-auto text-gray-400 dark:text-platinum-600 mb-4" />
                <p class="text-gray-600 dark:text-platinum-400">No available swap requests</p>
                <p class="text-sm text-gray-500 dark:text-platinum-500 mt-2">Check back later for duty swap opportunities</p>
            </div>

            <div v-else class="space-y-4">
                <div v-for="swap in filteredSwaps" :key="swap.id"
                    class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 hover:border-kaitoke-green-500 shadow-md transition hover:scale-[1.005]">

                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-100">
                                    {{ swap.duty_assignment?.duty_schedule?.title || 'Untitled Duty' }}
                                </h3>
                                <span v-if="swap.to_officer_id === authStore.user.id"
                                    class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 uppercase tracking-wider">
                                    Directed to you
                                </span>
                                <span v-else
                                    class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 uppercase tracking-wider">
                                    Open to all
                                </span>
                            </div>
                            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-platinum-400">
                                <User class="w-4 h-4" />
                                <span>From: <strong class="text-gray-800 dark:text-platinum-200">
                                        {{ swap.from_officer?.name || 'Unknown' }}
                                    </strong></span>
                                <span class="text-gray-400 dark:text-platinum-600">•</span>
                                <span>Requested: {{ formatDateTime(swap.created_at) }}</span>
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

                        <div v-if="swap.duty_assignment?.duty_schedule?.location">
                            <p class="text-xs text-gray-600 dark:text-platinum-400 mb-1">Location</p>
                            <div class="flex items-center gap-2 text-sm">
                                <MapPin class="w-4 h-4 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                                <span class="font-medium text-gray-800 dark:text-platinum-100">
                                    {{ swap.duty_assignment.duty_schedule.location }}
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

                    <div v-if="canAcceptSwap(swap)"
                        class="flex gap-3 pt-2 border-t border-gray-200 dark:border-abyss-700">
                        <button @click="openAcceptModal(swap)"
                            class="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md transition-colors hover:scale-[1.02] active:scale-[0.98]">
                            <ThumbsUp class="w-4 h-4" />
                            Accept Swap
                        </button>
                        <button @click="openDeclineModal(swap)"
                            class="flex-1 px-4 py-2.5 rounded-xl border border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-semibold shadow-sm transition-colors hover:scale-[1.02] active:scale-[0.98]">
                            <ThumbsDown class="w-4 h-4" />
                            Decline
                        </button>
                    </div>
                    <div v-else class="pt-2 border-t border-gray-200 dark:border-abyss-700">
                        <p class="text-sm text-gray-600 dark:text-platinum-400">
                            This swap is directed to another officer.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showAcceptModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div class="bg-white dark:bg-abyss-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-abyss-700">
                <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-abyss-700">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                         <ThumbsUp class="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Accept Swap
                    </h3>
                    <button @click="showAcceptModal = false"
                        class="p-2 hover:bg-gray-100 dark:hover:bg-abyss-800 rounded-lg text-gray-700 dark:text-platinum-300">
                        <XCircleIcon class="w-5 h-5" />
                    </button>
                </div>

                <div class="p-6 space-y-4">
                    <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-300 dark:border-emerald-700/50">
                        <p class="text-sm font-medium text-emerald-900 dark:text-emerald-300 mb-1">
                            {{ selectedSwap?.duty_assignment?.duty_schedule?.title }}
                        </p>
                        <p class="text-xs text-emerald-700 dark:text-emerald-400">
                            {{ formatDate(selectedSwap?.duty_assignment?.duty_schedule?.date) }} •
                            {{ formatTime(selectedSwap?.duty_assignment?.duty_schedule?.start_time) }} -
                            {{ formatTime(selectedSwap?.duty_assignment?.duty_schedule?.end_time) }}
                        </p>
                    </div>

                    <p class="text-sm text-gray-700 dark:text-platinum-300">
                        By accepting, you take ownership of this duty.
                    </p>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea v-model="actionNotes" rows="3"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-800 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
                            placeholder="Add any notes..."></textarea>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button @click="showAcceptModal = false"
                            class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 font-medium transition-colors hover:scale-[1.02] active:scale-[0.98]">
                            Cancel
                        </button>
                        <button @click="acceptSwap" :disabled="processing"
                            class="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition-colors disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]">
                            {{ processing ? 'Processing...' : 'Confirm Accept' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showDeclineModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div class="bg-white dark:bg-abyss-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-abyss-700">
                <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-abyss-700">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                        <ThumbsDown class="w-5 h-5 text-red-600 dark:text-red-400" /> Decline Swap
                    </h3>
                    <button @click="showDeclineModal = false"
                        class="p-2 hover:bg-gray-100 dark:hover:bg-abyss-800 rounded-lg text-gray-700 dark:text-platinum-300">
                        <XCircleIcon class="w-5 h-5" />
                    </button>
                </div>

                <div class="p-6 space-y-4">
                    <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-300 dark:border-red-700/50">
                        <p class="text-sm font-medium text-red-900 dark:text-red-300 mb-1">
                            {{ selectedSwap?.duty_assignment?.duty_schedule?.title }}
                        </p>
                        <p class="text-xs text-red-700 dark:text-red-400">
                            From: {{ selectedSwap?.from_officer?.name }}
                        </p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                            Reason (Optional)
                        </label>
                        <textarea v-model="actionNotes" rows="3"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-800 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-red-600 focus:border-red-600"
                            placeholder="Let them know why you can't accept..."></textarea>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button @click="showDeclineModal = false"
                            class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 font-medium transition-colors hover:scale-[1.02] active:scale-[0.98]">
                            Cancel
                        </button>
                        <button @click="declineSwap" :disabled="processing"
                            class="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-md transition-colors disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]">
                            {{ processing ? 'Processing...' : 'Confirm Decline' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>