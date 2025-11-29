<template>
    <AuthDesign page-title="Reset Password" :hero-image="hero" :artist="artist">
        <div class="mx-auto w-full max-w-md">
            <!-- Header -->
            <div class="mb-8 text-center sm:text-left">
                <h1 class="text-3xl font-heading font-bold text-abyss-900 dark:text-platinum-50 mb-2">
                    Set New Password
                </h1>
                <p class="text-platinum-600 dark:text-platinum-400">
                    Choose a strong password you haven’t used before.
                </p>
            </div>

            <!-- Card -->
            <div
                class="bg-white dark:bg-abyss-800 rounded-xl p-6 sm:p-8 border border-sun-200 dark:border-abyss-700 shadow-sm">
                <form @submit.prevent="submit" class="space-y-5">

                    <!-- Email (Read-only usually, or strictly typed) -->
                    <div>
                        <label
                            class="block text-sm font-medium text-abyss-900 dark:text-platinum-100 mb-1.5">Email</label>
                        <input v-model.trim="email" type="email" class="w-full px-4 py-3 rounded-lg border border-platinum-300 dark:border-abyss-600 
                                   bg-platinum-50 dark:bg-abyss-900/50 text-abyss-900 dark:text-platinum-50
                                   placeholder-platinum-400 dark:placeholder-platinum-500
                                   focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500
                                   transition-all duration-200" placeholder="you@example.com" required />
                        <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
                    </div>

                    <!-- New Password -->
                    <div>
                        <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-100 mb-1.5">New
                            Password</label>
                        <input v-model="password" type="password" class="w-full px-4 py-3 rounded-lg border border-platinum-300 dark:border-abyss-600 
                                   bg-platinum-50 dark:bg-abyss-900/50 text-abyss-900 dark:text-platinum-50
                                   placeholder-platinum-400 dark:placeholder-platinum-500
                                   focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500
                                   transition-all duration-200" placeholder="••••••••" required />
                        <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
                    </div>

                    <!-- Confirm Password -->
                    <div>
                        <label class="block text-sm font-medium text-abyss-900 dark:text-platinum-100 mb-1.5">Confirm
                            Password</label>
                        <input v-model="password_confirmation" type="password" class="w-full px-4 py-3 rounded-lg border border-platinum-300 dark:border-abyss-600 
                                   bg-platinum-50 dark:bg-abyss-900/50 text-abyss-900 dark:text-platinum-50
                                   placeholder-platinum-400 dark:placeholder-platinum-500
                                   focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500
                                   transition-all duration-200" placeholder="••••••••" required />
                    </div>

                    <button type="submit" :disabled="loading"
                        class="w-full py-3 px-4 bg-kaitoke-green-600 text-white font-semibold rounded-lg 
                               hover:bg-kaitoke-green-700 focus:ring-4 focus:ring-kaitoke-green-500/30
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                        <span v-if="!loading">Reset password</span>
                        <span v-else class="flex items-center gap-2">
                            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Resetting...
                        </span>
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <router-link :to="{ name: 'login' }"
                        class="text-sm font-medium text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:underline decoration-2 underline-offset-2 transition-all">
                        &larr; Back to login
                    </router-link>
                </div>
            </div>
        </div>
    </AuthDesign>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from "@stores/auth";
import AuthDesign from '@components/ui/auth_design.vue'
import { useToast } from '@/utils/useToast';

const hero = "/illustrations_1.jpg";
const artist = "Charlie Davis";

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore();
const toast = useToast();

const token = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')

const loading = ref(false)
const errors = ref({ email: '', password: '' })

onMounted(() => {
    token.value = route.query.token?.toString() || ''
    email.value = route.query.email?.toString() || ''
})

async function submit() {
    errors.value = { email: '', password: '' }
    loading.value = true

    try {
        await authStore.performPasswordReset({
            token: token.value,
            email: email.value,
            password: password.value,
            password_confirmation: password_confirmation.value,
        })

        toast.success('Password updated! Redirecting to login...');

        setTimeout(() => router.push({ name: 'login' }), 1500)
    } catch (e) {
        const data = e?.response?.data
        if (data?.errors) {
            errors.value.email = data.errors.email?.[0] || ''
            errors.value.password = data.errors.password?.[0] || ''
        }

        const msg = data?.message || 'Reset failed. Please check the link and try again.';
        // Only show general toast if it's not a specific field error, or always show it
        if (!data?.errors) {
            toast.error(msg);
        }
    } finally {
        loading.value = false
    }
}
</script>