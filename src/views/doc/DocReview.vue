<template>
  <div class="min-h-screen bg-platinum-50 dark:bg-abyss-900 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-30 border-b border-platinum-300/60 bg-white/80 dark:bg-abyss-900/70 backdrop-blur">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-lg bg-kaitoke-green-600"></div>
          <h1 class="font-heading text-[18px] font-semibold text-abyss-900 dark:text-platinum-50">
            Document Review Workspace
          </h1>
        </div>

        <div class="ml-auto flex flex-wrap items-center gap-2">
          <input v-model="filters.q" type="text" placeholder="Search documents..." class="w-56 rounded-xl border border-platinum-300 bg-white px-3 py-2 text-[13px]
                   placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-400 
                   dark:bg-abyss-800 dark:border-abyss-700 dark:text-platinum-100" />

          <select v-model="filters.type" class="rounded-xl border border-platinum-300 bg-white px-3 py-2 text-[13px]
                   focus:outline-none focus:ring-2 focus:ring-kaitoke-green-400
                   dark:bg-abyss-800 dark:border-abyss-700 dark:text-platinum-100">
            <option value="">All Types</option>
            <option v-for="t in types" :key="t">{{ t }}</option>
          </select>

          <button
            class="rounded-xl bg-kaitoke-green-600 px-3 py-2 text-[13px] font-semibold text-white hover:bg-kaitoke-green-700"
            @click="uploadNew">
            + Upload
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-9">
          <DocReviewUnit v-for="d in filtered" :key="d.id" :doc="d" :reviewers="d.reviewers" @open="onOpen"
            @view-logs="onViewLogs" @upload-version="onUploadVersion" @approve="onApprove" />
        </div>
        
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import DocReviewUnit from '@/components/doc/doc_review_unit.vue'

// Mock Data
const docs = reactive([
  {
    id: 1,
    title: 'Data Privacy Policy',
    type: 'Policy',
    uploadedAt: '2025-10-20T14:30:00',
    status: 'In Review',
    reviewers: [
      { id: 101, name: 'Ana Cruz', status: 'reviewed' },
      { id: 102, name: 'Miguel Santos', status: 'pending' }
    ]
  },
  {
    id: 2,
    title: 'Quarterly Financial Report Q3',
    type: 'Report',
    uploadedAt: '2025-10-15T10:00:00',
    status: 'Pending',
    reviewers: [
      { id: 103, name: 'Dr. Ramos', status: 'pending' },
      { id: 104, name: 'Lea Dela Peña', status: 'approved' }
    ]
  },
  {
    id: 3,
    title: 'Proposal: Smart Waste System',
    type: 'Proposal',
    uploadedAt: '2025-10-22T09:00:00',
    status: 'Approved',
    reviewers: [
      { id: 105, name: 'Kim De Leon', status: 'approved' },
      { id: 106, name: 'Vina Fernandez', status: 'approved' }
    ]
  }
])

const filters = reactive({ q: '', type: '' })
const types = ['Policy', 'Report', 'Proposal']

// Filtering logic
const filtered = computed(() => {
  const q = filters.q.toLowerCase()
  return docs.filter((d) => {
    const matchQ = !q || d.title.toLowerCase().includes(q)
    const matchType = !filters.type || d.type === filters.type
    return matchQ && matchType
  })
})

// Handlers (for now, just log actions)
function onOpen(id) {
  console.log('🟩 Open document', id)
}
function onViewLogs(id) {
  console.log('📜 View logs for', id)
}
function onUploadVersion(id) {
  alert('Upload new version for doc ' + id)
}
function onApprove(reviewer) {
  alert(`Approved by ${reviewer.name}`)
}
function uploadNew() {
  alert('Opening upload dialog...')
}
</script>
