<script setup>
import { ref, computed } from 'vue'
import { useEventsStore } from '@/stores/events_store.js'
import AttendanceTable from '@/components/events/attendance_table.vue'
import { Search, Download } from 'lucide-vue-next'

// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const eventsStore = useEventsStore()
const selectedEventId = ref(null)
const searchQuery = ref('')
const filterStatus = ref('all')

const selectedEvent = computed(() =>
    eventsStore.events.find(e => e.id === selectedEventId.value)
)

const filteredVolunteers = computed(() => {
    if (!selectedEvent.value) return []

    let volunteers = selectedEvent.value.volunteers.filter(v =>
        v.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )

    if (filterStatus.value === 'attended') {
        volunteers = volunteers.filter(v => v.attended)
    } else if (filterStatus.value === 'absent') {
        volunteers = volunteers.filter(v => !v.attended)
    }

    return volunteers
})

function handleToggleAttendance(volunteerId) {
    eventsStore.toggleVolunteerAttendance(selectedEventId.value, volunteerId)
}

function exportAttendance() {
    if (!selectedEvent.value) return

    const data = filteredVolunteers.value.map(v => ({
        Name: v.name,
        Email: v.email,
        Role: v.role,
        Status: v.attended ? 'Attended' : 'Absent'
    }))

    const csv = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-${selectedEvent.value.title}-${selectedEvent.value.date}.csv`
    a.click()
}

selectedEventId.value = eventsStore.events[0]?.id || null
</script>

<template>
    <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">Attendance Tracking</h2>
            <button @click="exportAttendance"
                class="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600">
                <Download :size="16" />
                Export CSV
            </button>
        </div>

        <!-- Event selector -->
        <div class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Event
            </label>
            <select v-model.number="selectedEventId"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-abyss-900 dark:text-platinum-300 focus:ring-2 focus:ring-kaitoke-green-500">
                <option v-for="event in eventsStore.events" :key="event.id" :value="event.id">
                    {{ event.title }} - {{ event.date }}
                </option>
            </select>
        </div>

        <!-- Filters and search -->
        <div class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div class="grid grid-cols-3 gap-4 mb-4">
                <div class="flex items-center gap-2">
                    <Search :size="18" class="text-gray-400" />
                    <input v-model="searchQuery" type="text" placeholder="Search volunteers..."
                        class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-abyss-900 dark:text-platinum-300 focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent" />
                </div>
                <select v-model="filterStatus"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-abyss-900 dark:text-platinum-300 focus:ring-2 focus:ring-kaitoke-green-500">
                    <option value="all">All Status</option>
                    <option value="attended">Attended</option>
                    <option value="absent">Absent</option>
                </select>
                <div></div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-4 gap-3">
                <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p class="text-xs text-gray-600 dark:text-gray-400">Total</p>
                    <p class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">{{
                        selectedEvent?.volunteers.length || 0 }}</p>
                </div>
                <div class="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                    <p class="text-xs text-emerald-600 dark:text-emerald-400">Attended</p>
                    <p class="text-lg font-semibold text-emerald-700 dark:text-emerald-300">{{
                        selectedEvent?.volunteers.filter(v => v.attended).length || 0 }}</p>
                </div>
                <div class="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <p class="text-xs text-red-600 dark:text-red-400">Absent</p>
                    <p class="text-lg font-semibold text-red-700 dark:text-red-300">{{
                        selectedEvent?.volunteers.filter(v => !v.attended).length || 0 }}</p>
                </div>
                <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p class="text-xs text-blue-600 dark:text-blue-400">Attendance Rate</p>
                    <p class="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        {{selectedEvent?.volunteers.length ? Math.round((selectedEvent.volunteers.filter(v =>
                            v.attended).length / selectedEvent.volunteers.length) * 100) : 0 }}%
                    </p>
                </div>
            </div>
        </div>

        <!-- Attendance table -->
        <AttendanceTable v-if="selectedEvent" :volunteers="filteredVolunteers"
            @toggle-attendance="handleToggleAttendance" />
    </div>
</template>
