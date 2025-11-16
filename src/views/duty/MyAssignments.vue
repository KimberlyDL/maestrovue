<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDutyStore } from '@/stores/duty'
import { useToast } from '@/utils/useToast'
import axios from '@/utils/api'
import SwapRequestModal from '@/components/duty/swap_request_modal.vue'
import {
    Calendar, Clock, MapPin, CheckCircle2, XCircle,
    AlertCircle, Filter, Search, LogIn, LogOut,
    RefreshCw, MessageSquare, ArrowRightLeft, Briefcase, Edit2
} from 'lucide-vue-next'

const route = useRoute()
const dutyStore = useDutyStore()
const toast = useToast()

const organizationId = computed(() => route.params.id)
const assignments = ref([])
const loading = ref(false)
const error = ref('')

const filterStatus = ref('all')
const searchQuery = ref('')
const viewType = ref('upcoming')

const showSwapModal = ref(false)
const selectedAssignment = ref(null)

const filteredAssignments = computed(() => {
    let filtered = assignments.value

    if (filterStatus.value !== 'all') {
        filtered = filtered.filter(a => a.status === filterStatus.value)
    }

    const now = new Date()
    if (viewType.value === 'upcoming') {
        filtered = filtered.filter(a => new Date(a.duty_schedule.date) >= now)
    } else if (viewType.value === 'past') {
        filtered = filtered.filter(a => new Date(a.duty_schedule.date) < now)
    }

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        filtered = filtered.filter(a =>
            a.duty_schedule.title.toLowerCase().includes(q) ||
            (a.duty_schedule.location && a.duty_schedule.location.toLowerCase().includes(q))
        )
    }

    return filtered.sort((a, b) => {
        const dateA = new Date(a.duty_schedule.date + ' ' + a.duty_schedule.start_time)
        const dateB = new Date(b.duty_schedule.date + ' ' + b.duty_schedule.start_time)
        return dateA - dateB
    })
})

const stats = computed(() => {
    const now = new Date()
    const upcoming = assignments.value.filter(a => new Date(a.duty_schedule.date) >= now)

    return {
        total: assignments.value.length,
        upcoming: upcoming.length,
        confirmed: upcoming.filter(a => a.status === 'confirmed').length,
        pending: upcoming.filter(a => a.status === 'assigned').length,
        completed: assignments.value.filter(a => a.status === 'completed').length,
    }
})

onMounted(loadAssignments)

async function loadAssignments() {
    loading.value = true
    error.value = ''
    try {
        const { data } = await axios.get(`/api/org/${organizationId.value}/duty-assignments/me`)

        // Handle both array and paginated response
        const assignmentList = Array.isArray(data) ? data : (data.data || [])

        assignments.value = assignmentList.map(a => ({
            ...a,
            duty_schedule: a.duty_schedule || a.dutySchedule || {},
            duty_schedule_id: a.duty_schedule_id || a.duty_schedule?.id
        }))
    } catch (e) {
        console.error('Failed to load assignments:', e)
        error.value = e?.response?.data?.message || 'Failed to load assignments'
        toast.error(error.value)
    } finally {
        loading.value = false
    }
}

async function respondToAssignment(assignment, response) {
    try {
        await axios.post(
            `/api/org/${organizationId.value}/duty-schedules/${assignment.duty_schedule_id}/assignments/${assignment.id}/respond`,
            { response, notes: null }
        )
        toast.success(`Assignment ${response === 'confirm' ? 'confirmed' : 'declined'}`)
        await loadAssignments()
    } catch (e) {
        console.error('Failed to respond:', e)
        toast.error(e?.response?.data?.message || 'Failed to respond to assignment')
    }
}

async function checkIn(assignment) {
    try {
        await axios.post(
            `/api/org/${organizationId.value}/duty-schedules/${assignment.duty_schedule_id}/assignments/${assignment.id}/check-in`
        )
        toast.success('Checked in successfully')
        await loadAssignments()
    } catch (e) {
        console.error('Failed to check in:', e)
        toast.error(e?.response?.data?.message || 'Failed to check in')
    }
}

async function checkOut(assignment) {
    try {
        await axios.post(
            `/api/org/${organizationId.value}/duty-schedules/${assignment.duty_schedule_id}/assignments/${assignment.id}/check-out`
        )
        toast.success('Checked out successfully')
        await loadAssignments()
    } catch (e) {
        console.error('Failed to check out:', e)
        toast.error(e?.response?.data?.message || 'Failed to check out')
    }
}

function openSwapModal(assignment) {
    selectedAssignment.value = assignment
    showSwapModal.value = true
}

function handleSwapRequested() {
    showSwapModal.value = false
    toast.success('Swap request submitted')
    loadAssignments()
}

function getStatusColor(status) {
    const colors = {
        assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        no_show: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
    }
    return colors[status] || colors.assigned
}

function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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

function isToday(dateStr) {
    const date = new Date(dateStr)
    const today = new Date()
    return date.toDateString() === today.toDateString()
}

function canCheckIn(assignment) {
    if (assignment.status !== 'confirmed') return false
    if (assignment.check_in_at) return false

    const dutyDate = new Date(assignment.duty_schedule.date + ' ' + assignment.duty_schedule.start_time)
    const now = new Date()
    // Allows check-in 1 hour before start time and up to 2 hours after start time
    const hoursBefore = (dutyDate - now) / (1000 * 60 * 60)

    return hoursBefore <= 1 && hoursBefore >= -2
}

function canCheckOut(assignment) {
    return assignment.check_in_at && !assignment.check_out_at
}

function canRequestSwap(assignment) {
    return assignment.status === 'confirmed' &&
        new Date(assignment.duty_schedule.date) > new Date()
}
</script>

<template>
    <div class="h-full flex flex-col gap-8">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                    <Briefcase class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> My Duty Assignments
                </h1>
                <p class="text-sm text-gray-600 dark:text-platinum-400">View and manage your upcoming and past duty schedule</p>
            </div>
            <button @click="loadAssignments"
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
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-300 dark:border-blue-900/50 shadow-lg">
                <p class="text-xs text-blue-700 dark:text-blue-400">Upcoming</p>
                <p class="text-3xl font-bold text-blue-900 dark:text-blue-300">{{ stats.upcoming }}</p>
            </div>
            <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-300 dark:border-emerald-900/50 shadow-lg">
                <p class="text-xs text-emerald-700 dark:text-emerald-400">Confirmed</p>
                <p class="text-3xl font-bold text-emerald-900 dark:text-emerald-300">{{ stats.confirmed }}</p>
            </div>
            <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-300 dark:border-amber-900/50 shadow-lg">
                <p class="text-xs text-amber-700 dark:text-amber-400">Pending</p>
                <p class="text-3xl font-bold text-amber-900 dark:text-amber-300">{{ stats.pending }}</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-xl border border-gray-300 dark:border-gray-900/50 shadow-lg">
                <p class="text-xs text-gray-700 dark:text-gray-400">Completed</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-gray-300">{{ stats.completed }}</p>
            </div>
        </div>

        <div class="flex items-center gap-4 p-4 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
            <div class="relative flex-1">
                <Search class="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-platinum-600" />
                <input v-model="searchQuery" type="text" placeholder="Search duty title or location..."
                    class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600 text-sm" />
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
                <Filter class="w-5 h-5 text-gray-600 dark:text-platinum-400" />
            </div>
            
            <select v-model="viewType"
                class="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600 text-sm">
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="all">All Dates</option>
            </select>

            <select v-model="filterStatus"
                class="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600 text-sm">
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
                <option value="completed">Completed</option>
            </select>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3">
            <div v-if="loading" class="text-center py-12">
                <RefreshCw class="h-8 w-8 animate-spin mx-auto text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                <p class="mt-2 text-sm text-gray-600 dark:text-platinum-400">Loading assignments...</p>
            </div>

            <div v-else-if="error"
                class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-300 dark:border-red-900/50 shadow-md">
                <div class="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <XCircle class="w-5 h-5" />
                    <p class="text-sm font-medium">{{ error }}</p>
                </div>
            </div>

            <div v-else-if="filteredAssignments.length === 0" class="text-center py-12 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                <Calendar class="h-12 w-12 mx-auto text-gray-400 dark:text-platinum-600 mb-4" />
                <p class="text-gray-600 dark:text-platinum-400">No duty assignments found matching your criteria.</p>
            </div>

            <div v-else class="space-y-4">
                <div v-for="assignment in filteredAssignments" :key="assignment.id"
                    class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 hover:border-kaitoke-green-500 shadow-md transition hover:scale-[1.005]"
                    :class="isToday(assignment.duty_schedule.date) && 'ring-2 ring-kaitoke-green-500/50'">

                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-100">
                                    {{ assignment.duty_schedule.title || 'Untitled Duty' }}
                                </h3>
                                <span class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                                    :class="getStatusColor(assignment.status)">
                                    {{ assignment.status }}
                                </span>
                                <span v-if="isToday(assignment.duty_schedule.date)"
                                    class="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                                    TODAY
                                </span>
                            </div>
                            <p v-if="assignment.duty_schedule.description"
                                class="text-sm text-gray-600 dark:text-platinum-400 mb-2">
                                {{ assignment.duty_schedule.description }}
                            </p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-3 border-t border-gray-100 dark:border-abyss-700">
                        <div class="flex items-center gap-2 text-sm">
                            <Calendar class="w-4 h-4 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            <span class="text-gray-700 dark:text-platinum-300 font-medium">
                                {{ formatDate(assignment.duty_schedule.date) }}
                            </span>
                        </div>

                        <div class="flex items-center gap-2 text-sm">
                            <Clock class="w-4 h-4 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            <span class="text-gray-700 dark:text-platinum-300 font-medium">
                                {{ formatTime(assignment.duty_schedule.start_time) }} -
                                {{ formatTime(assignment.duty_schedule.end_time) }}
                            </span>
                        </div>

                        <div v-if="assignment.duty_schedule.location" class="flex items-center gap-2 text-sm">
                            <MapPin class="w-4 h-4 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            <span class="text-gray-700 dark:text-platinum-300 font-medium">
                                {{ assignment.duty_schedule.location }}
                            </span>
                        </div>
                    </div>

                    <div v-if="assignment.check_in_at || assignment.check_out_at"
                        class="mb-4 p-3 bg-gray-50 dark:bg-abyss-700 rounded-xl text-sm border border-gray-200 dark:border-abyss-600 shadow-inner">
                        <div v-if="assignment.check_in_at" class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <LogIn class="w-4 h-4" />
                            <span>Checked in: {{ new Date(assignment.check_in_at).toLocaleTimeString() }}</span>
                        </div>
                        <div v-if="assignment.check_out_at" class="flex items-center gap-2 text-blue-600 dark:text-blue-400 mt-1">
                            <LogOut class="w-4 h-4" />
                            <span>Checked out: {{ new Date(assignment.check_out_at).toLocaleTimeString() }}</span>
                        </div>
                    </div>

                    <div v-if="assignment.notes" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-300 dark:border-blue-700/50">
                        <div class="flex items-start gap-2 text-sm">
                            <MessageSquare class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                                <p class="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1">Notes</p>
                                <p class="text-blue-900 dark:text-blue-300">{{ assignment.notes }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-3 flex-wrap">
                        <template v-if="assignment.status === 'assigned'">
                            <button @click="respondToAssignment(assignment, 'confirm')"
                                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md transition-colors hover:scale-[1.02] active:scale-[0.98]">
                                <CheckCircle2 class="w-4 h-4" />
                                Confirm
                            </button>
                            <button @click="respondToAssignment(assignment, 'decline')"
                                class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-semibold shadow-sm transition-colors hover:scale-[1.02] active:scale-[0.98]">
                                <XCircle class="w-4 h-4" />
                                Decline
                            </button>
                        </template>

                        <template v-if="assignment.status === 'confirmed'">
                            <button v-if="canCheckIn(assignment)" @click="checkIn(assignment)"
                                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white text-sm font-semibold shadow-md transition-colors hover:scale-[1.02] active:scale-[0.98]">
                                <LogIn class="w-4 h-4" />
                                Check In
                            </button>
                            <button v-if="canCheckOut(assignment)" @click="checkOut(assignment)"
                                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md transition-colors hover:scale-[1.02] active:scale-[0.98]">
                                <LogOut class="w-4 h-4" />
                                Check Out
                            </button>
                        </template>

                        <button v-if="canRequestSwap(assignment)" @click="openSwapModal(assignment)"
                            class="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 text-sm font-medium shadow-sm transition-colors hover:scale-[1.02] active:scale-[0.98]">
                            <ArrowRightLeft class="w-4 h-4" />
                            Request Swap
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <SwapRequestModal v-if="showSwapModal" :assignment="selectedAssignment" :organization-id="organizationId"
            @close="showSwapModal = false" @requested="handleSwapRequested" />
    </div>
</template>