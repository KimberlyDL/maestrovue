<script setup>
import { ref, computed } from 'vue'
import { Search, Download, CheckCircle, XCircle, Clock } from 'lucide-vue-next'
import { useOpsStore } from '@/stores/ops_store.js'

// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const opsStore = useOpsStore()

const searchQuery = ref('')
const filterStatus = ref('all')
const selectedDate = ref(new Date().toISOString().split('T')[0])

const filteredAttendance = computed(() => {
  return opsStore.attendance.filter(record => {
    const matchesSearch = record.staffName.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = filterStatus.value === 'all' || record.status === filterStatus.value
    const matchesDate = !selectedDate.value || record.date === selectedDate.value
    return matchesSearch && matchesStatus && matchesDate
  })
})

const attendanceStats = computed(() => {
  const total = filteredAttendance.value.length
  const present = filteredAttendance.value.filter(a => a.status === 'present').length
  const absent = filteredAttendance.value.filter(a => a.status === 'absent').length
  const late = filteredAttendance.value.filter(a => a.status === 'late').length
  
  return {
    total,
    present,
    absent,
    late,
    presentRate: total > 0 ? Math.round((present / total) * 100) : 0
  }
})

function getStatusIcon(status) {
  switch(status) {
    case 'present': return CheckCircle
    case 'absent': return XCircle
    case 'late': return Clock
    default: return null
  }
}

function getStatusColor(status) {
  switch(status) {
    case 'present': return 'text-green-600 dark:text-green-400'
    case 'absent': return 'text-red-600 dark:text-red-400'
    case 'late': return 'text-yellow-600 dark:text-yellow-400'
    default: return 'text-gray-600 dark:text-gray-400'
  }
}

function exportCSV() {
  const headers = ['Staff Name', 'Date', 'Status', 'Check In', 'Check Out', 'Notes']
  const rows = filteredAttendance.value.map(a => [
    a.staffName,
    a.date,
    a.status,
    a.checkInTime || '-',
    a.checkOutTime || '-',
    a.notes || '-'
  ])
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `attendance-${selectedDate.value}.csv`
  a.click()
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">Attendance Tracking</h2>
      <button 
        @click="exportCSV"
        class="flex items-center gap-2 px-3 py-1.5 bg-electric-lime-500 text-abyss-900 text-sm rounded-lg hover:bg-electric-lime-600 font-medium"
      >
        <Download :size="16" />
        Export CSV
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
        <p class="text-2xl font-bold text-abyss-900 dark:text-platinum-300">{{ attendanceStats.total }}</p>
      </div>
      <div class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Present</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ attendanceStats.present }}</p>
      </div>
      <div class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Late</p>
        <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ attendanceStats.late }}</p>
      </div>
      <div class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Absent</p>
        <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ attendanceStats.absent }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-3">
      <div class="flex-1 relative">
        <Search :size="18" class="absolute left-3 top-2.5 text-gray-400" />
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Search staff..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300"
        />
      </div>
      <input 
        v-model="selectedDate"
        type="date"
        class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300"
      />
      <select 
        v-model="filterStatus"
        class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300"
      >
        <option value="all">All Status</option>
        <option value="present">Present</option>
        <option value="late">Late</option>
        <option value="absent">Absent</option>
      </select>
    </div>

    <!-- Attendance Table -->
    <div class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Staff Name</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Check In</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Check Out</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Notes</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
          <tr v-for="record in filteredAttendance" :key="record.id" class="hover:bg-gray-50 dark:hover:bg-gray-900">
            <td class="px-4 py-3 text-sm text-abyss-900 dark:text-platinum-300">{{ record.staffName }}</td>
            <td class="px-4 py-3 text-sm">
              <div class="flex items-center gap-2">
                <component :is="getStatusIcon(record.status)" :size="16" :class="getStatusColor(record.status)" />
                <span class="capitalize">{{ record.status }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ record.checkInTime || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ record.checkOutTime || '-' }}</td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ record.notes || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="filteredAttendance.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <p>No attendance records found</p>
    </div>
  </div>
</template>
