<!-- src/pages/auth/ForgotPassword.vue -->
<template>
    <AuthDesign page-title="Forgot Password" :hero-image="hero" :artist="artist">
        <div class="mx-auto w-full max-w-md bg-white/80 dark:bg-abyss-900/80 rounded-2xl p-6 shadow">
            <h1 class="text-xl font-semibold text-abyss-900 dark:text-white mb-2">Forgot your password?</h1>
            <p class="text-sm text-abyss-500 dark:text-platinum-300 mb-6">
                Enter your email and we’ll send you a password reset link.
            </p>

            <form @submit.prevent="submit" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Email</label>
                    <input v-model.trim="email" type="email"
                        class="w-full rounded-xl border border-platinum-300/60 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-400"
                        placeholder="you@example.com" required />
                    <p v-if="fieldError" class="mt-1 text-sm text-red-600">{{ fieldError }}</p>
                </div>

                <button type="submit" :disabled="loading"
                    class="w-full rounded-xl px-4 py-2 font-medium bg-kaitoke-green-600 text-white hover:bg-kaitoke-green-700 disabled:opacity-60">
                    {{ loading ? 'Sending…' : 'Email me a reset link' }}
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
import { ref } from 'vue'
import api from '@/utils/api'  
import { useAuthStore } from "@stores/auth";             // your configured axios instance
import AuthDesign from '@components/ui/auth_design.vue'
import { useRouter } from "vue-router";

const hero = "/illustrations_1.jpg"; // optional
const artist = "Charlie Davis";

const router = useRouter();
const authStore = useAuthStore();

const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')
const fieldError = ref('')

async function submit() {
    message.value = ''
    error.value = ''
    fieldError.value = ''
    loading.value = true
    try {
        await authStore.requestPasswordReset(email.value );
        message.value = 'If that email exists, a reset link has been sent.'
        email.value = ''
    } catch (e) {

        console.log(e);
        const data = e?.response?.data
        // If you return validation errors as { errors: { email: ['...'] } }
        fieldError.value = data?.errors?.email?.[0] || ''
        error.value = data?.message || 'Something went wrong. Please try again.'
    } finally {
        loading.value = false
    }
}
</script>
