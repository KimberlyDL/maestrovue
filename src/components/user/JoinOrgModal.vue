<!-- src/components/user/JoinOrgModal.vue -->
<template>
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" @click.self="$emit('close')">
        <div class="bg-abyss-800 rounded-lg border border-abyss-700 w-full max-w-md">
            <div class="flex items-center justify-between p-5 border-b border-abyss-700">
                <h3 class="text-xl font-semibold text-platinum-50">Join Organization</h3>
                <button @click="$emit('close')" class="text-platinum-400 hover:text-platinum-50 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="p-5">
                <!-- Tabs -->
                <div class="flex gap-2 mb-5 bg-abyss-900 p-1 rounded-lg">
                    <button @click="activeTab = 'request'" :class="[
                        'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
                        activeTab === 'request'
                            ? 'bg-kaitoke-green-600 text-abyss-900'
                            : 'text-platinum-400 hover:text-platinum-50'
                    ]">
                        Request to Join
                    </button>
                    <button @click="activeTab = 'invite'" :class="[
                        'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
                        activeTab === 'invite'
                            ? 'bg-kaitoke-green-600 text-abyss-900'
                            : 'text-platinum-400 hover:text-platinum-50'
                    ]">
                        Use Invite Code
                    </button>
                </div>

                <!-- Request Form -->
                <form v-if="activeTab === 'request'" @submit.prevent="submitJoinRequest" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-platinum-300 mb-2">Organization Name</label>
                        <input v-model="joinForm.organization_name" type="text" placeholder="Enter organization name"
                            class="w-full px-3 py-2 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 placeholder-platinum-500 focus:border-kaitoke-green-700 focus:outline-none"
                            required />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-platinum-300 mb-2">Message (Optional)</label>
                        <textarea v-model="joinForm.message" rows="3" placeholder="Tell them why you want to join..."
                            class="w-full px-3 py-2 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 placeholder-platinum-500 focus:border-kaitoke-green-700 focus:outline-none"></textarea>
                    </div>

                    <button type="submit" :disabled="isSubmitting"
                        class="w-full py-2 px-4 rounded-md bg-kaitoke-green-600 hover:bg-kaitoke-green-500 disabled:bg-abyss-700 disabled:text-platinum-500 text-abyss-900 font-medium transition-colors">
                        {{ isSubmitting ? 'Submitting...' : 'Send Join Request' }}
                    </button>

                    <div v-if="successMessage"
                        class="p-3 rounded-md bg-green-900/30 border border-green-700/50 text-green-300 text-sm">
                        {{ successMessage }}
                    </div>
                    <div v-if="errorMessage"
                        class="p-3 rounded-md bg-rose-900/30 border border-rose-700/50 text-rose-300 text-sm">
                        {{ errorMessage }}
                    </div>
                </form>

                <!-- Invite Code Form -->
                <form v-if="activeTab === 'invite'" @submit.prevent="submitInviteCode" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-platinum-300 mb-2">Invite Code</label>
                        <input v-model="inviteForm.code" type="text" placeholder="Enter invite code"
                            class="w-full px-3 py-2 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 placeholder-platinum-500 focus:border-kaitoke-green-700 focus:outline-none uppercase tracking-wider"
                            required />
                        <p class="text-xs text-platinum-500 mt-1">Enter the invite code provided by an admin</p>
                    </div>

                    <button type="submit" :disabled="isSubmitting"
                        class="w-full py-2 px-4 rounded-md bg-kaitoke-green-600 hover:bg-kaitoke-green-500 disabled:bg-abyss-700 disabled:text-platinum-500 text-abyss-900 font-medium transition-colors">
                        {{ isSubmitting ? 'Processing...' : 'Join via Invite' }}
                    </button>

                    <div v-if="successMessage"
                        class="p-3 rounded-md bg-green-900/30 border border-green-700/50 text-green-300 text-sm">
                        {{ successMessage }}
                    </div>
                    <div v-if="errorMessage"
                        class="p-3 rounded-md bg-rose-900/30 border border-rose-700/50 text-rose-300 text-sm">
                        {{ errorMessage }}
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from '@/utils/api'

const emit = defineEmits(['close', 'joined'])

const activeTab = ref('request')
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const joinForm = ref({ organization_name: '', message: '' })
const inviteForm = ref({ code: '' })

async function submitJoinRequest() {
    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const { data } = await axios.post('/organizations/join/request', joinForm.value)
        successMessage.value = data.message
        joinForm.value = { organization_name: '', message: '' }

        setTimeout(() => {
            emit('joined')
        }, 1500)
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Failed to submit request.'
    } finally {
        isSubmitting.value = false
    }
}

async function submitInviteCode() {
    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const { data } = await axios.post('/organizations/join/invite', inviteForm.value)
        successMessage.value = data.message
        inviteForm.value.code = ''

        setTimeout(() => {
            emit('joined')
        }, 1500)
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Invalid invite code.'
    } finally {
        isSubmitting.value = false
    }
}
</script>