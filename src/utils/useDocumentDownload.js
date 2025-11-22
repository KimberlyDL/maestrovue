// composables/useDocumentDownload.js
import { ref } from 'vue'
import axios from '@/utils/api'

export function useDocumentDownload() {
    const downloading = ref(false)
    const downloadProgress = ref(0)
    const error = ref('')

    /**
     * Download authenticated document
     */
    async function downloadDocument(documentId, versionId, orgId = null) {
        downloading.value = true
        downloadProgress.value = 0
        error.value = ''

        try {
            // Build URL based on context
            const baseUrl = orgId
                ? `/api/org/${orgId}/storage/documents/${documentId}`
                : `/api/documents/${documentId}`

            const url = `${baseUrl}/versions/${versionId}/download-url`

            // Get signed URL
            const response = await axios.get(url)

            if (!response.data?.url) {
                throw new Error('Failed to generate download URL')
            }

            // Trigger download
            triggerDownload(response.data.url, response.data.filename)

            return {
                success: true,
                filename: response.data.filename,
            }

        } catch (e) {
            console.error('Download error:', e)
            error.value = e.response?.data?.message || e.message || 'Download failed'
            
            return {
                success: false,
                error: error.value,
            }
        } finally {
            downloading.value = false
            downloadProgress.value = 0
        }
    }

    /**
     * Download public document via share token
     */
    async function downloadPublicDocument(shareToken, password = null) {
        downloading.value = true
        downloadProgress.value = 0
        error.value = ''

        try {
            // Build URL with password if provided
            let url = `/api/share/${shareToken}/download-url`
            if (password) {
                url += `?password=${encodeURIComponent(password)}`
            }

            // Get signed URL
            const response = await axios.get(url)

            if (!response.data?.url) {
                throw new Error('Failed to generate download URL')
            }

            // Trigger download
            triggerDownload(response.data.url, response.data.filename)

            return {
                success: true,
                filename: response.data.filename,
            }

        } catch (e) {
            console.error('Public download error:', e)
            error.value = e.response?.data?.message || e.message || 'Download failed'
            
            return {
                success: false,
                error: error.value,
            }
        } finally {
            downloading.value = false
            downloadProgress.value = 0
        }
    }

    /**
     * Download with progress tracking (for large files)
     */
    async function downloadWithProgress(documentId, versionId, orgId = null) {
        downloading.value = true
        downloadProgress.value = 0
        error.value = ''

        try {
            // Get signed URL first
            const baseUrl = orgId
                ? `/api/org/${orgId}/storage/documents/${documentId}`
                : `/api/documents/${documentId}`

            const urlResponse = await axios.get(`${baseUrl}/versions/${versionId}/download-url`)

            if (!urlResponse.data?.url) {
                throw new Error('Failed to generate download URL')
            }

            const downloadUrl = urlResponse.data.url
            const filename = urlResponse.data.filename

            // Download with progress
            const response = await fetch(downloadUrl)

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`)
            }

            const reader = response.body.getReader()
            const contentLength = +response.headers.get('Content-Length')

            let receivedLength = 0
            const chunks = []

            while (true) {
                const { done, value } = await reader.read()

                if (done) break

                chunks.push(value)
                receivedLength += value.length

                // Update progress
                if (contentLength) {
                    downloadProgress.value = Math.round((receivedLength / contentLength) * 100)
                }
            }

            // Create blob and trigger download
            const blob = new Blob(chunks, {
                type: urlResponse.data.mime_type || 'application/octet-stream'
            })

            const blobUrl = window.URL.createObjectURL(blob)
            triggerDownload(blobUrl, filename)
            window.URL.revokeObjectURL(blobUrl)

            return {
                success: true,
                filename,
            }

        } catch (e) {
            console.error('Download error:', e)
            error.value = e.message || 'Download failed'
            
            return {
                success: false,
                error: error.value,
            }
        } finally {
            downloading.value = false
            downloadProgress.value = 0
        }
    }

    /**
     * Helper: Trigger browser download
     */
    function triggerDownload(url, filename) {
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.style.display = 'none'

        document.body.appendChild(link)
        link.click()

        setTimeout(() => {
            document.body.removeChild(link)
        }, 100)
    }

    return {
        downloading,
        downloadProgress,
        error,
        downloadDocument,
        downloadPublicDocument,
        downloadWithProgress,
    }
}