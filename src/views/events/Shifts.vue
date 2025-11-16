<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold text-abyss-900">Event Shifts</h1>
                <p class="text-platinum-600 mt-1">Manage volunteer shifts and time slots</p>
            </div>
            <button @click="showAddModal = true"
                class="flex items-center gap-2 px-4 py-2 bg-kaitoke-green text-white rounded-lg hover:bg-kaitoke-green/90 transition-colors">
                <Plus :size="20" />
                Add Shift
            </button>
        </div>

        <!-- Event Filter -->
        <div class="flex gap-4">
            <select v-model="selectedEventId"
                class="px-4 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green">
                <option value="">All Events</option>
                <option v-for="event in eventsStore.events" :key="event.id" :value="event.id">
                    {{ event.title }}
                </option>
            </select>
        </div>

        <!-- Shifts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="shift in filteredShifts" :key="shift.id"
                class="bg-white rounded-lg border border-platinum-200 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-abyss-900">{{ shift.title }}</h3>
                        <p class="text-sm text-platinum-600">
                            {{ getEventTitle(shift.eventId) }}
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <button @click="editingShift = shift; showEditModal = true"
                            class="p-2 text-platinum-600 hover:bg-platinum-100 rounded transition-colors">
                            <Edit2 :size="18" />
                        </button>
                        <button @click="deleteShiftItem(shift.id)"
                            class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                            <Trash2 :size="18" />
                        </button>
                    </div>
                </div>

                <div class="space-y-3">
                    <div class="flex items-center gap-2 text-sm text-platinum-600">
                        <Clock :size="16" />
                        {{ shift.startTime }} - {{ shift.endTime }}
                    </div>
                    <div class="flex items-center gap-2 text-sm text-platinum-600">
                        <Users :size="16" />
                        {{ shift.volunteers.length }} / {{ shift.capacity }} volunteers
                    </div>

                    <div class="pt-3 border-t border-platinum-200">
                        <p class="text-xs font-semibold text-abyss-900 mb-2">Assigned Volunteers:</p>
                        <div class="space-y-1">
                            <div v-for="volunteerId in shift.volunteers" :key="volunteerId"
                                class="flex items-center justify-between text-sm">
                                <span class="text-platinum-700">{{ getVolunteerName(volunteerId) }}</span>
                                <button @click="removeVolunteerFromShift(shift.id, volunteerId)"
                                    class="text-red-600 hover:text-red-800">
                                    <X :size="16" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="filteredShifts.length === 0" class="text-center py-12 text-platinum-600">
            No shifts found
        </div>

        <!-- Add/Edit Modal -->
        <ShiftFormModal v-if="showAddModal" :events="eventsStore.events" @save="handleAddShift"
            @close="showAddModal = false" />

        <ShiftFormModal v-if="showEditModal" :shift="editingShift" :events="eventsStore.events"
            @save="handleUpdateShift" @close="showEditModal = false" />
    </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useEventsStore } from "@/stores/events_store"
import ShiftFormModal from "@/components/events/shift_form_modal.vue"
import { Plus, Edit2, Trash2, Clock, Users, X } from "lucide-vue-next"

// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const eventsStore = useEventsStore()

const selectedEventId = ref("")
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingShift = ref(null)

const filteredShifts = computed(() => {
    if (!selectedEventId.value) {
        return eventsStore.shifts
    }
    return eventsStore.shifts.filter((shift) => shift.eventId === parseInt(selectedEventId.value))
})

function getEventTitle(eventId) {
    const event = eventsStore.events.find((e) => e.id === eventId)
    return event?.title || "Unknown Event"
}

function getVolunteerName(volunteerId) {
    for (const event of eventsStore.events) {
        const volunteer = event.volunteers.find((v) => v.id === volunteerId)
        if (volunteer) return volunteer.name
    }
    return "Unknown Volunteer"
}

function handleAddShift(shiftData) {
    eventsStore.addShift(shiftData.eventId, shiftData)
    showAddModal.value = false
}

function handleUpdateShift(shiftData) {
    eventsStore.updateShift(editingShift.value.id, shiftData)
    showEditModal.value = false
    editingShift.value = null
}

function removeVolunteerFromShift(shiftId, volunteerId) {
    eventsStore.removeVolunteerFromShift(shiftId, volunteerId)
}

function deleteShiftItem(shiftId) {
    if (confirm("Are you sure you want to delete this shift?")) {
        eventsStore.deleteShift(shiftId)
    }
}
</script>
