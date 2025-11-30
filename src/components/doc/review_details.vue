<script setup>
import { ref, computed } from 'vue'
import axios from '@/utils/api'
import {
    FileText, Calendar, Building2, Download, History,
    Upload, ChevronDown, ChevronUp, Loader2, CheckCircle,
    AlertCircle, Clock
} from 'lucide-vue-next'
import { useToast } from '@/utils/useToast'
import { useDocumentDownload } from '@/utils/useDocumentDownload'
const props = defineProps({
    review: { type: Object, required: true },
    orgId: { type: [String, Number], required: true } // Pass orgId from parent
})

const emit = defineEmits(['update-review'])
const toast = useToast()
/* ===========================
   State
=========================== */
const showVersionHistory = ref(false)
const versions = ref([])
const versionsLoading = ref(false)

const showUpload = ref(false)
const uploadFile = ref(null)
const uploadNote = ref('')
const uploadBusy = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Initialize composable
const { downloadVersion: downloadService, error: downloadError } = useDocumentDownload()

/* ===========================
   Computed
=========================== */
// Helper to format dates safely
const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

const currentVersionNumber = computed(() => {
    return props.review.version?.version_number || props.review.document_version?.version_number || 1
})

const documentId = computed(() => props.review.document?.id || props.review.document_id)

/* ===========================
   Methods
=========================== */

// Fetch version history
const fetchVersions = async () => {
    if (!documentId.value) return
    versionsLoading.value = true
    try {
        // Uses existing DocumentController::show which loads versions
        const { data } = await axios.get(`/api/documents/${documentId.value}`)
        versions.value = data.versions || []
    } catch (error) {
        console.error('Failed to load versions', error)
    } finally {
        versionsLoading.value = false
    }
}

// Handle file selection
const onFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) uploadFile.value = file
}

// Upload new version
const uploadNewVersion = async () => {
    if (!uploadFile.value) return

    uploadBusy.value = true
    errorMsg.value = ''
    successMsg.value = ''

    const formData = new FormData()
    formData.append('file', uploadFile.value)
    if (uploadNote.value) formData.append('note', uploadNote.value)

    try {
        // Calls ReviewRequestController::attachNewVersion
        // This triggers the 'version_uploaded' activity log automatically
        const { data } = await axios.post(
            `/api/org/${props.orgId}/reviews/${props.review.id}/versions`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )

        successMsg.value = 'New version uploaded successfully!'
        uploadFile.value = null
        uploadNote.value = ''
        showUpload.value = false

        // Refresh versions and emit update to parent
        await fetchVersions()
        emit('update-review', {
            version: data.version,
            document_version_id: data.version_id
        })

    } catch (err) {
        console.error(err)
        errorMsg.value = err.response?.data?.message || 'Failed to upload version'
    } finally {
        uploadBusy.value = false
    }
}

// Download logic (Secure URL generation)
// FIXME : Download specific history
const downloadVersion = async (verId, filename) => {
    await downloadService(documentId.value, verId, null) 
    
    if (downloadError.value) {
        toast.error(downloadError.value) 
    }
}

const toggleHistory = () => {
    showVersionHistory.value = !showVersionHistory.value
    if (showVersionHistory.value && versions.value.length === 0) {
        fetchVersions()
    }
}
</script>

<template>
    <div class="bg-white dark:bg-abyss-800 p-6 rounded-xl shadow-sm border border-platinum-200 dark:border-abyss-700">

        <div class="flex justify-between items-start mb-6 border-b border-platinum-200 dark:border-abyss-700 pb-4">
            <div>
                <h2 class="text-2xl font-bold text-abyss-900 dark:text-platinum-50 mb-1">
                    {{ review.subject }}
                </h2>
                <div class="flex items-center gap-3 text-sm text-abyss-500 dark:text-platinum-400">
                    <span class="flex items-center">
                        <FileText class="w-4 h-4 mr-1" /> {{ review.document?.title || 'Untitled Document' }}
                    </span>
                    <span class="bg-platinum-100 dark:bg-abyss-700 px-2 py-0.5 rounded text-xs font-mono">
                        v{{ currentVersionNumber }}
                    </span>
                </div>
            </div>

            <div class="text-right">
                <span :class="{
                    'bg-yellow-100 text-yellow-800': review.status === 'sent',
                    'bg-green-100 text-green-800': review.status === 'approved',
                    'bg-gray-100 text-gray-800': review.status === 'draft',
                    'bg-red-100 text-red-800': review.status === 'closed'
                }" class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {{ review.status }}
                </span>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="flex items-center text-sm text-abyss-700 dark:text-platinum-300">
                <Calendar class="w-4 h-4 mr-2 text-kaitoke-green-600" />
                <span class="font-semibold mr-2">Due Date:</span>
                {{ formatDate(review.due_at) }}
            </div>
            <div class="flex items-center text-sm text-abyss-700 dark:text-platinum-300">
                <Building2 class="w-4 h-4 mr-2 text-kaitoke-green-600" />
                <span class="font-semibold mr-2">Publisher:</span>
                {{ review.publisher?.name || 'N/A' }}
            </div>

            <div
                class="md:col-span-2 bg-platinum-50 dark:bg-abyss-900/50 p-4 rounded-lg border border-platinum-200 dark:border-abyss-700 mt-2">
                <p class="text-xs font-bold text-abyss-500 dark:text-platinum-500 uppercase mb-1">Description</p>
                <p class="text-sm text-abyss-800 dark:text-platinum-200 whitespace-pre-wrap">
                    {{ review.body || 'No description provided.' }}
                </p>
            </div>
        </div>

        <div class="space-y-4">
            <div v-if="successMsg" class="p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center">
                <CheckCircle class="w-4 h-4 mr-2" /> {{ successMsg }}
            </div>
            <div v-if="errorMsg" class="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
                <AlertCircle class="w-4 h-4 mr-2" /> {{ errorMsg }}
            </div>

            <div class="flex flex-wrap gap-3">
                <button @click="downloadVersion(review.version?.id, review.document?.title)"
                    class="flex-1 inline-flex justify-center items-center px-4 py-2 bg-white dark:bg-abyss-800 border border-kaitoke-green-600 text-kaitoke-green-600 rounded-lg hover:bg-kaitoke-green-50 dark:hover:bg-abyss-700 transition text-sm font-medium">
                    <Download class="w-4 h-4 mr-2" /> Download v{{ currentVersionNumber }}
                </button>

                <button @click="showUpload = !showUpload"
                    class="flex-1 inline-flex justify-center items-center px-4 py-2 bg-kaitoke-green-600 text-white rounded-lg hover:bg-kaitoke-green-700 transition text-sm font-medium">
                    <Upload class="w-4 h-4 mr-2" /> Upload New Version
                </button>
            </div>

            <div v-if="showUpload"
                class="p-4 bg-platinum-100 dark:bg-abyss-900 rounded-lg border border-platinum-300 dark:border-abyss-600 animate-in fade-in slide-in-from-top-2">
                <div class="space-y-3">
                    <input type="file" @change="onFileSelect" class="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-kaitoke-green-50 file:text-kaitoke-green-700
                        hover:file:bg-kaitoke-green-100 cursor-pointer" />

                    <textarea v-model="uploadNote" placeholder="Notes about this version (optional)..."
                        class="w-full p-2 text-sm rounded border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 focus:ring-2 focus:ring-kaitoke-green-500"></textarea>

                    <div class="flex justify-end gap-2">
                        <button @click="showUpload = false"
                            class="px-3 py-1.5 text-sm text-abyss-600 hover:bg-platinum-200 rounded">Cancel</button>
                        <button @click="uploadNewVersion" :disabled="!uploadFile || uploadBusy"
                            class="px-4 py-1.5 text-sm bg-kaitoke-green-600 text-white rounded hover:bg-kaitoke-green-700 disabled:opacity-50 flex items-center">
                            <Loader2 v-if="uploadBusy" class="w-3 h-3 mr-2 animate-spin" /> {{ uploadBusy ?
                            'Uploading...' : 'Submit Version' }}
                        </button>
                    </div>
                </div>
            </div>

            <div class="border-t border-platinum-200 dark:border-abyss-700 pt-2">
                <button @click="toggleHistory"
                    class="w-full flex justify-between items-center py-2 text-sm font-medium text-abyss-600 dark:text-platinum-400 hover:text-kaitoke-green-600">
                    <span class="flex items-center">
                        <History class="w-4 h-4 mr-2" /> Version History
                    </span>
                    <component :is="showVersionHistory ? ChevronUp : ChevronDown" class="w-4 h-4" />
                </button>

                <div v-if="showVersionHistory" class="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1">
                    <div v-if="versionsLoading" class="text-center py-2">
                        <Loader2 class="w-4 h-4 animate-spin mx-auto text-kaitoke-green-600" />
                    </div>
                    <div v-else-if="versions.length === 0" class="text-sm text-center text-gray-500">No history found.
                    </div>

                    <div v-else v-for="ver in versions" :key="ver.id"
                        class="flex items-center justify-between p-2 rounded-lg bg-platinum-50 dark:bg-abyss-900 border border-platinum-100 dark:border-abyss-700 text-sm">
                        <div>
                            <span class="font-bold text-abyss-800 dark:text-platinum-100">v{{ ver.version_number
                                }}</span>
                            <span class="text-xs text-abyss-500 ml-2">{{ formatDate(ver.created_at) }}</span>
                            <p v-if="ver.note" class="text-xs text-gray-500 italic mt-0.5">{{ ver.note }}</p>
                        </div>
                        <button @click="downloadVersion(ver.id, `v${ver.version_number}_doc`)"
                            class="p-1.5 text-kaitoke-green-600 hover:bg-kaitoke-green-50 rounded transition"
                            title="Download this version">
                            <Download class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>