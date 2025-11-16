<script setup>
import { ref, computed, onMounted } from 'vue'
import EventsCalendarView from '@/components/events/events_calendar_view.vue'
import EventDetailPanel from '@/components/events/event_detail_panel.vue'
import EventFormModal from '@/components/events/event_form_modal.vue'
import { useEventsStore } from '@/stores/events_store.js'

const selectedEventId = ref(null)
const showEventForm = ref(false)
const editingEventId = ref(null)
// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const eventsStore = useEventsStore()

const selectedEvent = computed(() =>
    eventsStore.events.find(e => e.id === selectedEventId.value)
)

function selectEvent(eventId) {
    selectedEventId.value = eventId
}

function openNewEventForm() {
    editingEventId.value = null
    showEventForm.value = true
}

function openEditEventForm(eventId) {
    editingEventId.value = eventId
    showEventForm.value = true
}

function handleSaveEvent(eventData) {
    if (editingEventId.value) {
        eventsStore.updateEvent(editingEventId.value, eventData)
    } else {
        eventsStore.addEvent(eventData)
    }
    showEventForm.value = false
    editingEventId.value = null
}

function handleDeleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        eventsStore.deleteEvent(eventId)
        if (selectedEventId.value === eventId) {
            selectedEventId.value = null
        }
    }
}

onMounted(() => {
    if (eventsStore.events.length > 0 && !selectedEventId.value) {
        selectedEventId.value = eventsStore.events[0].id
    }
})
</script>

<template>
    <div class="grid grid-cols-12 gap-4 h-full">
        <!-- Left: Calendar View -->
        <section class="col-span-8">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">Events Calendar</h2>
                <button @click="openNewEventForm"
                    class="px-3 py-1.5 bg-kaitoke-green-500 text-white text-sm rounded-lg hover:bg-kaitoke-green-600 dark:bg-kaitoke-green-700 dark:hover:bg-kaitoke-green-600">
                    + New Event
                </button>
            </div>
            <EventsCalendarView :events="eventsStore.events" :selectedEventId="selectedEventId"
                @select-event="selectEvent" />
        </section>

        <!-- Right: Event Details Panel -->
        <section class="col-span-4">
            <EventDetailPanel v-if="selectedEvent" :event="selectedEvent" @edit="openEditEventForm"
                @delete="handleDeleteEvent" />
            <div v-else
                class="rounded-lg border border-gray-300 dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400">
                <p>Select an event to view details</p>
            </div>
        </section>

        <!-- Event Form Modal -->
        <EventFormModal v-model="showEventForm" :eventId="editingEventId" @save="handleSaveEvent" />
    </div>
</template>
