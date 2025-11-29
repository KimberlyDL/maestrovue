<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/utils/api'
import { useToast } from '@/utils/useToast'
import {
    TrendingUp, Calendar, CheckCircle, XCircle, Clock, Download,
    RefreshCw, BarChart3, Award, Target, Timer, LogIn, LogOut
} from 'lucide-vue-next'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler } from 'chart.js'
import { Doughnut, Bar, Line } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler)

const route = useRoute()
const toast = useToast()

const organizationId = computed(() => route.params.id)
const loading = ref(false)

const CHART_COLORS = {
    completed: '#10b981',
    confirmed: '#3b82f6',
    declined: '#ef4444',
    no_show: '#dc2626',
    pending: '#f59e0b',
    text: 'rgb(148, 163, 184)',
    grid: 'rgba(148, 163, 184, 0.2)'
}

const dateRange = ref({
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
})

// const stats = ref({
//     total_assignments: 0,
//     confirmed: 0,
//     completed: 0,
//     declined: 0,
//     no_show: 0,
//     pending: 0,
//     hours_worked: 0,
//     completion_rate: 0,
//     reliability_score: 0,
//     check_in_rate: 0,
//     avg_actual_duration: 0,
//     on_time_rate: 0,
// })


const stats = ref({
    total_schedules: 0,
    total_assignments: 0,
    confirmed_assignments: 0,
    declined_assignments: 0,
    completed_assignments: 0,
    no_show_assignments: 0,
    fill_rate: 0,
    officers_active: 0,
    avg_duty_duration: 0,
    confirmation_rate: 0,
    completion_rate: 0,
    // NEW: Check-in/out stats
    check_in_rate: 0,
    avg_actual_duration: 0,
    on_time_rate: 0
})

const monthlyBreakdown = ref([])
const recentDuties = ref([])

const statusChartData = computed(() => ({
    labels: ['Completed', 'Confirmed', 'Declined', 'No Show', 'Pending'],
    datasets: [{
        data: [
            stats.value.completed,
            stats.value.confirmed,
            stats.value.declined,
            stats.value.no_show,
            stats.value.pending
        ],
        backgroundColor: [
            CHART_COLORS.completed,
            CHART_COLORS.confirmed,
            CHART_COLORS.declined,
            CHART_COLORS.no_show,
            CHART_COLORS.pending
        ],
        borderWidth: 0
    }]
}))

const monthlyChartData = computed(() => ({
    labels: monthlyBreakdown.value.map(m => m.month),
    datasets: [{
        label: 'Completed',
        data: monthlyBreakdown.value.map(m => m.completed),
        backgroundColor: CHART_COLORS.completed,
    }, {
        label: 'No Show',
        data: monthlyBreakdown.value.map(m => m.no_show),
        backgroundColor: CHART_COLORS.no_show,
    }]
}))

const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top', labels: { color: CHART_COLORS.text } },
        title: {
            display: true,
            text: 'Monthly Performance',
            color: CHART_COLORS.text
        }
    },
    scales: {
        x: {
            stacked: false,
            ticks: { stepSize: 1, color: CHART_COLORS.text },
            grid: { color: CHART_COLORS.grid }
        },
        y: {
            stacked: false,
            beginAtZero: true,
            ticks: { stepSize: 1, color: CHART_COLORS.text },
            grid: { color: CHART_COLORS.grid }
        }
    }
}

onMounted(loadStatistics)
watch(dateRange, loadStatistics, { deep: true })

async function loadStatistics() {
    loading.value = true
    try {
        const { data } = await axios.get(
            `/api/org/${organizationId.value}/duty-schedules/my-statistics`,
            {
                params: {
                    start_date: dateRange.value.start_date,
                    end_date: dateRange.value.end_date
                }
            }
        )

        stats.value = {
            total_assignments: data.total_assignments || 0,
            confirmed: data.confirmed || 0,
            completed: data.completed || 0,
            declined: data.declined || 0,
            no_show: data.no_show || 0,
            pending: data.pending || 0,
            hours_worked: data.hours_worked || 0,
            completion_rate: data.completion_rate || 0,
            reliability_score: data.reliability_score || 0,
            check_in_rate: data.check_in_rate || 0,
            avg_actual_duration: data.avg_actual_duration || 0,
            on_time_rate: data.on_time_rate || 0
        }

        monthlyBreakdown.value = data.monthly_breakdown || []
        recentDuties.value = data.recent_duties || []

        toast.success('Statistics loaded successfully')
    } catch (e) {
        console.error('Failed to load statistics:', e)
        toast.error(e?.response?.data?.message || 'Failed to load statistics')
    } finally {
        loading.value = false
    }
}

async function exportReport() {
    try {
        const { data } = await axios.get(
            `/api/org/${organizationId.value}/duty-schedules/export-my-performance`,
            {
                params: {
                    start_date: dateRange.value.start_date,
                    end_date: dateRange.value.end_date
                },
                responseType: 'blob'
            }
        )

        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement('a')
        link.href = url
        link.download = `my-duty-performance-${dateRange.value.start_date}-to-${dateRange.value.end_date}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast.success('Report exported successfully')
    } catch (e) {
        toast.error('Failed to export report')
    }
}

function getReliabilityColor(rate) {
    if (rate >= 90) return 'text-emerald-600 dark:text-emerald-400'
    if (rate >= 75) return 'text-blue-600 dark:text-blue-400'
    if (rate >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
}

function getStatusBadgeColor(status) {
    switch (status) {
        case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
        case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        case 'assigned': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
        case 'declined': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        case 'no_show': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
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
</script>

<template>
    <div class="h-full flex flex-col gap-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                    <TrendingUp class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> My Performance
                </h1>
                <p class="text-sm text-gray-600 dark:text-platinum-400">
                    Track your duty assignment performance and statistics
                </p>
            </div>
            <div class="flex gap-3">
                <button @click="loadStatistics"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 shadow-sm transition-colors hover:scale-[1.02] active:scale-[0.98]">
                    <RefreshCw class="w-4 h-4" />
                    Refresh
                </button>
                <button @click="exportReport"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-semibold shadow-md transition-colors hover:scale-[1.02] active:scale-[0.98]">
                    <Download class="w-4 h-4" />
                    Export
                </button>
            </div>
        </div>

        <!-- Date Range Filter -->
        <div class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
            <div class="flex items-center gap-4">
                <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                        Start Date
                    </label>
                    <input v-model="dateRange.start_date" type="date"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600 text-sm" />
                </div>
                <div class="flex-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                        End Date
                    </label>
                    <input v-model="dateRange.end_date" type="date"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600 text-sm" />
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
            <RefreshCw class="h-8 w-8 animate-spin mx-auto text-kaitoke-green-600 dark:text-kaitoke-green-400" />
            <p class="mt-2 text-sm text-gray-600 dark:text-platinum-400">Loading statistics...</p>
        </div>

        <!-- Stats Content -->
        <div v-else class="flex-1 overflow-y-auto space-y-6">
            <!-- Key Performance Indicators -->
            <div>
                <h2 class="text-xl font-semibold text-gray-800 dark:text-platinum-100 mb-4 flex items-center gap-2">
                    <Target class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                    Your Performance Metrics
                </h2>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div
                        class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                        <Calendar class="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                        <p class="text-3xl font-bold text-gray-800 dark:text-platinum-100">
                            {{ stats.total_assignments }}
                        </p>
                        <p class="text-sm text-gray-600 dark:text-platinum-400">Total Assignments</p>
                    </div>

                    <div
                        class="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-300 dark:border-emerald-900/50 shadow-lg">
                        <Target class="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
                        <p class="text-3xl font-bold text-emerald-900 dark:text-emerald-300">
                            {{ stats.completion_rate }}%
                        </p>
                        <p class="text-sm text-emerald-700 dark:text-emerald-400">Completion Rate</p>
                    </div>

                    <div
                        class="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-300 dark:border-blue-900/50 shadow-lg">
                        <Award class="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                        <p class="text-3xl font-bold" :class="getReliabilityColor(stats.reliability_score)">
                            {{ stats.reliability_score }}%
                        </p>
                        <p class="text-sm text-blue-700 dark:text-blue-400">Reliability Score</p>
                    </div>

                    <div
                        class="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-300 dark:border-amber-900/50 shadow-lg">
                        <Timer class="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2" />
                        <p class="text-3xl font-bold text-amber-900 dark:text-amber-300">
                            {{ stats.hours_worked }}h
                        </p>
                        <p class="text-sm text-amber-700 dark:text-amber-400">Hours Worked</p>
                    </div>
                    <!-- Check-in/out Stats (NEW) -->
                    <div>
                        <h2
                            class="text-xl font-semibold text-gray-800 dark:text-platinum-100 mb-4 flex items-center gap-2">
                            <Clock class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            Attendance & Punctuality
                        </h2>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div
                                class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                                <div class="flex items-center gap-3 mb-2">
                                    <LogIn class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    <span class="text-sm text-gray-600 dark:text-platinum-400">Check-in Rate</span>
                                </div>
                                <p class="text-3xl font-bold text-gray-800 dark:text-platinum-100">
                                    {{ stats.check_in_rate }}%
                                </p>
                            </div>

                            <div
                                class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                                <div class="flex items-center gap-3 mb-2">
                                    <Clock class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    <span class="text-sm text-gray-600 dark:text-platinum-400">Avg. Actual
                                        Duration</span>
                                </div>
                                <p class="text-3xl font-bold text-gray-800 dark:text-platinum-100">
                                    {{ stats.avg_actual_duration }}h
                                </p>
                            </div>

                            <div
                                class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                                <div class="flex items-center gap-3 mb-2">
                                    <CheckCircle class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                                    <span class="text-sm text-gray-600 dark:text-platinum-400">On-Time Rate</span>
                                </div>
                                <p class="text-3xl font-bold text-gray-800 dark:text-platinum-100">
                                    {{ stats.on_time_rate }}%
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Check-in/out Stats (NEW) -->
            <div>
                <h2 class="text-xl font-semibold text-gray-800 dark:text-platinum-100 mb-4 flex items-center gap-2">
                    <Clock class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                    Attendance & Punctuality
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                        <div class="flex items-center gap-3 mb-2">
                            <LogIn class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            <span class="text-sm text-gray-600 dark:text-platinum-400">Check-in Rate</span>
                        </div>
                        <p class="text-3xl font-bold text-gray-800 dark:text-platinum-100">
                            {{ stats.check_in_rate }}%
                        </p>
                    </div>

                    <div
                        class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                        <div class="flex items-center gap-3 mb-2">
                            <Clock class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <span class="text-sm text-gray-600 dark:text-platinum-400">Avg. Actual Duration</span>
                        </div>
                        <p class="text-3xl font-bold text-gray-800 dark:text-platinum-100">
                            {{ stats.avg_actual_duration }}h
                        </p>
                    </div>

                    <div
                        class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                        <div class="flex items-center gap-3 mb-2">
                            <CheckCircle class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            <span class="text-sm text-gray-600 dark:text-platinum-400">On-Time Rate</span>
                        </div>
                        <p class="text-3xl font-bold text-gray-800 dark:text-platinum-100">
                            {{ stats.on_time_rate }}%
                        </p>
                    </div>
                </div>
            </div>

            <!-- Charts Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Status Distribution -->
                <div
                    class="bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 p-6 shadow-xl">
                    <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-100 mb-4 flex items-center gap-2">
                        <BarChart3 class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                        Assignment Status
                    </h3>
                    <div class="h-80">
                        <Doughnut :data="statusChartData" :options="{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'bottom', labels: { color: CHART_COLORS.text } }
                            }
                        }" />
                    </div>
                </div>

                <!-- Status Breakdown -->
                <div
                    class="bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 p-6 shadow-xl">
                    <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-100 mb-4">
                        Detailed Breakdown
                    </h3>
                    <div class="space-y-3">
                        <div
                            class="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-300 dark:border-emerald-700/50 shadow-inner">
                            <div class="flex items-center gap-3">
                                <CheckCircle class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <span
                                    class="text-sm font-medium text-emerald-900 dark:text-emerald-300">Completed</span>
                            </div>
                            <span class="text-lg font-bold text-emerald-900 dark:text-emerald-300">
                                {{ stats.completed }}
                            </span>
                        </div>

                        <div
                            class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-300 dark:border-blue-700/50 shadow-inner">
                            <div class="flex items-center gap-3">
                                <CheckCircle class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <span class="text-sm font-medium text-blue-900 dark:text-blue-300">Confirmed</span>
                            </div>
                            <span class="text-lg font-bold text-blue-900 dark:text-blue-300">
                                {{ stats.confirmed }}
                            </span>
                        </div>

                        <div
                            class="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-300 dark:border-amber-700/50 shadow-inner">
                            <div class="flex items-center gap-3">
                                <Clock class="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                <span class="text-sm font-medium text-amber-900 dark:text-amber-300">Pending</span>
                            </div>
                            <span class="text-lg font-bold text-amber-900 dark:text-amber-300">
                                {{ stats.pending }}
                            </span>
                        </div>

                        <div
                            class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-300 dark:border-red-700/50 shadow-inner">
                            <div class="flex items-center gap-3">
                                <XCircle class="w-5 h-5 text-red-600 dark:text-red-400" />
                                <span class="text-sm font-medium text-red-900 dark:text-red-300">Declined</span>
                            </div>
                            <span class="text-lg font-bold text-red-900 dark:text-red-300">
                                {{ stats.declined }}
                            </span>
                        </div>

                        <div
                            class="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-300 dark:border-rose-700/50 shadow-inner">
                            <div class="flex items-center gap-3">
                                <XCircle class="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                <span class="text-sm font-medium text-rose-900 dark:text-rose-300">No Show</span>
                            </div>
                            <span class="text-lg font-bold text-rose-900 dark:text-rose-300">
                                {{ stats.no_show }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Monthly Performance -->
            <div v-if="monthlyBreakdown.length > 0"
                class="bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 p-6 shadow-xl">
                <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-100 mb-4 flex items-center gap-2">
                    <BarChart3 class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                    Monthly Performance Trend
                </h3>
                <div class="h-64">
                    <Bar :data="monthlyChartData" :options="monthlyChartOptions" />
                </div>
            </div>

            <!-- Recent Duties -->
            <div v-if="recentDuties.length > 0">
                <h2 class="text-xl font-semibold text-gray-800 dark:text-platinum-100 mb-4 flex items-center gap-2">
                    <Calendar class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                    Recent Duties
                </h2>

                <div
                    class="bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 overflow-hidden shadow-xl">
                    <table class="w-full">
                        <thead class="bg-gray-50 dark:bg-abyss-700">
                            <tr>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-platinum-300 uppercase tracking-wider">
                                    Duty
                                </th>
                                <th
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-platinum-300 uppercase tracking-wider">
                                    Date
                                </th>
                                <th
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-platinum-300 uppercase tracking-wider">
                                    Time
                                </th>
                                <th
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-platinum-300 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-abyss-700">
                            <tr v-for="duty in recentDuties" :key="duty.id"
                                class="hover:bg-gray-50 dark:hover:bg-abyss-700 transition-colors">
                                <td class="px-4 py-3 text-sm font-medium text-gray-800 dark:text-platinum-100">
                                    {{ duty.title }}
                                </td>
                                <td class="px-4 py-3 text-sm text-center text-gray-700 dark:text-platinum-300">
                                    {{ formatDate(duty.date) }}
                                </td>
                                <td class="px-4 py-3 text-sm text-center text-gray-700 dark:text-platinum-300">
                                    {{ formatTime(duty.start_time) }} - {{ formatTime(duty.end_time) }}
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <span class="px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                                        :class="getStatusBadgeColor(duty.status)">
                                        {{ duty.status }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
canvas {
    max-height: 100% !important;
}
</style>