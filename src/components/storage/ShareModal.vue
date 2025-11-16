<template>
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-slate-700 rounded-lg p-8 max-w-md w-full mx-4">
            <h3 class="text-xl font-bold text-white mb-6">Share Document</h3>

            <div class="space-y-4 mb-6">
                <p class="text-slate-300 text-sm">{{ document?.name || document?.title }}</p>

                <div class="space-y-3">
                    <button @click="selectAccess('organization')"
                        :class="selectedAccess === 'organization' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600'"
                        class="w-full p-4 border rounded-lg text-left hover:border-blue-500 transition">
                        <div class="font-semibold text-white">Organization Access</div>
                        <div class="text-xs text-slate-400 mt-1">Accessible by all org members</div>
                        <div v-if="selectedAccess === 'organization'" class="mt-2 text-xs text-blue-400">✓ Selected
                        </div>
                    </button>

                    <button @click="selectAccess('public')"
                        :class="selectedAccess === 'public' ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-600'"
                        class="w-full p-4 border rounded-lg text-left hover:border-cyan-500 transition">
                        <div class="font-semibold text-white">Public Link</div>
                        <div class="text-xs text-slate-400 mt-1">Anyone with the link can view</div>
                        <div v-if="selectedAccess === 'public'" class="mt-2 text-xs text-cyan-400">✓ Selected</div>
                    </button>

                    <button @click="selectAccess('organization')"
                        :class="selectedAccess === 'organization' ? 'border-red-500 bg-red-500/10' : 'border-slate-600'"
                        class="w-full p-4 border rounded-lg text-left hover:border-red-500 transition">
                        <div class="font-semibold text-white">Org Only (Restrict)</div>
                        <div class="text-xs text-slate-400 mt-1">Only organization members can view</div>
                        <div v-if="selectedAccess === 'organization'" class="mt-2 text-xs text-red-400">✓ Selected</div>
                    </button>
                </div>
            </div>

            <div class="flex gap-3">
                <button @click="$emit('close')"
                    class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white font-medium transition">
                    Cancel
                </button>
                <button @click="handleShare"
                    class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition">
                    Update Access
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    document: Object
})

const emit = defineEmits(['close', 'share'])

const selectedAccess = ref('organization')

const selectAccess = (type) => {
    selectedAccess.value = type
}

const handleShare = () => {
    emit('share', selectedAccess.value)
}
</script>
