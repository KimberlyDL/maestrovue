<template>
    <div class="min-h-screen bg-slate-900 p-6">
        <div class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="mb-6 flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-white mb-1">Membership: Requests & Invites</h1>
                    <p class="text-slate-400">Review join requests, manage invites, and track history.</p>
                </div>
                <div class="flex items-center gap-3">
                    <!-- Auto-accept -->
                    <div class="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 flex items-center gap-3">
                        <div class="text-sm">
                            <div class="text-white font-medium">Auto-Accept</div>
                            <div class="text-slate-400 text-xs">Accept if org code is valid</div>
                        </div>
                        <label class="inline-flex items-center gap-2 cursor-pointer">
                            <input v-model="autoAcceptEnabled" type="checkbox" @change="updateAutoAcceptSetting"
                                class="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500" />
                            <span class="text-white text-sm">{{ autoAcceptEnabled ? 'Enabled' : 'Disabled' }}</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="mb-6 border-b border-slate-700">
                <nav class="-mb-px flex gap-6">
                    <button @click="activeTab = 'requests'" :class="tabClass(activeTab === 'requests')">
                        Requests
                        <span class="ml-2 text-xs rounded-full px-2 py-0.5" :class="badgeClass('pending')">{{
                            counts.requests.pending }}</span>
                    </button>
                    <button @click="activeTab = 'invites'" :class="tabClass(activeTab === 'invites')">
                        Invites
                        <span class="ml-2 text-xs rounded-full px-2 py-0.5 bg-slate-700 text-slate-300">
                            {{ activeInvites.length }}
                        </span>
                    </button>
                </nav>
            </div>

            <!-- ===================== REQUESTS TAB ===================== -->
            <section v-if="activeTab === 'requests'" class="space-y-4">
                <!-- Filters / Toolbar -->
                <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <div class="flex flex-col md:flex-row md:items-end gap-3">
                        <div class="flex-1">
                            <label class="block text-xs text-slate-400 mb-1">Search</label>
                            <input v-model="rq.filters.q" type="text"
                                placeholder="Search by name, email, position, note…"
                                class="w-full px-3 py-2 rounded-md bg-slate-900/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Status</label>
                            <select v-model="rq.filters.status"
                                class="px-3 py-2 rounded-md bg-slate-900/70 border border-slate-700 text-white focus:outline-none focus:border-blue-500">
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="declined">Declined</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">From</label>
                            <input v-model="rq.filters.from" type="date"
                                class="px-3 py-2 rounded-md bg-slate-900/70 border border-slate-700 text-white focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">To</label>
                            <input v-model="rq.filters.to" type="date"
                                class="px-3 py-2 rounded-md bg-slate-900/70 border border-slate-700 text-white focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Sort</label>
                            <select v-model="rq.filters.sort"
                                class="px-3 py-2 rounded-md bg-slate-900/70 border border-slate-700 text-white focus:outline-none focus:border-blue-500">
                                <option value="created_desc">Newest</option>
                                <option value="created_asc">Oldest</option>
                                <option value="name_asc">Name A–Z</option>
                                <option value="name_desc">Name Z–A</option>
                            </select>
                        </div>
                        <div class="md:ml-auto">
                            <button @click="resetRequestFilters"
                                class="px-3 py-2 rounded-md border border-slate-600 text-slate-200 hover:bg-slate-700">Reset</button>
                        </div>
                    </div>

                    <!-- Status pills -->
                    <div class="mt-3 flex flex-wrap gap-2 text-xs">
                        <span class="px-2 py-0.5 rounded-full" :class="badgeClass('pending')">
                            Pending: {{ counts.requests.pending }}
                        </span>
                        <span
                            class="px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-700/40">
                            Approved: {{ counts.requests.approved }}
                        </span>
                        <span class="px-2 py-0.5 rounded-full bg-rose-900/30 text-rose-300 border border-rose-700/40">
                            Declined: {{ counts.requests.declined }}
                        </span>
                        <span class="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                            Total: {{ filteredRequests.length }}
                        </span>
                    </div>
                </div>

                <!-- Bulk actions -->
                <div class="flex items-center justify-between">
                    <div class="text-sm text-slate-400">
                        Selected: <span class="text-white font-medium">{{ selectedRequestIds.size }}</span>
                    </div>
                    <div class="flex gap-2">
                        <button
                            class="px-3 py-1.5 rounded-md border border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/30 disabled:opacity-40"
                            :disabled="isProcessing || selectedRequestIds.size === 0" @click="bulkApprove">
                            Bulk Approve
                        </button>
                        <button
                            class="px-3 py-1.5 rounded-md border border-rose-700/50 text-rose-300 hover:bg-rose-900/30 disabled:opacity-40"
                            :disabled="isProcessing || selectedRequestIds.size === 0" @click="bulkDecline">
                            Bulk Decline
                        </button>
                    </div>
                </div>

                <!-- Requests table -->
                <div class="overflow-hidden rounded-lg border border-slate-700">
                    <table class="min-w-full divide-y divide-slate-700">
                        <thead class="bg-slate-800">
                            <tr class="text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                                <th class="px-4 py-3 w-10">
                                    <input type="checkbox" :checked="allRequestsOnPageSelected"
                                        @change="toggleSelectAllOnPage">
                                </th>
                                <th class="px-4 py-3">User</th>
                                <th class="px-4 py-3">Email</th>
                                <th class="px-4 py-3">Position</th>
                                <th class="px-4 py-3">Submitted</th>
                                <th class="px-4 py-3">Status</th>
                                <th class="px-4 py-3">Note</th>
                                <th class="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800 bg-slate-900">
                            <tr v-for="r in paginatedRequests" :key="r.id" class="text-sm">
                                <td class="px-4 py-3">
                                    <input type="checkbox" :checked="selectedRequestIds.has(r.id)"
                                        @change="toggleSelect(r.id)">
                                </td>
                                <td class="px-4 py-3 font-medium text-white">{{ r.userName }}</td>
                                <td class="px-4 py-3 text-slate-300">{{ r.userEmail }}</td>
                                <td class="px-4 py-3 text-slate-200">{{ r.position }}</td>
                                <td class="px-4 py-3 whitespace-nowrap text-slate-200">{{ formatDateTime(r.createdAt) }}
                                </td>
                                <td class="px-4 py-3">
                                    <StatusBadge :status="r.status" />
                                </td>
                                <td class="px-4 py-3 text-slate-300 max-w-[42ch]">
                                    <span class="line-clamp-2">{{ r.message || '—' }}</span>
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex justify-end gap-2">
                                        <button v-if="r.status === 'pending'" @click="approveRequest(r.id)"
                                            :disabled="isProcessing"
                                            class="px-3 py-1.5 rounded-md border border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/30">
                                            Approve
                                        </button>
                                        <button v-if="r.status === 'pending'" @click="declineRequest(r.id)"
                                            :disabled="isProcessing"
                                            class="px-3 py-1.5 rounded-md border border-rose-700/50 text-rose-300 hover:bg-rose-900/30">
                                            Decline
                                        </button>
                                        <button @click="openLog(r)"
                                            class="px-3 py-1.5 rounded-md border border-slate-600 text-slate-200 hover:bg-slate-800">
                                            Log
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="paginatedRequests.length === 0">
                                <td colspan="8" class="px-4 py-10 text-center text-slate-400">No results</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <Pagination :page="rq.page" :page-size="rq.pageSize" :total="filteredRequests.length"
                    @update:page="rq.page = $event" @update:page-size="rq.pageSize = $event" />
            </section>

            <!-- ===================== INVITES TAB ===================== -->
            <section v-else class="space-y-6">
                <!-- Create Invite -->
                <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <h2 class="text-xl font-semibold text-white mb-4">Create Invite</h2>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div class="md:col-span-2">
                            <label class="block text-xs text-slate-400 mb-1">Member Email</label>
                            <input v-model="newInvite.email" type="email" placeholder="member@example.com"
                                class="w-full px-3 py-2 rounded-md bg-slate-900/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Position</label>
                            <select v-model="newInvite.position"
                                class="w-full px-3 py-2 rounded-md bg-slate-900/70 border border-slate-700 text-white focus:outline-none focus:border-blue-500">
                                <option value="">Select position</option>
                                <option value="member">Member</option>
                                <option value="coordinator">Coordinator</option>
                                <option value="manager">Manager</option>
                                <option value="officer">Officer</option>
                            </select>
                        </div>
                        <div class="flex gap-2">
                            <button @click="createInvite" :disabled="isCreating"
                                class="w-full px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white">
                                {{ isCreating ? 'Creating…' : 'Create' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Invite filters -->
                <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <div class="flex flex-col md:flex-row md:items-end gap-3">
                        <div class="flex-1">
                            <label class="block text-xs text-slate-400 mb-1">Search</label>
                            <input v-model="iv.filters.q" type="text" placeholder="Search by email or code…"
                                class="w-full px-3 py-2 rounded-md bg-slate-900/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Status</label>
                            <select v-model="iv.filters.status"
                                class="px-3 py-2 rounded-md bg-slate-900/70 border border-slate-700 text-white focus:outline-none focus:border-blue-500">
                                <option value="all">All</option>
                                <option value="active">Active</option>
                                <option value="used">Used</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs text-slate-400 mb-1">Sort</label>
                            <select v-model="iv.filters.sort"
                                class="px-3 py-2 rounded-md bg-slate-900/70 border border-slate-700 text-white focus:outline-none focus:border-blue-500">
                                <option value="created_desc">Newest</option>
                                <option value="created_asc">Oldest</option>
                                <option value="email_asc">Email A–Z</option>
                                <option value="email_desc">Email Z–A</option>
                            </select>
                        </div>
                        <div class="md:ml-auto">
                            <button @click="resetInviteFilters"
                                class="px-3 py-2 rounded-md border border-slate-600 text-slate-200 hover:bg-slate-700">Reset</button>
                        </div>
                    </div>
                </div>

                <!-- Active invites -->
                <div class="overflow-hidden rounded-lg border border-slate-700">
                    <table class="min-w-full divide-y divide-slate-700">
                        <thead class="bg-slate-800">
                            <tr class="text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                                <th class="px-4 py-3">Email</th>
                                <th class="px-4 py-3">Position</th>
                                <th class="px-4 py-3">Code</th>
                                <th class="px-4 py-3">Created</th>
                                <th class="px-4 py-3">Expires</th>
                                <th class="px-4 py-3">Status</th>
                                <th class="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800 bg-slate-900">
                            <tr v-for="i in paginatedInvites" :key="i.id" class="text-sm">
                                <td class="px-4 py-3 text-white font-medium">{{ i.email }}</td>
                                <td class="px-4 py-3 text-slate-200 capitalize">{{ i.position }}</td>
                                <td class="px-4 py-3 text-slate-300 font-mono">{{ i.code }}</td>
                                <td class="px-4 py-3 text-slate-200">{{ formatDate(i.createdAt) }}</td>
                                <td class="px-4 py-3 text-slate-200">{{ formatDate(i.expiresAt) }}</td>
                                <td class="px-4 py-3">
                                    <StatusBadge :status="i.status" />
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex justify-end gap-2">
                                        <button @click="copyInviteLink(i.code)"
                                            class="px-3 py-1.5 rounded-md border border-slate-600 text-slate-200 hover:bg-slate-800">
                                            Copy Link
                                        </button>
                                        <button v-if="i.status === 'active'" @click="confirmRevoke(i)"
                                            class="px-3 py-1.5 rounded-md border border-rose-700/50 text-rose-300 hover:bg-rose-900/30">
                                            Revoke
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="paginatedInvites.length === 0">
                                <td colspan="7" class="px-4 py-10 text-center text-slate-400">No results</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <Pagination :page="iv.page" :page-size="iv.pageSize" :total="filteredInvites.length"
                    @update:page="iv.page = $event" @update:page-size="iv.pageSize = $event" />
            </section>
        </div>

        <!-- Toast -->
        <transition name="fade">
            <div v-if="toast" class="fixed bottom-4 right-4 px-4 py-3 bg-emerald-600 text-white rounded-lg shadow-lg">
                {{ toast }}
            </div>
        </transition>

        <!-- Confirm dialogs -->
        <ConfirmDialog v-model:open="confirmRevokeOpen" title="Revoke invite?"
            description="This will invalidate the invite link. The member will need a new invite to join."
            confirm-text="Revoke" variant="danger" @confirm="revokeInviteConfirmed" />

        <ConfirmDialog v-model:open="confirmBulkOpen"
            :title="bulkAction === 'approve' ? 'Approve selected requests?' : 'Decline selected requests?'"
            :description="bulkAction === 'approve'
                ? 'All selected requests will be approved.'
                : 'All selected requests will be declined.'" :confirm-text="bulkAction === 'approve' ? 'Approve' : 'Decline'"
            :variant="bulkAction === 'approve' ? 'default' : 'danger'" @confirm="performBulkAction" />

        <!-- Activity log drawer -->
        <transition name="slide">
            <div v-if="logDrawer.open" class="fixed inset-0 z-50">
                <div class="absolute inset-0 bg-black/40" @click="logDrawer.open = false"></div>
                <div
                    class="absolute right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700 p-5 overflow-y-auto">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <div class="text-white font-semibold">Activity Log</div>
                            <div class="text-slate-400 text-sm">{{ logDrawer.item?.userName || logDrawer.item?.email }}
                            </div>
                        </div>
                        <button class="px-3 py-1.5 rounded-md border border-slate-600 text-slate-200 hover:bg-slate-800"
                            @click="logDrawer.open = false">Close</button>
                    </div>
                    <ul class="space-y-3">
                        <li v-for="(h, idx) in (logDrawer.item?.history || [])" :key="idx"
                            class="rounded-md border border-slate-700 p-3">
                            <div class="text-slate-200 capitalize">{{ h.action }}</div>
                            <div class="text-slate-400 text-xs">{{ formatDateTime(h.at) }}</div>
                            <div v-if="h.note" class="text-slate-300 text-sm mt-1">{{ h.note }}</div>
                        </li>
                        <li v-if="!(logDrawer.item?.history || []).length" class="text-slate-400 text-sm">No history.
                        </li>
                    </ul>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

/** ---------------- Local UI helpers (inline components) ---------------- */
const StatusBadge = {
    props: { status: { type: String, default: 'pending' } },
    template: `
    <span :class="[
      'inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium',
      status==='pending'  && 'bg-amber-900/30 text-amber-300 border-amber-700/40',
      status==='approved' && 'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
      status==='declined' && 'bg-rose-900/30 text-rose-300 border-rose-700/40',
      status==='active'   && 'bg-blue-900/30 text-blue-300 border-blue-700/40',
      status==='used'     && 'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
      status==='expired'  && 'bg-slate-700 text-slate-300 border-slate-600'
    ]">{{ status[0].toUpperCase() + status.slice(1) }}</span>`
}

const Pagination = {
    props: {
        page: { type: Number, default: 1 },
        pageSize: { type: Number, default: 10 },
        total: { type: Number, default: 0 }
    },
    emits: ['update:page', 'update:page-size'],
    computed: {
        totalPages() {
            return Math.max(1, Math.ceil(this.total / this.pageSize))
        }
    },
    methods: {
        go(p) { if (p < 1 || p > this.totalPages) return; this.$emit('update:page', p) }
    },
    template: `
  <div class="flex items-center justify-between gap-3 text-sm mt-4">
    <div class="flex items-center gap-2">
      <span>Rows:</span>
      <select class="px-2 py-1 rounded-md bg-slate-900/70 border border-slate-700 text-white"
              :value="pageSize" @change="$emit('update:page-size', +$event.target.value)">
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
      </select>
    </div>
    <div>Page <span class="font-medium text-white">{{ page }}</span> of <span class="font-medium text-white">{{ totalPages }}</span></div>
    <div class="flex gap-2">
      <button class="px-3 py-1.5 rounded-md border border-slate-600 text-slate-200 hover:bg-slate-800"
              :disabled="page <= 1" @click="go(page - 1)">Prev</button>
      <button class="px-3 py-1.5 rounded-md border border-slate-600 text-slate-200 hover:bg-slate-800"
              :disabled="page >= totalPages" @click="go(page + 1)">Next</button>
    </div>
  </div>`
}

const ConfirmDialog = {
    props: {
        open: { type: Boolean, default: false },
        title: { type: String, default: 'Confirm' },
        description: { type: String, default: '' },
        confirmText: { type: String, default: 'Confirm' },
        cancelText: { type: String, default: 'Cancel' },
        variant: { type: String, default: 'default' } // default | danger
    },
    emits: ['update:open', 'confirm'],
    methods: {
        close() { this.$emit('update:open', false) },
        confirm() { this.$emit('confirm'); this.close() }
    },
    template: `
  <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="close" />
    <div class="relative w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
      <div class="text-lg font-semibold text-white mb-1">{{ title }}</div>
      <div class="text-slate-300 text-sm mb-4">{{ description }}</div>
      <div class="flex justify-end gap-2">
        <button class="px-3 py-1.5 rounded-md border border-slate-600 text-slate-200 hover:bg-slate-800" @click="close">{{ cancelText }}</button>
        <button :class="[
            'px-3 py-1.5 rounded-md border',
            variant==='danger'
              ? 'border-rose-700/50 text-rose-300 hover:bg-rose-900/30'
              : 'border-slate-600 text-slate-200 hover:bg-slate-800'
          ]" @click="confirm">{{ confirmText }}</button>
      </div>
    </div>
  </div>`
}

/** ---------------- State ---------------- */
const activeTab = ref('requests')
const toast = ref('')

/* Auto-accept setting */
const autoAcceptEnabled = ref(false)
const updateAutoAcceptSetting = () => {
    logInfo(`Auto-accept: ${autoAcceptEnabled.value ? 'enabled' : 'disabled'}`)
    showToast('Auto-accept setting saved')
}

/* Requests data (mocked) */
const requests = ref([
    {
        id: 1,
        userName: 'John Doe',
        userEmail: 'john@example.com',
        position: 'Member',
        message: 'I would like to join your club to participate in activities.',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 864e5),
        history: [{ at: Date.now() - 2 * 864e5, action: 'submitted' }]
    },
    {
        id: 2,
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        position: 'Coordinator',
        message: 'Interested in helping organize events.',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 864e5),
        history: [{ at: Date.now() - 1 * 864e5, action: 'submitted' }]
    },
    {
        id: 3,
        userName: 'Mike Johnson',
        userEmail: 'mike@example.com',
        position: 'Member',
        message: '',
        status: 'approved',
        createdAt: new Date(Date.now() - 5 * 864e5),
        history: [{ at: Date.now() - 5 * 864e5, action: 'submitted' }, { at: Date.now() - 4.8 * 864e5, action: 'approved' }]
    },
    {
        id: 4,
        userName: 'Sarah Williams',
        userEmail: 'sarah@example.com',
        position: 'Officer',
        message: 'Looking to take on leadership role.',
        status: 'declined',
        createdAt: new Date(Date.now() - 7 * 864e5),
        history: [{ at: Date.now() - 7 * 864e5, action: 'submitted' }, { at: Date.now() - 6.9 * 864e5, action: 'declined', note: 'Not open for officers' }]
    }
])

/* Invites data (mocked) */
const invites = ref([
    {
        id: 1,
        email: 'alice@example.com',
        position: 'member',
        code: 'ABC12345',
        status: 'active',
        createdAt: new Date(Date.now() - 1 * 864e5),
        expiresAt: new Date(Date.now() + 29 * 864e5),
        history: [{ at: Date.now() - 1 * 864e5, action: 'created' }]
    },
    {
        id: 2,
        email: 'bob@example.com',
        position: 'coordinator',
        code: 'XYZ98765',
        status: 'active',
        createdAt: new Date(Date.now() - 3 * 864e5),
        expiresAt: new Date(Date.now() + 27 * 864e5),
        history: [{ at: Date.now() - 3 * 864e5, action: 'created' }]
    },
    {
        id: 3,
        email: 'charlie@example.com',
        position: 'member',
        code: 'DEF45678',
        status: 'used',
        createdAt: new Date(Date.now() - 10 * 864e5),
        expiresAt: new Date(Date.now() - 5 * 864e5),
        history: [{ at: Date.now() - 10 * 864e5, action: 'created' }, { at: Date.now() - 9.5 * 864e5, action: 'used', note: 'Accepted by charlie@example.com' }]
    },
    {
        id: 4,
        email: 'diana@example.com',
        position: 'officer',
        code: 'GHI11111',
        status: 'expired',
        createdAt: new Date(Date.now() - 35 * 864e5),
        expiresAt: new Date(Date.now() - 5 * 864e5),
        history: [{ at: Date.now() - 35 * 864e5, action: 'created' }, { at: Date.now() - 5 * 864e5, action: 'expired' }]
    }
])

/** ---------------- Derived & filters ---------------- */
const counts = computed(() => ({
    requests: {
        pending: requests.value.filter(r => r.status === 'pending').length,
        approved: requests.value.filter(r => r.status === 'approved').length,
        declined: requests.value.filter(r => r.status === 'declined').length
    }
}))

/* Requests filters/pagination */
const rq = reactive({
    filters: { q: '', status: 'all', from: '', to: '', sort: 'created_desc' },
    page: 1,
    pageSize: 10
})

const filteredRequests = computed(() => {
    let list = [...requests.value]
    const { q, status, from, to, sort } = rq.filters
    if (status !== 'all') list = list.filter(r => r.status === status)
    if (q) {
        const qq = q.toLowerCase()
        list = list.filter(r =>
            r.userName.toLowerCase().includes(qq) ||
            r.userEmail.toLowerCase().includes(qq) ||
            r.position.toLowerCase().includes(qq) ||
            (r.message || '').toLowerCase().includes(qq)
        )
    }
    if (from) list = list.filter(r => new Date(r.createdAt) >= new Date(from))
    if (to) list = list.filter(r => new Date(r.createdAt) <= endOfDay(new Date(to)))

    if (sort === 'created_desc') list.sort((a, b) => b.createdAt - a.createdAt)
    if (sort === 'created_asc') list.sort((a, b) => a.createdAt - b.createdAt)
    if (sort === 'name_asc') list.sort((a, b) => a.userName.localeCompare(b.userName))
    if (sort === 'name_desc') list.sort((a, b) => b.userName.localeCompare(a.userName))

    return list
})

const paginatedRequests = computed(() => {
    const start = (rq.page - 1) * rq.pageSize
    return filteredRequests.value.slice(start, start + rq.pageSize)
})

/* Selection & bulk */
const selectedRequestIds = reactive(new Set())
const allRequestsOnPageSelected = computed(() =>
    paginatedRequests.value.length > 0 &&
    paginatedRequests.value.every(r => selectedRequestIds.has(r.id))
)
function toggleSelect(id) {
    selectedRequestIds.has(id) ? selectedRequestIds.delete(id) : selectedRequestIds.add(id)
}
function toggleSelectAllOnPage(e) {
    if (e.target.checked) {
        paginatedRequests.value.forEach(r => selectedRequestIds.add(r.id))
    } else {
        paginatedRequests.value.forEach(r => selectedRequestIds.delete(r.id))
    }
}

/* Invites filters/pagination */
const iv = reactive({
    filters: { q: '', status: 'all', sort: 'created_desc' },
    page: 1,
    pageSize: 10
})

const activeInvites = computed(() => invites.value.filter(i => i.status === 'active'))

const filteredInvites = computed(() => {
    let list = [...invites.value]
    const { q, status, sort } = iv.filters
    if (status !== 'all') list = list.filter(i => i.status === status)
    if (q) {
        const qq = q.toLowerCase()
        list = list.filter(i =>
            i.email.toLowerCase().includes(qq) || i.code.toLowerCase().includes(qq)
        )
    }
    if (sort === 'created_desc') list.sort((a, b) => b.createdAt - a.createdAt)
    if (sort === 'created_asc') list.sort((a, b) => a.createdAt - b.createdAt)
    if (sort === 'email_asc') list.sort((a, b) => a.email.localeCompare(b.email))
    if (sort === 'email_desc') list.sort((a, b) => b.email.localeCompare(a.email))
    return list
})

const paginatedInvites = computed(() => {
    const start = (iv.page - 1) * iv.pageSize
    return filteredInvites.value.slice(start, start + iv.pageSize)
})

/** ---------------- Actions ---------------- */
const isProcessing = ref(false)

function approveRequest(id) {
    isProcessing.value = true
    setTimeout(() => {
        const r = requests.value.find(x => x.id === id)
        if (r && r.status === 'pending') {
            r.status = 'approved'
            r.history.push({ at: Date.now(), action: 'approved' })
            showToast('Request approved')
        }
        isProcessing.value = false
    }, 400)
}

function declineRequest(id) {
    isProcessing.value = true
    setTimeout(() => {
        const r = requests.value.find(x => x.id === id)
        if (r && r.status === 'pending') {
            r.status = 'declined'
            r.history.push({ at: Date.now(), action: 'declined' })
            showToast('Request declined')
        }
        isProcessing.value = false
    }, 400)
}

/* Bulk approve/decline with confirm */
const confirmBulkOpen = ref(false)
const bulkAction = ref('approve') // or 'decline'
function bulkApprove() { bulkAction.value = 'approve'; confirmBulkOpen.value = true }
function bulkDecline() { bulkAction.value = 'decline'; confirmBulkOpen.value = true }
function performBulkAction() {
    const ids = Array.from(selectedRequestIds)
    if (!ids.length) return
    isProcessing.value = true
    setTimeout(() => {
        ids.forEach(id => {
            const r = requests.value.find(x => x.id === id)
            if (!r || r.status !== 'pending') return
            if (bulkAction.value === 'approve') {
                r.status = 'approved'
                r.history.push({ at: Date.now(), action: 'approved (bulk)' })
            } else {
                r.status = 'declined'
                r.history.push({ at: Date.now(), action: 'declined (bulk)' })
            }
        })
        selectedRequestIds.clear()
        isProcessing.value = false
        showToast(bulkAction.value === 'approve' ? 'Approved selected' : 'Declined selected')
    }, 500)
}

/* Invite create/copy/revoke */
const newInvite = ref({ email: '', position: '' })
const isCreating = ref(false)
function createInvite() {
    if (!newInvite.value.email || !newInvite.value.position) return
    isCreating.value = true
    setTimeout(() => {
        const code = Math.random().toString(36).slice(2, 10).toUpperCase()
        invites.value.unshift({
            id: invites.value.length + 1,
            email: newInvite.value.email,
            position: newInvite.value.position,
            code,
            status: 'active',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 864e5),
            history: [{ at: Date.now(), action: 'created' }]
        })
        newInvite.value = { email: '', position: '' }
        isCreating.value = false
        showToast('Invite created')
    }, 450)
}

function copyInviteLink(code) {
    const url = `${window.location.origin}/join-club?invite=${code}`
    navigator.clipboard.writeText(url)
    showToast('Invite link copied')
}

/* Revoke with confirm */
const confirmRevokeOpen = ref(false)
const revokeTarget = ref(null)
function confirmRevoke(invite) { revokeTarget.value = invite; confirmRevokeOpen.value = true }
function revokeInviteConfirmed() {
    if (!revokeTarget.value) return
    const i = invites.value.find(x => x.id === revokeTarget.value.id)
    if (i && i.status === 'active') {
        i.status = 'expired'
        i.history.push({ at: Date.now(), action: 'revoked' })
        showToast('Invite revoked')
    }
    revokeTarget.value = null
}

/* Log drawer */
const logDrawer = reactive({ open: false, item: null })
function openLog(item) {
    logDrawer.item = item
    logDrawer.open = true
}

/** ---------------- Utils ---------------- */
function endOfDay(d) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x }
function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
function formatDateTime(d) {
    return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function showToast(msg) {
    toast.value = msg
    setTimeout(() => { toast.value = '' }, 2200)
}
function resetRequestFilters() {
    rq.filters = { q: '', status: 'all', from: '', to: '', sort: 'created_desc' }
    rq.page = 1
}
function resetInviteFilters() {
    iv.filters = { q: '', status: 'all', sort: 'created_desc' }
    iv.page = 1
}
function logInfo(msg) { console.log('[v1]', msg) }

/* UI class helpers */
function tabClass(active) {
    return [
        'pb-3 border-b-2 text-sm font-medium',
        active
            ? 'border-blue-500 text-white'
            : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
    ]
}
function badgeClass(kind) {
    if (kind === 'pending') return 'bg-amber-900/30 text-amber-300 border border-amber-700/40'
    return 'bg-slate-700 text-slate-300 border border-slate-600'
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
