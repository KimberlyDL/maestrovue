<script setup>
import { computed } from 'vue'
import { Edit2, Trash2, Users, MapPin, Clock, AlertCircle } from 'lucide-vue-next'

const props = defineProps({
    event: { type: Object, required: true }
})

const emit = defineEmits(['edit', 'delete'])

const formattedDate = computed(() => {
    const date = new Date(props.event.date)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
})

const volunteerCount = computed(() => {
    return props.event.volunteers?.length || 0
})

const attendanceCount = computed(() => {
    return props.event.volunteers?.filter(v => v.attended).length || 0
})

const statusColor = computed(() => {
    switch (props.event.status) {
        case 'upcoming': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        case 'ongoing': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        case 'completed': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
        case 'cancelled': return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
})
</script>

<template>
    <div class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <!-- Header with actions -->
        <div class="flex items-start justify-between mb-4">
            <div>
                <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">{{ event.title }}</h3>
                <span class="inline-block mt-2 text-xs px-2 py-1 rounded-full" :class="statusColor">
                    {{ event.status }}
                </span>
            </div>
            <div class="flex gap-2">
                <button @click="$emit('edit', event.id)"
                    class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors" title="Edit event">
                    <Edit2 :size="18" class="text-gray-600 dark:text-gray-400" />
                </button>
                <button @click="$emit('delete', event.id)"
                    class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Delete event">
                    <Trash2 :size="18" class="text-red-600 dark:text-red-400" />
                </button>
            </div>
        </div>

        <!-- Event details -->
        <div class="space-y-3 mb-4">
            <div class="flex items-start gap-3">
                <Clock :size="18" class="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Date & Time</p>
                    <p class="text-sm text-abyss-900 dark:text-platinum-300">{{ formattedDate }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-500">{{ event.startTime }} - {{ event.endTime }}</p>
                </div>
            </div>

            <div class="flex items-start gap-3">
                <MapPin :size="18" class="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Location</p>
                    <p class="text-sm text-abyss-900 dark:text-platinum-300">{{ event.location }}</p>
                </div>
            </div>

            <div class="flex items-start gap-3">
                <AlertCircle :size="18" class="text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Description</p>
                    <p class="text-sm text-abyss-900 dark:text-platinum-300">{{ event.description }}</p>
                </div>
            </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
                <p class="text-xs text-gray-600 dark:text-gray-400">Volunteers Needed</p>
                <p class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">{{ event.volunteersNeeded }}</p>
            </div>
            <div>
                <p class="text-xs text-gray-600 dark:text-gray-400">Registered</p>
                <p class="text-lg font-semibold text-kaitoke-green-600 dark:text-kaitoke-green-400">{{ volunteerCount }}
                </p>
            </div>
            <div>
                <p class="text-xs text-gray-600 dark:text-gray-400">Attended</p>
                <p class="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{{ attendanceCount }}</p>
            </div>
            <div>
                <p class="text-xs text-gray-600 dark:text-gray-400">No-show</p>
                <p class="text-lg font-semibold text-red-600 dark:text-red-400">{{ volunteerCount - attendanceCount }}
                </p>
            </div>
        </div>

        <!-- Quick actions -->
        <div class="flex gap-2">
            <button
                class="flex-1 px-3 py-2 bg-kaitoke-green-500 text-white text-sm rounded-lg hover:bg-kaitoke-green-600 dark:bg-kaitoke-green-700 dark:hover:bg-kaitoke-green-600 transition-colors">
                Manage Volunteers
            </button>
            <button
                class="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                Mark Attendance
            </button>
        </div>
    </div>
</template>
