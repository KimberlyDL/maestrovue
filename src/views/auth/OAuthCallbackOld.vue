<!-- src/views/auth/OAuthCallback.vue -->
<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-center">
    <h2 class="text-2xl font-semibold mb-4">Completing sign-in...</h2>

    <!-- Optional status display -->
    <p v-if="error" class="text-red-600">OAuth failed: {{ error }}</p>
    <p v-else-if="state" class="text-gray-500">Exchanging code for token...</p>
    <p v-else class="text-gray-500">Please wait...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api, { setAuthToken } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

// Declare reactive values so Vue knows about them
const state = ref('')
const error = ref('')

onMounted(async () => {
  try {
    const fragment = window.location.hash || ''
    const params = new URLSearchParams(fragment.replace(/^#/, ''))

    const code = params.get('code')
    error.value = params.get('error') || ''

    if (error.value) {
      console.error('OAuth error:', error.value)
      return router.replace({ name: 'login', query: { error: error.value } })
    }

    if (!code) {
      return router.replace({ name: 'login', query: { error: 'missing_code' } })
    }

    state.value = 'exchanging'

    const { data } = await api.post('/api/oauth/exchange', { code })
    const token = data?.token
    if (!token) throw new Error('No token in response')

    setAuthToken(token)
    await auth.fetchUser()

    router.replace({ name: 'admin.dashboard' });

  } catch (err) {
    console.error('OAuth exchange failed:', err)
    router.replace({ name: 'login', query: { error: 'exchange_failed' } })
  }
})
</script>
