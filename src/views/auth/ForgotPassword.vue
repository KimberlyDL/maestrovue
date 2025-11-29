<!-- src/pages/auth/ForgotPassword.vue -->
<template>
    <AuthDesign page-title="Forgot Password" :hero-image="hero" :artist="artist">
        <div class="mx-auto w-full max-w-md">
            <!-- Header -->
            <div class="mb-8 text-center sm:text-left">
                <h1 class="text-3xl font-heading font-bold text-abyss-900 dark:text-platinum-50 mb-2">
                    Forgot Password?
                </h1>
                <p class="text-platinum-600 dark:text-platinum-400">
                    Enter your email and we’ll send you a reset link.
                </p>
            </div>

            <!-- Card -->
            <div
                class="bg-white dark:bg-abyss-800 rounded-xl p-6 sm:p-8 border border-sun-200 dark:border-abyss-700 shadow-sm">
                <form @submit.prevent="submit" class="space-y-5">
                    <div>
                        <label for="email"
                            class="block text-sm font-medium text-abyss-900 dark:text-platinum-100 mb-1.5">
                            Email Address
                        </label>
                        <input id="email" v-model.trim="email" type="email" class="w-full px-4 py-3 rounded-lg border border-platinum-300 dark:border-abyss-600 
                                   bg-platinum-50 dark:bg-abyss-900/50 text-abyss-900 dark:text-platinum-50
                                   placeholder-platinum-400 dark:placeholder-platinum-500
                                   focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500
                                   transition-all duration-200" placeholder="you@example.com" required />
                        <p v-if="fieldError" class="mt-1 text-xs text-red-500">{{ fieldError }}</p>
                    </div>

                    <button type="submit" :disabled="loading"
                        class="w-full py-3 px-4 bg-kaitoke-green-600 text-white font-semibold rounded-lg 
                               hover:bg-kaitoke-green-700 focus:ring-4 focus:ring-kaitoke-green-500/30
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                        <span v-if="!loading">Email me a reset link</span>
                        <span v-else class="flex items-center gap-2">
                            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
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
import { ref } from 'vue'
import { useRouter } from "vue-router";
import { useAuthStore } from "@stores/auth";
import AuthDesign from '@components/ui/auth_design.vue'
import { useToast } from '@/utils/useToast';

const hero = "/illustrations_1.jpg";
const artist = "Charlie Davis";

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const email = ref('')
const loading = ref(false)
const fieldError = ref('')

async function submit() {
    fieldError.value = ''
    loading.value = true

    try {
        await authStore.requestPasswordReset(email.value);
        toast.success('If that email exists, a reset link has been sent.');
        email.value = '';
    } catch (e) {
        const data = e?.response?.data;
        if (data?.errors?.email) {
            fieldError.value = data.errors.email[0];
        } else {
            toast.error(data?.message || 'Something went wrong. Please try again.');
        }
    } finally {
        loading.value = false;
    }
}
</script>