<!-- src/components/user/StatCard.vue -->
<template>
    <div
        class="rounded-lg border border-abyss-700 bg-abyss-800 p-5 hover:border-kaitoke-green-700/50 transition-colors">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-platinum-500 text-sm mb-1">{{ title }}</p>
                <p class="text-3xl font-bold text-platinum-50">{{ value }}</p>
            </div>
            <div class="text-4xl">{{ icon }}</div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: String,
    value: [String, Number],
    icon: String
})
</script>