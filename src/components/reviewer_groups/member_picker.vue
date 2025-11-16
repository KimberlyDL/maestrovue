<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    // [{ id, name, orgId, orgName, email }]
    users: { type: Array, default: () => [] },
    // preset selected member ids
    modelValue: { type: Array, default: () => [] },
    open: { type: Boolean, default: false },
    title: { type: String, default: 'Select reviewers' },
})

const emit = defineEmits(['update:modelValue', 'update:open', 'save', 'cancel'])

const q = ref('')
const selected = ref([...props.modelValue])

watch(() => props.modelValue, (v) => { selected.value = [...v] })
watch(() => props.open, (v) => { if (!v) q.value = '' })

const grouped = computed(() => {
    const out = {}
    for (const u of props.users) {
        const k = u.orgName || 'Other'
        if (!out[k]) out[k] = []
        out[k].push(u)
    }
    // optional: sort by org name
    return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)))
})

const filtered = computed(() => {
    if (!q.value.trim()) return grouped.value
    const term = q.value.toLowerCase()
    const out = {}
    for (const [org, list] of Object.entries(grouped.value)) {
        const match = list.filter(u =>
            u.name.toLowerCase().includes(term) ||
            (u.email || '').toLowerCase().includes(term)
        )
        if (match.length) out[org] = match
    }
    return out
})

function isChecked(id) { return selected.value.includes(id) }
function toggle(id) {
    const i = selected.value.indexOf(id)
    i === -1 ? selected.value.push(id) : selected.value.splice(i, 1)
}
function close() { emit('update:open', false); emit('cancel') }
function save() {
    emit('update:modelValue', [...selected.value])
    emit('update:open', false)
    emit('save', [...selected.value])
}
</script>

<template>
    <transition name="fade">
        <div v-if="open" class="fixed inset-0 z-50 bg-black/40 grid place-items-center">
            <div class="w-[680px] rounded-xl bg-white dark:bg-gray-900 p-5 shadow-xl max-h-[85vh] overflow-hidden">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-semibold">{{ title }}</h3>
                    <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click="close">✕</button>
                </div>

                <input v-model="q" type="text" placeholder="Search by name or email..." class="w-full mb-3 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm
                 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />

                <div class="overflow-y-auto max-h-[52vh] pr-1 space-y-4">
                    <div v-for="(list, org) in filtered" :key="org">
                        <div class="text-xs font-semibold text-gray-500 mb-1">{{ org }}</div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <label v-for="u in list" :key="u.id" class="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer
                           border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60">
                                <input type="checkbox" class="h-4 w-4" :checked="isChecked(u.id)"
                                    @change="toggle(u.id)" />
                                <div class="min-w-0">
                                    <p class="text-sm truncate">{{ u.name }}</p>
                                    <p v-if="u.email" class="text-xs text-gray-500 truncate">{{ u.email }}</p>
                                </div>
                                <span class="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                                    {{ u.orgName || 'Unknown' }}
                                </span>
                            </label>
                        </div>
                    </div>

                    <div v-if="Object.keys(filtered).length === 0" class="text-sm text-gray-500">No results</div>
                </div>

                <div class="flex justify-end gap-2 mt-4">
                    <button @click="close" class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700
                         hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                    <button @click="save"
                        class="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                        Save ({{ selected.length }})
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity .15s ease
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0
}
</style>
