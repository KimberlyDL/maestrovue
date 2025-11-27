<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from '@/utils/api'
import { Loader2, Search, Filter, RefreshCw, FileText, CheckCircle2, AlertTriangle, Clock, XCircle, ChevronDown } from 'lucide-vue-next'
import ReviewListItem from './review_list.vue'

const props = defineProps({
    organizationId: {
        type: [String, Number],
        required: true
    },
    selectedReviewId: {
        type: [String, Number],
        default: null
    }
})

const emit = defineEmits(['select-review'])

/* ===========================
   State
=========================== */
const reviews = ref([])
const loading = ref(false)
const error = ref(null)

const q = ref('') // Search query
const statusFilter = ref('all')
const page = ref(1)
const hasMore = ref(true)

// Filter options (matching status/state from your backend logic, mimicking MemberSubmissions/PublisherReviewbox)
const STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'sent', label: 'Sent/In Review', icon: Clock, color: 'text-blue-500' },
    { value: 'draft', label: 'Draft', icon: FileText, color: 'text-gray-500' },
    { value: 'approved', label: 'Approved', icon: CheckCircle2, color: 'text-green-500' },
    { value: 'rejected', label: 'Admin Rejected', icon: XCircle, color: 'text-red-500' },
    { value: 'pending_revision', label: 'Pending Revision', icon: AlertTriangle, color: 'text-yellow-500' },
]

/* ===========================
   Computed Properties
=========================== */

const currentStatusLabel = computed(() => {
    return STATUS_OPTIONS.find(o => o.value === statusFilter.value)?.label || 'All Statuses'
})

// Client-side filtering/search on the current page data for immediate responsiveness
// Note: Backend handles the initial filtering/pagination. This is for refining the current view.
const filteredReviews = computed(() => {
    const query = q.value.toLowerCase().trim()

    return reviews.value.filter(review => {
        // Simple client-side search across list properties
        const matchesSearch = !query ||
            review.subject.toLowerCase().includes(query) ||
            (review.document_title && review.document_title.toLowerCase().includes(query)) ||
            (review.reviewer_name && review.reviewer_name.toLowerCase().includes(query))

        const matchesStatus = statusFilter.value === 'all' || review.status === statusFilter.value

        return matchesSearch && matchesStatus
    })
})

/* ===========================
   Methods
=========================== */

let timeout = null
const fetchReviews = async (reset = true) => {
    if (!props.organizationId) return

    if (reset) {
        reviews.value = []
        page.value = 1
        hasMore.value = true
        if (timeout) clearTimeout(timeout)
    }

    if (!hasMore.value && !reset) return

    loading.value = true
    error.value = null

    try {
        const response = await axios.get(`/api/org/${props.organizationId}/reviews`, {
            params: {
                page: page.value,
                q: q.value.trim() || null,
                status: statusFilter.value === 'all' ? null : statusFilter.value,
                filter: 'as_publisher'
            }
        })

        // --- THE FIX IS HERE ---

        // 1. Get the raw pagination object (Laravel standard structure)
        const payload = response.data

        // 2. Map the data to add the fields your template expects (document_title, etc.)
        //    This replaces what the Resource class was doing.
        const newReviews = payload.data.map(review => ({
            ...review,
            // Safety check (?.) in case document is deleted/null
            document_title: review.document?.title || 'Untitled Document',
            // Grab the first reviewer's name for display, or default
            reviewer_name: review.recipients?.[0]?.reviewer?.name || 'Unknown Reviewer'
        }))

        if (reset) {
            reviews.value = newReviews
        } else {
            reviews.value = [...reviews.value, ...newReviews]
        }

        // 3. Update pagination state reading directly from payload
        hasMore.value = payload.current_page < payload.last_page

        // Select first item logic...
        if (reset && reviews.value.length > 0 && !props.selectedReviewId) {
            emit('select-review', reviews.value[0].id)
        }

    } catch (err) {
        console.error('Failed to fetch reviews:', err)
        error.value = 'Failed to load reviews.'
    } finally {
        loading.value = false
    }
}

const handleScroll = (event) => {
    const target = event.target
    // Check if user has scrolled near the bottom (50px buffer)
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
        if (!loading.value && hasMore.value) {
            page.value++
            fetchReviews(false) // Load next page
        }
    }
}

// Watch for changes in filters/search to trigger a fresh fetch (with debouncing for 'q')
watch([statusFilter, () => props.organizationId], () => {
    fetchReviews(true)
})

watch(q, () => {
    // Debounce the fetch when search query changes
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => fetchReviews(true), 300)
})


onMounted(() => {
    fetchReviews(true)
})

</script>

<template>
    <div class="h-full flex flex-col">
        <!-- Search and Filter Bar -->
        <div class="p-3 border-b border-platinum-300 dark:border-abyss-700 space-y-2">
            <!-- Search Input -->
            <div class="relative">
                <Search
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-abyss-400 dark:text-platinum-500" />
                <input v-model="q" type="text" placeholder="Search by subject or reviewer..."
                    class="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-platinum-300 dark:border-abyss-600 bg-platinum-50 dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100 focus:ring-kaitoke-green-500 focus:border-kaitoke-green-500">
            </div>

            <!-- Filter Dropdown and Refresh Button -->
            <div class="flex gap-2">
                <!-- Status Filter Dropdown (Custom styling for visual appeal) -->
                <div class="relative flex-1">
                    <select v-model="statusFilter" @change="fetchReviews(true)"
                        class="appearance-none w-full pl-8 pr-8 py-2 text-sm rounded-lg border border-platinum-300 dark:border-abyss-600 bg-platinum-50 dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100 focus:ring-kaitoke-green-500 focus:border-kaitoke-green-500 cursor-pointer">
                        <option v-for="option in STATUS_OPTIONS" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                    <Filter
                        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-abyss-400 dark:text-platinum-500 pointer-events-none" />
                    <ChevronDown
                        class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-abyss-400 dark:text-platinum-500 pointer-events-none" />
                </div>

                <!-- Refresh Button -->
                <button @click="fetchReviews(true)" :disabled="loading"
                    class="p-2 rounded-lg border border-platinum-300 dark:border-abyss-600 hover:bg-platinum-100 dark:hover:bg-abyss-700 transition disabled:opacity-50">
                    <Loader2 v-if="loading && page === 1" class="w-4 h-4 animate-spin text-kaitoke-green-600" />
                    <RefreshCw v-else class="w-4 h-4 text-abyss-600 dark:text-platinum-400" />
                </button>
            </div>
        </div>

        <!-- Review List Area -->
        <div class="flex-1 overflow-y-auto" @scroll="handleScroll">
            <div v-if="error" class="p-4 text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30">{{
                error }}</div>

            <div v-if="reviews.length === 0 && !loading" class="p-4 text-center text-abyss-500 dark:text-platinum-500">
                No submissions found matching the criteria.
            </div>

            <div v-else>
                <ReviewListItem v-for="review in filteredReviews" :key="review.id" :review="review"
                    :is-selected="review.id === selectedReviewId" :status-options="STATUS_OPTIONS"
                    @click="emit('select-review', review.id)" />
            </div>

            <!-- Loading indicator for subsequent pages -->
            <div v-if="loading && reviews.length > 0" class="text-center p-3">
                <Loader2 class="w-6 h-6 mx-auto animate-spin text-kaitoke-green-600" />
            </div>
            <div v-if="!loading && !hasMore && reviews.length > 0"
                class="text-center p-2 text-sm text-abyss-400 dark:text-platinum-600 border-t border-platinum-200 dark:border-abyss-700">
                End of list
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Scoped styles */
</style>