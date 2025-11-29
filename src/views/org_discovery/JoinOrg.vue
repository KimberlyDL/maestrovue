<template>
    <div class="min-h-screen bg-platinum-50 text-abyss-900 dark:bg-abyss-900 dark:text-platinum-50 py-10">
        <div class="max-w-xl mx-auto px-4">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-abyss-900 dark:text-platinum-50 mb-2">Join an Organization</h1>
                <p class="text-platinum-600 dark:text-platinum-500">Request to join or use an invite code</p>
            </div>

            <div
                class="flex gap-2 mb-6 bg-white dark:bg-abyss-800 p-1 rounded-lg border border-sun-200 dark:border-abyss-700">
                <button @click="activeTab = 'request'" :class="[
                    'flex-1 py-2 px-4 rounded-md font-medium transition-all text-sm',
                    activeTab === 'request'
                        ? 'bg-kaitoke-green-600 text-abyss-900'
                        : 'text-platinum-600 dark:text-platinum-400 hover:text-abyss-900 dark:hover:text-platinum-50'
                ]">
                    Request to Join
                </button>
                <button @click="activeTab = 'invite'" :class="[
                    'flex-1 py-2 px-4 rounded-md font-medium transition-all text-sm',
                    activeTab === 'invite'
                        ? 'bg-kaitoke-green-600 text-abyss-900'
                        : 'text-platinum-600 dark:text-platinum-400 hover:text-abyss-900 dark:hover:text-platinum-50'
                ]">
                    Use Invite Code
                </button>
            </div>

            <div class="bg-white dark:bg-abyss-800 p-6 rounded-lg border border-sun-200 dark:border-abyss-700">
                <form v-if="activeTab === 'request'" @submit.prevent="submitJoinRequest" class="space-y-4">
                    <div>
                        <label for="org-name"
                            class="block text-sm font-medium text-abyss-800 dark:text-platinum-300 mb-2">Organization
                            Name</label>
                        <input id="org-name" v-model="joinForm.organization_name" type="text"
                            placeholder="Enter organization name"
                            class="w-full px-4 py-2 bg-platinum-50 border border-sun-200 rounded-md text-abyss-900 placeholder-platinum-600 focus:outline-none focus:border-kaitoke-green-500 focus:ring-1 focus:ring-kaitoke-green-500 dark:bg-abyss-700 dark:border-abyss-600 dark:text-platinum-50 dark:placeholder-platinum-500"
                            required />
                    </div>

                    <button type="submit" :disabled="isSubmitting"
                        class="w-full py-2 px-4 bg-kaitoke-green-600 hover:bg-kaitoke-green-500 disabled:bg-abyss-700 text-abyss-900 font-medium rounded-md transition-colors disabled:text-platinum-400">
                        {{ isSubmitting ? 'Submitting...' : 'Send Join Request' }}
                    </button>

                    <div v-if="successMessage"
                        class="p-3 bg-kaitoke-green-900/30 border border-kaitoke-green-700 rounded-md text-kaitoke-green-400 text-sm">
                        {{ successMessage }}
                    </div>
                    <div v-if="errorMessage"
                        class="p-3 bg-red-900/30 border border-red-700 rounded-md text-red-400 text-sm">
                        {{ errorMessage }}
                    </div>
                </form>

                <form v-if="activeTab === 'invite'" @submit.prevent="submitInviteCode" class="space-y-4">
                    <div>
                        <label for="invite-code"
                            class="block text-sm font-medium text-abyss-800 dark:text-platinum-300 mb-2">Invite
                            Code</label>
                        <input id="invite-code" v-model="inviteForm.code" type="text" placeholder="Enter invite code"
                            class="w-full px-4 py-2 bg-platinum-50 border border-sun-200 rounded-md text-abyss-900 placeholder-platinum-600 focus:outline-none focus:border-kaitoke-green-500 focus:ring-1 focus:ring-kaitoke-green-500 dark:bg-abyss-700 dark:border-abyss-600 dark:text-platinum-50 dark:placeholder-platinum-500"
                            required />
                    </div>

                    <button type="submit" :disabled="isSubmitting"
                        class="w-full py-2 px-4 bg-kaitoke-green-600 hover:bg-kaitoke-green-500 disabled:bg-abyss-700 text-abyss-900 font-medium rounded-md transition-colors disabled:text-platinum-400">
                        {{ isSubmitting ? 'Processing...' : 'Join via Invite' }}
                    </button>

                    <div v-if="successMessage"
                        class="p-3 bg-kaitoke-green-900/30 border border-kaitoke-green-700 rounded-md text-kaitoke-green-400 text-sm">
                        {{ successMessage }}
                    </div>
                    <div v-if="errorMessage"
                        class="p-3 bg-red-900/30 border border-red-700 rounded-md text-red-400 text-sm">
                        {{ errorMessage }}
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/api'

const router = useRouter()

const activeTab = ref('request')
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const joinForm = ref({ organization_name: '' })
const inviteForm = ref({ code: '' })

/**
 * Submits a request to join an organization by name.
 * Corresponds to the logic from requestJoinOrg in the dashboard.
 */
const submitJoinRequest = async () => {
    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const { data } = await axios.post('/api/organizations/join/request', joinForm.value)

        // Use the alert/message logic from the original dashboard (updated for success message)
        successMessage.value = `Join request sent to ${joinForm.value.organization_name}.`
        joinForm.value.organization_name = '' // Clear form on success

    } catch (error) {
        // Use the error message logic from the original dashboard
        errorMessage.value = error.response?.data?.message || 'Failed to submit request.'
    } finally {
        isSubmitting.value = false
    }
}

/**
 * Attempts to join an organization using an invite code.
 * This is a new method/endpoint compared to the dashboard logic, 
 * but follows the same success/error pattern.
 */
const submitInviteCode = async () => {
    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        // Assuming the backend endpoint for invite code join is: /api/organizations/join/invite
        const { data } = await axios.post('/api/organizations/join/invite', inviteForm.value)

        const orgName = data.organization_name || 'Organization'
        successMessage.value = `Successfully joined ${orgName}!`

        // Navigate to the main organizations list after a successful join,
        // which mimics the functionality of handleOrgJoined in the original dashboard.
        setTimeout(() => {
            router.push({ name: 'orgs.orgs' })
        }, 1500)

    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Invalid invite code or failed to join.'
    } finally {
        isSubmitting.value = false
    }
}
</script>