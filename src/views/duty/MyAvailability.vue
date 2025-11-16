<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/utils/api'
import {
    Calendar, Clock, Plus, Trash2, Edit2, Save, X,
    CheckCircle, XCircle, Star, RefreshCw, Briefcase, AlertCircle
} from 'lucide-vue-next'

const route = useRoute()

const organizationId = computed(() => route.params.id)
const availability = ref([])
const loading = ref(false)
const error = ref('')
const successMsg = ref('')

const showAddModal = ref(false)
const editingId = ref(null)

const form = ref({
    date: '',
    start_time: '09:00',
    end_time: '17:00',
    availability_type: 'available',
    reason: ''
})

const availabilityTypes = [
    { value: 'available', label: 'Available', icon: CheckCircle, color: 'emerald' },
    { value: 'unavailable', label: 'Unavailable', icon: XCircle, color: 'red' },
    { value: 'preferred', label: 'Preferred', icon: Star, color: 'amber' }
]

const groupedAvailability = computed(() => {
    const groups = {}

    availability.value.forEach(item => {
        const date = item.date
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(item)
    })

    // Sort by date
    return Object.entries(groups)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .reduce((acc, [date, items]) => {
            acc[date] = items.sort((a, b) => a.start_time.localeCompare(b.start_time))
            return acc
        }, {})
})

onMounted(loadAvailability)

async function loadAvailability() {
    loading.value = true
    error.value = ''
    try {
        const { data } = await axios.get(`/api/org/${organizationId.value}/duty-availability`, {
            params: { user_id: 'me' }
        })
        availability.value = data.data || data
    } catch (e) {
        error.value = e?.response?.data?.message || 'Failed to load availability'
    } finally {
        loading.value = false
    }
}

function openAddModal() {
    form.value = {
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        availability_type: 'available',
        reason: ''
    }
    editingId.value = null
    showAddModal.value = true
}

function editAvailability(item) {
    form.value = {
        date: item.date,
        start_time: item.start_time,
        end_time: item.end_time,
        availability_type: item.availability_type,
        reason: item.reason || ''
    }
    editingId.value = item.id
    showAddModal.value = true
}

async function saveAvailability() {
    error.value = ''
    successMsg.value = ''

    try {
        if (editingId.value) {
            await axios.patch(
                `/api/org/${organizationId.value}/duty-availability/${editingId.value}`,
                form.value
            )
            successMsg.value = 'Availability updated successfully'
        } else {
            await axios.post(
                `/api/org/${organizationId.value}/duty-availability`,
                form.value
            )
            successMsg.value = 'Availability added successfully'
        }

        showAddModal.value = false
        await loadAvailability()

        setTimeout(() => successMsg.value = '', 3000)
    } catch (e) {
        error.value = e?.response?.data?.message || 'Failed to save availability'
    }
}

async function deleteAvailability(id) {
    if (!confirm('Are you sure you want to delete this availability entry?')) return

    try {
        await axios.delete(`/api/org/${organizationId.value}/duty-availability/${id}`)
        successMsg.value = 'Availability deleted successfully'
        await loadAvailability()
        setTimeout(() => successMsg.value = '', 3000)
    } catch (e) {
        error.value = e?.response?.data?.message || 'Failed to delete availability'
    }
}

function getTypeInfo(type) {
    // Map colors to full Tailwind classes for adaptive theme application
    const adaptiveColors = {
        'emerald': 'text-emerald-600 dark:text-emerald-400',
        'red': 'text-red-600 dark:text-red-400',
        'amber': 'text-amber-600 dark:text-amber-400'
    }

    const info = availabilityTypes.find(t => t.value === type) || availabilityTypes[0]
    return {
        ...info,
        colorClass: adaptiveColors[info.color]
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
}

function isUpcoming(dateStr) {
    return new Date(dateStr) >= new Date().setHours(0, 0, 0, 0)
}
</script>

<template>
    <div class="h-full flex flex-col gap-8">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                    <Briefcase class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> My Availability
                </h1>
                <p class="text-sm text-gray-600 dark:text-platinum-400">
                    Set your schedule and preferences for duty assignments
                </p>
            </div>
            <div class="flex gap-3">
                <button @click="loadAvailability"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 shadow-sm transition-colors hover:scale-[1.02]">
                    <RefreshCw class="w-4 h-4" />
                    Refresh
                </button>
                <button @click="openAddModal"
                    class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-semibold shadow-md transition-colors hover:scale-[1.02]">
                    <Plus class="w-4 h-4" />
                    Add Availability
                </button>
            </div>
        </div>

        <div v-if="successMsg"
            class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-300 dark:border-emerald-900/50 shadow-md">
            <div class="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle class="w-5 h-5" />
                <span class="text-sm font-medium">{{ successMsg }}</span>
            </div>
        </div>

        <div v-if="error"
            class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-300 dark:border-red-900/50 shadow-md">
            <div class="flex items-center gap-2 text-red-700 dark:text-red-400">
                <XCircle class="w-5 h-5" />
                <span class="text-sm font-medium">{{ error }}</span>
            </div>
        </div>

        <div
            class="flex gap-6 items-center p-4 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
            <span class="text-base font-semibold text-gray-800 dark:text-platinum-300">Legend:</span>
            <div v-for="type in availabilityTypes" :key="type.value" class="flex items-center gap-2">
                <component :is="type.icon" class="w-5 h-5" :class="getTypeInfo(type.value).colorClass" />
                <span class="text-sm text-gray-700 dark:text-platinum-300">{{ type.label }}</span>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto space-y-6">
            <div v-if="loading" class="text-center py-12">
                <RefreshCw class="h-8 w-8 animate-spin mx-auto text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                <p class="mt-2 text-sm text-gray-600 dark:text-platinum-400">Loading your schedule...</p>
            </div>

            <div v-else-if="Object.keys(groupedAvailability).length === 0" class="text-center py-12 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg">
                <Calendar class="h-12 w-12 mx-auto text-gray-400 dark:text-platinum-600 mb-4" />
                <p class="text-gray-600 dark:text-platinum-400 mb-2 font-medium">No availability set</p>
                <button @click="openAddModal"
                    class="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-medium mx-auto shadow-md hover:scale-[1.02]">
                    <Plus class="w-4 h-4" /> Add Availability
                </button>
            </div>

            <div v-else class="space-y-4">
                <div v-for="(items, date) in groupedAvailability" :key="date"
                    class="bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-lg overflow-hidden">

                    <div class="p-4 bg-gray-50 dark:bg-abyss-700 border-b border-gray-200 dark:border-abyss-600">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <Calendar class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                                <div>
                                    <h3 class="font-semibold text-gray-800 dark:text-platinum-100 text-lg">
                                        {{ formatDate(date) }}
                                    </h3>
                                    <p v-if="!isUpcoming(date)"
                                        class="text-xs text-red-600 dark:text-red-400 font-medium">
                                        PAST DATE
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="divide-y divide-gray-200 dark:divide-abyss-700">
                        <div v-for="item in items" :key="item.id"
                            class="p-4 hover:bg-gray-50 dark:hover:bg-abyss-700 transition">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <div class="flex items-center gap-3 mb-2">
                                        <component :is="getTypeInfo(item.availability_type).icon" class="w-5 h-5"
                                            :class="getTypeInfo(item.availability_type).colorClass" />

                                        <div>
                                            <span class="font-medium text-gray-800 dark:text-platinum-100 text-base">
                                                {{ getTypeInfo(item.availability_type).label }}
                                            </span>
                                            <div
                                                class="flex items-center gap-2 text-sm text-gray-600 dark:text-platinum-400 mt-1">
                                                <Clock class="w-4 h-4" />
                                                <span class="font-medium">
                                                    {{ formatTime(item.start_time) }} - {{ formatTime(item.end_time) }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="item.reason" class="flex items-start gap-2 text-sm text-gray-600 dark:text-platinum-400 ml-8">
                                        <AlertCircle class="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <p>{{ item.reason }}</p>
                                    </div>
                                </div>

                                <div class="flex gap-2 flex-shrink-0">
                                    <button @click="editAvailability(item)" :disabled="!isUpcoming(date)"
                                        class="p-2 rounded-xl transition text-gray-700 dark:text-platinum-300 hover:bg-gray-100 dark:hover:bg-abyss-600 disabled:opacity-50">
                                        <Edit2 class="w-4 h-4" />
                                    </button>
                                    <button @click="deleteAvailability(item.id)"
                                        class="p-2 rounded-xl transition text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash2 class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div class="bg-white dark:bg-abyss-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-abyss-700">
                <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-abyss-700">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-platinum-50">
                        {{ editingId ? 'Edit Availability' : 'Add Availability' }}
                    </h3>
                    <button @click="showAddModal = false"
                        class="p-2 hover:bg-gray-100 dark:hover:bg-abyss-800 rounded-lg text-gray-700 dark:text-platinum-300">
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <div class="p-6 space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                            Date *
                        </label>
                        <input v-model="form.date" type="date" required
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-800 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600" />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                                Start Time *
                            </label>
                            <input v-model="form.start_time" type="time" required
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-800 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600" />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                                End Time *
                            </label>
                            <input v-model="form.end_time" type="time" required
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-800 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                            Availability Type *
                        </label>
                        <div class="space-y-2">
                            <label v-for="type in availabilityTypes" :key="type.value"
                                class="flex items-center gap-3 p-3 border border-gray-300 dark:border-abyss-600 rounded-xl cursor-pointer shadow-sm transition"
                                :class="[
                                    form.availability_type === type.value 
                                        ? 'ring-2 ring-kaitoke-green-500 bg-gray-50 dark:bg-abyss-800/80' 
                                        : 'bg-white dark:bg-abyss-800 hover:bg-gray-100 dark:hover:bg-abyss-700'
                                ]">
                                <input type="radio" :value="type.value" v-model="form.availability_type"
                                    class="text-kaitoke-green-600 focus:ring-kaitoke-green-500 h-4 w-4 border-gray-300" />
                                <component :is="type.icon" class="w-5 h-5" :class="getTypeInfo(type.value).colorClass" />
                                <span class="text-sm font-medium text-gray-800 dark:text-platinum-200">{{ type.label
                                    }}</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                            Reason (Optional)
                        </label>
                        <textarea v-model="form.reason" rows="3"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-800 text-gray-800 dark:text-platinum-200 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600"
                            placeholder="Add any notes about your availability..."></textarea>
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button type="button" @click="showAddModal = false"
                            class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 font-medium transition-colors">
                            Cancel
                        </button>
                        <button @click="saveAvailability"
                            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-semibold shadow-md transition-colors">
                            <Save class="w-4 h-4" />
                            {{ editingId ? 'Update' : 'Save' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>