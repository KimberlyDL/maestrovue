<script setup>
import { ref, computed, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useOpsStore } from '@/stores/ops_store.js'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    scheduleId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'save'])

// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const opsStore = useOpsStore()

const formData = ref({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    status: 'scheduled'
})

const isEditing = computed(() => props.scheduleId !== null)

watch(() => props.modelValue, (newVal) => {
    if (newVal && isEditing.value) {
        const schedule = opsStore.schedules.find(s => s.id === props.scheduleId)
        if (schedule) {
            formData.value = { ...schedule }
        }
    } else if (newVal) {
        formData.value = {
            title: '',
            date: '',
            startTime: '',
            endTime: '',
            location: '',
            description: '',
            status: 'scheduled'
        }
    }
})

function handleSave() {
    if (!formData.value.title || !formData.value.date) {
        alert('Please fill in all required fields')
        return
    }
    emit('save', formData.value)
}

function handleClose() {
    emit('update:modelValue', false)
}
</script>

<template>
    <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
            class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">
                    {{ isEditing ? 'Edit Schedule' : 'New Schedule' }}
                </h2>
                <button @click="handleClose" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    <X :size="20" />
                </button>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-1">Title *</label>
                    <input v-model="formData.title" type="text"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300"
                        placeholder="e.g., Morning Operations" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-1">Date *</label>
                    <input v-model="formData.date" type="date"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-1">Start
                            Time</label>
                        <input v-model="formData.startTime" type="time"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-1">End
                            Time</label>
                        <input v-model="formData.endTime" type="time"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300" />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-1">Location</label>
                    <input v-model="formData.location" type="text"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300"
                        placeholder="e.g., Main Office" />
                </div>

                <div>
                    <label
                        class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-1">Description</label>
                    <textarea v-model="formData.description"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300"
                        placeholder="Add details about this schedule" rows="3" />
                </div>

                <div class="flex gap-3 pt-4">
                    <button @click="handleClose"
                        class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-abyss-900 dark:text-platinum-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                        Cancel
                    </button>
                    <button @click="handleSave"
                        class="flex-1 px-4 py-2 bg-electric-lime-500 text-abyss-900 rounded-lg hover:bg-electric-lime-600 font-medium">
                        {{ isEditing ? 'Update' : 'Create' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
