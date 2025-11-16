<!-- Updated page styling to support light and dark mode -->
<template>
    <div class="space-y-6">
        <div>
            <MyRequests :requests="myRequests" :loading="loadingRequests" @cancel-request="cancelRequest" />
            <!-- Updated empty state styling for light and dark mode -->
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
import MyRequests from '@components/user/MyRequests.vue'

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
        // TODO: Create this endpoint in backend
        const { data } = await axios.get('/api/organizations/my-requests')
        myRequests.value = data
    } catch (error) {
        console.error('Failed to load requests:', error)
        // Mock data for now
        myRequests.value = []
    } finally {
        loadingRequests.value = false
    }
}

// Actions
async function cancelRequest(requestId) {
    try {
        await axios.delete(`/api/organizations/requests/${requestId}`)
        // Remove the cancelled request or reload the list
        myRequests.value = myRequests.value.filter(req => req.id !== requestId)
        alert('Request cancelled successfully.')
    } catch (error) {
        alert('Failed to cancel request')
    }
}
</script>
