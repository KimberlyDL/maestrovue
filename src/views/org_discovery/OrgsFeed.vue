<template>
    <div class="min-h-screen">

        <div class="w-full mb-10">
            <div
                class="max-w-4xl bg-gradient-to-r from-kaitoke-green-400 to-electric-lime-200 dark:from-kaitoke-green-900/40 dark:to-electric-lime-900/30 border border-kaitoke-green-700/50 rounded-xl p-12 flex items-start gap-6">
                <div class="flex-1">
                    <h2 class="text-3xl font-body font-[600] text-platinum-50 mb-2">Welcome back!, <span
                            class="text-sun-500">{{ name }}</span></h2>
                    <p class="text-kaitoke-green-600 dark:text-platinum-300">
                        Stay informed. This is your latest feed from all your organizations.
                    </p>
                </div>
            </div>
        </div>

        <div class="max-w-4xl mx-auto mb-8">
            <h5 class="text-xl text-heading font-[600] text-abyss-600 dark:text-platinum-50">Announcements</h5>
            <p class="text-mb text-body text-abyss-400 dark:text-platinum-400">Stay connected with the latest updates
            </p>
        </div>

        <div class="max-w-4xl mx-auto">
            <AnnouncementsList :announcements="announcements" :loading="loadingAnnouncements"
                @view-image="imgUrl => { selectedImage = imgUrl; showImageViewer = true }" />
        </div>
    </div>

    <ImageViewer v-model="showImageViewer" :image="selectedImage" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/utils/api'
// Note: Assuming the AnnouncementsList component remains the same for now
import ImageViewer from '@components/ui/image_viewer_modal.vue'
import AnnouncementsList from '@components/user/AnnouncementsList.vue'
import { useAuthStore } from '@stores/auth'

const selectedImage = ref('')       // holds clicked image URL
const showImageViewer = ref(false)

// Initialize auth store
const auth = useAuthStore()

// Data
const announcements = ref([])
const loadingAnnouncements = ref(false)

// Computed user name for welcome card
const name = computed(() => auth.user?.name || 'User')

// Load data
onMounted(() => {
    loadAnnouncements()
})

async function loadAnnouncements() {
    loadingAnnouncements.value = true
    try {
        const { data } = await axios.get('/api/announcements')
        announcements.value = data || []
    } catch (error) {
        console.error('Failed to load announcements:', error)
        announcements.value = []
    } finally {
        loadingAnnouncements.value = false
    }
}
</script>