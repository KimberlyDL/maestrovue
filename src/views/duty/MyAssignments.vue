<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/utils/api'
// import { isToday } from '@/utils/dateUtils'
import { useToast } from '@/utils/useToast'
import SwapRequestModal from '@/components/duty/swap_request_modal.vue'
import {
    Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle,
    RefreshCw, MessageSquare, ArrowRightLeft, Briefcase,
    LogIn, LogOut, Timer, User, ThumbsUp, ThumbsDown
} from 'lucide-vue-next'

const route = useRoute()
const toast = useToast()

const organizationId = computed(() => route.params.id)
const assignments = ref([])
const loading = ref(false)

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
    // Reset time for date comparison
    now.setHours(0, 0, 0, 0)

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
    now.setHours(0, 0, 0, 0)
    const upcoming = assignments.value.filter(a => new Date(a.duty_schedule.date) >= now)

    return {
        total: assignments.value.length,
        upcoming: upcoming.length,
        confirmed: upcoming.filter(a => a.status === 'confirmed').length,
        completed: assignments.value.filter(a => a.status === 'completed').length,
    }
})

const isPastDuty = (duty) => {
    if (!duty || !duty.date || !duty.end_time) return false;
    const dutyEnd = new Date(duty.date + ' ' + duty.end_time);
    return dutyEnd < Date.now();
};

const isUpcomingDuty = (duty) => {
    if (!duty || !duty.date || !duty.start_time) return false;
    const dutyStart = new Date(duty.date + ' ' + duty.start_time);
    return dutyStart > Date.now();
};

const isHappeningDuty = (duty) => {
    return !isPastDuty(duty) && !isUpcomingDuty(duty) && isToday(duty.date);
};

onMounted(loadAssignments)

async function loadAssignments() {
    loading.value = true
    try {
        const { data } = await axios.get(`/api/org/${organizationId.value}/duty-assignments/me`)
        assignments.value = (Array.isArray(data) ? data : (data.data || [])).map(a => ({
            ...a,
            duty_schedule: a.duty_schedule || a.dutySchedule || {},
            duty_schedule_id: a.duty_schedule_id || a.duty_schedule?.id
        }))
        toast.success('Assignments loaded')
    } catch (e) {
        console.error('Failed to load assignments:', e)
        toast.error(e?.response?.data?.message || 'Failed to load assignments')
    } finally {
        loading.value = false
    }
}

// RESTORED: Confirm/Decline functionality
async function respond(assignment, response) {
    try {
        await axios.post(
            `/api/org/${organizationId.value}/duty-schedules/${assignment.duty_schedule_id}/assignments/${assignment.id}/respond`,
            { response }
        )
        toast.success(`Assignment ${response}ed successfully`)
        await loadAssignments()
    } catch (e) {
        toast.error(e?.response?.data?.message || `Failed to ${response} assignment`)
    }
}

async function checkIn(assignment) {
    try {
        await axios.post(
            `/api/org/${organizationId.value}/duty-schedules/${assignment.duty_schedule_id}/assignments/${assignment.id}/check-in`
        )
        toast.success('✓ Checked in successfully')
        await loadAssignments()
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to check in')
    }
}

async function checkOut(assignment) {
    try {
        await axios.post(
            `/api/org/${organizationId.value}/duty-schedules/${assignment.duty_schedule_id}/assignments/${assignment.id}/check-out`
        )
        toast.success('✓ Checked out successfully')
        await loadAssignments()
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to check out')
    }
}

function openSwapModal(assignment) {
    selectedAssignment.value = assignment
    showSwapModal.value = true
}

function handleSwapRequested() {
    showSwapModal.value = false
    toast.success('Swap request submitted successfully')
    loadAssignments()
}

function getStatusColor(status) {
    const colors = {
        assigned: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        no_show: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
    }
    return colors[status] || colors.assigned
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
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

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return ''
    return new Date(dateTimeStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    })
}

function calculateDuration(checkIn, checkOut) {
    if (!checkIn || !checkOut) return null
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffMs = end - start
    const diffHrs = Math.floor(diffMs / 3600000)
    const diffMins = Math.floor((diffMs % 3600000) / 60000)
    return `${diffHrs}h ${diffMins}m`
}

function isToday(dateStr) {
    const date = new Date(dateStr)
    const today = new Date()
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
}

// New function to parse time and check window state
function getAttendanceState(assignment, type = 'in') {
    const schedule = assignment.duty_schedule;
    const now = new Date();
    const dutyDate = new Date(schedule.date);

    // Normalize dutyDate to midnight for comparison
    dutyDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check date
    if (dutyDate.toDateString() !== today.toDateString()) {
        const status = dutyDate > today ? 'Upcoming' : 'Past';
        return { canAct: false, window: status, message: `Duty is ${status}.` };
    }

    // 2. Determine time windows
    const startWindowStr = type === 'in' ? (schedule.check_in_window_start || schedule.start_time) : (schedule.check_out_window_start || schedule.end_time);
    const endWindowStr = type === 'in' ? (schedule.check_in_window_end || schedule.start_time) : (schedule.check_out_window_end || schedule.end_time);

    // Convert time strings to Date objects on the current day
    const [startHrs, startMins] = startWindowStr.split(':').map(Number);
    const [endHrs, endMins] = endWindowStr.split(':').map(Number);

    const windowStart = new Date();
    windowStart.setHours(startHrs, startMins, 0, 0);

    const windowEnd = new Date();
    windowEnd.setHours(endHrs, endMins, 0, 0);

    const niceStart = formatTime(startWindowStr);
    const niceEnd = formatTime(endWindowStr);

    // 3. Check current status
    const actionTaken = type === 'in' ? assignment.check_in_at : assignment.check_out_at;

    if (actionTaken) {
        return { canAct: false, window: 'Completed', message: `Checked ${type} at ${formatDateTime(actionTaken)}` };
    }

    if (now < windowStart) {
        return { canAct: false, window: 'TooEarly', message: `Opens at ${niceStart}`, niceStart, niceEnd };
    }

    if (now > windowEnd) {
        return { canAct: false, window: 'Expired', message: `Window closed at ${niceEnd}`, niceStart, niceEnd };
    }

    // 4. Inside active window
    return { canAct: true, window: 'Active', message: `Check ${type} now (until ${niceEnd})`, niceStart, niceEnd };
}


// Logic Checks
function canRespond(assignment) {
    return assignment.status === 'assigned'
}

function canCheckIn(assignment) {
    // Must be confirmed to check in
    if (assignment.status !== 'confirmed') return false
    if (assignment.check_in_at) return false

    // Check against window
    const state = getAttendanceState(assignment, 'in')
    return state.canAct
}

function canCheckOut(assignment) {
    // Must be checked in to check out
    if (!assignment.check_in_at || assignment.check_out_at) return false

    // Check against window
    const state = getAttendanceState(assignment, 'out')
    return state.canAct
}

function canRequestSwap(assignment) {
    return (assignment.status === 'assigned' || assignment.status === 'confirmed') &&
        new Date(assignment.duty_schedule.date) > new Date()
}
</script>

<template>
    <div class="max-w-7xl px-4 sm:px-6 py-6 lg:px-8">
        <div class="h-full flex flex-col gap-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                        My Duty Assignments
                    </h1>
                    <p class="text-sm text-gray-600 dark:text-platinum-400">
                        View and manage your duty schedule
                    </p>
                </div>
                <button @click="loadAssignments"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 transition-colors">
                    <RefreshCw class="w-4 h-4" />
                    Refresh
                </button>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div
                    class="p-4 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700">
                    <p class="text-xs text-gray-600 dark:text-platinum-400">Total</p>
                    <p class="text-3xl font-bold text-gray-800 dark:text-platinum-100">{{ stats.total }}</p>
                </div>
                <div
                    class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-300 dark:border-blue-900/50">
                    <p class="text-xs text-blue-700 dark:text-blue-400">Upcoming</p>
                    <p class="text-3xl font-bold text-blue-900 dark:text-blue-300">{{ stats.upcoming }}</p>
                </div>
                <div
                    class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-300 dark:border-emerald-900/50">
                    <p class="text-xs text-emerald-700 dark:text-emerald-400">Confirmed</p>
                    <p class="text-3xl font-bold text-emerald-900 dark:text-emerald-300">{{ stats.confirmed }}</p>
                </div>
                <div
                    class="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-xl border border-gray-300 dark:border-gray-900/50">
                    <p class="text-xs text-gray-700 dark:text-gray-400">Completed</p>
                    <p class="text-3xl font-bold text-gray-900 dark:text-gray-300">{{ stats.completed }}</p>
                </div>
            </div>

            <div
                class="flex items-center gap-4 p-4 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700">
                <div class="relative flex-1">
                    <input v-model="searchQuery" type="text" placeholder="Search assignments..."
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600 text-sm" />
                </div>
                <select v-model="viewType"
                    class="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 text-sm">
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                    <option value="all">All Dates</option>
                </select>
                <select v-model="filterStatus"
                    class="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 text-sm">
                    <option value="all">All Status</option>
                    <option value="assigned">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="no_show">No Show</option>
                </select>
            </div>

            <div class="flex-1 overflow-y-auto space-y-3">
                <div v-if="loading" class="text-center py-12">
                    <RefreshCw
                        class="h-8 w-8 animate-spin mx-auto text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                </div>

                <div v-else-if="filteredAssignments.length === 0"
                    class="text-center py-12 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700">
                    <Calendar class="h-12 w-12 mx-auto text-gray-400 dark:text-platinum-600 mb-4" />
                    <p class="text-gray-600 dark:text-platinum-400">No assignments found</p>
                </div>

                <div v-else class="space-y-4">
                    <div v-for="assignment in filteredAssignments" :key="assignment.id"
                        class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 hover:border-kaitoke-green-500 transition"
                        :class="isToday(assignment.duty_schedule.date) && 'ring-2 ring-kaitoke-green-500/50'">

                        <div class="flex items-start justify-between mb-3">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-100">
                                        {{ assignment.duty_schedule.title || 'Untitled Duty' }}
                                    </h3>
                                    <span class="px-3 py-1 rounded-full text-xs font-semibold uppercase"
                                        :class="getStatusColor(assignment.status)">
                                        {{ assignment.status === 'assigned' ? 'PENDING' : assignment.status }}
                                    </span>
                                    <span v-if="isToday(assignment.duty_schedule.date)"
                                        class="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                                        TODAY
                                    </span>
                                </div>

                                <!-- <div v-for="assignment in filteredAssignments" :key="assignment.id"
                        class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-md transition"
                        :class="{
                            // NEW: UI Status based on Time (OrgFeed Reference)
                            'ring-2 ring-emerald-500/50 hover:border-emerald-500': isHappeningDuty(assignment.duty_schedule),
                            'opacity-70': isPastDuty(assignment.duty_schedule),
                            'hover:border-kaitoke-green-500': isUpcomingDuty(assignment.duty_schedule)
                        }">

                        <div class="flex items-start justify-between mb-3">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <span v-if="isHappeningDuty(assignment.duty_schedule)"
                                        class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                        HAPPENING NOW
                                    </span>
                                    <span v-else-if="isPastDuty(assignment.duty_schedule)"
                                        class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600 dark:bg-abyss-700 dark:text-platinum-400">
                                        PAST
                                    </span>
                                    <span
                                        v-else-if="isUpcomingDuty(assignment.duty_schedule) && isToday(assignment.duty_schedule.date)"
                                        class="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                                        TODAY
                                    </span>
                                </div> -->



                                <p v-if="assignment.duty_schedule.description"
                                    class="text-sm text-gray-600 dark:text-platinum-400">
                                    {{ assignment.duty_schedule.description }}
                                </p>
                            </div>
                        </div>

                        <div
                            class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 pt-3 border-t border-gray-100 dark:border-abyss-700">
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

                        <div v-if="getAttendanceState(assignment, 'in').window !== 'Upcoming' && assignment.status !== 'completed' && assignment.status !== 'declined' && assignment.status !== 'no_show'"
                            class="mb-4 p-3 rounded-xl border" :class="[
                                getAttendanceState(assignment, 'in').window === 'Active' ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700/50' : 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700/50'
                            ]">
                            <div class="flex items-start gap-2 text-sm">
                                <AlertCircle v-if="getAttendanceState(assignment, 'in').window !== 'Active'"
                                    class="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                <CheckCircle v-else class="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                                <div>
                                    <p class="text-xs font-medium mb-1"
                                        :class="getAttendanceState(assignment, 'in').window === 'Active' ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'">
                                        Check-in Status
                                    </p>
                                    <p class="font-semibold"
                                        :class="getAttendanceState(assignment, 'in').window === 'Active' ? 'text-green-900 dark:text-green-300' : 'text-yellow-900 dark:text-yellow-300'">
                                        {{ getAttendanceState(assignment, 'in').message }}
                                    </p>
                                    <p v-if="assignment.check_in_at && !assignment.check_out_at && getAttendanceState(assignment, 'out').window !== 'Completed'"
                                        class="mt-2 text-xs text-gray-600 dark:text-platinum-400">
                                        Check-out window: {{ getAttendanceState(assignment, 'out').niceStart }} - {{
                                            getAttendanceState(assignment, 'out').niceEnd }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div v-if="assignment.check_in_at || assignment.check_out_at"
                            class="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl border border-emerald-300 dark:border-emerald-700/50">
                            <div class="flex items-center gap-2 mb-2">
                                <Timer class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <span class="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                                    Attendance Record
                                </span>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div v-if="assignment.check_in_at"
                                    class="flex items-center gap-3 p-2 bg-white/50 dark:bg-abyss-800/50 rounded-lg">
                                    <div class="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                        <LogIn class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-600 dark:text-platinum-400">Checked In</p>
                                        <p class="text-sm font-semibold text-gray-800 dark:text-platinum-200">
                                            {{ formatDateTime(assignment.check_in_at) }}
                                        </p>
                                    </div>
                                </div>
                                <div v-if="assignment.check_out_at"
                                    class="flex items-center gap-3 p-2 bg-white/50 dark:bg-abyss-800/50 rounded-lg">
                                    <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <LogOut class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-600 dark:text-platinum-400">Checked Out</p>
                                        <p class="text-sm font-semibold text-gray-800 dark:text-platinum-200">
                                            {{ formatDateTime(assignment.check_out_at) }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div v-if="assignment.check_in_at && assignment.check_out_at"
                                class="mt-3 p-2 bg-white/50 dark:bg-abyss-800/50 rounded-lg">
                                <p class="text-xs text-gray-600 dark:text-platinum-400 mb-1">Duration</p>
                                <p class="text-lg font-bold text-gray-800 dark:text-platinum-100">
                                    {{ calculateDuration(assignment.check_in_at, assignment.check_out_at) }}
                                </p>
                            </div>
                        </div>

                        <div v-if="assignment.notes"
                            class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-300 dark:border-blue-700/50">
                            <div class="flex items-start gap-2 text-sm">
                                <MessageSquare class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                    <p class="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1">Notes</p>
                                    <p class="text-blue-900 dark:text-blue-300">{{ assignment.notes }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-3 flex-wrap">
                            <template v-if="canRespond(assignment)">
                                <button @click="respond(assignment, 'confirm')"
                                    class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
                                    <ThumbsUp class="w-4 h-4" />
                                    Confirm
                                </button>
                                <button @click="respond(assignment, 'decline')"
                                    class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-semibold transition-colors">
                                    <ThumbsDown class="w-4 h-4" />
                                    Decline
                                </button>
                            </template>

                            <button v-if="canCheckIn(assignment)" @click="checkIn(assignment)"
                                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white text-sm font-semibold shadow-md transition-colors">
                                <LogIn class="w-4 h-4" />
                                Check In
                            </button>
                            <button v-if="canCheckOut(assignment)" @click="checkOut(assignment)"
                                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md transition-colors">
                                <LogOut class="w-4 h-4" />
                                Check Out
                            </button>

                            <button v-if="canRequestSwap(assignment)" @click="openSwapModal(assignment)"
                                class="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 text-sm font-medium transition-colors">
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
    </div>
</template>