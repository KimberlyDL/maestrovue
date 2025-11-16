<script setup>
import { ref, watch, computed } from 'vue'
import { useEventsStore } from '@/stores/events_store.js'
import { X } from 'lucide-vue-next'

// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const eventsStore = useEventsStore()

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    eventId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'save'])

const form = ref({
    title: '',
    description: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    volunteersNeeded: 10,
    status: 'upcoming'
})

const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

watch(() => props.eventId, (newId) => {
    if (newId) {
        const event = eventsStore.events.find(e => e.id === newId)
        if (event) {
            form.value = { ...event }
        }
    } else {
        resetForm()
    }
}, { immediate: true })

function resetForm() {
    form.value = {
        title: '',
        description: '',
        date: '',
        startTime: '09:00',
        endTime: '17:00',
        location: '',
        volunteersNeeded: 10,
        status: 'upcoming'
    }
}

function handleSave() {
    if (!form.value.title || !form.value.date || !form.value.location) {
        alert('Please fill in all required fields')
        return
    }
    emit('save', { ...form.value })
    isOpen.value = false
}

function handleClose() {
    isOpen.value = false
    resetForm()
}
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div
                    class="bg-white dark:bg-abyss-950 rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                    <!-- Header -->
                    <div
                        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-abyss-950">
                        <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">
                            {{ eventId ? 'Edit Event' : 'Create New Event' }}
                        </h3>
                        <button @click="handleClose" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                            <X :size="20" />
                        </button>
                    </div>

                    <!-- Form -->
                    <div class="p-4 space-y-4">
                        <!-- Title -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Event Title *
                            </label>
                            <input v-model="form.title" type="text"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-abyss-900 dark:text-platinum-300 focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent"
                                placeholder="Enter event title" />
                        </div>

                        <!-- Description -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea v-model="form.description" rows="3"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-abyss-900 dark:text-platinum-300 focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent"
                                placeholder="Enter event description" />
                        </div>

                        <!-- Date -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Date *
                            </label>
                            <input v-model="form.date" type="date"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-abyss-900 dark:text-platinum-300 focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent" />
                        </div>

                        <!-- Time -->
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Start Time
                                </label>
                                <input v-model="form.startTime" type="time"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-abyss-900 dark:text-platinum-300 focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    End Time
                                </label>
                                <input v-model="form.endTime" type="time"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-abyss-900 dark:text-platinum-300 focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent" />
                            </div>
                        </div>

                        <!-- Location -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Location *
                            </label>
                            <input v-model="form.location" type="text"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-abyss-900 dark:text-platinum-300 focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent"
                                placeholder="Enter event location" />
                        </div>

                        <!-- Volunteers Needed -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Volunteers Needed
                            </label>
                            <input v-model.number="form.volunteersNeeded" type="number" min="1"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-abyss-900 dark:text-platinum-300 focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent" />
                        </div>

                        <!-- Status -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <select v-model="form.status"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-abyss-900 dark:text-platinum-300 focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent">
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div
                        class="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-abyss-950">
                        <button @click="handleClose"
                            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Cancel
                        </button>
                        <button @click="handleSave"
                            class="flex-1 px-3 py-2 bg-kaitoke-green-500 text-white rounded-lg hover:bg-kaitoke-green-600 dark:bg-kaitoke-green-700 dark:hover:bg-kaitoke-green-600 transition-colors">
                            {{ eventId ? 'Update' : 'Create' }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>
