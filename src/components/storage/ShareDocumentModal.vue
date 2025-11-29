<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from '@/utils/api'
import { useToast } from '@/utils/useToast'
import {
    X, Link2, Copy, CheckCircle, Globe, Users, Lock,
    Calendar, Download, Key, Eye, EyeOff, AlertCircle,
    RefreshCw, TrendingUp, Activity, ExternalLink
} from 'lucide-vue-next'

const props = defineProps({
    document: {
        type: Object,
        required: true
    },
    organizationId: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['close', 'updated'])

const toast = useToast()

// State
const loading = ref(false)
const saving = ref(false)
const share = ref(null)
const copied = ref(false)
const showPassword = ref(false)
const showStats = ref(false)
const stats = ref(null)
const loadingStats = ref(false)

// Form data
const accessLevel = ref('org_only')
const expiresAt = ref('')
const maxDownloads = ref(null)
const password = ref('')
const showAdvanced = ref(false)

// Computed
const shareUrl = computed(() => {
    if (!share.value) return ''
    return share.value.share_url || `${window.location.origin}/share/${share.value.share_token}`
})

const isPubliclyShared = computed(() => {
    return accessLevel.value === 'link' || accessLevel.value === 'public'
})

const accessLevelOptions = [
    {
        value: 'org_only',
        label: 'Organization Only',
        description: 'Only organization members can access',
        icon: Users,
        color: 'blue'
    },
    {
        value: 'link',
        label: 'Anyone with Link',
        description: 'Anyone with the link can access',
        icon: Link2,
        color: 'amber'
    },
    {
        value: 'public',
        label: 'Public',
        description: 'Anyone can find and access',
        icon: Globe,
        color: 'green'
    }
]

const selectedOption = computed(() => {
    return accessLevelOptions.find(opt => opt.value === accessLevel.value)
})

// Methods
async function loadShare() {
    loading.value = true
    try {
        const { data } = await axios.get(
            `/api/org/${props.organizationId}/storage/documents/${props.document.id}/share`
        )
        share.value = data
        accessLevel.value = data.access_level
        expiresAt.value = data.expires_at ? formatDateForInput(data.expires_at) : ''
        maxDownloads.value = data.max_downloads
        // Don't load password from server for security
    } catch (error) {
        console.error('Failed to load share settings:', error)
        toast.error('Failed to load share settings')
    } finally {
        loading.value = false
    }
}

async function updateShare() {
    if (!validateForm()) return

    saving.value = true
    try {
        const payload = {
            access_level: accessLevel.value,
            expires_at: expiresAt.value || null,
            max_downloads: maxDownloads.value || null,
            password: password.value || null,
        }

        const { data } = await axios.patch(
            `/api/org/${props.organizationId}/storage/documents/${props.document.id}/share`,
            payload
        )

        share.value = { ...share.value, ...data.share }
        toast.success('Share settings updated successfully')
        emit('updated', data.share)

        // Clear password field after saving
        password.value = ''
    } catch (error) {
        console.error('Failed to update share:', error)
        const message = error.response?.data?.message || 'Failed to update share settings'
        toast.error(message)
    } finally {
        saving.value = false
    }
}

async function revokeShare() {
    if (!confirm('Are you sure you want to revoke this share link? Anyone with the link will lose access.')) {
        return
    }

    saving.value = true
    try {
        await axios.post(
            `/api/org/${props.organizationId}/storage/documents/${props.document.id}/share/revoke`
        )

        accessLevel.value = 'org_only'
        password.value = ''
        expiresAt.value = ''
        maxDownloads.value = null

        toast.success('Share link revoked successfully')
        await loadShare()
    } catch (error) {
        console.error('Failed to revoke share:', error)
        toast.error('Failed to revoke share link')
    } finally {
        saving.value = false
    }
}

async function copyShareLink() {
    try {
        await navigator.clipboard.writeText(shareUrl.value)
        copied.value = true
        toast.success('Link copied to clipboard')
        setTimeout(() => copied.value = false, 2000)
    } catch (error) {
        console.error('Failed to copy:', error)
        toast.error('Failed to copy link')
    }
}

async function loadStats() {
    loadingStats.value = true
    try {
        const { data } = await axios.get(
            `/api/org/${props.organizationId}/storage/documents/${props.document.id}/share/stats`
        )
        stats.value = data
    } catch (error) {
        console.error('Failed to load stats:', error)
        toast.error('Failed to load statistics')
    } finally {
        loadingStats.value = false
    }
}

function validateForm() {
    if (expiresAt.value) {
        const expiry = new Date(expiresAt.value)
        if (expiry <= new Date()) {
            toast.error('Expiry date must be in the future')
            return false
        }
    }

    if (maxDownloads.value && maxDownloads.value < 1) {
        toast.error('Download limit must be at least 1')
        return false
    }

    if (password.value && password.value.length < 6) {
        toast.error('Password must be at least 6 characters')
        return false
    }

    return true
}

function formatDateForInput(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatDate(dateString) {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
}

function openShareLink() {
    window.open(shareUrl.value, '_blank')
}

// Lifecycle
onMounted(() => {
    loadShare()
})

watch(showStats, (newVal) => {
    if (newVal && !stats.value) {
        loadStats()
    }
})
</script>

<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click.self="$emit('close')">
        <div
            class="bg-white dark:bg-abyss-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-abyss-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200 dark:border-abyss-700 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 rounded-xl">
                        <Link2 class="h-5 w-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-gray-800 dark:text-platinum-100">
                            Share Document
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-platinum-400">
                            {{ document.title }}
                        </p>
                    </div>
                </div>
                <button @click="$emit('close')"
                    class="p-2 hover:bg-gray-100 dark:hover:bg-abyss-700 rounded-xl transition">
                    <X class="h-5 w-5 text-gray-600 dark:text-platinum-400" />
                </button>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-12">
                <RefreshCw class="h-8 w-8 animate-spin text-kaitoke-green-600 dark:text-kaitoke-green-400" />
            </div>

            <!-- Content -->
            <div v-else class="flex-1 overflow-y-auto">
                <div class="p-6 space-y-6">

                    <!-- Access Level Selection -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-800 dark:text-platinum-100 mb-3">
                            Who can access this document?
                        </label>
                        <div class="space-y-2">
                            <button v-for="option in accessLevelOptions" :key="option.value"
                                @click="accessLevel = option.value"
                                class="w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left"
                                :class="[
                                    accessLevel === option.value
                                        ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                                        : 'border-gray-200 dark:border-abyss-700 hover:border-gray-300 dark:hover:border-abyss-600'
                                ]">
                                <component :is="option.icon" class="h-5 w-5 mt-0.5 flex-shrink-0" :class="[
                                    accessLevel === option.value
                                        ? `text-${option.color}-600 dark:text-${option.color}-400`
                                        : 'text-gray-400 dark:text-platinum-600'
                                ]" />
                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <span class="font-semibold text-gray-800 dark:text-platinum-100">
                                            {{ option.label }}
                                        </span>
                                        <CheckCircle v-if="accessLevel === option.value" class="h-4 w-4"
                                            :class="`text-${option.color}-600 dark:text-${option.color}-400`" />
                                    </div>
                                    <p class="text-sm text-gray-600 dark:text-platinum-400 mt-0.5">
                                        {{ option.description }}
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Share Link (only for link/public) -->
                    <div v-if="isPubliclyShared && share" class="space-y-3">
                        <label class="block text-sm font-semibold text-gray-800 dark:text-platinum-100">
                            Share Link
                        </label>
                        <div class="flex gap-2">
                            <input type="text" :value="shareUrl" readonly
                                class="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 text-sm text-gray-800 dark:text-platinum-100 font-mono" />
                            <button @click="copyShareLink"
                                class="px-4 py-3 rounded-xl bg-gray-100 dark:bg-abyss-700 hover:bg-gray-200 dark:hover:bg-abyss-600 transition flex items-center gap-2">
                                <component :is="copied ? CheckCircle : Copy" class="h-4 w-4"
                                    :class="copied ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-platinum-400'" />
                                <span class="text-sm font-medium text-gray-800 dark:text-platinum-100">
                                    {{ copied ? 'Copied!' : 'Copy' }}
                                </span>
                            </button>
                            <button @click="openShareLink"
                                class="px-4 py-3 rounded-xl bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 hover:bg-kaitoke-green-200 dark:hover:bg-kaitoke-green-900/40 transition">
                                <ExternalLink class="h-4 w-4 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            </button>
                        </div>

                        <!-- Warning for public links -->
                        <div v-if="accessLevel !== 'org_only'"
                            class="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                            <AlertCircle class="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <p class="text-sm text-amber-800 dark:text-amber-300">
                                Anyone with this link can access and download the document. Use security options below
                                to restrict access.
                            </p>
                        </div>
                    </div>

                    <!-- Advanced Options -->
                    <div v-if="isPubliclyShared">
                        <button @click="showAdvanced = !showAdvanced"
                            class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-platinum-300 hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition">
                            <Lock class="h-4 w-4" />
                            Security Options
                            <span class="text-xs text-gray-500 dark:text-platinum-500">
                                ({{ showAdvanced ? 'Hide' : 'Show' }})
                            </span>
                        </button>

                        <div v-if="showAdvanced"
                            class="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-abyss-900 rounded-xl border border-gray-200 dark:border-abyss-700">
                            <!-- Password Protection -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-800 dark:text-platinum-100 mb-2">
                                    <div class="flex items-center gap-2">
                                        <Key class="h-4 w-4" />
                                        Password Protection
                                    </div>
                                </label>
                                <div class="relative">
                                    <input v-model="password" :type="showPassword ? 'text' : 'password'"
                                        placeholder="Enter password (optional)"
                                        class="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-sm focus:ring-2 focus:ring-kaitoke-green-500" />
                                    <button type="button" @click="showPassword = !showPassword"
                                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-platinum-600 hover:text-gray-600 dark:hover:text-platinum-400">
                                        <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" />
                                    </button>
                                </div>
                                <p class="text-xs text-gray-500 dark:text-platinum-500 mt-1">
                                    {{ share?.is_password_protected ?
                                    'Currently password protected. Leave blank to keep existing password.' :
                                    'Add a password for extra security' }}
                                </p>
                            </div>

                            <!-- Expiry Date -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-800 dark:text-platinum-100 mb-2">
                                    <div class="flex items-center gap-2">
                                        <Calendar class="h-4 w-4" />
                                        Expiration Date
                                    </div>
                                </label>
                                <input v-model="expiresAt" type="datetime-local"
                                    class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-sm focus:ring-2 focus:ring-kaitoke-green-500" />
                                <p class="text-xs text-gray-500 dark:text-platinum-500 mt-1">
                                    Link will automatically expire after this date
                                </p>
                            </div>

                            <!-- Download Limit -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-800 dark:text-platinum-100 mb-2">
                                    <div class="flex items-center gap-2">
                                        <Download class="h-4 w-4" />
                                        Download Limit
                                    </div>
                                </label>
                                <input v-model.number="maxDownloads" type="number" min="1" max="1000"
                                    placeholder="Unlimited"
                                    class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-sm focus:ring-2 focus:ring-kaitoke-green-500" />
                                <p class="text-xs text-gray-500 dark:text-platinum-500 mt-1">
                                    Maximum number of times this file can be downloaded
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Statistics Toggle -->
                    <div v-if="isPubliclyShared && share">
                        <button @click="showStats = !showStats"
                            class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-platinum-300 hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition">
                            <TrendingUp class="h-4 w-4" />
                            View Statistics
                            <span class="text-xs text-gray-500 dark:text-platinum-500">
                                ({{ showStats ? 'Hide' : 'Show' }})
                            </span>
                        </button>

                        <!-- Statistics Panel -->
                        <div v-if="showStats"
                            class="mt-4 p-4 bg-gray-50 dark:bg-abyss-900 rounded-xl border border-gray-200 dark:border-abyss-700">
                            <div v-if="loadingStats" class="flex items-center justify-center py-8">
                                <RefreshCw
                                    class="h-6 w-6 animate-spin text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            </div>

                            <div v-else-if="stats" class="space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="p-3 bg-white dark:bg-abyss-800 rounded-lg">
                                        <div class="text-2xl font-bold text-gray-800 dark:text-platinum-100">
                                            {{ stats.total_views }}
                                        </div>
                                        <div class="text-xs text-gray-600 dark:text-platinum-400">Total Views</div>
                                    </div>
                                    <div class="p-3 bg-white dark:bg-abyss-800 rounded-lg">
                                        <div class="text-2xl font-bold text-gray-800 dark:text-platinum-100">
                                            {{ stats.total_downloads }}
                                        </div>
                                        <div class="text-xs text-gray-600 dark:text-platinum-400">Downloads</div>
                                    </div>
                                    <div class="p-3 bg-white dark:bg-abyss-800 rounded-lg">
                                        <div class="text-2xl font-bold text-gray-800 dark:text-platinum-100">
                                            {{ stats.unique_viewers }}
                                        </div>
                                        <div class="text-xs text-gray-600 dark:text-platinum-400">Unique Viewers</div>
                                    </div>
                                    <div class="p-3 bg-white dark:bg-abyss-800 rounded-lg">
                                        <div class="text-2xl font-bold text-gray-800 dark:text-platinum-100">
                                            {{ stats.failed_attempts }}
                                        </div>
                                        <div class="text-xs text-gray-600 dark:text-platinum-400">Failed Attempts</div>
                                    </div>
                                </div>

                                <div v-if="stats.remaining_downloads !== null"
                                    class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <div class="text-sm font-medium text-amber-800 dark:text-amber-300">
                                        {{ stats.remaining_downloads }} downloads remaining
                                    </div>
                                </div>

                                <div v-if="stats.last_accessed_at" class="text-xs text-gray-600 dark:text-platinum-400">
                                    Last accessed: {{ formatDate(stats.last_accessed_at) }}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Footer -->
            <div
                class="px-6 py-4 border-t border-gray-200 dark:border-abyss-700 flex items-center justify-between gap-3">
                <button v-if="isPubliclyShared" @click="revokeShare" :disabled="saving"
                    class="px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50">
                    Revoke Link
                </button>
                <div class="flex-1"></div>
                <button @click="$emit('close')" type="button"
                    class="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 transition font-medium">
                    Cancel
                </button>
                <button @click="updateShare" :disabled="saving"
                    class="px-6 py-2.5 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 disabled:opacity-50 rounded-xl text-white font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2">
                    <RefreshCw v-if="saving" class="h-4 w-4 animate-spin" />
                    {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
            </div>

        </div>
    </div>
</template>