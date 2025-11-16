<script setup>
import { ref, computed } from 'vue'
import { Download, TrendingUp } from 'lucide-vue-next'
import { useOpsStore } from '@/stores/ops_store.js'

// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const opsStore = useOpsStore()

const selectedScheduleId = ref(null)
const selectedDateRange = ref('month')

const scheduleReports = computed(() => {
    return opsStore.schedules.map(schedule => {
        const scheduleAttendance = opsStore.attendance.filter(a => a.scheduleId === schedule.id)
        const total = scheduleAttendance.length
        const present = scheduleAttendance.filter(a => a.status === 'present').length
        const absent = scheduleAttendance.filter(a => a.status === 'absent').length
        const late = scheduleAttendance.filter(a => a.status === 'late').length

        return {
            ...schedule,
            stats: {
                total,
                present,
                absent,
                late,
                presentRate: total > 0 ? Math.round((present / total) * 100) : 0,
                lateRate: total > 0 ? Math.round((late / total) * 100) : 0,
                absentRate: total > 0 ? Math.round((absent / total) * 100) : 0
            }
        }
    })
})

function downloadReport(schedule) {
    const report = `
Ops Schedule Report
==================
Schedule: ${schedule.title}
Date: ${schedule.date}
Time: ${schedule.startTime} - ${schedule.endTime}
Location: ${schedule.location}

Attendance Statistics
====================
Total Staff: ${schedule.stats.total}
Present: ${schedule.stats.present} (${schedule.stats.presentRate}%)
Late: ${schedule.stats.late} (${schedule.stats.lateRate}%)
Absent: ${schedule.stats.absent} (${schedule.stats.absentRate}%)

Generated: ${new Date().toLocaleString()}
  `.trim()

    const blob = new Blob([report], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${schedule.id}.txt`
    a.click()
}
</script>

<template>
    <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">Reports</h2>
            <select v-model="selectedDateRange"
                class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300">
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
            </select>
        </div>

        <!-- Reports Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="schedule in scheduleReports" :key="schedule.id"
                class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">

                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="font-semibold text-abyss-900 dark:text-platinum-300">{{ schedule.title }}</h3>
                        <p class="text-xs text-gray-600 dark:text-gray-400">{{ schedule.date }}</p>
                    </div>
                    <button @click="downloadReport(schedule)"
                        class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                        <Download :size="18" />
                    </button>
                </div>

                <!-- Stats -->
                <div class="space-y-3">
                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</span>
                            <span class="text-sm font-semibold text-abyss-900 dark:text-platinum-300">{{
                                schedule.stats.presentRate }}%</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                            <div class="bg-green-600 h-2 rounded-full"
                                :style="{ width: schedule.stats.presentRate + '%' }"></div>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-2">
                        <div class="bg-green-50 dark:bg-green-900 rounded p-2">
                            <p class="text-xs text-gray-600 dark:text-gray-400">Present</p>
                            <p class="text-lg font-bold text-green-600 dark:text-green-400">{{ schedule.stats.present }}
                            </p>
                        </div>
                        <div class="bg-yellow-50 dark:bg-yellow-900 rounded p-2">
                            <p class="text-xs text-gray-600 dark:text-gray-400">Late</p>
                            <p class="text-lg font-bold text-yellow-600 dark:text-yellow-400">{{ schedule.stats.late }}
                            </p>
                        </div>
                        <div class="bg-red-50 dark:bg-red-900 rounded p-2">
                            <p class="text-xs text-gray-600 dark:text-gray-400">Absent</p>
                            <p class="text-lg font-bold text-red-600 dark:text-red-400">{{ schedule.stats.absent }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-if="scheduleReports.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No reports available</p>
        </div>
    </div>
</template>
