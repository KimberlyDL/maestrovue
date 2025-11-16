<template>
    <Teleport to="body">
        <TransitionGroup name="toast" tag="div"
            class="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
            <div v-for="toast in toastStore.toasts" :key="toast.id"
                class="pointer-events-auto bg-abyss-800 border border-abyss-700 rounded-lg p-4 shadow-2xl backdrop-blur-sm max-w-sm hover:border-abyss-600 transition-colors">
                <Toast :toast="toast" />
            </div>
        </TransitionGroup>
    </Teleport>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'
import Toast from './Toast.vue'
import { TransitionGroup } from 'vue'

const toastStore = useToastStore()
</script>

<style scoped>
/* smooth slide-in and fade animations for toasts */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%) translateY(10px);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(100%) translateY(-10px);
}

/* smooth layout transition when toasts are removed */
.toast-move {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
