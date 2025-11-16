<!-- src/pages/auth/ResetPassword.vue -->
<template>
    <AuthDesign page-title="Reset Password" :hero-image="hero" :artist="artist">
        <div class="mx-auto w-full max-w-md bg-white/80 dark:bg-abyss-900/80 rounded-2xl p-6 shadow">
            <h1 class="text-xl font-semibold text-abyss-900 dark:text-white mb-2">Set a new password</h1>
            <p class="text-sm text-abyss-500 dark:text-platinum-300 mb-6">
                Choose a strong password you haven’t used before.
            </p>

            <form @submit.prevent="submit" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Email</label>
                    <input v-model.trim="email" type="email"
                        class="w-full rounded-xl border border-platinum-300/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-400"
                        placeholder="you@example.com" required />
                    <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-1">New Password</label>
                    <input v-model="password" type="password"
                        class="w-full rounded-xl border border-platinum-300/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-400"
                        required />
                    <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
                </div>

                <div>
                    <label class="block text-sm font-medium mb-1">Confirm Password</label>
                    <input v-model="password_confirmation" type="password"
                        class="w-full rounded-xl border border-platinum-300/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-400"
                        required />
                </div>

                <button type="submit" :disabled="loading"
                    class="w-full rounded-xl px-4 py-2 font-medium bg-kaitoke-green-600 text-white hover:bg-kaitoke-green-700 disabled:opacity-60">
                    {{ loading ? 'Resetting…' : 'Reset password' }}
                </button>

                <p v-if="message" class="text-sm text-kaitoke-green-700 mt-2">{{ message }}</p>
                <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>

                <router-link :to="{ name: 'login' }"
                    class="block text-center text-sm text-abyss-600 dark:text-platinum-200 hover:underline mt-4">
                    Back to login
                </router-link>
            </form>
        </div>
    </AuthDesign>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from "@stores/auth";
import api from '@/utils/api'
import AuthDesign from '@components/ui/auth_design.vue'

const hero = "/illustrations_1.jpg";
const artist = "Charlie Davis";

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore();

const token = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')

const loading = ref(false)
const message = ref('')
const error = ref('')
const errors = ref({ email: '', password: '' })

onMounted(() => {
    token.value = route.query.token?.toString() || ''
    email.value = route.query.email?.toString() || ''
})

async function submit() {
    message.value = ''
    error.value = ''
    errors.value = { email: '', password: '' }
    loading.value = true
    try {
        await authStore.performPasswordReset({
            token: token.value,
            email: email.value,
            password: password.value,
            password_confirmation: password_confirmation.value,
        })
        message.value = 'Password updated! You can now log in.'
        setTimeout(() => router.push({ name: 'Login' }), 1200)
    } catch (e) {
        const data = e?.response?.data
        errors.value.email = data?.errors?.email?.[0] || ''
        errors.value.password = data?.errors?.password?.[0] || ''
        error.value = data?.message || 'Reset failed. Please check the link and try again.'
    } finally {
        loading.value = false
    }
}
</script>
