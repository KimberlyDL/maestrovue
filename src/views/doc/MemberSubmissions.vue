<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/api'
import { useToast } from '@/utils/useToast'
import {
    FileText, Search, RefreshCw, Clock, Calendar, Building2, User,
    CheckCircle2, XCircle, AlertCircle, Edit3, Send, Loader2,
    Eye, MessageSquare, Download, Upload, Plus, Mail, Ban, Trash2, Lock
} from 'lucide-vue-next'

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

// Modals & Forms
const showUpdateModal = ref(false)
const showDeleteModal = ref(false) // New
const updateForm = ref({ subject: '', body: '', due_at: '' })
const updating = ref(false)
const deleting = ref(false) // New

const showRecipientDueModal = ref(false)
const selectedRecipient = ref(null)
const recipientDueForm = ref({ due_at: '' })
const updatingRecipient = ref(false)

// Computed
const filteredSubmissions = computed(() => {
    return submissions.value.filter(s => {
        const matchesStatus = statusFilter.value === 'all' || s.status === statusFilter.value
        const matchesApproval = approvalFilter.value === 'all' || s.approval_status === approvalFilter.value
        const matchesSearch = !search.value ||
            s.subject?.toLowerCase().includes(search.value.toLowerCase()) ||
            s.document?.title?.toLowerCase().includes(search.value.toLowerCase())

        return matchesStatus && matchesApproval && matchesSearch
    })
})

// Check if the review is locked (Cannot edit/update)
const isLocked = computed(() => {
    if (!selectedSubmission.value) return true
    return selectedSubmission.value.approval_status === 'rejected' ||
        selectedSubmission.value.status === 'closed'
})

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
    if (submission.approval_status === 'approved') return { icon: CheckCircle2, text: 'Admin Approved', color: 'text-green-600' }
    if (submission.approval_status === 'rejected') return { icon: Ban, text: 'Admin Rejected', color: 'text-red-600' }
    if (submission.approval_status === 'pending') return { icon: Clock, text: 'Pending Admin Approval', color: 'text-amber-600' }
    return null
}

// API calls
async function fetchSubmissions() {
    try {
        loading.value = true
        const { data } = await axios.get(`/api/org/${orgId.value}/reviews`, {
            params: { filter: 'as_publisher' }
        })
        submissions.value = Array.isArray(data) ? data : (data?.data || [])
    } catch (error) {
        console.error('Failed to fetch submissions:', error)
        toast.error('Failed to load submissions')
    } finally {
        loading.value = false
    }
}

async function selectSubmission(submission) {
    try {
        const { data } = await axios.get(`/api/org/${orgId.value}/reviews/${submission.id}`)
        selectedSubmission.value = data
    } catch (error) {
        toast.error('Failed to load submission details')
    }
}

function openUpdateModal() {
    if (!selectedSubmission.value) return
    updateForm.value = {
        subject: selectedSubmission.value.subject || '',
        body: selectedSubmission.value.body || '',
        due_at: selectedSubmission.value.due_at || ''
    }
    showUpdateModal.value = true
}

async function updateSubmission() {
    if (!selectedSubmission.value) return
    try {
        updating.value = true
        await axios.patch(
            `/api/org/${orgId.value}/reviews/${selectedSubmission.value.id}/details`,
            updateForm.value
        )
        // Update local data
        Object.assign(selectedSubmission.value, updateForm.value)
        const index = submissions.value.findIndex(s => s.id === selectedSubmission.value.id)
        if (index !== -1) submissions.value[index] = { ...submissions.value[index], ...updateForm.value }

        showUpdateModal.value = false
        toast.success('Review updated')
    } catch (error) {
        toast.error(error?.response?.data?.message || 'Update failed')
    } finally {
        updating.value = false
    }
}

// New: Delete Function
async function deleteSubmission() {
    if (!selectedSubmission.value) return
    try {
        deleting.value = true
        await axios.delete(`/api/org/${orgId.value}/reviews/${selectedSubmission.value.id}`)

        // Remove from list
        submissions.value = submissions.value.filter(s => s.id !== selectedSubmission.value.id)
        selectedSubmission.value = null
        showDeleteModal.value = false
        toast.success('Review deleted successfully')
    } catch (error) {
        toast.error(error?.response?.data?.message || 'Delete failed')
    } finally {
        deleting.value = false
    }
}

function openRecipientDueModal(recipient) {
    selectedRecipient.value = recipient
    recipientDueForm.value = { due_at: recipient.due_at || '' }
    showRecipientDueModal.value = true
}

async function updateRecipientDue() {
    if (!selectedSubmission.value || !selectedRecipient.value) return
    try {
        updatingRecipient.value = true
        await axios.patch(
            `/api/org/${orgId.value}/reviews/${selectedSubmission.value.id}/recipients/${selectedRecipient.value.id}/due`,
            recipientDueForm.value
        )
        selectedRecipient.value.due_at = recipientDueForm.value.due_at
        showRecipientDueModal.value = false
        toast.success('Due date updated')
    } catch (error) {
        toast.error('Failed to update due date')
    } finally {
        updatingRecipient.value = false
    }
}

async function remindReviewer(recipient) {
    if (!selectedSubmission.value) return
    try {
        await axios.post(`/api/org/${orgId.value}/reviews/${selectedSubmission.value.id}/recipients/${recipient.id}/remind`)
        toast.success(`Reminder sent`)
    } catch (error) {
        toast.error('Failed to send reminder')
    }
}

function navigateToConversation(recipient) {
    router.push({
        name: 'org.reviews.publisher',
        params: { id: orgId.value },
        query: { review_id: selectedSubmission.value.id, recipient_id: recipient.id }
    })
}

// Lifecycle
onMounted(fetchSubmissions)
watch(() => route.params.id, fetchSubmissions)
</script>

<template>
    <div class="p-6 max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-abyss-900 dark:text-platinum-50">My Submissions</h1>
                <p class="text-sm text-platinum-600 dark:text-platinum-400 mt-1">
                    Manage your review requests
                </p>
            </div>
            <button @click="router.push({ name: 'org.reviews.upload', params: { id: orgId } })"
                class="inline-flex items-center gap-2 px-4 py-2 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white rounded-lg font-medium transition">
                <Plus :size="18" />
                New Submission
            </button>
        </div>

        <div class="bg-white dark:bg-abyss-800 rounded-xl border border-platinum-200 dark:border-abyss-700 p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="relative">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-platinum-500" />
                    <input v-model="search" type="text" placeholder="Search submissions..."
                        class="w-full pl-10 pr-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100" />
                </div>
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
                <select v-model="approvalFilter"
                    class="px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100">
                    <option value="all">All Approval States</option>
                    <option value="pending">Pending Admin Approval</option>
                    <option value="approved">Admin Approved</option>
                    <option value="rejected">Admin Rejected</option>
                </select>
            </div>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12">
            <Loader2 class="w-8 h-8 animate-spin text-kaitoke-green-600" />
        </div>
        <div v-else-if="filteredSubmissions.length === 0"
            class="text-center py-12 bg-white dark:bg-abyss-800 rounded-xl border border-platinum-200 dark:border-abyss-700">
            <FileText class="w-16 h-16 mx-auto text-platinum-400 mb-4" />
            <p class="text-platinum-600 dark:text-platinum-400">No submissions found</p>
        </div>
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="submission in filteredSubmissions" :key="submission.id"
                class="bg-white dark:bg-abyss-800 rounded-xl border border-platinum-200 dark:border-abyss-700 p-6 hover:shadow-lg transition cursor-pointer"
                @click="selectSubmission(submission)">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1 min-w-0">
                        <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50 truncate">
                            {{ submission.subject }}
                        </h3>
                        <p class="text-sm text-platinum-600 dark:text-platinum-400 mt-1">
                            {{ submission.document?.title || '—' }}
                        </p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 mb-4">
                    <span :class="getStatusColor(submission.status)"
                        class="px-2 py-1 rounded-full text-xs font-medium">{{ submission.status }}</span>
                    <span v-if="getApprovalBadge(submission)" :class="getApprovalBadge(submission).color"
                        class="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <component :is="getApprovalBadge(submission).icon" :size="12" />
                        {{ getApprovalBadge(submission).text }}
                    </span>
                </div>
            </div>
        </div>

        <div v-if="selectedSubmission" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            @click.self="selectedSubmission = null">
            <div class="bg-white dark:bg-abyss-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div
                    class="p-6 border-b border-platinum-200 dark:border-abyss-700 flex items-center justify-between sticky top-0 bg-white dark:bg-abyss-800 z-10">
                    <h2 class="text-xl font-bold text-abyss-900 dark:text-platinum-50">Submission Details</h2>
                    <button @click="selectedSubmission = null"
                        class="text-platinum-500 hover:text-abyss-900 dark:hover:text-platinum-200">
                        <XCircle :size="24" />
                    </button>
                </div>

                <div class="p-6 space-y-6">

                    <div v-if="selectedSubmission.approval_status === 'rejected'"
                        class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 flex items-center gap-3">
                        <Ban class="text-red-500 w-5 h-5" />
                        <p class="text-sm text-red-700 dark:text-red-300">
                            This submission was <strong>rejected</strong> by the admin. Editing and reviewer actions are
                            disabled. You may delete this request.
                        </p>
                    </div>
                    <div v-else-if="selectedSubmission.status === 'closed'"
                        class="bg-platinum-100 dark:bg-abyss-700 border-l-4 border-platinum-500 p-4 flex items-center gap-3">
                        <Lock class="text-platinum-500 w-5 h-5" />
                        <p class="text-sm text-platinum-700 dark:text-platinum-300">
                            This review is <strong>closed</strong>. No further actions can be taken.
                        </p>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50 mb-2">{{
                                selectedSubmission.subject }}</h3>
                            <div class="flex flex-wrap gap-2">
                                <span :class="getStatusColor(selectedSubmission.status)"
                                    class="px-2 py-1 rounded-full text-xs font-medium">{{ selectedSubmission.status
                                    }}</span>
                                <span v-if="getApprovalBadge(selectedSubmission)"
                                    :class="getApprovalBadge(selectedSubmission).color"
                                    class="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                    <component :is="getApprovalBadge(selectedSubmission).icon" :size="12" />
                                    {{ getApprovalBadge(selectedSubmission).text }}
                                </span>
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <button v-if="!isLocked" @click="openUpdateModal"
                                class="inline-flex items-center gap-2 px-3 py-2 border border-platinum-300 dark:border-abyss-600 rounded-lg hover:bg-platinum-100 dark:hover:bg-abyss-700 text-sm font-medium">
                                <Edit3 :size="16" /> Edit
                            </button>

                            <button
                                v-if="selectedSubmission.approval_status === 'rejected' || selectedSubmission.status === 'draft'"
                                @click="showDeleteModal = true"
                                class="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
                                <Trash2 :size="16" /> Delete
                            </button>
                        </div>
                    </div>

                    <div v-if="selectedSubmission.body">
                        <h4 class="text-sm font-medium text-platinum-700 dark:text-platinum-300 mb-2">Message:</h4>
                        <p
                            class="text-sm text-abyss-900 dark:text-platinum-100 whitespace-pre-wrap bg-platinum-50 dark:bg-abyss-700 rounded-lg p-4">
                            {{ selectedSubmission.body }}
                        </p>
                    </div>

                    <div v-if="selectedSubmission.approval_status === 'rejected' && selectedSubmission.rejection_reason"
                        class="rounded-lg border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4">
                        <div class="flex items-start gap-2">
                            <AlertCircle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                                <p class="text-sm font-medium text-red-900 dark:text-red-300 mb-1">Rejection Reason:</p>
                                <p class="text-sm text-red-700 dark:text-red-400">{{ selectedSubmission.rejection_reason
                                    }}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-sm font-medium text-platinum-700 dark:text-platinum-300 mb-3">Reviewers:</h4>
                        <div class="space-y-3">
                            <div v-for="recipient in selectedSubmission.recipients" :key="recipient.id"
                                class="rounded-lg border border-platinum-200 dark:border-abyss-700 p-4">
                                <div class="flex items-start justify-between mb-3">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 rounded-full bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 flex items-center justify-center text-sm font-semibold text-kaitoke-green-600">
                                            {{ recipient.reviewer?.name?.charAt(0).toUpperCase() }}
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-abyss-900 dark:text-platinum-100">{{
                                                recipient.reviewer?.name }}</p>
                                            <p class="text-xs text-platinum-600 dark:text-platinum-400">{{
                                                recipient.status }}</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex gap-2">
                                    <button @click="openRecipientDueModal(recipient)" :disabled="isLocked"
                                        class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm border border-platinum-300 dark:border-abyss-600 rounded-lg hover:bg-platinum-100 dark:hover:bg-abyss-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <Calendar :size="14" /> Update Due
                                    </button>
                                    <button @click="remindReviewer(recipient)"
                                        :disabled="isLocked || ['approved', 'declined'].includes(recipient.status)"
                                        class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm border border-platinum-300 dark:border-abyss-600 rounded-lg hover:bg-platinum-100 dark:hover:bg-abyss-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <Mail :size="14" /> Reminder
                                    </button>
                                    <button @click="navigateToConversation(recipient)"
                                        class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white rounded-lg">
                                        <MessageSquare :size="14" /> Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
            @click.self="showDeleteModal = false">
            <div class="bg-white dark:bg-abyss-800 rounded-xl max-w-sm w-full p-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <Trash2 class="w-6 h-6 text-red-600" />
                    </div>
                    <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50">Delete Submission</h3>
                </div>
                <p class="text-sm text-platinum-600 dark:text-platinum-400 mb-6">
                    Are you sure? This action cannot be undone.
                </p>
                <div class="flex gap-3">
                    <button @click="showDeleteModal = false"
                        class="flex-1 px-4 py-2 border border-platinum-300 dark:border-abyss-600 rounded-lg hover:bg-platinum-100 dark:hover:bg-abyss-700">
                        Cancel
                    </button>
                    <button @click="deleteSubmission" :disabled="deleting"
                        class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50">
                        <Loader2 v-if="deleting" class="w-4 h-4 animate-spin" />
                        Delete
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showUpdateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
            @click.self="showUpdateModal = false">
            <div class="bg-white dark:bg-abyss-800 rounded-xl max-w-2xl w-full p-6">
                <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50 mb-4">Update Details</h3>
                <div class="space-y-4 mb-6">
                    <input v-model="updateForm.subject"
                        class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700"
                        placeholder="Subject" />
                    <textarea v-model="updateForm.body" rows="4"
                        class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700"
                        placeholder="Message"></textarea>
                    <input v-model="updateForm.due_at" type="datetime-local"
                        class="w-full px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700" />
                </div>
                <div class="flex gap-3">
                    <button @click="showUpdateModal = false" class="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                    <button @click="updateSubmission"
                        class="flex-1 px-4 py-2 bg-kaitoke-green-600 text-white rounded-lg">Update</button>
                </div>
            </div>
        </div>

        <div v-if="showRecipientDueModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
            @click.self="showRecipientDueModal = false">
            <div class="bg-white dark:bg-abyss-800 rounded-xl max-w-md w-full p-6">
                <h3 class="text-lg font-semibold mb-4">Update Due Date</h3>
                <input v-model="recipientDueForm.due_at" type="datetime-local"
                    class="w-full px-4 py-2 mb-6 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700" />
                <div class="flex gap-3">
                    <button @click="showRecipientDueModal = false"
                        class="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                    <button @click="updateRecipientDue"
                        class="flex-1 px-4 py-2 bg-kaitoke-green-600 text-white rounded-lg">Update</button>
                </div>
            </div>
        </div>

    </div>
</template>