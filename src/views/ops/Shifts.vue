<script setup>
import { ref, computed } from 'vue'
import { Search, Plus, Edit2, Trash2, Users } from 'lucide-vue-next'
import ShiftFormModal from '@/components/ops/shift_form_modal.vue'
import { useOpsStore } from '@/stores/ops_store.js'

// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const opsStore = useOpsStore()

const searchQuery = ref('')
const selectedScheduleId = ref(null)
const showShiftForm = ref(false)
const editingShiftId = ref(null)

const filteredShifts = computed(() => {
    return opsStore.shifts.filter(shift => {
        const matchesSearch = shift.title.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesSchedule = !selectedScheduleId.value || shift.scheduleId === selectedScheduleId.value
        return matchesSearch && matchesSchedule
    })
})

function openNewShiftForm() {
    editingShiftId.value = null
    showShiftForm.value = true
}

function openEditShiftForm(shiftId) {
    editingShiftId.value = shiftId
    showShiftForm.value = true
}

function handleSaveShift(shiftData) {
    if (editingShiftId.value) {
        opsStore.updateShift(editingShiftId.value, shiftData)
    } else {
        opsStore.addShift(shiftData)
    }
    showShiftForm.value = false
    editingShiftId.value = null
}

function handleDeleteShift(shiftId) {
    if (confirm('Are you sure you want to delete this shift?')) {
        opsStore.deleteShift(shiftId)
    }
}

function getScheduleTitle(scheduleId) {
    return opsStore.schedules.find(s => s.id === scheduleId)?.title || 'Unknown'
}
</script>

<template>
    <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">Shifts & Slots</h2>
            <button @click="openNewShiftForm"
                class="flex items-center gap-2 px-3 py-1.5 bg-electric-lime-500 text-abyss-900 text-sm rounded-lg hover:bg-electric-lime-600 font-medium">
                <Plus :size="16" />
                New Shift
            </button>
        </div>

        <!-- Search and Filter -->
        <div class="flex gap-3">
            <div class="flex-1 relative">
                <Search :size="18" class="absolute left-3 top-2.5 text-gray-400" />
                <input v-model="searchQuery" type="text" placeholder="Search shifts..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300" />
            </div>
            <select v-model.number="selectedScheduleId"
                class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300">
                <option :value="null">All Schedules</option>
                <option v-for="schedule in opsStore.schedules" :key="schedule.id" :value="schedule.id">
                    {{ schedule.title }}
                </option>
            </select>
        </div>

        <!-- Shifts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="shift in filteredShifts" :key="shift.id"
                class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">

                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h3 class="font-semibold text-abyss-900 dark:text-platinum-300">{{ shift.title }}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ getScheduleTitle(shift.scheduleId) }}</p>
                    </div>
                    <div class="flex gap-2">
                        <button @click="openEditShiftForm(shift.id)"
                            class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                            <Edit2 :size="16" />
                        </button>
                        <button @click="handleDeleteShift(shift.id)"
                            class="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400">
                            <Trash2 :size="16" />
                        </button>
                    </div>
                </div>

                <div class="space-y-2 mb-3">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ shift.startTime }} - {{ shift.endTime }}
                    </p>
                    <div class="flex items-center gap-2">
                        <Users :size="16" class="text-gray-500" />
                        <span class="text-sm text-gray-600 dark:text-gray-400">
                            {{ shift.assignedStaff.length }} / {{ shift.capacity }} assigned
                        </span>
                    </div>
                </div>

                <div class="pt-3 border-t border-gray-200 dark:border-gray-800">
                    <div class="flex flex-wrap gap-1">
                        <span v-for="staff in shift.assignedStaff" :key="staff.id"
                            class="text-xs px-2 py-1 bg-electric-lime-100 text-electric-lime-900 dark:bg-electric-lime-900 dark:text-electric-lime-200 rounded">
                            {{ staff.name }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredShifts.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No shifts found</p>
        </div>

        <!-- Shift Form Modal -->
        <ShiftFormModal v-model="showShiftForm" :shiftId="editingShiftId" @save="handleSaveShift" />
    </div>
</template>
