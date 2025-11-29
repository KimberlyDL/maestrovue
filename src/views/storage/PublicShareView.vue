<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useToast } from '@/utils/useToast'
import {
    Download, Lock, AlertCircle, CheckCircle, FileText,
    Calendar, Eye, Building2, Clock, Shield, Loader2,
    Key, ArrowLeft
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// State
const loading = ref(true)
const downloading = ref(false)
const document = ref(null)
const error = ref('')
const passwordRequired = ref(false)
const password = ref('')
const showPassword = ref(false)
const expired = ref(false)

// Computed
const shareToken = computed(() => route.params.token)

const R2_WORKER_ENDPOINT = import.meta.env.VITE_R2_WORKER_ENDPOINT || ''

const orgLogoUrl = computed(() => {
    if (!document.value?.organization?.logo_url) return ''

    const logoPath = document.value.organization.logo_url
    if (typeof logoPath !== 'string') return ''
    if (logoPath.startsWith('http')) return logoPath

    if (!R2_WORKER_ENDPOINT) return ''

    const cleanEndpoint = R2_WORKER_ENDPOINT.replace(/\/$/, '')
    const cleanPath = logoPath.startsWith('/') ? logoPath.slice(1) : logoPath

    return `${cleanEndpoint}/${cleanPath}`
})

const fileIcon = computed(() => {
    if (!document.value) return FileText

    const mimeType = document.value.mime_type || ''

    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️'
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦'

    return FileText
})

// Methods
async function loadDocument() {
    loading.value = true
    error.value = ''
    passwordRequired.value = false
    expired.value = false

    try {
        const url = `${API_BASE_URL}/api/share/${shareToken.value}`
        const params = password.value ? { password: password.value } : {}

        const response = await axios.get(url, { params })
        document.value = response.data
    } catch (err) {
        console.error('Failed to load document:', err)

        if (err.response?.status === 403) {
            if (err.response.data?.password_required) {
                passwordRequired.value = true
                error.value = 'This document is password protected'
            } else if (err.response.data?.expired) {
                expired.value = true
                error.value = 'This share link has expired or been revoked'
            } else {
                error.value = err.response.data?.message || 'Access denied'
            }
        } else if (err.response?.status === 404) {
            error.value = 'Document not found or link is invalid'
        } else if (err.response?.status === 429) {
            error.value = 'Too many attempts. Please try again later.'
        } else {
            error.value = 'Failed to load document. Please try again later.'
        }
    } finally {
        loading.value = false
    }
}

async function downloadDocument() {
    if (!document.value) return

    downloading.value = true

    try {
        const url = `${API_BASE_URL}/api/share/${shareToken.value}/download-url`
        const params = password.value ? { password: password.value } : {}

        const response = await axios.get(url, { params })

        if (response.data?.url) {
            // Trigger download using the temporary URL
            const link = document.createElement('a')
            link.href = response.data.url
            link.download = response.data.filename
            link.style.display = 'none'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success('Download started')
        } else {
            throw new Error('Failed to get download URL')
        }
    } catch (err) {
        console.error('Download failed:', err)

        if (err.response?.status === 403) {
            if (err.response.data?.password_required) {
                passwordRequired.value = true
                toast.error('Invalid password')
            } else {
                toast.error(err.response.data?.message || 'Download not allowed')
            }
        } else {
            toast.error('Failed to download file. Please try again.')
        }
    } finally {
        downloading.value = false
    }
}

function submitPassword() {
    if (!password.value) {
        toast.error('Please enter a password')
        return
    }
    loadDocument()
}

function formatDate(dateString) {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

function goToLogin() {
    router.push('/login')
}

// Lifecycle
onMounted(() => {
    loadDocument()
})
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-platinum-50 to-sun-50 dark:from-abyss-900 dark:to-abyss-800">
        <!-- Header -->
        <div class="bg-white dark:bg-abyss-800 border-b border-gray-200 dark:border-abyss-700 shadow-sm">
            <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 rounded-xl">
                        <Shield class="h-6 w-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-gray-800 dark:text-platinum-100">
                            Secure Document Share
                        </h1>
                        <p class="text-xs text-gray-600 dark:text-platinum-400">
                            Protected file sharing
                        </p>
                    </div>
                </div>
                <button @click="goToLogin"
                    class="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-platinum-300 hover:bg-gray-100 dark:hover:bg-abyss-700 transition">
                    Sign In
                </button>
            </div>
        </div>

        <div class="max-w-4xl mx-auto px-6 py-12">
            <!-- Loading State -->
            <div v-if="loading" class="flex flex-col items-center justify-center py-20">
                <Loader2 class="h-12 w-12 animate-spin text-kaitoke-green-600 dark:text-kaitoke-green-400 mb-4" />
                <p class="text-lg font-medium text-gray-600 dark:text-platinum-400">
                    Loading document...
                </p>
            </div>

            <!-- Error State -->
            <div v-else-if="error && !passwordRequired"
                class="bg-white dark:bg-abyss-800 rounded-2xl shadow-xl border border-gray-200 dark:border-abyss-700 p-8">
                <div class="flex flex-col items-center text-center">
                    <div class="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                        <AlertCircle class="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-platinum-100 mb-2">
                        {{ expired ? 'Link Expired' : 'Access Denied' }}
                    </h2>
                    <p class="text-gray-600 dark:text-platinum-400 mb-6 max-w-md">
                        {{ error }}
                    </p>
                    <button @click="$router.push('/')"
                        class="px-6 py-3 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 rounded-xl text-white font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2">
                        <ArrowLeft class="h-4 w-4" />
                        Go to Home
                    </button>
                </div>
            </div>

            <!-- Password Required -->
            <div v-else-if="passwordRequired"
                class="bg-white dark:bg-abyss-800 rounded-2xl shadow-xl border border-gray-200 dark:border-abyss-700 p-8">
                <div class="max-w-md mx-auto">
                    <div class="flex flex-col items-center text-center mb-6">
                        <div class="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                            <Key class="h-12 w-12 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-platinum-100 mb-2">
                            Password Required
                        </h2>
                        <p class="text-gray-600 dark:text-platinum-400">
                            This document is protected. Please enter the password to access it.
                        </p>
                    </div>

                    <form @submit.prevent="submitPassword" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">
                                Password
                            </label>
                            <div class="relative">
                                <input v-model="password" :type="showPassword ? 'text' : 'password'"
                                    placeholder="Enter password" autofocus
                                    class="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-gray-800 dark:text-platinum-100 focus:ring-2 focus:ring-kaitoke-green-500 focus:border-kaitoke-green-500" />
                                <button type="button" @click="showPassword = !showPassword"
                                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-platinum-600 hover:text-gray-600 dark:hover:text-platinum-400">
                                    <component :is="showPassword ? Eye : Lock" class="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <button type="submit"
                            class="w-full px-6 py-3 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 rounded-xl text-white font-semibold transition shadow-md hover:shadow-lg">
                            Unlock Document
                        </button>
                    </form>
                </div>
            </div>

            <!-- Document Display -->
            <div v-else-if="document"
                class="bg-white dark:bg-abyss-800 rounded-2xl shadow-xl border border-gray-200 dark:border-abyss-700 overflow-hidden">

                <!-- Document Header -->
                <div
                    class="p-8 bg-gradient-to-r from-kaitoke-green-50 to-electric-lime-50 dark:from-kaitoke-green-900/20 dark:to-electric-lime-900/20 border-b border-gray-200 dark:border-abyss-700">
                    <div class="flex items-start gap-6">
                        <!-- File Icon -->
                        <div class="flex-shrink-0">
                            <div
                                class="w-20 h-20 rounded-2xl bg-white dark:bg-abyss-800 shadow-lg flex items-center justify-center text-4xl">
                                <component v-if="typeof fileIcon !== 'string'" :is="fileIcon"
                                    class="h-10 w-10 text-gray-600 dark:text-platinum-400" />
                                <span v-else>{{ fileIcon }}</span>
                            </div>
                        </div>

                        <!-- Document Info -->
                        <div class="flex-1 min-w-0">
                            <h2 class="text-3xl font-bold text-gray-800 dark:text-platinum-100 mb-2 break-words">
                                {{ document.title }}
                            </h2>

                            <p v-if="document.description"
                                class="text-gray-600 dark:text-platinum-400 mb-4 break-words">
                                {{ document.description }}
                            </p>

                            <!-- Organization Info -->
                            <div class="flex items-center gap-3 mb-4">
                                <div v-if="orgLogoUrl"
                                    class="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-abyss-700">
                                    <img :src="orgLogoUrl" :alt="document.organization.name"
                                        class="w-full h-full object-cover" />
                                </div>
                                <div v-else
                                    class="w-10 h-10 rounded-full bg-gradient-to-br from-kaitoke-green-500 to-electric-lime-500 flex items-center justify-center">
                                    <Building2 class="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-800 dark:text-platinum-100">
                                        {{ document.organization.name }}
                                    </p>
                                    <p class="text-xs text-gray-500 dark:text-platinum-500">
                                        Shared by organization
                                    </p>
                                </div>
                            </div>

                            <!-- Download Button -->
                            <button @click="downloadDocument" :disabled="downloading"
                                class="inline-flex items-center gap-2 px-6 py-3 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 disabled:opacity-50 rounded-xl text-white font-semibold transition shadow-lg hover:shadow-xl">
                                <component :is="downloading ? Loader2 : Download" class="h-5 w-5"
                                    :class="{ 'animate-spin': downloading }" />
                                {{ downloading ? 'Downloading...' : 'Download File' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Document Details -->
                <div class="p-8">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-platinum-100 mb-4">
                        File Information
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- File Size -->
                        <div class="flex items-start gap-3">
                            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <FileText class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-600 dark:text-platinum-400">File Size</p>
                                <p class="text-base font-semibold text-gray-800 dark:text-platinum-100">
                                    {{ document.file_size_formatted }}
                                </p>
                            </div>
                        </div>

                        <!-- Upload Date -->
                        <div class="flex items-start gap-3">
                            <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Calendar class="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-600 dark:text-platinum-400">Uploaded</p>
                                <p class="text-base font-semibold text-gray-800 dark:text-platinum-100">
                                    {{ formatDate(document.created_at) }}
                                </p>
                            </div>
                        </div>

                        <!-- Version -->
                        <div v-if="document.latest_version" class="flex items-start gap-3">
                            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-600 dark:text-platinum-400">Version</p>
                                <p class="text-base font-semibold text-gray-800 dark:text-platinum-100">
                                    v{{ document.latest_version.version_number }}
                                </p>
                            </div>
                        </div>

                        <!-- Expiry Info -->
                        <div v-if="document.share_info?.expires_at" class="flex items-start gap-3">
                            <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <Clock class="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-600 dark:text-platinum-400">Link Expires</p>
                                <p class="text-base font-semibold text-gray-800 dark:text-platinum-100">
                                    {{ document.share_info.time_until_expiry ||
                                        formatDate(document.share_info.expires_at) }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Download Limit Warning -->
                    <div v-if="document.share_info?.remaining_downloads !== null"
                        class="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-3">
                        <AlertCircle class="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p class="text-sm font-medium text-amber-800 dark:text-amber-300">
                                Download Limit
                            </p>
                            <p class="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                This file can be downloaded {{ document.share_info.remaining_downloads }} more time(s).
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="px-8 py-4 bg-gray-50 dark:bg-abyss-900 border-t border-gray-200 dark:border-abyss-700">
                    <div class="flex items-center justify-between text-sm text-gray-600 dark:text-platinum-400">
                        <div class="flex items-center gap-2">
                            <Shield class="h-4 w-4" />
                            <span>Secure file sharing powered by Maestro</span>
                        </div>
                        <button @click="goToLogin"
                            class="text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:underline font-medium">
                            Create your own organization →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>