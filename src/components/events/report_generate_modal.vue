<template>
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div class="px-6 py-4 border-b border-platinum-200 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-abyss-900">Generate Event Report</h2>
                <button @click="$emit('close')" class="text-platinum-600 hover:text-abyss-900">
                    <X :size="20" />
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-abyss-900 mb-1">Event</label>
                    <select v-model="formData.eventId" @change="updateEventData"
                        class="w-full px-3 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green"
                        required>
                        <option value="">Select an event</option>
                        <option v-for="event in events" :key="event.id" :value="event.id">
                            {{ event.title }}
                        </option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 mb-1">Total Volunteers</label>
                    <input v-model.number="formData.totalVolunteers" type="number" min="0"
                        class="w-full px-3 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green"
                        required />
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 mb-1">Attended Volunteers</label>
                    <input v-model.number="formData.attendedVolunteers" type="number" min="0"
                        class="w-full px-3 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green"
                        required />
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 mb-1">Excuses Submitted</label>
                    <input v-model.number="formData.excusesSubmitted" type="number" min="0"
                        class="w-full px-3 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green"
                        required />
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 mb-1">Hours Contributed</label>
                    <input v-model.number="formData.hoursContributed" type="number" min="0" step="0.5"
                        class="w-full px-3 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green"
                        required />
                </div>

                <div class="flex gap-3 pt-4">
                    <button type="button" @click="$emit('close')"
                        class="flex-1 px-4 py-2 border border-platinum-300 text-abyss-900 rounded-lg hover:bg-platinum-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit"
                        class="flex-1 px-4 py-2 bg-kaitoke-green text-white rounded-lg hover:bg-kaitoke-green/90 transition-colors">
                        Generate
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue"
import { X } from "lucide-vue-next"

const props = defineProps({
    events: Array,
})

const emit = defineEmits(["save", "close"])

const formData = ref({
    eventId: "",
    eventTitle: "",
    eventDate: "",
    totalVolunteers: 0,
    attendedVolunteers: 0,
    excusesSubmitted: 0,
    hoursContributed: 0,
})

function updateEventData() {
    const event = props.events.find((e) => e.id === parseInt(formData.value.eventId))
    if (event) {
        formData.value.eventTitle = event.title
        formData.value.eventDate = event.date
        formData.value.totalVolunteers = event.volunteers.length
        formData.value.attendedVolunteers = event.volunteers.filter((v) => v.attended).length
    }
}

function handleSubmit() {
    emit("save", formData.value)
}
</script>
