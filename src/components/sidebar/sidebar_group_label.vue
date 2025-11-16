<!-- src\components\sidebar\sidebar_group_label.vue -->
<script setup>
const props = defineProps({
    text: { type: String, required: true }
})
</script>

<template>
    <div class="px-3 pt-5 pb-2 text-[11px] uppercase tracking-wider text-kaitoke-green-500 dark:text-kaitoke-green-800">
        {{ text }}
    </div>
</template>
