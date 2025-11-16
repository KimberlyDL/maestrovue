<!-- src\views\doc\DocFileUpload.vue -->
<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { Send, Save, AlertCircle, Loader2 } from 'lucide-vue-next' // Ensure Loader2 is imported

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

/* ===========================
   Config
=========================== */
const DOC_TYPES = [
    { value: 'finance_report', label: 'Finance report' },
    { value: 'event_proposal', label: 'Event proposal' },
    { value: 'other', label: 'Other' },
]

/* ===========================
   Remote data
=========================== */
const myOrganizations = ref([])       // orgs where the current user is a member (publisher choices)
const targetOrganizations = ref([])   // other orgs (reviewer sources)
const reviewers = ref([])             // merged reviewers from selected target orgs
const loadingOptions = ref(false)

/* ===========================
   Form state
=========================== */
const form = reactive({
    // Document owner (publisher)
    organization_id: null,

    // Document
    title: '',
    type: 'other',
    file: null,
    version_note: '',

    // Review thread
    subject: '',
    body: '',
    due_at: '',

    // Selection
    selectedTargetOrgIds: [],
    reviewerIds: [],

    // Per reviewer due map
    perDue: {},
})

/* ===========================
   Derived
=========================== */
const canSubmit = computed(() => {
    return !!form.file &&
        !!form.title &&
        !!form.subject &&
        !!form.type &&
        !!form.organization_id &&
        form.selectedTargetOrgIds.length > 0 &&
        form.reviewerIds.length > 0
})

const publisherOrgName = computed(() =>
    myOrganizations.value.find(o => o.id === form.organization_id)?.name ?? ''
)

/* ===========================
   Loaders (existing routes only)
=========================== */
async function loadMyOrganizations() {
    const { data: me } = await axios.get('/api/me') // you already return organizations here
    const orgs = Array.isArray(me.organizations) ? me.organizations : []
    myOrganizations.value = orgs
    if (!form.organization_id && orgs.length > 0) {
        form.organization_id = orgs[0].id
    }
}

/**
 * Tries:
 * 1) GET /api/organizations?scope=others  (if your OrganizationController@index supports it)
 * 2) falls back to GET /api/organizations, then filters out my orgs client-side
 */
async function loadTargetOrganizations() {
    // my org ids for filtering fallback
    const myIds = new Set(myOrganizations.value.map(o => o.id))

    // Try ?scope=others first
    try {
        const { data } = await axios.get('/api/organizations', { params: { scope: 'others' } })
        if (Array.isArray(data)) {
            targetOrganizations.value = data
            return
        }
    } catch (_) {
        // ignore and try fallback
    }

    // Fallback: GET /api/organizations then filter out mine (works if your index returns all orgs)
    try {
        const { data } = await axios.get('/api/organizations')
        if (Array.isArray(data) && data.length) {
            // If this endpoint already returns "mine", we’ll end with empty set after filtering—still safe.
            targetOrganizations.value = data.filter(o => !myIds.has(o.id))
            return
        }
    } catch (e) {
        // final: empty list
        targetOrganizations.value = []
    }
}

/**
 * Merge reviewers from each selected target org using:
 * GET /api/organizations/{orgId}/members
 */
async function loadReviewersForTargets() {
    reviewers.value = []
    if (form.selectedTargetOrgIds.length === 0) return

    const merged = []
    for (const orgId of form.selectedTargetOrgIds) {
        try {
            const { data } = await axios.get(`/api/organizations/${orgId}/members`)
            const normalized = (Array.isArray(data) ? data : []).map(m => ({
                id: m.user_id ?? m.id,
                name: m.name || 'Unknown',
                email: m.email || null,
                avatar: m.avatar || m.avatar_url || null,
                org_id: orgId,         // reviewer’s home org
                org_name: targetOrganizations.value.find(o => o.id === orgId)?.name ?? '',
                role: m.role || null,  // pivot role if included
            }))
            merged.push(...normalized)
        } catch (e) {
            // ignore single org failure; continue aggregating others
            // console.warn('Failed to load members for org', orgId, e)
        }
    }

    // de-dupe by user_id across selected orgs (keep first occurrence)
    const seen = new Set()
    reviewers.value = merged.filter(r => {
        if (seen.has(r.id)) return false
        seen.add(r.id)
        return true
    })
}

/* ===========================
   Lifecycle
=========================== */
onMounted(async () => {
    loadingOptions.value = true
    try {
        await loadMyOrganizations()
        await loadTargetOrganizations()
    } finally {
        loadingOptions.value = false
    }

    // Optional: preselect target org via query ?targetOrgIds=1,2
    const qs = route.query.targetOrgIds
    if (qs) {
        const parsed = String(qs).split(',').map(v => Number(v.trim())).filter(Boolean)
        form.selectedTargetOrgIds = parsed
        await loadReviewersForTargets()
    }
})

/* ===========================
   Watchers
=========================== */
watch(() => form.organization_id, () => {
    // changing publisher org doesn’t affect target orgs, but we should clear selected reviewers
    form.reviewerIds = []
    form.perDue = {}
})

watch(() => [...form.selectedTargetOrgIds], async () => {
    form.reviewerIds = []
    form.perDue = {}
    await loadReviewersForTargets()
})

/* ===========================
   Handlers
=========================== */
function onFileChange(e) {
    form.file = e.target.files?.[0] ?? null
}
function isChecked(userId) {
    return form.reviewerIds.includes(userId)
}
function toggleReviewer(userId) {
    const i = form.reviewerIds.indexOf(userId)
    if (i === -1) {
        form.reviewerIds.push(userId)
        if (!form.perDue[userId]) form.perDue[userId] = ''
    } else {
        form.reviewerIds.splice(i, 1)
        delete form.perDue[userId]
    }
}

/* ===========================
   Submit flow (existing endpoints)
=========================== */
const isSubmitting = ref(false)
const submitError = ref('')
const toDateTime = v => (v && typeof v === 'string') ? v : ''

async function submit(status = 'sent') {
    submitError.value = ''
    if (!canSubmit.value) {
        submitError.value = 'Please complete all required fields'
        return
    }

    isSubmitting.value = true
    try {
        // 1) create document + v1
        const fd = new FormData()
        fd.append('organization_id', String(form.organization_id)) // publisher org
        fd.append('title', form.title)
        fd.append('type', form.type)
        fd.append('file', form.file)
        if (form.version_note) fd.append('note', form.version_note)

        const { data: createdDoc } = await axios.post('/api/documents', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        // 2) open review thread (cross-org recipients)
        const recipients = form.reviewerIds.map(uid => {
            const u = reviewers.value.find(r => r.id === uid)
            return {
                user_id: uid,
                org_id: u?.org_id ?? null,                     // reviewer’s own org (external)
                due_at: toDateTime(form.perDue[uid]) || null,
            }
        })

        const payload = {
            document_id: createdDoc.id,
            document_version_id: createdDoc.latest_version_id,
            publisher_org_id: form.organization_id,
            subject: form.subject,
            body: form.body || null,
            status,                                          // 'draft' or 'sent'
            due_at: toDateTime(form.due_at) || null,         // global due (optional)
            recipients,
            // optional: target org ids if your backend records it (safe to omit if unused)
            // target_org_ids: form.selectedTargetOrgIds,
        }

        // const { data: thread } = await axios.post('/api/reviews', payload)


        //NEED AYUSIN
        router.push({ name: 'org.doc-submission', params: { id: thread.id } })
    } catch (err) {
        const msg = err?.response?.data?.message
            || err?.response?.data?.error
            || err?.message
            || 'Failed to submit document for review.'
        submitError.value = msg
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="max-w-4xl mx-auto p-6 text-abyss-900 dark:text-platinum-100">
        <h1 class="text-2xl font-semibold mb-1">Upload new document for review</h1>
        <p class="text-sm text-platinum-700 mb-6">
            Pick your org as the owner, then choose reviewers from other organizations.
        </p>

        <div v-if="loadingOptions" class="flex items-center justify-center py-12">
            <Loader2 class="w-8 h-8 animate-spin text-kaitoke-green-600" />
            <span class="ml-3 text-platinum-700">Loading organizations…</span>
        </div>

        <div v-if="submitError"
            class="mb-4 rounded-lg border border-red-300/50 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-3 text-red-700 dark:text-red-400 flex gap-2 items-start">
            <AlertCircle class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div class="text-sm">{{ submitError }}</div>
        </div>

        <div v-if="!loadingOptions"
            class="space-y-8 rounded-xl border border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-6">

            <div>
                <label class="block text-sm mb-1 text-platinum-700 dark:text-platinum-300">
                    Document owner (your organization) <span class="text-red-500">*</span>
                </label>
                <select v-model.number="form.organization_id"
                    class="w-full rounded-lg border border-platinum-300 dark:border-abyss-600 px-3 py-2 text-sm bg-white dark:bg-abyss-700 dark:text-platinum-100">
                    <option :value="null" disabled>Choose an organization…</option>
                    <option v-for="org in myOrganizations" :key="org.id" :value="org.id">
                        {{ org.name }}
                    </option>
                </select>
                <p class="text-xs text-platinum-700 mt-1">
                    This document will be owned by: <strong>{{ publisherOrgName }}</strong>
                </p>
            </div>

            <div>
                <label class="block text-sm mb-1 text-platinum-700 dark:text-platinum-300">
                    Other organizations to request review from <span class="text-red-500">*</span>
                </label>
                <select multiple v-model="form.selectedTargetOrgIds"
                    class="w-full rounded-lg border border-platinum-300 dark:border-abyss-600 px-3 py-2 text-sm bg-white dark:bg-abyss-700 dark:text-platinum-100 h-36">
                    <option v-for="org in targetOrganizations" :key="org.id" :value="org.id">
                        {{ org.name }}
                    </option>
                </select>
                <p class="text-xs text-platinum-700 mt-1">Hold Ctrl/Cmd for multi-select.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm mb-1 text-platinum-700 dark:text-platinum-300">
                        Document type <span class="text-red-500">*</span>
                    </label>
                    <select v-model="form.type"
                        class="w-full rounded-lg border border-platinum-300 dark:border-abyss-600 px-3 py-2 text-sm bg-white dark:bg-abyss-700 dark:text-platinum-100">
                        <option v-for="t in DOC_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
                    </select>
                </div>

                <div class="sm:col-span-2">
                    <label class="block text-sm mb-1 text-platinum-700 dark:text-platinum-300">
                        Document title <span class="text-red-500">*</span>
                    </label>
                    <input v-model.trim="form.title" type="text"
                        class="w-full rounded-lg border border-platinum-300 dark:border-abyss-600 px-3 py-2 text-sm bg-white dark:bg-abyss-700 dark:text-platinum-100"
                        placeholder="e.g., Budget Utilization Q3 2025" />
                </div>
            </div>

            <div>
                <label class="block text-sm mb-1 text-platinum-700 dark:text-platinum-300">
                    Document file <span class="text-red-500">*</span>
                </label>
                <input type="file" accept=".pdf,.doc,.docx,.xlsx,.ppt,.pptx" class="block w-full text-sm file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0
                      file:bg-platinum-100 file:text-platinum-700 hover:file:bg-platinum-200
                      dark:file:bg-abyss-700 dark:file:text-platinum-200 dark:hover:file:bg-abyss-600"
                    @change="onFileChange" />
                <p v-if="form.file" class="mt-1 text-xs text-platinum-700">
                    Selected: <strong>{{ form.file.name }}</strong>
                    ({{ (form.file.size / 1024 / 1024).toFixed(2) }} MB)
                </p>
            </div>

            <div>
                <label class="block text-sm mb-1 text-platinum-700 dark:text-platinum-300">
                    Author note for v1 (optional)
                </label>
                <textarea v-model="form.version_note" rows="3" class="w-full border border-platinum-300 dark:border-abyss-600 rounded-lg px-3 py-2 text-sm
                         focus:ring-2 focus:ring-kaitoke-green-500 bg-white dark:bg-abyss-700 dark:text-platinum-100"
                    placeholder="Summarize what this document contains" />
            </div>

            <div class="border-t border-platinum-200 dark:border-abyss-700 pt-6">
                <h3 class="text-lg font-medium mb-4">Review Request Details</h3>

                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label class="block text-sm mb-1 text-platinum-700 dark:text-platinum-300">
                            Review subject <span class="text-red-500">*</span>
                        </label>
                        <input v-model.trim="form.subject" type="text"
                            class="w-full rounded-lg border border-platinum-300 dark:border-abyss-600 px-3 py-2 text-sm bg-white dark:bg-abyss-700 dark:text-platinum-100"
                            placeholder="e.g., Please review Q3 finance report" />
                    </div>

                    <div>
                        <label class="block text-sm mb-1 text-platinum-700 dark:text-platinum-300">
                            Message to reviewers (optional)
                        </label>
                        <textarea v-model="form.body" rows="3"
                            class="w-full border border-platinum-300 dark:border-abyss-600 rounded-lg px-3 py-2 text-sm
                             focus:ring-2 focus:ring-kaitoke-green-500 bg-white dark:bg-abyss-700 dark:text-platinum-100"
                            placeholder="Context, questions, or specific sections to review" />
                    </div>

                    <div>
                        <label class="block text-sm mb-1 text-platinum-700 dark:text-platinum-300">
                            Global due date (optional)
                        </label>
                        <input v-model="form.due_at" type="datetime-local"
                            class="w-full rounded-lg border border-platinum-300 dark:border-abyss-600 px-3 py-2 text-sm bg-white dark:bg-abyss-700 dark:text-platinum-100" />
                        <p class="text-xs text-platinum-700 mt-1">Per-reviewer due dates can override this.</p>
                    </div>
                </div>
            </div>

            <div class="border-t border-platinum-200 dark:border-abyss-700 pt-6">
                <label class="block text-sm mb-3 text-platinum-700 dark:text-platinum-300">
                    Select reviewers from the chosen other organization(s) <span class="text-red-500">*</span>
                </label>

                <div v-if="form.selectedTargetOrgIds.length === 0"
                    class="rounded-lg border border-yellow-300/50 bg-yellow-50 p-3 text-yellow-800 text-sm">
                    Pick at least one other organization to list reviewers.
                </div>

                <div v-else-if="reviewers.length === 0"
                    class="rounded-lg border border-yellow-300/50 bg-yellow-50 p-3 text-yellow-800 text-sm">
                    No reviewers found in the selected organizations.
                </div>

                <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div v-for="r in reviewers" :key="`${r.org_id}-${r.id}`"
                        class="rounded-lg border border-platinum-200 dark:border-abyss-700 p-3 hover:bg-platinum-50 dark:hover:bg-abyss-700/50 transition-colors">
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox"
                                class="h-4 w-4 rounded border-platinum-300 text-kaitoke-green-600 focus:ring-kaitoke-green-500"
                                :checked="isChecked(r.id)" @change="toggleReviewer(r.id)" />
                            <div class="flex-1">
                                <span class="text-sm font-medium">{{ r.name }}</span>
                                <span v-if="r.email" class="text-xs text-platinum-700 block">{{ r.email }}</span>
                                <span class="text-xs text-platinum-700">Org: {{ r.org_name }}</span>
                                <span v-if="r.role" class="text-xs text-platinum-700"> • {{ r.role }}</span>
                            </div>
                        </label>

                        <div v-if="isChecked(r.id)" class="mt-2 pl-7">
                            <label class="block text-xs text-platinum-700 mb-1">
                                Due date for {{ r.name }} (optional)
                            </label>
                            <input v-model="form.perDue[r.id]" type="datetime-local"
                                class="w-full rounded-lg border border-platinum-300 dark:border-abyss-600 px-2 py-1.5 text-sm bg-white dark:bg-abyss-700 dark:text-platinum-100" />
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-4 border-t border-platinum-200 dark:border-abyss-700">
                <router-link :to="{ name: 'org.doc-submission' }" class="px-4 py-2 text-sm rounded-lg border border-platinum-300 dark:border-abyss-600
                            hover:bg-platinum-100 dark:hover:bg-abyss-700 text-center">
                    Cancel
                </router-link>

                <button :disabled="!canSubmit || isSubmitting" @click="submit('draft')" class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg border
                       border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800
                       hover:bg-platinum-50 dark:hover:bg-abyss-700
                       disabled:opacity-50 disabled:cursor-not-allowed">
                    <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                    <Save v-else class="w-4 h-4" />
                    Save as draft
                </button>

                <button :disabled="!canSubmit || isSubmitting" @click="submit('sent')" class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg text-white
                       bg-kaitoke-green-600 hover:bg-kaitoke-green-700
                       disabled:opacity-50 disabled:cursor-not-allowed">
                    <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                    <Send v-else class="w-4 h-4" />
                    Submit for review
                </button>
            </div>
        </div>
    </div>
</template>