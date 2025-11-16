<script setup>
import { ref, onMounted } from 'vue'
import { useDutyStore } from '@/stores/duty'
import axios from '@/utils/api'
import { X, UserPlus } from 'lucide-vue-next'

const props = defineProps({
    duty: { type: Object, required: true },
    organizationId: { type: [String, Number], required: true }
})

const emit = defineEmits(['close', 'assigned'])

const dutyStore = useDutyStore()
const officers = ref([])
const selectedOfficers = ref([])
const notes = ref('')
const loading = ref(false)

onMounted(async () => {
    await loadOfficers()
})

async function loadOfficers() {
    try {
        const { data } = await axios.get(`/api/org/${props.organizationId}/members`)
        // Filter out already assigned officers
        const assignedIds = props.duty.officers?.map(o => o.id) || []
        officers.value = data.filter(o => !assignedIds.includes(o.id))
    } catch (error) {
        console.error('Failed to load officers:', error)
    }
}

async function handleAssign() {
    if (selectedOfficers.value.length === 0) return

    loading.value = true
    try {
        await dutyStore.assignOfficers(
            props.organizationId,
            props.duty.id,
            selectedOfficers.value,
            notes.value || null
        )
        emit('assigned')
    } catch (error) {
        alert('Failed to assign officers')
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
                <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50">Assign Officers</h3>
                <button @click="$emit('close')" class="p-2 hover:bg-platinum-100 dark:hover:bg-abyss-800 rounded-lg">
                    <X :size="18" />
                </button>
            </div>

            <!-- Content -->
            <div class="p-4 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                        Select Officers
                    </label>
                    <div
                        class="max-h-64 overflow-y-auto border border-platinum-300 dark:border-abyss-600 rounded-lg p-2 space-y-1">
                        <label v-for="officer in officers" :key="officer.id"
                            class="flex items-center gap-3 p-2 hover:bg-platinum-50 dark:hover:bg-abyss-800 rounded cursor-pointer">
                            <input type="checkbox" :value="officer.id" v-model="selectedOfficers"
                                class="rounded border-platinum-300 text-kaitoke-green-600 focus:ring-kaitoke-green-500" />
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-8 h-8 rounded-full bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 flex items-center justify-center text-xs font-semibold text-kaitoke-green-600">
                                    {{ officer.name.charAt(0).toUpperCase() }}
                                </div>
                                <span class="text-sm text-abyss-900 dark:text-platinum-200">{{ officer.name }}</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                        Notes (Optional)
                    </label>
                    <textarea v-model="notes" rows="2"
                        class="w-full px-3 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200"
                        placeholder="Add any notes for the assigned officers..."></textarea>
                </div>

                <div class="flex gap-2">
                    <button @click="$emit('close')" type="button"
                        class="flex-1 px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 text-abyss-900 dark:text-platinum-200 hover:bg-platinum-100 dark:hover:bg-abyss-800">
                        Cancel
                    </button>
                    <button @click="handleAssign" :disabled="selectedOfficers.length === 0 || loading"
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white disabled:opacity-50">
                        <UserPlus :size="18" />
                        {{ loading ? 'Assigning...' : 'Assign' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>