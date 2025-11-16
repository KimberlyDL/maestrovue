<script setup>
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
    events: { type: Array, default: () => [] },
    selectedEventId: { type: Number, default: null }
})

const emit = defineEmits(['select-event'])

const currentDate = ref(new Date(2025, 9, 1))

watch(() => props.events, () => {
    // Force re-computation of calendar when events change
}, { deep: true })

const monthYear = computed(() => {
    return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const daysInMonth = computed(() => {
    return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
    return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1).getDay()
})

const calendarDays = computed(() => {
    const days = []
    for (let i = 0; i < firstDayOfMonth.value; i++) {
        days.push(null)
    }
    for (let i = 1; i <= daysInMonth.value; i++) {
        days.push(i)
    }
    return days
})

const eventsMap = computed(() => {
    const map = {}
    props.events.forEach(event => {
        const date = new Date(event.date)
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        if (!map[key]) map[key] = []
        map[key].push(event)
    })
    return map
})

function getEventsForDay(day) {
    if (!day) return []
    const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    return eventsMap.value[key] || []
}

function previousMonth() {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

function nextMonth() {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}

function selectEvent(eventId) {
    emit('select-event', eventId)
}
</script>

<template>
    <div class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-abyss-900 dark:text-platinum-300">{{ monthYear }}</h3>
            <div class="flex gap-2">
                <button @click="previousMonth" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    <ChevronLeft :size="20" />
                </button>
                <button @click="nextMonth" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    <ChevronRight :size="20" />
                </button>
            </div>
        </div>

        <!-- Day headers -->
        <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day"
                class="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">
                {{ day }}
            </div>
        </div>

        <!-- Calendar grid -->
        <div class="grid grid-cols-7 gap-1">
            <div v-for="(day, idx) in calendarDays" :key="idx"
                class="aspect-square rounded border border-gray-200 dark:border-gray-800 p-1 min-h-24 bg-gray-50 dark:bg-gray-900 overflow-hidden"
                :class="{ 'bg-white dark:bg-abyss-950': day }">

                <div v-if="day" class="h-full flex flex-col">
                    <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{{ day }}</span>
                    <div class="flex-1 space-y-0.5 overflow-y-auto">
                        <button v-for="event in getEventsForDay(day)" :key="event.id" @click="selectEvent(event.id)"
                            class="w-full text-left text-xs px-1 py-0.5 rounded truncate transition-colors" :class="[
                                event.id === selectedEventId
                                    ? 'bg-kaitoke-green-500 text-white'
                                    : 'bg-sun-200 text-abyss-900 dark:bg-sun-900 dark:text-sun-200 hover:bg-sun-300 dark:hover:bg-sun-800'
                            ]" :title="event.title">
                            {{ event.title }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
