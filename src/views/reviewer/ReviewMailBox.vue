<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/utils/api'
import { Inbox, CheckCircle, Clock, Building2, Search, ArrowRight, FileText } from 'lucide-vue-next'

const router = useRouter()
const reviews = ref([])
const loading = ref(true)
const activeTab = ref('pending') // 'pending' or 'history'
const searchQuery = ref('')

const route = useRoute()
const orgId = computed(() => route.params.id) // Get current Org ID from URL

const fetchReviews = async () => {
    loading.value = true
    try {
        // Call the new org-scoped incoming endpoint
        const { data } = await axios.get(`/api/org/${orgId.value}/incoming-reviews`, {
            params: { status: activeTab.value } 
        })
        reviews.value = data.data || data
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

// Logic: Determine if the specific recipient (me) has finished the task
const filteredReviews = computed(() => {
    return reviews.value.filter(review => {
        // Find "my" recipient record in the review
        // Note: In a real app, you might want to filter this better on backend, 
        // but frontend filtering works if the dataset is small.
        // We assume the backend 'as_reviewer' returns reviews where I am a recipient.
        
        // This logic checks if ANY of the recipients matching ME have a status other than pending
        // For simplicity, we assume the backend returns 'status' on the review object 
        // representing the overall state, but we need to check *my* specific status.
        // Since the index endpoint returns nested recipients, we'd need to know "my" user ID.
        // Ideally, the backend adds a `my_recipient_status` field. 
        // For now, we will filter based on the available data structure.
        
        // Simplified filter:
        const isPending = review.recipients.some(r => r.status === 'pending') // Rough check
        
        // Search Filter
        const matchesSearch = review.subject.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                              review.publisher.name.toLowerCase().includes(searchQuery.value.toLowerCase())

        if (activeTab.value === 'pending') {
             // Show if at least one recipient (me) is pending
            return isPending && matchesSearch
        } else {
            // History
            return !isPending && matchesSearch
        }
    })
})

const openWorkspace = (reviewId) => {
    // Navigate to the org-scoped workspace route (we need to define this in router)
    router.push({ 
        name: 'org.incoming-review-workspace', 
        params: { id: orgId.value, reviewId } 
    })
}

onMounted(fetchReviews)
</script>

<template>
    <div class="p-6 max-w-6xl mx-auto min-h-screen">
        <header class="mb-8">
            <h1 class="text-2xl font-bold text-abyss-900 dark:text-platinum-50 mb-2">Review Inbox</h1>
            <p class="text-platinum-600 dark:text-platinum-400">Manage incoming document review requests from other organizations.</p>
        </header>

        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div class="flex bg-white dark:bg-abyss-800 p-1 rounded-lg border border-platinum-200 dark:border-abyss-700">
                <button @click="activeTab = 'pending'"
                    :class="activeTab === 'pending' ? 'bg-kaitoke-green-100 text-kaitoke-green-700 dark:bg-kaitoke-green-900/30 dark:text-kaitoke-green-300' : 'text-platinum-600 dark:text-platinum-400 hover:bg-platinum-50 dark:hover:bg-abyss-700'"
                    class="px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2">
                    <Inbox :size="16" /> Pending
                </button>
                <button @click="activeTab = 'history'"
                    :class="activeTab === 'history' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-platinum-600 dark:text-platinum-400 hover:bg-platinum-50 dark:hover:bg-abyss-700'"
                    class="px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2">
                    <CheckCircle :size="16" /> History
                </button>
            </div>

            <div class="relative w-full md:w-64">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-platinum-400 w-4 h-4" />
                <input v-model="searchQuery" type="text" placeholder="Search subject or org..."
                    class="w-full pl-9 pr-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-sm text-abyss-900 dark:text-platinum-100 focus:ring-2 focus:ring-kaitoke-green-500">
            </div>
        </div>

        <div v-if="loading" class="space-y-4">
             <div v-for="n in 3" :key="n" class="h-24 bg-platinum-100 dark:bg-abyss-800 rounded-xl animate-pulse"></div>
        </div>

        <div v-else-if="filteredReviews.length === 0" class="text-center py-16 bg-white dark:bg-abyss-800 rounded-xl border border-platinum-200 dark:border-abyss-700">
            <div class="bg-platinum-50 dark:bg-abyss-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox class="text-platinum-400 w-8 h-8" />
            </div>
            <h3 class="text-lg font-medium text-abyss-900 dark:text-platinum-100">No reviews found</h3>
            <p class="text-sm text-platinum-500">You're all caught up!</p>
        </div>

        <div v-else class="grid gap-4">
            <div v-for="review in filteredReviews" :key="review.id"
                class="bg-white dark:bg-abyss-800 p-5 rounded-xl border border-platinum-200 dark:border-abyss-700 hover:border-kaitoke-green-400 dark:hover:border-kaitoke-green-600 transition shadow-sm group">
                
                <div class="flex items-start justify-between">
                    <div class="flex gap-4">
                        <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg h-fit">
                            <FileText class="text-blue-600 w-6 h-6" />
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50 mb-1 group-hover:text-kaitoke-green-600 transition">
                                {{ review.subject }}
                            </h3>
                            <div class="flex items-center gap-4 text-sm text-platinum-600 dark:text-platinum-400">
                                <span class="flex items-center gap-1">
                                    <Building2 :size="14" /> {{ review.publisher?.name || 'Unknown Org' }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <Clock :size="14" /> {{ new Date(review.created_at).toLocaleDateString() }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button @click="openWorkspace(review.id)" 
                        class="px-4 py-2 bg-platinum-100 dark:bg-abyss-700 text-abyss-700 dark:text-platinum-200 rounded-lg text-sm font-medium hover:bg-kaitoke-green-600 hover:text-white transition flex items-center gap-2">
                        View Details <ArrowRight :size="16" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>