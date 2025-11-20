<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '@/utils/api' // Your existing axios instance
import {
    X, Copy, Check, Globe, Lock, Users, Calendar, Download,
    Eye, AlertCircle, Share2, RefreshCw, Trash2, Shield,
    Clock, Activity, ChevronDown, ChevronUp, Plus, Loader2
} from 'lucide-vue-next'

const props = defineProps({
    document: { type: Object, required: true },
    organizationId: { type: Number, required: true }
})

const emit = defineEmits(['close', 'updated'])

/* ===========================
    State
=========================== */
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const successMsg = ref('')
const copied = ref(false)

const shareData = ref(null)
const accessLevel = ref('org_only')
const password = ref('')
const showPassword = ref(false)
const expiresAt = ref('')
const maxDownloads = ref(null)
const allowedIps = ref([])
const newIp = ref('')

const showStats = ref(false)
const showLogs = ref(false)
const stats = ref(null)
const logs = ref([])
const logsLoading = ref(false)

/* ===========================
    Computed
=========================== */
const shareUrl = computed(() => {
    if (!shareData.value?.share_token) return ''
    const baseUrl = window.location.origin
    return `${baseUrl}/api/share/${shareData.value.share_token}`
})

const fullShareUrl = computed(() => {
    if (!shareUrl.value) return ''
    if (password.value && accessLevel.value !== 'org_only') {
        return `${shareUrl.value}?password=${encodeURIComponent(password.value)}`
    }
    return shareUrl.value
})

const isPublicAccess = computed(() =>
    ['link', 'public'].includes(accessLevel.value)
)

const canShare = computed(() =>
    accessLevel.value !== 'org_only'
)

const hasChanges = computed(() => {
    if (!shareData.value) return true
    return shareData.value.access_level !== accessLevel.value ||
        Boolean(password.value) ||
        expiresAt.value !== (shareData.value.expires_at || '') ||
        maxDownloads.value !== shareData.value.max_downloads
})

/* ===========================
    API Functions
=========================== */
async function loadShareConfig() {
    loading.value = true
    error.value = ''
    try {
        // FIX: Prepend with /org/{organizationId}/ to satisfy backend middleware
        const { data } = await api.get(`/org/${props.organizationId}/storage/documents/${props.document.id}/share`)
        shareData.value = data
        accessLevel.value = data.access_level || 'org_only'
        expiresAt.value = data.expires_at ? formatDateForInput(data.expires_at) : ''
        maxDownloads.value = data.max_downloads || null
    } catch (e) {
        if (e.response?.status === 404) {
            // No share config yet, that's fine
            shareData.value = null
        } else {
            error.value = e.response?.data?.message || 'Failed to load share settings'
        }
    } finally {
        loading.value = false
    }
}

async function updateShare() {
    saving.value = true
    error.value = ''
    successMsg.value = ''

    try {
        const payload = {
            access_level: accessLevel.value,
            expires_at: expiresAt.value || null,
            max_downloads: maxDownloads.value || null,
            password: password.value || null,
            allowed_ips: allowedIps.value.length > 0 ? allowedIps.value : null
        }

        // FIX: Prepend with /org/{organizationId}/ to satisfy backend middleware
        const { data } = await api.patch(
            `/org/${props.organizationId}/storage/documents/${props.document.id}/share`,
            payload
        )

        shareData.value = data.share
        successMsg.value = 'Share settings updated successfully'
        emit('updated', data.share)

        // Clear password field after saving
        password.value = ''

        setTimeout(() => successMsg.value = '', 3000)
    } catch (e) {
        error.value = e.response?.data?.message || 'Failed to update share settings'
    } finally {
        saving.value = false
    }
}

async function revokeShare() {
    if (!confirm('Are you sure you want to revoke this share link? It will no longer be accessible.')) {
        return
    }

    saving.value = true
    error.value = ''

    try {
        // FIX: Prepend with /org/{organizationId}/ to satisfy backend middleware
        await api.post(`/org/${props.organizationId}/storage/documents/${props.document.id}/share/revoke`)

        accessLevel.value = 'org_only'
        password.value = ''
        expiresAt.value = ''
        maxDownloads.value = null
        allowedIps.value = []

        successMsg.value = 'Share link revoked successfully'
        emit('updated', null)

        setTimeout(() => successMsg.value = '', 3000)
    } catch (e) {
        error.value = e.response?.data?.message || 'Failed to revoke share'
    } finally {
        saving.value = false
    }
}

async function loadStats() {
    if (!shareData.value) return

    try {
        // FIX: Prepend with /org/{organizationId}/ to satisfy backend middleware
        const { data } = await api.get(
            `/org/${props.organizationId}/storage/documents/${props.document.id}/share/stats`
        )
        stats.value = data
    } catch (e) {
        console.error('Failed to load stats:', e)
    }
}

async function loadLogs() {
    if (!shareData.value) return

    logsLoading.value = true
    try {
        // FIX: Prepend with /org/{organizationId}/ to satisfy backend middleware
        const { data } = await api.get(
            `/org/${props.organizationId}/storage/documents/${props.document.id}/share/logs`,
            { params: { limit: 20 } }
        )
        logs.value = data.data || []
    } catch (e) {
        console.error('Failed to load logs:', e)
    } finally {
        logsLoading.value = false
    }
}

/* ===========================
    Helper Functions
=========================== */
function formatDateForInput(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toISOString().slice(0, 16)
}

function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString()
}

function copyToClipboard() {
    navigator.clipboard.writeText(fullShareUrl.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
}

function addIp() {
    const ip = newIp.value.trim()
    if (!ip) return

    // Simple IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipRegex.test(ip)) {
        error.value = 'Invalid IP address format'
        return
    }

    if (!allowedIps.value.includes(ip)) {
        allowedIps.value.push(ip)
    }
    newIp.value = ''
    error.value = ''
}

function removeIp(ip) {
    allowedIps.value = allowedIps.value.filter(i => i !== ip)
}

function getLogTypeColor(type) {
    if (type.includes('invalid') || type.includes('denied') || type.includes('exceeded')) {
        return 'text-red-600 dark:text-red-400'
    }
    if (type.includes('downloaded')) {
        return 'text-blue-600 dark:text-blue-400'
    }
    return 'text-green-600 dark:text-green-400'
}

/* ===========================
    Lifecycle
=========================== */
onMounted(() => {
    loadShareConfig()
})

watch(showStats, (show) => {
    if (show && !stats.value) {
        loadStats()
    }
})

watch(showLogs, (show) => {
    if (show && logs.value.length === 0) {
        loadLogs()
    }
})
</script>

<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="emit('close')">
        <div
            class="bg-white dark:bg-abyss-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-abyss-700 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">

            <div class="px-6 py-4 border-b border-gray-200 dark:border-abyss-700 bg-gray-50 dark:bg-abyss-900">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 rounded-xl">
                            <Share2 class="h-5 w-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-800 dark:text-platinum-100">Share Document</h3>
                            <p class="text-sm text-gray-600 dark:text-platinum-400 truncate max-w-md">{{ document.title
                            }}</p>
                        </div>
                    </div>
                    <button @click="emit('close')"
                        class="p-2 hover:bg-gray-200 dark:hover:bg-abyss-700 rounded-xl transition">
                        <X class="h-5 w-5 text-gray-600 dark:text-platinum-400" />
                    </button>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto px-6 py-4 space-y-6">

                <div v-if="loading" class="flex items-center justify-center py-12">
                    <Loader2 class="h-8 w-8 animate-spin text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                </div>

                <template v-else>
                    <div v-if="successMsg"
                        class="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-900/50 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                        <Check class="h-4 w-4" />
                        {{ successMsg }}
                    </div>

                    <div v-if="error"
                        class="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-900/50 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                        <AlertCircle class="h-4 w-4" />
                        {{ error }}
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-gray-800 dark:text-platinum-100 mb-3">Access
                            Level</label>
                        <div class="space-y-2">
                            <label class="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition"
                                :class="accessLevel === 'org_only' ? 'border-kaitoke-green-500 bg-kaitoke-green-50 dark:bg-kaitoke-green-900/20' : 'border-gray-200 dark:border-abyss-700 hover:border-gray-300 dark:hover:border-abyss-600'">
                                <input type="radio" v-model="accessLevel" value="org_only" class="mt-1" />
                                <div class="flex-1">
                                    <div
                                        class="flex items-center gap-2 font-medium text-gray-800 dark:text-platinum-100">
                                        <Lock class="h-4 w-4 text-gray-600 dark:text-platinum-400" />
                                        Organization Only
                                    </div>
                                    <p class="text-xs text-gray-600 dark:text-platinum-400 mt-1">Only members of your
                                        organization can access</p>
                                </div>
                            </label>

                            <label class="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition"
                                :class="accessLevel === 'link' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-abyss-700 hover:border-gray-300 dark:hover:border-abyss-600'">
                                <input type="radio" v-model="accessLevel" value="link" class="mt-1" />
                                <div class="flex-1">
                                    <div
                                        class="flex items-center gap-2 font-medium text-gray-800 dark:text-platinum-100">
                                        <Share2 class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        Anyone with Link
                                    </div>
                                    <p class="text-xs text-gray-600 dark:text-platinum-400 mt-1">Anyone with the link
                                        can access</p>
                                </div>
                            </label>

                            <label class="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition"
                                :class="accessLevel === 'public' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-abyss-700 hover:border-gray-300 dark:hover:border-abyss-600'">
                                <input type="radio" v-model="accessLevel" value="public" class="mt-1" />
                                <div class="flex-1">
                                    <div
                                        class="flex items-center gap-2 font-medium text-gray-800 dark:text-platinum-100">
                                        <Globe class="h-4 w-4 text-green-600 dark:text-green-400" />
                                        Public
                                    </div>
                                    <p class="text-xs text-gray-600 dark:text-platinum-400 mt-1">Publicly accessible,
                                        indexed by search engines</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div v-if="isPublicAccess && shareUrl"
                        class="bg-gray-50 dark:bg-abyss-900 rounded-xl p-4 border border-gray-200 dark:border-abyss-700">
                        <label class="block text-sm font-semibold text-gray-800 dark:text-platinum-100 mb-2">Share
                            Link</label>
                        <div class="flex items-center gap-2">
                            <input :value="fullShareUrl" readonly
                                class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-sm text-gray-800 dark:text-platinum-100" />
                            <button @click="copyToClipboard"
                                class="px-4 py-2.5 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 rounded-xl text-white font-semibold transition flex items-center gap-2">
                                <component :is="copied ? Check : Copy" class="h-4 w-4" />
                                {{ copied ? 'Copied!' : 'Copy' }}
                            </button>
                        </div>
                    </div>

                    <div v-if="isPublicAccess" class="space-y-4">
                        <h4 class="text-sm font-semibold text-gray-800 dark:text-platinum-100 flex items-center gap-2">
                            <Shield class="h-4 w-4" />
                            Security Settings
                        </h4>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">Password
                                Protection (Optional)</label>
                            <div class="relative">
                                <input v-model="password" :type="showPassword ? 'text' : 'password'"
                                    placeholder="Enter password to protect link"
                                    class="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-gray-800 dark:text-platinum-100" />
                                <button @click="showPassword = !showPassword" type="button"
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-platinum-400">
                                    <component :is="showPassword ? Eye : Lock" class="h-4 w-4" />
                                </button>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-platinum-500 mt-1">Recipients will need to enter
                                this password to access</p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">Link
                                Expiry (Optional)</label>
                            <input v-model="expiresAt" type="datetime-local"
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-gray-800 dark:text-platinum-100" />
                            <p class="text-xs text-gray-500 dark:text-platinum-500 mt-1">Link will expire after this
                                date</p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">Download
                                Limit (Optional)</label>
                            <input v-model.number="maxDownloads" type="number" min="1" placeholder="Unlimited"
                                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-gray-800 dark:text-platinum-100" />
                            <p class="text-xs text-gray-500 dark:text-platinum-500 mt-1">Maximum number of times this
                                file can be downloaded</p>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-platinum-300 mb-2">IP
                                Whitelist (Optional)</label>
                            <div class="flex gap-2 mb-2">
                                <input v-model="newIp" type="text" placeholder="Enter IP address (e.g., 192.168.1.1)"
                                    @keyup.enter="addIp"
                                    class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 text-gray-800 dark:text-platinum-100" />
                                <button @click="addIp" type="button"
                                    class="px-4 py-2.5 bg-gray-200 dark:bg-abyss-700 hover:bg-gray-300 dark:hover:bg-abyss-600 rounded-xl font-medium transition">
                                    <Plus class="h-4 w-4" />
                                </button>
                            </div>
                            <div v-if="allowedIps.length > 0" class="flex flex-wrap gap-2">
                                <div v-for="ip in allowedIps" :key="ip"
                                    class="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm">
                                    {{ ip }}
                                    <button @click="removeIp(ip)" type="button" class="hover:text-red-600">
                                        <X class="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-platinum-500 mt-1">Only these IPs can access the
                                link</p>
                        </div>
                    </div>

                    <div v-if="shareData && canShare" class="border-t border-gray-200 dark:border-abyss-700 pt-4">
                        <button @click="showStats = !showStats"
                            class="flex items-center justify-between w-full text-left">
                            <h4
                                class="text-sm font-semibold text-gray-800 dark:text-platinum-100 flex items-center gap-2">
                                <Activity class="h-4 w-4" />
                                Share Statistics
                            </h4>
                            <component :is="showStats ? ChevronUp : ChevronDown"
                                class="h-4 w-4 text-gray-600 dark:text-platinum-400" />
                        </button>

                        <div v-if="showStats && stats" class="mt-4 grid grid-cols-2 gap-4">
                            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                                    <Eye class="h-4 w-4" />
                                    <span class="text-xs font-medium">Total Views</span>
                                </div>
                                <p class="text-2xl font-bold text-gray-800 dark:text-platinum-100">{{ stats.total_views
                                    || 0 }}</p>
                            </div>

                            <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <div class="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                                    <Download class="h-4 w-4" />
                                    <span class="text-xs font-medium">Downloads</span>
                                </div>
                                <p class="text-2xl font-bold text-gray-800 dark:text-platinum-100">{{
                                    stats.total_downloads || 0 }}</p>
                            </div>

                            <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <div class="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                                    <Users class="h-4 w-4" />
                                    <span class="text-xs font-medium">Unique Viewers</span>
                                </div>
                                <p class="text-2xl font-bold text-gray-800 dark:text-platinum-100">{{
                                    stats.unique_viewers || 0 }}</p>
                            </div>

                            <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                <div class="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                                    <AlertCircle class="h-4 w-4" />
                                    <span class="text-xs font-medium">Failed Attempts</span>
                                </div>
                                <p class="text-2xl font-bold text-gray-800 dark:text-platinum-100">{{
                                    stats.failed_attempts || 0 }}</p>
                            </div>

                            <div v-if="stats.last_accessed"
                                class="col-span-2 p-4 bg-gray-50 dark:bg-abyss-900 rounded-xl">
                                <div class="flex items-center gap-2 text-gray-600 dark:text-platinum-400 mb-1">
                                    <Clock class="h-4 w-4" />
                                    <span class="text-xs font-medium">Last Accessed</span>
                                </div>
                                <p class="text-sm text-gray-800 dark:text-platinum-100">{{
                                    formatDate(stats.last_accessed) }}</p>
                            </div>
                        </div>
                    </div>

                    <div v-if="shareData && canShare" class="border-t border-gray-200 dark:border-abyss-700 pt-4">
                        <button @click="showLogs = !showLogs; if (!showLogs) loadLogs()"
                            class="flex items-center justify-between w-full text-left">
                            <h4
                                class="text-sm font-semibold text-gray-800 dark:text-platinum-100 flex items-center gap-2">
                                <Activity class="h-4 w-4" />
                                Recent Activity (Last 20)
                            </h4>
                            <component :is="showLogs ? ChevronUp : ChevronDown"
                                class="h-4 w-4 text-gray-600 dark:text-platinum-400" />
                        </button>

                        <div v-if="showLogs" class="mt-4 max-h-60 overflow-y-auto space-y-2">
                            <div v-if="logsLoading" class="flex items-center justify-center py-8">
                                <Loader2
                                    class="h-6 w-6 animate-spin text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                            </div>

                            <div v-else-if="logs.length === 0"
                                class="text-center py-8 text-gray-500 dark:text-platinum-500 text-sm">
                                No activity yet
                            </div>

                            <div v-else v-for="log in logs" :key="log.id"
                                class="p-3 bg-gray-50 dark:bg-abyss-900 rounded-xl border border-gray-200 dark:border-abyss-700">
                                <div class="flex items-start justify-between gap-2">
                                    <div class="flex-1">
                                        <p class="text-sm font-medium" :class="getLogTypeColor(log.type)">
                                            {{ log.type.replace(/_/g, ' ').toUpperCase() }}
                                        </p>
                                        <p class="text-xs text-gray-600 dark:text-platinum-400 mt-1">
                                            IP: {{ log.ip_address }}
                                        </p>
                                    </div>
                                    <span class="text-xs text-gray-500 dark:text-platinum-500">
                                        {{ formatDate(log.created_at) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <div
                class="px-6 py-4 border-t border-gray-200 dark:border-abyss-700 bg-gray-50 dark:bg-abyss-900 flex items-center justify-between gap-3">
                <button v-if="canShare && shareData" @click="revokeShare" :disabled="saving"
                    class="px-4 py-2.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl text-red-700 dark:text-red-400 font-semibold transition flex items-center gap-2 disabled:opacity-50">
                    <Trash2 class="h-4 w-4" />
                    Revoke Link
                </button>

                <div class="flex gap-3 ml-auto">
                    <button @click="emit('close')" type="button"
                        class="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-abyss-600 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 transition font-medium">
                        Cancel
                    </button>
                    <button @click="updateShare" :disabled="saving || !hasChanges"
                        class="px-5 py-2.5 bg-kaitoke-green-600 hover:bg-kaitoke-green-700 disabled:opacity-50 rounded-xl text-white font-semibold transition flex items-center gap-2">
                        <component :is="saving ? Loader2 : Check" class="h-4 w-4" :class="{ 'animate-spin': saving }" />
                        {{ saving ? 'Saving...' : 'Save Changes' }}
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>