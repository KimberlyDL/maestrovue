import { defineStore } from "pinia"
import { ref } from "vue"

export const useToastStore = defineStore("toast", () => {
    const toasts = ref([])
    let idCounter = 0

    const addToast = (message, type = "info", duration = 3000) => {
        const id = ++idCounter

        toasts.value.push({
            id,
            message,
            type, // 'success' | 'error' | 'warning' | 'info'
            duration,
        })

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }

        return id
    }

    const removeToast = (id) => {
        const index = toasts.value.findIndex((t) => t.id === id)
        if (index > -1) {
            toasts.value.splice(index, 1)
        }
    }

    const clearAll = () => {
        toasts.value = []
    }

    return {
        toasts,
        addToast,
        removeToast,
        clearAll,
    }
})
