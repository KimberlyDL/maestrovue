<script setup>
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
    shifts: { type: Array, default: () => [] },
    selectedTemplateId: { type: Number, default: null },
    currentMonth: { type: Date, required: true }
})

const emit = defineEmits(['select-template'])

watch(() => props.shifts, () => {
    // Force re-computation when shifts change
}, { deep: true })

const monthYear = computed(() => {
    return props.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const daysInMonth = computed(() => {
    return new Date(props.currentMonth.getFullYear(), props.currentMonth.getMonth() + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
    return new Date(props.currentMonth.getFullYear(), props.currentMonth.getMonth(), 1).getDay()
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

const shiftsMap = computed(() => {
    const map = {}
    props.shifts.forEach(shift => {
        const date = new Date(shift.date)
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        if (!map[key]) map[key] = []
        map[key].push(shift)
    })
    return map
})

function getShiftsForDay(day) {
    if (!day) return []
    const date = new Date(props.currentMonth.getFullYear(), props.currentMonth.getMonth(), day)
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    return shiftsMap.value[key] || []
}

function selectShift(templateId) {
    emit('select-template', templateId)
}
</script>

<template>
    <div class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
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
                        <button v-for="shift in getShiftsForDay(day)" :key="shift.id"
                            @click="selectShift(shift.templateId)"
                            class="w-full text-left text-xs px-1 py-0.5 rounded truncate transition-colors" :class="[
                                shift.templateId === selectedTemplateId
                                    ? 'bg-electric-lime-500 text-abyss-900'
                                    : 'bg-electric-lime-200 text-abyss-900 dark:bg-electric-lime-900 dark:text-electric-lime-200 hover:bg-electric-lime-300 dark:hover:bg-electric-lime-800'
                            ]" :title="`${shift.staffName || shift.staffNames?.join(', ')} - ${shift.startTime}`">
                            {{ shift.staffName || shift.staffNames?.[0] }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
