<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router' // Ensure useRoute is imported here
import axios from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/utils/useToast'
import ReviewChat from '@/components/doc/review_chat.vue'
import { 
    ArrowLeft, Download, CheckCircle, XCircle, 
    FileText, Calendar, Building2, User 
} from 'lucide-vue-next'

const props = defineProps(['reviewId'])
const router = useRouter()
const route = useRoute() // One declaration only
const auth = useAuthStore()
const toast = useToast()

const review = ref(null)
const loading = ref(true)
const processing = ref(false)

const orgId = computed(() => route.params.id)

// Identify current user's recipient record
const myRecipientRecord = computed(() => {
    if (!review.value || !review.value.recipients) return null
    return review.value.recipients.find(r => Number(r.reviewer_user_id) === Number(auth.user.id))
})

const fetchReviewDetails = async () => {
    loading.value = true
    try {
        // Correct: Org-Scoped Incoming Endpoint
        const { data } = await axios.get(`/api/org/${orgId.value}/incoming-reviews/${props.reviewId}`)
        review.value = data
        
        // Auto-mark as viewed if it's currently pending
        if (myRecipientRecord.value && myRecipientRecord.value.status === 'pending') {
            markAsViewed(myRecipientRecord.value.id)
        }
    } catch (e) {
        toast.error('Failed to load review')
        // router.push({ name: 'reviewer.mailbox' }) // Uncomment if you want redirect on failure
    } finally {
        loading.value = false
    }
}

const markAsViewed = async (recipientId) => {
    try {
        // UPDATED: Org-Scoped URL
        await axios.patch(`/api/org/${orgId.value}/incoming-reviews/${props.reviewId}/recipients/${recipientId}/view`)
    } catch(e) { /* ignore silent fail */ }
}

const handleDecision = async (decision) => {
    if (!myRecipientRecord.value) return
    
    // decision = 'approve' or 'decline'
    const recipientId = myRecipientRecord.value.id
    processing.value = true
    
    try {
        // UPDATED: Base URL for Org-Scoped Incoming Actions
        const baseUrl = `/api/org/${orgId.value}/incoming-reviews/${props.reviewId}/recipients/${recipientId}`

        if (decision === 'decline') {
            const reason = prompt("Please provide a reason for declining:")
            if (reason === null) {
                processing.value = false
                return // User cancelled prompt
            }
            await axios.post(`${baseUrl}/decline`, { reason })
        } else {
            await axios.post(`${baseUrl}/approve`)
        }

        toast.success(`Review ${decision}d successfully`)
        fetchReviewDetails() // Refresh data
    } catch (e) {
        toast.error(`Failed to ${decision} review`)
    } finally {
        processing.value = false
    }
}

const downloadFile = async () => {
    if (!review.value?.document || !review.value?.version) return
    const docId = review.value.document.id
    const verId = review.value.version.id
    
    try {
        const url = `/api/documents/${docId}/versions/${verId}/download-url`
        const { data } = await axios.get(url)
        window.open(data.url, '_blank')
    } catch (e) {
        toast.error("Download failed")
    }
}

onMounted(fetchReviewDetails)
</script>

<template>
    <div class="h-screen flex flex-col bg-platinum-50 dark:bg-abyss-900">
        <header class="bg-white dark:bg-abyss-800 border-b border-platinum-200 dark:border-abyss-700 px-6 py-4 flex items-center gap-4">
            <button @click="router.back()" class="p-2 hover:bg-platinum-100 dark:hover:bg-abyss-700 rounded-lg transition">
                <ArrowLeft class="text-abyss-600 dark:text-platinum-400" />
            </button>
            <div class="flex-1">
                <h1 class="text-xl font-bold text-abyss-900 dark:text-platinum-50">
                    {{ review?.subject || 'Loading...' }}
                </h1>
                <p class="text-sm text-platinum-500 flex items-center gap-2">
                    <span v-if="review?.publisher">From: {{ review.publisher.name }}</span>
                    <span v-if="review?.created_at">• Sent: {{ new Date(review.created_at).toLocaleDateString() }}</span>
                </p>
            </div>
            
            <div v-if="myRecipientRecord" class="px-3 py-1 rounded-full text-sm font-medium capitalize"
                :class="{
                    'bg-amber-100 text-amber-800': myRecipientRecord.status === 'pending' || myRecipientRecord.status === 'viewed',
                    'bg-green-100 text-green-800': myRecipientRecord.status === 'approved',
                    'bg-red-100 text-red-800': myRecipientRecord.status === 'declined'
                }">
                My Status: {{ myRecipientRecord.status }}
            </div>
        </header>

        <div v-if="loading" class="flex-1 flex items-center justify-center">
            <p>Loading workspace...</p>
        </div>

        <div v-else class="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
            
            <div class="lg:col-span-2 overflow-y-auto p-8 space-y-6">
                
                <div class="bg-white dark:bg-abyss-800 rounded-xl border border-platinum-200 dark:border-abyss-700 p-6 shadow-sm">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center gap-4">
                            <div class="p-3 bg-platinum-100 dark:bg-abyss-700 rounded-lg">
                                <FileText class="w-8 h-8 text-abyss-700 dark:text-platinum-300" />
                            </div>
                            <div>
                                <h2 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50">
                                    {{ review.document.title }}
                                </h2>
                                <p class="text-sm text-platinum-500">Version {{ review.version.version_number }}</p>
                            </div>
                        </div>
                        <button @click="downloadFile" class="px-4 py-2 bg-platinum-100 dark:bg-abyss-700 hover:bg-platinum-200 text-abyss-900 dark:text-platinum-100 rounded-lg flex items-center gap-2 text-sm font-medium transition">
                            <Download :size="16" /> Download File
                        </button>
                    </div>

                    <div class="bg-platinum-50 dark:bg-abyss-900/50 p-4 rounded-lg text-sm text-abyss-700 dark:text-platinum-300 whitespace-pre-wrap">
                        {{ review.body || 'No description provided.' }}
                    </div>
                </div>

                <div v-if="myRecipientRecord && ['pending', 'viewed'].includes(myRecipientRecord.status)" 
                    class="bg-white dark:bg-abyss-800 rounded-xl border border-platinum-200 dark:border-abyss-700 p-6 shadow-sm">
                    <h3 class="font-semibold text-abyss-900 dark:text-platinum-50 mb-4">Your Decision</h3>
                    <p class="text-sm text-platinum-500 mb-6">
                        Please review the document above. Once reviewed, provide your decision below.
                    </p>

                    <div class="flex gap-4">
                        <button @click="handleDecision('approve')" :disabled="processing"
                            class="flex-1 py-3 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white rounded-lg font-medium flex justify-center items-center gap-2 disabled:opacity-50 transition">
                            <CheckCircle :size="18" /> Approve
                        </button>
                        <button @click="handleDecision('decline')" :disabled="processing"
                            class="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex justify-center items-center gap-2 disabled:opacity-50 transition">
                            <XCircle :size="18" /> Decline
                        </button>
                    </div>
                </div>

                <div v-else class="bg-platinum-100 dark:bg-abyss-700/50 rounded-xl border border-platinum-200 dark:border-abyss-700 p-6 text-center">
                    <p class="text-abyss-900 dark:text-platinum-100 font-medium">
                        You have {{ myRecipientRecord?.status }} this request.
                    </p>
                    <p class="text-sm text-platinum-500 mt-1">
                        Updated on {{ new Date(myRecipientRecord?.updated_at).toLocaleString() }}
                    </p>
                </div>
            </div>

            <div class="border-l border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-4 lg:p-6 flex flex-col h-full">
                <ReviewChat 
    v-if="myRecipientRecord"
    :review-id="review.id" 
    :recipient-id="myRecipientRecord.id" 
    :org-id="orgId"
    context="incoming" 
    class="h-full shadow-none border-none"
/>
            </div>
        </div>
    </div>
</template>