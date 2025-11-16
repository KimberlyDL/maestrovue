<!-- src\components\doc\doc_reviewers.vue -->
<!-- src/components/doc/doc_reviewers.vue -->
<template>
  <section class="w-full rounded-2xl border border-platinum-300/60 bg-white/80 dark:bg-abyss-800/70 p-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h4 class="font-heading text-[14px] font-semibold text-abyss-900 dark:text-platinum-50">Reviewers</h4>
        <p class="text-[12px] text-abyss-500 dark:text-platinum-400">
          {{ approvedCount }} / {{ reviewers.length }} approved
          <span v-if="pendingCount">• {{ pendingCount }} pending</span>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button class="rounded-lg px-2.5 py-1.5 text-[12px] font-medium ring-1 ring-platinum-300
                 hover:bg-platinum-100/60 dark:hover:bg-abyss-700
                 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!hasSelection"
          @click="handleBulk('bulkRemind')">
          Remind Selected
        </button>

        <button class="rounded-lg px-2.5 py-1.5 text-[12px] font-medium ring-1 ring-platinum-300
                 hover:bg-platinum-100/60 dark:hover:bg-abyss-700
                 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!hasSelection"
          @click="handleBulk('bulkApprove')">
          Mark Approved
        </button>

        <button class="rounded-lg px-2.5 py-1.5 text-[12px] font-medium ring-1 ring-platinum-300
                 hover:bg-platinum-100/60 dark:hover:bg-abyss-700
                 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!hasSelection"
          @click="handleBulk('bulkRequestChanges')">
          Request Changes
        </button>

        <button class="rounded-lg px-2.5 py-1.5 text-[12px] font-medium ring-1 ring-platinum-300
                 hover:bg-platinum-100/60 dark:hover:bg-abyss-700
                 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!hasSelection" @click="clearSelection">
          Clear
        </button>
      </div>
    </div>

    <!-- Groups by org -->
    <div class="mt-4 space-y-5">
      <div v-for="(members, org) in grouped" :key="org"
        class="rounded-xl overflow-hidden ring-1 ring-platinum-300/50 dark:ring-abyss-700/60">
        <div class="flex items-center justify-between bg-platinum-50/60 dark:bg-abyss-700/50 px-3 py-2">
          <div class="flex items-center gap-2">
            <span class="text-[12px] font-medium text-abyss-700 dark:text-platinum-200">{{ org }}</span>
            <span class="text-[11px] text-abyss-500 dark:text-platinum-400">
              ({{ approvedInGroup(members) }}/{{ members.length }} approved)
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button class="text-[11px] rounded-lg px-2 py-1 ring-1 ring-platinum-300
                     hover:bg-platinum-100/60 dark:hover:bg-abyss-700" @click="selectGroup(members)">
              Select Group
            </button>

            <button class="text-[11px] rounded-lg px-2 py-1 ring-1 ring-platinum-300
                     hover:bg-platinum-100/60 dark:hover:bg-abyss-700" @click="deselectGroup(members)">
              Deselect Group
            </button>
          </div>
        </div>

        <ul class="divide-y divide-platinum-200/70 dark:divide-abyss-700">
          <li v-for="r in members" :key="r.id"
            class="flex items-center gap-3 bg-white/70 dark:bg-abyss-800/40 px-3 py-2">
            <!-- Select -->
            <input type="checkbox"
              class="h-4 w-4 rounded border-platinum-300 text-kaitoke-green-600 focus:ring-kaitoke-green-400"
              :checked="selectedIds.has(r.id)" @change="toggleSelect(r.id)" />

            <!-- Avatar -->
            <div class="h-8 w-8 rounded-full bg-platinum-100 dark:bg-abyss-700 overflow-hidden
                     flex items-center justify-center text-[11px] font-semibold">
              <img v-if="r.avatar" :src="r.avatar" alt="" class="h-full w-full object-cover" />
              <span v-else>{{ initials(r.name) }}</span>
            </div>

            <!-- Info -->
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <p class="truncate text-[13px] font-medium text-abyss-900 dark:text-platinum-100">{{ r.name }}</p>
                <span :class="statusBadgeClass(r.status)"
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ring-1">
                  {{ r.status || 'Pending' }}
                </span>
                <span v-if="r.deadline" class="inline-flex items-center rounded-full bg-platinum-100 text-abyss-700
                         ring-1 ring-platinum-300 px-2 py-0.5 text-[10px]">
                  Due: {{ fmtDate(r.deadline) }}
                </span>
              </div>
              <p class="truncate text-[11px] text-abyss-500 dark:text-platinum-400">
                Role: {{ r.role || 'Reviewer' }} • {{ r.email || 'no-email' }}
              </p>
            </div>

            <!-- Row menu -->
            <div class="relative">
              <button class="rounded-lg p-2 hover:bg-platinum-100/60 dark:hover:bg-abyss-700"
                @click.stop="toggleRowMenu(r.id)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                </svg>
              </button>

              <div v-if="openMenuId === r.id"
                class="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-xl border border-platinum-300/60 bg-white dark:bg-abyss-800 shadow-lg">
                <ul class="py-1 text-[13px]">
                  <li>
                    <button class="w-full text-left px-3 py-2 hover:bg-platinum-100/60 dark:hover:bg-abyss-700"
                      @click="exec('remind', r)">
                      Remind
                    </button>
                  </li>
                  <li>
                    <button class="w-full text-left px-3 py-2 hover:bg-platinum-100/60 dark:hover:bg-abyss-700"
                      @click="exec('approve', r)">
                      Mark Approved
                    </button>
                  </li>
                  <li>
                    <button class="w-full text-left px-3 py-2 hover:bg-platinum-100/60 dark:hover:bg-abyss-700"
                      @click="exec('requestChanges', r)">
                      Request Changes
                    </button>
                  </li>
                  <li>
                    <button class="w-full text-left px-3 py-2 hover:bg-platinum-100/60 dark:hover:bg-abyss-700"
                      @click="exec('openMessage', r)">
                      Open Message
                    </button>
                  </li>
                  <li>
                    <button class="w-full text-left px-3 py-2 hover:bg-platinum-100/60 dark:hover:bg-abyss-700"
                      @click="exec('setDeadline', r)">
                      Set Deadline
                    </button>
                  </li>
                  <li>
                    <button class="w-full text-left px-3 py-2 hover:bg-platinum-100/60 dark:hover:bg-abyss-700"
                      @click="exec('addNote', r)">
                      Add Note
                    </button>
                  </li>
                  <li>
                    <button class="w-full text-left px-3 py-2 hover:bg-platinum-100/60 dark:hover:bg-abyss-700"
                      @click="exec('reassign', r)">
                      Reassign
                    </button>
                  </li>
                  <li>
                    <button class="w-full text-left px-3 py-2 hover:bg-platinum-100/60 dark:hover:bg-abyss-700"
                      @click="exec('changeRole', r)">
                      Change Role
                    </button>
                  </li>
                  <li>
                    <button
                      class="w-full text-left px-3 py-2 text-red-600 hover:bg-platinum-100/60 dark:hover:bg-abyss-700"
                      @click="exec('remove', r)">
                      Remove Reviewer
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  docId: { type: [String, Number], required: true },
  reviewers: { type: Array, required: true },
  currentUser: { type: Object, default: () => ({ id: null, name: 'You', role: 'author' }) },
  handlers: { type: Object, default: () => ({}) },
})

const emit = defineEmits([
  'remind-reviewer', 'approve-reviewer', 'request-changes', 'open-message',
  'set-deadline', 'add-note', 'reassign-reviewer', 'change-role', 'remove-reviewer',
  'bulk-remind', 'bulk-approve', 'bulk-request-changes', 'bulk-clear-selection',
])

const openMenuId = ref(null)
function handleOutside(e) {
  if (!e.target.closest('.menu-item') && !e.target.closest('.menu-button')) openMenuId.value = null
}
onMounted(() => document.addEventListener('click', handleOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleOutside))

const selectedIds = reactive(new Set())

const grouped = computed(() => {
  const g = {}
  for (const r of props.reviewers) {
    const key = r.org || 'Unassigned'
    if (!g[key]) g[key] = []
    g[key].push(r)
  }
  return g
})

const approvedCount = computed(
  () => props.reviewers.filter(r => (r.status || '').toLowerCase() === 'approved').length
)
const pendingCount = computed(
  () => props.reviewers.filter(r => !r.status || (r.status || '').toLowerCase() === 'pending').length
)
const hasSelection = computed(() => selectedIds.size > 0)

function toggleRowMenu(id) { openMenuId.value = openMenuId.value === id ? null : id }
function toggleSelect(id) { selectedIds.has(id) ? selectedIds.delete(id) : selectedIds.add(id) }
function selectGroup(list) { for (const r of list) selectedIds.add(r.id) }
function deselectGroup(list) { for (const r of list) selectedIds.delete(r.id) }
function clearSelection() { selectedIds.clear(); emit('bulk-clear-selection', props.docId) }

function exec(key, reviewer) {
  props.handlers?.[key]?.(reviewer, props.docId)
  const map = {
    remind: 'remind-reviewer',
    approve: 'approve-reviewer',
    requestChanges: 'request-changes',
    openMessage: 'open-message',
    setDeadline: 'set-deadline',
    addNote: 'add-note',
    reassign: 'reassign-reviewer',
    changeRole: 'change-role',
    remove: 'remove-reviewer',
  }
  emit(map[key], reviewer, props.docId)
  openMenuId.value = null
}

function handleBulk(key) {
  const ids = Array.from(selectedIds)
  const reviewers = props.reviewers.filter(r => ids.includes(r.id))
  props.handlers?.[key]?.(reviewers, props.docId)
  const map = {
    bulkRemind: 'bulk-remind',
    bulkApprove: 'bulk-approve',
    bulkRequestChanges: 'bulk-request-changes',
  }
  emit(map[key], reviewers, props.docId)
}

function initials(n) { return (n || '').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() }
function fmtDate(d) { try { return new Date(d).toLocaleDateString() } catch { return d } }
function statusBadgeClass(status = '') {
  const s = (status || '').toLowerCase()
  if (s === 'approved') return 'bg-kaitoke-green-50 text-kaitoke-green-700 ring-kaitoke-green-200'
  if (s === 'reviewed') return 'bg-electric-lime-50 text-electric-lime-700 ring-electric-lime-200'
  if (s === 'pending') return 'bg-platinum-100 text-abyss-700 ring-platinum-300'
  return 'bg-platinum-100 text-abyss-700 ring-platinum-300'
}
</script>
