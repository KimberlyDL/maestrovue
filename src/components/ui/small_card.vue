<script setup>
import { computed } from 'vue';

const props = defineProps({
    label: {
        type: String,
        required: true,
    },
    value: {
        type: [String, Number],
        required: true,
    },
    subLabel: {
        type: String,
        default: '',
    },
    iconColorClass: { // Tailwind class for icon background/text color, e.g., 'bg-indigo-500'
        type: String,
        default: 'bg-indigo-500 dark:bg-indigo-400', // Default color, you can use your custom colors here
    },
    // You can pass an SVG path or a component for a custom icon if needed
    // For simplicity, we'll just use a small dot for now like in your image.
});

// Helper for the icon dot's interior color, assuming it's usually lighter
const iconDotColorClass = computed(() => {
    // A simple way to make the dot lighter, you might want more complex logic
    if (props.iconColorClass.includes('dark:bg-indigo-400')) {
        return 'bg-platinum-50 dark:bg-abyss-950'; // For contrast with the default iconColorClass
    }
    return 'bg-platinum-50'; // Default light dot
});
</script>

<template>
    <div class="p-4 bg-platinum-50 dark:bg-abyss-700 rounded-lg shadow-sm">
        <div class="flex items-center gap-2 mb-2">
            <div :class="[iconColorClass]" class="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                <div :class="[iconDotColorClass]" class="w-1.5 h-1.5 rounded-full"></div>
            </div>
            <span class="text-abyss-700 dark:text-platinum-300 font-body text-xs font-medium uppercase tracking-wide">
                {{ label }}
            </span>
        </div>
        <div class="text-abyss-950 dark:text-platinum-50 font-heading font-extrabold text-3xl mb-1">
            {{ value }}
        </div>
        <p v-if="subLabel" class="text-abyss-500 dark:text-platinum-500 font-body text-xs">
            {{ subLabel }}
        </p>
    </div>
</template>