<template>
    <transition name="modal-fade">
        <div v-if="show" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" @click.self="close">
            <transition name="modal-scale">
                <div class="max-w-full max-h-full p-4">
                    <img :src="image" alt="Full view"
                        class="max-w-full max-h-[90vh] rounded-lg shadow-lg object-contain" />
                    <button @click="close"
                        class="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70">
                        ✕
                    </button>
                </div>
            </transition>
        </div>
    </transition>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    image: { type: String, required: true }
})

const emit = defineEmits(['update:modelValue'])

const show = ref(props.modelValue)

watch(() => props.modelValue, val => show.value = val)
watch(show, val => emit('update:modelValue', val))

function close() {
    show.value = false
}
</script>

<style scoped>
/* Fade in/out for backdrop */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

/* Scale animation for modal content */
.modal-scale-enter-active {
    transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-scale-leave-active {
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

.modal-scale-enter-to,
.modal-scale-leave-from {
    opacity: 1;
    transform: scale(1);
}
</style>
