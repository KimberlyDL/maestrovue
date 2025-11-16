<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDutyStore } from '@/stores/duty'
import { useToast } from '@/utils/useToast'
import axios from '@/utils/api'
import OfficerAssignmentModal from './officer_assignment_modal.vue'
import DutyScheduleModal from './duty_schedule_modal.vue'
import { X, Edit, Trash2, Users, Clock, MapPin, Calendar, CheckCircle2, XCircle, Copy } from 'lucide-vue-next'

const props = defineProps({
    duty: { type: Object, required: true },
    organizationId: { type: [String, Number], required: true }
})

const emit = defineEmits(['close', 'updated', 'deleted'])

const dutyStore = useDutyStore()
const toast = useToast()
const showAssignModal = ref(false)
const showEditModal = ref(false)
const dutyData = ref(null)
const loading = ref(true)

const statusColor = computed(() => {
    const colors = {
        draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        published: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    }
    return colors[dutyData.value?.status] || colors.draft
})

const needsOfficers = computed(() => {
    if (!dutyData.value) return 0
    const assigned = dutyData.value.assigned_count || 0
    const required = dutyData.value.required_officers || 0
    return Math.max(0, required - assigned)
})

const assignedOfficers = computed(() => {
    if (!dutyData.value) return []

    // Handle both 'assignments' and 'officers' for backward compatibility
    const assignments = dutyData.value.assignments || []

    return assignments
        .filter(a => ['assigned', 'confirmed'].includes(a.status))
        .map(a => ({
            id: a.officer?.id || a.id,
            name: a.officer?.name || a.name || 'Unknown',
            avatar: a.officer?.avatar || a.officer?.avatar_url || a.avatar || a.avatar_url,
            status: a.status,
            assignment_id: a.id
        }))
})

onMounted(async () => {
    await loadDutyDetails()
})

async function loadDutyDetails() {
    loading.value = true
    try {
        const { data } = await axios.get(
            `/api/org/${props.organizationId}/duty-schedules/${props.duty.id}`
        )
        dutyData.value = data
    } catch (error) {
        console.error('Failed to load duty details:', error)
        toast.error('Failed to load duty details')
        dutyData.value = props.duty // Fallback to prop data
    } finally {
        loading.value = false
    }
}

async function handleDelete() {
    if (!confirm('Are you sure you want to delete this duty schedule?')) return

    try {
        await dutyStore.deleteSchedule(props.organizationId, dutyData.value.id)
        toast.success('Duty schedule deleted')
        emit('deleted')
    } catch (error) {
        toast.error('Failed to delete duty schedule')
    }
}

async function duplicateDuty() {
    const newDate = prompt('Enter new date (YYYY-MM-DD):')
    if (!newDate) return

    const copyAssignments = confirm('Copy officer assignments?')

    try {
        await axios.post(
            `/api/org/${props.organizationId}/duty-schedules/${dutyData.value.id}/duplicate`,
            { date: newDate, copy_assignments: copyAssignments }
        )
        toast.success('Duty duplicated successfully')
        emit('updated')
    } catch (error) {
        toast.error('Failed to duplicate duty')
    }
}

function handleAssigned() {
    showAssignModal.value = false
    loadDutyDetails()
    emit('updated')
}

function handleEdited() {
    showEditModal.value = false
    loadDutyDetails()
    emit('updated')
}

function openEditModal() {
    showEditModal.value = true
}

// FIX 4: Properly remove officer from duty schedule
async function removeOfficer(assignmentId) {
    if (!confirm('Remove this officer from the duty?')) return

    try {
        await axios.delete(
            `/api/org/${props.organizationId}/duty-schedules/${dutyData.value.id}/assignments/${assignmentId}`
        )
        toast.success('Officer removed')
        await loadDutyDetails()
        emit('updated')
    } catch (error) {
        console.error('Failed to remove officer:', error)
        toast.error(error?.response?.data?.message || 'Failed to remove officer')
    }
}
</script>

<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white dark:bg-abyss-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <!-- Loading State -->
            <div v-if="loading" class="p-12 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-kaitoke-green-600 mx-auto"></div>
            </div>

            <!-- Content -->
            <template v-else-if="dutyData">
                <!-- Header -->
                <div class="flex items-start justify-between p-6 border-b border-platinum-200 dark:border-abyss-700">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h2 class="text-2xl font-bold text-abyss-900 dark:text-platinum-50">{{ dutyData.title }}
                            </h2>
                            <span class="px-3 py-1 rounded-full text-xs font-semibold" :class="statusColor">
                                {{ dutyData.status }}
                            </span>
                        </div>
                        <p v-if="dutyData.description" class="text-platinum-600 dark:text-platinum-400">
                            {{ dutyData.description }}
                        </p>
                    </div>
                    <button @click="$emit('close')"
                        class="p-2 hover:bg-platinum-100 dark:hover:bg-abyss-800 rounded-lg transition-colors">
                        <X :size="20" class="text-platinum-600" />
                    </button>
                </div>

                <!-- Details Grid -->
                <div class="p-6 space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex items-start gap-3">
                            <Calendar :size="20" class="text-kaitoke-green-600 mt-0.5" />
                            <div>
                                <p class="text-xs text-platinum-600 dark:text-platinum-400">Date</p>
                                <p class="text-sm font-semibold text-abyss-900 dark:text-platinum-200">
                                    {{ new Date(dutyData.date).toLocaleDateString() }}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-start gap-3">
                            <Clock :size="20" class="text-kaitoke-green-600 mt-0.5" />
                            <div>
                                <p class="text-xs text-platinum-600 dark:text-platinum-400">Time</p>
                                <p class="text-sm font-semibold text-abyss-900 dark:text-platinum-200">
                                    {{ dutyData.start_time }} - {{ dutyData.end_time }}
                                </p>
                            </div>
                        </div>

                        <div v-if="dutyData.location" class="flex items-start gap-3">
                            <MapPin :size="20" class="text-kaitoke-green-600 mt-0.5" />
                            <div>
                                <p class="text-xs text-platinum-600 dark:text-platinum-400">Location</p>
                                <p class="text-sm font-semibold text-abyss-900 dark:text-platinum-200">
                                    {{ dutyData.location }}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-start gap-3">
                            <Users :size="20" class="text-kaitoke-green-600 mt-0.5" />
                            <div>
                                <p class="text-xs text-platinum-600 dark:text-platinum-400">Officers</p>
                                <p class="text-sm font-semibold"
                                    :class="needsOfficers > 0 ? 'text-rose-600' : 'text-emerald-600'">
                                    {{ assignedOfficers.length }} / {{ dutyData.required_officers }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Officers List -->
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50">Assigned Officers
                            </h3>
                            <button @click="showAssignModal = true"
                                class="px-3 py-1.5 text-sm rounded-lg bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white">
                                + Assign
                            </button>
                        </div>

                        <div v-if="assignedOfficers.length > 0" class="space-y-2">
                            <div v-for="officer in assignedOfficers" :key="officer.assignment_id"
                                class="flex items-center justify-between p-3 bg-platinum-50 dark:bg-abyss-800 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <img v-if="officer.avatar" :src="officer.avatar" :alt="officer.name"
                                        class="w-10 h-10 rounded-full object-cover" />
                                    <div v-else
                                        class="w-10 h-10 rounded-full bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 flex items-center justify-center text-sm font-semibold text-kaitoke-green-600">
                                        {{ officer.name.charAt(0).toUpperCase() }}
                                    </div>
                                    <div>
                                        <p class="text-sm font-semibold text-abyss-900 dark:text-platinum-200">
                                            {{ officer.name }}
                                        </p>
                                        <p class="text-xs text-platinum-600 dark:text-platinum-400">
                                            {{ officer.status }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <CheckCircle2 v-if="officer.status === 'confirmed'" :size="20"
                                        class="text-emerald-600" />
                                    <XCircle v-else-if="officer.status === 'declined'" :size="20"
                                        class="text-rose-600" />
                                    <button @click="removeOfficer(officer.assignment_id)"
                                        class="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600">
                                        <X :size="16" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-8 text-platinum-600 dark:text-platinum-400">
                            No officers assigned yet
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2 pt-4 border-t border-platinum-200 dark:border-abyss-700">
                        <button @click="duplicateDuty"
                            class="flex items-center gap-2 px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 text-abyss-900 dark:text-platinum-200 hover:bg-platinum-100 dark:hover:bg-abyss-800">
                            <Copy :size="18" />
                            Duplicate
                        </button>
                        <button @click="openEditModal"
                            class="flex items-center gap-2 px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 text-abyss-900 dark:text-platinum-200 hover:bg-platinum-100 dark:hover:bg-abyss-800">
                            <Edit :size="18" />
                            Edit
                        </button>
                        <button @click="handleDelete"
                            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white ml-auto">
                            <Trash2 :size="18" />
                            Delete
                        </button>
                    </div>
                </div>
            </template>
        </div>

        <!-- Modals -->
        <OfficerAssignmentModal v-if="showAssignModal" :duty="dutyData" :organization-id="organizationId"
            @close="showAssignModal = false" @assigned="handleAssigned" />

        <DutyScheduleModal v-if="showEditModal" :duty="dutyData" :organization-id="organizationId"
            @close="showEditModal = false" @saved="handleEdited" />
    </div>
</template>