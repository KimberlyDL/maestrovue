<script setup>
import { ref, computed, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useOpsStore } from '@/stores/ops_store.js'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    shiftId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'save'])

// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const opsStore = useOpsStore()

const formData = ref({
    scheduleId: null,
    title: '',
    startTime: '',
    endTime: '',
    capacity: 1
})

const isEditing = computed(() => props.shiftId !== null)

watch(() => props.modelValue, (newVal) => {
    if (newVal && isEditing.value) {
        const shift = opsStore.shifts.find(s => s.id === props.shiftId)
        if (shift) {
            formData.value = { ...shift }
        }
    } else if (newVal) {
        formData.value = {
            scheduleId: null,
            title: '',
            startTime: '',
            endTime: '',
            capacity: 1
        }
    }
})

function handleSave() {
    if (!formData.value.title || !formData.value.scheduleId) {
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
                    {{ isEditing ? 'Edit Shift' : 'New Shift' }}
                </h2>
                <button @click="handleClose" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    <X :size="20" />
                </button>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-1">Schedule
                        *</label>
                    <select v-model.number="formData.scheduleId"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300">
                        <option :value="null">Select a schedule</option>
                        <option v-for="schedule in opsStore.schedules" :key="schedule.id" :value="schedule.id">
                            {{ schedule.title }}
                        </option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-1">Shift Title
                        *</label>
                    <input v-model="formData.title" type="text"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300"
                        placeholder="e.g., Reception Desk" />
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
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-1">Capacity</label>
                    <input v-model.number="formData.capacity" type="number" min="1"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300" />
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
