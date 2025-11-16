<template>
    <div class="min-h-screen bg-abyss-900 p-6" :key="routeKey">
        <div class="max-w-6xl mx-auto">
            <!-- Breadcrumb -->
            <div class="mb-4 flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm">
                    <router-link :to="{ name: 'org.members' }" class="text-platinum-400 hover:text-platinum-100">← Back
                        to Members</router-link>
                    <span class="text-abyss-500">/</span>
                    <span class="text-platinum-300">Member Profile</span>
                </div>
                <span v-if="loading" class="text-sm text-platinum-500">Loading…</span>
            </div>

            <!-- Skeleton while loading -->
            <div v-if="loading" class="space-y-6">
                <div class="rounded-lg border border-abyss-700 bg-abyss-800 p-5 animate-pulse">
                    <div class="h-6 w-40 bg-abyss-700 rounded mb-3"></div>
                    <div class="h-4 w-56 bg-abyss-700 rounded"></div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 space-y-6">
                        <div class="h-64 rounded-lg border border-abyss-700 bg-abyss-800 animate-pulse"></div>
                        <div class="h-64 rounded-lg border border-abyss-700 bg-abyss-800 animate-pulse"></div>
                    </div>
                    <div class="space-y-6">
                        <div class="h-48 rounded-lg border border-abyss-700 bg-abyss-800 animate-pulse"></div>
                        <div class="h-48 rounded-lg border border-abyss-700 bg-abyss-800 animate-pulse"></div>
                        <div class="h-48 rounded-lg border border-abyss-700 bg-abyss-800 animate-pulse"></div>
                    </div>
                </div>
            </div>

            <!-- Not found -->
            <div v-else-if="!member" class="rounded-lg border border-abyss-700 bg-abyss-800 p-10 text-center">
                <div class="text-platinum-50 text-lg font-semibold mb-1">Member not found</div>
                <div class="text-platinum-500 text-sm mb-4">The member doesn’t exist or was removed.</div>
                <router-link :to="{ name: 'org.members' }"
                    class="inline-flex items-center px-4 py-2 rounded-md border border-platinum-700 text-red-200 hover:bg-abyss-700">Go
                    to Members</router-link>
            </div>

            <!-- Content -->
            <template v-else>
                <!-- Header card -->
                <div class="rounded-lg border border-abyss-700 bg-abyss-800 p-5 mb-6">
                    <div class="flex items-start justify-between">
                        <div class="flex items-start gap-4">
                            <div
                                class="h-12 w-12 rounded-full bg-abyss-900 border border-abyss-700 flex items-center justify-center text-platinum-300">
                                {{ initials(member?.name) }}
                            </div>
                            <div>
                                <div class="text-2xl text-platinum-50 font-semibold">{{ member?.name }}</div>
                                <div class="text-platinum-400 text-sm">{{ member?.email }}</div>
                                <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                    <span
                                        class="px-2 py-0.5 rounded-full border border-abyss-600 text-platinum-300 bg-abyss-900">
                                        Role: <strong class="ml-1">{{ title(member?.role) }}</strong>
                                    </span>
                                    <span
                                        class="px-2 py-0.5 rounded-full border border-abyss-600 text-platinum-300 bg-abyss-900">
                                        Joined: <strong class="ml-1">{{ fmtDate(member?.joinedAt) }}</strong>
                                    </span>
                                    <StatusPill :kind="member?.joinMethod" />
                                    <span class="px-2 py-0.5 rounded-full border"
                                        :class="member?.active ? 'border-kaitoke-green-800 text-kaitoke-green-300 bg-kaitoke-green-900/20' : 'border-abyss-600 text-platinum-400 bg-abyss-900'">
                                        {{ member?.active ? 'Active' : 'Inactive' }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-wrap gap-2">
                            <button
                                class="px-3 py-1.5 rounded-md border border-platinum-700 text-platinum-100 hover:bg-abyss-700"
                                @click="copyToClipboard(member?.email)">Copy Email</button>
                            <!-- <router-link :to="{ name: 'admin.chat-threads', query: { to: member?.email } }"
                                class="px-3 py-1.5 rounded-md border border-platinum-700 text-red-200 hover:bg-abyss-700">Message</router-link> -->
                            <button class="px-3 py-1.5 rounded-md border" :class="member?.active
                                ? 'border-abyss-600 text-red-200 hover:bg-abyss-700'
                                : 'border-kaitoke-green-700/60 text-kaitoke-green-300 hover:bg-kaitoke-green-900/30'"
                                @click="toggleActive()">
                                {{ member?.active ? 'Deactivate' : 'Activate' }}
                            </button>
                            <button
                                class="px-3 py-1.5 rounded-md border border-rose-700/50 text-rose-300 hover:bg-rose-900/30"
                                @click="confirmRemoveOpen = true">Remove</button>
                        </div>
                    </div>
                </div>

                <!-- Content grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left: details & role -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Role & access -->
                        <div class="rounded-lg border border-abyss-700 bg-abyss-800 p-5">
                            <div class="flex items-center justify-between mb-3">
                                <div>
                                    <div class="text-platinum-50 font-semibold">Role & Access</div>
                                    <div class="text-platinum-500 text-sm">Change the member’s role and review
                                        permissions.</div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <RoleSelect :value="member?.role" @update:value="changeRole" />
                                    <button
                                        class="px-3 py-1.5 rounded-md border border-platinum-700 text-red-200 hover:bg-abyss-700"
                                        @click="resetRole"
                                        :disabled="!member || member.role === original.role">Reset</button>
                                </div>
                            </div>

                            <!-- Permissions matrix -->
                            <div class="overflow-hidden rounded-md border border-abyss-700">
                                <table class="min-w-full divide-y divide-abyss-700 text-sm">
                                    <thead class="bg-abyss-900 text-platinum-400">
                                        <tr>
                                            <th class="px-3 py-2 text-left">Permission</th>
                                            <th class="px-3 py-2 text-left">Member</th>
                                            <th class="px-3 py-2 text-left">Coordinator</th>
                                            <th class="px-3 py-2 text-left">Officer</th>
                                            <th class="px-3 py-2 text-left">This user</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-abyss-800 bg-abyss-900">
                                        <tr v-for="p in permRows" :key="p.key" class="text-platinum-300">
                                            <td class="px-3 py-2">{{ p.label }}</td>
                                            <td class="px-3 py-2">
                                                <PermDot :on="p.roles.member" />
                                            </td>
                                            <td class="px-3 py-2">
                                                <PermDot :on="p.roles.coordinator" />
                                            </td>
                                            <td class="px-3 py-2">
                                                <PermDot :on="p.roles.officer" />
                                            </td>
                                            <td class="px-3 py-2">
                                                <PermDot :on="checkPermission(member?.role, p.key)" />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Activity timeline -->
                        <div class="rounded-lg border border-abyss-700 bg-abyss-800 p-5">
                            <div class="text-platinum-50 font-semibold mb-3">Activity</div>
                            <ul class="space-y-3" v-if="member?.history?.length">
                                <li v-for="(h, idx) in member.history" :key="idx"
                                    class="rounded-md border border-abyss-700 p-3">
                                    <div class="text-platinum-100 capitalize">{{ h.action }}</div>
                                    <div class="text-platinum-500 text-xs">{{ fmtDateTime(h.at) }}</div>
                                    <div v-if="h.note" class="text-platinum-300 text-sm mt-1">{{ h.note }}</div>
                                </li>
                            </ul>
                            <div v-else class="text-sm text-platinum-500">No history yet.</div>
                        </div>
                    </div>

                    <!-- Right: profile, skills, notes -->
                    <div class="space-y-6">
                        <!-- Profile summary -->
                        <div class="rounded-lg border border-abyss-700 bg-abyss-800 p-5">
                            <div class="text-platinum-50 font-semibold mb-3">Profile</div>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-platinum-500">Email</span>
                                    <span class="text-platinum-100">{{ member?.email }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-platinum-500">Joined</span>
                                    <span class="text-platinum-100">{{ fmtDate(member?.joinedAt) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-platinum-500">Join Method</span>
                                    <span class="text-platinum-100 capitalize">{{ member?.joinMethod }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Skills / Tags -->
                        <div class="rounded-lg border border-abyss-700 bg-abyss-800 p-5">
                            <div class="flex items-center justify-between mb-3">
                                <div class="text-platinum-50 font-semibold">Skills / Tags</div>
                                <div class="flex gap-2">
                                    <input v-model="newTag" type="text" placeholder="Add tag"
                                        class="px-2 py-1 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 placeholder-platinum-700 focus:outline-none focus:border-kaitoke-green-600 w-28">
                                    <button
                                        class="px-2.5 py-1 rounded-md bg-kaitoke-green-600 text-abyss-900 font-medium hover:bg-kaitoke-green-500"
                                        @click="addTag" :disabled="!newTag">Add</button>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-2" v-if="member?.tags?.length">
                                <span v-for="(t, i) in member.tags" :key="i"
                                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-abyss-600 text-red-200 bg-abyss-900 text-xs">
                                    {{ t }}
                                    <button class="text-platinum-400 hover:text-platinum-100"
                                        @click="removeTag(i)">×</button>
                                </span>
                            </div>
                            <div v-else class="text-sm text-platinum-500">No tags yet.</div>
                        </div>

                        <!-- Notes -->
                        <div class="rounded-lg border border-abyss-700 bg-abyss-800 p-5">
                            <div class="flex items-center justify-between mb-3">
                                <div class="text-platinum-50 font-semibold">Notes</div>
                                <button
                                    class="px-3 py-1.5 rounded-md border border-platinum-700 text-red-200 hover:bg-abyss-700"
                                    @click="saveNotes" :disabled="savingNotes">Save</button>
                            </div>
                            <textarea v-model="notes"
                                class="w-full min-h-[140px] px-3 py-2 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 placeholder-platinum-700 focus:outline-none focus:border-kaitoke-green-600"
                                placeholder="Private notes about this member…"></textarea>
                            <div class="mt-2 text-xs text-platinum-500">Visible to officers only.</div>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Toast -->
        <transition name="fade">
            <div v-if="toast"
                class="fixed bottom-4 right-4 px-4 py-3 bg-kaitoke-green-600 text-abyss-900 font-medium rounded-lg shadow-lg">
                {{ toast }}
            </div>
        </transition>

        <!-- Confirm remove -->
        <ConfirmDialog v-model:open="confirmRemoveOpen" title="Remove member?"
            description="This revokes access to the organization. You can re-invite later." confirm-text="Remove"
            variant="danger" @confirm="removeMember" />
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/* ---------- Inline atoms ---------- */
const StatusPill = {
    props: { kind: { type: String, default: 'invited' } },
    computed: {
        label() { return this.kind === 'invited' ? 'Invited' : 'Requested' },
        cls() {
            return this.kind === 'invited'
                ? 'bg-blue-900/30 text-blue-300 border-blue-700/40'
                : 'bg-amber-900/30 text-amber-300 border-amber-700/40'
        }
    },
    template: `<span :class="['inline-flex items-center px-2 py-0.5 rounded-full border text-xs', cls]">{{ label }}</span>`
}

const RoleSelect = {
    props: { value: { type: String, default: 'member' } },
    emits: ['update:value'],
    data: () => ({ roles: ['officer', 'coordinator', 'member'] }),
    template: `
    <select
      class="px-3 py-1.5 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 focus:outline-none focus:border-kaitoke-green-600"
      :value="value"
      @change="$emit('update:value', $event.target.value)"
    >
      <option v-for="r in roles" :key="r" :value="r">{{ r.charAt(0).toUpperCase()+r.slice(1) }}</option>
    </select>`
}

const PermDot = {
    props: { on: Boolean },
    template: `<span :class="['inline-block h-2.5 w-2.5 rounded-full', on ? 'bg-kaitoke-green-500' : 'bg-abyss-600']"></span>`
}

const ConfirmDialog = {
    props: { open: Boolean, title: String, description: String, confirmText: String, cancelText: { default: 'Cancel' }, variant: { default: 'default' } },
    emits: ['update:open', 'confirm'],
    methods: {
        close() { this.$emit('update:open', false) },
        confirm() { this.$emit('confirm'); this.close() }
    },
    template: `
  <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="close"></div>
    <div class="relative w-full max-w-md rounded-xl border border-abyss-700 bg-abyss-900 p-5 shadow-xl">
      <div class="text-lg font-semibold text-platinum-50 mb-1">{{ title }}</div>
      <div class="text-platinum-300 text-sm mb-4">{{ description }}</div>
      <div class="flex justify-end gap-2">
        <button class="px-3 py-1.5 rounded-md border border-abyss-600 text-red-200 hover:bg-abyss-800" @click="close">{{ cancelText }}</button>
        <button :class="['px-3 py-1.5 rounded-md border',
          variant==='danger' ? 'border-rose-700/50 text-rose-300 hover:bg-rose-900/30' : 'border-abyss-600 text-red-200 hover:bg-abyss-800']"
          @click="confirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>`
}

/* ---------- Route + state ---------- */
const route = useRoute()
const router = useRouter()
const routeKey = computed(() => String(route.params.id ?? ''))
const id = computed(() => route.params.id)

const loading = ref(true)
const member = ref(null)
const original = reactive({ role: '' })
const notes = ref('')
const newTag = ref('')
const savingNotes = ref(false)
const toast = ref('')
const confirmRemoveOpen = ref(false)

/* ---------- Mock API (replace with real calls) ---------- */
const MOCK = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'member', joinedAt: Date.now() - 7 * 864e5, joinMethod: 'requested', active: true, tags: ['webdev', 'frontdesk'], history: [{ at: Date.now() - 7 * 864e5, action: 'joined (request approved)' }] },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'coordinator', joinedAt: Date.now() - 30 * 864e5, joinMethod: 'invited', active: true, tags: ['events'], history: [{ at: Date.now() - 30 * 864e5, action: 'invited' }, { at: Date.now() - 29.8 * 864e5, action: 'accepted' }] },
    { id: 3, name: 'Mike Chan', email: 'mike@example.com', role: 'member', joinedAt: Date.now() - 3 * 864e5, joinMethod: 'requested', active: false, tags: [], history: [{ at: Date.now() - 3 * 864e5, action: 'joined (request approved)' }, { at: Date.now() - 1 * 864e5, action: 'deactivated', note: 'On leave' }] },
    { id: 4, name: 'Ava Reyes', email: 'ava@example.com', role: 'officer', joinedAt: Date.now() - 120 * 864e5, joinMethod: 'invited', active: true, tags: ['finance', 'audit'], history: [{ at: Date.now() - 120 * 864e5, action: 'invited' }, { at: Date.now() - 119.9 * 864e5, action: 'accepted' }] },
]

function fetchMemberById(mid) {
    return new Promise(res => {
        setTimeout(() => {
            const m = MOCK.find(x => String(x.id) === String(mid))
            res(m ? JSON.parse(JSON.stringify(m)) : null)
        }, 250)
    })
}
function saveMember(patch) {
    return new Promise(res => setTimeout(() => res({ ok: true, patch }), 200))
}
function removeMemberApi(mid) {
    return new Promise(res => setTimeout(() => res({ ok: true, id: mid }), 250))
}

/* ---------- Permissions ---------- */
const permRows = computed(() => ([
    { key: 'read_docs', label: 'Read documents', roles: { member: true, coordinator: true, officer: true } },
    { key: 'write_docs', label: 'Upload documents', roles: { member: false, coordinator: true, officer: true } },
    { key: 'manage_events', label: 'Manage events', roles: { member: false, coordinator: true, officer: true } },
    { key: 'manage_ops', label: 'Manage operations', roles: { member: false, coordinator: false, officer: true } },
    { key: 'manage_people', label: 'Manage members', roles: { member: false, coordinator: false, officer: true } },
    { key: 'finance', label: 'Finance & budgets', roles: { member: false, coordinator: false, officer: true } }
]))
function checkPermission(role, key) {
    if (!role) return false
    const row = permRows.value.find(r => r.key === key)
    return row ? !!row.roles[role] : false
}

/* ---------- Actions (guarded) ---------- */
function changeRole(newRole) {
    if (!member.value) return
    const prev = member.value.role
    member.value.role = newRole
    member.value.history?.unshift?.({ at: Date.now(), action: 'role changed', note: `from ${prev} to ${newRole}` })
    saveMember({ id: member.value.id, role: newRole }).then(() => toastMsg('Role updated'))
}
function resetRole() {
    if (!member.value) return
    member.value.role = original.role
    member.value.history?.unshift?.({ at: Date.now(), action: 'role reset', note: `to ${original.role}` })
    toastMsg('Role reset')
}
function toggleActive() {
    if (!member.value) return
    member.value.active = !member.value.active
    member.value.history?.unshift?.({ at: Date.now(), action: member.value.active ? 'activated' : 'deactivated' })
    saveMember({ id: member.value.id, active: member.value.active }).then(() =>
        toastMsg(member.value.active ? 'Member activated' : 'Member deactivated')
    )
}
function addTag() {
    if (!member.value || !newTag.value) return
    const tag = newTag.value.trim()
    if (!tag) return
    if (!Array.isArray(member.value.tags)) member.value.tags = []
    member.value.tags.push(tag)
    newTag.value = ''
    saveMember({ id: member.value.id, tags: member.value.tags }).then(() => toastMsg('Tag added'))
}
function removeTag(idx) {
    if (!member.value || !Array.isArray(member.value.tags)) return
    member.value.tags.splice(idx, 1)
    saveMember({ id: member.value.id, tags: member.value.tags }).then(() => toastMsg('Tag removed'))
}
function saveNotes() {
    if (!member.value) return
    savingNotes.value = true
    setTimeout(() => {
        member.value.history?.unshift?.({ at: Date.now(), action: 'note updated' })
        savingNotes.value = false
        toastMsg('Notes saved')
    }, 400)
}
function removeMember() {
    if (!member.value) return
    const currentId = member.value.id
    removeMemberApi(currentId).then(() => {
        toastMsg('Member removed')
        setTimeout(() => {
            router.push({ name: 'org.members' })
        }, 600)
    })
}

/* ---------- Utils (null-safe) ---------- */
function initials(n) { return (n || '').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() || 'M' }
function title(s) { s = s || ''; return s.charAt(0).toUpperCase() + s.slice(1) }
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
function fmtDateTime(d) { if (!d) return '—'; return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
function copyToClipboard(text) { if (!text) return; navigator.clipboard.writeText(text); toastMsg('Copied to clipboard') }
function toastMsg(msg) { toast.value = msg; setTimeout(() => toast.value = '', 1800) }

/* ---------- Load + re-load on :id change ---------- */
async function load() {
    loading.value = true
    member.value = await fetchMemberById(id.value)
    if (member.value) {
        original.role = member.value.role
        notes.value = '' // hydrate if you store notes server-side
    }
    loading.value = false
}
onMounted(load)
watch(id, load)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity .2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
