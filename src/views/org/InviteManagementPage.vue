<!-- src\views\org\InviteManagementPage.vue -->
<template>
    <div class="min-h-screen bg-slate-900 p-6">
        <div class="max-w-6xl mx-auto">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-white mb-2">Invite Management</h1>
                <p class="text-slate-400">Create and manage invite links for club members</p>
            </div>

            <!-- Create Invite Section -->
            <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
                <h2 class="text-xl font-semibold text-white mb-4">Create New Invite</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Member Email</label>
                        <input v-model="newInvite.email" type="email" placeholder="member@example.com"
                            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Position</label>
                        <select v-model="newInvite.position"
                            class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                            <option value="">Select position</option>
                            <option value="member">Member</option>
                            <option value="coordinator">Coordinator</option>
                            <option value="manager">Manager</option>
                            <option value="officer">Officer</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button @click="createInvite" :disabled="isCreating"
                            class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors">
                            {{ isCreating ? 'Creating...' : 'Create Invite' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Active Invites -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold text-white mb-4">Active Invites</h2>
                <div class="space-y-3">
                    <div v-for="invite in activeInvites" :key="invite.id"
                        class="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                        <div class="flex-1">
                            <p class="text-white font-medium">{{ invite.email }}</p>
                            <p class="text-slate-400 text-sm">Position: {{ invite.position }}</p>
                            <p class="text-slate-500 text-xs mt-1">Created {{ formatDate(invite.createdAt) }}</p>
                        </div>
                        <div class="flex gap-2">
                            <button @click="copyInviteLink(invite.code)"
                                class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
                                Copy Link
                            </button>
                            <button @click="revokeInvite(invite.id)"
                                class="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors">
                                Revoke
                            </button>
                        </div>
                    </div>

                    <div v-if="activeInvites.length === 0" class="text-center py-8">
                        <p class="text-slate-400">No active invites</p>
                    </div>
                </div>
            </div>

            <!-- Expired/Used Invites -->
            <div>
                <h2 class="text-xl font-semibold text-white mb-4">Invite History</h2>
                <div class="space-y-3">
                    <div v-for="invite in expiredInvites" :key="invite.id"
                        class="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between opacity-60">
                        <div class="flex-1">
                            <p class="text-white font-medium">{{ invite.email }}</p>
                            <p class="text-slate-400 text-sm">
                                {{ invite.status === 'used' ? 'Joined' : 'Expired' }} - {{ formatDate(invite.expiresAt)
                                }}
                            </p>
                        </div>
                        <span :class="[
                            'px-3 py-1 rounded-full text-sm font-medium',
                            invite.status === 'used' && 'bg-green-900/30 text-green-400',
                            invite.status === 'expired' && 'bg-slate-700 text-slate-400'
                        ]">
                            {{ invite.status.charAt(0).toUpperCase() + invite.status.slice(1) }}
                        </span>
                    </div>

                    <div v-if="expiredInvites.length === 0" class="text-center py-8">
                        <p class="text-slate-400">No invite history</p>
                    </div>
                </div>
            </div>

            <!-- Copy Notification -->
            <div v-if="copyNotification"
                class="fixed bottom-4 right-4 px-4 py-3 bg-green-600 text-white rounded-lg shadow-lg">
                {{ copyNotification }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const newInvite = ref({
    email: '',
    position: ''
})

const isCreating = ref(false)
const copyNotification = ref('')

const invites = ref([
    {
        id: 1,
        email: 'alice@example.com',
        position: 'Member',
        code: 'ABC12345',
        status: 'active',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000)
    },
    {
        id: 2,
        email: 'bob@example.com',
        position: 'Coordinator',
        code: 'XYZ98765',
        status: 'active',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000)
    },
    {
        id: 3,
        email: 'charlie@example.com',
        position: 'Member',
        code: 'DEF45678',
        status: 'used',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
        id: 4,
        email: 'diana@example.com',
        position: 'Officer',
        code: 'GHI11111',
        status: 'expired',
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
])

const activeInvites = computed(() => {
    return invites.value.filter(i => i.status === 'active')
})

const expiredInvites = computed(() => {
    return invites.value.filter(i => i.status !== 'active')
})

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const createInvite = () => {
    if (!newInvite.value.email || !newInvite.value.position) {
        return
    }

    isCreating.value = true
    console.log('[v0] Creating invite:', newInvite.value)

    setTimeout(() => {
        const newCode = Math.random().toString(36).substring(2, 10).toUpperCase()
        const invite = {
            id: invites.value.length + 1,
            email: newInvite.value.email,
            position: newInvite.value.position,
            code: newCode,
            status: 'active',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
        invites.value.unshift(invite)
        newInvite.value = { email: '', position: '' }
        isCreating.value = false
    }, 500)
}

const copyInviteLink = (code) => {
    const inviteUrl = `${window.location.origin}/join-club?invite=${code}`
    navigator.clipboard.writeText(inviteUrl)
    copyNotification.value = 'Invite link copied to clipboard!'
    setTimeout(() => {
        copyNotification.value = ''
    }, 3000)
}

const revokeInvite = (inviteId) => {
    console.log('[v0] Revoking invite:', inviteId)
    invites.value = invites.value.filter(i => i.id !== inviteId)
}
</script>
