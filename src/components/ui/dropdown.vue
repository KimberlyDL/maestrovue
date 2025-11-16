<template>
    <div class="relative inline-block text-left" ref="root">
        <!-- Trigger -->
        <div @click="toggle" class="select-none">
            <slot name="trigger" />
        </div>

        <!-- Menu -->
        <transition enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95">
            <div v-if="open" :class="[
                'absolute z-50 mt-2 w-44 origin-top-right rounded-xl border border-gray-200/10',
                'bg-slate-800 text-slate-100 shadow-lg ring-1 ring-black/10 focus:outline-none',
                align === 'left' ? 'left-0' : 'right-0'
            ]" role="menu" tabindex="-1">
                <slot />
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    align: { type: String, default: 'right' } // 'left' | 'right'
})
const emit = defineEmits(['open-change'])

const open = ref(false)
const root = ref(null)

function toggle() {
    open.value = !open.value
    emit('open-change', open.value)
}
function close() {
    if (!open.value) return
    open.value = false
    emit('open-change', false)
}
function onClickOutside(e) {
    if (!root.value) return
    if (!root.value.contains(e.target)) close()
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>
