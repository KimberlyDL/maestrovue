<script setup>
import { ref, computed } from 'vue'
import { useEventsStore } from '@/stores/events_store.js'
import VolunteersList from '@/components/events/volunteers_list.vue'
import VolunteerFormModal from '@/components/events/volunteer_form_modal.vue'
import { Search } from 'lucide-vue-next'

// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const eventsStore = useEventsStore()
const selectedEventId = ref(null)
const searchQuery = ref('')
const showVolunteerForm = ref(false)
const editingVolunteerId = ref(null)

const selectedEvent = computed(() =>
    eventsStore.events.find(e => e.id === selectedEventId.value)
)

const filteredVolunteers = computed(() => {
    if (!selectedEvent.value) return []
    return selectedEvent.value.volunteers.filter(v =>
        v.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        v.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

function openNewVolunteerForm() {
    editingVolunteerId.value = null
    showVolunteerForm.value = true
}

function openEditVolunteerForm(volunteerId) {
    editingVolunteerId.value = volunteerId
    showVolunteerForm.value = true
}

function handleSaveVolunteer(volunteerData) {
    if (editingVolunteerId.value) {
        eventsStore.updateVolunteer(selectedEventId.value, editingVolunteerId.value, volunteerData)
    } else {
        eventsStore.addVolunteer(selectedEventId.value, volunteerData)
    }
    showVolunteerForm.value = false
    editingVolunteerId.value = null
}

function handleDeleteVolunteer(volunteerId) {
    if (confirm('Remove this volunteer?')) {
        eventsStore.removeVolunteer(selectedEventId.value, volunteerId)
    }
}

function handleToggleAttendance(volunteerId) {
    eventsStore.toggleVolunteerAttendance(selectedEventId.value, volunteerId)
}
</script>

<template>
    <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">Volunteer Management</h2>
            <button @click="openNewVolunteerForm"
                class="px-3 py-1.5 bg-kaitoke-green-500 text-white text-sm rounded-lg hover:bg-kaitoke-green-600 dark:bg-kaitoke-green-700 dark:hover:bg-kaitoke-green-600">
                + Add Volunteer
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

        <!-- Search and filters -->
        <div class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div class="flex items-center gap-2 mb-4">
                <Search :size="18" class="text-gray-400" />
                <input v-model="searchQuery" type="text" placeholder="Search volunteers..."
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-abyss-900 dark:text-platinum-300 focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent" />
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-4 gap-3">
                <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p class="text-xs text-gray-600 dark:text-gray-400">Total Volunteers</p>
                    <p class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">{{
                        selectedEvent?.volunteers.length || 0 }}</p>
                </div>
                <div class="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                    <p class="text-xs text-emerald-600 dark:text-emerald-400">Attended</p>
                    <p class="text-lg font-semibold text-emerald-700 dark:text-emerald-300">{{
                        selectedEvent?.volunteers.filter(v => v.attended).length || 0 }}</p>
                </div>
                <div class="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <p class="text-xs text-red-600 dark:text-red-400">No-show</p>
                    <p class="text-lg font-semibold text-red-700 dark:text-red-300">{{
                        selectedEvent?.volunteers.filter(v => !v.attended).length || 0 }}</p>
                </div>
                <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p class="text-xs text-blue-600 dark:text-blue-400">Needed</p>
                    <p class="text-lg font-semibold text-blue-700 dark:text-blue-300">{{ selectedEvent?.volunteersNeeded
                        || 0 }}</p>
                </div>
            </div>
        </div>

        <!-- Volunteers list -->
        <VolunteersList v-if="selectedEvent" :volunteers="filteredVolunteers" @edit="openEditVolunteerForm"
            @delete="handleDeleteVolunteer" @toggle-attendance="handleToggleAttendance" />

        <!-- Volunteer form modal -->
        <VolunteerFormModal v-model="showVolunteerForm" :volunteerId="editingVolunteerId" :eventId="selectedEventId"
            @save="handleSaveVolunteer" />
    </div>
</template>
