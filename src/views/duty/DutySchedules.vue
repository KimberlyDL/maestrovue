<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDutyStore } from '@/stores/duty'
import { useToast } from '@/utils/useToast'
import axios from '@/utils/api'
import DutyScheduleModal from '@/components/duty/duty_schedule_modal.vue'
import DutyDetailModal from '@/components/duty/duty_detail_modal.vue'
import {
    Calendar, Clock, MapPin, Users, Search, Filter, Plus,
    RefreshCw, CheckCircle, XCircle, AlertCircle, Briefcase, Edit2
} from 'lucide-vue-next'

const route = useRoute()
const dutyStore = useDutyStore()
const toast = useToast()

const organizationId = computed(() => route.params.id)
const schedules = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const filterStatus = ref('all')

const showScheduleModal = ref(false)
const showDetailModal = ref(false)
const selectedSchedule = ref(null)

const filteredSchedules = computed(() => {
    let filtered = schedules.value

    if (filterStatus.value !== 'all') {
        filtered = filtered.filter(s => s.status === filterStatus.value)
    }

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        filtered = filtered.filter(s =>
            s.title.toLowerCase().includes(q) ||
            (s.location && s.location.toLowerCase().includes(q))
        )
    }

    return filtered.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.start_time)
        const dateB = new Date(b.date + ' ' + b.start_time)
        return dateB - dateA
    })
})

onMounted(() => {
    loadSchedules()
})

async function loadSchedules() {
    loading.value = true
    error.value = ''
    try {
        console.log('Loading schedules for org:', organizationId.value)

        const { data } = await axios.get(`/api/org/${organizationId.value}/duty-schedules`)

        // Handle both array and data.data formats
        schedules.value = Array.isArray(data) ? data : (data.data || [])

    } catch (e) {
        console.error('Failed to load schedules:', e)
        console.error('Error details:', e.response?.data)
        error.value = e?.response?.data?.message || 'Failed to load schedules'
        toast.error(error.value)
    } finally {
        loading.value = false
    }
}

function openScheduleModal(schedule = null) {
    selectedSchedule.value = schedule
    showScheduleModal.value = true
}

function openDetailModal(schedule) {
    selectedSchedule.value = schedule
    showDetailModal.value = true
}

function handleSaved() {
    showScheduleModal.value = false
    showDetailModal.value = false
    loadSchedules()
}

function getStatusColor(status) {
    const colors = {
        draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        published: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    }
    return colors[status] || colors.draft
}

function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
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

function getAssignmentStatus(schedule) {
    const assignments = schedule.assignments || []
    const assigned = assignments.filter(a =>
        ['assigned', 'confirmed'].includes(a.status)
    ).length
    const required = schedule.required_officers || 0

    if (assigned >= required) {
        return { color: 'text-emerald-600 dark:text-emerald-400', text: 'Fully Staffed' }
    } else if (assigned > 0) {
        return { color: 'text-amber-600 dark:text-amber-400', text: `${required - assigned} needed` }
    } else {
        return { color: 'text-red-600 dark:text-red-400', text: 'Unstaffed' }
    }
}

function getAssignmentCounts(schedule) {
    const assignments = schedule.assignments || []
    return {
        confirmed: assignments.filter(a => a.status === 'confirmed').length,
        assigned: assignments.filter(a => a.status === 'assigned').length,
        declined: assignments.filter(a => a.status === 'declined').length,
        total: assignments.length,
        required: schedule.required_officers || 0
    }
}
</script>

<template>
    <div class="max-w-7xl px-4 sm:px-6 py-6 lg:px-8">
        <div class="h-full flex flex-col gap-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                        <Briefcase class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Duty Schedules
                    </h1>
                    <p class="text-sm text-gray-600 dark:text-platinum-400">
                        View, create, and manage all duty assignments
                    </p>
                </div>
                <div class="flex gap-3">
                    <button @click="loadSchedules" :disabled="loading"
                        class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 shadow-sm transition-colors disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]">
                        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
                        Refresh
                    </button>
                    <button @click="openScheduleModal()"
                        class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-semibold shadow-md transition-colors hover:scale-[1.02] active:scale-[0.98]">
                        <Plus class="w-4 h-4" />
                        New Schedule
                    </button>
                </div>
            </div>

            <div
                class="flex items-center gap-4 p-4 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                <div class="relative flex-1">
                    <Search class="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-platinum-600" />
                    <input v-model="searchQuery" type="text" placeholder="Search schedules..."
                        class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600 text-sm" />
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                    <Filter class="w-5 h-5 text-gray-600 dark:text-platinum-400" />
                </div>
                <select v-model="filterStatus"
                    class="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600 text-sm">
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div v-if="error"
                class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-300 dark:border-red-900/50 shadow-md">
                <div class="flex items-center gap-2">
                    <XCircle class="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p class="text-sm text-red-700 dark:text-red-400 font-medium">{{ error }}</p>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto">
                <div v-if="loading" class="text-center py-12">
                    <RefreshCw
                        class="h-8 w-8 animate-spin mx-auto text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                    <p class="mt-2 text-sm text-gray-600 dark:text-platinum-400">Loading schedules...</p>
                </div>

                <div v-else-if="filteredSchedules.length === 0"
                    class="text-center py-12 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                    <Calendar class="h-12 w-12 mx-auto text-gray-400 dark:text-platinum-600 mb-4" />
                    <p class="text-gray-600 dark:text-platinum-400 font-medium">No schedules found</p>
                    <p class="text-sm text-gray-500 dark:text-platinum-500 mt-1">
                        {{ searchQuery || filterStatus !== 'all' ?
                            'Try adjusting your filters' :
                            'Create your first duty schedule to get started' }}
                    </p>
                </div>

                <div v-else class="grid gap-4">
                    <div v-for="schedule in filteredSchedules" :key="schedule.id" @click="openDetailModal(schedule)"
                        class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 hover:border-kaitoke-green-500 cursor-pointer shadow-md transition hover:scale-[1.005]">

                        <div class="flex items-start justify-between mb-3">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-100">
                                        {{ schedule.title }}
                                    </h3>
                                    <span class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                                        :class="getStatusColor(schedule.status)">
                                        {{ schedule.status }}
                                    </span>
                                </div>
                                <p v-if="schedule.description" class="text-sm text-gray-600 dark:text-platinum-400">
                                    {{ schedule.description }}
                                </p>
                            </div>
                        </div>

                        <div
                            class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-3 border-t border-gray-100 dark:border-abyss-700">
                            <div class="flex items-center gap-2 text-sm">
                                <Calendar class="w-4 h-4 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                                <span class="text-gray-700 dark:text-platinum-300 font-medium">
                                    {{ formatDate(schedule.date) }}
                                </span>
                            </div>

                            <div class="flex items-center gap-2 text-sm">
                                <Clock class="w-4 h-4 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                                <span class="text-gray-700 dark:text-platinum-300 font-medium">
                                    {{ formatTime(schedule.start_time) }} - {{ formatTime(schedule.end_time) }}
                                </span>
                            </div>

                            <div v-if="schedule.location" class="flex items-center gap-2 text-sm">
                                <MapPin class="w-4 h-4 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                                <span class="text-gray-700 dark:text-platinum-300 font-medium">
                                    {{ schedule.location }}
                                </span>
                            </div>

                            <div class="flex items-center gap-2 text-sm">
                                <Users class="w-4 h-4 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                                <span class="text-gray-700 dark:text-platinum-300 font-medium">
                                    {{ getAssignmentCounts(schedule).total }} / {{ schedule.required_officers }}
                                </span>
                            </div>
                        </div>

                        <div
                            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-abyss-700 rounded-xl border border-gray-200 dark:border-abyss-600 shadow-inner">
                            <div class="flex items-center gap-4 text-xs">
                                <div class="flex items-center gap-1.5">
                                    <CheckCircle class="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span class="text-gray-700 dark:text-platinum-300">
                                        {{ getAssignmentCounts(schedule).confirmed }} Confirmed
                                    </span>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <AlertCircle class="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                    <span class="text-gray-700 dark:text-platinum-300">
                                        {{ getAssignmentCounts(schedule).assigned }} Pending
                                    </span>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <XCircle class="w-3 h-3 text-red-600 dark:text-red-400" />
                                    <span class="text-gray-700 dark:text-platinum-300">
                                        {{ getAssignmentCounts(schedule).declined }} Declined
                                    </span>
                                </div>
                            </div>

                            <span class="text-sm font-semibold" :class="getAssignmentStatus(schedule).color">
                                {{ getAssignmentStatus(schedule).text }}
                            </span>
                        </div>

                        <div v-if="schedule.assignments?.length" class="flex items-center gap-2 mt-3">
                            <span class="text-xs text-gray-600 dark:text-platinum-400 font-medium">Assigned:</span>
                            <div class="flex -space-x-2">
                                <div v-for="(assignment, index) in schedule.assignments.slice(0, 5)"
                                    :key="assignment.id"
                                    class="w-8 h-8 rounded-full bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 border-2 border-white dark:border-abyss-800 flex items-center justify-center text-xs font-semibold text-kaitoke-green-600 dark:text-kaitoke-green-300"
                                    :title="assignment.officer?.name || 'Officer'">
                                    {{ (assignment.officer?.name || 'O').charAt(0).toUpperCase() }}
                                </div>
                                <div v-if="schedule.assignments.length > 5"
                                    class="w-8 h-8 rounded-full bg-gray-200 dark:bg-abyss-700 border-2 border-white dark:border-abyss-800 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-platinum-300">
                                    +{{ schedule.assignments.length - 5 }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DutyScheduleModal v-if="showScheduleModal" :duty="selectedSchedule" :organization-id="organizationId"
                @close="showScheduleModal = false" @saved="handleSaved" />

            <DutyDetailModal v-if="showDetailModal" :duty="selectedSchedule" :organization-id="organizationId"
                @close="showDetailModal = false" @updated="handleSaved" @deleted="handleSaved" />
        </div>
    </div>

</template>