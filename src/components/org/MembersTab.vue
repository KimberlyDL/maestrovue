<template>
    <div class="space-y-8">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                    <Users class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Organization Members
                </h2>
                <p class="text-gray-500 dark:text-platinum-500 text-sm">Manage organization members and roles</p>
            </div>
            <div class="flex gap-3">
                <button @click="exportMembers"
                    class="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-abyss-800 border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-700 transition-colors shadow-sm flex items-center gap-2 font-medium">
                    <Download class="w-4 h-4" /> Export CSV
                </button>
                <button @click="addNewMember" :disabled="isAdding"
                    class="px-5 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-medium transition-colors shadow-md hover:shadow-lg flex items-center gap-2">
                    <UserPlus class="w-5 h-5" /> Add Member
                </button>
            </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-5 shadow-lg">
                <div class="text-gray-500 dark:text-platinum-500 text-sm font-medium">Total Members</div>
                <div class="text-gray-800 dark:text-platinum-50 text-3xl font-bold mt-1">{{ members.length }}</div>
            </div>
            <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-5 shadow-lg">
                <div class="text-gray-500 dark:text-platinum-500 text-sm font-medium">Admins</div>
                <div class="text-rose-600 dark:text-rose-400 text-3xl font-bold mt-1">{{ stats.admins }}</div>
            </div>
            <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-5 shadow-lg">
                <div class="text-gray-500 dark:text-platinum-500 text-sm font-medium">Members</div>
                <div class="text-kaitoke-green-600 dark:text-kaitoke-green-400 text-3xl font-bold mt-1">{{ stats.members }}</div>
            </div>
            <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-5 shadow-lg">
                <div class="text-gray-500 dark:text-platinum-500 text-sm font-medium">Viewers</div>
                <div class="text-blue-600 dark:text-blue-400 text-3xl font-bold mt-1">{{ stats.viewers }}</div>
            </div>
        </div>

        <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-5 shadow-lg">
            <div class="flex flex-col md:flex-row gap-4 items-center">
                <div class="flex-1 w-full relative">
                    <Search class="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-platinum-600" />
                    <input v-model="filters.search" type="text" placeholder="Search by name or email..."
                        class="w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 placeholder-gray-400 dark:placeholder-platinum-600 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner" />
                </div>
                <select v-model="filters.role"
                    class="md:w-auto w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner">
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                </select>
            </div>
        </div>

        <div v-if="showAddMemberForm" class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-6 shadow-lg">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-platinum-50 mb-4 flex items-center gap-2">
                <UserPlus class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Invite New Member
            </h3>
            <form @submit.prevent="submitNewMember">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input v-model="newMember.name" type="text" placeholder="Name (Optional)"
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 placeholder-gray-400 dark:placeholder-platinum-600 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner" />
                    <input v-model="newMember.email" type="email" placeholder="Email (Required)" required
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 placeholder-gray-400 dark:placeholder-platinum-600 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner" />
                    <select v-model="newMember.role"
                        class="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner">
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                    </select>
                </div>
                <div class="flex justify-end gap-3 mt-4">
                    <button type="button" @click="showAddMemberForm = false"
                        class="px-4 py-2 rounded-xl bg-gray-100 dark:bg-abyss-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-600 font-medium transition-colors shadow-sm">
                        Cancel
                    </button>
                    <button type="submit" :disabled="isAdding || !newMember.email"
                        class="px-5 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-medium transition-colors shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50">
                        <UserPlus class="w-5 h-5" /> {{ isAdding ? 'Adding...' : 'Send Invitation' }}
                    </button>
                </div>
            </form>
        </div>

        <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl overflow-hidden shadow-xl">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-abyss-700">
                <thead class="bg-gray-50 dark:bg-abyss-800/80">
                    <tr class="text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-platinum-400">
                        <th class="px-6 py-3">Member</th>
                        <th class="px-6 py-3">Email</th>
                        <th class="px-6 py-3">Role</th>
                        <th class="px-6 py-3">Joined</th>
                        <th class="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-abyss-700 bg-white dark:bg-abyss-900">
                    <tr v-for="member in filteredMembers" :key="member.id" class="hover:bg-gray-50 dark:hover:bg-abyss-800 transition-colors">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded-full bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 flex items-center justify-center text-kaitoke-green-700 dark:text-kaitoke-green-300 font-semibold text-lg">
                                    {{ member.name.charAt(0).toUpperCase() }}
                                </div>
                                <div>
                                    <div class="text-gray-800 dark:text-platinum-50 font-medium">{{ member.name }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-gray-600 dark:text-platinum-300">{{ member.email }}</td>
                        <td class="px-6 py-4">
                            <select v-model="member.role" @change="updateMemberRole(member)" :disabled="isUpdating"
                                class="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 shadow-inner">
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                                <option value="viewer">Viewer</option>
                            </select>
                        </td>
                        <td class="px-6 py-4 text-gray-700 dark:text-platinum-200 text-sm">{{ formatDate(member.joined_at) }}</td>
                        <td class="px-6 py-4">
                            <div class="flex justify-end gap-2">
                                <button @click="confirmRemoveMember(member)" :disabled="isRemoving"
                                    class="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-700/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 disabled:opacity-50 text-sm transition-colors flex items-center gap-1">
                                    <Trash2 class="w-4 h-4" /> Remove
                                </button>
                            </div>
                        </td>
                    </tr>

                    <tr v-if="filteredMembers.length === 0">
                        <td colspan="5" class="px-6 py-10 text-center text-gray-500 dark:text-platinum-500 text-lg">No members found matching your criteria.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <transition name="fade">
            <div v-if="toast"
                class="fixed bottom-6 right-6 px-5 py-3 bg-kaitoke-green-600 text-white font-medium rounded-xl shadow-2xl flex items-center gap-2">
                <CheckCircle class="w-5 h-5" /> {{ toast }}
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/utils/api'
import { Users, Download, UserPlus, Search, Trash2, CheckCircle, Info } from 'lucide-vue-next'

const props = defineProps({
    organizationId: { type: [String, Number], required: true }
})

const members = ref([])
const isUpdating = ref(false)
const isRemoving = ref(false)
const isAdding = ref(false)
const toast = ref('')
const showAddMemberForm = ref(false)
const newMember = ref({
    name: '',
    email: '',
    role: 'member'
})

const filters = ref({
    search: '',
    role: ''
})

const stats = computed(() => ({
    admins: members.value.filter(m => m.role === 'admin').length,
    members: members.value.filter(m => m.role === 'member').length,
    viewers: members.value.filter(m => m.role === 'viewer').length
}))

const filteredMembers = computed(() => {
    let result = [...members.value]

    if (filters.value.search) {
        const q = filters.value.search.toLowerCase()
        result = result.filter(m =>
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q)
        )
    }

    if (filters.value.role) {
        result = result.filter(m => m.role === filters.value.role)
    }

    return result
})

onMounted(async () => {
    await loadMembers()
})

async function loadMembers() {
    try {
        const { data } = await axios.get(`/api/org/${props.organizationId}/members`)
        members.value = data
    } catch (error) {
        console.error('Failed to load members:', error)
        showToast('Failed to load members')
    }
}

async function updateMemberRole(member) {
    isUpdating.value = true
    try {
        await axios.patch(`/api/org/${props.organizationId}/members/${member.id}/role`, {
            role: member.role
        })
        showToast('Member role updated successfully')
    } catch (error) {
        console.error('Failed to update role:', error)
        showToast('Failed to update member role')
        await loadMembers() // Reload to revert
    } finally {
        isUpdating.value = false
    }
}

async function confirmRemoveMember(member) {
    if (!confirm(`Are you sure you want to remove ${member.name} from the organization?`)) return

    isRemoving.value = true
    try {
        await axios.delete(`/api/org/${props.organizationId}/members/${member.id}`)
        members.value = members.value.filter(m => m.id !== member.id)
        showToast('Member removed successfully')
    } catch (error) {
        console.error('Failed to remove member:', error)
        showToast(error.response?.data?.message || 'Failed to remove member')
    } finally {
        isRemoving.value = false
    }
}

function exportMembers() {
    const csv = [
        ['Name', 'Email', 'Role', 'Joined'],
        ...members.value.map(m => [m.name, m.email, m.role, m.joined_at])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `members_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

function showToast(message) {
    toast.value = message
    setTimeout(() => {
        toast.value = ''
    }, 3000)
}

function addNewMember() {
    showAddMemberForm.value = !showAddMemberForm.value;
    newMember.value = { name: '', email: '', role: 'member' };
}

async function submitNewMember() {
    isAdding.value = true
    try {
        const { data } = await axios.post(`/api/org/${props.organizationId}/members`, {
            name: newMember.value.name,
            email: newMember.value.email,
            role: newMember.value.role
        })
        members.value.push(data)
        showAddMemberForm.value = false
        showToast('Member added successfully')
    } catch (error) {
        console.error('Failed to add member:', error)
        showToast(error.response?.data?.message || 'Failed to add member')
    } finally {
        isAdding.value = false
    }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>