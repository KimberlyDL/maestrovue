<template>
    <div class="min-h-dvh w-full flex items-center justify-center bg-platinum-50 dark:bg-abyss-900 px-4">
        <div
            class="w-full max-w-md rounded-2xl border border-platinum-300 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-8 shadow-xl">

            <div class="mb-6 text-abyss-900 dark:text-platinum-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-kaitoke-green-500 mb-3" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>

                <h1 class="text-2xl font-semibold font-heading">Verify your email</h1>
                <p class="text-sm text-abyss-500 dark:text-platinum-400 mt-1">
                    We sent a verification link to
                    <span class="font-medium text-abyss-900 dark:text-white">{{ model.email || "your email" }}</span>.
                    Click the link in your inbox to continue.
                </p>
            </div>

            <form @submit.prevent="onResend" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1 text-abyss-900 dark:text-platinum-100">Email</label>
                    <input v-model.trim="model.email" type="email" inputmode="email" autocomplete="email"
                        class="w-full rounded-xl border border-platinum-300 dark:border-abyss-700 bg-white dark:bg-abyss-900 px-4 py-3 text-abyss-900 dark:text-platinum-50 placeholder-woodsmoke-400 dark:placeholder-platinum-400/50 outline-none focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent"
                        :disabled="isLoading || cooldown > 0" placeholder="name@example.com" />
                    <p v-if="errs.email" class="mt-1 text-xs text-red-500">{{ errs.email }}</p>
                </div>

                <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button type="submit" class="w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-5 py-3 font-medium text-white
                        bg-kaitoke-green-600 hover:bg-kaitoke-green-700 disabled:opacity-50 transition duration-150"
                        :disabled="isLoading || !isValidEmail || cooldown > 0"
                        :title="cooldown > 0 ? `Please wait ${cooldown}s` : 'Resend email'">

                        <span v-if="!isLoading && cooldown === 0">Resend verification email</span>
                        <span v-else-if="cooldown > 0">Resend in {{ cooldown }}s</span>
                        <span v-else>Sending…</span>
                    </button>

                    <button type="button"
                        class="w-full sm:w-auto rounded-xl px-5 py-3 border border-platinum-300 dark:border-abyss-700
                        bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-50 hover:bg-platinum-50 dark:hover:bg-abyss-700 text-sm"
                        :disabled="isLoading" @click="refreshFromQuery">
                        Reload from URL
                    </button>
                </div>

                <p v-if="toast.message"
                    :class="['text-sm pt-2', toast.ok ? 'text-kaitoke-green-700 dark:text-emerald-400' : 'text-red-500']">
                    {{ toast.message }}
                </p>
            </form>

            <div
                class="mt-8 flex flex-col sm:flex-row items-center justify-between text-sm border-t border-platinum-300 dark:border-abyss-700 pt-6">
                <router-link
                    class="text-abyss-600 dark:text-platinum-300 hover:text-kaitoke-green-600 dark:hover:text-electric-lime-400"
                    :to="{ name: 'login' }">
                    &larr; Back to Login
                </router-link>
                <router-link
                    class="text-abyss-600 dark:text-platinum-300 hover:text-kaitoke-green-600 dark:hover:text-electric-lime-400 mt-2 sm:mt-0"
                    :to="{ name: 'signup' }">
                    Create a new account
                </router-link>
            </div>

            <div class="mt-6 rounded-xl border border-orange-600/30 bg-orange-900/10 p-4 text-orange-200 text-sm">
                **Troubleshooting Tip:** If you don't receive the email, please check your spam or junk folder. The
                resend option is available every
                <span class="font-medium">{{ COOLDOWN_SEC }}s</span>.
            </div>
        </div>
    </div>
</template>

<script setup>
// The script is unchanged, as the wiring is correct.
import { reactive, ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const COOLDOWN_SEC = 60;

const model = reactive({
    email: route.query.email?.toString() || auth.pendingEmail || "",
});

const errs = reactive({ email: "" });
const toast = reactive({ message: "", ok: true });
const isLoading = ref(false);
const cooldown = ref(0);
let timer = null;

const isValidEmail = computed(() => {
    const v = model.email?.trim() || "";
    // simple but good-enough email check
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

function setToast(message, ok = true) {
    toast.message = message;
    toast.ok = ok;
}

function refreshFromQuery() {
    const q = route.query.email?.toString() || "";
    if (q) model.email = q;
}

async function onResend() {
    errs.email = "";
    setToast("");

    if (!isValidEmail.value) {
        errs.email = "Please enter a valid email.";
        return;
    }

    try {
        isLoading.value = true;

        auth.setPendingEmail(model.email);

        await auth.resendVerificationEmail(model.email);

        setToast("If that email exists and is unverified, we sent a new verification link.", true);
        if (cooldown.value === 0) startCooldown();
    } catch (e) {
        setToast(e?.response?.data?.message || "Unable to send email right now. Please try again.", false);
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