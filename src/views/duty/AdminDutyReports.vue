<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/utils/api'
import {
    TrendingUp, Users, Calendar, CheckCircle, XCircle,
    Clock, Download, RefreshCw, BarChart3, PieChart,
    Activity, Target, Award, Users2, LineChart, Home
} from 'lucide-vue-next'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler } from 'chart.js'
import { Doughnut, Bar, Line } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler)

const route = useRoute()

const organizationId = computed(() => route.params.id)
const loading = ref(false)
const error = ref('')

// Chart Colors (Adaptive for Dark Mode readability on graph elements)
const CHART_COLORS = {
    completed: '#10b981', // emerald-600
    confirmed: '#3b82f6', // blue-500
    declined: '#ef4444',  // red-500
    no_show: '#dc2626',   // red-700
    pending: '#f59e0b',   // amber-500
    text: 'rgb(148, 163, 184)', // platinum-400 (for ticks/labels in dark mode)
    grid: 'rgba(148, 163, 184, 0.2)'
}

const dateRange = ref({
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
})

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
    check_in_rate: 0,
    avg_actual_duration: 0,
    on_time_rate: 0
})

const officerStats = ref([])
const timeSeriesData = ref([])

// Status Distribution Chart
const statusChartData = computed(() => ({
    labels: ['Completed', 'Confirmed', 'Declined', 'No Show', 'Pending'],
    datasets: [{
        data: [
            stats.value.completed_assignments,
            stats.value.confirmed_assignments,
            stats.value.declined_assignments,
            stats.value.no_show_assignments,
            stats.value.total_assignments - (stats.value.completed_assignments + stats.value.confirmed_assignments + stats.value.declined_assignments + stats.value.no_show_assignments)
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

// Officer Performance Chart
const officerChartData = computed(() => ({
    labels: officerStats.value.slice(0, 10).map(o => o.officer_name),
    datasets: [
        {
            label: 'Completed',
            data: officerStats.value.slice(0, 10).map(o => o.completed),
            backgroundColor: CHART_COLORS.completed,
        },
        {
            label: 'Confirmed',
            data: officerStats.value.slice(0, 10).map(o => o.confirmed),
            backgroundColor: CHART_COLORS.confirmed,
        },
        {
            label: 'Declined',
            data: officerStats.value.slice(0, 10).map(o => o.declined),
            backgroundColor: CHART_COLORS.declined,
        }
    ]
}))

const officerChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
        legend: { position: 'top', labels: { color: CHART_COLORS.text } },
        title: {
            display: true,
            text: 'Top 10 Officers by Activity',
            color: CHART_COLORS.text
        }
    },
    scales: {
        x: {
            stacked: true,
            beginAtZero: true,
            ticks: { color: CHART_COLORS.text },
            grid: { color: CHART_COLORS.grid }
        },
        y: {
            stacked: true,
            ticks: { color: CHART_COLORS.text },
            grid: { color: CHART_COLORS.grid }
        }
    }
}

// Completion Rate Trend
const completionTrendData = computed(() => ({
    labels: timeSeriesData.value.map(d => d.date),
    datasets: [{
        label: 'Completion Rate',
        data: timeSeriesData.value.map(d => d.completion_rate),
        borderColor: CHART_COLORS.completed,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
    }]
}))

const completionTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        title: {
            display: true,
            text: 'Completion Rate Over Time',
            color: CHART_COLORS.text
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 100,
            ticks: { callback: (value) => value + '%', color: CHART_COLORS.text },
            grid: { color: CHART_COLORS.grid }
        },
        x: {
            ticks: { color: CHART_COLORS.text },
            grid: { color: CHART_COLORS.grid }
        }
    }
}

// Fill Rate Chart
const fillRateChartData = computed(() => ({
    labels: timeSeriesData.value.map(d => d.date),
    datasets: [{
        label: 'Fill Rate',
        data: timeSeriesData.value.map(d => d.fill_rate),
        borderColor: CHART_COLORS.confirmed,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
    }]
}))

const fillRateChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        title: {
            display: true,
            text: 'Duty Fill Rate Over Time',
            color: CHART_COLORS.text
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 100,
            ticks: { callback: (value) => value + '%', color: CHART_COLORS.text },
            grid: { color: CHART_COLORS.grid }
        },
        x: {
            ticks: { color: CHART_COLORS.text },
            grid: { color: CHART_COLORS.grid }
        }
    }
}

onMounted(loadStatistics)
watch(dateRange, loadStatistics, { deep: true })

async function loadStatistics() {
    loading.value = true
    error.value = ''
    try {
        const { data } = await axios.get(
            `/api/org/${organizationId.value}/duty-schedules/statistics`,
            {
                params: {
                    start_date: dateRange.value.start_date,
                    end_date: dateRange.value.end_date
                }
            }
        )

        stats.value = {
            total_schedules: data.total_schedules || 0,
            total_assignments: data.total_assignments || 0,
            confirmed_assignments: data.confirmed_assignments || 0,
            declined_assignments: data.declined_assignments || 0,
            completed_assignments: data.completed_assignments || 0,
            no_show_assignments: data.no_show_assignments || 0,
            fill_rate: data.fill_rate || 0,
            officers_active: data.officers_active || 0,
            avg_duty_duration: data.avg_duty_duration || 0,
            confirmation_rate: data.confirmation_rate || 0,
            completion_rate: data.completion_rate || 0
        }

        officerStats.value = data.officer_stats || []
        timeSeriesData.value = data.time_series || []
    } catch (e) {
        console.error('Failed to load statistics:', e)
        error.value = e?.response?.data?.message || 'Failed to load statistics'
    } finally {
        loading.value = false
    }
}

async function exportReport() {
    try {
        const { data } = await axios.get(
            `/api/org/${organizationId.value}/duty-schedules/export`,
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
        link.download = `duty-report-${dateRange.value.start_date}-to-${dateRange.value.end_date}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    } catch (e) {
        alert('Failed to export report')
    }
}

function getCompletionRateColor(rate) {
    // Adaptive color logic for text in cells
    if (rate >= 90) return 'text-emerald-600 dark:text-emerald-400'
    if (rate >= 75) return 'text-blue-600 dark:text-blue-400'
    if (rate >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
}
</script>

<template>
    <div class="max-w-7xl px-4 sm:px-6 py-6 lg:px-8">
        <div class="h-full flex flex-col gap-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                        <TrendingUp class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Admin
                        Dashboard
                    </h1>
                    <p class="text-sm text-gray-600 dark:text-platinum-400">
                        Organization-wide duty statistics and analytics
                    </p>
                </div>
                <div class="flex gap-3">
                    <button @click="loadStatistics"
                        class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 transition-colors hover:scale-[1.02] active:scale-[0.98]">
                        <RefreshCw class="w-4 h-4" />
                        Refresh
                    </button>
                    <button @click="exportReport"
                        class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-semibold transition-colors hover:scale-[1.02] active:scale-[0.98]">
                        <Download class="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            <div
                class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700">
                <div class="flex items-center gap-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                            Start Date
                        </label>
                        <input v-model="dateRange.start_date" type="date"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600 text-sm" />
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                            End Date
                        </label>
                        <input v-model="dateRange.end_date" type="date"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600 text-sm" />
                    </div>
                </div>
            </div>

            <div v-if="error"
                class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-300 dark:border-red-900/50">
                <div class="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <XCircle class="w-5 h-5" />
                    <p class="text-sm font-medium">{{ error }}</p>
                </div>
            </div>

            <div v-if="loading" class="text-center py-12">
                <RefreshCw class="h-8 w-8 animate-spin mx-auto text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                <p class="mt-2 text-sm text-gray-600 dark:text-platinum-400">Loading statistics...</p>
            </div>

            <div v-else class="flex-1 overflow-y-auto space-y-6">
                <div>
                    <h2 class="text-xl font-semibold text-gray-800 dark:text-platinum-100 mb-4 flex items-center gap-2">
                        <TrendingUp class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                        Key Performance Indicators
                    </h2>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div
                            class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700">
                            <Calendar class="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                            <p class="text-3xl font-bold text-gray-800 dark:text-platinum-100">
                                {{ stats.total_schedules }}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-platinum-400">Total Schedules</p>
                        </div>

                        <div
                            class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700">
                            <Users class="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                            <p class="text-3xl font-bold text-gray-800 dark:text-platinum-100">
                                {{ stats.total_assignments }}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-platinum-400">Total Assignments</p>
                        </div>

                        <div
                            class="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-300 dark:border-emerald-900/50">
                            <Target class="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
                            <p class="text-3xl font-bold text-emerald-900 dark:text-emerald-300">
                                {{ stats.completion_rate }}%
                            </p>
                            <p class="text-sm text-emerald-700 dark:text-emerald-400">Completion Rate</p>
                        </div>

                        <div
                            class="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-300 dark:border-blue-900/50">
                            <Activity class="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                            <p class="text-3xl font-bold text-blue-900 dark:text-blue-300">
                                {{ stats.fill_rate }}%
                            </p>
                            <p class="text-sm text-blue-700 dark:text-blue-400">Fill Rate</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div
                        class="bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 p-6">
                        <h3
                            class="text-xl font-semibold text-gray-800 dark:text-platinum-100 mb-4 flex items-center gap-2">
                            <PieChart class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            Assignment Distribution
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

                    <div
                        class="bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-100 mb-4">
                            Detailed Breakdown
                        </h3>
                        <div class="space-y-3">
                            <div
                                class="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-300 dark:border-emerald-700/50">
                                <div class="flex items-center gap-3">
                                    <CheckCircle class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <span
                                        class="text-sm font-medium text-emerald-900 dark:text-emerald-300">Completed</span>
                                </div>
                                <span class="text-lg font-bold text-emerald-900 dark:text-emerald-300">
                                    {{ stats.completed_assignments }}
                                </span>
                            </div>

                            <div
                                class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-300 dark:border-blue-700/50">
                                <div class="flex items-center gap-3">
                                    <CheckCircle class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <span class="text-sm font-medium text-blue-900 dark:text-blue-300">Confirmed</span>
                                </div>
                                <span class="text-lg font-bold text-blue-900 dark:text-blue-300">
                                    {{ stats.confirmed_assignments }}
                                </span>
                            </div>

                            <div
                                class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-300 dark:border-red-700/50">
                                <div class="flex items-center gap-3">
                                    <XCircle class="w-5 h-5 text-red-600 dark:text-red-400" />
                                    <span class="text-sm font-medium text-red-900 dark:text-red-300">Declined</span>
                                </div>
                                <span class="text-lg font-bold text-red-900 dark:text-red-300">
                                    {{ stats.declined_assignments }}
                                </span>
                            </div>

                            <div
                                class="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-300 dark:border-rose-700/50">
                                <div class="flex items-center gap-3">
                                    <XCircle class="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                    <span class="text-sm font-medium text-rose-900 dark:text-rose-300">No Show</span>
                                </div>
                                <span class="text-lg font-bold text-rose-900 dark:text-rose-300">
                                    {{ stats.no_show_assignments }}
                                </span>
                            </div>

                            <div class="pt-3 border-t border-gray-200 dark:border-abyss-700">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-600 dark:text-platinum-400">Active Officers</span>
                                    <span class="text-lg font-bold text-gray-800 dark:text-platinum-100">
                                        {{ stats.officers_active }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="timeSeriesData.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div
                        class="bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 p-6">
                        <h3
                            class="text-xl font-semibold text-gray-800 dark:text-platinum-100 mb-4 flex items-center gap-2">
                            <LineChart class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            Completion Rate Trend
                        </h3>
                        <div class="h-64">
                            <Line :data="completionTrendData" :options="completionTrendOptions" />
                        </div>
                    </div>

                    <div
                        class="bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 p-6">
                        <h3
                            class="text-xl font-semibold text-gray-800 dark:text-platinum-100 mb-4 flex items-center gap-2">
                            <LineChart class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Duty Fill Rate Trend
                        </h3>
                        <div class="h-64">
                            <Line :data="fillRateChartData" :options="fillRateChartOptions" />
                        </div>
                    </div>
                </div>

                <div v-if="officerStats.length > 0">
                    <h2 class="text-xl font-semibold text-gray-800 dark:text-platinum-100 mb-4 flex items-center gap-2">
                        <BarChart3 class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                        Officer Performance
                    </h2>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div
                            class="bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 p-6">
                            <div class="h-96">
                                <Bar :data="officerChartData" :options="officerChartOptions" />
                            </div>
                        </div>

                        <div
                            class="bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 overflow-hidden">
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="bg-gray-50 dark:bg-abyss-700">
                                        <tr>
                                            <th
                                                class="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-platinum-300 uppercase tracking-wider">
                                                Officer
                                            </th>
                                            <th
                                                class="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-platinum-300 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th
                                                class="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-platinum-300 uppercase tracking-wider">
                                                Rate
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-abyss-700">
                                        <tr v-for="officer in officerStats.slice(0, 10)" :key="officer.officer_id"
                                            class="hover:bg-gray-50 dark:hover:bg-abyss-700 transition-colors">
                                            <td
                                                class="px-4 py-3 text-sm font-medium text-gray-800 dark:text-platinum-100">
                                                {{ officer.officer_name }}
                                            </td>
                                            <td
                                                class="px-4 py-3 text-sm text-center text-gray-700 dark:text-platinum-300">
                                                {{ officer.total }}
                                            </td>
                                            <td class="px-4 py-3 text-sm text-center font-semibold"
                                                :class="getCompletionRateColor(officer.completion_rate)">
                                                {{ officer.completion_rate }}%
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        class="p-6 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700">
                        <div class="flex items-center gap-3 mb-4">
                            <Users class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-platinum-100">
                                Active Officers
                            </h3>
                        </div>
                        <p class="text-4xl font-bold text-gray-800 dark:text-platinum-100 mb-2">
                            {{ stats.officers_active }}
                        </p>
                        <p class="text-sm text-gray-600 dark:text-platinum-400">
                            With at least one assignment
                        </p>
                    </div>

                    <div
                        class="p-6 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700">
                        <div class="flex items-center gap-3 mb-4">
                            <Clock class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-platinum-100">
                                Avg. Duration
                            </h3>
                        </div>
                        <p class="text-4xl font-bold text-gray-800 dark:text-platinum-100 mb-2">
                            {{ stats.avg_duty_duration }}h
                        </p>
                        <p class="text-sm text-gray-600 dark:text-platinum-400">
                            Per duty assignment
                        </p>
                    </div>

                    <div
                        class="p-6 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700">
                        <div class="flex items-center gap-3 mb-4">
                            <Award class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-platinum-100">
                                Confirmation
                            </h3>
                        </div>
                        <p class="text-4xl font-bold text-gray-800 dark:text-platinum-100 mb-2">
                            {{ stats.confirmation_rate }}%
                        </p>
                        <p class="text-sm text-gray-600 dark:text-platinum-400">
                            Officers confirm duties
                        </p>
                    </div>
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