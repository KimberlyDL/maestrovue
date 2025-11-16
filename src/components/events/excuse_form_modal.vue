<template>
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div class="px-6 py-4 border-b border-platinum-200 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-abyss-900">
                    {{ excuse ? "Edit Excuse" : "Add New Excuse" }}
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
                    <label class="block text-sm font-medium text-abyss-900 mb-1">Volunteer</label>
                    <input v-model="formData.volunteerName" type="text" placeholder="Volunteer name"
                        class="w-full px-3 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green"
                        required />
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 mb-1">Reason</label>
                    <select v-model="formData.reason"
                        class="w-full px-3 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green"
                        required>
                        <option value="">Select reason</option>
                        <option value="Illness">Illness</option>
                        <option value="Personal emergency">Personal emergency</option>
                        <option value="Family matter">Family matter</option>
                        <option value="Work conflict">Work conflict</option>
                        <option value="Transportation issue">Transportation issue</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 mb-1">Description</label>
                    <textarea v-model="formData.description" placeholder="Provide more details..." rows="3"
                        class="w-full px-3 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green" />
                </div>

                <div class="flex gap-3 pt-4">
                    <button type="button" @click="$emit('close')"
                        class="flex-1 px-4 py-2 border border-platinum-300 text-abyss-900 rounded-lg hover:bg-platinum-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit"
                        class="flex-1 px-4 py-2 bg-kaitoke-green text-white rounded-lg hover:bg-kaitoke-green/90 transition-colors">
                        {{ excuse ? "Update" : "Add" }}
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
    excuse: Object,
    events: Array,
})

const emit = defineEmits(["save", "close"])

const formData = ref({
    eventId: "",
    volunteerId: "",
    volunteerName: "",
    reason: "",
    description: "",
})

watch(
    () => props.excuse,
    (newExcuse) => {
        if (newExcuse) {
            formData.value = { ...newExcuse }
        }
    },
    { immediate: true }
)

function handleSubmit() {
    emit("save", formData.value)
}
</script>
