<template>
    <div class="space-y-8">
        <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-8 shadow-xl">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-xl font-semibold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                        <Cog class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> General Settings
                    </h2>
                    <p class="text-gray-500 dark:text-platinum-500 text-sm mt-1">Manage organization name, URL slug, and basic information</p>
                </div>
                <button v-if="!isEditing" @click="startEditing"
                    class="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-abyss-700 border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-600 transition-colors shadow-sm flex items-center gap-2">
                    <Pencil class="w-4 h-4" /> Edit Settings
                </button>
                <div v-else class="flex gap-3">
                    <button @click="cancelEditing"
                        class="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-abyss-700 border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-600 transition-colors shadow-sm flex items-center gap-2">
                        <X class="w-4 h-4" /> Cancel
                    </button>
                    <button @click="saveSettings" :disabled="isSaving"
                        class="px-5 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-medium disabled:opacity-50 transition-colors shadow-md hover:shadow-lg flex items-center gap-2">
                        <Save class="w-4 h-4" /> {{ isSaving ? 'Saving...' : 'Save Changes' }}
                    </button>
                </div>
            </div>

            <div class="space-y-6">
                <div class="border-b border-gray-100 dark:border-abyss-700 pb-4">
                    <label class="block text-sm text-gray-700 dark:text-platinum-400 mb-1 font-medium">Organization Name *</label>
                    <input v-if="isEditing" v-model="form.name" type="text"
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner" />
                    <p v-else class="text-lg text-gray-800 dark:text-platinum-50">{{ organization?.name }}</p>
                </div>

                <div class="border-b border-gray-100 dark:border-abyss-700 pb-4">
                    <label class="block text-sm text-gray-700 dark:text-platinum-400 mb-1 font-medium">URL Slug *</label>
                    <div v-if="isEditing" class="flex items-center gap-2">
                        <span class="text-gray-500 dark:text-platinum-500 font-mono text-lg">/org/</span>
                        <input v-model="form.slug" type="text"
                            class="flex-1 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner"
                            pattern="[a-z0-9-]+" />
                    </div>
                    <p v-else class="text-lg text-gray-800 dark:text-platinum-50 font-mono">/org/{{ organization?.slug }}</p>
                    <p class="text-gray-500 dark:text-platinum-600 text-xs mt-1">Only lowercase letters, numbers, and hyphens allowed</p>
                </div>

                <div class="border-b border-gray-100 dark:border-abyss-700 pb-4">
                    <label class="block text-sm text-gray-700 dark:text-platinum-400 mb-1 font-medium">Description</label>
                    <textarea v-if="isEditing" v-model="form.description" rows="3"
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner resize-none"></textarea>
                    <p v-else class="text-gray-800 dark:text-platinum-50 text-sm whitespace-pre-wrap">{{ organization?.description || 'No description provided.' }}</p>
                </div>

                <div>
                    <label class="block text-sm text-gray-700 dark:text-platinum-400 mb-1 font-medium">Website</label>
                    <input v-if="isEditing" v-model="form.website" type="url" placeholder="https://example.com"
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner" />
                    <a v-else-if="organization?.website" :href="organization.website" target="_blank"
                        class="text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:underline flex items-center gap-1 text-sm">{{ organization.website }} <ExternalLink class="w-4 h-4" /></a>
                    <p v-else class="text-gray-500 dark:text-platinum-500 text-sm">No website</p>
                </div>
            </div>

            <p v-if="saveError" class="mt-4 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-1"><AlertTriangle class="w-4 h-4" /> {{ saveError }}</p>
        </div>

        <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-8 shadow-xl">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-platinum-50 mb-6 flex items-center gap-2">
                <Zap class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Access Control
            </h2>

            <div class="space-y-4">
                <div class="flex items-start justify-between py-3 border-b border-gray-200 dark:border-abyss-700">
                    <div class="max-w-md">
                        <div class="text-gray-800 dark:text-platinum-50 font-medium">Auto-Accept Join Requests with Invite Code</div>
                        <div class="text-gray-500 dark:text-platinum-500 text-sm mt-1">Automatically accept users who join with valid invite code</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input v-model="settings.auto_accept_invites" type="checkbox" class="sr-only peer"
                            @change="updateSetting('auto_accept_invites', settings.auto_accept_invites)">
                        <div
                            class="w-11 h-6 bg-gray-300 dark:bg-abyss-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kaitoke-green-600 shadow-inner">
                        </div>
                    </label>
                </div>

                <div class="flex items-start justify-between py-3 border-b border-gray-200 dark:border-abyss-700">
                    <div class="max-w-md">
                        <div class="text-gray-800 dark:text-platinum-50 font-medium">Public Organization Profile</div>
                        <div class="text-gray-500 dark:text-platinum-500 text-sm mt-1">Allow non-members to view organization details</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input v-model="settings.public_profile" type="checkbox" class="sr-only peer"
                            @change="updateSetting('public_profile', settings.public_profile)">
                        <div
                            class="w-11 h-6 bg-gray-300 dark:bg-abyss-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kaitoke-green-600 shadow-inner">
                        </div>
                    </label>
                </div>

                <div class="flex items-start justify-between py-3">
                    <div class="max-w-md">
                        <div class="text-gray-800 dark:text-platinum-50 font-medium">Allow Members to Generate Invite Codes</div>
                        <div class="text-gray-500 dark:text-platinum-500 text-sm mt-1">Let regular members generate their own invite codes</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input v-model="settings.member_can_invite" type="checkbox" class="sr-only peer"
                            @change="updateSetting('member_can_invite', settings.member_can_invite)">
                        <div
                            class="w-11 h-6 bg-gray-300 dark:bg-abyss-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kaitoke-green-600 shadow-inner">
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-8 shadow-xl">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-platinum-50 mb-6 flex items-center gap-2">
                <Shield class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Data & Privacy
            </h2>

            <div class="space-y-6">
                <div class="pb-4 border-b border-gray-200 dark:border-abyss-700">
                    <button @click="exportData" :disabled="isExporting"
                        class="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-abyss-700 border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-600 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2 font-medium">
                        <Download class="w-4 h-4" /> {{ isExporting ? 'Exporting...' : 'Export Organization Data' }}
                    </button>
                    <p class="text-gray-500 dark:text-platinum-500 text-sm mt-2">Download all organization data including members,
                        documents, and activity logs (JSON format)</p>
                </div>

                <div class="pt-2">
                    <div class="text-gray-800 dark:text-platinum-50 font-medium mb-2">Activity Log Retention</div>
                    <select v-model="settings.log_retention_days"
                        class="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner"
                        @change="updateSetting('log_retention_days', parseInt(settings.log_retention_days))">
                        <option :value="30">30 days</option>
                        <option :value="90">90 days</option>
                        <option :value="180">6 months</option>
                        <option :value="365">1 year</option>
                        <option :value="3650">Unlimited (10 years)</option>
                    </select>
                    <p class="text-gray-500 dark:text-platinum-500 text-sm mt-2">How long to keep activity logs before automatic deletion.</p>
                </div>
            </div>
        </div>

        <div class="bg-rose-50 dark:bg-rose-900/10 border border-rose-400 dark:border-rose-700/50 rounded-xl p-8 shadow-2xl">
            <h2 class="text-xl font-semibold text-rose-700 dark:text-rose-400 mb-6 flex items-center gap-2">
                <AlertTriangle class="w-5 h-5" /> Danger Zone
            </h2>

            <div class="space-y-6">
                <div class="flex items-center justify-between pb-4 border-b border-rose-300 dark:border-rose-700/30">
                    <div>
                        <div class="text-gray-800 dark:text-platinum-50 font-medium">Transfer Ownership</div>
                        <div class="text-gray-500 dark:text-platinum-500 text-sm mt-1">Transfer organization admin rights to another member.</div>
                    </div>
                    <button @click="showTransferModal = true"
                        class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-md flex items-center gap-2">
                        <Users class="w-4 h-4" /> Transfer
                    </button>
                </div>

                <div class="flex items-center justify-between pb-4 border-b border-rose-300 dark:border-rose-700/30">
                    <div>
                        <div class="text-gray-800 dark:text-platinum-50 font-medium">Archive Organization</div>
                        <div class="text-gray-500 dark:text-platinum-500 text-sm mt-1">Hide organization from members (can be restored later)</div>
                    </div>
                    <button @click="archiveOrganization"
                        class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-md flex items-center gap-2">
                        <Archive class="w-4 h-4" /> Archive
                    </button>
                </div>

                <div class="flex items-center justify-between pt-2">
                    <div>
                        <div class="text-rose-700 dark:text-rose-400 font-bold">Permanently Delete Organization</div>
                        <div class="text-gray-500 dark:text-platinum-500 text-sm mt-1">This action is irreversible and deletes all data.</div>
                    </div>
                    <button @click="confirmDelete"
                        class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg flex items-center gap-2">
                        <Trash2 class="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showTransferModal" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/70" @click="showTransferModal = false"></div>
            <div class="relative w-full max-w-md rounded-xl border border-amber-400/50 bg-white dark:bg-abyss-900 p-6 shadow-2xl">
                <h3 class="text-xl font-semibold text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
                    <Users class="w-5 h-5" /> Transfer Ownership
                </h3>
                <p class="text-gray-700 dark:text-platinum-300 text-sm mb-5">
                    Select a member to transfer admin rights to. They must accept the transfer.
                </p>

                <div class="mb-4">
                    <label class="block text-sm text-gray-700 dark:text-platinum-400 mb-2 font-medium">Select Member</label>
                    <select v-model="transferData.to_user_id"
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 shadow-inner">
                        <option value="">-- Select a member --</option>
                        <option v-for="member in eligibleMembers" :key="member.id" :value="member.id">
                            {{ member.name }} ({{ member.email }})
                        </option>
                    </select>
                </div>

                <div class="mb-6">
                    <label class="block text-sm text-gray-700 dark:text-platinum-400 mb-2 font-medium">Message (Optional)</label>
                    <textarea v-model="transferData.message" rows="3" placeholder="Add a message for the new owner..."
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 shadow-inner resize-none"></textarea>
                </div>

                <div class="flex justify-end gap-3">
                    <button @click="showTransferModal = false"
                        class="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-abyss-800 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-700 font-medium transition-colors shadow-sm">
                        Cancel
                    </button>
                    <button @click="initiateTransfer" :disabled="!transferData.to_user_id || isTransferring"
                        class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-md flex items-center gap-2">
                        <Send class="w-4 h-4" /> {{ isTransferring ? 'Sending...' : 'Send Transfer Request' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/70" @click="showDeleteModal = false"></div>
            <div class="relative w-full max-w-md rounded-xl border border-rose-400 dark:border-rose-700/50 bg-white dark:bg-abyss-900 p-6 shadow-2xl">
                <h3 class="text-xl font-semibold text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-2">
                    <AlertTriangle class="w-5 h-5" /> Delete Organization?
                </h3>
                <p class="text-gray-700 dark:text-platinum-300 text-sm mb-4">
                    This action <strong class="text-rose-700 dark:text-rose-400">cannot be undone</strong>. This will permanently delete:
                </p>
                <ul class="text-gray-700 dark:text-platinum-400 text-sm mb-4 space-y-1 list-disc list-inside bg-rose-50 dark:bg-abyss-800 p-4 rounded-lg border border-rose-300 dark:border-abyss-700">
                    <li>All members and their roles</li>
                    <li>All documents and versions</li>
                    <li>All announcements</li>
                    <li>All activity logs</li>
                </ul>
                <div class="mb-4">
                    <label class="block text-sm text-gray-700 dark:text-platinum-400 mb-2 font-medium">
                        Type <strong class="text-rose-700 dark:text-platinum-50">{{ organization?.name }}</strong> to confirm:
                    </label>
                    <input v-model="deleteConfirmText" type="text"
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 shadow-inner" />
                </div>
                <div class="flex justify-end gap-3">
                    <button @click="showDeleteModal = false"
                        class="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-abyss-800 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-700 font-medium transition-colors shadow-sm">
                        Cancel
                    </button>
                    <button @click="deleteOrganization" :disabled="deleteConfirmText !== organization?.name"
                        class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-md flex items-center gap-2">
                        <Trash2 class="w-4 h-4" /> Delete Permanently
                    </button>
                </div>
            </div>
        </div>

        <transition name="fade">
            <div v-if="toast"
                class="fixed bottom-6 right-6 px-5 py-3 bg-kaitoke-green-600 text-white font-medium rounded-xl shadow-2xl flex items-center gap-2">
                <CheckCircle class="w-5 h-5" /> {{ toast }}
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/api'
import { Cog, Pencil, X, Save, ExternalLink, Zap, Shield, Download, Users, Archive, Trash2, AlertTriangle, Send, CheckCircle } from 'lucide-vue-next'

const props = defineProps({
    organization: { type: Object, required: true }
})

const emit = defineEmits(['updated'])
const router = useRouter()

// Form state
const isEditing = ref(false)
const isSaving = ref(false)
const saveError = ref('')
const isExporting = ref(false)
const showDeleteModal = ref(false)
const showTransferModal = ref(false)
const deleteConfirmText = ref('')
const isTransferring = ref(false)
const toast = ref('')
const eligibleMembers = ref([])

const form = ref({
    name: '',
    slug: '',
    description: '',
    website: ''
})

const settings = ref({
    auto_accept_invites: false,
    public_profile: true,
    member_can_invite: false,
    log_retention_days: 365
})

const transferData = ref({
    to_user_id: '',
    message: ''
})

watch(() => props.organization, (newOrg) => {
    if (newOrg) {
        form.value = {
            name: newOrg.name || '',
            slug: newOrg.slug || '',
            description: newOrg.description || '',
            website: newOrg.website || ''
        }
        settings.value = {
            auto_accept_invites: newOrg.auto_accept_invites || false,
            public_profile: newOrg.public_profile ?? true,
            member_can_invite: newOrg.member_can_invite || false,
            log_retention_days: newOrg.log_retention_days || 365
        }
    }
}, { immediate: true })

onMounted(async () => {
    await loadEligibleMembers()
})

async function loadEligibleMembers() {
    try {
        const { data } = await axios.get(`/api/org/${props.organization.id}/members`)
        // Filter out current user and only show members/admins
        eligibleMembers.value = data.filter(m => m.id !== props.organization.current_user_id)
    } catch (error) {
        console.error('Failed to load members:', error)
    }
}

function startEditing() {
    isEditing.value = true
    saveError.value = ''
}

function cancelEditing() {
    isEditing.value = false
    form.value = {
        name: props.organization.name || '',
        slug: props.organization.slug || '',
        description: props.organization.description || '',
        website: props.organization.website || ''
    }
}

async function saveSettings() {
    isSaving.value = true
    saveError.value = ''

    try {
        if (!/^[a-z0-9-]+$/.test(form.value.slug)) {
            saveError.value = 'Slug can only contain lowercase letters, numbers, and hyphens'
            isSaving.value = false
            return
        }

        await axios.patch(`/api/org/${props.organization.id}/overview`, form.value)
        isEditing.value = false
        emit('updated')
        showToast('Settings saved successfully')
    } catch (error) {
        console.error('Failed to save settings:', error)
        saveError.value = error.response?.data?.message || 'Failed to save settings'
    } finally {
        isSaving.value = false
    }
}

async function updateSetting(key, value) {
    try {
        await axios.patch(`/api/org/${props.organization.id}/settings`, { [key]: value })
        showToast(`${key.replace(/_/g, ' ')} updated`)
        emit('updated')
    } catch (error) {
        console.error(`Failed to update ${key}:`, error)
        showToast(`Failed to update ${key.replace(/_/g, ' ')}`)
        // Revert the change
        settings.value[key] = !value
    }
}

async function exportData() {
    isExporting.value = true
    try {
        const { data } = await axios.get(`/api/org/${props.organization.id}/export-data`)

        // Convert to JSON and download
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${props.organization.slug}_export_${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)

        showToast('Data exported successfully')
    } catch (error) {
        console.error('Failed to export data:', error)
        showToast('Failed to export data')
    } finally {
        isExporting.value = false
    }
}

async function initiateTransfer() {
    isTransferring.value = true
    try {
        await axios.post(`/api/org/${props.organization.id}/transfer-ownership`, transferData.value)
        showTransferModal.value = false
        transferData.value = { to_user_id: '', message: '' }
        showToast('Transfer request sent successfully')
    } catch (error) {
        console.error('Failed to initiate transfer:', error)
        showToast(error.response?.data?.message || 'Failed to send transfer request')
    } finally {
        isTransferring.value = false
    }
}

async function archiveOrganization() {
    if (!confirm('Archive this organization? Members will no longer be able to access it until restored.')) return

    try {
        await axios.post(`/api/org/${props.organization.id}/archive`)
        showToast('Organization archived successfully')
        setTimeout(() => {
            router.push({ name: 'user.dashboard' })
        }, 1500)
    } catch (error) {
        console.error('Failed to archive organization:', error)
        showToast('Failed to archive organization')
    }
}

function confirmDelete() {
    showDeleteModal.value = true
    deleteConfirmText.value = ''
}

async function deleteOrganization() {
    if (deleteConfirmText.value !== props.organization.name) return

    try {
        await axios.delete(`/api/organizations/${props.organization.id}`)
        showToast('Organization deleted')
        setTimeout(() => {
            router.push({ name: 'user.dashboard' })
        }, 1500)
    } catch (error) {
        console.error('Failed to delete organization:', error)
        showToast('Failed to delete organization')
    } finally {
        showDeleteModal.value = false
    }
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