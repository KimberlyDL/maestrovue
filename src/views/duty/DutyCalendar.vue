<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDutyStore } from '@/stores/duty'
import { useOrganizationStore } from '@/stores/organization'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import DutyScheduleModal from '@/components/duty/duty_schedule_modal.vue'
import DutyDetailModal from '@/components/duty/duty_detail_modal.vue'
import { Calendar, Plus, Filter, Download } from 'lucide-vue-next'
import { useToast } from '@/utils/useToast'

const route = useRoute()
const dutyStore = useDutyStore()
const orgStore = useOrganizationStore()
const toast = useToast()

const calendarRef = ref(null)
const showScheduleModal = ref(false)
const showDetailModal = ref(false)
const selectedDuty = ref(null)
const selectedDate = ref(null)
const filterStatus = ref('all')
const loading = ref(false)

const organizationId = computed(() => route.params.id || orgStore.currentOrgId)

const calendarOptions = ref({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    events: [],
    eventClick: handleEventClick,
    dateClick: handleDateClick,
    eventDrop: handleEventDrop,
    datesSet: handleDatesSet,
    height: 'auto',
    eventClassNames: (arg) => {
        const status = arg.event.extendedProps.status
        const needsOfficers = arg.event.extendedProps.required_officers > arg.event.extendedProps.assigned_count

        return [
            'cursor-pointer',
            'transition-all',
            status === 'draft' && 'opacity-60',
            status === 'cancelled' && 'line-through',
            needsOfficers && 'border-l-4 border-rose-500'
        ]
    },
    eventContent: (arg) => {
        const assigned = arg.event.extendedProps.assigned_count || 0
        const required = arg.event.extendedProps.required_officers || 0
        const needsCoverage = assigned < required

        const startTime = arg.event.start ? arg.event.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''
        const endTime = arg.event.end ? arg.event.end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''
        const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : ''

        return {
            html: `
                <div class="p-1">
                    <div class="font-semibold text-xs truncate">${arg.event.title}</div>
                    <div class="text-xs mt-0.5 text-platinum-500 dark:text-platinum-400">${timeRange}</div>
                    <div class="text-xs mt-1 flex items-center gap-1">
                        <span class="${needsCoverage ? 'text-rose-600 font-semibold' : 'text-emerald-600'}">
                            ${assigned}/${required}
                        </span>
                        ${arg.event.extendedProps.location ? `<span class="truncate">• ${arg.event.extendedProps.location}</span>` : ''}
                    </div>
                </div>
            `
        }
    }
})

onMounted(async () => {
    setTimeout(() => {
        loadCalendarEvents()
    }, 100)
})

function handleDatesSet(dateInfo) {
    console.log('Calendar view changed:', dateInfo)
    loadCalendarEvents()
}

function normalizeDateTime(dateString) {
    if (!dateString) return null

    // Handle malformed format like "2025-11-12 00:00:00T09:00:00"
    // Extract the date part and the time part (after T)
    if (dateString.includes('T')) {
        const parts = dateString.split('T')
        // Take date and use time from after T
        const datePart = parts[0].split(' ')[0] // Get just YYYY-MM-DD
        const timePart = parts[1] || '00:00:00'
        return `${datePart}T${timePart}`
    }

    // Handle "2025-11-12 09:00:00" format
    if (dateString.includes(' ') && !dateString.includes('T')) {
        return dateString.replace(' ', 'T')
    }

    return dateString
}

async function loadCalendarEvents() {
    if (loading.value) return

    loading.value = true
    try {
        const calendarApi = calendarRef.value?.getApi()
        if (!calendarApi) {
            console.error('Calendar API not available')
            loading.value = false
            return
        }

        const view = calendarApi.view
        const start = view.currentStart.toISOString().split('T')[0]
        const end = view.currentEnd.toISOString().split('T')[0]

        console.log('Loading events from', start, 'to', end)

        const events = await dutyStore.fetchCalendar(organizationId.value, start, end)

        console.log('Fetched events:', events)

        // Remove all existing events first
        const existingEvents = calendarApi.getEvents()
        existingEvents.forEach(event => event.remove())

        // Add new events
        if (events && events.length > 0) {
            events.forEach(event => {
                const normalizedStart = normalizeDateTime(event.start)
                const normalizedEnd = normalizeDateTime(event.end)

                console.log(`[v0] Normalized event ${event.id}: ${event.start} -> ${normalizedStart}`)

                const eventColor = getEventColor(event.status, event.assigned_count, event.required_officers)
                const borderColor = getEventBorderColor(event.status)

                calendarApi.addEvent({
                    id: event.id.toString(),
                    title: event.title,
                    start: normalizedStart,
                    end: normalizedEnd,
                    backgroundColor: eventColor,
                    borderColor: borderColor,
                    extendedProps: {
                        ...event,
                        status: event.status,
                        required_officers: event.required_officers,
                        assigned_count: event.assigned_count,
                        location: event.location,
                        description: event.description
                    }
                })
            })
            console.log('Added', events.length, 'events to calendar')
        } else {
            console.log('No events to display')
        }
    } catch (error) {
        console.error('Failed to load calendar events:', error)
    } finally {
        loading.value = false
    }
}

function getEventColor(status, assigned, required) {
    if (status === 'cancelled') return '#ef4444'
    if (status === 'completed') return '#10b981'
    if (status === 'draft') return '#6b7280'
    if (assigned < required) return '#f59e0b'
    return '#3b82f6'
}

function getEventBorderColor(status) {
    if (status === 'cancelled') return '#dc2626'
    if (status === 'completed') return '#059669'
    if (status === 'draft') return '#4b5563'
    return '#2563eb'
}

function handleEventClick(info) {
    console.log('Event clicked:', info.event.extendedProps)
    selectedDuty.value = {
        id: info.event.id,
        ...info.event.extendedProps
    }
    showDetailModal.value = true
}

function handleDateClick(info) {
    selectedDate.value = info.dateStr
    selectedDuty.value = null
    showScheduleModal.value = true
}

async function handleEventDrop(info) {
    try {
        const newDate = info.event.start.toISOString().split('T')[0]
        await dutyStore.updateSchedule(organizationId.value, info.event.id, {
            date: newDate
        })
        await loadCalendarEvents()
    } catch (error) {
        console.error('Failed to update event:', error)
        info.revert()
    }
}

function openNewSchedule() {
    selectedDate.value = new Date().toISOString().split('T')[0]
    selectedDuty.value = null
    showScheduleModal.value = true
}

async function handleScheduleSaved() {
    showScheduleModal.value = false
    showDetailModal.value = false
    await loadCalendarEvents()
}

async function exportCalendar() {
    toast.info('Export feature coming soon!')
}
</script>

<template>
    <div class="max-w-7xl px-4 sm:px-6 py-6 lg:px-8">
        <div class="h-full flex flex-col gap-4">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 rounded-lg">
                        <Calendar class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-abyss-900 dark:text-platinum-50">Duty Calendar</h1>
                        <p class="text-sm text-platinum-600 dark:text-platinum-400">Schedule and manage officer duties
                        </p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button @click="exportCalendar"
                        class="flex items-center gap-2 px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 text-abyss-900 dark:text-platinum-200 hover:bg-platinum-100 dark:hover:bg-abyss-700">
                        <Download :size="18" />
                        Export
                    </button>
                    <button @click="openNewSchedule"
                        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white">
                        <Plus :size="18" />
                        New Duty
                    </button>
                </div>
            </div>

            <!-- Filters & Legend -->
            <div
                class="flex items-center justify-between p-4 bg-white dark:bg-abyss-800 rounded-lg border border-platinum-200 dark:border-abyss-700">
                <div class="flex gap-4 items-center flex-wrap">
                    <div class="flex items-center gap-2">
                        <Filter :size="16" class="text-platinum-600" />
                        <span class="text-sm font-medium text-abyss-900 dark:text-platinum-300">Status:</span>
                    </div>
                    <select v-model="filterStatus" @change="loadCalendarEvents"
                        class="px-3 py-1.5 text-sm rounded-md border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300">
                        <option value="all">All</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <!-- Legend -->
                <div class="flex gap-4 items-center text-xs">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded bg-blue-500"></div>
                        <span class="text-platinum-600 dark:text-platinum-400">Staffed</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded bg-amber-500"></div>
                        <span class="text-platinum-600 dark:text-platinum-400">Needs Officers</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded bg-emerald-500"></div>
                        <span class="text-platinum-600 dark:text-platinum-400">Completed</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded bg-gray-500"></div>
                        <span class="text-platinum-600 dark:text-platinum-400">Draft</span>
                    </div>
                </div>
            </div>

            <!-- Loading Indicator -->
            <div v-if="loading" class="absolute top-20 right-4 z-10">
                <div
                    class="px-4 py-2 bg-white dark:bg-abyss-800 rounded-lg shadow-lg border border-platinum-200 dark:border-abyss-700">
                    <div class="flex items-center gap-2">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-kaitoke-green-600"></div>
                        <span class="text-sm text-platinum-600 dark:text-platinum-400">Loading events...</span>
                    </div>
                </div>
            </div>

            <!-- Calendar -->
            <div
                class="flex-1 bg-white dark:bg-abyss-800 rounded-lg border border-platinum-200 dark:border-abyss-700 p-4 overflow-hidden relative">
                <FullCalendar ref="calendarRef" :options="calendarOptions" class="duty-calendar" />
            </div>

            <!-- Modals -->
            <DutyScheduleModal v-if="showScheduleModal" :duty="selectedDuty" :initial-date="selectedDate"
                :organization-id="organizationId" @close="showScheduleModal = false" @saved="handleScheduleSaved" />

            <DutyDetailModal v-if="showDetailModal" :duty="selectedDuty" :organization-id="organizationId"
                @close="showDetailModal = false" @updated="handleScheduleSaved" @deleted="handleScheduleSaved" />
        </div>
    </div>
</template>

<style>
@reference "@/style.css";

.duty-calendar {
    height: 100%;
}

.duty-calendar .fc {
    height: 100%;
}

.duty-calendar .fc-event {
    @apply cursor-pointer transition-all hover:opacity-80;
}

.duty-calendar .fc-daygrid-event {
    @apply rounded-md overflow-hidden;
}

/* Dark mode support */
.dark .fc {
    @apply text-platinum-200;
}

.dark .fc-theme-standard td,
.dark .fc-theme-standard th {
    @apply border-abyss-700;
}

.dark .fc-theme-standard .fc-scrollgrid {
    @apply border-abyss-700;
}

.dark .fc-col-header-cell {
    @apply bg-abyss-900;
}

.dark .fc-daygrid-day {
    @apply bg-abyss-800;
}

.dark .fc-day-today {
    @apply bg-kaitoke-green-900/20;
}

.dark .fc-button {
    @apply bg-abyss-700 border-abyss-600;
}

.dark .fc-button:hover {
    @apply bg-abyss-600;
}

.dark .fc-button-active {
    @apply bg-kaitoke-green-600;
}
</style>
