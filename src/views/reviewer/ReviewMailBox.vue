<!-- src/views/review/ReviewerInbox.vue -->
<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import {
    Loader2, Check, X, Eye, RefreshCw, Search, Send, Clock,
    Calendar, FileText, Building2, Users, MessageSquare, Download,
    History, ChevronDown, ChevronUp
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

/* ===========================
   State
=========================== */
const loading = ref(true)
const errorMsg = ref('')
const threads = ref([])
const selectedId = ref(null)
const me = ref(null)

const pageMeta = ref(null)
const pageLinks = ref(null)

const q = ref('')
const statusFilter = ref('all')

const thread = ref(null)
const comments = ref([])
const commentsLoading = ref(false)
const postBusy = ref(false)
const replyText = ref('')

const showVersionHistory = ref(false)
const versions = ref([])
const versionsLoading = ref(false)

const actionBusy = reactive({ view: false, approve: false, decline: false, reload: false })

/* ===========================
   Helpers / Mapping
=========================== */
const myRecipient = computed(() => {
    if (!thread.value || !me.value) return null
    const recs = Array.isArray(thread.value.recipients) ? thread.value.recipients : []
    return recs.find(r => Number(r.reviewer_user_id) === Number(me.value.id)) || null
})

// Show ALL comments - don't filter them
const visibleComments = computed(() => {
    const list = Array.isArray(comments.value) ? comments.value : []
    return list
})

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
        effectiveDue: (myRecipient.value?.due_at) || (thread.value?.due_at) || null,
        recipients: thread.value.recipients || [],
    }
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

/* ===========================
   API
=========================== */
async function fetchMe() {
    const { data } = await axios.get('/api/me')
    me.value = data
}

async function fetchAssignedThreads(page = 1) {
    const params = { filter: 'as_reviewer', page }
    if (statusFilter.value !== 'all') params.status = statusFilter.value
    if (q.value.trim()) params.q = q.value.trim()
    const orgIdQ = Number(route.query.orgId || '')
    if (orgIdQ) params.publisher_org_id = orgIdQ

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
    }))
}

async function openThread(id) {
    const { data } = await axios.get(`/api/reviews/${id}`)
    thread.value = data
    selectedId.value = id
    await Promise.all([
        fetchComments(id),
        fetchVersionHistory(data.document_id || data.document?.id)
    ])

    const mine = myRecipient.value
    if (mine && !mine.viewed_at && mine.id) {
        try {
            await axios.patch(`/api/reviews/${id}/recipients/${mine.id}/view`)
            mine.viewed_at = new Date().toISOString()
        } catch (e) {
            console.error('Failed to mark as viewed:', e)
        }
    }
}

async function fetchComments(reviewId) {
    commentsLoading.value = true
    try {
        const { data } = await axios.get(`/api/reviews/${reviewId}/comments`)
        comments.value = Array.isArray(data) ? data : (data?.data || [])
    } catch {
        comments.value = []
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

async function postComment() {
    if (!replyText.value.trim() || !thread.value) return
    postBusy.value = true
    try {
        const payload = { body: replyText.value.trim() }
        const { data: saved } = await axios.post(`/api/reviews/${thread.value.id}/comments`, payload)
        comments.value.push(saved)
        replyText.value = ''
    } finally {
        postBusy.value = false
    }
}

async function markViewed() {
    if (!thread.value || !myRecipient.value?.id) return
    actionBusy.view = true
    try {
        await axios.patch(`/api/reviews/${thread.value.id}/recipients/${myRecipient.value.id}/view`)
        myRecipient.value.viewed_at = new Date().toISOString()
    } finally {
        actionBusy.view = false
    }
}

async function approve() {
    if (!thread.value || !myRecipient.value?.id) return
    actionBusy.approve = true
    try {
        await axios.post(`/api/reviews/${thread.value.id}/recipients/${myRecipient.value.id}/approve`)
        myRecipient.value.status = 'approved'
    } finally {
        actionBusy.approve = false
    }
}

async function decline() {
    if (!thread.value || !myRecipient.value?.id) return
    actionBusy.decline = true
    try {
        await axios.post(`/api/reviews/${thread.value.id}/recipients/${myRecipient.value.id}/decline`)
        myRecipient.value.status = 'declined'
    } finally {
        actionBusy.decline = false
    }
}

/* ===========================
   Download handlers
=========================== */
async function downloadVersion(docId, versionId, versionNumber) {
    try {
        const url = `/api/documents/${docId}/versions/${versionId}/download`

        // Create a temporary anchor element and trigger download
        const response = await axios.get(url, {
            responseType: 'blob',
        })

        // Get the actual content type from response
        const contentType = response.headers['content-type'] || 'application/octet-stream'

        // Create blob with correct content type
        const blob = new Blob([response.data], { type: contentType })
        const blobUrl = window.URL.createObjectURL(blob)

        // Get filename from Content-Disposition header or generate one
        const contentDisposition = response.headers['content-disposition']
        let filename = `document_v${versionNumber}`

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '')
            }
        }

        // Create link and trigger download
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()

        // Cleanup
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
        console.error('Download failed:', error)
        alert('Failed to download file. Please try again.')
    }
}

async function downloadCurrentVersion() {
    const m = rightPanelMeta.value
    if (!m?.docId || !m?.versionId) return
    await downloadVersion(m.docId, m.versionId, m.versionNumber || 'current')
}

/* ===========================
   Lifecycle
=========================== */
onMounted(async () => {
    loading.value = true
    errorMsg.value = ''
    try {
        if (!auth.user) await auth.restoreSession?.()
        me.value = auth.user || null
        if (!me.value) await fetchMe()

        await fetchAssignedThreads()
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

/* ===========================
   UI utils
=========================== */
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
</script>

<template>
    <div class="h-[calc(100vh-64px)] grid grid-cols-12 gap-0 bg-platinum-50 dark:bg-abyss-900">

        <!-- LEFT: Inbox -->
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
                        @click="fetchAssignedThreads">
                        <RefreshCw class="h-4 w-4" />
                    </button>
                </div>
                <div class="mt-2">
                    <select v-model="statusFilter"
                        class="w-full text-sm border border-platinum-300 dark:border-abyss-600 rounded-lg px-2 py-1.5 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-200">
                        <option value="all">All</option>
                        <option value="sent">Sent</option>
                        <option value="in_review">In review</option>
                        <option value="approved">Approved</option>
                        <option value="closed">Closed</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto">
                <div v-if="loading"
                    class="p-4 text-sm text-platinum-800 dark:text-platinum-300 flex items-center gap-2">
                    <Loader2 class="h-4 w-4 animate-spin" /> Loading…
                </div>
                <div v-else-if="filteredThreads.length === 0" class="p-4 text-sm text-platinum-700">No assigned reviews.
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
                            <Building2 class="h-3.5 w-3.5" />
                            <span>{{ t.publisher?.name || '—' }}</span>
                        </div>
                        <div class="text-[11px] mt-1 flex items-center gap-2">
                            <span
                                class="inline-flex items-center px-1.5 py-0.5 rounded bg-platinum-100 dark:bg-abyss-700 text-abyss-800 dark:text-platinum-200">
                                {{ t.status }}
                            </span>
                            <span v-if="t.due_at" class="inline-flex items-center gap-1 text-sun-700">
                                <Clock class="h-3 w-3" /> {{ shortDateTime(t.due_at) }}
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
                        @click="fetchAssignedThreads(pageMeta.current_page - 1)">Prev</button>
                    <button :disabled="pageMeta.current_page >= pageMeta.last_page"
                        class="px-2 py-1 rounded border border-platinum-300 dark:border-abyss-600 disabled:opacity-50"
                        @click="fetchAssignedThreads(pageMeta.current_page + 1)">Next</button>
                </div>
            </div>
        </aside>

        <!-- MIDDLE: Conversation -->
        <main class="col-span-6 bg-platinum-100 dark:bg-abyss-800 flex flex-col">
            <div class="px-4 py-3 border-b border-platinum-200 dark:border-abyss-700 flex items-center justify-between">
                <div class="min-w-0">
                    <div class="text-xs text-platinum-700">Subject</div>
                    <h2 class="text-lg font-semibold truncate text-abyss-900 dark:text-platinum-100">{{ thread?.subject
                        || '—' }}</h2>
                </div>
                <div class="text-xs text-platinum-700">
                    <span>Status: </span>
                    <span class="font-medium text-abyss-900 dark:text-platinum-100">{{ thread?.status || '—' }}</span>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto px-4 py-3">
                <div v-if="!thread" class="text-sm text-platinum-700">Select a review to view the discussion.</div>

                <div v-else class="space-y-6">
                    <!-- Comments -->
                    <div>
                        <div
                            class="flex items-center gap-2 text-sm font-medium mb-2 text-abyss-900 dark:text-platinum-100">
                            <MessageSquare class="h-4 w-4" />
                            Conversation
                        </div>

                        <div v-if="commentsLoading" class="text-sm text-platinum-700 flex items-center gap-2">
                            <Loader2 class="h-4 w-4 animate-spin" /> Loading messages…
                        </div>

                        <div v-else-if="visibleComments.length === 0" class="text-sm text-platinum-700">No messages yet.
                        </div>

                        <div v-else class="space-y-4">
                            <div v-for="c in visibleComments" :key="c.id" class="flex items-start gap-3">
                                <div
                                    class="h-8 w-8 rounded-full bg-platinum-200 dark:bg-abyss-700 grid place-items-center text-xs shrink-0 text-abyss-900 dark:text-platinum-100">
                                    {{ initials(c.author?.name || 'U') }}
                                </div>
                                <div class="min-w-0 flex-1">
                                    <div class="text-xs text-platinum-700 flex items-center gap-2">
                                        <span class="font-medium text-abyss-900 dark:text-platinum-100">
                                            {{ c.author?.name || 'User' }}
                                            <span v-if="c.author_user_id === me?.id"
                                                class="text-kaitoke-green-600">(You)</span>
                                        </span>
                                        <span>•</span>
                                        <span>{{ shortDateTime(c.created_at) }}</span>
                                    </div>
                                    <div class="text-sm whitespace-pre-wrap text-abyss-900 dark:text-platinum-100 mt-1">
                                        {{ c.body }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Reply box -->
                    <div class="border-t border-platinum-200 dark:border-abyss-700 pt-3">
                        <label class="block text-xs text-platinum-700 mb-1">Write a reply</label>
                        <textarea v-model="replyText" rows="3"
                            class="w-full border border-platinum-300 dark:border-abyss-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-kaitoke-green-500 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-100"
                            placeholder="Type your message…" />
                        <div class="flex justify-end mt-2">
                            <button :disabled="!replyText.trim() || postBusy"
                                class="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg text-white"
                                :class="(!replyText.trim() || postBusy) ? 'bg-kaitoke-green-300 cursor-not-allowed' : 'bg-kaitoke-green-600 hover:bg-kaitoke-green-700'"
                                @click="postComment">
                                <Loader2 v-if="postBusy" class="h-4 w-4 animate-spin" />
                                <Send v-else class="h-4 w-4" />
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- RIGHT: Details & Actions -->
        <aside
            class="col-span-3 border-l border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-3 overflow-y-auto">
            <div class="text-sm font-semibold mb-2 text-abyss-900 dark:text-platinum-100">Details</div>

            <div v-if="!thread" class="text-sm text-platinum-700">No thread selected.</div>

            <div v-else class="space-y-4">
                <!-- Document -->
                <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 p-3">
                    <div class="flex items-center gap-2 text-sm text-abyss-900 dark:text-platinum-100">
                        <FileText class="h-4 w-4" />
                        <span class="font-medium">{{ rightPanelMeta?.docTitle }}</span>
                    </div>
                    <div class="text-xs text-platinum-700 mt-1">
                        <div v-if="rightPanelMeta?.docType">Type: {{ rightPanelMeta.docType }}</div>
                        <div v-if="rightPanelMeta?.versionNumber">Current: v{{ rightPanelMeta.versionNumber }}</div>
                    </div>
                    <button @click="downloadCurrentVersion"
                        class="mt-2 inline-flex items-center gap-2 text-xs text-kaitoke-green-700 hover:text-kaitoke-green-800 cursor-pointer">
                        <Download class="h-3.5 w-3.5" /> Download current version
                    </button>
                </div>

                <!-- Version History -->
                <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 p-3">
                    <button @click="showVersionHistory = !showVersionHistory"
                        class="w-full flex items-center justify-between text-sm text-abyss-900 dark:text-platinum-100">
                        <div class="flex items-center gap-2">
                            <History class="h-4 w-4" />
                            <span class="font-medium">Version History</span>
                        </div>
                        <ChevronDown v-if="!showVersionHistory" class="h-4 w-4" />
                        <ChevronUp v-else class="h-4 w-4" />
                    </button>

                    <div v-if="showVersionHistory" class="mt-2 space-y-2">
                        <div v-if="versionsLoading" class="text-xs text-platinum-700">Loading...</div>
                        <div v-else-if="versions.length === 0" class="text-xs text-platinum-700">No versions</div>
                        <div v-else class="space-y-1">
                            <div v-for="ver in versions" :key="ver.id"
                                class="flex items-center justify-between text-xs p-2 rounded bg-platinum-50 dark:bg-abyss-700">
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium text-abyss-900 dark:text-platinum-100">v{{
                                        ver.version_number }}</div>
                                    <div class="text-platinum-700">{{ shortDateTime(ver.created_at) }}</div>
                                    <div v-if="ver.note" class="text-platinum-700 mt-1 truncate">{{ ver.note }}</div>
                                </div>
                                <button @click="downloadVersion(rightPanelMeta.docId, ver.id, ver.version_number)"
                                    class="ml-2 text-kaitoke-green-700 hover:text-kaitoke-green-800 shrink-0">
                                    <Download class="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Publisher -->
                <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 p-3">
                    <div class="flex items-center gap-2 text-sm text-abyss-900 dark:text-platinum-100">
                        <Building2 class="h-4 w-4" />
                        <span class="font-medium">Publisher</span>
                    </div>
                    <div class="text-xs text-platinum-700 mt-1">
                        {{ rightPanelMeta?.publisherOrgName || '—' }}
                    </div>
                </div>

                <!-- Participants -->
                <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 p-3">
                    <div class="flex items-center gap-2 text-sm text-abyss-900 dark:text-platinum-100">
                        <Users class="h-4 w-4" />
                        <span class="font-medium">Participants</span>
                    </div>
                    <ul class="mt-1 space-y-1">
                        <li v-for="r in rightPanelMeta?.recipients || []" :key="r.id"
                            class="text-xs text-abyss-900 dark:text-platinum-100">
                            • {{ r.reviewer?.name || r.user?.name || 'Unknown' }}
                        </li>
                    </ul>
                </div>

                <!-- Deadline -->
                <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 p-3">
                    <div class="flex items-center gap-2 text-sm text-abyss-900 dark:text-platinum-100">
                        <Calendar class="h-4 w-4" />
                        <span class="font-medium">Deadline</span>
                    </div>
                    <div class="text-xs text-platinum-700 mt-1">
                        {{ rightPanelMeta?.effectiveDue ? shortDateTime(rightPanelMeta.effectiveDue) : '—' }}
                    </div>
                </div>

                <!-- Actions -->
                <div class="rounded-lg border border-platinum-300 dark:border-abyss-600 p-3 space-y-2">
                    <div class="text-sm font-medium text-abyss-900 dark:text-platinum-100">Your Actions</div>

                    <button v-if="!myRecipient?.viewed_at" :disabled="actionBusy.view"
                        class="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-platinum-300 dark:border-abyss-600 hover:bg-platinum-100 dark:hover:bg-abyss-700"
                        @click="markViewed">
                        <Loader2 v-if="actionBusy.view" class="h-4 w-4 animate-spin" />
                        <Eye v-else class="h-4 w-4" />
                        Mark as viewed
                    </button>

                    <button
                        v-if="myRecipient && !['approved', 'declined'].includes(String(myRecipient.status || '').toLowerCase())"
                        :disabled="actionBusy.approve"
                        class="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-lg text-white bg-kaitoke-green-600 hover:bg-kaitoke-green-700 disabled:opacity-50"
                        @click="approve">
                        <Loader2 v-if="actionBusy.approve" class="h-4 w-4 animate-spin" />
                        <Check v-else class="h-4 w-4" />
                        Approve
                    </button>

                    <button
                        v-if="myRecipient && !['approved', 'declined'].includes(String(myRecipient.status || '').toLowerCase())"
                        :disabled="actionBusy.decline"
                        class="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-lg text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
                        @click="decline">
                        <Loader2 v-if="actionBusy.decline" class="h-4 w-4 animate-spin" />
                        <X v-else class="h-4 w-4" />
                        Decline
                    </button>

                    <button :disabled="actionBusy.reload"
                        class="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-platinum-300 dark:border-abyss-600 hover:bg-platinum-100 dark:hover:bg-abyss-700"
                        @click="openThread(selectedId)">
                        <Loader2 v-if="actionBusy.reload" class="h-4 w-4 animate-spin" />
                        <RefreshCw v-else class="h-4 w-4" />
                        Refresh
                    </button>
                </div>

                <div v-if="errorMsg" class="text-sm text-rose-600">{{ errorMsg }}</div>
            </div>
        </aside>
    </div>
</template>