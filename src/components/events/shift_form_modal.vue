<template>
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div class="px-6 py-4 border-b border-platinum-200 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-abyss-900">
                    {{ shift ? "Edit Shift" : "Add New Shift" }}
                </h2>
                <button @click="$emit('close')" class="text-platinum-600 hover:text-abyss-900">
                    <X :size="20" />
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-abyss-900 mb-1">Event</label>
                    <select v-model="formData.eventId"
                        class="w-full px-3 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green"
                        required>
                        <option value="">Select an event</option>
                        <option v-for="event in events" :key="event.id" :value="event.id">
                            {{ event.title }}
                        </option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 mb-1">Shift Title</label>
                    <input v-model="formData.title" type="text" placeholder="e.g., Morning Shift"
                        class="w-full px-3 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green"
                        required />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-abyss-900 mb-1">Start Time</label>
                        <input v-model="formData.startTime" type="time"
                            class="w-full px-3 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green"
                            required />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-abyss-900 mb-1">End Time</label>
                        <input v-model="formData.endTime" type="time"
                            class="w-full px-3 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green"
                            required />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 mb-1">Capacity</label>
                    <input v-model.number="formData.capacity" type="number" min="1" placeholder="Number of volunteers"
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
                        {{ shift ? "Update" : "Add" }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { X } from "lucide-vue-next"

const props = defineProps({
    shift: Object,
    events: Array,
})

const emit = defineEmits(["save", "close"])

const formData = ref({
    eventId: "",
    title: "",
    startTime: "",
    endTime: "",
    capacity: 10,
})

watch(
    () => props.shift,
    (newShift) => {
        if (newShift) {
            formData.value = { ...newShift }
        }
    },
    { immediate: true }
)

function handleSubmit() {
    emit("save", formData.value)
}
</script>
