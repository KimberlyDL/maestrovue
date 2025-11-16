<!-- src/components/doc/doc_thread.vue -->
<template>
  <div class="flex flex-col max-h-full">
    <!-- Toolbar -->
    <div class="flex items-center justify-between px-4 py-2 border-b border-platinum-300/60">
      <div class="flex items-center gap-2">
        <span class="text-[12px] text-abyss-500 dark:text-platinum-400">Thread</span>
        <span
          class="inline-flex items-center rounded-full bg-platinum-100 text-abyss-700 ring-1 ring-platinum-300 px-2 py-0.5 text-[10px]">
          {{ participants?.length || 0 }} participants
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button class="text-[12px] rounded-lg px-2.5 py-1.5 ring-1 ring-platinum-300
                 hover:bg-platinum-100/60 dark:hover:bg-abyss-700" @click="$emit('resolve-thread', docId)">
          Resolve
        </button>
        <button class="text-[12px] rounded-lg px-2.5 py-1.5 ring-1 ring-platinum-300
                 hover:bg-platinum-100/60 dark:hover:bg-abyss-700" @click="$emit('reopen-thread', docId)">
          Reopen
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      <div v-for="m in messages" :key="m.id" class="group flex items-start gap-3"
        :class="m.author?.id === currentUser.id ? 'flex-row-reverse text-right' : ''">
        <!-- Avatar -->
        <div
          class="h-8 w-8 rounded-full bg-platinum-100 dark:bg-abyss-700 overflow-hidden flex items-center justify-center text-[11px] font-semibold">
          <img v-if="m.author?.avatar" :src="m.author.avatar" alt="" class="h-full w-full object-cover" />
          <span v-else>{{ initials(m.author?.name) }}</span>
        </div>

        <!-- Bubble -->
        <div class="min-w-0 max-w-[75%]">
          <div class="flex items-center gap-2 mb-0.5" :class="m.author?.id === currentUser.id ? 'justify-end' : ''">
            <span class="text-[12px] font-medium">{{ m.author?.name || 'Unknown' }}</span>
            <span class="text-[11px] text-abyss-500 dark:text-platinum-400">{{ fmtDate(m.createdAt) }}</span>
          </div>

          <div class="rounded-2xl px-3 py-2 text-[13px]" :class="m.author?.id === currentUser.id
            ? 'bg-kaitoke-green-50 text-abyss-900 ring-1 ring-kaitoke-green-200'
            : 'bg-platinum-100 text-abyss-900 ring-1 ring-platinum-300'">
            <p class="whitespace-pre-wrap break-words">{{ m.content }}</p>

            <!-- Attachments -->
            <div v-if="m.attachments?.length" class="mt-2 grid grid-cols-2 gap-2">
              <a v-for="(att, i) in m.attachments" :key="i" :href="att.url" target="_blank"
                class="block rounded-lg ring-1 ring-platinum-300 hover:bg-platinum-100/60 p-2 text-[12px] truncate">
                📎 {{ att.name || att.url }}
              </a>
            </div>

            <!-- Bubble actions -->
            <div class="mt-1 hidden group-hover:flex gap-2 text-[11px] opacity-80 justify-end">
              <button class="underline" @click="edit(m)">Edit</button>
              <button class="underline" @click="$emit('pin', m.id, docId)">Pin</button>
              <button class="underline text-red-600" @click="$emit('delete-message', m.id, docId)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Composer -->
    <div class="border-t border-platinum-300/60 p-3">
      <form @submit.prevent="send">
        <div class="flex items-end gap-2">
          <textarea v-model="draft" rows="1" placeholder="Write a comment…" class="flex-1 rounded-xl border border-platinum-300 bg-white px-3 py-2 text-[13px]
                   placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-400
                   dark:bg-abyss-800 dark:border-abyss-700 resize-none" @keydown.enter.exact.prevent="send" />
          <input ref="fileInput" type="file" class="hidden" multiple @change="onAttach" />
          <button type="button" class="text-[12px] rounded-lg px-2.5 py-1.5 ring-1 ring-platinum-300
                   hover:bg-platinum-100/60 dark:hover:bg-abyss-700" @click="fileInput?.click()">
            Attach
          </button>
          <button type="submit" class="inline-flex items-center rounded-xl bg-kaitoke-green-600 px-3 py-2 text-[13px]
                   font-semibold text-white hover:bg-kaitoke-green-700">
            Send
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  docId: { type: [String, Number], required: true },
  messages: { type: Array, default: () => [] },
  participants: { type: Array, default: () => [] },
  currentUser: { type: Object, default: () => ({ id: 7, name: 'You' }) },
  handlers: {
    type: Object,
    default: () => ({
      send: null, editMessage: null, deleteMessage: null,
      attach: null, resolveThread: null, reopenThread: null, pin: null
    })
  }
})
const emit = defineEmits(['send', 'edit-message', 'delete-message', 'attach', 'resolve-thread', 'reopen-thread', 'pin'])

const draft = ref('')
const fileInput = ref(null)
let editing = null

function initials(n) { return (n || '').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() }
function fmtDate(d) { try { return new Date(d).toLocaleString() } catch { return d } }

function send() {
  const text = draft.value.trim()
  if (!text && (!fileInput.value || !fileInput.value.files.length)) return
  const payload = { text, attachments: [] }
  props.handlers?.send?.(payload, props.docId)
  emit('send', payload, props.docId)
  draft.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

function onAttach(e) {
  const files = Array.from(e.target.files || [])
  props.handlers?.attach?.(files, props.docId)
  emit('attach', files, props.docId)
}

function edit(m) {
  editing = m
  const newText = window.prompt('Edit message', m.content)
  if (newText == null) return
  const edited = { ...m, content: newText }
  props.handlers?.editMessage?.(edited, props.docId)
  emit('edit-message', edited, props.docId)
}
</script>
