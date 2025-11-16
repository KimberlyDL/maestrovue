<template>
    <div class="space-y-6">
        <div>
            <MyRequests :requests="myRequests" :loading="loadingRequests" @cancel-request="handleCancelRequest" />
            <div v-if="!loadingRequests && myRequests.length === 0"
                class="p-6 bg-sun-50 dark:bg-abyss-800 border border-sun-200 dark:border-abyss-700 rounded-lg text-center text-abyss-700 dark:text-platinum-400">
                You have no outstanding join requests.
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/api'
import { useToast } from '@/utils/useToast'
import MyRequests from '@components/user/MyRequests.vue'

const toast = useToast()

// Data
const myRequests = ref([])

// Loading states
const loadingRequests = ref(false)

// Load data
onMounted(async () => {
    await loadMyRequests()
})

async function loadMyRequests() {
    loadingRequests.value = true
    try {
        const { data } = await axios.get('/api/organizations/my-requests')
        myRequests.value = data
    } catch (error) {
        console.error('Failed to load requests:', error)
        toast.error('Failed to load your join requests')
        myRequests.value = []
    } finally {
        loadingRequests.value = false
    }
}

// Actions
async function handleCancelRequest(requestId) {
    if (!confirm('Are you sure you want to cancel this join request?')) {
        return
    }

    try {
        await axios.delete(`/api/organizations/requests/${requestId}`)
        // Remove the cancelled request from the list
        myRequests.value = myRequests.value.filter(req => req.id !== requestId)
        toast.success('Request cancelled successfully')
    } catch (error) {
        console.error('Failed to cancel request:', error)
        const message = error.response?.data?.message || 'Failed to cancel request'
        toast.error(message)
    }
}
</script>