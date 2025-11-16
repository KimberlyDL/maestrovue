<template>
    <teleport :to="teleportTo" :disabled="!teleport">
        <transition name="fade">
            <div v-if="modelValue" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
                @click.self="closeModal">
                <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 relative" :class="[widthClass]"
                    role="dialog" aria-modal="true">
                    <button v-if="showClose" @click="closeModal"
                        class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Close modal">
                        ✕
                    </button>

                    <slot />

                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup>
import { computed, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
    // v-model binding: controls visibility (open/closed)
    modelValue: { type: Boolean, required: true },

    // Width of the modal content container
    width: { type: String, default: '400px' },

    // Controls if the modal should close when clicking the overlay or pressing ESC
    persistent: { type: Boolean, default: false },

    // If true, the modal will be teleported to 'body' (app-scoped)
    teleport: { type: Boolean, default: true },

    // Target for teleport (only relevant if teleport=true)
    teleportTo: { type: String, default: 'body' },

    // Show/hide the default top-right close button
    showClose: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue', 'close']);

// --- Computed & Handlers ---

const widthClass = computed(() => {
    // Use Tailwind class if width is a utility, otherwise set inline style (e.g., w-[400px])
    return props.width.includes('w-') ? props.width : `w-[${props.width}]`;
});

function closeModal() {
    if (!props.persistent) {
        emit('update:modelValue', false);
        emit('close'); // Additional event for convenience
    }
}

// --- ESC Key Handler ---
function handleKeydown(event) {
    if (props.modelValue && event.key === 'Escape') {
        closeModal();
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown);
});

// --- Prop Stability (Optional but helpful for focus) ---
watch(() => props.modelValue, (isOpen) => {
    // When the modal opens, hide page overflow to prevent scrolling
    document.body.style.overflow = isOpen ? 'hidden' : '';
});
</script>

<style scoped>
/* Tailwind handles styling */
@import "tailwindcss";

/* Fade Transition for Modals */
.fade-enter-active,
.fade-leave-active {
    /* Transition the overlay opacity and the scale/opacity of the modal content */
    transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Optional: Add a subtle content transition (e.g., slight slide/scale) */
.fade-enter-active .bg-white,
.fade-leave-active .bg-white,
.fade-enter-active .dark\:bg-gray-900,
.fade-leave-active .dark\:bg-gray-900 {
    transition: transform 0.2s ease-out, opacity 0.2s ease-out;
}

.fade-enter-from .bg-white,
.fade-enter-from .dark\:bg-gray-900 {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
}

.fade-leave-to .bg-white,
.fade-leave-to .dark\:bg-gray-900 {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
}
</style>