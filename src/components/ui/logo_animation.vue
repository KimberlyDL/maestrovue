<template>
    <div class="flex flex-col items-center justify-center">
        <div class="logo-container mb-4 transform transition duration-500" :class="[animationClass, pulseClass]">
            <svg class="w-12 h-12 md:w-16 md:h-16" viewBox="0 0 500 416" xmlns="http://www.w3.org/2000/svg">
                <g>
                    <path
                        d="m0,0h159.81l91.66,295.44L340.78,0h159.22l-115.77,415.98h-14.08l35.15-337.61-99.19,337.61h-111.63L91.8,74.3l38.63,341.68h-12.33L0,0Z"
                        fill="currentColor" />
                    <polygon points="470.72 328.42 456.73 328.42 431.91 415.98 459.89 415.98 470.72 328.42"
                        fill="currentColor" />
                    <polygon points="27.73 328.42 41.72 328.42 66.54 415.98 38.56 415.98 27.73 328.42"
                        fill="currentColor" />
                    <polygon points="250 102.76 218.21 0 281.79 0 250 102.76" fill="currentColor" />
                </g>
            </svg>
        </div>
        <span class="font-heading text-xl md:text-2xl font-bold text-gray-800 dark:text-platinum-100">Maestro</span>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    status: {
        type: String,
        default: 'loading' // 'loading', 'success', 'error'
    }
});

const animationClass = computed(() => {
    return props.status === 'loading' ? 'animate-heartbeat-glow' : 'opacity-100';
});

const pulseClass = computed(() => {
    // Apply the primary green color consistently
    if (props.status === 'error') {
        return 'text-red-500';
    }
    return 'text-kaitoke-green-600 dark:text-kaitoke-green-400';
});
</script>

<style scoped>
/* Define the keyframes for the combined Heartbeat and Glow effect */
@keyframes heartbeat-glow {

    0%,
    100% {
        transform: scale(1);
        filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.4));
        /* Subtle green glow */
    }

    50% {
        transform: scale(1.05);
        /* Slight enlargement */
        filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.8)) drop-shadow(0 0 2px rgba(16, 185, 129, 0.9));
        /* Stronger glow */
    }
}

/* Tailwind-compatible utility class for the animation */
.animate-heartbeat-glow {
    animation: heartbeat-glow 1.5s ease-in-out infinite;
}

/* Ensure SVG uses currentColor for adaptive theme switching */
.logo-container svg {
    fill: currentColor;
}
</style>