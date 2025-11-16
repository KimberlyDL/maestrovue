// src\stores\doc_review_store.js
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import api from "../utils/api.js"

export const useDocReviewHandler = defineStore("docReviewHandler", () => {
    // State
    const documents = ref([])
    const selectedDocument = ref(null)
    const selectedDocuments = ref([])
    const loading = ref(false)
    const error = ref(null)
    const activityLog = ref([])

    // Filter state
    const filters = ref({
        search: "",
        type: "",
        reviewer: "",
        status: "",
        dateRange: { start: null, end: null },
    })

    const sortBy = ref("dateUploaded")
    const viewMode = ref("list") // 'list' or 'board'

    // Computed: Filtered and sorted documents
    const filteredDocuments = computed(() => {
        let result = [...documents.value]

        // Apply search filter
        if (filters.value.search) {
            const query = filters.value.search.toLowerCase()
            result = result.filter((doc) => doc.title.toLowerCase().includes(query) || doc.type.toLowerCase().includes(query))
        }

        // Apply type filter
        if (filters.value.type) {
            result = result.filter((doc) => doc.type === filters.value.type)
        }

        // Apply reviewer filter
        if (filters.value.reviewer) {
            result = result.filter((doc) => doc.reviewers.some((r) => r.id === filters.value.reviewer))
        }

        // Apply status filter
        if (filters.value.status) {
            result = result.filter((doc) => doc.status === filters.value.status)
        }

        // Apply date range filter
        if (filters.value.dateRange.start && filters.value.dateRange.end) {
            result = result.filter((doc) => {
                const docDate = new Date(doc.uploadedAt)
                return docDate >= filters.value.dateRange.start && docDate <= filters.value.dateRange.end
            })
        }

        // Apply sorting
        result.sort((a, b) => {
            switch (sortBy.value) {
                case "dateUploaded":
                    return new Date(b.uploadedAt) - new Date(a.uploadedAt)
                case "reviewerProgress":
                    return b.reviewerProgress - a.reviewerProgress
                case "version":
                    return b.version - a.version
                case "title":
                    return a.title.localeCompare(b.title)
                default:
                    return 0
            }
        })

        return result
    })

    // Computed: Reviewer progress for selected document
    const reviewerProgress = computed(() => {
        if (!selectedDocument.value) return null
        const reviewers = selectedDocument.value.reviewers || []
        const approved = reviewers.filter((r) => r.status === "approved").length
        return {
            total: reviewers.length,
            approved,
            percentage: reviewers.length > 0 ? (approved / reviewers.length) * 100 : 0,
        }
    })

    // Computed: Recent activity
    const recentActivity = computed(() => {
        return activityLog.value.slice(0, 10)
    })

    // Computed: Batch action count
    const batchActionCount = computed(() => selectedDocuments.value.length)

    // Actions: Fetch documents
    const fetchDocuments = async () => {
        loading.value = true
        error.value = null
        try {
            const response = await api.get("/documents")
            documents.value = response.data
            logActivity("Documents fetched", "info")
        } catch (err) {
            error.value = err.message || "Failed to fetch documents"
            console.error("[v0] Fetch documents error:", err)
        } finally {
            loading.value = false
        }
    }

    // Actions: Upload document
    const uploadDocument = async (formData) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.post("/documents/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            documents.value.unshift(response.data)
            logActivity(`Document uploaded: ${response.data.title}`, "upload")
            return response.data
        } catch (err) {
            error.value = err.message || "Failed to upload document"
            console.error("[v0] Upload error:", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Actions: Update document
    const updateDocument = async (docId, updates) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.put(`/documents/${docId}`, updates)
            const index = documents.value.findIndex((d) => d.id === docId)
            if (index !== -1) {
                documents.value[index] = response.data
            }
            if (selectedDocument.value?.id === docId) {
                selectedDocument.value = response.data
            }
            logActivity(`Document updated: ${response.data.title}`, "update")
            return response.data
        } catch (err) {
            error.value = err.message || "Failed to update document"
            console.error("[v0] Update error:", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Actions: Delete document
    const deleteDocument = async (docId) => {
        loading.value = true
        error.value = null
        try {
            await api.delete(`/documents/${docId}`)
            documents.value = documents.value.filter((d) => d.id !== docId)
            if (selectedDocument.value?.id === docId) {
                selectedDocument.value = null
            }
            logActivity(`Document deleted`, "delete")
        } catch (err) {
            error.value = err.message || "Failed to delete document"
            console.error("[v0] Delete error:", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Actions: Rename document
    const renameDocument = async (docId, newTitle) => {
        return updateDocument(docId, { title: newTitle })
    }

    // Actions: Duplicate document
    const duplicateDocument = async (docId) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.post(`/documents/${docId}/duplicate`)
            documents.value.unshift(response.data)
            logActivity(`Document duplicated: ${response.data.title}`, "duplicate")
            return response.data
        } catch (err) {
            error.value = err.message || "Failed to duplicate document"
            console.error("[v0] Duplicate error:", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Actions: Archive document
    const archiveDocument = async (docId) => {
        return updateDocument(docId, { archived: true })
    }

    // Actions: Upload new version
    const uploadNewVersion = async (docId, formData) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.post(`/documents/${docId}/versions`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            const index = documents.value.findIndex((d) => d.id === docId)
            if (index !== -1) {
                documents.value[index] = response.data
            }
            if (selectedDocument.value?.id === docId) {
                selectedDocument.value = response.data
            }
            logActivity(`New version uploaded for document`, "version")
            return response.data
        } catch (err) {
            error.value = err.message || "Failed to upload version"
            console.error("[v0] Version upload error:", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Actions: Assign reviewers
    const assignReviewers = async (docId, reviewerIds) => {
        return updateDocument(docId, { reviewerIds })
    }

    // Actions: Update reviewer status
    const updateReviewerStatus = async (docId, reviewerId, status) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.put(`/documents/${docId}/reviewers/${reviewerId}`, { status })
            const index = documents.value.findIndex((d) => d.id === docId)
            if (index !== -1) {
                documents.value[index] = response.data
            }
            if (selectedDocument.value?.id === docId) {
                selectedDocument.value = response.data
            }
            logActivity(`Reviewer status updated to: ${status}`, "review")
            return response.data
        } catch (err) {
            error.value = err.message || "Failed to update reviewer status"
            console.error("[v0] Reviewer status error:", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Actions: Add comment
    const addComment = async (docId, comment) => {
        loading.value = true
        error.value = null
        try {
            const response = await api.post(`/documents/${docId}/comments`, { text: comment })
            const index = documents.value.findIndex((d) => d.id === docId)
            if (index !== -1) {
                documents.value[index] = response.data
            }
            if (selectedDocument.value?.id === docId) {
                selectedDocument.value = response.data
            }
            logActivity(`Comment added to document`, "comment")
            return response.data
        } catch (err) {
            error.value = err.message || "Failed to add comment"
            console.error("[v0] Comment error:", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Actions: Batch operations
    const batchArchive = async () => {
        loading.value = true
        error.value = null
        try {
            await api.post("/documents/batch/archive", { docIds: selectedDocuments.value })
            documents.value = documents.value.map((doc) =>
                selectedDocuments.value.includes(doc.id) ? { ...doc, archived: true } : doc,
            )
            selectedDocuments.value = []
            logActivity(`${batchActionCount.value} documents archived`, "batch")
        } catch (err) {
            error.value = err.message || "Failed to archive documents"
            console.error("[v0] Batch archive error:", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const batchDelete = async () => {
        loading.value = true
        error.value = null
        try {
            await api.post("/documents/batch/delete", { docIds: selectedDocuments.value })
            documents.value = documents.value.filter((doc) => !selectedDocuments.value.includes(doc.id))
            selectedDocuments.value = []
            logActivity(`${batchActionCount.value} documents deleted`, "batch")
        } catch (err) {
            error.value = err.message || "Failed to delete documents"
            console.error("[v0] Batch delete error:", err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Actions: Selection management
    const selectDocument = (docId) => {
        const doc = documents.value.find((d) => d.id === docId)
        selectedDocument.value = doc || null
    }

    const toggleDocumentSelection = (docId) => {
        const index = selectedDocuments.value.indexOf(docId)
        if (index > -1) {
            selectedDocuments.value.splice(index, 1)
        } else {
            selectedDocuments.value.push(docId)
        }
    }

    const selectAllDocuments = () => {
        selectedDocuments.value = filteredDocuments.value.map((d) => d.id)
    }

    const clearSelection = () => {
        selectedDocuments.value = []
    }

    // Actions: Filter management
    const setFilters = (newFilters) => {
        filters.value = { ...filters.value, ...newFilters }
    }

    const clearFilters = () => {
        filters.value = {
            search: "",
            type: "",
            reviewer: "",
            status: "",
            dateRange: { start: null, end: null },
        }
    }

    const setSortBy = (sortOption) => {
        sortBy.value = sortOption
    }

    const setViewMode = (mode) => {
        viewMode.value = mode
    }

    // Actions: Activity logging
    const logActivity = (message, type = "info") => {
        activityLog.value.unshift({
            id: Date.now(),
            message,
            type,
            timestamp: new Date().toISOString(),
        })
        // Keep only last 100 activities
        if (activityLog.value.length > 100) {
            activityLog.value.pop()
        }
    }

    // Actions: Clear error
    const clearError = () => {
        error.value = null
    }

    return {
        // State
        documents,
        selectedDocument,
        selectedDocuments,
        loading,
        error,
        activityLog,
        filters,
        sortBy,
        viewMode,

        // Computed
        filteredDocuments,
        reviewerProgress,
        recentActivity,
        batchActionCount,

        // Actions
        fetchDocuments,
        uploadDocument,
        updateDocument,
        deleteDocument,
        renameDocument,
        duplicateDocument,
        archiveDocument,
        uploadNewVersion,
        assignReviewers,
        updateReviewerStatus,
        addComment,
        batchArchive,
        batchDelete,
        selectDocument,
        toggleDocumentSelection,
        selectAllDocuments,
        clearSelection,
        setFilters,
        clearFilters,
        setSortBy,
        setViewMode,
        logActivity,
        clearError,
    }
})
