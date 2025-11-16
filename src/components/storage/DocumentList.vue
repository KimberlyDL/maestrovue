<!-- src/components/documents/DocumentList.vue -->
<template>
    <div>
        <div v-if="safeDocs.length === 0" class="text-center py-12">
            <p class="text-slate-400">No documents found</p>
        </div>

        <div v-else class="grid gap-4">
            <div v-for="doc in safeDocs" :key="doc.id ?? doc.uuid ?? doc.name"
                class="bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition group">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-white mb-2 truncate">
                            {{ doc.name || doc.title || 'Untitled document' }}
                        </h4>

                        <div class="flex flex-wrap gap-2 text-xs text-slate-400 mb-2">
                            <span class="px-2 py-1 bg-slate-600/50 rounded">
                                {{
                                    doc.access_type === 'organization'
                                        ? '🔒 Organization'
                                        : doc.access_type === 'public'
                                            ? '🌐 Public'
                                : '🔗 Shared Link'
                                }}
                            </span>

                            <span v-if="doc.created_by_user?.name" class="px-2 py-1 bg-slate-600/50 rounded">
                                By {{ doc.created_by_user.name }}
                            </span>

                            <span class="px-2 py-1 bg-slate-600/50 rounded">
                                {{ safeDate(doc.created_at) }}
                            </span>
                        </div>

                        <p v-if="Number(doc.file_size) > 0" class="text-xs text-slate-500">
                            {{ formatFileSize(Number(doc.file_size)) }}
                        </p>
                    </div>

                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button @click="downloadDoc(doc)"
                            class="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition">
                            Download
                        </button>

                        <button v-if="isOwner && doc.access_type === 'organization'" @click="$emit('share', doc)"
                            class="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm font-medium transition">
                            Share
                        </button>

                        <button v-if="isOwner" @click="$emit('delete', doc.id)"
                            class="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition">
                            Delete
                        </button>
                    </div>
                </div>

                <div v-if="Number(doc.shared_with_count) > 0" class="mt-3 text-xs text-slate-400">
                    Shared with {{ Number(doc.shared_with_count) }}
                    {{ Number(doc.shared_with_count) === 1 ? 'person' : 'people' }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import api from '@/utils/api'

const props = defineProps({
    documents: { type: Array, default: () => [] },
    isOwner: { type: Boolean, default: false },
})

defineEmits(['delete', 'share'])

const safeDocs = computed(() => (Array.isArray(props.documents) ? props.documents : []))

const safeDate = (input) => {
    if (!input) return '—'
    const d = new Date(input)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatFileSize = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '—'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

async function downloadDoc(doc) {
    try {
        const { data, headers } = await api.get(`/api/documents/${doc.id}/versions/${doc.latest_version_id ?? 1}/download`, {
            responseType: 'blob',
        })
        const dispo = headers['content-disposition'] || ''
        const match = dispo.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/)
        const filename = decodeURIComponent(match?.[1] || `${doc.name || 'document'}.bin`)

        const url = window.URL.createObjectURL(new Blob([data]))
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
    } catch (e) {
        console.error('Download failed:', e)
        alert('Download failed. Please try again.')
    }
}
</script>
