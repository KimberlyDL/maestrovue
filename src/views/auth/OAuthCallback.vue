<template>
    <div class="flex flex-col items-center justify-center min-h-screen text-center bg-gray-100 dark:bg-abyss-900">

        <LogoAnimation :status="error ? 'error' : 'loading'" />

        <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-platinum-100 mt-6">
            Completing sign-in...
        </h2>

        <p v-if="error" class="text-red-600 dark:text-red-400 font-medium">
            <span v-if="error === 'exchange_failed'">Authentication failed. Redirecting to login.</span>
            <span v-else>OAuth failed: {{ error }}</span>
        </p>
        <p v-else-if="state" class="text-gray-600 dark:text-platinum-400">Exchanging code for token...</p>
        <p v-else class="text-gray-600 dark:text-platinum-400">Please wait...</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// Assuming these are external paths, adjust import path as necessary
import api, { setAuthToken } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import LogoAnimation from '@/components/ui/logo_animation.vue' // Adjust path as needed

const router = useRouter()
const auth = useAuthStore()

const state = ref('')
const error = ref('')

onMounted(async () => {
    try {
        // Read from hash fragment (e.g., #code=xxx or #error=yyy)
        const fragment = window.location.hash || ''
        const params = new URLSearchParams(fragment.replace(/^#/, ''))

        const code = params.get('code')
        error.value = params.get('error') || ''

        if (error.value) {
            console.error('OAuth error:', error.value)
            return router.replace({ name: 'login', query: { error: error.value } })
        }

        if (!code) {
            error.value = 'missing_code'
            return router.replace({ name: 'login', query: { error: 'missing_code' } })
        }

        state.value = 'exchanging'

        // Exchange code for JWT token
        const { data } = await api.post('/api/oauth/exchange', { code })

        const token = data?.token
        if (!token) {
            throw new Error('No token in response')
        }

        // Set the token in axios and localStorage
        setAuthToken(token)

        // Fetch user data
        await auth.fetchUser()

        // Redirect to dashboard
        router.replace({ name: 'home' })

    } catch (err) {
        console.error('OAuth exchange failed:', err)
        error.value = 'exchange_failed'

        // Show error for 2 seconds then redirect
        setTimeout(() => {
            router.replace({ name: 'login', query: { error: 'exchange_failed' } })
        }, 2000)
    }
})
</script>