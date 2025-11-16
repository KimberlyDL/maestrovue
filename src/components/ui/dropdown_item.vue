<template>
    <button class="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-white/5 disabled:opacity-50"
        :class="danger ? 'text-red-400 hover:text-red-300' : 'text-slate-200'" :disabled="disabled"
        @click.stop="onSelect" role="menuitem">
        <slot name="icon" />
        <span>{{ label }}</span>
        <slot />
    </button>
</template>

<script setup>
const props = defineProps({
    value: { type: String, required: true },
    label: { type: String, required: true },
    danger: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['select'])
function onSelect() { emit('select', props.value) }
</script>
