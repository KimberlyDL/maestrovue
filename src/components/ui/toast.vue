<template>
    <div class="flex items-start gap-3 w-full">
        <!-- Icon -->
        <div class="flex-shrink-0 pt-0.5">
            <CheckCircle2 v-if="toast.type === 'success'" size="20" class="text-kaitoke-green-500" strokeWidth="1.5" />
            <AlertCircle v-else-if="toast.type === 'error'" size="20" class="text-sun-500" strokeWidth="1.5" />
            <AlertTriangle v-else-if="toast.type === 'warning'" size="20" class="text-sun-400" strokeWidth="1.5" />
            <Info v-else size="20" class="text-electric-lime-500" strokeWidth="1.5" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
            <p class="text-sm font-body text-platinum-100 leading-relaxed break-words">
                {{ toast.message }}
            </p>
        </div>

        <!-- Close Button -->
        <button @click="handleClose"
            class="flex-shrink-0 text-platinum-400 hover:text-platinum-200 transition-colors p-1 -mr-1"
            aria-label="Close notification">
            <X size="18" strokeWidth="1.5" />
        </button>
    </div>
</template>

<script setup>
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const props = defineProps({
    toast: {
        type: Object,
        required: true
    }
})

const handleClose = () => {
    toastStore.removeToast(props.toast.id)
}
</script>
