<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/utils/useToast'
import { Send, AlertCircle, Loader2, Upload, FileText, Building2, User, Calendar, MessageSquare, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()

/* ===== Document Types ===== */
const DOC_TYPES = [
    { value: 'finance_report', label: 'Finance Report', icon: '📊' },
    { value: 'event_proposal', label: 'Event Proposal', icon: '📅' },
    { value: 'other', label: 'Other', icon: '📄' },
]

/* ===== State ===== */
const currentOrganization = ref(null)
const targetOrganizations = ref([])
const reviewers = ref([])
const loading = ref(false)
const submitting = ref(false)
const error = ref('')

const form = ref({
    // Document
    title: '',
    type: 'other',
    file: null,
    note: '',

    // Review details
    subject: '',
    body: '',
    due_at: '',

    // Single reviewer
    reviewer_user_id: null,
    reviewer_org_id: null,
})

/* ===== Computed ===== */
const canSubmit = computed(() => {
    return form.value.file &&
        form.value.title &&
        form.value.subject &&
        form.value.type &&
        form.value.reviewer_user_id &&
        form.value.reviewer_org_id
})

const selectedTargetOrg = computed(() =>
    targetOrganizations.value.find(o => o.id === form.value.reviewer_org_id)
)

const selectedReviewer = computed(() =>
    reviewers.value.find(r => r.id === form.value.reviewer_user_id)
)

/* ===== Load Data ===== */
async function loadCurrentOrganization() {
    const orgId = route.params.id
    try {
        const { data } = await axios.get(`/api/organizations/${orgId}`)
        currentOrganization.value = data
    } catch (e) {
        console.error('Failed to load current org:', e)
        toast.error('Failed to load organization')
    }
}

async function loadTargetOrganizations() {
    try {
        const { data } = await axios.get('/api/organizations', { params: { scope: 'others' } })
        targetOrganizations.value = data
    } catch (e) {
        console.error('Failed to load target orgs:', e)
    }
}

async function loadReviewersForOrg(orgId) {
    if (!orgId) {
        reviewers.value = []
        return
    }

    try {
        const { data } = await axios.get(`/api/organizations/${orgId}/members`)
        const currentUserId = auth.user.id

        reviewers.value = (Array.isArray(data) ? data : [])
            .filter(m => Number(m.id) !== Number(currentUserId))
            .map(m => ({
                id: m.user_id ?? m.id,
                name: m.name || 'Unknown',
                email: m.email || null,
                avatar: m.avatar || m.avatar_url || null,
                role: m.role || null,
            }))
    } catch (e) {
        console.error('Failed to load reviewers:', e)
        reviewers.value = []
    }
}

/* ===== Handlers ===== */
function onFileChange(e) {
    const file = e.target.files?.[0]
    form.value.file = file || null

    if (file && !form.value.title) {
        const filename = file.name
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename
        form.value.title = nameWithoutExt.replace(/[_-]/g, ' ')
    }
}

async function onTargetOrgChange() {
    form.value.reviewer_user_id = null
    reviewers.value = []

    if (form.value.reviewer_org_id) {
        await loadReviewersForOrg(form.value.reviewer_org_id)
    }
}

async function submit() {
    if (!canSubmit.value) {
        error.value = 'Please complete all required fields'
        return
    }

    submitting.value = true
    error.value = ''

    try {
        const orgId = route.params.id

        // Step 1: Create document (FIXED: using org-scoped endpoint)
        const docFormData = new FormData()
        docFormData.append('organization_id', String(orgId))
        docFormData.append('title', form.value.title)
        docFormData.append('type', form.value.type)
        docFormData.append('file', form.value.file)
        if (form.value.note) docFormData.append('note', form.value.note)

        const { data: document } = await axios.post(`/api/org/${orgId}/documents`, docFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        // Step 2: Create review request
        const reviewPayload = {
            document_id: document.id,
            document_version_id: document.latest_version_id,
            subject: form.value.subject,
            body: form.value.body || null,
            due_at: form.value.due_at || null,
            recipients: [
                {
                    user_id: form.value.reviewer_user_id,
                    org_id: form.value.reviewer_org_id,
                    due_at: form.value.due_at || null,
                }
            ]
        }

        const { data: review } = await axios.post(
            `/api/org/${orgId}/reviews`,
            reviewPayload
        )

        toast.success('Document submitted for review successfully!')

        // Navigate to reviews list
        router.push({
            name: 'org.my-submissions',
            params: { id: orgId },
            query: { filter: 'as_publisher' }
        })
    } catch (err) {
        console.error('Submit error:', err)
        const msg = err?.response?.data?.message || err?.message || 'Failed to submit document for review.'
        error.value = msg
        toast.error(msg)
    } finally {
        submitting.value = false
    }
}

function goBack() {
    router.back()
}

/* ===== Lifecycle ===== */
onMounted(async () => {
    loading.value = true
    try {
        await Promise.all([
            loadCurrentOrganization(),
            loadTargetOrganizations()
        ])
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="min-h-screen bg-platinum-50 dark:bg-abyss-900">
        <div class="max-w-4xl mx-auto p-6">
            <!-- Header -->
            <div class="mb-6">
                <button @click="goBack"
                    class="inline-flex items-center gap-2 text-sm text-platinum-700 hover:text-abyss-900 dark:text-platinum-400 dark:hover:text-platinum-200 mb-4 transition-colors">
                    <ArrowLeft :size="16" />
                    Back
                </button>
                <h1 class="text-3xl font-bold text-abyss-900 dark:text-platinum-50 mb-2">Submit Document for Review</h1>
                <p class="text-platinum-600 dark:text-platinum-400">
                    Upload a document and request review from one person in another organization
                </p>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-12">
                <Loader2 class="w-8 h-8 animate-spin text-kaitoke-green-600" />
                <span class="ml-3 text-platinum-700 dark:text-platinum-400">Loading...</span>
            </div>

            <!-- Error Alert -->
            <div v-if="error"
                class="mb-6 rounded-xl border border-red-300/50 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4">
                <div class="flex gap-3">
                    <AlertCircle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div class="text-sm text-red-700 dark:text-red-400">{{ error }}</div>
                </div>
            </div>

            <!-- Form -->
            <div v-if="!loading" class="space-y-6">
                <!-- Current Organization Info -->
                <div v-if="currentOrganization"
                    class="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-4">
                    <div class="flex items-center gap-3">
                        <Building2 :size="20" class="text-blue-600" />
                        <div>
                            <p class="text-sm font-medium text-blue-900 dark:text-blue-300">Submitting from</p>
                            <p class="text-base font-semibold text-blue-900 dark:text-blue-200">
                                {{ currentOrganization.name }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Document Information -->
                <div class="rounded-xl border border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-6">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 rounded-lg">
                            <FileText class="w-5 h-5 text-kaitoke-green-600" />
                        </div>
                        <h2 class="text-xl font-semibold text-abyss-900 dark:text-platinum-50">Document Information</h2>
                    </div>

                    <div class="space-y-5">
                        <!-- Document Type -->
                        <div>
                            <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                                Document Type
                                <span class="text-red-500">*</span>
                            </label>
                            <div class="grid grid-cols-3 gap-3">
                                <button v-for="dtype in DOC_TYPES" :key="dtype.value" type="button"
                                    @click="form.type = dtype.value"
                                    class="p-4 rounded-lg border-2 transition-all text-center"
                                    :class="form.type === dtype.value
                                        ? 'border-kaitoke-green-500 bg-kaitoke-green-50 dark:bg-kaitoke-green-900/20'
                                        : 'border-platinum-300 dark:border-abyss-600 hover:border-kaitoke-green-300 dark:hover:border-kaitoke-green-700'">
                                    <div class="text-2xl mb-2">{{ dtype.icon }}</div>
                                    <div class="text-sm font-medium text-abyss-900 dark:text-platinum-100">
                                        {{ dtype.label }}
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Document Title -->
                        <div>
                            <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                                Document Title
                                <span class="text-red-500">*</span>
                            </label>
                            <input v-model.trim="form.title" type="text"
                                class="w-full px-4 py-3 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100 focus:ring-2 focus:ring-kaitoke-green-500 transition"
                                placeholder="e.g., Q4 2024 Financial Report" />
                        </div>

                        <!-- File Upload -->
                        <div>
                            <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                                <Upload :size="16" class="inline mr-1" />
                                Upload Document
                                <span class="text-red-500">*</span>
                            </label>
                            <div
                                class="border-2 border-dashed border-platinum-300 dark:border-abyss-600 rounded-lg p-6 text-center hover:border-kaitoke-green-400 dark:hover:border-kaitoke-green-600 transition">
                                <input type="file" id="file-upload" @change="onFileChange"
                                    accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx" class="hidden" />
                                <label for="file-upload" class="cursor-pointer">
                                    <Upload class="w-8 h-8 mx-auto text-platinum-500 mb-2" />
                                    <p class="text-sm font-medium text-abyss-900 dark:text-platinum-100 mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p class="text-xs text-platinum-600 dark:text-platinum-400">
                                        PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (Max 50MB)
                                    </p>
                                </label>
                            </div>
                            <div v-if="form.file"
                                class="mt-3 p-3 bg-kaitoke-green-50 dark:bg-kaitoke-green-900/20 rounded-lg border border-kaitoke-green-200 dark:border-kaitoke-green-900/50">
                                <p class="text-sm font-medium text-kaitoke-green-900 dark:text-kaitoke-green-300">
                                    {{ form.file.name }}
                                </p>
                                <p class="text-xs text-kaitoke-green-700 dark:text-kaitoke-green-400 mt-1">
                                    {{ (form.file.size / 1024 / 1024).toFixed(2) }} MB
                                </p>
                            </div>
                        </div>

                        <!-- Version Note -->
                        <div>
                            <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                                Version Note (Optional)
                            </label>
                            <textarea v-model="form.note" rows="3"
                                class="w-full px-4 py-3 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100 focus:ring-2 focus:ring-kaitoke-green-500 resize-none transition"
                                placeholder="Add any notes about this version..."></textarea>
                        </div>
                    </div>
                </div>

                <!-- Review Request Details -->
                <div class="rounded-xl border border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-6">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <MessageSquare class="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 class="text-xl font-semibold text-abyss-900 dark:text-platinum-50">Review Request</h2>
                    </div>

                    <div class="space-y-5">
                        <!-- Subject -->
                        <div>
                            <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                                Subject
                                <span class="text-red-500">*</span>
                            </label>
                            <input v-model.trim="form.subject" type="text"
                                class="w-full px-4 py-3 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100 focus:ring-2 focus:ring-kaitoke-green-500 transition"
                                placeholder="e.g., Please review Q4 financial report" />
                        </div>

                        <!-- Message -->
                        <div>
                            <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                                Message to Reviewer (Optional)
                            </label>
                            <textarea v-model="form.body" rows="4"
                                class="w-full px-4 py-3 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100 focus:ring-2 focus:ring-kaitoke-green-500 resize-none transition"
                                placeholder="Add context, questions, or specific sections to review..."></textarea>
                        </div>

                        <!-- Due Date -->
                        <div>
                            <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                                <Calendar :size="16" class="inline mr-1" />
                                Due Date (Optional)
                            </label>
                            <input v-model="form.due_at" type="datetime-local"
                                class="w-full px-4 py-3 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100 focus:ring-2 focus:ring-kaitoke-green-500 transition" />
                        </div>
                    </div>
                </div>

                <!-- Reviewer Selection -->
                <div class="rounded-xl border border-platinum-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-6">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <User class="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 class="text-xl font-semibold text-abyss-900 dark:text-platinum-50">Select Reviewer</h2>
                    </div>

                    <div class="space-y-5">
                        <!-- Target Organization -->
                        <div>
                            <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                                <Building2 :size="16" class="inline mr-1" />
                                Organization
                                <span class="text-red-500">*</span>
                            </label>
                            <select v-model.number="form.reviewer_org_id" @change="onTargetOrgChange"
                                class="w-full px-4 py-3 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100 focus:ring-2 focus:ring-kaitoke-green-500 transition">
                                <option :value="null" disabled>Select organization...</option>
                                <option v-for="org in targetOrganizations" :key="org.id" :value="org.id">
                                    {{ org.name }}
                                </option>
                            </select>
                            <p class="text-xs text-platinum-600 dark:text-platinum-400 mt-1.5">
                                Choose the organization of the reviewer
                            </p>
                        </div>

                        <!-- Reviewer -->
                        <div>
                            <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-300 mb-2">
                                <User :size="16" class="inline mr-1" />
                                Reviewer
                                <span class="text-red-500">*</span>
                            </label>
                            <div v-if="!form.reviewer_org_id"
                                class="p-4 bg-platinum-50 dark:bg-abyss-700 rounded-lg border border-platinum-200 dark:border-abyss-600 text-center">
                                <p class="text-sm text-platinum-600 dark:text-platinum-400">
                                    Please select an organization first
                                </p>
                            </div>
                            <div v-else-if="reviewers.length === 0"
                                class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-900/50 text-center">
                                <p class="text-sm text-amber-700 dark:text-amber-400">
                                    No members found in this organization
                                </p>
                            </div>
                            <div v-else class="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                                <button v-for="reviewer in reviewers" :key="reviewer.id" type="button"
                                    @click="form.reviewer_user_id = reviewer.id"
                                    class="p-4 rounded-lg border-2 text-left transition-all"
                                    :class="form.reviewer_user_id === reviewer.id
                                        ? 'border-kaitoke-green-500 bg-kaitoke-green-50 dark:bg-kaitoke-green-900/20'
                                        : 'border-platinum-300 dark:border-abyss-600 hover:border-kaitoke-green-300 dark:hover:border-kaitoke-green-700'">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 rounded-full bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 flex items-center justify-center text-sm font-semibold text-kaitoke-green-600">
                                            {{ reviewer.name.charAt(0).toUpperCase() }}
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-medium text-abyss-900 dark:text-platinum-100">
                                                {{ reviewer.name }}
                                            </p>
                                            <p class="text-xs text-platinum-600 dark:text-platinum-400">
                                                {{ reviewer.email }}
                                            </p>
                                            <p v-if="reviewer.role" class="text-xs text-platinum-500 mt-0.5">
                                                {{ reviewer.role }}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Summary -->
                <div v-if="canSubmit"
                    class="rounded-xl border border-kaitoke-green-200 dark:border-kaitoke-green-900/50 bg-kaitoke-green-50 dark:bg-kaitoke-green-900/20 p-6">
                    <h3 class="text-sm font-semibold text-kaitoke-green-900 dark:text-kaitoke-green-300 mb-3">
                        Review Summary
                    </h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex items-start gap-2">
                            <Building2 :size="16" class="text-kaitoke-green-600 mt-0.5 shrink-0" />
                            <div>
                                <span class="text-kaitoke-green-700 dark:text-kaitoke-green-400">From:</span>
                                <span class="font-medium text-kaitoke-green-900 dark:text-kaitoke-green-300 ml-1">
                                    {{ currentOrganization?.name }}
                                </span>
                            </div>
                        </div>
                        <div class="flex items-start gap-2">
                            <Building2 :size="16" class="text-kaitoke-green-600 mt-0.5 shrink-0" />
                            <div>
                                <span class="text-kaitoke-green-700 dark:text-kaitoke-green-400">To:</span>
                                <span class="font-medium text-kaitoke-green-900 dark:text-kaitoke-green-300 ml-1">
                                    {{ selectedTargetOrg?.name }}
                                </span>
                            </div>
                        </div>
                        <div class="flex items-start gap-2">
                            <User :size="16" class="text-kaitoke-green-600 mt-0.5 shrink-0" />
                            <div>
                                <span class="text-kaitoke-green-700 dark:text-kaitoke-green-400">Reviewer:</span>
                                <span class="font-medium text-kaitoke-green-900 dark:text-kaitoke-green-300 ml-1">
                                    {{ selectedReviewer?.name }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-3">
                    <button @click="goBack" type="button"
                        class="flex-1 px-6 py-3 rounded-lg border border-platinum-300 dark:border-abyss-600 text-abyss-900 dark:text-platinum-200 hover:bg-platinum-100 dark:hover:bg-abyss-700 font-medium transition">
                        Cancel
                    </button>
                    <button :disabled="!canSubmit || submitting" @click="submit"
                        class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition">
                        <Loader2 v-if="submitting" class="w-5 h-5 animate-spin" />
                        <Send v-else class="w-5 h-5" />
                        {{ submitting ? 'Submitting...' : 'Submit for Review' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>