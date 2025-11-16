<template>
    <div class="space-y-8">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                <Megaphone class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Announcements
            </h2>
            <button @click="showCreateModal = true"
                class="px-5 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-medium transition-colors shadow-md hover:shadow-lg flex items-center gap-2">
                <Plus class="w-5 h-5" /> Create Announcement
            </button>
        </div>

        <div v-if="loading"
            class="flex flex-col items-center justify-center py-20 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-xl">
            <Loader2 class="animate-spin h-10 w-10 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
            <span class="mt-4 text-gray-600 dark:text-platinum-400 text-lg">Loading announcements...</span>
        </div>

        <div v-else-if="!announcements.length"
            class="text-center py-16 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-xl">
            <MessageSquare class="w-12 h-12 text-gray-400 dark:text-platinum-600 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-platinum-400 mb-6 text-lg">No announcements have been posted yet.</p>
            <button @click="showCreateModal = true"
                class="px-6 py-3 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-semibold transition-colors shadow-lg flex items-center gap-2 mx-auto">
                <Plus class="w-5 h-5" /> Create First Announcement
            </button>
        </div>

        <div v-else class="space-y-4">
            <div v-for="announcement in announcements" :key="announcement.id"
                class="rounded-xl border border-gray-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-6 shadow-md hover:shadow-lg transition-all duration-200">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-50">{{ announcement.title }}</h3>
                            <span v-if="announcement.priority"
                                class="px-2 py-0.5 text-xs rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50 flex items-center gap-1 font-medium">
                                <MapPin class="w-3 h-3" /> Pinned
                            </span>
                            <span :class="[
                                'px-2 py-0.5 text-xs rounded-full flex items-center gap-1 font-medium',
                                announcement.is_public
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700/50'
                                    : 'bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600/50'
                            ]">
                                <Users class="w-3 h-3" v-if="announcement.is_public" />
                                <Lock class="w-3 h-3" v-else />
                                {{ announcement.is_public ? 'Public' : 'Private' }}
                            </span>
                        </div>
                        <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-platinum-400">
                            <span>By {{ announcement.author_name || 'Unknown' }}</span>
                            <span class="text-gray-400 dark:text-platinum-600">|</span>
                            <span>{{ formatDate(announcement.created_at) }}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 flex-shrink-0">
                        <button @click="editAnnouncement(announcement)"
                            class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 transition-colors flex items-center gap-1">
                            <Pencil class="w-4 h-4" /> Edit
                        </button>
                        <button @click="deleteAnnouncement(announcement.id)"
                            class="px-3 py-1.5 text-sm rounded-lg border border-rose-300 dark:border-rose-700/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors flex items-center gap-1">
                            <Trash2 class="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>

                <p class="text-gray-700 dark:text-platinum-300 whitespace-pre-wrap mb-4">{{ announcement.content }}</p>

                <div v-if="announcement.tags && announcement.tags.length" class="flex flex-wrap gap-2">
                    <span v-for="tag in announcement.tags" :key="tag"
                        class="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-abyss-700 text-gray-600 dark:text-platinum-400 border border-gray-300 dark:border-abyss-600 font-medium">
                        <Hash class="w-3 h-3 inline mr-1" /> {{ tag }}
                    </span>
                </div>
            </div>
        </div>

        <AnnouncementModal v-if="showCreateModal" :announcement="editingAnnouncement" :organization-id="organizationId"
            @close="closeModal" @saved="handleSaved" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/api'
import AnnouncementModal from '@/components/org/AnnouncementModal.vue'
import { Megaphone, Plus, Loader2, MessageSquare, MapPin, Users, Lock, Pencil, Trash2, Hash } from 'lucide-vue-next'

const props = defineProps({
    organizationId: { type: [String, Number], required: true }
})

const announcements = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const editingAnnouncement = ref(null)

onMounted(() => {
    loadAnnouncements()
})

async function loadAnnouncements() {
    loading.value = true
    try {
        const { data } = await axios.get(`/api/org/${props.organizationId}/announcements`)
        announcements.value = data
    } catch (error) {
        console.error('Failed to load announcements:', error)
    } finally {
        loading.value = false
    }
}

function editAnnouncement(announcement) {
    editingAnnouncement.value = announcement
    showCreateModal.value = true
}

async function deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
        await axios.delete(`/api/org/${props.organizationId}/announcements/${id}`)
        await loadAnnouncements()
    } catch (error) {
        alert('Failed to delete announcement')
    }
}

function closeModal() {
    showCreateModal.value = false
    editingAnnouncement.value = null
}

function handleSaved() {
    closeModal()
    loadAnnouncements()
}

function formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>