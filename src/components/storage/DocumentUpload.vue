<!-- src/components/documents/DocumentUpload.vue -->
<template>
    <div class="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4">Upload Document</h3>

        <form @submit.prevent="handleUpload" class="space-y-4">
            <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300">File</label>
                <input type="file" ref="fileInput" @change="selectFile" class="block w-full text-sm text-slate-200"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip" />
            </div>

            <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300">Document Name</label>
                <input v-model="form.name" type="text" placeholder="Enter document name"
                    class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none" />
            </div>

            <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300">Initial Access</label>
                <select v-model="form.accessType"
                    class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                    <option value="organization">Organization Only</option>
                    <option value="public">Public (Anyone can view)</option>
                </select>
            </div>

            <div v-if="selectedFile" class="text-sm text-slate-300">
                Selected: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
            </div>

            <button type="submit" :disabled="!selectedFile || loading"
                class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg text-white font-medium transition">
                {{ loading ? 'Uploading...' : 'Upload Document' }}
            </button>
        </form>

        <div v-if="uploadError" class="mt-4 p-3 bg-red-600/20 border border-red-500 rounded-lg text-red-200 text-sm">
            {{ uploadError }}
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/utils/api'

const props = defineProps({
    orgId: { type: [String, Number], required: true },
})
const emit = defineEmits(['upload-complete'])

const fileInput = ref(null)
const selectedFile = ref(null)
const loading = ref(false)
const uploadError = ref('')
const form = ref({
    name: '',
    accessType: 'organization',
})

const selectFile = (event) => {
    selectedFile.value = event.target.files?.[0] || null
    if (selectedFile.value && !form.value.name) {
        form.value.name = selectedFile.value.name.replace(/\.[^/.]+$/, '')
    }
}

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const handleUpload = async () => {
    if (!selectedFile.value) return
    uploadError.value = ''
    loading.value = true
    try {
        const fd = new FormData()
        fd.append('file', selectedFile.value)
        fd.append('name', form.value.name || selectedFile.value.name)
        fd.append('organization_id', String(props.orgId))
        fd.append('access_type', form.value.accessType)

        await api.post('/api/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } })

        selectedFile.value = null
        form.value = { name: '', accessType: 'organization' }
        if (fileInput.value) fileInput.value.value = ''
        emit('upload-complete')
    } catch (e) {
        uploadError.value = e?.response?.data?.message || e?.message || 'Upload failed. Please try again.'
    } finally {
        loading.value = false
    }
}
</script>
