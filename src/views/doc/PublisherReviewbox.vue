<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/api'
import {
    Loader2, X, RefreshCw, Search, Send, Clock,
    Calendar, FileText, Building2, Users, MessageSquare, Download,
    History, ChevronDown, ChevronUp, Upload, AlertCircle, Plus, Edit3,
    UserPlus, Trash2, CheckCircle, XCircle, Eye, Mail, ArrowRight
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

/* ===========================
   State
=========================== */
const loading = ref(true)
const errorMsg = ref('')
const successMsg = ref('')
const threads = ref([])
const selectedId = ref(null)
const me = ref(null)
const myOrganizations = ref([])

const pageMeta = ref(null)
const pageLinks = ref(null)

const q = ref('')
const statusFilter = ref('all')

const thread = ref(null)
const selectedRecipientId = ref(null)
const recipientComments = ref({})
const commentsLoading = ref(false)
const postBusy = ref(false)
const replyText = ref('')

const showVersionHistory = ref(false)
const versions = ref([])
const versionsLoading = ref(false)

const showUploadVersion = ref(false)
const uploadFile = ref(null)
const uploadNote = ref('')
const uploadBusy = ref(false)

const showEditDetails = ref(false)
const editingSubject = ref('')
const editingBody = ref('')
const editingGlobalDueAt = ref('')
const editBusy = ref(false)

const showManageReviewers = ref(false)
const organizationMembers = ref([])
const selectedMemberId = ref(null)
const newReviewerDueAt = ref('')
const addReviewerBusy = ref(false)
const removeReviewerBusy = ref({})
const applyGlobalDueBusy = ref(false)

const showActivityLog = ref(false)
const activityLog = ref([])
const activityLoading = ref(false)

const actionBusy = reactive({
    close: false,
    reopen: false,
    reload: false,
    remind: {}
})

/* ===========================
   Helpers / Mapping
=========================== */
const rightPanelMeta = computed(() => {
    if (!thread.value) return null
    const d = thread.value.document || {}
    const ver = thread.value.version || thread.value.document_version || {}
    const pub = thread.value.publisher || thread.value.publisher_org || {}

    return {
        docTitle: d.title || thread.value.subject || 'Document',
        docType: d.type || null,
        docId: d.id || thread.value.document_id,
        versionId: ver.id || thread.value.document_version_id,
        versionNumber: ver.version_number || null,
        publisherOrgName: pub.name || thread.value.publisher_org_name || '',
        publisherOrgId: pub.id || thread.value.publisher_org_id,
        recipients: thread.value.recipients || [],
        dueAt: thread.value.due_at || null,
    }
})

const recipientStats = computed(() => {
    const recs = rightPanelMeta.value?.recipients || []
    return {
        total: recs.length,
        approved: recs.filter(r => r.status === 'approved').length,
        pending: recs.filter(r => r.status === 'pending').length,
        declined: recs.filter(r => r.status === 'declined').length,
        viewed: recs.filter(r => r.status === 'viewed').length,
    }
})

const currentRecipientComments = computed(() => {
    if (!selectedRecipientId.value) return []
    return recipientComments.value[selectedRecipientId.value] || []
})

const selectedRecipient = computed(() => {
    if (!selectedRecipientId.value || !thread.value) return null
    return thread.value.recipients?.find(r => r.id === selectedRecipientId.value)
})

const filteredThreads = computed(() => {
    const keyword = q.value.trim().toLowerCase()
    const statusK = statusFilter.value
    return threads.value.filter(t => {
        const okStatus = statusK === 'all' ? true : String(t.status || '').toLowerCase() === statusK
        const hay = `${t.subject || ''} ${t.document?.title || ''} ${t.publisher?.name || ''}`.toLowerCase()
        const okQ = keyword ? hay.includes(keyword) : true
        return okStatus && okQ
    })
})

const availableMembers = computed(() => {
    if (!organizationMembers.value.length) return []
    const existingIds = new Set((thread.value?.recipients || []).map(r => r.reviewer_user_id))
    return organizationMembers.value.filter(m => !existingIds.has(m.id))
})

/* ===========================
   Date Formatting
=========================== */
function formatDateTimeLocal(dateString) {
    if (!dateString) return ''
    const d = new Date(dateString)
    if (isNaN(d)) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
}

function shortDateTime(s) {
    if (!s) return ''
    const d = new Date(s)
    return isNaN(d) ? s : d.toLocaleString()
}

function initials(name) {
    if (!name) return '?'
    const parts = String(name).split(' ')
    const a = parts[0]?.[0] || ''
    const b = parts[1]?.[0] || ''
    return (a + b || a).toUpperCase()
}

/* ===========================
   API Calls
=========================== */
async function fetchMe() {
    const { data } = await axios.get('/api/me')
    me.value = data
}

async function fetchMyOrganizations() {
    const { data } = await axios.get('/api/organizations')
    myOrganizations.value = Array.isArray(data) ? data : (data?.data || [])
}

async function fetchPublishedThreads(page = 1) {
    const params = { filter: 'as_publisher', page }
    if (statusFilter.value !== 'all') params.status = statusFilter.value
    if (q.value.trim()) params.q = q.value.trim()

    const { data } = await axios.get('/api/reviews', { params })
    const rows = Array.isArray(data) ? data : (data?.data || [])
    threads.value = normalizeThreads(rows)
    pageMeta.value = data?.meta || null
    pageLinks.value = data?.links || null
}

function normalizeThreads(list) {
    return list.map(t => ({
        id: t.id,
        subject: t.subject || '(no subject)',
        status: t.status || '',
        due_at: t.due_at || null,
        document: t.document || null,
        version: t.version || null,
        publisher: t.publisher || t.publisher_org || null,
        recipients: t.recipients || [],
        updated_at: t.updated_at || t.created_at,
        body: t.body || null,
    }))
}

async function openThread(id) {
    const { data } = await axios.get(`/api/reviews/${id}`)
    thread.value = data
    selectedId.value = id
    recipientComments.value = {}
    selectedRecipientId.value = null

    editingSubject.value = data.subject || ''
    editingBody.value = data.body || ''
    editingGlobalDueAt.value = formatDateTimeLocal(data.due_at)

    const orgId = data.publisher_org_id || data.publisher?.id
    if (orgId) {
        await fetchOrganizationMembers(orgId)
    }

    await Promise.all([
        fetchVersionHistory(data.document_id || data.document?.id),
        fetchActivityLog(id)
    ])
}

async function fetchOrganizationMembers(orgId) {
    try {
        const { data } = await axios.get(`/api/organizations/${orgId}/members`)
        organizationMembers.value = Array.isArray(data) ? data : (data?.data || [])
    } catch (e) {
        console.error('Failed to fetch org members:', e)
        organizationMembers.value = []
    }
}

async function fetchRecipientComments(reviewId, recipientId) {
    commentsLoading.value = true
    try {
        const { data } = await axios.get(`/api/reviews/${reviewId}/recipients/${recipientId}/comments`)
        const comments = Array.isArray(data) ? data : (data?.data || [])
        recipientComments.value[recipientId] = comments
    } catch (e) {
        console.error('Failed to load recipient comments:', e)
        recipientComments.value[recipientId] = []
    } finally {
        commentsLoading.value = false
    }
}

async function fetchVersionHistory(documentId) {
    if (!documentId) return
    versionsLoading.value = true
    try {
        const { data } = await axios.get(`/api/documents/${documentId}`)
        versions.value = Array.isArray(data.versions) ? data.versions : []
    } catch (e) {
        console.error('Failed to load versions:', e)
        versions.value = []
    } finally {
        versionsLoading.value = false
    }
}

async function fetchActivityLog(reviewId) {
    activityLoading.value = true
    try {
        const { data } = await axios.get(`/api/reviews/${reviewId}/actions`)
        activityLog.value = Array.isArray(data) ? data : []
    } catch (e) {
        console.error('Failed to load activity log:', e)
        activityLog.value = []
    } finally {
        activityLoading.value = false
    }
}

async function postCommentToRecipient() {
    if (!replyText.value.trim() || !thread.value || !selectedRecipientId.value) return
    postBusy.value = true
    errorMsg.value = ''
    try {
        const payload = { body: replyText.value.trim() }
        const { data: saved } = await axios.post(
            `/api/reviews/${thread.value.id}/recipients/${selectedRecipientId.value}/comments`,
            payload
        )
        if (!recipientComments.value[selectedRecipientId.value]) {
            recipientComments.value[selectedRecipientId.value] = []
        }
        recipientComments.value[selectedRecipientId.value].push(saved)
        replyText.value = ''
        successMsg.value = 'Message sent successfully'
        setTimeout(() => successMsg.value = '', 3000)
    } catch (e) {
        errorMsg.value = e?.response?.data?.message || 'Failed to post comment'
    } finally {
        postBusy.value = false
    }
}

async function uploadNewVersion() {
    if (!uploadFile.value || !thread.value) {
        errorMsg.value = 'Please select a file'
        return
    }

    uploadBusy.value = true
    errorMsg.value = ''
    try {
        const fd = new FormData()
        fd.append('file', uploadFile.value)
        if (uploadNote.value) fd.append('note', uploadNote.value)

        const { data } = await axios.post(
            `/api/reviews/${thread.value.id}/versions`,
            fd,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )

        thread.value.version = data.version || data
        thread.value.document_version_id = data.version_id || data.id

        await fetchVersionHistory(thread.value.document_id || thread.value.document?.id)
        await fetchActivityLog(thread.value.id)

        showUploadVersion.value = false
        uploadFile.value = null
        uploadNote.value = ''
        successMsg.value = 'New version uploaded successfully'
        setTimeout(() => successMsg.value = '', 3000)
    } catch (err) {
        errorMsg.value = err?.response?.data?.message || 'Failed to upload version'
    } finally {
        uploadBusy.value = false
    }
}

async function saveEditDetails() {
    if (!thread.value) return
    editBusy.value = true
    errorMsg.value = ''
    try {
        const payload = {
            subject: editingSubject.value || undefined,
            body: editingBody.value || undefined,
            due_at: editingGlobalDueAt.value || undefined,
        }

        const { data } = await axios.patch(`/api/reviews/${thread.value.id}`, payload)
        thread.value = data
        editingSubject.value = data.subject || ''
        editingBody.value = data.body || ''
        editingGlobalDueAt.value = formatDateTimeLocal(data.due_at)
        showEditDetails.value = false
        successMsg.value = 'Details updated successfully'
        setTimeout(() => successMsg.value = '', 3000)
        await fetchActivityLog(thread.value.id)
    } catch (err) {
        errorMsg.value = err?.response?.data?.message || 'Failed to update details'
    } finally {
        editBusy.value = false
    }
}

async function addReviewer() {
    if (!selectedMemberId.value || !thread.value) return
    addReviewerBusy.value = true
    errorMsg.value = ''
    try {
        const payload = {
            add_recipients: [{
                user_id: selectedMemberId.value,
                org_id: rightPanelMeta.value.publisherOrgId,
                due_at: newReviewerDueAt.value || null
            }]
        }
        const { data } = await axios.patch(`/api/reviews/${thread.value.id}`, payload)
        thread.value.recipients = data.recipients || data
        selectedMemberId.value = null
        newReviewerDueAt.value = ''
        successMsg.value = 'Reviewer added successfully'
        setTimeout(() => successMsg.value = '', 3000)
        await fetchActivityLog(thread.value.id)
    } catch (err) {
        errorMsg.value = err?.response?.data?.message || 'Failed to add reviewer'
    } finally {
        addReviewerBusy.value = false
    }
}

async function removeReviewer(recipientId) {
    if (!thread.value || !confirm('Are you sure you want to remove this reviewer?')) return
    removeReviewerBusy.value[recipientId] = true
    errorMsg.value = ''
    try {
        await axios.delete(`/api/reviews/${thread.value.id}/recipients/${recipientId}`)
        thread.value.recipients = thread.value.recipients.filter(r => r.id !== recipientId)
        successMsg.value = 'Reviewer removed successfully'
        setTimeout(() => successMsg.value = '', 3000)
        await fetchActivityLog(thread.value.id)
    } catch (err) {
        errorMsg.value = err?.response?.data?.message || 'Failed to remove reviewer'
    } finally {
        removeReviewerBusy.value[recipientId] = false
    }
}

async function updateRecipientDueDate(recipientId, newDueAt) {
    if (!thread.value) return
    try {
        const { data } = await axios.patch(`/api/reviews/${thread.value.id}/recipients/${recipientId}`, {
            due_at: newDueAt || null
        })
        const recipient = thread.value.recipients.find(r => r.id === recipientId)
        if (recipient) {
            recipient.due_at = data.due_at || newDueAt || null
        }
        await fetchActivityLog(thread.value.id)
    } catch (err) {
        errorMsg.value = err?.response?.data?.message || 'Failed to update due date'
    }
}

async function applyGlobalDueDate() {
    if (!thread.value || !editingGlobalDueAt.value) return
    applyGlobalDueBusy.value = true
    errorMsg.value = ''
    try {
        const promises = thread.value.recipients.map(r =>
            updateRecipientDueDate(r.id, editingGlobalDueAt.value)
        )
        await Promise.all(promises)
        successMsg.value = 'Due date applied to all reviewers'
        setTimeout(() => successMsg.value = '', 3000)
    } catch (err) {
        errorMsg.value = 'Failed to apply due date to all reviewers'
    } finally {
        applyGlobalDueBusy.value = false
    }
}

async function closeReview() {
    if (!thread.value) return
    actionBusy.close = true
    try {
        await axios.post(`/api/reviews/${thread.value.id}/close`)
        thread.value.status = 'closed'
        await fetchActivityLog(thread.value.id)
        successMsg.value = 'Review closed'
        setTimeout(() => successMsg.value = '', 3000)
    } finally {
        actionBusy.close = false
    }
}

async function reopenReview() {
    if (!thread.value) return
    actionBusy.reopen = true
    try {
        await axios.post(`/api/reviews/${thread.value.id}/reopen`)
        thread.value.status = 'in_review'
        await fetchActivityLog(thread.value.id)
        successMsg.value = 'Review reopened'
        setTimeout(() => successMsg.value = '', 3000)
    } finally {
        actionBusy.reopen = false
    }
}

async function remindRecipient(recipientId) {
    if (!thread.value) return
    actionBusy.remind[recipientId] = true
    try {
        await axios.post(`/api/reviews/${thread.value.id}/recipients/${recipientId}/remind`)
        await fetchActivityLog(thread.value.id)
        successMsg.value = 'Reminder sent successfully'
        setTimeout(() => successMsg.value = '', 3000)
    } finally {
        actionBusy.remind[recipientId] = false
    }
}

async function downloadVersion(docId, versionId, versionNumber) {
    try {
        const url = `/api/documents/${docId}/versions/${versionId}/download`
        const response = await axios.get(url, { responseType: 'blob' })

        const contentType = response.headers['content-type'] || 'application/octet-stream'
        const blob = new Blob([response.data], { type: contentType })
        const blobUrl = window.URL.createObjectURL(blob)

        const contentDisposition = response.headers['content-disposition']
        let filename = `document_v${versionNumber}`

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '')
            }
        }

        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()

        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
        console.error('Download failed:', error)
        errorMsg.value = 'Failed to download file'
    }
}

async function downloadCurrentVersion() {
    const m = rightPanelMeta.value
    if (!m?.docId || !m?.versionId) return
    await downloadVersion(m.docId, m.versionId, m.versionNumber || 'current')
}

function onFileSelect(e) {
    uploadFile.value = e.target.files?.[0] || null
}

function getActionIcon(action) {
    const icons = {
        sent: Send,
        viewed: Eye,
        approved: CheckCircle,
        declined: XCircle,
        closed: X,
        reopened: RefreshCw,
        reminded: Mail,
        version_uploaded: Upload,
        reviewer_removed: Trash2,
        due_date_updated: Calendar,
        reassigned: UserPlus
    }
    return icons[action] || ArrowRight
}

function getActionColor(action) {
    const colors = {
        sent: 'text-blue-600',
        viewed: 'text-purple-600',
        approved: 'text-green-600',
        declined: 'text-red-600',
        closed: 'text-gray-600',
        reopened: 'text-blue-600',
        reminded: 'text-orange-600',
        version_uploaded: 'text-indigo-600',
        reviewer_removed: 'text-red-600',
        due_date_updated: 'text-amber-600',
        reassigned: 'text-teal-600'
    }
    return colors[action] || 'text-gray-600'
}

function formatActionText(activity) {
    const actor = activity.actor?.name || 'Someone'
    const meta = activity.meta || {}

    const texts = {
        sent: `${actor} sent the review`,
        viewed: `${actor} viewed the document`,
        approved: `${actor} approved the review`,
        declined: `${actor} declined${meta.reason ? ': ' + meta.reason : ''}`,
        closed: `${actor} closed the review`,
        reopened: `${actor} reopened the review`,
        reminded: `${actor} sent a reminder to ${meta.recipient_name || 'a reviewer'}`,
        version_uploaded: `${actor} uploaded version ${meta.version || 'new'}`,
        reviewer_removed: `${actor} removed reviewer ${meta.reviewer_name || 'someone'}`,
        due_date_updated: `${actor} updated due date for ${meta.reviewer_name || 'a reviewer'}`,
        reassigned: `${actor} added new reviewers`
    }

    return texts[activity.action] || `${actor} performed action: ${activity.action}`
}

/* ===========================
   Lifecycle
=========================== */
onMounted(async () => {
    loading.value = true
    errorMsg.value = ''
    try {
        await fetchMe()
        await fetchMyOrganizations()
        await fetchPublishedThreads()
        const fromRoute = Number(route.query.rid || route.params.id || '')
        const firstId = fromRoute || (threads.value[0]?.id ?? null)
        if (firstId) await openThread(firstId)
    } catch (e) {
        errorMsg.value = e?.response?.data?.message || e.message || 'Failed to load mailbox'
    } finally {
        loading.value = false
    }
})

watch(() => route.query.rid, (rid) => {
    const id = Number(rid || '')
    if (id) openThread(id)
})

watch(selectedRecipientId, async (recipientId) => {
    if (recipientId && thread.value) {
        await fetchRecipientComments(thread.value.id, recipientId)
    }
})
</script>

<template>
    <div class="h-[calc(100vh-64px)] grid grid-cols-12 gap-0 bg-platinum-50 dark:bg-abyss-900">

        <!-- LEFT: Sent Reviews List -->
        <aside
            class="col-span-3 border-r border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 flex flex-col">
            <div class="p-3 border-b border-platinum-200 dark:border-abyss-700">
                <div class="flex items-center gap-2">
                    <div class="relative flex-1">
                        <Search class="absolute left-2 top-2.5 h-4 w-4 text-platinum-700" />
                        <input v-model="q" placeholder="Search reviews"
                            class="w-full pl-8 pr-3 py-2 rounded-lg text-sm border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200" />
                    </div>
                    <button
                        class="px-2 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 hover:bg-platinum-100 dark:hover:bg-abyss-700"
                        @click="fetchPublishedThreads">
                        <RefreshCw class="h-4 w-4" />
                    </button>
                </div>
                <div class="mt-2">
                    <select v-model="statusFilter"
                        class="w-full text-sm border border-platinum-300 dark:border-abyss-600 rounded-lg px-2 py-1.5 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200">
                        <option value="all">All</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="in_review">In review</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto">
                <div v-if="loading"
                    class="p-4 text-sm text-platinum-800 dark:text-platinum-300 flex items-center gap-2">
                    <Loader2 class="h-4 w-4 animate-spin" /> Loading…
                </div>
                <div v-else-if="filteredThreads.length === 0" class="p-4 text-sm text-platinum-700">No sent reviews.
                </div>

                <ul v-else class="divide-y divide-platinum-100 dark:divide-abyss-700">
                    <li v-for="t in filteredThreads" :key="t.id"
                        class="p-3 cursor-pointer hover:bg-platinum-100 dark:hover:bg-abyss-700"
                        :class="t.id === selectedId ? 'bg-kaitoke-green-50 dark:bg-abyss-700 ring-1 ring-kaitoke-green-300/40' : ''"
                        @click="openThread(t.id)">
                        <div class="flex items-center justify-between gap-2">
                            <div class="font-medium text-sm truncate text-abyss-900 dark:text-platinum-100">{{ t.subject
                                }}</div>
                            <div class="text-[11px] text-platinum-700">{{ shortDateTime(t.updated_at) }}</div>
                        </div>
                        <div class="text-xs text-platinum-700 truncate flex items-center gap-2 mt-0.5">
                            <FileText class="h-3.5 w-3.5" />
                            <span>{{ t.document?.title || '—' }}</span>
                        </div>
                        <div class="text-[11px] mt-1 flex items-center gap-2">
                            <span
                                class="inline-flex items-center px-1.5 py-0.5 rounded bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 text-kaitoke-green-800 dark:text-kaitoke-green-300">
                                {{ t.status }}
                            </span>
                        </div>
                    </li>
                </ul>
            </div>

            <div v-if="pageMeta"
                class="p-3 flex items-center justify-between text-sm border-t border-platinum-200 dark:border-abyss-700">
                <div class="text-platinum-700">Page {{ pageMeta.current_page }} / {{ pageMeta.last_page }}</div>
                <div class="flex gap-2">
                    <button :disabled="pageMeta.current_page <= 1"
                        class="px-2 py-1 rounded border border-platinum-300 dark:border-abyss-600 disabled:opacity-50"
                        @click="fetchPublishedThreads(pageMeta.current_page - 1)">Prev</button>
                    <button :disabled="pageMeta.current_page >= pageMeta.last_page"
                        class="px-2 py-1 rounded border border-platinum-300 dark:border-abyss-600 disabled:opacity-50"
                        @click="fetchPublishedThreads(pageMeta.current_page + 1)">Next</button>
                </div>
            </div>
        </aside>

        <!-- MIDDLE: Recipient Selection + Private Conversation -->
        <main class="col-span-6 bg-platinum-100 dark:bg-abyss-800 flex flex-col">
            <!-- Recipient selection tabs -->
            <div class="px-4 py-3 border-b border-platinum-200 dark:border-abyss-700">
                <div v-if="!thread" class="text-sm text-platinum-700">Select a review to start.</div>

                <div v-else>
                    <div class="flex items-center justify-between mb-2">
                        <h2 class="text-lg font-semibold text-abyss-900 dark:text-platinum-100">{{ thread.subject }}
                        </h2>
                        <span
                            class="text-xs px-2 py-1 rounded-full bg-platinum-200 dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100">{{
                                thread.status }}</span>
                    </div>

                    <!-- Recipient tabs -->
                    <div class="flex gap-1 overflow-x-auto pb-2">
                        <button v-for="recipient in rightPanelMeta?.recipients" :key="recipient.id"
                            @click="selectedRecipientId = recipient.id"
                            class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5"
                            :class="selectedRecipientId === recipient.id
                                ? 'bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 text-kaitoke-green-800 dark:text-kaitoke-green-300'
                                : 'bg-platinum-100 dark:bg-abyss-700 text-abyss-900 dark:text-platinum-200 hover:bg-platinum-200 dark:hover:bg-abyss-600'">
                            {{ recipient.reviewer?.name || recipient.user?.name || 'Unknown' }}
                            <span v-if="recipient.status === 'approved'" class="text-green-600">
                                <CheckCircle class="h-3 w-3" />
                            </span>
                            <span v-else-if="recipient.status === 'declined'" class="text-red-600">
                                <XCircle class="h-3 w-3" />
                            </span>
                            <span v-else-if="recipient.status === 'viewed'" class="text-blue-600">
                                <Eye class="h-3 w-3" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Private Conversation for Selected Recipient -->
            <div class="flex-1 overflow-y-auto px-4 py-3">
                <div v-if="!thread" class="text-sm text-platinum-700">Select a review to view conversations.</div>

                <div v-else-if="!selectedRecipientId" class="text-sm text-platinum-700 text-center py-6">
                    Select a reviewer above to start a private conversation
                </div>

                <div v-else class="space-y-6">
                    <!-- Selected Recipient Info -->
                    <div v-if="selectedRecipient"
                        class="text-xs p-3 bg-platinum-50 dark:bg-abyss-700 rounded-lg border border-platinum-200 dark:border-abyss-600">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-2">
                                <div
                                    class="h-8 w-8 rounded-full bg-platinum-300 dark:bg-abyss-600 grid place-items-center text-xs font-medium text-abyss-900 dark:text-platinum-100">
                                    {{ initials(selectedRecipient.reviewer?.name || 'U') }}
                                </div>
                                <div>
                                    <div class="font-semibold text-abyss-900 dark:text-platinum-100">{{
                                        selectedRecipient.reviewer?.name || 'Unknown' }}</div>
                                    <div class="text-platinum-700">{{ selectedRecipient.reviewer?.email }}</div>
                                </div>
                            </div>
                            <span class="px-2 py-1 rounded text-xs font-medium" :class="{
                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': selectedRecipient.status === 'approved',
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': selectedRecipient.status === 'declined',
                                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': selectedRecipient.status === 'viewed',
                                'bg-platinum-200 text-platinum-800 dark:bg-abyss-600 dark:text-platinum-300': selectedRecipient.status === 'pending'
                            }">
                                {{ selectedRecipient.status }}
                            </span>
                        </div>
                        <div v-if="selectedRecipient.due_at" class="flex items-center gap-1 text-platinum-700">
                            <Clock class="h-3 w-3" />
                            <span>Due: {{ shortDateTime(selectedRecipient.due_at) }}</span>
                        </div>
                    </div>

                    <!-- Private Messages -->
                    <div>
                        <div
                            class="flex items-center gap-2 text-sm font-medium mb-3 text-abyss-900 dark:text-platinum-100">
                            <MessageSquare class="h-4 w-4" />
                            Private Conversation
                        </div>

                        <div v-if="commentsLoading"
                            class="text-sm text-platinum-700 flex items-center gap-2 justify-center py-8">
                            <Loader2 class="h-5 w-5 animate-spin" /> Loading messages…
                        </div>

                        <div v-else-if="currentRecipientComments.length === 0" class="text-center py-8">
                            <MessageSquare class="h-12 w-12 mx-auto text-platinum-400 mb-2" />
                            <p class="text-sm text-platinum-700">No messages yet. Start the conversation!</p>
                        </div>

                        <div v-else class="space-y-4">
                            <div v-for="c in currentRecipientComments" :key="c.id" class="flex items-start gap-3"
                                :class="c.author_user_id === me?.id ? 'flex-row-reverse' : ''">
                                <div
                                    class="h-9 w-9 rounded-full bg-platinum-200 dark:bg-abyss-700 grid place-items-center text-xs font-medium shrink-0 text-abyss-900 dark:text-platinum-100">
                                    {{ initials(c.author?.name || 'U') }}
                                </div>
                                <div class="min-w-0 flex-1 max-w-[80%]">
                                    <div class="text-xs text-platinum-700 flex items-center gap-2 mb-1"
                                        :class="c.author_user_id === me?.id ? 'flex-row-reverse' : ''">
                                        <span class="font-medium text-abyss-900 dark:text-platinum-100">
                                            {{ c.author?.name || 'User' }}
                                            <span v-if="c.author_user_id === me?.id"
                                                class="text-kaitoke-green-600">(You)</span>
                                        </span>
                                        <span>•</span>
                                        <span>{{ shortDateTime(c.created_at) }}</span>
                                    </div>
                                    <div class="text-sm whitespace-pre-wrap rounded-lg px-3 py-2"
                                        :class="c.author_user_id === me?.id
                                            ? 'bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 text-abyss-900 dark:text-platinum-100'
                                            : 'bg-white dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100 border border-platinum-200 dark:border-abyss-600'">
                                        {{ c.body }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Reply box -->
                    <div class="border-t border-platinum-200 dark:border-abyss-700 pt-3">
                        <label class="block text-xs font-medium text-platinum-700 mb-2">Reply to {{
                            selectedRecipient?.reviewer?.name || 'reviewer' }}</label>
                        <textarea v-model="replyText" rows="3"
                            class="w-full border border-platinum-300 dark:border-abyss-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-kaitoke-green-500 focus:border-kaitoke-green-500 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-100"
                            placeholder="Type your private message…" />
                        <div class="flex justify-end mt-2">
                            <button :disabled="!replyText.trim() || postBusy"
                                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white transition"
                                :class="(!replyText.trim() || postBusy) ? 'bg-kaitoke-green-300 cursor-not-allowed' : 'bg-kaitoke-green-600 hover:bg-kaitoke-green-700'"
                                @click="postCommentToRecipient">
                                <Loader2 v-if="postBusy" class="h-4 w-4 animate-spin" />
                                <Send v-else class="h-4 w-4" />
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- RIGHT: Publisher Controls & Details -->
        <aside
            class="col-span-3 border-l border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 overflow-y-auto">
            <div class="p-3 space-y-3">
                <div class="text-sm font-semibold text-abyss-900 dark:text-platinum-100">Publisher Panel</div>

                <!-- Success/Error Messages -->
                <div v-if="successMsg"
                    class="rounded-lg border border-green-300 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 p-2">
                    <div class="text-sm text-green-700 dark:text-green-400 flex gap-2">
                        <CheckCircle class="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{{ successMsg }}</span>
                    </div>
                </div>

                <div v-if="errorMsg"
                    class="rounded-lg border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-2">
                    <div class="text-sm text-red-700 dark:text-red-400 flex gap-2">
                        <AlertCircle class="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{{ errorMsg }}</span>
                    </div>
                </div>

                <div v-if="!thread" class="text-sm text-platinum-700">No thread selected.</div>

                <div v-else class="space-y-3">
                    <!-- Edit Details -->
                    <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 overflow-hidden">
                        <button @click="showEditDetails = !showEditDetails"
                            class="w-full flex items-center justify-between text-sm p-3 hover:bg-platinum-50 dark:hover:bg-abyss-700 transition text-abyss-900 dark:text-platinum-100">
                            <div class="flex items-center gap-2">
                                <Edit3 class="h-4 w-4" />
                                <span class="font-medium">Edit Details</span>
                            </div>
                            <ChevronDown v-if="!showEditDetails" class="h-4 w-4" />
                            <ChevronUp v-else class="h-4 w-4" />
                        </button>

                        <div v-if="showEditDetails"
                            class="p-3 pt-0 space-y-3 border-t border-platinum-200 dark:border-abyss-700">
                            <div>
                                <label class="block text-xs font-medium text-platinum-700 mb-1">Subject</label>
                                <input v-model="editingSubject" type="text"
                                    class="w-full text-sm border border-platinum-300 dark:border-abyss-600 rounded px-2 py-1.5 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-100 focus:ring-2 focus:ring-kaitoke-green-500" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-platinum-700 mb-1">Instructions</label>
                                <textarea v-model="editingBody" rows="3"
                                    class="w-full text-sm border border-platinum-300 dark:border-abyss-600 rounded px-2 py-1.5 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-100 focus:ring-2 focus:ring-kaitoke-green-500" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-platinum-700 mb-1">Global Due Date</label>
                                <input v-model="editingGlobalDueAt" type="datetime-local"
                                    class="w-full text-sm border border-platinum-300 dark:border-abyss-600 rounded px-2 py-1.5 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-100 focus:ring-2 focus:ring-kaitoke-green-500" />
                                <button v-if="editingGlobalDueAt && thread.recipients?.length > 0"
                                    :disabled="applyGlobalDueBusy" @click="applyGlobalDueDate"
                                    class="mt-2 w-full text-xs px-2 py-1.5 rounded border border-kaitoke-green-600 text-kaitoke-green-700 hover:bg-kaitoke-green-50 dark:hover:bg-kaitoke-green-900/20 disabled:opacity-50 flex items-center justify-center gap-1">
                                    <Loader2 v-if="applyGlobalDueBusy" class="h-3 w-3 animate-spin" />
                                    <Calendar v-else class="h-3 w-3" />
                                    Apply to All Reviewers
                                </button>
                            </div>
                            <button :disabled="editBusy"
                                class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-white bg-kaitoke-green-600 hover:bg-kaitoke-green-700 disabled:opacity-50 transition"
                                @click="saveEditDetails">
                                <Loader2 v-if="editBusy" class="h-4 w-4 animate-spin" />
                                Save Changes
                            </button>
                        </div>
                    </div>

                    <!-- Manage Reviewers -->
                    <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 overflow-hidden">
                        <button @click="showManageReviewers = !showManageReviewers"
                            class="w-full flex items-center justify-between text-sm p-3 hover:bg-platinum-50 dark:hover:bg-abyss-700 transition text-abyss-900 dark:text-platinum-100">
                            <div class="flex items-center gap-2">
                                <Users class="h-4 w-4" />
                                <span class="font-medium">Manage Reviewers</span>
                            </div>
                            <ChevronDown v-if="!showManageReviewers" class="h-4 w-4" />
                            <ChevronUp v-else class="h-4 w-4" />
                        </button>

                        <div v-if="showManageReviewers"
                            class="p-3 pt-0 space-y-3 border-t border-platinum-200 dark:border-abyss-700">
                            <!-- Add Reviewer -->
                            <div class="p-3 bg-platinum-50 dark:bg-abyss-700 rounded-lg">
                                <label class="block text-xs font-medium text-platinum-700 mb-2">Add Reviewer</label>
                                <select v-model="selectedMemberId"
                                    class="w-full text-sm border border-platinum-300 dark:border-abyss-600 rounded px-2 py-1.5 mb-2 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200">
                                    <option :value="null">Select member...</option>
                                    <option v-for="member in availableMembers" :key="member.id" :value="member.id">
                                        {{ member.name }} ({{ member.email }})
                                    </option>
                                </select>
                                <input v-model="newReviewerDueAt" type="datetime-local"
                                    placeholder="Due date (optional)"
                                    class="w-full text-sm border border-platinum-300 dark:border-abyss-600 rounded px-2 py-1.5 mb-2 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-100" />
                                <button :disabled="!selectedMemberId || addReviewerBusy"
                                    class="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-kaitoke-green-600 hover:bg-kaitoke-green-700 disabled:opacity-50"
                                    @click="addReviewer">
                                    <Loader2 v-if="addReviewerBusy" class="h-3 w-3 animate-spin" />
                                    <UserPlus v-else class="h-3 w-3" />
                                    Add Reviewer
                                </button>
                            </div>

                            <!-- Current Reviewers List -->
                            <div class="space-y-2">
                                <div class="text-xs font-medium text-platinum-700 mb-2">Current Reviewers</div>
                                <div v-for="r in thread.recipients" :key="r.id"
                                    class="flex items-start gap-2 p-2 rounded bg-platinum-50 dark:bg-abyss-700 border border-platinum-200 dark:border-abyss-600">
                                    <div class="flex-1 min-w-0">
                                        <div class="font-medium text-sm text-abyss-900 dark:text-platinum-100">
                                            {{ r.reviewer?.name || 'Unknown' }}
                                        </div>
                                        <div class="text-xs text-platinum-700 mt-0.5">
                                            {{ r.reviewer?.email }}
                                        </div>
                                        <div class="mt-1.5">
                                            <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium" :class="{
                                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': r.status === 'approved',
                                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': r.status === 'declined',
                                                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': r.status === 'viewed',
                                                'bg-platinum-200 text-platinum-800 dark:bg-abyss-600 dark:text-platinum-300': r.status === 'pending'
                                            }">
                                                {{ r.status }}
                                            </span>
                                        </div>
                                        <!-- Individual Due Date -->
                                        <div class="mt-2">
                                            <label class="block text-xs text-platinum-700 mb-1">Due Date</label>
                                            <input type="datetime-local" :value="formatDateTimeLocal(r.due_at)"
                                                @change="(e) => updateRecipientDueDate(r.id, e.target.value)"
                                                class="w-full text-xs border border-platinum-300 dark:border-abyss-600 rounded px-2 py-1 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-100" />
                                        </div>
                                    </div>
                                    <button v-if="!['approved', 'declined'].includes(r.status)"
                                        :disabled="removeReviewerBusy[r.id]" @click="removeReviewer(r.id)"
                                        class="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 disabled:opacity-50 shrink-0"
                                        title="Remove reviewer">
                                        <Loader2 v-if="removeReviewerBusy[r.id]" class="h-4 w-4 animate-spin" />
                                        <Trash2 v-else class="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Document Info -->
                    <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 p-3">
                        <div class="flex items-center gap-2 text-sm mb-2 text-abyss-900 dark:text-platinum-100">
                            <FileText class="h-4 w-4" />
                            <span class="font-medium">{{ rightPanelMeta?.docTitle }}</span>
                        </div>
                        <div class="text-xs text-platinum-700 space-y-1">
                            <div v-if="rightPanelMeta?.docType">Type: {{ rightPanelMeta.docType }}</div>
                            <div v-if="rightPanelMeta?.versionNumber" class="flex items-center gap-1">
                                <span>Current: v{{ rightPanelMeta.versionNumber }}</span>
                            </div>
                        </div>
                        <button @click="downloadCurrentVersion"
                            class="mt-3 w-full inline-flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-lg border border-kaitoke-green-600 text-kaitoke-green-700 hover:bg-kaitoke-green-50 dark:hover:bg-kaitoke-green-900/20 font-medium transition">
                            <Download class="h-3.5 w-3.5" /> Download Current Version
                        </button>
                    </div>

                    <!-- Upload New Version -->
                    <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 overflow-hidden">
                        <button @click="showUploadVersion = !showUploadVersion"
                            class="w-full flex items-center justify-between text-sm p-3 hover:bg-platinum-50 dark:hover:bg-abyss-700 transition text-abyss-900 dark:text-platinum-100">
                            <div class="flex items-center gap-2">
                                <Upload class="h-4 w-4" />
                                <span class="font-medium">Upload New Version</span>
                            </div>
                            <ChevronDown v-if="!showUploadVersion" class="h-4 w-4" />
                            <ChevronUp v-else class="h-4 w-4" />
                        </button>

                        <div v-if="showUploadVersion"
                            class="p-3 pt-0 space-y-3 border-t border-platinum-200 dark:border-abyss-700">
                            <input type="file" @change="onFileSelect"
                                class="block w-full text-xs file:mr-2 file:py-2 file:px-3 file:rounded file:border-0
                                      file:bg-kaitoke-green-100 file:text-kaitoke-green-800 hover:file:bg-kaitoke-green-200
                                      dark:file:bg-kaitoke-green-900/30 dark:file:text-kaitoke-green-300 file:font-medium file:cursor-pointer" />
                            <p v-if="uploadFile"
                                class="text-xs text-platinum-700 px-2 py-1 bg-platinum-50 dark:bg-abyss-700 rounded">
                                <strong>{{ uploadFile.name }}</strong> ({{ (uploadFile.size / 1024).toFixed(1) }} KB)
                            </p>
                            <textarea v-model="uploadNote" rows="2" placeholder="Version note (optional)"
                                class="w-full text-xs border border-platinum-300 dark:border-abyss-600 rounded px-2 py-1.5 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-100" />
                            <button :disabled="!uploadFile || uploadBusy"
                                class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-white bg-kaitoke-green-600 hover:bg-kaitoke-green-700 disabled:opacity-50"
                                @click="uploadNewVersion">
                                <Loader2 v-if="uploadBusy" class="h-4 w-4 animate-spin" />
                                <Upload v-else class="h-4 w-4" />
                                Upload Version
                            </button>
                        </div>
                    </div>

                    <!-- Version History -->
                    <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 overflow-hidden">
                        <button @click="showVersionHistory = !showVersionHistory"
                            class="w-full flex items-center justify-between text-sm p-3 hover:bg-platinum-50 dark:hover:bg-abyss-700 transition text-abyss-900 dark:text-platinum-100">
                            <div class="flex items-center gap-2">
                                <History class="h-4 w-4" />
                                <span class="font-medium">Version History</span>
                            </div>
                            <ChevronDown v-if="!showVersionHistory" class="h-4 w-4" />
                            <ChevronUp v-else class="h-4 w-4" />
                        </button>

                        <div v-if="showVersionHistory"
                            class="p-3 pt-0 border-t border-platinum-200 dark:border-abyss-700">
                            <div v-if="versionsLoading" class="text-xs text-platinum-700 py-4 text-center">
                                <Loader2 class="h-4 w-4 animate-spin mx-auto" />
                            </div>
                            <div v-else-if="versions.length === 0" class="text-xs text-platinum-700 py-4 text-center">No
                                versions</div>
                            <div v-else class="space-y-2 max-h-64 overflow-y-auto">
                                <div v-for="ver in versions" :key="ver.id"
                                    class="flex items-center gap-2 p-2 rounded bg-platinum-50 dark:bg-abyss-700 border border-platinum-200 dark:border-abyss-600">
                                    <div class="flex-1 min-w-0">
                                        <div class="font-medium text-xs text-abyss-900 dark:text-platinum-100">v{{
                                            ver.version_number }}</div>
                                        <div class="text-[11px] text-platinum-700">{{ shortDateTime(ver.created_at) }}
                                        </div>
                                        <div v-if="ver.note" class="text-[11px] text-platinum-700 mt-1 truncate"
                                            :title="ver.note">{{ ver.note }}</div>
                                    </div>
                                    <button @click="downloadVersion(rightPanelMeta.docId, ver.id, ver.version_number)"
                                        class="p-1.5 rounded hover:bg-kaitoke-green-100 dark:hover:bg-kaitoke-green-900/30 text-kaitoke-green-700 shrink-0"
                                        title="Download">
                                        <Download class="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recipients Overview -->
                    <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 p-3">
                        <div class="flex items-center gap-2 text-sm mb-3 text-abyss-900 dark:text-platinum-100">
                            <Users class="h-4 w-4" />
                            <span class="font-medium">Reviewers Status</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div class="p-2 rounded bg-platinum-50 dark:bg-abyss-700">
                                <div class="text-platinum-700">Total</div>
                                <div class="text-lg font-semibold text-abyss-900 dark:text-platinum-100">{{
                                    recipientStats.total }}</div>
                            </div>
                            <div class="p-2 rounded bg-green-50 dark:bg-green-900/20">
                                <div class="text-green-700 dark:text-green-400">Approved</div>
                                <div class="text-lg font-semibold text-green-800 dark:text-green-300">{{
                                    recipientStats.approved }}</div>
                            </div>
                            <div class="p-2 rounded bg-orange-50 dark:bg-orange-900/20">
                                <div class="text-orange-700 dark:text-orange-400">Pending</div>
                                <div class="text-lg font-semibold text-orange-800 dark:text-orange-300">{{
                                    recipientStats.pending }}</div>
                            </div>
                            <div class="p-2 rounded bg-red-50 dark:bg-red-900/20">
                                <div class="text-red-700 dark:text-red-400">Declined</div>
                                <div class="text-lg font-semibold text-red-800 dark:text-red-300">{{
                                    recipientStats.declined }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Activity Log -->
                    <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 overflow-hidden">
                        <button @click="showActivityLog = !showActivityLog"
                            class="w-full flex items-center justify-between text-sm p-3 hover:bg-platinum-50 dark:hover:bg-abyss-700 transition text-abyss-900 dark:text-platinum-100">
                            <div class="flex items-center gap-2">
                                <History class="h-4 w-4" />
                                <span class="font-medium">Activity Log</span>
                                <span
                                    class="text-xs text-platinum-700 bg-platinum-200 dark:bg-abyss-600 px-1.5 py-0.5 rounded-full">{{
                                    activityLog.length }}</span>
                            </div>
                            <ChevronDown v-if="!showActivityLog" class="h-4 w-4" />
                            <ChevronUp v-else class="h-4 w-4" />
                        </button>

                        <div v-if="showActivityLog" class="border-t border-platinum-200 dark:border-abyss-700">
                            <div v-if="activityLoading" class="p-4 text-center">
                                <Loader2 class="h-5 w-5 animate-spin mx-auto text-platinum-700" />
                            </div>
                            <div v-else-if="activityLog.length === 0" class="p-4 text-xs text-platinum-700 text-center">
                                No activity yet
                            </div>
                            <div v-else class="max-h-80 overflow-y-auto">
                                <div v-for="activity in activityLog" :key="activity.id"
                                    class="p-3 border-b border-platinum-200 dark:border-abyss-700 last:border-b-0 hover:bg-platinum-50 dark:hover:bg-abyss-700">
                                    <div class="flex items-start gap-2">
                                        <component :is="getActionIcon(activity.action)" class="h-4 w-4 mt-0.5 shrink-0"
                                            :class="getActionColor(activity.action)" />
                                        <div class="flex-1 min-w-0">
                                            <div class="text-xs text-abyss-900 dark:text-platinum-100">
                                                {{ formatActionText(activity) }}
                                            </div>
                                            <div class="text-[11px] text-platinum-700 mt-1">
                                                {{ shortDateTime(activity.created_at) }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Review Controls -->
                    <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 p-3 space-y-2">
                        <div class="text-sm font-medium text-abyss-900 dark:text-platinum-100 mb-3">Review Controls
                        </div>

                        <button v-if="thread.status !== 'closed'" :disabled="actionBusy.close"
                            class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition"
                            @click="closeReview">
                            <Loader2 v-if="actionBusy.close" class="h-4 w-4 animate-spin" />
                            <X v-else class="h-4 w-4" />
                            Close Review
                        </button>

                        <button v-if="thread.status === 'closed'" :disabled="actionBusy.reopen"
                            class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-white bg-kaitoke-green-600 hover:bg-kaitoke-green-700 disabled:opacity-50 transition"
                            @click="reopenReview">
                            <Loader2 v-if="actionBusy.reopen" class="h-4 w-4 animate-spin" />
                            <Plus v-else class="h-4 w-4" />
                            Reopen Review
                        </button>

                        <button :disabled="actionBusy.reload"
                            class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-platinum-300 dark:border-abyss-600 hover:bg-platinum-100 dark:hover:bg-abyss-700 text-abyss-900 dark:text-platinum-100 transition"
                            @click="openThread(selectedId)">
                            <Loader2 v-if="actionBusy.reload" class="h-4 w-4 animate-spin" />
                            <RefreshCw v-else class="h-4 w-4" />
                            Refresh
                        </button>
                    </div>

                    <!-- Quick Actions for Reviewers -->
                    <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 p-3">
                        <div class="text-sm font-medium text-abyss-900 dark:text-platinum-100 mb-3">Quick Actions</div>
                        <div class="space-y-2">
                            <div v-for="r in thread.recipients.filter(rec => rec.status === 'pending' || rec.status === 'viewed')"
                                :key="r.id"
                                class="flex items-center justify-between p-2 rounded bg-platinum-50 dark:bg-abyss-700 text-xs">
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium text-abyss-900 dark:text-platinum-100 truncate">
                                        {{ r.reviewer?.name || 'Unknown' }}
                                    </div>
                                    <div class="text-platinum-700">{{ r.status }}</div>
                                </div>
                                <button :disabled="actionBusy.remind[r.id]" @click="remindRecipient(r.id)"
                                    class="ml-2 px-2 py-1 rounded text-xs border border-orange-600 text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 disabled:opacity-50 flex items-center gap-1 shrink-0">
                                    <Loader2 v-if="actionBusy.remind[r.id]" class="h-3 w-3 animate-spin" />
                                    <Mail v-else class="h-3 w-3" />
                                    Remind
                                </button>
                            </div>
                            <div v-if="thread.recipients.filter(rec => rec.status === 'pending' || rec.status === 'viewed').length === 0"
                                class="text-xs text-platinum-700 text-center py-2">
                                All reviewers have responded
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>