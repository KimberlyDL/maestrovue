<template>
    <!-- Optional minimal loader (can be empty if you want no visuals) -->
    <div class="flex min-h-screen items-center justify-center bg-abyss-900 text-platinum-100">
        <span>Processing invitation...</span>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/api'

const route = useRoute()
const router = useRouter()

onMounted(async () => {
    const code = route.query.code
    if (!code) {
        // No code in URL → redirect to home
        return router.replace({ name: 'Home' })
    }

    try {
        await axios.post('/api/organizations/join/invite', { code })
        // Optionally use toast/snackbar here
        router.replace({ name: 'orgs.requests' }) // Redirect to your My Join Requests page
    } catch (error) {
        console.error('Join failed:', error)
        router.replace({ name: 'home' }) // Redirect somewhere safe
    }
})
</script>
