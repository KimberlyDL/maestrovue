<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/utils/api'
import { useDocumentDownload } from '@/utils/useDocumentDownload'
import { useToast } from '@/utils/useToast'

import {
  FileText, Search, Globe, Download, Building2, Calendar,
  Loader2, File, Eye, X, Info
} from 'lucide-vue-next'

const toast = useToast()

const sharedDocs = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedDocument = ref(null)
const showPropertiesModal = ref(false)

const { downloadWithProgress } = useDocumentDownload()

const R2_WORKER_ENDPOINT = import.meta.env.VITE_R2_WORKER_ENDPOINT || ''

const filteredDocs = computed(() => {
  if (!searchQuery.value.trim()) return sharedDocs.value

  const q = searchQuery.value.toLowerCase()
  return sharedDocs.value.filter(doc =>
    doc.title.toLowerCase().includes(q) ||
    doc.organization?.name.toLowerCase().includes(q) ||
    (doc.description && doc.description.toLowerCase().includes(q))
  )
})

function getOrgLogoUrl(org) {
  if (!org?.logo) return ''

  const logoPath = org.logo
  if (typeof logoPath !== 'string') return ''
  if (logoPath.startsWith('http')) return logoPath

  if (!R2_WORKER_ENDPOINT) return ''

  const cleanEndpoint = R2_WORKER_ENDPOINT.replace(/\/$/, '')
  const cleanPath = logoPath.startsWith('/') ? logoPath.slice(1) : logoPath

  return `${cleanEndpoint}/${cleanPath}`
}

async function loadSharedDocuments() {
  loading.value = true
  try {
    const { data } = await axios.get('/api/shared-documents', {
      params: { per_page: 50 }
    })
    sharedDocs.value = data.data || data || []
  } catch (e) {
    toast.error('Failed to load shared documents')
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function downloadDocument(doc) {
  const versionId = doc.latest_version?.id || doc.latest_version_id
  if (!versionId) {
    toast.error('No file version found')
    return
  }

  const result = await downloadWithProgress(doc.id, versionId)
  if (result.success) {
    toast.success(`Downloaded: ${result.filename}`)
  } else {
    toast.error(result.error)
  }
}

function showProperties(doc) {
  selectedDocument.value = doc
  showPropertiesModal.value = true
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

function getFileExtension(doc) {
  if (!doc.latest_version?.file_path) return 'FILE'
  const ext = doc.latest_version.file_path.split('.').pop()
  return ext ? ext.toUpperCase() : 'FILE'
}

onMounted(() => {
  loadSharedDocuments()
})
</script>

<template>
  <div class="min-h-screen bg-platinum-50 dark:bg-abyss-900 py-8">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="p-3 bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 rounded-xl">
            <Globe class="h-8 w-8 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-abyss-900 dark:text-platinum-50">
              Shared Documents
            </h1>
            <p class="text-platinum-600 dark:text-platinum-400 mt-1">
              Browse documents shared by organizations
            </p>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="relative mb-6 max-w-xl">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-platinum-500" />
        <input v-model="searchQuery" type="text" placeholder="Search documents by title or organization..."
          class="w-full pl-12 pr-4 py-3 rounded-xl border border-sun-200 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-abyss-900 dark:text-platinum-100 focus:ring-2 focus:ring-kaitoke-green-500" />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <Loader2 class="h-8 w-8 animate-spin text-kaitoke-green-600 dark:text-kaitoke-green-400" />
        <p class="ml-3 text-lg font-medium text-platinum-600 dark:text-platinum-400">Loading documents...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredDocs.length === 0"
        class="flex flex-col items-center justify-center py-20 bg-white dark:bg-abyss-800 rounded-xl border border-sun-200 dark:border-abyss-700">
        <FileText class="h-16 w-16 mb-4 text-platinum-400" />
        <p class="text-lg font-medium text-abyss-900 dark:text-platinum-100">No shared documents found</p>
        <p class="text-sm text-platinum-600 dark:text-platinum-400 mt-1">
          {{ searchQuery ? 'Try a different search term' : 'Organizations haven\'t shared any documents yet' }}
        </p>
      </div>

      <!-- Documents Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="doc in filteredDocs" :key="doc.id"
          class="group bg-white dark:bg-abyss-800 rounded-xl border border-sun-200 dark:border-abyss-700 p-6 hover:shadow-lg hover:border-kaitoke-green-500 dark:hover:border-kaitoke-green-600 transition">

          <!-- File Type Badge -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <File class="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span
                class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold rounded">
                {{ getFileExtension(doc) }}
              </span>
            </div>
            <Globe class="h-5 w-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
          </div>

          <!-- Title -->
          <h3 class="font-semibold text-lg text-abyss-900 dark:text-platinum-100 mb-2 line-clamp-2">
            {{ doc.title }}
          </h3>

          <!-- Description -->
          <p v-if="doc.description" class="text-sm text-platinum-600 dark:text-platinum-400 mb-4 line-clamp-3">
            {{ doc.description }}
          </p>

          <!-- Organization Info -->
          <div class="flex items-center gap-2 mb-4 pb-4 border-b border-sun-200 dark:border-abyss-700">
            <div v-if="getOrgLogoUrl(doc.organization)"
              class="w-6 h-6 rounded-full overflow-hidden bg-sun-100 dark:bg-abyss-700 flex-shrink-0">
              <img :src="getOrgLogoUrl(doc.organization)" :alt="doc.organization?.name"
                class="w-full h-full object-cover" />
            </div>
            <div v-else
              class="w-6 h-6 rounded-full bg-gradient-to-br from-kaitoke-green-500 to-electric-lime-500 flex items-center justify-center flex-shrink-0">
              <Building2 class="h-3 w-3 text-white" />
            </div>
            <span class="text-sm font-medium text-platinum-700 dark:text-platinum-300 truncate">
              {{ doc.organization?.name || 'Unknown Organization' }}
            </span>
          </div>

          <!-- Meta Info -->
          <div class="space-y-2 text-xs text-platinum-500 mb-4">
            <div class="flex items-center gap-2">
              <Calendar class="h-3 w-3 flex-shrink-0" />
              <span>{{ formatDate(doc.published_at || doc.created_at) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Download class="h-3 w-3 flex-shrink-0" />
              <span>{{ formatSize(doc.file_size) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button @click="downloadDocument(doc)"
              class="flex-1 px-4 py-2.5 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white rounded-xl text-sm font-semibold transition shadow-md flex items-center justify-center gap-2">
              <Download class="h-4 w-4" />
              Download
            </button>
            <button @click="showProperties(doc)"
              class="px-4 py-2.5 bg-sun-100 dark:bg-abyss-700 hover:bg-sun-200 dark:hover:bg-abyss-600 text-abyss-900 dark:text-platinum-100 rounded-xl text-sm font-semibold transition flex items-center justify-center">
              <Info class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Properties Modal -->
      <div v-if="showPropertiesModal && selectedDocument"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showPropertiesModal = false">
        <div
          class="bg-white dark:bg-abyss-800 rounded-xl p-6 max-w-md w-full shadow-2xl border border-sun-200 dark:border-abyss-700 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-abyss-900 dark:text-platinum-100">Document Details</h3>
            <button @click="showPropertiesModal = false"
              class="p-2 hover:bg-sun-100 dark:hover:bg-abyss-700 rounded-xl">
              <X class="h-5 w-5 text-platinum-600 dark:text-platinum-400" />
            </button>
          </div>

          <div class="space-y-4">
            <!-- Title & Type -->
            <div class="flex flex-col items-center text-center pb-4 border-b border-sun-200 dark:border-abyss-700">
              <div class="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-3">
                <File class="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 class="font-semibold text-lg text-abyss-900 dark:text-platinum-100 break-words mb-2">
                {{ selectedDocument.title }}
              </h4>
              <span
                class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold rounded">
                {{ getFileExtension(selectedDocument) }}
              </span>
            </div>

            <!-- Details -->
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-platinum-600 dark:text-platinum-400 mb-1">Organization</p>
                <div class="flex items-center gap-2">
                  <div v-if="getOrgLogoUrl(selectedDocument.organization)"
                    class="w-6 h-6 rounded-full overflow-hidden bg-sun-100 dark:bg-abyss-700">
                    <img :src="getOrgLogoUrl(selectedDocument.organization)" :alt="selectedDocument.organization?.name"
                      class="w-full h-full object-cover" />
                  </div>
                  <div v-else
                    class="w-6 h-6 rounded-full bg-gradient-to-br from-kaitoke-green-500 to-electric-lime-500 flex items-center justify-center">
                    <Building2 class="h-3 w-3 text-white" />
                  </div>
                  <p class="font-medium text-abyss-900 dark:text-platinum-100">
                    {{ selectedDocument.organization?.name || 'Unknown' }}
                  </p>
                </div>
              </div>

              <div>
                <p class="text-platinum-600 dark:text-platinum-400 mb-1">File Size</p>
                <p class="font-medium text-abyss-900 dark:text-platinum-100">
                  {{ formatSize(selectedDocument.file_size) }}
                </p>
              </div>

              <div>
                <p class="text-platinum-600 dark:text-platinum-400 mb-1">Shared On</p>
                <p class="font-medium text-abyss-900 dark:text-platinum-100">
                  {{ formatDate(selectedDocument.published_at || selectedDocument.created_at) }}
                </p>
              </div>

              <div>
                <p class="text-platinum-600 dark:text-platinum-400 mb-1">Uploaded By</p>
                <p class="font-medium text-abyss-900 dark:text-platinum-100">
                  {{ selectedDocument.uploader?.name || 'Unknown' }}
                </p>
              </div>

              <div v-if="selectedDocument.description">
                <p class="text-platinum-600 dark:text-platinum-400 mb-1">Description</p>
                <p class="font-medium text-abyss-900 dark:text-platinum-100">
                  {{ selectedDocument.description }}
                </p>
              </div>
            </div>

            <!-- Download Button -->
            <div class="pt-4 border-t border-sun-200 dark:border-abyss-700">
              <button @click="downloadDocument(selectedDocument); showPropertiesModal = false"
                class="w-full px-4 py-3 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white rounded-xl font-semibold transition shadow-md flex items-center justify-center gap-2">
                <Download class="h-5 w-5" />
                Download File
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>