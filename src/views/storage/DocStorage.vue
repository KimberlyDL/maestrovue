<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/api'
import { useDocumentDownload } from '@/utils/useDocumentDownload'
import { useToast } from '@/utils/useToast'

import {
    Folder, File, FolderPlus, Upload, Search, Grid, List,
    MoreVertical, Download, Trash2, Home, ArrowLeft,
    RefreshCw, X, Loader2, Check, Globe, Building2, ChevronRight,
    Info, HelpCircle, Share2, Eye
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const toast = useToast()

/* ===========================
    State
=========================== */
const orgId = computed(() => Number(route.params.id || route.query.orgId))
const currentFolderId = ref(null)
const viewMode = ref('grid')
const documents = ref([])
const breadcrumbs = ref([])
const loading = ref(false)

const searchQuery = ref('')
const filterType = ref('all')
const sortBy = ref('name')

const showUploadModal = ref(false)
const showCreateFolderModal = ref(false)
const showContextMenu = ref(false)
const showPropertiesModal = ref(false)
const showPropertiesSidebar = ref(false)
const showHelpModal = ref(false)

const contextMenuPos = ref({ x: 0, y: 0 })
const contextMenuItem = ref(null)
const selectedDocument = ref(null)

const uploadFile = ref(null)
const uploadProgress = ref(0)
const uploading = ref(false)

const newFolderName = ref('')
const newFolderDescription = ref('')
const creatingFolder = ref(false)

const {
    downloadWithProgress,
    downloading: isDownloading,
} = useDocumentDownload()

const stats = ref({
    total_files: 0,
    total_folders: 0,
    total_size_formatted: '0 B',
    public_files: 0
})

/* ===========================
    Computed
=========================== */
const filteredDocuments = computed(() => {
    let items = documents.value

    if (filterType.value === 'folders') {
        items = items.filter(d => d.is_folder)
    } else if (filterType.value === 'files') {
        items = items.filter(d => !d.is_folder)
    }

    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        items = items.filter(d =>
            d.title.toLowerCase().includes(q) ||
            (d.description && d.description.toLowerCase().includes(q))
        )
    }

    items = [...items].sort((a, b) => {
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

/* ===========================
    API Functions
=========================== */
async function loadDocuments() {
    if (!orgId.value) return
    loading.value = true
    try {
        const params = {
            organization_id: orgId.value,
            folder_id: currentFolderId.value || undefined
        }
        const { data } = await axios.get(`/api/org/${orgId.value}/storage`, { params })
        documents.value = data.data || []
        breadcrumbs.value = data.breadcrumbs || []
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to load documents')
    } finally {
        loading.value = false
    }
}

async function loadStats() {
    if (!orgId.value) return
    try {
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
    try {
        await axios.post(`/api/org/${orgId.value}/storage/folders`, {
            organization_id: orgId.value,
            parent_id: currentFolderId.value || null,
            title: newFolderName.value.trim(),
            description: newFolderDescription.value.trim() || null
        })
        newFolderName.value = ''
        newFolderDescription.value = ''
        showCreateFolderModal.value = false
        toast.success('Folder created successfully')
        await Promise.all([loadDocuments(), loadStats()])
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to create folder')
    } finally {
        creatingFolder.value = false
    }
}

async function uploadDocument() {
    if (!uploadFile.value || !orgId.value) return
    uploading.value = true
    uploadProgress.value = 0
    try {
        const fd = new FormData()
        fd.append('file', uploadFile.value)
        fd.append('organization_id', orgId.value)
        fd.append('parent_id', currentFolderId.value || '')

        await axios.post(`/api/org/${orgId.value}/storage/upload`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => {
                uploadProgress.value = Math.round((e.loaded * 100) / e.total)
            }
        })

        uploadFile.value = null
        showUploadModal.value = false
        toast.success('File uploaded successfully')
        await Promise.all([loadDocuments(), loadStats()])
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Upload failed')
    } finally {
        uploading.value = false
        uploadProgress.value = 0
    }
}

async function deleteDocument(doc) {
    if (!confirm(`Are you sure you want to delete "${doc.title}"?`)) return
    try {
        await axios.delete(`/api/org/${orgId.value}/storage/documents/${doc.id}`)
        toast.success(`"${doc.title}" deleted successfully`)
        await Promise.all([loadDocuments(), loadStats()])
        if (selectedDocument.value?.id === doc.id) {
            selectedDocument.value = null
            showPropertiesModal.value = false
            showPropertiesSidebar.value = false
        }
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Delete failed')
    }
}

async function downloadDocument(doc) {
    if (doc.is_folder) return

    const versionId = doc.latest_version?.id || doc.latest_version_id
    if (!versionId) {
        toast.error('No file version found')
        return
    }

    const result = await downloadWithProgress(doc.id, versionId, orgId.value)
    if (result.success) {
        toast.success(`Downloaded: ${result.filename}`)
    } else {
        toast.error(result.error)
    }
}

async function toggleShare(doc) {
    if (doc.is_folder) return

    try {
        const { data } = await axios.post(`/api/org/${orgId.value}/storage/documents/${doc.id}/toggle-share`)
        toast.success(data.message)

        // Update local state
        const index = documents.value.findIndex(d => d.id === doc.id)
        if (index !== -1) {
            documents.value[index].is_shared_public = data.is_shared
            documents.value[index].visibility = data.visibility
        }

        if (selectedDocument.value?.id === doc.id) {
            selectedDocument.value.is_shared_public = data.is_shared
            selectedDocument.value.visibility = data.visibility
        }

        loadStats()
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to toggle sharing')
    }
}

/* ===========================
    Navigation & UI
=========================== */

function navigateToFolder(folderId) {
    currentFolderId.value = folderId
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
        downloadDocument(doc)
    }
}

function openContextMenu(e, doc) {
    e.preventDefault()
    closeContextMenu()

    const menuWidth = 200
    const menuHeight = 200
    let x = e.clientX
    let y = e.clientY

    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10

    contextMenuItem.value = doc
    contextMenuPos.value = { x, y }
    showContextMenu.value = true
}

function closeContextMenu() {
    showContextMenu.value = false
    contextMenuItem.value = null
}

function showProperties(doc) {
    selectedDocument.value = doc
    if (window.innerWidth >= 1280) {
        showPropertiesSidebar.value = true
    } else {
        showPropertiesModal.value = true
    }
    closeContextMenu()
}

function getIcon(doc) {
    return doc.is_folder ? Folder : File
}

function getIconColor(doc) {
    if (doc.is_folder) return 'text-amber-500 dark:text-amber-400'
    return 'text-blue-600 dark:text-blue-400'
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
    document.addEventListener('click', closeContextMenu)
})

watch(orgId, (newId) => {
    if (newId) {
        currentFolderId.value = null
        loadDocuments()
        loadStats()
    }
})
</script>

<template>
    <div class="h-[calc(100vh-64px)] flex bg-platinum-50 dark:bg-abyss-900">
        <div class="flex-1 flex flex-col overflow-hidden">
            <div class="border-b border-sun-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 px-6 py-4 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-4">
                        <button v-if="currentFolderId || breadcrumbs.length" @click="goBack"
                            class="p-2 hover:bg-sun-100 dark:hover:bg-abyss-700 rounded-xl transition">
                            <ArrowLeft class="h-5 w-5 text-abyss-900 dark:text-platinum-100" />
                        </button>
                        <h1 class="text-2xl font-bold text-abyss-900 dark:text-platinum-100 flex items-center gap-2">
                            <Folder class="h-6 w-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            Documents Vault
                        </h1>
                        <button @click="showHelpModal = true"
                            class="p-1.5 text-platinum-600 dark:text-platinum-400 hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition">
                            <HelpCircle class="h-5 w-5" />
                        </button>
                    </div>

                    <div class="flex items-center gap-3">
                        <button @click="showCreateFolderModal = true"
                            class="inline-flex items-center gap-2 px-4 py-2.5 bg-sun-100 dark:bg-abyss-700 hover:bg-sun-200 dark:hover:bg-abyss-600 rounded-xl text-sm font-semibold transition shadow-sm">
                            <FolderPlus class="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            New Folder
                        </button>
                        <button @click="showUploadModal = true"
                            class="inline-flex items-center gap-2 px-5 py-2.5 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 rounded-xl text-white text-sm font-semibold transition shadow-md">
                            <Upload class="h-4 w-4" />
                            Upload File
                        </button>
                    </div>
                </div>

                <div class="flex items-center gap-2 text-sm text-platinum-600 dark:text-platinum-400 mb-4">
                    <button @click="navigateToFolder(null)"
                        class="flex items-center gap-1 hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition">
                        <Home class="h-4 w-4" />
                        Home
                    </button>
                    <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
                        <ChevronRight class="h-4 w-4" />
                        <button @click="navigateToFolder(crumb.id)"
                            class="transition hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400"
                            :class="index === breadcrumbs.length - 1 ? 'font-medium text-abyss-900 dark:text-platinum-100' : ''">
                            {{ crumb.title }}
                        </button>
                    </template>
                </div>

                <div
                    class="flex items-center gap-4 p-3 bg-sun-50 dark:bg-abyss-700 rounded-xl border border-sun-200 dark:border-abyss-600">
                    <div class="relative flex-1 max-w-md">
                        <Search class="absolute left-3 top-2.5 h-5 w-5 text-platinum-500" />
                        <input v-model="searchQuery" type="text" placeholder="Search files and folders..."
                            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sun-200 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-sm focus:ring-2 focus:ring-kaitoke-green-500 text-abyss-900 dark:text-platinum-100" />
                    </div>

                    <select v-model="filterType"
                        class="px-4 py-2.5 rounded-xl border border-sun-200 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-sm text-abyss-900 dark:text-platinum-100 focus:ring-1 focus:ring-kaitoke-green-500">
                        <option value="all">All Items</option>
                        <option value="folders">Folders Only</option>
                        <option value="files">Files Only</option>
                    </select>

                    <select v-model="sortBy"
                        class="px-4 py-2.5 rounded-xl border border-sun-200 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-sm text-abyss-900 dark:text-platinum-100 focus:ring-1 focus:ring-kaitoke-green-500">
                        <option value="name">Name</option>
                        <option value="date">Date</option>
                        <option value="size">Size</option>
                    </select>

                    <div
                        class="flex items-center gap-1 border border-sun-200 dark:border-abyss-600 rounded-xl p-1 bg-white dark:bg-abyss-800">
                        <button @click="viewMode = 'grid'"
                            :class="viewMode === 'grid' ? 'bg-sun-200 dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100' : 'text-platinum-500'"
                            class="p-2 rounded-lg hover:bg-sun-100 dark:hover:bg-abyss-700 transition">
                            <Grid class="h-4 w-4" />
                        </button>
                        <button @click="viewMode = 'list'"
                            :class="viewMode === 'list' ? 'bg-sun-200 dark:bg-abyss-700 text-abyss-900 dark:text-platinum-100' : 'text-platinum-500'"
                            class="p-2 rounded-lg hover:bg-sun-100 dark:hover:bg-abyss-700 transition">
                            <List class="h-4 w-4" />
                        </button>
                    </div>

                    <button @click="loadDocuments"
                        class="p-2 rounded-xl text-abyss-900 dark:text-platinum-100 hover:bg-sun-100 dark:hover:bg-abyss-700 transition">
                        <RefreshCw class="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div class="bg-sun-50 dark:bg-abyss-800 px-6 py-2 border-b border-sun-200 dark:border-abyss-700">
                <div class="flex items-center gap-6 text-sm text-platinum-600 dark:text-platinum-400">
                    <div class="flex items-center gap-2">
                        <Folder class="h-4 w-4 text-amber-500" />
                        <span>{{ stats.total_folders }} folders</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <File class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>{{ stats.total_files }} files</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <Globe class="h-4 w-4 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                        <span>{{ stats.public_files }} shared</span>
                    </div>
                    <div class="flex items-center gap-2 font-semibold">
                        <span class="text-abyss-900 dark:text-platinum-100">Total: {{ stats.total_size_formatted
                        }}</span>
                    </div>
                </div>
            </div>

            <div class="flex-1 overflow-auto px-6 pb-6 pt-4">
                <div v-if="loading" class="flex items-center justify-center py-12">
                    <Loader2 class="h-8 w-8 animate-spin text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                    <p class="ml-3 text-lg font-medium text-platinum-600 dark:text-platinum-400">Loading...</p>
                </div>

                <div v-else-if="filteredDocuments.length === 0"
                    class="flex flex-col items-center justify-center py-20 bg-white dark:bg-abyss-800 rounded-xl border border-sun-200 dark:border-abyss-700">
                    <Folder class="h-16 w-16 mb-4 text-platinum-400" />
                    <p class="text-lg font-medium text-abyss-900 dark:text-platinum-100">No items found</p>
                    <p class="text-sm text-platinum-600 dark:text-platinum-400">
                        {{ searchQuery ? 'Try a different search.' : 'Upload files or create folders to get started.' }}
                    </p>
                </div>

                <div v-else-if="viewMode === 'grid'"
                    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    <div v-for="doc in filteredDocuments" :key="doc.id" @click="openItem(doc)"
                        @contextmenu="openContextMenu($event, doc)"
                        class="group relative p-4 rounded-xl border border-sun-200 dark:border-abyss-700 hover:border-kaitoke-green-500 dark:hover:border-kaitoke-green-600 cursor-pointer transition bg-white dark:bg-abyss-800 shadow-sm hover:shadow-md">

                        <div class="flex flex-col items-center text-center">
                            <div v-if="!doc.is_folder && doc.file_extension"
                                class="absolute top-2 left-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold rounded">
                                {{ doc.file_extension }}
                            </div>

                            <div v-if="!doc.is_folder && doc.is_shared_public"
                                class="absolute top-2 right-2 p-1 bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 rounded-full"
                                title="Shared publicly">
                                <Globe class="h-3 w-3 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            </div>

                            <component :is="getIcon(doc)" class="h-12 w-12 mb-3" :class="getIconColor(doc)" />

                            <p class="text-sm font-medium text-abyss-900 dark:text-platinum-100 truncate w-full px-1"
                                :title="doc.title">
                                {{ doc.title }}
                            </p>

                            <p class="text-xs text-platinum-600 dark:text-platinum-400 mt-1">
                                {{ doc.is_folder ? `${doc.children_count || 0} items` : formatSize(doc.file_size) }}
                            </p>
                        </div>

                        <div
                            class="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition z-10">
                            <button v-if="!doc.is_folder && doc.can_share" @click.stop="toggleShare(doc)"
                                :class="doc.is_shared_public ? 'bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30' : 'bg-white dark:bg-abyss-700'"
                                class="p-1.5 rounded-xl hover:bg-sun-100 dark:hover:bg-abyss-600 shadow-sm border border-sun-200 dark:border-abyss-600"
                                :title="doc.is_shared_public ? 'Stop sharing' : 'Share publicly'">
                                <Share2
                                    :class="doc.is_shared_public ? 'text-kaitoke-green-600 dark:text-kaitoke-green-400' : 'text-platinum-600 dark:text-platinum-400'"
                                    class="h-3.5 w-3.5" />
                            </button>

                            <button @click.stop="showProperties(doc)"
                                class="p-1.5 bg-white dark:bg-abyss-700 rounded-xl hover:bg-sun-100 dark:hover:bg-abyss-600 shadow-sm border border-sun-200 dark:border-abyss-600">
                                <Info class="h-3.5 w-3.5 text-platinum-600 dark:text-platinum-400" />
                            </button>

                            <button @click.stop="openContextMenu($event, doc)"
                                class="p-1.5 bg-white dark:bg-abyss-700 rounded-xl hover:bg-sun-100 dark:hover:bg-abyss-600 shadow-sm border border-sun-200 dark:border-abyss-600">
                                <MoreVertical class="h-3.5 w-3.5 text-platinum-600 dark:text-platinum-400" />
                            </button>
                        </div>
                    </div>
                </div>

                <div v-else
                    class="bg-white dark:bg-abyss-800 rounded-xl border border-sun-200 dark:border-abyss-700 overflow-hidden shadow">
                    <table class="w-full">
                        <thead class="bg-sun-50 dark:bg-abyss-700 border-b border-sun-200 dark:border-abyss-600">
                            <tr
                                class="text-left text-xs font-medium text-platinum-700 dark:text-platinum-300 uppercase tracking-wider">
                                <th class="px-6 py-3">Name</th>
                                <th class="px-4 py-3">Type</th>
                                <th class="px-4 py-3">Size</th>
                                <th class="px-4 py-3">Modified</th>
                                <th class="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-sun-200 dark:divide-abyss-700">
                            <tr v-for="doc in filteredDocuments" :key="doc.id" @click="openItem(doc)"
                                @contextmenu="openContextMenu($event, doc)"
                                class="group hover:bg-sun-50 dark:hover:bg-abyss-700 cursor-pointer transition">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <component :is="getIcon(doc)" class="h-5 w-5 shrink-0"
                                            :class="getIconColor(doc)" />
                                        <div class="flex items-center gap-2">
                                            <span
                                                class="text-sm font-medium text-abyss-900 dark:text-platinum-100 truncate">
                                                {{ doc.title }}
                                            </span>
                                            <Globe v-if="!doc.is_folder && doc.is_shared_public"
                                                class="h-3.5 w-3.5 text-kaitoke-green-600 dark:text-kaitoke-green-400 shrink-0"
                                                title="Shared publicly" />
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-4">
                                    <span v-if="!doc.is_folder && doc.file_extension"
                                        class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold rounded">
                                        {{ doc.file_extension }}
                                    </span>
                                    <span v-else class="text-xs text-platinum-500">—</span>
                                </td>
                                <td class="px-4 py-4">
                                    <span class="text-sm text-platinum-700 dark:text-platinum-300">
                                        {{ doc.is_folder ? '—' : formatSize(doc.file_size) }}
                                    </span>
                                </td>
                                <td class="px-4 py-4">
                                    <span class="text-sm text-platinum-700 dark:text-platinum-300">
                                        {{ formatDate(doc.updated_at || doc.created_at) }}
                                    </span>
                                </td>
                                <td class="px-4 py-4 text-right">
                                    <div
                                        class="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition">
                                        <button v-if="!doc.is_folder && doc.can_share" @click.stop="toggleShare(doc)"
                                            class="p-2 rounded-xl hover:bg-sun-100 dark:hover:bg-abyss-600 transition"
                                            :title="doc.is_shared_public ? 'Stop sharing' : 'Share publicly'">
                                            <Share2
                                                :class="doc.is_shared_public ? 'text-kaitoke-green-600 dark:text-kaitoke-green-400' : 'text-platinum-600 dark:text-platinum-400'"
                                                class="h-5 w-5" />
                                        </button>

                                        <button @click.stop="showProperties(doc)"
                                            class="p-2 rounded-xl text-platinum-600 dark:text-platinum-400 hover:bg-sun-100 dark:hover:bg-abyss-600 transition">
                                            <Info class="h-5 w-5" />
                                        </button>

                                        <button @click.stop="openContextMenu($event, doc)"
                                            class="p-2 rounded-xl text-platinum-600 dark:text-platinum-400 hover:bg-sun-100 dark:hover:bg-abyss-600 transition">
                                            <MoreVertical class="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div v-if="showPropertiesSidebar && selectedDocument"
            class="hidden xl:block w-80 border-l border-sun-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 overflow-y-auto">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-100">Properties</h3>
                    <button @click="showPropertiesSidebar = false"
                        class="p-1 hover:bg-sun-100 dark:hover:bg-abyss-700 rounded">
                        <X class="h-5 w-5 text-platinum-600 dark:text-platinum-400" />
                    </button>
                </div>

                <div class="space-y-4">
                    <div
                        class="flex flex-col items-center text-center pb-4 border-b border-sun-200 dark:border-abyss-700">
                        <component :is="getIcon(selectedDocument)" class="h-16 w-16 mb-2"
                            :class="getIconColor(selectedDocument)" />
                        <h4 class="font-semibold text-abyss-900 dark:text-platinum-100 break-words">
                            {{ selectedDocument.title }}
                        </h4>
                        <span v-if="selectedDocument.file_extension"
                            class="mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold rounded">
                            {{ selectedDocument.file_extension }}
                        </span>
                    </div>

                    <div class="space-y-3 text-sm">
                        <div v-if="!selectedDocument.is_folder">
                            <p class="text-platinum-600 dark:text-platinum-400 mb-1">Size</p>
                            <p class="font-medium text-abyss-900 dark:text-platinum-100">
                                {{ formatSize(selectedDocument.file_size) }}
                            </p>
                        </div>

                        <div>
                            <p class="text-platinum-600 dark:text-platinum-400 mb-1">Uploaded By</p>
                            <p class="font-medium text-abyss-900 dark:text-platinum-100">
                                {{ selectedDocument.uploader?.name || 'Unknown' }}
                            </p>
                        </div>

                        <div>
                            <p class="text-platinum-600 dark:text-platinum-400 mb-1">Created</p>
                            <p class="font-medium text-abyss-900 dark:text-platinum-100">
                                {{ formatDate(selectedDocument.created_at) }}
                            </p>
                        </div>

                        <div>
                            <p class="text-platinum-600 dark:text-platinum-400 mb-1">Modified</p>
                            <p class="font-medium text-abyss-900 dark:text-platinum-100">
                                {{ formatDate(selectedDocument.updated_at) }}
                            </p>
                        </div>

                        <div v-if="!selectedDocument.is_folder">
                            <p class="text-platinum-600 dark:text-platinum-400 mb-1">Sharing Status</p>
                            <div class="flex items-center gap-2">
                                <component :is="selectedDocument.is_shared_public ? Globe : Building2" class="h-4 w-4"
                                    :class="selectedDocument.is_shared_public ? 'text-kaitoke-green-600 dark:text-kaitoke-green-400' : 'text-platinum-600'" />
                                <p class="font-medium text-abyss-900 dark:text-platinum-100">
                                    {{ selectedDocument.is_shared_public ? 'Shared Publicly' : 'Organization Only' }}
                                </p>
                            </div>
                        </div>

                        <div v-if="selectedDocument.description">
                            <p class="text-platinum-600 dark:text-platinum-400 mb-1">Description</p>
                            <p class="font-medium text-abyss-900 dark:text-platinum-100">
                                {{ selectedDocument.description }}
                            </p>
                        </div>
                    </div>

                    <div v-if="!selectedDocument.is_folder"
                        class="pt-4 border-t border-sun-200 dark:border-abyss-700 space-y-2">
                        <button v-if="selectedDocument.can_share" @click="toggleShare(selectedDocument)"
                            class="w-full px-4 py-2 rounded-xl font-medium transition flex items-center justify-center gap-2"
                            :class="selectedDocument.is_shared_public
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                : 'bg-kaitoke-green-600 text-white hover:bg-kaitoke-green-700'">
                            <Share2 class="h-4 w-4" />
                            {{ selectedDocument.is_shared_public ? 'Stop Sharing' : 'Share Publicly' }}
                        </button>

                        <button @click="downloadDocument(selectedDocument)"
                            class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2">
                            <Download class="h-4 w-4" />
                            Download
                        </button>

                        <button v-if="selectedDocument.can_delete" @click="deleteDocument(selectedDocument)"
                            class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2">
                            <Trash2 class="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showContextMenu && contextMenuItem"
            :style="{ top: contextMenuPos.y + 'px', left: contextMenuPos.x + 'px' }"
            class="fixed z-50 bg-white dark:bg-abyss-800 rounded-xl shadow-2xl border border-sun-200 dark:border-abyss-700 py-1 min-w-[200px]">

            <button v-if="!contextMenuItem.is_folder" @click="downloadDocument(contextMenuItem); closeContextMenu()"
                class="w-full px-4 py-2 text-left text-sm text-abyss-900 dark:text-platinum-100 hover:bg-sun-100 dark:hover:bg-abyss-700 flex items-center gap-2">
                <Download class="h-4 w-4" />
                Download
            </button>

            <button v-if="!contextMenuItem.is_folder && contextMenuItem.can_share"
                @click="toggleShare(contextMenuItem); closeContextMenu()"
                class="w-full px-4 py-2 text-left text-sm text-abyss-900 dark:text-platinum-100 hover:bg-sun-100 dark:hover:bg-abyss-700 flex items-center gap-2">
                <Share2 class="h-4 w-4 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                {{ contextMenuItem.is_shared_public ? 'Stop Sharing' : 'Share Publicly' }}
            </button>

            <button @click="showProperties(contextMenuItem)"
                class="w-full px-4 py-2 text-left text-sm text-abyss-900 dark:text-platinum-100 hover:bg-sun-100 dark:hover:bg-abyss-700 flex items-center gap-2">
                <Info class="h-4 w-4" />
                Properties
            </button>

            <hr class="my-1 border-sun-200 dark:border-abyss-700" />

            <button v-if="contextMenuItem.can_delete" @click="deleteDocument(contextMenuItem); closeContextMenu()"
                class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                <Trash2 class="h-4 w-4" />
                Delete
            </button>
        </div>

        <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            @click.self="showUploadModal = false">
            <div
                class="bg-white dark:bg-abyss-800 rounded-xl p-6 max-w-md w-full shadow-2xl border border-sun-200 dark:border-abyss-700">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold text-abyss-900 dark:text-platinum-100 flex items-center gap-2">
                        <Upload class="h-5 w-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Upload File
                    </h3>
                    <button @click="showUploadModal = false"
                        class="p-2 hover:bg-sun-100 dark:hover:bg-abyss-700 rounded-xl">
                        <X class="h-5 w-5 text-platinum-600 dark:text-platinum-400" />
                    </button>
                </div>

                <input type="file" @change="onFileSelect" class="block w-full text-sm mb-4
                        file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-kaitoke-green-100 file:text-kaitoke-green-800
                        hover:file:bg-kaitoke-green-200
                        dark:file:bg-kaitoke-green-900/30 dark:file:text-kaitoke-green-300 transition" />

                <div v-if="uploadFile" class="text-sm text-platinum-700 dark:text-platinum-300 mb-4">
                    Selected: <strong>{{ uploadFile.name }}</strong> ({{ formatSize(uploadFile.size) }})
                </div>

                <div v-if="uploading" class="mb-4">
                    <div
                        class="flex items-center justify-between text-sm mb-2 text-platinum-700 dark:text-platinum-300">
                        <span>Uploading...</span>
                        <span>{{ uploadProgress }}%</span>
                    </div>
                    <div class="w-full bg-sun-200 dark:bg-abyss-700 rounded-full h-2">
                        <div class="bg-kaitoke-green-600 h-2 rounded-full transition-all"
                            :style="{ width: uploadProgress + '%' }"></div>
                    </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button @click="showUploadModal = false" type="button"
                        class="flex-1 px-4 py-2.5 rounded-xl border border-sun-300 dark:border-abyss-600 text-abyss-900 dark:text-platinum-100 hover:bg-sun-100 dark:hover:bg-abyss-700 transition font-medium">
                        Cancel
                    </button>
                    <button @click="uploadDocument" :disabled="!uploadFile || uploading"
                        class="flex-1 px-4 py-2.5 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 disabled:opacity-50 rounded-xl text-white font-semibold transition shadow-md">
                        {{ uploading ? 'Uploading...' : 'Upload' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showCreateFolderModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            @click.self="showCreateFolderModal = false">
            <div
                class="bg-white dark:bg-abyss-800 rounded-xl p-6 max-w-md w-full shadow-2xl border border-sun-200 dark:border-abyss-700">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold text-abyss-900 dark:text-platinum-100 flex items-center gap-2">
                        <FolderPlus class="h-5 w-5 text-amber-600 dark:text-amber-400" /> Create Folder
                    </h3>
                    <button @click="showCreateFolderModal = false"
                        class="p-2 hover:bg-sun-100 dark:hover:bg-abyss-700 rounded-xl">
                        <X class="h-5 w-5 text-platinum-600 dark:text-platinum-400" />
                    </button>
                </div>

                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-platinum-700 dark:text-platinum-300 mb-2">Folder
                            Name
                            *</label>
                        <input v-model="newFolderName" type="text" placeholder="Enter folder name"
                            class="w-full px-4 py-2.5 rounded-xl border border-sun-300 dark:border-abyss-600 bg-sun-50 dark:bg-abyss-900 text-abyss-900 dark:text-platinum-100 focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600" />
                    </div>

                    <div>
                        <label
                            class="block text-sm font-medium text-platinum-700 dark:text-platinum-300 mb-2">Description
                            (Optional)</label>
                        <textarea v-model="newFolderDescription" rows="3" placeholder="Enter description"
                            class="w-full px-4 py-2.5 border border-sun-300 dark:border-abyss-600 rounded-xl bg-sun-50 dark:bg-abyss-900 text-abyss-900 dark:text-platinum-100 focus:ring-1 focus:ring-kaitoke-green-600 focus:border-kaitoke-green-600"></textarea>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button @click="showCreateFolderModal = false" type="button"
                            class="flex-1 px-4 py-2.5 rounded-xl border border-sun-300 dark:border-abyss-600 text-abyss-900 dark:text-platinum-100 hover:bg-sun-100 dark:hover:bg-abyss-700 transition font-medium">
                            Cancel
                        </button>
                        <button @click="createFolder" :disabled="!newFolderName.trim() || creatingFolder"
                            class="flex-1 px-4 py-2.5 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 disabled:opacity-50 rounded-xl text-white font-semibold transition shadow-md">
                            {{ creatingFolder ? 'Creating...' : 'Create Folder' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showPropertiesModal && selectedDocument"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            @click.self="showPropertiesModal = false">
            <div
                class="bg-white dark:bg-abyss-800 rounded-xl p-6 max-w-md w-full shadow-2xl border border-sun-200 dark:border-abyss-700 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold text-abyss-900 dark:text-platinum-100">Properties</h3>
                    <button @click="showPropertiesModal = false"
                        class="p-2 hover:bg-sun-100 dark:hover:bg-abyss-700 rounded-xl">
                        <X class="h-5 w-5 text-platinum-600 dark:text-platinum-400" />
                    </button>
                </div>

                <div class="space-y-4">
                    <div
                        class="flex flex-col items-center text-center pb-4 border-b border-sun-200 dark:border-abyss-700">
                        <component :is="getIcon(selectedDocument)" class="h-16 w-16 mb-2"
                            :class="getIconColor(selectedDocument)" />
                        <h4 class="font-semibold text-abyss-900 dark:text-platinum-100 break-words">
                            {{ selectedDocument.title }}
                        </h4>
                        <span v-if="selectedDocument.file_extension"
                            class="mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold rounded">
                            {{ selectedDocument.file_extension }}
                        </span>
                    </div>

                    <div class="space-y-3 text-sm">
                        <div v-if="!selectedDocument.is_folder">
                            <p class="text-platinum-600 dark:text-platinum-400 mb-1">Size</p>
                            <p class="font-medium text-abyss-900 dark:text-platinum-100">
                                {{ formatSize(selectedDocument.file_size) }}
                            </p>
                        </div>

                        <div>
                            <p class="text-platinum-600 dark:text-platinum-400 mb-1">Uploaded By</p>
                            <p class="font-medium text-abyss-900 dark:text-platinum-100">
                                {{ selectedDocument.uploader?.name || 'Unknown' }}
                            </p>
                        </div>

                        <div>
                            <p class="text-platinum-600 dark:text-platinum-400 mb-1">Created</p>
                            <p class="font-medium text-abyss-900 dark:text-platinum-100">
                                {{ formatDate(selectedDocument.created_at) }}
                            </p>
                        </div>

                        <div>
                            <p class="text-platinum-600 dark:text-platinum-400 mb-1">Modified</p>
                            <p class="font-medium text-abyss-900 dark:text-platinum-100">
                                {{ formatDate(selectedDocument.updated_at) }}
                            </p>
                        </div>

                        <div v-if="!selectedDocument.is_folder">
                            <p class="text-platinum-600 dark:text-platinum-400 mb-1">Sharing Status</p>
                            <div class="flex items-center gap-2">
                                <component :is="selectedDocument.is_shared_public ? Globe : Building2" class="h-4 w-4"
                                    :class="selectedDocument.is_shared_public ? 'text-kaitoke-green-600 dark:text-kaitoke-green-400' : 'text-platinum-600'" />
                                <p class="font-medium text-abyss-900 dark:text-platinum-100">
                                    {{ selectedDocument.is_shared_public ? 'Shared Publicly' : 'Organization Only' }}
                                </p>
                            </div>
                        </div>

                        <div v-if="selectedDocument.description">
                            <p class="text-platinum-600 dark:text-platinum-400 mb-1">Description</p>
                            <p class="font-medium text-abyss-900 dark:text-platinum-100">
                                {{ selectedDocument.description }}
                            </p>
                        </div>
                    </div>

                    <div v-if="!selectedDocument.is_folder"
                        class="pt-4 border-t border-sun-200 dark:border-abyss-700 space-y-2">
                        <button v-if="selectedDocument.can_share" @click="toggleShare(selectedDocument)"
                            class="w-full px-4 py-2 rounded-xl font-medium transition flex items-center justify-center gap-2"
                            :class="selectedDocument.is_shared_public
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                : 'bg-kaitoke-green-600 text-white hover:bg-kaitoke-green-700'">
                            <Share2 class="h-4 w-4" />
                            {{ selectedDocument.is_shared_public ? 'Stop Sharing' : 'Share Publicly' }}
                        </button>

                        <button @click="downloadDocument(selectedDocument); showPropertiesModal = false"
                            class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2">
                            <Download class="h-4 w-4" />
                            Download
                        </button>

                        <button v-if="selectedDocument.can_delete" @click="deleteDocument(selectedDocument)"
                            class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2">
                            <Trash2 class="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showHelpModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            @click.self="showHelpModal = false">
            <div
                class="bg-white dark:bg-abyss-800 rounded-xl p-6 max-w-2xl w-full shadow-2xl border border-sun-200 dark:border-abyss-700 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold text-abyss-900 dark:text-platinum-100 flex items-center gap-2">
                        <HelpCircle class="h-6 w-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                        Document Vault Guidelines
                    </h3>
                    <button @click="showHelpModal = false"
                        class="p-2 hover:bg-sun-100 dark:hover:bg-abyss-700 rounded-xl">
                        <X class="h-5 w-5 text-platinum-600 dark:text-platinum-400" />
                    </button>
                </div>

                <div class="space-y-6 text-sm text-platinum-700 dark:text-platinum-300">
                    <div>
                        <h4 class="font-semibold text-abyss-900 dark:text-platinum-100 mb-2 flex items-center gap-2">
                            <Upload class="h-4 w-4 text-blue-600" />
                            Uploading Files
                        </h4>
                        <ul class="list-disc list-inside space-y-1 ml-4">
                            <li>Maximum file size: 50 MB</li>
                            <li>All file types are supported</li>
                            <li>Files are automatically organized by folder</li>
                            <li>Only you and admins can delete your uploaded files</li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="font-semibold text-abyss-900 dark:text-platinum-100 mb-2 flex items-center gap-2">
                            <Share2 class="h-4 w-4 text-kaitoke-green-600" />
                            Sharing Documents
                        </h4>
                        <ul class="list-disc list-inside space-y-1 ml-4">
                            <li>You can share your uploaded documents with all authenticated users</li>
                            <li>Shared documents appear in the "Shared Documents" panel</li>
                            <li>Only the uploader can share/unshare their own documents</li>
                            <li>Admins can share any document in the organization</li>
                            <li>Click the share button to toggle public visibility</li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="font-semibold text-abyss-900 dark:text-platinum-100 mb-2 flex items-center gap-2">
                            <Trash2 class="h-4 w-4 text-red-600" />
                            Deleting Documents
                        </h4>
                        <ul class="list-disc list-inside space-y-1 ml-4">
                            <li>You can delete your own uploaded files anytime</li>
                            <li>Admins can delete any document with proper permission</li>
                            <li>Deleting a folder will delete all its contents</li>
                            <li>Deletion is permanent and cannot be undone</li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="font-semibold text-abyss-900 dark:text-platinum-100 mb-2 flex items-center gap-2">
                            <Info class="h-4 w-4 text-purple-600" />
                            Tips & Best Practices
                        </h4>
                        <ul class="list-disc list-inside space-y-1 ml-4">
                            <li>Use folders to organize related documents</li>
                            <li>Add descriptions to help others find documents</li>
                            <li>Use descriptive file names</li>
                            <li>Check sharing status before uploading sensitive files</li>
                            <li>Click on document properties (info icon) to view details</li>
                        </ul>
                    </div>

                    <div
                        class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                        <p class="font-medium text-amber-800 dark:text-amber-300 mb-2">⚠️ Important</p>
                        <p>Documents marked as "Shared Publicly" are visible to all authenticated users across all
                            organizations. Be careful what you share!</p>
                    </div>
                </div>

                <button @click="showHelpModal = false"
                    class="mt-6 w-full px-4 py-2.5 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white rounded-xl font-semibold transition">
                    Got it!
                </button>
            </div>
        </div>
    </div>
</template>