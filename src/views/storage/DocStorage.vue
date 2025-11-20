<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/api'
import ShareDocumentModal from '@/components/doc/doc_share_modal.vue'
import {
    Folder, File, FolderPlus, Upload, Search, Grid, List,
    MoreVertical, Download, Trash2, Copy, Move, Eye, EyeOff,
    Globe, Lock, Users, ChevronRight, Home, ArrowLeft,
    RefreshCw, Filter, SortAsc, X, Plus, Loader2, Check, Edit2, Share2
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

/* ===========================
    State
=========================== */
const orgId = computed(() => Number(route.params.id || route.query.orgId))
const currentFolderId = ref(null)
const viewMode = ref('grid') // 'grid' or 'list'
const documents = ref([])
const breadcrumbs = ref([])
const loading = ref(false)
const error = ref('')
const successMsg = ref('')

const searchQuery = ref('')
const filterType = ref('all') // 'all', 'folders', 'files'
const sortBy = ref('name') // 'name', 'date', 'size'

const selectedItems = ref(new Set())
const showUploadModal = ref(false)
const showCreateFolderModal = ref(false)
const showContextMenu = ref(false)
const contextMenuPos = ref({ x: 0, y: 0 })
const contextMenuItem = ref(null)

const uploadFile = ref(null)
const uploadProgress = ref(0)
const uploading = ref(false)

const newFolderName = ref('')
const newFolderDescription = ref('')
const creatingFolder = ref(false)

// const showShareModal = ref(false)
// const shareDocument = ref(null)
const showShareModal = ref(false)
const selectedDocument = ref(null)

const stats = ref({
    total_files: 0,
    total_folders: 0,
    total_size_formatted: '0 B'
})

/* ===========================
    Computed
=========================== */
const filteredDocuments = computed(() => {
    let items = documents.value

    // Filter by type
    if (filterType.value === 'folders') {
        items = items.filter(d => d.is_folder)
    } else if (filterType.value === 'files') {
        items = items.filter(d => !d.is_folder)
    }

    // Search
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        items = items.filter(d =>
            d.title.toLowerCase().includes(q) ||
            (d.description && d.description.toLowerCase().includes(q))
        )
    }

    // Sort
    items = [...items].sort((a, b) => {
        // Always put folders first
        if (a.is_folder && !b.is_folder) return -1
        if (!a.is_folder && b.is_folder) return 1

        switch (sortBy.value) {
            case 'date':
                return new Date(b.created_at) - new Date(a.created_at)
            case 'size':
                return (b.file_size || 0) - (a.file_size || 0)
            case 'name':
            default:
                return a.title.localeCompare(b.title)
        }
    })

    return items
})

const hasSelection = computed(() => selectedItems.value.size > 0)

/* ===========================
    API Functions
=========================== */
async function loadDocuments() {
    if (!orgId.value) return
    loading.value = true
    error.value = ''
    try {
        const params = {
            organization_id: orgId.value,
            folder_id: currentFolderId.value || undefined
        }
        // FIX: Change endpoint to include organization ID as a route parameter.
        const { data } = await axios.get(`/api/org/${orgId.value}/storage`, { params })
        documents.value = data.data || []
        breadcrumbs.value = data.breadcrumbs || []
    } catch (e) {
        error.value = e?.response?.data?.message || 'Failed to load documents'
    } finally {
        loading.value = false
    }
}

async function loadStats() {
    if (!orgId.value) return
    try {
        // FIX: Change endpoint to include organization ID as a route parameter.
        const { data } = await axios.get(`/api/org/${orgId.value}/storage/statistics`, {
            params: { organization_id: orgId.value }
        })
        stats.value = data
    } catch (e) {
        console.error('Failed to load stats:', e)
    }
}

async function createFolder() {
    if (!newFolderName.value.trim() || !orgId.value) return
    creatingFolder.value = true
    error.value = ''
    try {
        // FIX: Change endpoint to include organization ID as a route parameter.
        await axios.post(`/api/org/${orgId.value}/storage/folders`, {
            organization_id: orgId.value,
            parent_id: currentFolderId.value || null,
            title: newFolderName.value.trim(),
            description: newFolderDescription.value.trim() || null
        })
        newFolderName.value = ''
        newFolderDescription.value = ''
        showCreateFolderModal.value = false
        successMsg.value = 'Folder created successfully'
        setTimeout(() => successMsg.value = '', 3000)
        await Promise.all([loadDocuments(), loadStats()])
    } catch (e) {
        error.value = e?.response?.data?.message || 'Failed to create folder'
    } finally {
        creatingFolder.value = false
    }
}

async function uploadDocument() {
    if (!uploadFile.value || !orgId.value) return
    uploading.value = true
    error.value = ''
    uploadProgress.value = 0
    try {
        const fd = new FormData()
        fd.append('file', uploadFile.value)
        fd.append('organization_id', orgId.value)
        fd.append('parent_id', currentFolderId.value || '')
        fd.append('visibility', 'org')

        // FIX: Change endpoint to include organization ID as a route parameter.
        await axios.post(`/api/org/${orgId.value}/storage/upload`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => {
                uploadProgress.value = Math.round((e.loaded * 100) / e.total)
            }
        })

        uploadFile.value = null
        showUploadModal.value = false
        successMsg.value = 'File uploaded successfully'
        setTimeout(() => successMsg.value = '', 3000)
        await Promise.all([loadDocuments(), loadStats()])
    } catch (e) {
        error.value = e?.response?.data?.message || 'Upload failed'
    } finally {
        uploading.value = false
        uploadProgress.value = 0
    }
}

async function deleteDocument(doc) {
    if (!confirm(`Are you sure you want to delete "${doc.title}"?`)) return
    try {
        // FIX: Change endpoint to include organization ID as a route parameter.
        await axios.delete(`/api/org/${orgId.value}/storage/documents/${doc.id}`)
        successMsg.value = `"${doc.title}" deleted successfully`
        setTimeout(() => successMsg.value = '', 3000)
        await Promise.all([loadDocuments(), loadStats()])
    } catch (e) {
        error.value = e?.response?.data?.message || 'Delete failed'
    }
}

async function downloadDocument(doc) {
    if (doc.is_folder) return
    try {
        const versionId = doc.latest_version?.id || doc.latest_version_id
        // FIX: Change endpoint to include organization ID as a route parameter.
        const { data, headers } = await axios.get(
            `/api/org/${orgId.value}/storage/documents/${doc.id}/versions/${versionId}/download`,
            { responseType: 'blob' }
        )

        const contentDisposition = headers['content-disposition'] || ''
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/)
        const filename = match?.[1] ? decodeURIComponent(match[1]) : `${doc.title}.bin`

        const url = window.URL.createObjectURL(new Blob([data]))
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
    } catch (e) {
        error.value = 'Download failed'
    }
}

async function changeVisibility(doc, visibility) {
    try {
        // FIX: Change endpoint to include organization ID as a route parameter.
        await axios.patch(`/api/org/${orgId.value}/storage/documents/${doc.id}`, { visibility })
        doc.visibility = visibility
        successMsg.value = `Visibility changed to ${visibility}`
        setTimeout(() => successMsg.value = '', 3000)
    } catch (e) {
        error.value = e?.response?.data?.message || 'Failed to change visibility'
    }
}

function selectForShare(doc) {
    selectedDocument.value = doc
    showShareModal.value = true
}

function onShareUpdated(shareData) {
    // Optional: Refresh stats or show notification
    console.log('Share updated:', shareData)
}

function navigateToFolder(folderId) {
    currentFolderId.value = folderId
    selectedItems.value.clear()
    loadDocuments()
}

function goBack() {
    if (breadcrumbs.value.length > 0) {
        const parent = breadcrumbs.value[breadcrumbs.value.length - 2]
        navigateToFolder(parent?.id || null)
    } else {
        navigateToFolder(null)
    }
}

function openItem(doc) {
    if (doc.is_folder) {
        navigateToFolder(doc.id)
    } else {
        // Open file details or download
        downloadDocument(doc)
    }
}

function toggleSelection(docId) {
    if (selectedItems.value.has(docId)) {
        selectedItems.value.delete(docId)
    } else {
        selectedItems.value.add(docId)
    }
}

function clearSelection() {
    selectedItems.value.clear()
}

function openContextMenu(e, doc) {
    e.preventDefault()
    closeContextMenu() // Ensure only one is open

    // Adjust position to stay within viewport
    const menuWidth = 200; // approximation
    const menuHeight = 160; // approximation
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
        x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
        y = window.innerHeight - menuHeight - 10;
    }

    contextMenuItem.value = doc
    contextMenuPos.value = { x, y }
    showContextMenu.value = true
}

function closeContextMenu() {
    showContextMenu.value = false
    contextMenuItem.value = null
}

function getIcon(doc) {
    return doc.is_folder ? Folder : File
}

function getIconColor(doc) {
    if (doc.is_folder) return 'text-amber-500' // Changed to amber/yellow for folders
    return 'text-blue-600' // Changed to blue for files
}

function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatSize(bytes) {
    if (!bytes) return '—'
    const units = ['B', 'KB', 'MB', 'GB']
    let i = 0
    let size = bytes
    while (size > 1024 && i < units.length - 1) {
        size /= 1024
        i++
    }
    return `${size.toFixed(1)} ${units[i]}`
}

function onFileSelect(e) {
    uploadFile.value = e.target.files?.[0] || null
}

/* ===========================
    Lifecycle
=========================== */
onMounted(() => {
    if (orgId.value) {
        loadDocuments()
        loadStats()
    }
})

watch(orgId, (newId) => {
    if (newId) {
        currentFolderId.value = null
        loadDocuments()
        loadStats()
    }
})

// Close context menu on click outside
onMounted(() => {
    document.addEventListener('click', closeContextMenu)
})
</script>

<template>
    <div class="h-[calc(100vh-64px)] flex flex-col bg-gray-100 dark:bg-abyss-900">

        <div class="border-b border-gray-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 px-6 py-4 shadow-md">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-4">
                    <button v-if="currentFolderId || breadcrumbs.length" @click="goBack"
                        class="p-2 hover:bg-gray-100 dark:hover:bg-abyss-700 rounded-xl transition hover:scale-[1.05] active:scale-[0.98]">
                        <ArrowLeft class="h-5 w-5 text-gray-800 dark:text-platinum-300" />
                    </button>
                    <h1 class="text-2xl font-bold text-gray-800 dark:text-platinum-100 flex items-center gap-2">
                        <Folder class="h-6 w-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Documents Vault
                    </h1>
                </div>

                <div class="flex items-center gap-3">
                    <button @click="showCreateFolderModal = true"
                        class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-abyss-700 hover:bg-gray-200 dark:hover:bg-abyss-600 rounded-xl text-sm font-semibold transition-colors shadow-sm hover:scale-[1.02] active:scale-[0.98]">
                        <FolderPlus class="h-4 w-4 text-amber-500" />
                        New Folder
                    </button>
                    <button @click="showUploadModal = true"
                        class="inline-flex items-center gap-2 px-5 py-2.5 bg-kaitoke-green-600 hover:bg-kaitoke-green-500 rounded-xl text-white text-sm font-semibold transition-colors shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                        <Upload class="h-4 w-4" />
                        Upload File
                    </button>
                </div>
            </div>

            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-platinum-300 mb-4">
                <button @click="navigateToFolder(null)"
                    class="flex items-center gap-1 hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition">
                    <Home class="h-4 w-4" />
                    Home
                </button>
                <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
                    <ChevronRight class="h-4 w-4" />
                    <button @click="navigateToFolder(crumb.id)"
                        class="transition hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400"
                        :class="index === breadcrumbs.length - 1 ? 'font-medium text-gray-800 dark:text-platinum-100' : ''">
                        {{ crumb.title }}
                    </button>
                </template>
            </div>

            <div
                class="flex items-center gap-4 p-3 bg-gray-50 dark:bg-abyss-700 rounded-xl shadow-inner border border-gray-200 dark:border-abyss-600">
                <div class="relative flex-1 max-w-md">
                    <Search class="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-platinum-600" />
                    <input v-model="searchQuery" type="text" placeholder="Search files and folders..."
                        class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-sm shadow-inner focus:ring-2 focus:ring-kaitoke-green-500 focus:border-kaitoke-green-500 text-gray-800 dark:text-platinum-100" />
                </div>

                <select v-model="filterType"
                    class="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-sm text-gray-800 dark:text-platinum-100 shadow-inner focus:ring-1 focus:ring-kaitoke-green-500">
                    <option value="all">All Items</option>
                    <option value="folders">Folders Only</option>
                    <option value="files">Files Only</option>
                </select>

                <select v-model="sortBy"
                    class="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-sm text-gray-800 dark:text-platinum-100 shadow-inner focus:ring-1 focus:ring-kaitoke-green-500">
                    <option value="name">Name</option>
                    <option value="date">Date</option>
                    <option value="size">Size</option>
                </select>

                <div
                    class="flex items-center gap-1 border border-gray-300 dark:border-abyss-600 rounded-xl p-1 bg-white dark:bg-abyss-800 shadow-sm">
                    <button @click="viewMode = 'grid'"
                        :class="viewMode === 'grid' ? 'bg-gray-200 dark:bg-abyss-700 text-gray-800 dark:text-platinum-100' : 'text-gray-500 dark:text-platinum-400'"
                        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-abyss-700 transition">
                        <Grid class="h-4 w-4" />
                    </button>
                    <button @click="viewMode = 'list'"
                        :class="viewMode === 'list' ? 'bg-gray-200 dark:bg-abyss-700 text-gray-800 dark:text-platinum-100' : 'text-gray-500 dark:text-platinum-400'"
                        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-abyss-700 transition">
                        <List class="h-4 w-4" />
                    </button>
                </div>

                <button @click="loadDocuments"
                    class="p-2 rounded-xl text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 transition hover:scale-[1.05] active:scale-[0.98]">
                    <RefreshCw class="h-5 w-5" />
                </button>
            </div>
        </div>

        <div class="bg-gray-50 dark:bg-abyss-800 px-6 py-2 border-b border-gray-200 dark:border-abyss-700 shadow-sm">
            <div class="flex items-center gap-6 text-sm text-gray-600 dark:text-platinum-300">
                <div class="flex items-center gap-2">
                    <Folder class="h-4 w-4 text-amber-500" />
                    <span>{{ stats.total_folders }} folders</span>
                </div>
                <div class="flex items-center gap-2">
                    <File class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>{{ stats.total_files }} files</span>
                </div>
                <div class="flex items-center gap-2 font-semibold">
                    <span class="text-gray-800 dark:text-platinum-100">Total Size: {{ stats.total_size_formatted
                        }}</span>
                </div>
            </div>
        </div>

        <div v-if="successMsg" class="mx-6 mt-4">
            <div
                class="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-900/50 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400 shadow-md">
                <Check class="h-4 w-4" />
                {{ successMsg }}
            </div>
        </div>

        <div v-if="error" class="mx-6 mt-4">
            <div
                class="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-900/50 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700 dark:text-red-400 shadow-md">
                <X class="h-4 w-4" />
                {{ error }}
            </div>
        </div>

        <div class="flex-1 overflow-auto px-6 pb-6 pt-2">
            <div v-if="loading" class="flex items-center justify-center py-12">
                <Loader2 class="h-8 w-8 animate-spin text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                <p class="ml-3 text-lg font-medium text-gray-600 dark:text-platinum-400">Loading documents...</p>
            </div>

            <div v-else-if="filteredDocuments.length === 0"
                class="flex flex-col items-center justify-center py-20 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-xl">
                <Folder class="h-16 w-16 mb-4 text-gray-400 dark:text-platinum-600" />
                <p class="text-lg font-medium text-gray-700 dark:text-platinum-300">No items found</p>
                <p class="text-sm text-gray-500 dark:text-platinum-500">
                    {{ searchQuery ?
                        'Try a different search or clear your filters.' :
                        'Upload files or create folders to get started in this directory.' }}
                </p>
            </div>

            <div v-else-if="viewMode === 'grid'"
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <div v-for="doc in filteredDocuments" :key="doc.id" @click="openItem(doc)"
                    @contextmenu="openContextMenu($event, doc)"
                    class="group relative p-4 rounded-xl border border-gray-200 dark:border-abyss-700 hover:border-kaitoke-green-500 dark:hover:border-kaitoke-green-600 cursor-pointer transition-all bg-white dark:bg-abyss-800 shadow-md hover:shadow-lg hover:scale-[1.01]">

                    <div class="flex flex-col items-center text-center">
                        <component :is="getIcon(doc)" class="h-12 w-12 mb-3" :class="getIconColor(doc)" />

                        <p class="text-sm font-medium text-gray-800 dark:text-platinum-100 truncate w-full px-1"
                            :title="doc.title">
                            {{ doc.title }}
                        </p>

                        <p class="text-xs text-gray-600 dark:text-platinum-400 mt-1">
                            {{ doc.is_folder ? `${doc.children?.length || 0} items` : formatSize(doc.file_size) }}
                        </p>

                        <div v-if="!doc.is_folder" class="flex items-center gap-1 mt-2">
                            <component
                                :is="doc.visibility === 'public' ? Globe : doc.visibility === 'org' ? Users : Lock"
                                class="h-3.5 w-3.5" :class="{
                                    'text-green-600 dark:text-green-400': doc.visibility === 'public',
                                    'text-blue-600 dark:text-blue-400': doc.visibility === 'org',
                                    'text-gray-600 dark:text-platinum-600': doc.visibility === 'private'
                                }" />
                            <span class="text-xs text-gray-600 dark:text-platinum-400 capitalize">
                                {{ doc.visibility }}
                            </span>
                        </div>
                    </div>

                    <div
                        class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button @click.stop="selectForShare(doc)"
                            class="p-1 bg-white dark:bg-abyss-700 rounded-xl hover:bg-gray-100 dark:hover:bg-abyss-600 shadow-sm">
                            <Share2 class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button @click.stop="openContextMenu($event, doc)"
                            class="p-1 bg-white dark:bg-abyss-700 rounded-xl hover:bg-gray-100 dark:hover:bg-abyss-600 shadow-sm">
                            <MoreVertical class="h-4 w-4 text-gray-600 dark:text-platinum-400" />
                        </button>
                    </div>
                </div>
            </div>

            <div v-else
                class="bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 overflow-hidden shadow-xl">
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-abyss-700 border-b border-gray-200 dark:border-abyss-600">
                        <tr
                            class="text-left text-xs font-medium text-gray-700 dark:text-platinum-300 uppercase tracking-wider">
                            <th class="px-6 py-3">Name</th>
                            <th class="px-4 py-3">Visibility</th>
                            <th class="px-4 py-3">Size</th>
                            <th class="px-4 py-3">Modified</th>
                            <th class="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-abyss-700">
                        <tr v-for="doc in filteredDocuments" :key="doc.id" @click="openItem(doc)"
                            @contextmenu="openContextMenu($event, doc)"
                            class="group hover:bg-gray-50 dark:hover:bg-abyss-700 cursor-pointer transition">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <component :is="getIcon(doc)" class="h-5 w-5 shrink-0" :class="getIconColor(doc)" />
                                    <span class="text-sm font-medium text-gray-800 dark:text-platinum-100 truncate">
                                        {{ doc.title }}
                                    </span>
                                </div>
                            </td>
                            <td class="px-4 py-4">
                                <div v-if="!doc.is_folder" class="flex items-center gap-1.5">
                                    <component
                                        :is="doc.visibility === 'public' ? Globe : doc.visibility === 'org' ? Users : Lock"
                                        class="h-4 w-4" :class="{
                                            'text-green-600 dark:text-green-400': doc.visibility === 'public',
                                            'text-blue-600 dark:text-blue-400': doc.visibility === 'org',
                                            'text-gray-600 dark:text-platinum-600': doc.visibility === 'private'
                                        }" />
                                    <span class="text-xs text-gray-700 dark:text-platinum-300 capitalize">{{
                                        doc.visibility
                                        }}</span>
                                </div>
                                <span v-else class="text-xs text-gray-500 dark:text-platinum-500">—</span>
                            </td>
                            <td class="px-4 py-4">
                                <span class="text-sm text-gray-700 dark:text-platinum-300">
                                    {{ doc.is_folder ? '—' : formatSize(doc.file_size) }}
                                </span>
                            </td>
                            <td class="px-4 py-4">
                                <span class="text-sm text-gray-700 dark:text-platinum-300">
                                    {{ formatDate(doc.updated_at || doc.created_at) }}
                                </span>
                            </td>
                            <td class="px-4 py-4 text-right">
                                <div class="flex items-center justify-end gap-1.5">
                                    <button @click.stop="selectForShare(doc)"
                                        class="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition">
                                        <Share2 class="h-4 w-4" />
                                    </button>
                                    <button @click.stop="openContextMenu($event, doc)"
                                        class="p-2 rounded-xl text-gray-600 dark:text-platinum-400 hover:bg-gray-100 dark:hover:bg-abyss-600 opacity-0 group-hover:opacity-100 transition">
                                        <MoreVertical class="h-5 w-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="showContextMenu && contextMenuItem"
            :style="{ top: contextMenuPos.y + 'px', left: contextMenuPos.x + 'px' }"
            class="fixed z-50 bg-white dark:bg-abyss-800 rounded-xl shadow-2xl border border-gray-200 dark:border-abyss-700 py-1 min-w-[200px]">

            <button v-if="!contextMenuItem.is_folder" @click="downloadDocument(contextMenuItem); closeContextMenu()"
                class="w-full px-4 py-2 text-left text-sm text-gray-800 dark:text-platinum-100 hover:bg-gray-100 dark:hover:bg-abyss-700 flex items-center gap-2">
                <Download class="h-4 w-4" />
                Download
            </button>

            <button @click="selectForShare(contextMenuItem); closeContextMenu()"
                class="w-full px-4 py-2 text-left text-sm text-gray-800 dark:text-platinum-100 hover:bg-gray-100 dark:hover:bg-abyss-700 flex items-center gap-2">
                <Share2 class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Share Document
            </button>

            <button v-if="!contextMenuItem.is_folder && contextMenuItem.visibility !== 'public'"
                @click="changeVisibility(contextMenuItem, 'public'); closeContextMenu()"
                class="w-full px-4 py-2 text-left text-sm text-gray-800 dark:text-platinum-100 hover:bg-gray-100 dark:hover:bg-abyss-700 flex items-center gap-2">
                <Globe class="h-4 w-4 text-green-600 dark:text-green-400" />
                Make Public
            </button>

            <button v-if="!contextMenuItem.is_folder && contextMenuItem.visibility === 'public'"
                @click="changeVisibility(contextMenuItem, 'org'); closeContextMenu()"
                class="w-full px-4 py-2 text-left text-sm text-gray-800 dark:text-platinum-100 hover:bg-gray-100 dark:hover:bg-abyss-700 flex items-center gap-2">
                <Users class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Make Organization Only
            </button>

            <hr class="my-1 border-gray-200 dark:border-abyss-700" />

            <button @click="deleteDocument(contextMenuItem); closeContextMenu()"
                class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                <Trash2 class="h-4 w-4" />
                Delete
            </button>
        </div>

        <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            @click.self="showUploadModal = false">
            <div
                class="bg-white dark:bg-abyss-800 rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-abyss-700">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-100 flex items-center gap-2">
                        <Upload class="h-5 w-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Upload File
                    </h3>
                    <button @click="showUploadModal = false"
                        class="p-2 hover:bg-gray-100 dark:hover:bg-abyss-700 rounded-xl">
                        <X class="h-5 w-5 text-gray-600 dark:text-platinum-400" />
                    </button>
                </div>

                <input type="file" @change="onFileSelect" class="block w-full text-sm mb-4
                        file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-kaitoke-green-100 file:text-kaitoke-green-800
                        hover:file:bg-kaitoke-green-200
                        dark:file:bg-kaitoke-green-900/30 dark:file:text-kaitoke-green-300 transition" />

                <div v-if="uploadFile" class="text-sm text-gray-700 dark:text-platinum-300 mb-4">
                    Selected: <strong>{{ uploadFile.name }}</strong> ({{ formatSize(uploadFile.size) }})
                </div>

                <div v-if="uploading" class="mb-4">
                    <div class="flex items-center justify-between text-sm mb-2 text-gray-700 dark:text-platinum-300">
                        <span>Uploading...</span>
                        <span>{{ uploadProgress }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-abyss-700 rounded-full h-2 shadow-inner">
                        <div class="bg-kaitoke-green-600 h-2 rounded-full transition-all"
                            :style="{ width: uploadProgress + '%' }"></div>
                    </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button @click="showUploadModal = false" type="button"
                        class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 transition font-medium hover:scale-[1.02] active:scale-[0.98]">
                        Cancel
                    </button>
                    <button @click="uploadDocument" :disabled="!uploadFile || uploading"
                        class="flex-1 px-4 py-2.5 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 disabled:opacity-50 rounded-xl text-white font-semibold transition shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                        {{ uploading ? 'Uploading...' : 'Upload' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showCreateFolderModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            @click.self="showCreateFolderModal = false">
            <div
                class="bg-white dark:bg-abyss-800 rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-abyss-700">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-100 flex items-center gap-2">
                        <FolderPlus class="h-5 w-5 text-amber-600 dark:text-amber-400" /> Create Folder
                    </h3>
                    <button @click="showCreateFolderModal = false"
                        class="p-2 hover:bg-gray-100 dark:hover:bg-abyss-700 rounded-xl">
                        <X class="h-5 w-5 text-gray-600 dark:text-platinum-400" />
                    </button>
                </div>

                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                            Folder Name *
                        </label>
                        <input v-model="newFolderName" type="text" placeholder="Enter folder name"
                            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-100 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                            Description (Optional)
                        </label>
                        <textarea v-model="newFolderDescription" rows="3" placeholder="Enter description"
                            class="w-full px-4 py-2.5 border border-gray-300 dark:border-abyss-600 rounded-xl bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-100 shadow-inner focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600"></textarea>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button @click="showCreateFolderModal = false" type="button"
                            class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 transition font-medium hover:scale-[1.02] active:scale-[0.98]">
                            Cancel
                        </button>
                        <button @click="createFolder" :disabled="!newFolderName.trim() || creatingFolder"
                            class="flex-1 px-4 py-2.5 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 disabled:opacity-50 rounded-xl text-white font-semibold transition shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                            {{ creatingFolder ? 'Creating...' : 'Create Folder' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <ShareDocumentModal v-if="showShareModal && selectedDocument" :document="selectedDocument"
            :organization-id="orgId" @close="showShareModal = false" @updated="onShareUpdated" />
    </div>
</template>