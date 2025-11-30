<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/api'
import { useToast } from '@/utils/useToast'
import {
    FileText, Search, RefreshCw, Clock, Calendar, Building2, User,
    CheckCircle2, XCircle, AlertCircle, Filter, Loader2,
    Eye, MessageSquare, Ban, ArrowRight, FileEdit, Users, X
} from 'lucide-vue-next'

// Import the details component
import ReviewDetails from '@/components/doc/review_details.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const orgId = computed(() => route.params.id)

// State
const loading = ref(true)
const submissions = ref([])
const selectedSubmission = ref(null)
const search = ref('')
const statusFilter = ref('all')
const approvalFilter = ref('all')

// Modals
const showApprovalModal = ref(false)
const showRejectionModal = ref(false)
const showDetailsModal = ref(false) // New state for details modal

const processingSubmission = ref(null)
const rejectionReason = ref('')
const processing = ref(false)

// Computed
const filteredSubmissions = computed(() => {
    return submissions.value.filter(s => {
        const matchesStatus = statusFilter.value === 'all' || s.status === statusFilter.value
        const matchesApproval = approvalFilter.value === 'all' || s.approval_status === approvalFilter.value
        const matchesSearch = !search.value ||
            s.subject?.toLowerCase().includes(search.value.toLowerCase()) ||
            s.document?.title?.toLowerCase().includes(search.value.toLowerCase()) ||
            s.submitter?.name?.toLowerCase().includes(search.value.toLowerCase())

        return matchesStatus && matchesApproval && matchesSearch
    })
})

const pendingCount = computed(() =>
    submissions.value.filter(s => s.approval_status === 'pending').length
)

const approvedCount = computed(() =>
    submissions.value.filter(s => s.approval_status === 'approved').length
)

const rejectedCount = computed(() =>
    submissions.value.filter(s => s.approval_status === 'rejected').length
)

// Helper functions
function formatDate(date) {
    if (!date) return '—'
    return new Date(date).toLocaleString()
}

function getStatusColor(status) {
    const colors = {
        draft: 'bg-platinum-100 text-platinum-800 dark:bg-platinum-900/20 dark:text-platinum-300',
        sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        in_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        declined: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
        closed: 'bg-platinum-200 text-platinum-800 dark:bg-abyss-700 dark:text-platinum-300',
    }
    return colors[status] || colors.draft
}

function getApprovalBadge(submission) {
    if (submission.approval_status === 'approved') {
        return {
            icon: CheckCircle2,
            text: 'Approved',
            color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        }
    }
    if (submission.approval_status === 'rejected') {
        return {
            icon: Ban,
            text: 'Rejected',
            color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        }
    }
    if (submission.approval_status === 'pending') {
        return {
            icon: Clock,
            text: 'Pending Approval',
            color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
        }
    }
    return null
}

// API calls
async function fetchSubmissions() {
    try {
        loading.value = true
        const { data } = await axios.get(`/api/org/${orgId.value}/reviews`, {
            params: { filter: 'all_submissions' }
        })
        submissions.value = Array.isArray(data) ? data : (data?.data || [])
    } catch (error) {
        console.error('Failed to fetch submissions:', error)
        toast.error('Failed to load submissions')
    } finally {
        loading.value = false
    }
}

// Updated to open modal
async function viewSubmission(submission) {
    try {
        loading.value = true
        // Fetch full details
        const { data } = await axios.get(`/api/org/${orgId.value}/reviews/${submission.id}`)
        selectedSubmission.value = data
        showDetailsModal.value = true
    } catch (error) {
        console.error('Failed to load submission details:', error)
        toast.error('Failed to load details')
    } finally {
        loading.value = false
    }
}

function openApprovalModal(submission) {
    processingSubmission.value = submission
    showApprovalModal.value = true
}

function openRejectionModal(submission) {
    processingSubmission.value = submission
    rejectionReason.value = ''
    showRejectionModal.value = true
}

async function approveSubmission() {
    if (!processingSubmission.value) return

    try {
        processing.value = true
        await axios.post(
            `/api/org/${orgId.value}/reviews/${processingSubmission.value.id}/approve`
        )

        // Update local data
        const index = submissions.value.findIndex(s => s.id === processingSubmission.value.id)
        if (index !== -1) {
            submissions.value[index].approval_status = 'approved'
            submissions.value[index].approved_by = 'You'
            submissions.value[index].approved_at = new Date().toISOString()
        }

        if (selectedSubmission.value?.id === processingSubmission.value.id) {
            selectedSubmission.value.approval_status = 'approved'
        }

        showApprovalModal.value = false
        processingSubmission.value = null
        toast.success('Submission approved successfully')
    } catch (error) {
        console.error('Failed to approve submission:', error)
        toast.error(error?.response?.data?.message || 'Failed to approve submission')
    } finally {
        processing.value = false
    }
}

async function rejectSubmission() {
    if (!processingSubmission.value) return

    try {
        processing.value = true
        await axios.post(
            `/api/org/${orgId.value}/reviews/${processingSubmission.value.id}/reject`,
            { reason: rejectionReason.value }
        )

        // Update local data
        const index = submissions.value.findIndex(s => s.id === processingSubmission.value.id)
        if (index !== -1) {
            submissions.value[index].approval_status = 'rejected'
            submissions.value[index].rejection_reason = rejectionReason.value
            submissions.value[index].rejected_by = 'You'
            submissions.value[index].rejected_at = new Date().toISOString()
        }

        if (selectedSubmission.value?.id === processingSubmission.value.id) {
            selectedSubmission.value.approval_status = 'rejected'
            selectedSubmission.value.rejection_reason = rejectionReason.value
        }

        showRejectionModal.value = false
        processingSubmission.value = null
        rejectionReason.value = ''
        toast.success('Submission rejected')
    } catch (error) {
        console.error('Failed to reject submission:', error)
        toast.error(error?.response?.data?.message || 'Failed to reject submission')
    } finally {
        processing.value = false
    }
}

// Lifecycle
onMounted(() => {
    fetchSubmissions()
})

watch(() => route.params.id, () => {
    fetchSubmissions()
})
</script>

<template>
    <div class="max-w-7xl px-4 sm:px-6 py-6 lg:px-8">
        <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-2xl font-bold text-abyss-900 dark:text-platinum-50">Review Submissions</h1>
                    <p class="text-sm text-platinum-600 dark:text-platinum-400 mt-1">
                        Manage and approve member review submissions
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <Clock class="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p class="text-sm text-amber-700 dark:text-amber-400">Pending Approval</p>
                            <p class="text-2xl font-bold text-amber-900 dark:text-amber-300">{{ pendingCount }}</p>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-xl p-4">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle2 class="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p class="text-sm text-green-700 dark:text-green-400">Approved</p>
                            <p class="text-2xl font-bold text-green-900 dark:text-green-300">{{ approvedCount }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <Ban class="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p class="text-sm text-red-700 dark:text-red-400">Rejected</p>
                            <p class="text-2xl font-bold text-red-900 dark:text-red-300">{{ rejectedCount }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-abyss-800 rounded-xl border border-platinum-200 dark:border-abyss-700 p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="relative">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-platinum-500" />
                    <input v-model="search" type="text" placeholder="Search submissions..."
                        class="w-full pl-10 pr-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100" />
                </div>

                <select v-model="approvalFilter"
                    class="px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100">
                    <option value="all">All Approval States</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>

                <select v-model="statusFilter"
                    class="px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100">
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="in_review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                    <option value="closed">Closed</option>
                </select>
            </div>
        </div>

        <div v-if="loading && !showDetailsModal" class="flex items-center justify-center py-12">
            <Loader2 class="w-8 h-8 animate-spin text-kaitoke-green-600" />
            <span class="ml-3 text-platinum-700 dark:text-platinum-400">Loading submissions...</span>
        </div>

        <div v-else-if="filteredSubmissions.length === 0"
            class="text-center py-12 bg-white dark:bg-abyss-800 rounded-xl border border-platinum-200 dark:border-abyss-700">
            <FileText class="w-16 h-16 mx-auto text-platinum-400 mb-4" />
            <p class="text-platinum-600 dark:text-platinum-400">No submissions found</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-4">
            <div v-for="submission in filteredSubmissions" :key="submission.id"
                class="bg-white dark:bg-abyss-800 rounded-xl border border-platinum-200 dark:border-abyss-700 p-6 hover:shadow-lg transition">

                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1 min-w-0">
                        <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50 truncate mb-1">
                            {{ submission.subject }}
                        </h3>
                        <p class="text-sm text-platinum-600 dark:text-platinum-400">
                            {{ submission.document?.title || '—' }}
                        </p>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2 mb-4">
                    <span :class="getStatusColor(submission.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                        {{ submission.status }}
                    </span>

                    <span v-if="getApprovalBadge(submission)" :class="getApprovalBadge(submission).color"
                        class="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <component :is="getApprovalBadge(submission).icon" :size="12" />
                        {{ getApprovalBadge(submission).text }}
                    </span>
                </div>

                <div class="mb-4 flex items-center gap-2 text-sm text-platinum-600 dark:text-platinum-400">
                    <User :size="14" />
                    <span>Submitted by: <strong class="text-abyss-900 dark:text-platinum-100">{{
                        submission.submitter?.name || 'Unknown' }}</strong></span>
                    <span>•</span>
                    <Calendar :size="14" />
                    <span>{{ formatDate(submission.created_at) }}</span>
                </div>

                <div class="mb-4">
                    <p class="text-xs font-medium text-platinum-700 dark:text-platinum-300 mb-2">Reviewers:</p>
                    <div class="flex flex-wrap gap-2">
                        <div v-for="recipient in submission.recipients?.slice(0, 3)" :key="recipient.id"
                            class="inline-flex items-center gap-1.5 px-2 py-1 bg-platinum-100 dark:bg-abyss-700 rounded-lg text-xs">
                            <User :size="12" class="text-platinum-600" />
                            <span class="text-abyss-900 dark:text-platinum-100">
                                {{ recipient.reviewer?.name || 'Unknown' }}
                            </span>
                        </div>
                        <span v-if="submission.recipients?.length > 3"
                            class="text-xs text-platinum-600 dark:text-platinum-400 self-center">
                            +{{ submission.recipients.length - 3 }} more
                        </span>
                    </div>
                </div>

                <div v-if="submission.approval_status === 'rejected' && submission.rejection_reason"
                    class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg">
                    <p class="text-xs font-medium text-red-900 dark:text-red-300 mb-1">Rejection Reason:</p>
                    <p class="text-sm text-red-700 dark:text-red-400">{{ submission.rejection_reason }}</p>
                </div>

                <div class="flex gap-2">
                    <button v-if="submission.approval_status === 'pending'" @click="openApprovalModal(submission)"
                        class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition">
                        <CheckCircle2 :size="16" />
                        Approve
                    </button>

                    <button v-if="submission.approval_status === 'pending'" @click="openRejectionModal(submission)"
                        class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition">
                        <Ban :size="16" />
                        Reject
                    </button>

                    <button @click="viewSubmission(submission)"
                        class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-platinum-300 dark:border-abyss-600 hover:bg-platinum-100 dark:hover:bg-abyss-700 rounded-lg text-sm font-medium transition">
                        <Eye :size="16" />
                        View Details
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showDetailsModal && selectedSubmission"
            class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            @click.self="showDetailsModal = false">
            <div
                class="bg-white dark:bg-abyss-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                <div
                    class="p-4 border-b border-platinum-200 dark:border-abyss-700 flex justify-between items-center bg-white dark:bg-abyss-800 sticky top-0 z-10">
                    <h3 class="text-lg font-bold text-abyss-900 dark:text-platinum-50">Submission Details</h3>
                    <button @click="showDetailsModal = false"
                        class="text-platinum-500 hover:text-abyss-700 dark:hover:text-platinum-300">
                        <X class="w-6 h-6" />
                    </button>
                </div>

                <div class="p-6">
                    <ReviewDetails :review="selectedSubmission" :org-id="orgId"
                        @update-review="viewSubmission(selectedSubmission)" />

                    <div v-if="selectedSubmission.approval_status === 'pending'"
                        class="mt-6 pt-6 border-t border-platinum-200 dark:border-abyss-700 flex gap-4">
                        <button @click="openApprovalModal(selectedSubmission); showDetailsModal = false"
                            class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition">
                            <CheckCircle2 :size="18" />
                            Approve This Submission
                        </button>
                        <button @click="openRejectionModal(selectedSubmission); showDetailsModal = false"
                            class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition">
                            <Ban :size="18" />
                            Reject This Submission
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showApprovalModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            @click.self="showApprovalModal = false">
            <div class="bg-white dark:bg-abyss-800 rounded-xl max-w-md w-full p-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CheckCircle2 class="w-6 h-6 text-green-600" />
                    </div>
                    <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50">Approve Submission</h3>
                </div>

                <p class="text-sm text-platinum-600 dark:text-platinum-400 mb-6">
                    Are you sure you want to approve this review submission? This will allow it to be sent to reviewers.
                </p>

                <div class="flex gap-3">
                    <button @click="showApprovalModal = false"
                        class="flex-1 px-4 py-2 border border-platinum-300 dark:border-abyss-600 rounded-lg hover:bg-platinum-100 dark:hover:bg-abyss-700">
                        Cancel
                    </button>
                    <button @click="approveSubmission" :disabled="processing"
                        class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50">
                        <Loader2 v-if="processing" class="w-4 h-4 animate-spin" />
                        Approve
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showRejectionModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            @click.self="showRejectionModal = false">
            <div class="bg-white dark:bg-abyss-800 rounded-xl max-w-md w-full p-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <Ban class="w-6 h-6 text-red-600" />
                    </div>
                    <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50">Reject Submission</h3>
                </div>

                <p class="text-sm text-platinum-600 dark:text-platinum-400 mb-4">
                    Please provide a reason for rejecting this submission:
                </p>

                <textarea v-model="rejectionReason" rows="4"
                    class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100 mb-4"
                    placeholder="Explain why this submission is being rejected..."></textarea>

                <div class="flex gap-3">
                    <button @click="showRejectionModal = false"
                        class="flex-1 px-4 py-2 border border-platinum-300 dark:border-abyss-600 rounded-lg hover:bg-platinum-100 dark:hover:bg-abyss-700">
                        Cancel
                    </button>
                    <button @click="rejectSubmission" :disabled="processing || !rejectionReason.trim()"
                        class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50">
                        <Loader2 v-if="processing" class="w-4 h-4 animate-spin" />
                        Reject
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>