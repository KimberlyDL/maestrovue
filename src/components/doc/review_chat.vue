<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import axios from '@/utils/api'
import { useAuthStore } from '@/stores/auth' // 1. Use Auth Store
import { 
    MessageSquare, Send, Loader2, Paperclip, 
    FileText, Info, CheckCircle // 2. Added CheckCircle import
} from 'lucide-vue-next'

const props = defineProps({
    reviewId: { type: [String, Number], required: true },
    orgId: { type: [String, Number], default: null }, // Made optional for External Reviewers
    recipientId: { type: [String, Number], default: null }, // 3. Added for Private Threads
    context: { type: String, default: 'org' } // 'org' (Publisher) or 'reviewer' (External)
})

const auth = useAuthStore()
const stream = ref([])
const loading = ref(true)
const newMessage = ref('')
const sending = ref(false)
const chatContainer = ref(null)

// 4. Computed Base URL based on Context (Publisher vs Reviewer)
const apiBase = computed(() => {
    // If specific private thread
    if (props.recipientId) {
        if (props.context === 'incoming') {
            // NEW: Handle the reviewer POV url structure
            return `/api/org/${props.orgId}/incoming-reviews/${props.reviewId}/recipients/${props.recipientId}`
        }
        
        return props.context === 'org' 
            ? `/api/org/${props.orgId}/reviews/${props.reviewId}/recipients/${props.recipientId}`
            : `/api/reviews/${props.reviewId}/recipients/${props.recipientId}`
    }

    // Default global thread
    return props.context === 'org'
        ? `/api/org/${props.orgId}/reviews/${props.reviewId}`
        : `/api/reviews/${props.reviewId}`
})

const fetchData = async () => {
    loading.value = true
    try {
        // 1. Fetch Comments
        const commentsRes = await axios.get(`${apiBase.value}/comments`)
        const comments = commentsRes.data || []

        // 2. Fetch Logs (Only fetch logs for the main thread, rarely for private)
        // Note: External reviewers might have restricted access to logs via the 'reviewer' endpoint
        let actions = []
        if (!props.recipientId) {
            // Only try to fetch actions if not in a private thread
            try {
                const actionsRes = await axios.get(`${apiBase.value}/actions`)
                actions = actionsRes.data || []
            } catch (e) {
                console.warn("Could not fetch actions (likely permission restricted)", e)
            }
        }

        // 3. Merge
        const merged = [
            ...comments.map(c => ({
                type: 'comment',
                id: `c-${c.id}`,
                text: c.body,
                author: c.author,
                timestamp: new Date(c.created_at),
                attachments: c.attachments || []
            })),
            ...actions.map(a => ({
                type: 'action',
                id: `a-${a.id}`,
                action_type: a.action,
                text: generateActionText(a),
                author: a.actor,
                timestamp: new Date(a.created_at),
                meta: a.meta
            }))
        ]

        stream.value = merged.sort((a, b) => a.timestamp - b.timestamp)
        scrollToBottom()

    } catch (error) {
        console.error("Chat load failed:", error)
    } finally {
        loading.value = false
    }
}

const generateActionText = (action) => {
    switch (action.action_type) {
        case 'version_uploaded': return `uploaded a new version (v${action.meta?.version}).`
        case 'review_sent': return `submitted this request.`
        case 'review_approved_by_admin': return `approved this submission.`
        case 'review_approved': return `approved the review.` // Reviewer action
        case 'review_declined': return `declined the review.` // Reviewer action
        case 'reviewer_added': return `was added as a reviewer.`
        default: return `performed: ${action.action_type?.replace(/_/g, ' ')}`
    }
}

const sendMessage = async () => {
    const text = newMessage.value.trim()
    if (!text || sending.value) return

    sending.value = true
    try {
        const { data } = await axios.post(`${apiBase.value}/comments`, {
            body: text
        })

        stream.value.push({
            type: 'comment',
            id: `c-${data.id}`,
            text: data.body,
            author: auth.user, // Use Auth Store user for immediate feedback
            timestamp: new Date(),
            attachments: []
        })

        newMessage.value = ''
        scrollToBottom()
    } catch (error) {
        console.error('Send failed', error)
    } finally {
        sending.value = false
    }
}

const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
    })
}

// Watch for prop changes (switching between reviewers)
watch(() => [props.reviewId, props.recipientId], () => {
    fetchData()
})

onMounted(() => {
    fetchData()
})

defineExpose({ refresh: fetchData })
</script>

<template>
    <div class="bg-white dark:bg-abyss-800 rounded-xl shadow-sm border border-platinum-200 dark:border-abyss-700 flex flex-col h-[600px]">
        
        <div class="p-4 border-b border-platinum-200 dark:border-abyss-700 flex justify-between items-center bg-platinum-50 dark:bg-abyss-900 rounded-t-xl">
            <h3 class="font-semibold text-abyss-900 dark:text-platinum-50 flex items-center">
                <MessageSquare class="w-5 h-5 mr-2 text-kaitoke-green-600" /> 
                {{ recipientId ? 'Private Discussion' : 'Activity & Discussion' }}
            </h3>
            <button @click="fetchData" class="text-xs text-kaitoke-green-600 hover:underline">Refresh</button>
        </div>

        <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-platinum-50/50 dark:bg-abyss-900/50">
            <div v-if="loading" class="flex justify-center py-10">
                <Loader2 class="w-8 h-8 animate-spin text-kaitoke-green-600" />
            </div>

            <div v-else-if="stream.length === 0" class="text-center text-gray-500 py-10 text-sm">
                {{ recipientId ? 'No private messages yet.' : 'No activity yet.' }}
            </div>

            <template v-else v-for="msg in stream" :key="msg.id">
                
                <div v-if="msg.type === 'action'" class="flex justify-center my-4">
                    <div class="bg-platinum-100 dark:bg-abyss-700 text-abyss-600 dark:text-platinum-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 border border-platinum-200 dark:border-abyss-600">
                        <FileText v-if="msg.action_type === 'version_uploaded'" class="w-3.5 h-3.5 text-blue-500" />
                        <CheckCircle v-else-if="msg.action_type && msg.action_type.includes('approved')" class="w-3.5 h-3.5 text-green-500" />
                        <Info v-else class="w-3.5 h-3.5" />
                        
                        <span class="font-semibold">{{ msg.author?.name || 'System' }}</span> 
                        <span>{{ msg.text }}</span>
                        <span class="opacity-60 ml-1">{{ msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
                    </div>
                </div>

                <div v-else class="flex gap-3" :class="msg.author?.id === auth.user?.id ? 'flex-row-reverse' : ''">
                    <div class="w-8 h-8 rounded-full bg-kaitoke-green-100 dark:bg-kaitoke-green-900 flex items-center justify-center text-xs font-bold text-kaitoke-green-700 shrink-0 overflow-hidden">
                        <img v-if="msg.author?.avatar" :src="msg.author.avatar" class="w-full h-full object-cover">
                        <span v-else>{{ msg.author?.name?.charAt(0) || '?' }}</span>
                    </div>

                    <div class="max-w-[80%]">
                        <div class="text-xs text-gray-500 mb-1" :class="msg.author?.id === auth.user?.id ? 'text-right' : ''">
                            {{ msg.author?.name }} • {{ msg.timestamp.toLocaleString() }}
                        </div>
                        <div class="p-3 rounded-lg text-sm shadow-sm border"
                            :class="msg.author?.id === auth.user?.id
                                ? 'bg-kaitoke-green-600 text-white border-kaitoke-green-700 rounded-tr-none'
                                : 'bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-100 border-platinum-200 dark:border-abyss-600 rounded-tl-none'">
                            <p class="whitespace-pre-wrap">{{ msg.text }}</p>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <div class="p-4 border-t border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 rounded-b-xl">
            <div class="flex gap-2">
                <input v-model="newMessage" @keyup.enter="sendMessage" :disabled="sending"
                    placeholder="Type a message..."
                    class="flex-1 px-4 py-2 text-sm rounded-lg border border-platinum-300 dark:border-abyss-600 bg-platinum-50 dark:bg-abyss-900 focus:ring-2 focus:ring-kaitoke-green-500 outline-none transition dark:text-white" />
                <button @click="sendMessage" :disabled="!newMessage.trim() || sending"
                    class="bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white p-2 rounded-lg disabled:opacity-50 transition">
                    <Loader2 v-if="sending" class="w-5 h-5 animate-spin" />
                    <Send v-else class="w-5 h-5" />
                </button>
            </div>
        </div>

    </div>
</template>