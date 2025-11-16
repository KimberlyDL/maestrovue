<template>
    <div class="min-h-dvh md:h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-platinum-50 dark:bg-abyss-900">

        <div class="relative **px-0 sm:px-6 md:px-0**">
            <svg class="absolute inset-0 h-full w-full bg-platinum-50 dark:bg-abyss-900" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <clipPath id="sMask" clipPathUnits="userSpaceOnUse">
                        <path d="M0,0
                                 H85
                                 C95,10 95,20 90,30
                                 C85,45 85,55 90,70
                                 C95,80 95,90 85,100
                                 H0
                                 Z" />
                    </clipPath>

                    <linearGradient id="grad-lg" x1="0" x2="1" y1="1" y2="0">
                        <stop offset="0%" :stop-color="'var(--color-kaitoke-green-500)'" />
                        <stop offset="100%" :stop-color="'var(--color-electric-lime-400)'" />
                    </linearGradient>
                    <linearGradient id="grad-sm" x1="0" x2="1" y1="1" y2="0">
                        <stop offset="0%" :stop-color="'var(--color-sun-400)'" />
                        <stop offset="100%" :stop-color="'var(--color-electric-lime-300)'" />
                    </linearGradient>
                    <linearGradient id="grad-accent" x1="0" x2="1" y1="1" y2="0">
                        <stop offset="0%" :stop-color="'var(--color-kaitoke-green-600)'" />
                        <stop offset="100%" :stop-color="'var(--color-electric-lime-500)'" />
                    </linearGradient>

                    <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.8" />
                    </filter>
                </defs>

                <g clip-path="url(#sMask)">
                    <image v-if="heroImage" :href="heroImage" x="0" y="0" width="100%" height="100%"
                        preserveAspectRatio="xMidYMid slice" />
                    <rect v-else x="0" y="0" width="100%" height="100%" fill="url(#grad-lg)" />
                </g>
            </svg>

            <div class="relative z-10 flex h-full flex-col text-white">
                <div class="flex items-start justify-between p-6 md:p-8">
                    <h2 class="text-sm md:text-base font-semibold tracking-wide">{{ artist }}</h2>

                    <div class="flex items-center gap-2">
                        <router-link :to="{ name: 'signup' }"
                            class="px-3 py-1 text-xs md:text-sm rounded-full bg-white/10 hover:bg-white/15 backdrop-blur"
                            :class="pageTitle === 'SignUp' ? 'ring-1 ring-white/60' : ''">Join Us</router-link>
                        <router-link :to="{ name: 'login' }"
                            class="px-3 py-1 text-xs md:text-sm rounded-full bg-white/10 hover:bg-white/15 backdrop-blur"
                            :class="pageTitle === 'Login' ? 'ring-1 ring-white/60' : ''">Sign In</router-link>
                    </div>
                </div>

                <div class="mt-auto p-6 md:p-8">
                    <h1 class="text-3xl md:text-4xl font-heading font-bold leading-tight drop-shadow">MAESTRO</h1>
                    <p class="mt-2 text-white/90 text-sm md:text-base">
                        Secure Document Management for School Organizations.
                    </p>
                </div>
            </div>
        </div>

        <div class="flex items-center justify-center px-6 md:px-10 lg:px-16 py-8 bg-platinum-50 dark:bg-abyss-900">
            <div class="w-full max-w-md md:max-w-lg">
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
    pageTitle: {
        type: String,
        required: true,
        // validator: v => ["Login", "SignUp"].includes(v),
    },
    heroImage: { type: String, default: "/image.jpg" },
    artist: { type: String, default: "Anonymous" },
});
</script>