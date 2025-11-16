<script setup>
import { Clock, MapPin, FileText, Edit2, Trash2, RotateCw, Users } from 'lucide-vue-next'
import { ref, computed } from 'vue'

const props = defineProps({
    template: { type: Object, required: true }
})

const emit = defineEmits(['edit', 'delete'])

const template = ref(props.template)

const recurrenceText = computed(() => {
    const pattern = template.value.recurrencePattern
    if (pattern.frequency === 'weekly') {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const dayNames = pattern.daysOfWeek.map(d => days[d]).join(', ')
        return `Every ${pattern.interval > 1 ? pattern.interval + ' weeks on ' : ''}${dayNames}`
    } else if (pattern.frequency === 'quarterly') {
        return `Every Q${pattern.quarter}`
    }
    return template.value.recurrence
})

function handleEdit() {
    emit('edit', template.value.id)
}

function handleDelete() {
    emit('delete', template.value.id)
}
</script>

<template>
    <div class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">{{ template.title }}</h3>
            <div class="flex gap-2">
                <button @click="handleEdit"
                    class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                    <Edit2 :size="18" />
                </button>
                <button @click="handleDelete"
                    class="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400">
                    <Trash2 :size="18" />
                </button>
            </div>
        </div>

        <div class="space-y-3">
            <!-- Added recurrence display -->
            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <RotateCw :size="16" />
                <span>{{ recurrenceText }}</span>
            </div>

            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock :size="16" />
                <span>{{ template.startTime }} - {{ template.endTime }}</span>
            </div>

            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin :size="16" />
                <span>{{ template.location }}</span>
            </div>

            <!-- Show assigned staff -->
            <div class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users :size="16" class="mt-0.5" />
                <div>
                    <p class="font-medium">{{ template.role }}</p>
                    <p class="text-xs">{{ template.staffName || template.staffNames?.join(', ') }}</p>
                </div>
            </div>

            <div class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FileText :size="16" class="mt-0.5" />
                <span>{{ template.description }}</span>
            </div>

            <div class="pt-2 border-t border-gray-200 dark:border-gray-800">
                <span class="inline-block px-2 py-1 rounded text-xs font-medium" :class="template.status === 'active'
                    ? 'bg-electric-lime-100 text-electric-lime-900 dark:bg-electric-lime-900 dark:text-electric-lime-200'
                    : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200'">
                    {{ template.status }}
                </span>
            </div>
        </div>
    </div>
</template>
