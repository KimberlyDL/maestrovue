<template>
    <AuthShellSvg page-title="Login" :hero-image="hero" :artist="artist">
        <div class="w-full max-w-md mx-auto">
            <!-- Header Section -->
            <div class="mb-8 text-center sm:text-left">
                <h1 class="text-3xl font-heading font-bold text-abyss-900 dark:text-platinum-50 mb-2">
                    Welcome Back
                </h1>
                <p class="text-platinum-600 dark:text-platinum-400">
                    Sign in to access your organization's document hub.
                </p>
            </div>

            <!-- Main Form Card -->
            <div class="bg-white dark:bg-abyss-800">
                <form @submit.prevent="handleLogin" class="space-y-5">

                    <!-- Email Input -->
                    <div class="space-y-1.5">
                        <label for="email" class="block text-sm font-medium text-abyss-900 dark:text-platinum-100">
                            Email Address
                        </label>
                        <input id="email" v-model.trim="form.email" type="email" placeholder="you@example.com" required
                            class="w-full px-4 py-3 rounded-lg border border-platinum-300 dark:border-abyss-600 
                                   bg-platinum-50 dark:bg-abyss-900/50 text-abyss-900 dark:text-platinum-50
                                   placeholder-platinum-400 dark:placeholder-platinum-500
                                   focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500
                                   transition-all duration-200"
                            :class="{ 'border-red-500 focus:ring-red-500/50 focus:border-red-500': errors.email }" />
                        <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
                    </div>

                    <!-- Password Input -->
                    <div class="space-y-1.5">
                        <div class="flex items-center justify-between">
                            <label for="password"
                                class="block text-sm font-medium text-abyss-900 dark:text-platinum-100">
                                Password
                            </label>
                            <router-link :to="{ name: 'forgotPassword' }"
                                class="text-xs font-medium text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:text-kaitoke-green-700 hover:underline transition-colors">
                                Forgot password?
                            </router-link>
                        </div>
                        <input id="password" v-model="form.password" type="password" placeholder="••••••••" required
                            class="w-full px-4 py-3 rounded-lg border border-platinum-300 dark:border-abyss-600 
                                   bg-platinum-50 dark:bg-abyss-900/50 text-abyss-900 dark:text-platinum-50
                                   placeholder-platinum-400 dark:placeholder-platinum-500
                                   focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500
                                   transition-all duration-200"
                            :class="{ 'border-red-500 focus:ring-red-500/50 focus:border-red-500': errors.password }" />
                        <p v-if="errors.password" class="text-xs text-red-500 mt-1">{{ errors.password }}</p>
                    </div>

                    <!-- Login Button -->
                    <button type="submit" :disabled="isLoading || isGoogleLoading"
                        class="w-full py-3 px-4 bg-kaitoke-green-600 text-white font-semibold rounded-lg 
                               hover:bg-kaitoke-green-700 focus:ring-4 focus:ring-kaitoke-green-500/30
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                        <span v-if="!isLoading">Sign In</span>
                        <span v-else class="flex items-center gap-2">
                            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Signing in...
                        </span>
                    </button>
                </form>

                <!-- Divider -->
                <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-platinum-200 dark:border-abyss-700"></div>
                    </div>
                    <div class="relative flex justify-center">
                        <span
                            class="bg-white dark:bg-abyss-800 px-3 text-xs text-platinum-500 dark:text-platinum-400 uppercase tracking-wider font-medium">
                            Or continue with
                        </span>
                    </div>
                </div>

                <!-- Google Button -->
                <button @click="loginWithGoogle" :disabled="isLoading || isGoogleLoading" class="w-full py-3 px-4 rounded-lg border border-sun-200 dark:border-abyss-700
                           bg-white dark:bg-abyss-900/30 hover:bg-platinum-50 dark:hover:bg-abyss-700
                           text-abyss-700 dark:text-platinum-200 font-medium 
                           transition-all duration-200 flex items-center justify-center gap-3
                           disabled:opacity-60 disabled:cursor-not-allowed">
                    <div v-if="!isGoogleLoading" class="flex items-center gap-3">
                        <svg class="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Google</span>
                    </div>
                    <div v-else class="flex items-center gap-2">
                        <svg class="w-5 h-5 animate-spin text-abyss-600 dark:text-platinum-300" fill="none"
                            viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Connecting...</span>
                    </div>
                </button>
            </div>

            <!-- Footer -->
            <p class="mt-8 text-center text-sm text-platinum-600 dark:text-platinum-400">
                Don’t have an account?
                <router-link :to="{ name: 'signup' }"
                    class="text-kaitoke-green-600 dark:text-kaitoke-green-400 font-semibold hover:underline decoration-2 underline-offset-2 transition-all">
                    Create an account
                </router-link>
            </p>
        </div>
    </AuthShellSvg>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@stores/auth";
import AuthShellSvg from "@components/ui/auth_design.vue";
import api from '@/utils/api';
import { useToast } from '@/utils/useToast';

const hero = "/illustrations_1.jpg";
const artist = "Charlie Davis";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const form = ref({ email: "", password: "" });
const errors = ref({ email: "", password: "" });
const isLoading = ref(false);
const isGoogleLoading = ref(false);

const loginWithGoogle = async () => {
    isGoogleLoading.value = true;
    try {
        const { data } = await api.get('/api/auth/google/redirect');
        window.location.href = data.authUrl;
        // No need to set isGoogleLoading false as we are redirecting
    } catch (error) {
        isGoogleLoading.value = false;
        toast.error("Failed to connect to Google. Please try again.");
    }
}

const handleLogin = async () => {
    errors.value = { email: "", password: "" };

    if (!form.value.email) {
        errors.value.email = "Email is required";
        return;
    }
    if (!form.value.password) {
        errors.value.password = "Password is required";
        return;
    }

    isLoading.value = true;

    try {
        await authStore.login({
            email: form.value.email,
            password: form.value.password,
        })

        toast.success("Welcome back!");
        router.push(route.query.redirect || { name: 'home' });

    } catch (error) {
        const unverified = error?.unverified;

        if (unverified) {
            const email = form.value.email;
            authStore.setPendingEmail(email);
            toast.info("Please verify your email address.");
            router.push({ name: 'verify-notice', query: { email } });
            return;
        }

        const msg = error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
        toast.error(msg);
    } finally {
        isLoading.value = false;
    }
};
</script>