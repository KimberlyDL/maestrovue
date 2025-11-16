<template>

    <!-- ✅ Rename Modal -->
    <transition name="fade">
        <div v-if="renameModalOpen" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-[400px] relative">
                <h3 class="text-lg font-semibold mb-3">Rename Document</h3>

                <label class="block text-sm mb-1 text-gray-600 dark:text-gray-300">New name</label>
                <input v-model="newName" type="text" class="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm
                   focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter new file name..." />

                <div class="flex justify-end gap-2 mt-4">
                    <button @click="renameModalOpen = false"
                        class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                        Cancel
                    </button>
                    <button @click="saveRename"
                        class="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                        Save
                    </button>
                </div>

                <!-- Close button -->
                <button @click="renameModalOpen = false"
                    class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    ✕
                </button>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    id: { type: [String, Number], required: true },
    title: { type: String, default: '' },
    version: { type: [String, Number], default: null },
    thumb: { type: String, default: '' },
    isSelected: { type: Boolean, default: false },
    meta: { type: Object, default: () => ({}) },
    menuItems: {
        type: Array,
        default: () => ([
            { label: 'Open', value: 'open' },
            { label: 'Share Link', value: 'share' },
            { label: 'Duplicate', value: 'duplicate' },
            { label: 'Delete', value: 'delete' },
        ])
    },
    openMenuId: { type: [String, Number, null], default: null } // 👈 new
})

const emit = defineEmits(['select', 'open', 'menu-action', 'toggle-menu'])

function onSelect() { emit('select', props.id) }
function onOpen(e) { e.stopPropagation(); emit('open', props.id) }
</script>