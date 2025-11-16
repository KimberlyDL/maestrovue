<script setup>
import { ref, computed, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { useOpsStore } from '@/stores/ops_store.js'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    templateId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'save'])

// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const opsStore = useOpsStore()

const formData = ref({
    title: '',
    description: '',
    staffId: null,
    staffName: '',
    staffIds: [],
    staffNames: [],
    role: '',
    recurrence: 'weekly',
    recurrencePattern: {
        frequency: 'weekly',
        daysOfWeek: [5],
        interval: 1,
    },
    startTime: '08:00',
    endTime: '17:00',
    location: '',
    startDate: '',
    endDate: null,
    status: 'active'
})

const isEditing = computed(() => props.templateId !== null)

const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
]

watch(() => props.modelValue, (newVal) => {
    if (newVal && isEditing.value) {
        const template = opsStore.scheduleTemplates.find(t => t.id === props.templateId)
        if (template) {
            formData.value = { ...template }
        }
    } else if (newVal) {
        formData.value = {
            title: '',
            description: '',
            staffId: null,
            staffName: '',
            staffIds: [],
            staffNames: [],
            role: '',
            recurrence: 'weekly',
            recurrencePattern: {
                frequency: 'weekly',
                daysOfWeek: [5],
                interval: 1,
            },
            startTime: '08:00',
            endTime: '17:00',
            location: '',
            startDate: '',
            endDate: null,
            status: 'active'
        }
    }
})

function toggleDayOfWeek(day) {
    const index = formData.value.recurrencePattern.daysOfWeek.indexOf(day)
    if (index > -1) {
        formData.value.recurrencePattern.daysOfWeek.splice(index, 1)
    } else {
        formData.value.recurrencePattern.daysOfWeek.push(day)
    }
}

function handleSave() {
    if (!formData.value.title || !formData.value.staffName && !formData.value.staffNames.length) {
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
    <div v-if="modelValue"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
        <div
            class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md my-8">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">
                    {{ isEditing ? 'Edit Schedule Template' : 'New Schedule Template' }}
                </h2>
                <button @click="handleClose" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    <X :size="20" />
                </button>
            </div>

            <div class="space-y-4 max-h-96 overflow-y-auto">
                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-1">Title *</label>
                    <input v-model="formData.title" type="text"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300"
                        placeholder="e.g., Officer 1 - Friday Duty" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-1">Staff Name
                        *</label>
                    <input v-model="formData.staffName" type="text"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300"
                        placeholder="e.g., Officer 1" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-1">Role</label>
                    <input v-model="formData.role" type="text"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300"
                        placeholder="e.g., Duty Officer" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">Recurrence
                        Pattern</label>
                    <div class="space-y-2">
                        <select v-model="formData.recurrencePattern.frequency"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300">
                            <option value="weekly">Weekly</option>
                            <option value="quarterly">Quarterly</option>
                        </select>

                        <div v-if="formData.recurrencePattern.frequency === 'weekly'" class="space-y-2">
                            <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Days of Week</label>
                            <div class="grid grid-cols-4 gap-2">
                                <label v-for="day in daysOfWeek" :key="day.value"
                                    class="flex items-center gap-2 text-sm">
                                    <input type="checkbox"
                                        :checked="formData.recurrencePattern.daysOfWeek.includes(day.value)"
                                        @change="toggleDayOfWeek(day.value)" class="rounded" />
                                    <span>{{ day.label.slice(0, 3) }}</span>
                                </label>
                            </div>

                            <div>
                                <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Interval
                                    (weeks)</label>
                                <input v-model.number="formData.recurrencePattern.interval" type="number" min="1"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300" />
                            </div>
                        </div>
                    </div>
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
                        placeholder="Add details about this schedule" rows="2" />
                </div>
            </div>

            <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
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
</template>
