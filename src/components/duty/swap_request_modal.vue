<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDutyStore } from '@/stores/duty'
import axios from '@/utils/api'
import { X, ArrowRightLeft, User } from 'lucide-vue-next'
import { useToast } from '@/utils/useToast'

const props = defineProps({
    assignment: { type: Object, required: true },
    organizationId: { type: [String, Number], required: true }
})

const emit = defineEmits(['close', 'requested'])

const dutyStore = useDutyStore()
const toast = useToast()
const officers = ref([])
const selectedOfficer = ref(null)
const reason = ref('')
const loading = ref(false)

onMounted(async () => {
    await loadOfficers()
})

async function loadOfficers() {
    try {
        const { data } = await axios.get(`/api/org/${props.organizationId}/members`)
        // Filter out current user
        officers.value = data.filter(o => o.id !== props.assignment.officer_id)
    } catch (error) {
        console.error('Failed to load officers:', error)
    }
}

async function handleRequest() {
    if (!reason.value.trim()) {
        toast.error('Please provide a reason for the swap request')
        return
    }

    loading.value = true
    try {
        await dutyStore.requestSwap(
            props.organizationId,
            props.assignment.id,
            selectedOfficer.value,
            reason.value
        )
        toast.success('Swap request submitted successfully!')
        emit('requested')
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to request swap')
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white dark:bg-abyss-900 rounded-xl shadow-2xl w-full max-w-md">
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-platinum-200 dark:border-abyss-700">
                <div class="flex items-center gap-2">
                    <ArrowRightLeft :size="20" class="text-kaitoke-green-600" />
                    <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50">Request Duty Swap</h3>
                </div>
                <button @click="$emit('close')" class="p-2 hover:bg-platinum-100 dark:hover:bg-abyss-800 rounded-lg">
                    <X :size="18" />
                </button>
            </div>

            <!-- Content -->
            <div class="p-4 space-y-4">
                <!-- Current Duty Info -->
                <div class="p-3 bg-platinum-50 dark:bg-abyss-800 rounded-lg">
                    <p class="text-xs text-platinum-600 dark:text-platinum-400 mb-1">Current Duty</p>
                    <p class="font-semibold text-abyss-900 dark:text-platinum-100">{{ assignment.duty_schedule.title }}
                    </p>
                    <p class="text-sm text-platinum-600 dark:text-platinum-400">
                        {{ new Date(assignment.duty_schedule.date).toLocaleDateString() }} •
                        {{ assignment.duty_schedule.start_time }} - {{ assignment.duty_schedule.end_time }}
                    </p>
                </div>

                <!-- Officer Selection (Optional) -->
                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                        Swap With (Optional)
                    </label>
                    <select v-model="selectedOfficer"
                        class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200">
                        <option :value="null">Anyone available</option>
                        <option v-for="officer in officers" :key="officer.id" :value="officer.id">
                            {{ officer.name }}
                        </option>
                    </select>
                    <p class="text-xs text-platinum-600 dark:text-platinum-400 mt-1">
                        Leave blank to let any officer accept the swap
                    </p>
                </div>

                <!-- Reason -->
                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                        Reason for Swap *
                    </label>
                    <textarea v-model="reason" rows="4" required
                        class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200 focus:ring-2 focus:ring-kaitoke-green-500"
                        placeholder="Explain why you need to swap this duty..."></textarea>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 pt-2">
                    <button type="button" @click="$emit('close')"
                        class="flex-1 px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 text-abyss-900 dark:text-platinum-200 hover:bg-platinum-100 dark:hover:bg-abyss-800">
                        Cancel
                    </button>
                    <button @click="handleRequest" :disabled="loading || !reason.trim()"
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white disabled:opacity-50">
                        <ArrowRightLeft :size="18" />
                        {{ loading ? 'Requesting...' : 'Request Swap' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>