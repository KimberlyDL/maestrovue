<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDutyStore } from '@/stores/duty'
import axios from '@/utils/api'
import { X, Calendar, Clock, MapPin, Users, Repeat, Save } from 'lucide-vue-next'
import { useToast } from '@/utils/useToast'

const props = defineProps({
    duty: { type: Object, default: null },
    initialDate: { type: String, default: null },
    organizationId: { type: [String, Number], required: true }
})

const emit = defineEmits(['close', 'saved'])

const dutyStore = useDutyStore()
const toast = useToast()
const loading = ref(false)
const officers = ref([])
const templates = ref([])

const form = ref({
    title: '',
    description: '',
    date: '',
    start_time: '09:00',
    end_time: '17:00',
    location: '',
    required_officers: 1,
    status: 'draft',
    recurrence_type: 'none',
    recurrence_days: [],
    recurrence_end_date: null,
    officer_ids: [],
    check_in_window_start: '',
    check_in_window_end: '',
    check_out_window_start: '',
    check_out_window_end: '',
})

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const isEditing = computed(() => !!props.duty)

// FIX 1: Properly format date for input field
function formatDateForInput(dateString) {
    if (!dateString) return ''
    // Handle both ISO format and date-only format
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''

    // Return in YYYY-MM-DD format
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

watch(() => props.duty, (newDuty) => {
    if (newDuty) {
        // FIX 1: Format date properly for the date input
        const formattedDate = formatDateForInput(newDuty.date)


        form.value = {
            title: newDuty.title || '',
            description: newDuty.description || '',
            date: formattedDate,
            start_time: newDuty.start_time || '09:00',
            end_time: newDuty.end_time || '17:00',
            location: newDuty.location || '',
            required_officers: newDuty.required_officers || 1,
            status: newDuty.status || 'draft',
            recurrence_type: newDuty.recurrence_type || 'none',
            recurrence_days: newDuty.recurrence_days || [],
            recurrence_end_date: newDuty.recurrence_end_date ? formatDateForInput(newDuty.recurrence_end_date) : null,
            // // FIX 2: Don't include declined officers when editing
            // officer_ids: (newDuty.assignments || [])
            //     .filter(a => a.status !== 'declined')
            //     .map(a => a.officer_id) || []

            // FIX 2: Don't include declined officers when editing
            officer_ids: (newDuty.assignments || [])
                .filter(a => a.status !== 'declined')
                .map(a => a.officer_id) || [],

            // FIX: Map attendance window times from existing duty object
            check_in_window_start: newDuty.check_in_window_start || '',
            check_in_window_end: newDuty.check_in_window_end || '',
            check_out_window_start: newDuty.check_out_window_start || '',
            check_out_window_end: newDuty.check_out_window_end || '',
        }
    } else if (props.initialDate) {
        form.value.date = formatDateForInput(props.initialDate)
    }
}, { immediate: true })

onMounted(async () => {
    await Promise.all([
        loadOfficers(),
        loadTemplates()
    ])
})

async function loadOfficers() {
    try {
        const { data } = await axios.get(`/api/org/${props.organizationId}/members`)
        officers.value = data
    } catch (error) {
        console.error('Failed to load officers:', error)
    }
}

async function loadTemplates() {
    try {
        const { data } = await axios.get(`/api/org/${props.organizationId}/duty-templates`)
        templates.value = data
    } catch (error) {
        console.error('Failed to load templates:', error)
    }
}

function applyTemplate(template) {
    form.value.start_time = template.start_time
    form.value.end_time = template.end_time
    form.value.required_officers = template.required_officers
    if (template.default_days?.length) {
        form.value.recurrence_days = template.default_days
    }
}

function toggleRecurrenceDay(day) {
    const index = form.value.recurrence_days.indexOf(day)
    if (index > -1) {
        form.value.recurrence_days.splice(index, 1)
    } else {
        form.value.recurrence_days.push(day)
    }
}

async function handleSave() {
    loading.value = true
    try {
        if (isEditing.value) {
            await dutyStore.updateSchedule(props.organizationId, props.duty.id, form.value)
        } else {
            await dutyStore.createSchedule(props.organizationId, form.value)
        }
        emit('saved')
    } catch (error) {
        console.error('Failed to save duty schedule:', error)
        toast.error(error.response?.data?.message || 'Failed to save duty schedule')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white dark:bg-abyss-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div
                class="sticky top-0 flex items-center justify-between p-6 border-b border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-900 z-10">
                <h2 class="text-2xl font-bold text-abyss-900 dark:text-platinum-50">
                    {{ isEditing ? 'Edit Duty Schedule' : 'Create Duty Schedule' }}
                </h2>
                <button @click="$emit('close')"
                    class="p-2 hover:bg-platinum-100 dark:hover:bg-abyss-800 rounded-lg transition-colors">
                    <X :size="20" class="text-platinum-600" />
                </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSave" class="p-6 space-y-6">
                <!-- Template Selection -->
                <div v-if="templates.length > 0 && !isEditing" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                        Use Template (Optional)
                    </label>
                    <select @change="applyTemplate(templates.find(t => t.id === parseInt($event.target.value)))"
                        class="w-full px-3 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200">
                        <option value="">Select a template...</option>
                        <option v-for="template in templates" :key="template.id" :value="template.id">
                            {{ template.name }} ({{ template.start_time }} - {{ template.end_time }})
                        </option>
                    </select>
                </div>

                <!-- Basic Information -->
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                            Title *
                        </label>
                        <input v-model="form.title" type="text" required
                            class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200 focus:ring-2 focus:ring-kaitoke-green-500"
                            placeholder="e.g., Morning Shift - Building A" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                            Description
                        </label>
                        <textarea v-model="form.description" rows="3"
                            class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200 focus:ring-2 focus:ring-kaitoke-green-500"
                            placeholder="Duty details and requirements..."></textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label
                                class="flex items-center gap-2 text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                                <Calendar :size="16" />
                                Date *
                            </label>
                            <input v-model="form.date" type="date" required
                                class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200 focus:ring-2 focus:ring-kaitoke-green-500" />
                        </div>

                        <div>
                            <label
                                class="flex items-center gap-2 text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                                <MapPin :size="16" />
                                Location
                            </label>
                            <input v-model="form.location" type="text"
                                class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200 focus:ring-2 focus:ring-kaitoke-green-500"
                                placeholder="Building, room, or area" />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                class="flex items-center gap-2 text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                                <Clock :size="16" />
                                Start Time *
                            </label>
                            <input v-model="form.start_time" type="time" required
                                class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200 focus:ring-2 focus:ring-kaitoke-green-500" />
                        </div>

                        <div>
                            <label
                                class="flex items-center gap-2 text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                                <Clock :size="16" />
                                End Time *
                            </label>
                            <input v-model="form.end_time" type="time" required
                                class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200 focus:ring-2 focus:ring-kaitoke-green-500" />
                        </div>
                    </div>

                    <!-- Attendance Windows (Optional) -->
                    <div
                        class="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-300 dark:border-blue-700/50">
                        <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                            <Clock class="w-4 h-4" />
                            Attendance Windows (Optional)
                        </h4>
                        <p class="text-xs text-blue-700 dark:text-blue-400">
                            Set specific time windows for check-in and check-out. Leave empty to allow anytime.
                        </p>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                                    Check-In Window Start
                                </label>
                                <input v-model="form.check_in_window_start" type="time"
                                    class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                                    Check-In Window End
                                </label>
                                <input v-model="form.check_in_window_end" type="time"
                                    class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                                    Check-Out Window Start
                                </label>
                                <input v-model="form.check_out_window_start" type="time"
                                    class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                                    Check-Out Window End
                                </label>
                                <input v-model="form.check_out_window_end" type="time"
                                    class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-900 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label
                            class="flex items-center gap-2 text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                            <Users :size="16" />
                            Required Officers *
                        </label>
                        <input v-model.number="form.required_officers" type="number" min="1" max="50" required
                            class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200 focus:ring-2 focus:ring-kaitoke-green-500" />
                    </div>
                </div>

                <!-- Recurrence -->
                <div class="p-4 bg-platinum-50 dark:bg-abyss-800 rounded-lg space-y-4">
                    <label class="flex items-center gap-2 text-sm font-medium text-abyss-900 dark:text-platinum-300">
                        <Repeat :size="16" />
                        Recurrence
                    </label>

                    <select v-model="form.recurrence_type"
                        class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-200 focus:ring-2 focus:ring-kaitoke-green-500">
                        <option value="none">No Recurrence</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Biweekly</option>
                        <option value="monthly">Monthly</option>
                    </select>

                    <div v-if="form.recurrence_type === 'weekly' || form.recurrence_type === 'biweekly'">
                        <label class="block text-sm text-platinum-600 dark:text-platinum-400 mb-2">
                            Repeat on days:
                        </label>
                        <div class="flex gap-2">
                            <button v-for="(day, index) in dayNames" :key="index" type="button"
                                @click="toggleRecurrenceDay(index)" :class="[
                                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                    form.recurrence_days.includes(index)
                                        ? 'bg-kaitoke-green-600 text-white'
                                        : 'bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-300 border border-platinum-300 dark:border-abyss-600'
                                ]">
                                {{ day }}
                            </button>
                        </div>
                    </div>

                    <div v-if="form.recurrence_type !== 'none'">
                        <label class="block text-sm text-platinum-600 dark:text-platinum-400 mb-2">
                            End Date
                        </label>
                        <input v-model="form.recurrence_end_date" type="date"
                            class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-200 focus:ring-2 focus:ring-kaitoke-green-500" />
                    </div>
                </div>

                <!-- Officer Assignment -->
                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                        Assign Officers (Optional)
                    </label>
                    <div
                        class="max-h-48 overflow-y-auto border border-platinum-300 dark:border-abyss-600 rounded-lg p-3 space-y-2">
                        <label v-for="officer in officers" :key="officer.id"
                            class="flex items-center gap-3 p-2 hover:bg-platinum-50 dark:hover:bg-abyss-800 rounded cursor-pointer">
                            <input type="checkbox" :value="officer.id" v-model="form.officer_ids"
                                class="rounded border-platinum-300 dark:border-abyss-600 text-kaitoke-green-600 focus:ring-kaitoke-green-500" />
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-8 h-8 rounded-full bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 flex items-center justify-center text-sm font-semibold text-kaitoke-green-600">
                                    {{ officer.name.charAt(0).toUpperCase() }}
                                </div>
                                <span class="text-sm text-abyss-900 dark:text-platinum-200">{{ officer.name }}</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Status -->
                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                        Status
                    </label>
                    <select v-model="form.status"
                        class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200 focus:ring-2 focus:ring-kaitoke-green-500">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>

                <!-- Actions -->
                <div class="flex gap-3 pt-4 border-t border-platinum-200 dark:border-abyss-700">
                    <button type="button" @click="$emit('close')"
                        class="flex-1 px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 text-abyss-900 dark:text-platinum-200 hover:bg-platinum-100 dark:hover:bg-abyss-800 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" :disabled="loading"
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white disabled:opacity-50 transition-colors">
                        <Save :size="18" />
                        {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>