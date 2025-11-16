<template>
    <div class="min-h-screen bg-abyss-900 p-6">
        <div class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="mb-6 flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-platinum-50 font-heading">Members</h1>
                    <p class="text-platinum-600 text-sm">Manage roles, activation, and membership lifecycle.</p>
                </div>

                <!-- Quick actions -->
                <div class="flex gap-2">
                    <button
                        class="px-3 py-2 rounded-md border border-kaitoke-green-700/60 text-kaitoke-green-300 hover:bg-kaitoke-green-900/30"
                        @click="openInviteDrawer = true">
                        Invite Member
                    </button>
                    <label
                        class="px-3 py-2 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-800 cursor-pointer">
                        Import CSV
                        <input type="file" class="hidden" accept=".csv" @change="handleCsvImport" />
                    </label>
                    <button class="px-3 py-2 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-800"
                        @click="exportCsv">
                        Export CSV
                    </button>
                </div>
            </div>

            <!-- KPI cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiCard title="Total" :value="members.length" />
                <KpiCard title="Active" :value="counts.active" />
                <KpiCard title="Pending Requests" :value="counts.pendingRequests" @click="goRequests()" />
                <KpiCard title="Via Invite" :value="counts.joinedViaInvite" />
            </div>

            <!-- Filters / Toolbar -->
            <div class="bg-abyss-800 border border-abyss-700 rounded-lg p-4 mb-4">
                <div class="flex flex-col xl:flex-row gap-3 xl:items-end">
                    <div class="flex-1">
                        <label class="block text-xs text-platinum-600 mb-1">Search</label>
                        <input v-model="filters.q" type="text" placeholder="Name, email, role…"
                            class="w-full px-3 py-2 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 placeholder-platinum-700 focus:outline-none focus:border-kaitoke-green-600" />
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label class="block text-xs text-platinum-600 mb-1">Role</label>
                            <select v-model="filters.role"
                                class="w-full px-3 py-2 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 focus:outline-none focus:border-kaitoke-green-600">
                                <option value="all">All</option>
                                <option v-for="r in roleOptions" :key="r" :value="r">{{ toTitle(r) }}</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs text-platinum-600 mb-1">Status</label>
                            <select v-model="filters.active"
                                class="w-full px-3 py-2 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 focus:outline-none focus:border-kaitoke-green-600">
                                <option value="all">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs text-platinum-600 mb-1">Join Method</label>
                            <select v-model="filters.joinMethod"
                                class="w-full px-3 py-2 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 focus:outline-none focus:border-kaitoke-green-600">
                                <option value="all">All</option>
                                <option value="invited">Invited</option>
                                <option value="requested">Requested</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs text-platinum-600 mb-1">Sort</label>
                            <select v-model="filters.sort"
                                class="w-full px-3 py-2 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 focus:outline-none focus:border-kaitoke-green-600">
                                <option value="joined_desc">Newest</option>
                                <option value="joined_asc">Oldest</option>
                                <option value="name_asc">Name A–Z</option>
                                <option value="name_desc">Name Z–A</option>
                                <option value="role_asc">Role A–Z</option>
                                <option value="role_desc">Role Z–A</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs text-platinum-600 mb-1">From</label>
                            <input type="date" v-model="filters.from"
                                class="w-full px-3 py-2 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 focus:outline-none focus:border-kaitoke-green-600" />
                        </div>
                        <div>
                            <label class="block text-xs text-platinum-600 mb-1">To</label>
                            <input type="date" v-model="filters.to"
                                class="w-full px-3 py-2 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 focus:outline-none focus:border-kaitoke-green-600" />
                        </div>
                    </div>

                    <div class="xl:ml-auto">
                        <button @click="resetFilters"
                            class="px-3 py-2 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-700">
                            Reset
                        </button>
                    </div>
                </div>

                <!-- Status summaries -->
                <div class="mt-3 flex flex-wrap gap-2 text-xs">
                    <span class="px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-300 border border-amber-700/40">
                        Officers: {{ counts.byRole.officer }}
                    </span>
                    <span class="px-2 py-0.5 rounded-full bg-sun-900/30 text-sun-300 border border-sun-700/40">
                        Coordinators: {{ counts.byRole.coordinator }}
                    </span>
                    <span
                        class="px-2 py-0.5 rounded-full bg-kaitoke-green-900/30 text-kaitoke-green-300 border border-kaitoke-green-800/50">
                        Members: {{ counts.byRole.member }}
                    </span>
                    <span class="px-2 py-0.5 rounded-full bg-abyss-700 text-platinum-300 border border-abyss-600">
                        Inactive: {{ counts.inactive }}
                    </span>
                </div>
            </div>

            <!-- Bulk actions -->
            <div class="flex items-center justify-between mb-2">
                <div class="text-sm text-platinum-600">
                    Selected: <span class="text-platinum-50 font-medium">{{ selectedIds.size }}</span>
                </div>
                <div class="flex flex-wrap gap-2">
                    <RoleSelect :value="bulkRole" @update:value="bulkRole = $event" />
                    <button
                        class="px-3 py-1.5 rounded-md border border-kaitoke-green-700/60 text-kaitoke-green-300 hover:bg-kaitoke-green-900/30 disabled:opacity-40"
                        :disabled="!selectedIds.size || isBusy" @click="bulkChangeRole">
                        Bulk Change Role
                    </button>
                    <button
                        class="px-3 py-1.5 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-800 disabled:opacity-40"
                        :disabled="!selectedIds.size || isBusy" @click="bulkToggleActive(true)">
                        Activate
                    </button>
                    <button
                        class="px-3 py-1.5 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-800 disabled:opacity-40"
                        :disabled="!selectedIds.size || isBusy" @click="bulkToggleActive(false)">
                        Deactivate
                    </button>
                    <button
                        class="px-3 py-1.5 rounded-md border border-rose-700/50 text-rose-300 hover:bg-rose-900/30 disabled:opacity-40"
                        :disabled="!selectedIds.size || isBusy" @click="confirmBulkRemove">
                        Remove
                    </button>
                </div>
            </div>

            <!-- Members table -->
            <div class="overflow-hidden rounded-lg border border-abyss-700">
                <table class="min-w-full divide-y divide-abyss-700">
                    <thead class="bg-abyss-800">
                        <tr class="text-left text-xs font-semibold uppercase tracking-wider text-platinum-400">
                            <th class="px-4 py-3 w-10">
                                <input type="checkbox" :checked="allOnPageSelected" @change="toggleSelectAllOnPage" />
                            </th>
                            <th class="px-4 py-3">Name</th>
                            <th class="px-4 py-3">Email</th>
                            <th class="px-4 py-3">Role</th>
                            <th class="px-4 py-3">Joined</th>
                            <th class="px-4 py-3">Via</th>
                            <th class="px-4 py-3">Active</th>
                            <th class="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-abyss-800 bg-abyss-900">
                        <tr v-for="m in paginatedMembers" :key="m.id" class="text-sm">
                            <td class="px-4 py-3">
                                <input type="checkbox" :checked="selectedIds.has(m.id)" @change="toggleSelect(m.id)" />
                            </td>
                            <td class="px-4 py-3 text-platinum-50 font-medium">{{ m.name }}</td>
                            <td class="px-4 py-3 text-platinum-300">{{ m.email }}</td>
                            <td class="px-4 py-3">
                                <RoleSelect :value="m.role" @update:value="v => changeRole(m.id, v)" />
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap text-platinum-200">{{ fmtDate(m.joinedAt) }}</td>
                            <td class="px-4 py-3">
                                <StatusPill :kind="m.joinMethod" />
                            </td>
                            <td class="px-4 py-3">
                                <label class="inline-flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" :checked="m.active" @change="toggleActive(m.id)"
                                        class="w-5 h-5 rounded border-abyss-600 text-kaitoke-green-500 focus:ring-kaitoke-green-500" />
                                    <span class="text-xs"
                                        :class="m.active ? 'text-kaitoke-green-300' : 'text-platinum-500'">
                                        {{ m.active ? 'Active' : 'Inactive' }}
                                    </span>
                                </label>
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex justify-end gap-2">
                                    <router-link
                                        class="px-3 py-1.5 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-800"
                                        :to="{ name: 'org.member.profile', params: { id: m.id } }">
                                        View
                                    </router-link>
                                    <button
                                        class="px-3 py-1.5 rounded-md border border-abyss-600 text-platinum-200 hover:bg-abyss-800"
                                        @click="openLog(m)">
                                        Log
                                    </button>
                                    <button
                                        class="px-3 py-1.5 rounded-md border border-rose-700/50 text-rose-300 hover:bg-rose-900/30"
                                        @click="confirmRemove(m)">
                                        Remove
                                    </button>
                                </div>
                            </td>
                        </tr>

                        <tr v-if="paginatedMembers.length === 0">
                            <td colspan="8" class="px-4 py-10 text-center text-platinum-600">No members found</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <Pagination class="mt-4" :page="page" :page-size="pageSize" :total="filteredMembers.length"
                @update:page="page = $event" @update:page-size="pageSize = $event" />
        </div>

        <!-- Toast -->
        <transition name="fade">
            <div v-if="toast"
                class="fixed bottom-4 right-4 px-4 py-3 bg-kaitoke-green-600 text-abyss-900 font-medium rounded-lg shadow-lg">
                {{ toast }}
            </div>
        </transition>

        <!-- Confirm remove (single) -->
        <ConfirmDialog v-model:open="confirmRemoveOpen" title="Remove member?"
            description="This revokes access to the organization. You can re-invite later." confirm-text="Remove"
            variant="danger" @confirm="removeConfirmed" />

        <!-- Confirm remove (bulk) -->
        <ConfirmDialog v-model:open="confirmBulkRemoveOpen" title="Remove selected members?"
            description="This will remove all selected members from the organization." confirm-text="Remove"
            variant="danger" @confirm="bulkRemoveConfirmed" />

        <!-- Invite drawer -->
        <transition name="slide">
            <div v-if="openInviteDrawer" class="fixed inset-0 z-50">
                <div class="absolute inset-0 bg-black/40" @click="openInviteDrawer = false"></div>
                <div
                    class="absolute right-0 top-0 h-full w-full max-w-md bg-abyss-900 border-l border-abyss-700 p-5 overflow-y-auto">
                    <div class="flex items-center justify-between mb-4">
                        <div class="text-platinum-50 font-semibold">Invite Member</div>
                        <button
                            class="px-3 py-1.5 rounded-md border border-abyss-600 text-platinum-200 hover:bg-abyss-800"
                            @click="openInviteDrawer = false">Close</button>
                    </div>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs text-platinum-600 mb-1">Email</label>
                            <input v-model="inviteForm.email" type="email"
                                class="w-full px-3 py-2 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 focus:outline-none focus:border-kaitoke-green-600"
                                placeholder="member@example.com" />
                        </div>
                        <div>
                            <label class="block text-xs text-platinum-600 mb-1">Role</label>
                            <select v-model="inviteForm.role"
                                class="w-full px-3 py-2 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 focus:outline-none focus:border-kaitoke-green-600">
                                <option v-for="r in roleOptions" :key="r" :value="r">{{ toTitle(r) }}</option>
                            </select>
                        </div>
                        <div class="flex justify-end">
                            <button
                                class="px-3 py-2 rounded-md bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-abyss-900 font-medium disabled:opacity-50"
                                :disabled="!inviteForm.email || !inviteForm.role || isBusy" @click="sendInvite">
                                Send Invite
                            </button>
                        </div>
                    </div>
                    <div v-if="recentInvite"
                        class="mt-6 rounded-md border border-kaitoke-green-800/50 bg-kaitoke-green-900/20 p-3">
                        <div class="text-platinum-50 text-sm mb-2">Invite created</div>
                        <div class="text-xs text-platinum-400 break-all">{{ recentInvite.url }}</div>
                        <div class="mt-2">
                            <button
                                class="px-3 py-1.5 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-800"
                                @click="copyToClipboard(recentInvite.url)">
                                Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Activity log drawer -->
        <transition name="slide">
            <div v-if="logDrawer.open" class="fixed inset-0 z-50">
                <div class="absolute inset-0 bg-black/40" @click="logDrawer.open = false"></div>
                <div
                    class="absolute right-0 top-0 h-full w-full max-w-md bg-abyss-900 border-l border-abyss-700 p-5 overflow-y-auto">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <div class="text-platinum-50 font-semibold">Activity Log</div>
                            <div class="text-platinum-500 text-sm">{{ logDrawer.item?.name }} — {{ logDrawer.item?.email
                                }}</div>
                        </div>
                        <button
                            class="px-3 py-1.5 rounded-md border border-abyss-600 text-platinum-200 hover:bg-abyss-800"
                            @click="logDrawer.open = false">Close</button>
                    </div>
                    <ul class="space-y-3">
                        <li v-for="(h, idx) in (logDrawer.item?.history || [])" :key="idx"
                            class="rounded-md border border-abyss-700 p-3">
                            <div class="text-platinum-100 capitalize">{{ h.action }}</div>
                            <div class="text-platinum-500 text-xs">{{ fmtDateTime(h.at) }}</div>
                            <div v-if="h.note" class="text-platinum-300 text-sm mt-1">{{ h.note }}</div>
                        </li>
                        <li v-if="!(logDrawer.item?.history || []).length" class="text-platinum-500 text-sm">No history.
                        </li>
                    </ul>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'

/* ---------------- Inline UI Components ---------------- */
const KpiCard = {
    props: { title: String, value: [String, Number] },
    template: `
    <div class="rounded-lg border border-abyss-700 bg-abyss-800 p-4">
      <div class="text-platinum-500 text-sm">{{ title }}</div>
      <div class="text-platinum-50 text-2xl font-semibold mt-1">{{ value }}</div>
    </div>`
}

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
      <option v-for="r in roles" :key="r" :value="r">{{ r.charAt(0).toUpperCase() + r.slice(1) }}</option>
    </select>
  `
}

const Pagination = {
    props: { page: Number, pageSize: Number, total: Number },
    emits: ['update:page', 'update:page-size'],
    computed: {
        totalPages() { return Math.max(1, Math.ceil(this.total / this.pageSize)) }
    },
    methods: {
        go(p) { if (p >= 1 && p <= this.totalPages) this.$emit('update:page', p) }
    },
    template: `
  <div class="flex items-center justify-between gap-3 text-sm">
    <div class="flex items-center gap-2">
      <span class="text-platinum-400">Rows:</span>
      <select class="px-2 py-1 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50"
              :value="pageSize" @change="$emit('update:page-size', +$event.target.value)">
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
      </select>
    </div>
    <div class="text-platinum-400">Page <span class="text-platinum-50 font-medium">{{ page }}</span> of <span class="text-platinum-50 font-medium">{{ totalPages }}</span></div>
    <div class="flex gap-2">
      <button class="px-3 py-1.5 rounded-md border border-abyss-600 text-platinum-200 hover:bg-abyss-800"
              :disabled="page<=1" @click="go(page-1)">Prev</button>
      <button class="px-3 py-1.5 rounded-md border border-abyss-600 text-platinum-200 hover:bg-abyss-800"
              :disabled="page>=totalPages" @click="go(page+1)">Next</button>
    </div>
  </div>`
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
        <button class="px-3 py-1.5 rounded-md border border-abyss-600 text-platinum-200 hover:bg-abyss-800" @click="close">{{ cancelText }}</button>
        <button :class="['px-3 py-1.5 rounded-md border',
          variant==='danger' ? 'border-rose-700/50 text-rose-300 hover:bg-rose-900/30' : 'border-abyss-600 text-platinum-200 hover:bg-abyss-800']"
          @click="confirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>`
}

/* ---------------- State & Mock Data (swap with API later) ---------------- */
const members = ref([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'member', joinedAt: Date.now() - 7 * 864e5, joinMethod: 'requested', active: true, history: [{ at: Date.now() - 7 * 864e5, action: 'joined (request approved)' }] },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'coordinator', joinedAt: Date.now() - 30 * 864e5, joinMethod: 'invited', active: true, history: [{ at: Date.now() - 30 * 864e5, action: 'invited' }, { at: Date.now() - 29.8 * 864e5, action: 'accepted' }] },
    { id: 3, name: 'Mike Chan', email: 'mike@example.com', role: 'member', joinedAt: Date.now() - 3 * 864e5, joinMethod: 'requested', active: false, history: [{ at: Date.now() - 3 * 864e5, action: 'joined (request approved)' }, { at: Date.now() - 1 * 864e5, action: 'deactivated', note: 'On leave' }] },
    { id: 4, name: 'Ava Reyes', email: 'ava@example.com', role: 'officer', joinedAt: Date.now() - 120 * 864e5, joinMethod: 'invited', active: true, history: [{ at: Date.now() - 120 * 864e5, action: 'invited' }, { at: Date.now() - 119.9 * 864e5, action: 'accepted' }] },
])

/* Pending request count (for KPI) — you can fetch from /org/membership/requests */
const counts = computed(() => ({
    active: members.value.filter(m => m.active).length,
    inactive: members.value.filter(m => !m.active).length,
    byRole: {
        officer: members.value.filter(m => m.role === 'officer').length,
        coordinator: members.value.filter(m => m.role === 'coordinator').length,
        member: members.value.filter(m => m.role === 'member').length
    },
    joinedViaInvite: members.value.filter(m => m.joinMethod === 'invited').length,
    pendingRequests: 3 // mock; replace with API count
}))

/* Filters & pagination */
const filters = reactive({ q: '', role: 'all', active: 'all', joinMethod: 'all', sort: 'joined_desc', from: '', to: '' })
const roleOptions = ['officer', 'coordinator', 'member']
const page = ref(1)
const pageSize = ref(10)

/* Derived lists */
const filteredMembers = computed(() => {
    let list = [...members.value]
    const { q, role, active, joinMethod, from, to, sort } = filters

    if (role !== 'all') list = list.filter(m => m.role === role)
    if (active !== 'all') list = list.filter(m => m.active === (active === 'active'))
    if (joinMethod !== 'all') list = list.filter(m => m.joinMethod === joinMethod)
    if (q) {
        const qq = q.toLowerCase()
        list = list.filter(m =>
            m.name.toLowerCase().includes(qq) ||
            m.email.toLowerCase().includes(qq) ||
            m.role.toLowerCase().includes(qq)
        )
    }
    if (from) list = list.filter(m => new Date(m.joinedAt) >= new Date(from))
    if (to) list = list.filter(m => new Date(m.joinedAt) <= endOfDay(new Date(to)))

    switch (sort) {
        case 'joined_desc': list.sort((a, b) => b.joinedAt - a.joinedAt); break
        case 'joined_asc': list.sort((a, b) => a.joinedAt - b.joinedAt); break
        case 'name_asc': list.sort((a, b) => a.name.localeCompare(b.name)); break
        case 'name_desc': list.sort((a, b) => b.name.localeCompare(a.name)); break
        case 'role_asc': list.sort((a, b) => a.role.localeCompare(b.role)); break
        case 'role_desc': list.sort((a, b) => b.role.localeCompare(a.role)); break
    }

    return list
})

const paginatedMembers = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return filteredMembers.value.slice(start, start + pageSize.value)
})

/* Selection + bulk */
const selectedIds = reactive(new Set())
const allOnPageSelected = computed(() =>
    paginatedMembers.value.length > 0 && paginatedMembers.value.every(m => selectedIds.has(m.id))
)
function toggleSelect(id) { selectedIds.has(id) ? selectedIds.delete(id) : selectedIds.add(id) }
function toggleSelectAllOnPage(e) { e.target.checked ? paginatedMembers.value.forEach(m => selectedIds.add(m.id)) : paginatedMembers.value.forEach(m => selectedIds.delete(m.id)) }

/* Actions */
const isBusy = ref(false)
function changeRole(id, role) {
    isBusy.value = true
    setTimeout(() => {
        const m = members.value.find(x => x.id === id); if (!m) return
        m.role = role
        m.history.push({ at: Date.now(), action: 'role changed', note: `to ${role}` })
        toastMsg('Role updated')
        isBusy.value = false
    }, 300)
}

function toggleActive(id) {
    isBusy.value = true
    setTimeout(() => {
        const m = members.value.find(x => x.id === id); if (!m) return
        m.active = !m.active
        m.history.push({ at: Date.now(), action: m.active ? 'activated' : 'deactivated' })
        toastMsg(m.active ? 'Member activated' : 'Member deactivated')
        isBusy.value = false
    }, 250)
}

/* Bulk actions */
const bulkRole = ref('member')
function bulkChangeRole() {
    if (!selectedIds.size) return
    isBusy.value = true
    setTimeout(() => {
        members.value.forEach(m => { if (selectedIds.has(m.id)) { m.role = bulkRole.value; m.history.push({ at: Date.now(), action: 'role changed (bulk)', note: `to ${bulkRole.value}` }) } })
        toastMsg('Bulk role change applied')
        isBusy.value = false
    }, 500)
}
function bulkToggleActive(state) {
    if (!selectedIds.size) return
    isBusy.value = true
    setTimeout(() => {
        members.value.forEach(m => { if (selectedIds.has(m.id)) { m.active = state; m.history.push({ at: Date.now(), action: state ? 'activated (bulk)' : 'deactivated (bulk)' }) } })
        toastMsg(state ? 'Activated selected' : 'Deactivated selected')
        isBusy.value = false
    }, 450)
}

/* Remove (single & bulk) */
const confirmRemoveOpen = ref(false)
const confirmBulkRemoveOpen = ref(false)
const removeTarget = ref(null)

function confirmRemove(m) { removeTarget.value = m; confirmRemoveOpen.value = true }
function removeConfirmed() {
    if (!removeTarget.value) return
    members.value = members.value.filter(x => x.id !== removeTarget.value.id)
    toastMsg('Member removed')
    removeTarget.value = null
}
function confirmBulkRemove() { confirmBulkRemoveOpen.value = true }
function bulkRemoveConfirmed() {
    members.value = members.value.filter(x => !selectedIds.has(x.id))
    selectedIds.clear()
    toastMsg('Removed selected members')
}

/* Log drawer */
const logDrawer = reactive({ open: false, item: null })
function openLog(m) { logDrawer.item = m; logDrawer.open = true }

/* Invite drawer */
const openInviteDrawer = ref(false)
const inviteForm = reactive({ email: '', role: 'member' })
const recentInvite = ref(null)
function sendInvite() {
    if (!inviteForm.email || !inviteForm.role) return
    const code = Math.random().toString(36).slice(2, 10).toUpperCase()
    recentInvite.value = { url: `${window.location.origin}/join-club?invite=${code}` }
    toastMsg('Invite created')
    // Optionally: POST /org/invites
}
function copyToClipboard(text) { navigator.clipboard.writeText(text); toastMsg('Invite link copied') }

/* CSV */
function exportCsv() {
    const header = ['id', 'name', 'email', 'role', 'joinedAt', 'joinMethod', 'active']
    const rows = members.value.map(m => [m.id, csvEsc(m.name), csvEsc(m.email), m.role, new Date(m.joinedAt).toISOString(), m.joinMethod, m.active])
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'members.csv'; a.click()
    URL.revokeObjectURL(url)
}
function handleCsvImport(e) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
        const text = String(reader.result || '')
        const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean)
        const headers = headerLine.split(',').map(h => h.trim())
        const idx = (k) => headers.indexOf(k)
        const next = [...members.value]
        lines.forEach(line => {
            const cols = parseCsvLine(line)
            const item = {
                id: Number(cols[idx('id')] || Date.now()),
                name: cols[idx('name')] || 'Unknown',
                email: cols[idx('email')] || '',
                role: cols[idx('role')] || 'member',
                joinedAt: Date.parse(cols[idx('joinedAt')] || new Date()),
                joinMethod: cols[idx('joinMethod')] || 'invited',
                active: (cols[idx('active')] || 'true') === 'true',
                history: [{ at: Date.now(), action: 'imported' }]
            }
            next.push(item)
        })
        members.value = next
        toastMsg('CSV imported')
    }
    reader.readAsText(file)
}

/* Navigation */
function goRequests() { // open combined Requests & Invites page
    // this route name should match your sidebar route
    // e.g., this.$router.push({ name: 'org.requests-invites' })
    if (typeof window !== 'undefined') console.log('[nav] go to Requests & Invites')
}

/* Utilities */
const toast = ref('')
function toastMsg(msg) { toast.value = msg; setTimeout(() => toast.value = '', 2000) }
function resetFilters() { filters.q = ''; filters.role = 'all'; filters.active = 'all'; filters.joinMethod = 'all'; filters.sort = 'joined_desc'; filters.from = ''; filters.to = ''; page.value = 1 }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
function fmtDateTime(d) { return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
function endOfDay(d) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x }
function toTitle(s) { return s.charAt(0).toUpperCase() + s.slice(1) }
function csvEsc(v) { const s = String(v).replace(/"/g, '""'); return /[",\n]/.test(s) ? `"${s}"` : s }
function parseCsvLine(line) {
    const out = []; let cur = ''; let inQ = false
    for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (ch === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else { inQ = !inQ } }
        else if (ch === ',' && !inQ) { out.push(cur); cur = '' }
        else { cur += ch }
    }
    out.push(cur); return out
}
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

.slide-enter-active,
.slide-leave-active {
    transition: transform .25s ease, opacity .25s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(100%);
    opacity: 0;
}
</style>
