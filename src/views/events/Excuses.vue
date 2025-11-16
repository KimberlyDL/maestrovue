<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold text-abyss-900">Volunteer Excuses</h1>
                <p class="text-platinum-600 mt-1">Manage and review volunteer absence excuses</p>
            </div>
            <button @click="showAddModal = true"
                class="flex items-center gap-2 px-4 py-2 bg-kaitoke-green text-white rounded-lg hover:bg-kaitoke-green/90 transition-colors">
                <Plus :size="20" />
                Add Excuse
            </button>
        </div>

        <!-- Filters -->
        <div class="flex gap-4 flex-wrap">
            <div class="flex-1 min-w-64">
                <input v-model="searchQuery" type="text" placeholder="Search by volunteer name..."
                    class="w-full px-4 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green" />
            </div>
            <select v-model="filterStatus"
                class="px-4 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>
        </div>

        <!-- Excuses Table -->
        <div class="bg-white rounded-lg border border-platinum-200 overflow-hidden">
            <table class="w-full">
                <thead class="bg-platinum-50 border-b border-platinum-200">
                    <tr>
                        <th class="px-6 py-3 text-left text-sm font-semibold text-abyss-900">Volunteer</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold text-abyss-900">Event</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold text-abyss-900">Reason</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold text-abyss-900">Submitted</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold text-abyss-900">Status</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold text-abyss-900">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-platinum-200">
                    <tr v-for="excuse in filteredExcuses" :key="excuse.id" class="hover:bg-platinum-50">
                        <td class="px-6 py-4 text-sm text-abyss-900">{{ excuse.volunteerName }}</td>
                        <td class="px-6 py-4 text-sm text-abyss-900">
                            {{ getEventTitle(excuse.eventId) }}
                        </td>
                        <td class="px-6 py-4 text-sm text-abyss-900">{{ excuse.reason }}</td>
                        <td class="px-6 py-4 text-sm text-platinum-600">{{ excuse.submittedAt }}</td>
                        <td class="px-6 py-4 text-sm">
                            <span :class="[
                                'px-3 py-1 rounded-full text-xs font-semibold',
                                excuse.status === 'pending'
                                    ? 'bg-sun-100 text-sun-800'
                                    : excuse.status === 'approved'
                                        ? 'bg-kaitoke-green/10 text-kaitoke-green'
                                        : 'bg-red-100 text-red-800',
                            ]">
                                {{ excuse.status.charAt(0).toUpperCase() + excuse.status.slice(1) }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-sm">
                            <div class="flex gap-2">
                                <button v-if="excuse.status === 'pending'" @click="approveExcuse(excuse.id)"
                                    class="p-2 text-kaitoke-green hover:bg-kaitoke-green/10 rounded transition-colors"
                                    title="Approve">
                                    <Check :size="18" />
                                </button>
                                <button v-if="excuse.status === 'pending'" @click="rejectExcuse(excuse.id)"
                                    class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Reject">
                                    <X :size="18" />
                                </button>
                                <button @click="editingExcuse = excuse; showEditModal = true"
                                    class="p-2 text-platinum-600 hover:bg-platinum-100 rounded transition-colors"
                                    title="Edit">
                                    <Edit2 :size="18" />
                                </button>
                                <button @click="deleteExcuseItem(excuse.id)"
                                    class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                                    <Trash2 :size="18" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="filteredExcuses.length === 0" class="px-6 py-8 text-center text-platinum-600">
                No excuses found
            </div>
        </div>

        <!-- Add/Edit Modal -->
        <ExcuseFormModal v-if="showAddModal" :events="eventsStore.events" @save="handleAddExcuse"
            @close="showAddModal = false" />

        <ExcuseFormModal v-if="showEditModal" :excuse="editingExcuse" :events="eventsStore.events"
            @save="handleUpdateExcuse" @close="showEditModal = false" />
    </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useEventsStore } from "@/stores/events_store"
import ExcuseFormModal from "@/components/events/excuse_form_modal.vue"
import { Plus, Check, X, Edit2, Trash2 } from "lucide-vue-next"

// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const eventsStore = useEventsStore()

const searchQuery = ref("")
const filterStatus = ref("")
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingExcuse = ref(null)

const filteredExcuses = computed(() => {
    return eventsStore.excuses.filter((excuse) => {
        const matchesSearch =
            excuse.volunteerName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            excuse.reason.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesStatus = !filterStatus.value || excuse.status === filterStatus.value
        return matchesSearch && matchesStatus
    })
})

function getEventTitle(eventId) {
    const event = eventsStore.events.find((e) => e.id === eventId)
    return event?.title || "Unknown Event"
}

function handleAddExcuse(excuseData) {
    eventsStore.addExcuse(excuseData)
    showAddModal.value = false
}

function handleUpdateExcuse(excuseData) {
    eventsStore.updateExcuse(editingExcuse.value.id, excuseData)
    showEditModal.value = false
    editingExcuse.value = null
}

function approveExcuse(excuseId) {
    eventsStore.approveExcuse(excuseId)
}

function rejectExcuse(excuseId) {
    eventsStore.rejectExcuse(excuseId)
}

function deleteExcuseItem(excuseId) {
    if (confirm("Are you sure you want to delete this excuse?")) {
        eventsStore.deleteExcuse(excuseId)
    }
}
</script>
