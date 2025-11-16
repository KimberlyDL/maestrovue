<script setup>
// Props for dynamic content
const props = defineProps({
    name: {
        type: String,
        default: 'Michael', // Default name
    },
    greetingEmojis: {
        type: Array,
        default: () => ['👋', '✨'], // Default emojis
    },
    callToAction: {
        type: String,
        default: 'learn', // The highlighted word
    },
    tagline: {
        type: String,
        default: 'Invest in yourself and take the first step towards achieving your dreams',
    },
});
</script>

<template>
    <div class="p-6 md:p-8 lg:p-10 bg-platinum-50 dark:bg-abyss-900 rounded-2xl shadow-lg relative overflow-hidden">
        <div
            class="absolute top-0 -left-8 w-24 h-24 bg-electric-lime-200 dark:bg-electric-lime-900 rounded-full opacity-30 blur-xl">
        </div>
        <div class="absolute bottom-0 -right-8 w-32 h-32 bg-sun-200 dark:bg-sun-900 rounded-full opacity-30 blur-xl">
        </div>

        <div class="relative z-10">
            <h1
                class="text-abyss-950 dark:text-platinum-50 font-heading font-600 text-md lg:text-lg mb-2 leading-tight">
                Hi, {{ name }}!
                <span class="inline-flex gap-1 pl-1">
                    <span v-for="(emoji, index) in greetingEmojis" :key="index" class="inline-flex items-center justify-center w-5 h-5 rounded-full 
                       bg-sun-200 text-base leading-none dark:bg-electric-lime-800 dark:text-electric-lime-200">
                        {{ emoji }}
                    </span>
                </span>
            </h1>

            <h2
                class="text-abyss-950 dark:text-platinum-50 font-heading font-bold text-xl lg:text-2xl mb-2 md:mb-3 leading-tight">
                What do you want to <span class="text-sun-500 dark:text-sun-400">{{ callToAction }}</span> today?
            </h2>

            <p class="text-abyss-600 dark:text-platinum-400 font-sans text-sm leading-relaxed max-w-lg">
                {{ tagline }}
            </p>
        </div>
    </div>
</template>

<style scoped>
/* Optional: Add custom transition or animation if needed, e.g., for background elements */
/* .fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
} */
</style>