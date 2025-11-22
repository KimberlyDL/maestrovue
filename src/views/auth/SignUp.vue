<template>
    <AuthShellSvg page-title="SignUp" :hero-image="hero" :artist="artist">
        <div class="w-full">
            <div class="mb-6">
                <h1 class="text-3xl font-heading font-bold text-abyss-900 dark:text-platinum-50 mb-1">
                    Create Account
                </h1>
                <p class="text-sm text-woodsmoke-500 dark:text-platinum-300/80">
                    Store documents, manage approvals, and collaborate effortlessly.
                </p>
            </div>

            <form @submit.prevent="handleSignUp" class="space-y-4">

                <div v-if="errors.general" class="p-3 border border-red-600/40 rounded-lg text-sm text-red-700">
                    {{ errors.general }}
                </div>

                <!-- Email -->
                <div>
                    <label for="email" class="text-sm font-normal text-abyss-900 dark:text-platinum-100">Email</label>
                    <input id="email" v-model.trim="form.email" type="email" placeholder="you@example.com" required
                        class="mt-1 w-full px-4 py-3 border border-platinum-300 dark:border-abyss-700 rounded-xl
                   text-abyss-900 dark:text-platinum-50 bg-white dark:bg-abyss-800
                   placeholder-woodsmoke-400 dark:placeholder-platinum-400/50
                   focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent" />
                    <p v-if="errors.email" class="font-sans text-xs text-red-500/70 mt-1">{{ errors.email }}</p>
                </div>


                <!-- Password + Confirm in one row on lg+, stacked below -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <!-- Password -->
                    <div>
                        <div class="flex items-center justify-between">
                            <label for="password" class="text-sm font-normal text-abyss-900 dark:text-platinum-100">
                                Password
                            </label>
                            <!-- <span class="text-xs text-woodsmoke-400 dark:text-platinum-400/70">
                                At least 8 characters
                            </span> -->
                        </div>
                        <input id="password" v-model="form.password" type="password" placeholder="••••••••" required
                            class="mt-1 w-full px-4 py-3 border border-platinum-300 dark:border-abyss-700 rounded-xl
             text-abyss-900 dark:text-platinum-50 bg-white dark:bg-abyss-800
             placeholder-woodsmoke-400 dark:placeholder-platinum-400/50
             focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent" />
                        <p v-if="errors.password" class="font-sans text-xs text-red-500/70 mt-1">
                            {{ errors.password }}
                        </p>
                    </div>

                    <!-- Confirm Password -->
                    <div>
                        <label for="confirmPassword" class="text-sm font-normal text-abyss-900 dark:text-platinum-100">
                            Confirm Password
                        </label>
                        <input id="confirmPassword" v-model="form.confirmPassword" type="password"
                            placeholder="••••••••" required class="mt-1 w-full px-4 py-3 border border-platinum-300 dark:border-abyss-700 rounded-xl
             text-abyss-900 dark:text-platinum-50 bg-white dark:bg-abyss-800
             placeholder-woodsmoke-400 dark:placeholder-platinum-400/50
             focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent" />
                        <p v-if="errors.confirmPassword" class="font-sans text-xs text-red-500/70 mt-1">
                            {{ errors.confirmPassword }}
                        </p>
                    </div>
                </div>

                <!-- Password -->
                <!-- <div>
                    <div class="flex items-center justify-between">
                        <label for="password"
                            class="text-sm font-medium text-abyss-900 dark:text-platinum-50">Password</label>
                        <span class="text-xs text-woodsmoke-400 dark:text-platinum-400/70">At least 8 characters</span>
                    </div>
                    <input id="password" v-model="form.password" type="password" placeholder="••••••••" required class="mt-1 w-full px-4 py-3 border border-platinum-300 dark:border-abyss-700 rounded-xl
                   text-abyss-900 dark:text-platinum-50 bg-white dark:bg-abyss-800
                   placeholder-woodsmoke-400 dark:placeholder-platinum-400/50
                   focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent" />
                    <p v-if="errors.password" class="font-sans text-xs text-red-500/50 mt-1">{{ errors.password }}</p>
                </div> -->

                <!-- Confirm -->
                <!-- <div>
                    <label for="confirmPassword"
                        class="text-sm font-medium text-abyss-900 dark:text-platinum-50">Confirm Password</label>
                    <input id="confirmPassword" v-model="form.confirmPassword" type="password" placeholder="••••••••"
                        required class="mt-1 w-full px-4 py-3 border border-platinum-300 dark:border-abyss-700 rounded-xl
                   text-abyss-900 dark:text-platinum-50 bg-white dark:bg-abyss-800
                   placeholder-woodsmoke-400 dark:placeholder-platinum-400/50
                   focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent" />
                    <p v-if="errors.confirmPassword" class="font-sans text-xs text-red-500/50 mt-1">{{ errors.confirmPassword }}</p>
                </div> -->

                <!-- Terms -->
                <div class="flex items-start gap-2">
                    <input id="terms" v-model="form.agreeToTerms" type="checkbox"
                        class="w-4 h-4 text-kaitoke-green-500 border-gray-300 rounded focus:ring-kaitoke-green-500 cursor-pointer mt-1" />
                    <label for="terms" class="text-sm text-abyss-900 dark:text-platinum-50">
                        I agree to the
                        <a href="#" class="text-kaitoke-green-600 dark:text-electric-lime-400 hover:underline">Terms of
                            Service</a>
                        and
                        <a href="#" class="text-kaitoke-green-600 dark:text-electric-lime-400 hover:underline">Privacy
                            Policy</a>
                    </label>
                </div>

                <!-- Submit -->
                <button type="submit" :disabled="isLoading" class="w-full py-3 rounded-xl font-medium text-white bg-kaitoke-green-600 hover:bg-kaitoke-green-700
                 disabled:opacity-50 shadow-lg shadow-kaitoke-green-600/30">
                    <span v-if="!isLoading">Create Account</span>
                    <span v-else class="flex justify-center items-center gap-2">
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating account…
                    </span>
                </button>
            </form>

            <!-- Divider “or” -->
            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-platinum-300 dark:border-abyss-700"></div>
                </div>
                <div class="relative flex justify-center">
                    <span
                        class="bg-white dark:bg-abyss-900 px-3 text-xs text-woodsmoke-500 dark:text-platinum-300/80">or</span>
                </div>
            </div>

            <!-- Google button -->
            <button @click="signUpWithGoogle" class="w-full py-3 rounded-xl border border-platinum-300 dark:border-abyss-700
               bg-white dark:bg-abyss-800 hover:bg-platinum-50 dark:hover:bg-abyss-700
               text-abyss-900 dark:text-platinum-50 font-medium flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 48 48">
                    <path fill="#FFC107"
                        d="M43.6 20.5H42V20H24v8h11.3C33.8 32.3 29.3 36 24 36A12 12 0 1 1 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.8 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 18-8.1 18-20c0-1.2-.1-2.3-.4-3.5z" />
                    <path fill="#FF3D00"
                        d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.8 6.1 29.2 4 24 4A20 20 0 0 0 6.3 14.7z" />
                    <path fill="#4CAF50"
                        d="M24 44c5.2 0 9.8-2 13.2-5.2l-6.1-5.1A12 12 0 0 1 12.9 28l-6.6 5C9.2 39.7 16 44 24 44z" />
                    <path fill="#1976D2"
                        d="M43.6 20.5H42V20H24v8h11.3c-1.2 3.5-4.7 6-8.3 6-3.7 0-6.8-2.4-8-5.7l-6.6 5C14.4 38.9 19 42 24 42c8 0 14.7-5.4 16.6-13.5.4-1.2.6-2.5.6-4s-.2-2.8-.6-4z" />
                </svg>
                Continue with Google
            </button>

            <p class="mt-6 text-center text-sm text-woodsmoke-500 dark:text-platinum-300/80">
                Already have an account?
                <router-link :to="{ name: 'login' }"
                    class="text-kaitoke-green-600 dark:text-electric-lime-400 font-medium hover:underline">
                    Sign in
                </router-link>
            </p>
        </div>
    </AuthShellSvg>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@stores/auth";
import AuthShellSvg from "@components/ui/auth_design.vue";
import api from '@/utils/api';

const hero = "/illustrations_1.jpg"; // optional
const artist = "Charlie Davis";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({ email: "", password: "", confirmPassword: "", agreeToTerms: false });
const errors = ref({ email: "", password: "", confirmPassword: "", general: "" });
const isLoading = ref(false);

// const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/,'');
const signUpWithGoogle = async () => {
  const { data } = await api.get('/api/auth/google/redirect')
  window.location.href = data.authUrl
}

const handleSignUp = async () => {
    errors.value = { email: "", password: "", confirmPassword: "", general: "" };

    if (!form.value.email) { errors.value.email = "Email is required"; return; }
    if (!form.value.password || form.value.password.length < 8) { errors.value.password = "Password must be at least 8 characters"; return; }
    if (form.value.password !== form.value.confirmPassword) { errors.value.confirmPassword = "Passwords do not match"; return; }
    if (!form.value.agreeToTerms) { errors.value.general = "You must agree to the terms and conditions"; return; }

    isLoading.value = true;
    try {
        const { success, email, message } = await authStore.signup({
            email: form.value.email,
            password: form.value.password,
            password_confirmation: form.value.confirmPassword,
        });
        if (success) {
            authStore.setPendingEmail(email || form.value.email);
            router.push({ name: "verify-notice", query: { email: email || form.value.email } });
        } else {
            errors.value.general = message || "Sign up failed. Please try again.";
        }
    } catch (err) {
        if (err.details) {
            errors.value.email = err.details?.email;
            errors.value.password = err.details?.password;
        }
        errors.value.general = err.message || "Sign up failed due to an unexpected error.";
    } finally {
        isLoading.value = false;
    }
};
</script>
