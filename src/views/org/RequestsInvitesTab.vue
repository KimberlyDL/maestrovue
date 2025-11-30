<template>
    <div class="max-w-5xl mx-auto space-y-6 p-6">
        <div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                <MailOpen class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Join Requests & Invites
            </h2>
            <p class="text-gray-500 dark:text-platinum-500 text-sm">Review membership requests and manage invite codes</p>
        </div>

        <div class="border-b border-gray-200 dark:border-abyss-700">
            <nav class="-mb-px flex gap-6">
                <button @click="activeTab = 'requests'" :class="[
                    'pb-3 border-b-2 text-base font-semibold transition-colors flex items-center gap-2',
                    activeTab === 'requests'
                        ? 'border-kaitoke-green-600 text-gray-800 dark:text-platinum-50'
                        : 'border-transparent text-gray-500 dark:text-platinum-400 hover:text-gray-800 dark:hover:text-platinum-50'
                ]">
                    <Users class="w-5 h-5" /> Requests
                    <span class="ml-1 text-xs rounded-full px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium">
                        {{ stats.pendingRequests }}
                    </span>
                </button>
                <button @click="activeTab = 'invites'" :class="[
                    'pb-3 border-b-2 text-base font-semibold transition-colors flex items-center gap-2',
                    activeTab === 'invites'
                        ? 'border-kaitoke-green-600 text-gray-800 dark:text-platinum-50'
                        : 'border-transparent text-gray-500 dark:text-platinum-400 hover:text-gray-800 dark:hover:text-platinum-50'
                ]">
                    <Key class="w-5 h-5" /> Invite Code
                </button>
            </nav>
        </div>

        <div v-if="activeTab === 'requests'">
            <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-5 mb-6">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1 relative">
                        <Search class="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-platinum-600" />
                        <input v-model="requestFilters.search" type="text" placeholder="Search by name or email..."
                            class="w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 placeholder-gray-400 dark:placeholder-platinum-600 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600" />
                    </div>
                    <select v-model="requestFilters.status"
                        class="md:w-auto w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="declined">Declined</option>
                    </select>
                </div>
            </div>

            <div class="space-y-4">
                <div v-for="request in filteredRequests" :key="request.id"
                    class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-6 hover:border-kaitoke-green-600/30 dark:hover:border-abyss-600 transition-all duration-200">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-start gap-4">
                            <div
                                class="w-12 h-12 rounded-full bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 flex items-center justify-center text-kaitoke-green-700 dark:text-kaitoke-green-300 font-semibold text-xl flex-shrink-0">
                                {{ request.user_name.charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800 dark:text-platinum-50">{{ request.user_name }}</h3>
                                <p class="text-gray-500 dark:text-platinum-400 text-sm">{{ request.user_email }}</p>
                            </div>
                        </div>
                        <div class="text-right flex-shrink-0">
                            <span :class="[
                                'px-3 py-1 rounded-full text-sm font-medium',
                                request.status === 'pending' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
                                request.status === 'approved' && 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
                                request.status === 'declined' && 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                            ]">
                                {{ request.status.charAt(0).toUpperCase() + request.status.slice(1) }}
                            </span>
                             <p class="text-gray-500 dark:text-platinum-500 text-xs mt-1">Submitted {{ formatDateTime(request.created_at) }}</p>
                        </div>
                    </div>

                    <div v-if="request.message" class="mb-4 p-3 bg-gray-50 dark:bg-abyss-900 rounded-lg border border-gray-200 dark:border-abyss-600">
                        <p class="text-gray-700 dark:text-platinum-300 text-sm italic">{{ request.message }}</p>
                    </div>

                    <div v-if="request.status === 'pending'" class="flex gap-4 pt-2">
                        <button @click="approveRequest(request)" :disabled="isProcessing"
                            class="flex-1 py-2.5 px-4 bg-kaitoke-green-600 hover:bg-kaitoke-green-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                            <Check class="w-4 h-4" /> Approve
                        </button>
                        <button @click="declineRequest(request)" :disabled="isProcessing"
                            class="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                            <X class="w-4 h-4" /> Decline
                        </button>
                    </div>
                </div>

                <div v-if="filteredRequests.length === 0" class="text-center py-12 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700">
                    <p class="text-gray-500 dark:text-platinum-500 text-lg">No requests found.</p>
                </div>
            </div>
        </div>

        <div v-else>
            <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-6">
                <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-50 mb-5 flex items-center gap-2">
                    <Key class="w-5 h-5" /> Organization Invite Code
                </h3>

                <div v-if="inviteCode" class="space-y-4">
                    <div>
                        <label class="block text-sm text-gray-500 dark:text-platinum-400 mb-2 font-medium">Current Code</label>
                        <div class="flex gap-3">
                            <input :value="inviteCode" readonly
                                class="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 font-mono text-lg select-all" />
                            <button @click="copyInviteCode"
                                class="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 transition-colors flex items-center gap-2 font-medium">
                                <Copy class="w-4 h-4" /> Copy Code
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm text-gray-500 dark:text-platinum-400 mb-2 font-medium">Shareable Invite URL</label>
                        <div class="flex gap-3">
                            <input :value="inviteUrl" readonly
                                class="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 text-sm select-all" />
                            <button @click="copyInviteUrl"
                                class="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 transition-colors flex items-center gap-2 font-medium">
                                <Copy class="w-4 h-4" /> Copy URL
                            </button>
                        </div>
                    </div>

                    <div class="flex gap-3 pt-3 border-t border-gray-200 dark:border-abyss-700">
                        <button @click="generateNewCode" :disabled="isGenerating"
                            class="px-5 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 disabled:opacity-50 text-white font-medium flex items-center gap-2">
                            <RotateCcw class="w-4 h-4" /> {{ isGenerating ? 'Generating...' : 'Generate New Code' }}
                        </button>
                        <button @click="confirmRemoveCode" :disabled="isRemoving"
                            class="px-5 py-2.5 rounded-xl border border-rose-400/50 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 disabled:opacity-50 font-medium transition-colors flex items-center gap-2">
                            <Trash2 class="w-4 h-4" /> {{ isRemoving ? 'Removing...' : 'Remove Code' }}
                        </button>
                    </div>
                </div>

                <div v-else class="text-center py-10">
                    <Key class="w-10 h-10 text-gray-400 dark:text-platinum-600 mx-auto mb-4" />
                    <p class="text-gray-600 dark:text-platinum-400 mb-6 text-lg">No invite code is currently active. </p>
                    <button @click="generateNewCode" :disabled="isGenerating"
                        class="px-6 py-3 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 disabled:opacity-50 text-white font-semibold flex items-center gap-2 mx-auto">
                        <Key class="w-5 h-5" /> {{ isGenerating ? 'Generating...' : 'Generate Invite Code' }}
                    </button>
                </div>

                <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700/40 rounded-lg">
                    <p class="text-blue-700 dark:text-blue-300 text-sm font-medium flex items-start gap-2">
                        <Info class="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Anyone with this invite code can join your organization directly. Share it carefully!</span>
                    </p>
                </div>
            </div>
        </div>

        <transition name="fade">
            <div v-if="toast"
                class="fixed bottom-6 right-6 px-5 py-3 bg-kaitoke-green-600 text-white font-medium rounded-xl flex items-center gap-2">
                <CheckCircle class="w-5 h-5" /> {{ toast }}
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/utils/api'
import { MailOpen, Users, Key, Check, X, Copy, RotateCcw, Trash2, CheckCircle, Info, Search } from 'lucide-vue-next'

const props = defineProps({
    organizationId: { type: [String, Number], required: true }
})

const activeTab = ref('requests')
const requests = ref([])
const inviteCode = ref(null)
const isProcessing = ref(false)
const isGenerating = ref(false)
const isRemoving = ref(false)
const toast = ref('')

const requestFilters = ref({
    search: '',
    status: 'all'
})

const stats = computed(() => ({
    pendingRequests: requests.value.filter(r => r.status === 'pending').length
}))

const filteredRequests = computed(() => {
    let result = [...requests.value]

    if (requestFilters.value.search) {
        const q = requestFilters.value.search.toLowerCase()
        result = result.filter(r =>
            r.user_name.toLowerCase().includes(q) ||
            r.user_email.toLowerCase().includes(q)
        )
    }

    if (requestFilters.value.status !== 'all') {
        result = result.filter(r => r.status === requestFilters.value.status)
    }

    return result
})

const inviteUrl = computed(() => {
    if (!inviteCode.value) return ''
    const baseUrl = window.location.host.startsWith('localhost') ? `http://${window.location.host}` : `https://${window.location.host}`;
    return `${baseUrl}/join?code=${inviteCode.value}`
})

onMounted(async () => {
    await Promise.all([
        loadRequests(),
        loadInviteCode()
    ])
})

async function loadRequests() {
    try {
        const { data } = await axios.get(`/api/org/${props.organizationId}/join-requests`, {
            params: { status: 'all' }
        })

        requests.value = data
    } catch (error) {
        console.error('Failed to load requests:', error)
        showToast('Failed to load join requests')
    }
}

async function loadInviteCode() {
    try {
        const { data } = await axios.get(`/api/org/${props.organizationId}/dashboard`)
        inviteCode.value = data.organization.invite_code
    } catch (error) {
        console.error('Failed to load invite code:', error)
    }
}

async function approveRequest(request) {
    if (!confirm(`Approve ${request.user_name}'s request to join?`)) return

    isProcessing.value = true
    try {
        await axios.post(`/api/org/${props.organizationId}/join-requests/${request.id}/approve`, {
            role: 'member'
        })
        await loadRequests()
        showToast('Request approved successfully')
    } catch (error) {
        console.error('Failed to approve request:', error)
        showToast(error.response?.data?.message || 'Failed to approve request')
    } finally {
        isProcessing.value = false
    }
}

async function declineRequest(request) {
    const note = prompt(`Why are you declining ${request.user_name}'s request?`, 'Thank you for your interest.')
    if (note === null) return // User clicked cancel on prompt

    isProcessing.value = true
    try {
        await axios.post(`/api/org/${props.organizationId}/join-requests/${request.id}/decline`, {
            admin_note: note
        })
        await loadRequests()
        showToast('Request declined')
    } catch (error) {
        console.error('Failed to decline request:', error)
        showToast('Failed to decline request')
    } finally {
        isProcessing.value = false
    }
}

async function generateNewCode() {
    if (inviteCode.value && !confirm('Generate a new invite code? The current code will stop working.')) return

    isGenerating.value = true
    try {
        const { data } = await axios.post(`/api/org/${props.organizationId}/generate-invite`)
        inviteCode.value = data.invite_code
        showToast('Invite code generated successfully')
    } catch (error) {
        console.error('Failed to generate code:', error)
        showToast('Failed to generate invite code')
    } finally {
        isGenerating.value = false
    }
}

async function confirmRemoveCode() {
    if (!confirm('Remove the invite code? No one will be able to join using this code.')) return

    isRemoving.value = true
    try {
        await axios.delete(`/api/org/${props.organizationId}/remove-invite`)
        inviteCode.value = null
        showToast('Invite code removed')
    } catch (error) {
        console.error('Failed to remove code:', error)
        showToast('Failed to remove invite code')
    } finally {
        isRemoving.value = false
    }
}

function copyInviteCode() {
    navigator.clipboard.writeText(inviteCode.value)
    showToast('Invite code copied to clipboard')
}

function copyInviteUrl() {
    navigator.clipboard.writeText(inviteUrl.value)
    showToast('Invite URL copied to clipboard')
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

function showToast(message) {
    toast.value = message
    setTimeout(() => {
        toast.value = ''
    }, 3000)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease-in-out;
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(10px);
}
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>