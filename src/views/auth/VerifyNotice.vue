<template>
    <div class="min-h-dvh w-full flex items-center justify-center bg-platinum-50 dark:bg-abyss-900 px-4 py-12">
        <div
            class="w-full max-w-md rounded-xl border border-sun-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-8 shadow-xl">

            <!-- Icon & Header -->
            <div class="mb-6">
                <div
                    class="w-12 h-12 rounded-lg bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 flex items-center justify-center mb-4 text-kaitoke-green-600 dark:text-kaitoke-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <h1 class="text-2xl font-bold font-heading text-abyss-900 dark:text-platinum-50">Verify your email</h1>
                <p class="text-sm text-platinum-600 dark:text-platinum-400 mt-2 leading-relaxed">
                    We sent a verification link to
                    <span class="font-semibold text-abyss-900 dark:text-platinum-50">{{ model.email || "your email"
                        }}</span>.
                    Click the link in your inbox to continue.
                </p>
            </div>

            <form @submit.prevent="onResend" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1.5 text-abyss-900 dark:text-platinum-100">Email
                        Address</label>
                    <input v-model.trim="model.email" type="email" inputmode="email" autocomplete="email" class="w-full px-4 py-3 rounded-lg border border-platinum-300 dark:border-abyss-600 
                               bg-platinum-50 dark:bg-abyss-900/50 text-abyss-900 dark:text-platinum-50
                               placeholder-platinum-400 dark:placeholder-platinum-500
                               focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500
                               transition-all duration-200" :disabled="isLoading || cooldown > 0"
                        placeholder="name@example.com" />
                    <p v-if="errs.email" class="mt-1 text-xs text-red-500">{{ errs.email }}</p>
                </div>

                <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button type="submit" class="w-full sm:flex-1 inline-flex items-center justify-center rounded-lg px-5 py-3 font-semibold text-white
                        bg-kaitoke-green-600 hover:bg-kaitoke-green-700 disabled:opacity-50 disabled:cursor-not-allowed 
                        focus:ring-4 focus:ring-kaitoke-green-500/30 transition-all duration-200 shadow-md"
                        :disabled="isLoading || !isValidEmail || cooldown > 0">
                        <span v-if="!isLoading && cooldown === 0">Resend Email</span>
                        <span v-else-if="cooldown > 0">Resend in {{ cooldown }}s</span>
                        <span v-else class="flex items-center gap-2">
                            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                        </span>
                    </button>

                    <button type="button" class="w-full sm:w-auto rounded-lg px-5 py-3 border border-platinum-300 dark:border-abyss-600
                        bg-white dark:bg-abyss-900/30 text-abyss-700 dark:text-platinum-200 font-medium 
                        hover:bg-platinum-50 dark:hover:bg-abyss-700/50 text-sm transition-all duration-200"
                        :disabled="isLoading" @click="refreshFromQuery">
                        Reload URL
                    </button>
                </div>
            </form>

            <div
                class="mt-8 flex flex-col sm:flex-row items-center justify-between text-sm border-t border-platinum-200 dark:border-abyss-700 pt-6">
                <router-link
                    class="font-medium text-platinum-600 dark:text-platinum-400 hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition-colors"
                    :to="{ name: 'login' }">
                    &larr; Back to Login
                </router-link>
                <router-link
                    class="font-medium text-platinum-600 dark:text-platinum-400 hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 mt-3 sm:mt-0 transition-colors"
                    :to="{ name: 'signup' }">
                    Create new account
                </router-link>
            </div>

            <!-- Hint -->
            <div
                class="mt-6 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 p-4 text-sm">
                <div class="flex gap-3">
                    <svg class="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-orange-800 dark:text-orange-200/80">
                        <span class="font-semibold block mb-0.5 text-orange-900 dark:text-orange-100">Troubleshooting
                            Tip:</span>
                        Check your spam folder if the email doesn't appear. Resend available every {{ COOLDOWN_SEC }}s.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from '@/utils/useToast';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toast = useToast();

const COOLDOWN_SEC = 60;

const model = reactive({
    email: route.query.email?.toString() || auth.pendingEmail || "",
});

const errs = reactive({ email: "" });
const isLoading = ref(false);
const cooldown = ref(0);
let timer = null;

const isValidEmail = computed(() => {
    const v = model.email?.trim() || "";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
});

function startCooldown() {
    cooldown.value = COOLDOWN_SEC;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        cooldown.value -= 1;
        if (cooldown.value <= 0) {
            clearInterval(timer);
            timer = null;
        }
    }, 1000);
}

function refreshFromQuery() {
    const q = route.query.email?.toString() || "";
    if (q) model.email = q;
}

async function onResend() {
    errs.email = "";

    if (!isValidEmail.value) {
        errs.email = "Please enter a valid email.";
        return;
    }

    try {
        isLoading.value = true;
        auth.setPendingEmail(model.email);

        await auth.resendVerificationEmail(model.email);

        toast.success("If that email exists and is unverified, we sent a new verification link.");

        if (cooldown.value === 0) startCooldown();
    } catch (e) {
        toast.error(e?.response?.data?.message || "Unable to send email right now. Please try again.");
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => {
    if (!model.email && auth.pendingEmail) model.email = auth.pendingEmail;
});

onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
});

watch(() => model.email, (val) => auth.setPendingEmail(val));
</script>