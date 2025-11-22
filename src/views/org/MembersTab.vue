<!-- src/views/admin/MembersTab.vue - FIXED -->
<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-semibold text-abyss-900 dark:text-platinum-50">Members</h2>
                <p class="text-sm text-platinum-600 dark:text-platinum-400 mt-1">View and manage organization members
                </p>
            </div>
            <router-link :to="{ name: 'org.admin.permissions', params: { id: organizationId } }"
                class="px-4 py-2 rounded-lg bg-kaitoke-green-600 text-white hover:bg-kaitoke-green-500 transition-colors">
                Manage Permissions
            </router-link>
        </div>

        <!-- Search and Filter Bar -->
        <div class="flex items-center gap-4">
            <div class="flex-1 relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-platinum-400" />
                <input v-model="searchQuery" type="text" placeholder="Search members by name or email..."
                    class="w-full pl-10 pr-4 py-2 rounded-lg border border-sun-200 dark:border-abyss-700 bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-50 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-600" />
            </div>
            <select v-model="roleFilter"
                class="px-4 py-2 rounded-lg border border-sun-200 dark:border-abyss-700 bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-50 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-600">
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
            </select>
        </div>

        <!-- Members Table -->
        <div class="bg-white dark:bg-abyss-800 rounded-lg border border-sun-200 dark:border-abyss-700 overflow-hidden">
            <!-- Loading State -->
            <div v-if="loading" class="p-8 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-kaitoke-green-600 mx-auto"></div>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredMembers.length === 0" class="p-8 text-center">
                <Users class="h-12 w-12 text-platinum-400 mx-auto mb-3" />
                <p class="text-platinum-600 dark:text-platinum-400">No members found</p>
            </div>

            <!-- Members List -->
            <div v-else class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-platinum-50 dark:bg-abyss-900 border-b border-sun-200 dark:border-abyss-700">
                        <tr>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-platinum-600 dark:text-platinum-400 uppercase tracking-wider">
                                Member
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-platinum-600 dark:text-platinum-400 uppercase tracking-wider">
                                Email
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-platinum-600 dark:text-platinum-400 uppercase tracking-wider">
                                Role
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-platinum-600 dark:text-platinum-400 uppercase tracking-wider">
                                Joined
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-platinum-600 dark:text-platinum-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-sun-200 dark:divide-abyss-700">
                        <tr v-for="member in filteredMembers" :key="member.id"
                            class="hover:bg-platinum-50 dark:hover:bg-abyss-900 transition-colors cursor-pointer"
                            @click="goToMemberProfile(member.id)">
                            <!-- Member Info -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center gap-3">
                                    <div v-if="member.avatar" class="h-10 w-10 rounded-full overflow-hidden">
                                        <img :src="member.avatar" :alt="member.name"
                                            class="h-full w-full object-cover" />
                                    </div>
                                    <div v-else
                                        class="h-10 w-10 rounded-full bg-kaitoke-green-600 flex items-center justify-center text-white font-medium">
                                        {{ getInitials(member.name) }}
                                    </div>
                                    <div>
                                        <div class="font-medium text-abyss-900 dark:text-platinum-50">{{ member.name }}
                                        </div>
                                        <div v-if="member.id === currentUserId" class="text-xs text-kaitoke-green-600">
                                            (You)</div>
                                    </div>
                                </div>
                            </td>

                            <!-- Email -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-platinum-600 dark:text-platinum-400">{{ member.email }}</div>
                            </td>

                            <!-- Role (READ ONLY) -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-3 py-1 text-xs font-medium rounded-full" :class="member.role === 'admin'
                                    ? 'bg-kaitoke-green-100 text-kaitoke-green-800 dark:bg-kaitoke-green-900/30 dark:text-kaitoke-green-300'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    ">
                                    {{ member.role }}
                                </span>
                            </td>

                            <!-- Joined Date -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-platinum-600 dark:text-platinum-400">{{
                                    formatDate(member.joined_at) }}</div>
                            </td>

                            <!-- Actions -->
                            <td class="px-6 py-4 whitespace-nowrap" @click.stop>
                                <div class="flex items-center gap-2">
                                    <button @click="goToMemberProfile(member.id)"
                                        class="p-2 rounded-lg text-platinum-600 hover:bg-abyss-700 hover:text-platinum-100 transition-colors"
                                        title="View Profile">
                                        <Eye class="h-4 w-4" />
                                    </button>
                                    <button v-if="member.id !== currentUserId && isAdmin"
                                        @click="openRemoveDialog(member)"
                                        class="p-2 rounded-lg text-red-600 hover:bg-red-900/30 transition-colors"
                                        title="Remove Member">
                                        <Trash2 class="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Remove Member Dialog -->
        <teleport to="body">
            <div v-if="removeDialog.open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                @click="closeRemoveDialog">
                <div class="bg-white dark:bg-abyss-800 rounded-lg border border-sun-200 dark:border-abyss-700 p-6 max-w-md w-full"
                    @click.stop>
                    <div class="flex items-start gap-4 mb-4">
                        <div
                            class="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <AlertTriangle class="h-6 w-6 text-red-600" />
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-abyss-900 dark:text-platinum-50 mb-1">Remove Member
                            </h3>
                            <p class="text-sm text-platinum-600 dark:text-platinum-400">
                                Are you sure you want to remove <strong>{{ removeDialog.member?.name }}</strong> from
                                the organization? This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3">
                        <button @click="closeRemoveDialog"
                            class="px-4 py-2 rounded-lg border border-abyss-700 text-platinum-200 hover:bg-abyss-700 transition-colors">
                            Cancel
                        </button>
                        <button @click="confirmRemoveMember" :disabled="removeDialog.removing"
                            class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50">
                            {{ removeDialog.removing ? 'Removing...' : 'Remove Member' }}
                        </button>
                    </div>
                </div>
            </div>
        </teleport>

        <!-- Toast Notification -->
        <transition name="fade">
            <div v-if="toast"
                class="fixed bottom-4 right-4 px-6 py-3 bg-kaitoke-green-600 text-white rounded-lg shadow-lg z-50">
                {{ toast }}
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Search, Users, Eye, Trash2, AlertTriangle } from 'lucide-vue-next'
import api from '@/utils/api'

const props = defineProps({
    organizationId: { type: [String, Number], required: true }
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const members = ref([])
const loading = ref(true)
const searchQuery = ref('')
const roleFilter = ref('')
const toast = ref('')
const isAdmin = ref(false)

const removeDialog = reactive({
    open: false,
    member: null,
    removing: false
})

const currentUserId = computed(() => authStore.user?.id)

const filteredMembers = computed(() => {
    let filtered = members.value

    // Search filter
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(member =>
            member.name.toLowerCase().includes(query) ||
            member.email.toLowerCase().includes(query)
        )
    }

    // Role filter
    if (roleFilter.value) {
        filtered = filtered.filter(member => member.role === roleFilter.value)
    }

    return filtered
})

const fetchMembers = async () => {
    loading.value = true
    try {
        const response = await api.get(`/api/org/${props.organizationId}/members`)
        members.value = response.data

        // Check if current user is admin
        const currentMember = members.value.find(m => m.id === currentUserId.value)
        isAdmin.value = currentMember?.role === 'admin'
    } catch (error) {
        console.error('Failed to fetch members:', error)
        showToast('Failed to load members')
    } finally {
        loading.value = false
    }
}

const goToMemberProfile = (memberId) => {
    router.push({
        name: 'member.profile',
        params: {
            id: props.organizationId,
            memberId: memberId
        }
    })
}

const openRemoveDialog = (member) => {
    removeDialog.open = true
    removeDialog.member = member
}

const closeRemoveDialog = () => {
    removeDialog.open = false
    removeDialog.member = null
    removeDialog.removing = false
}

const confirmRemoveMember = async () => {
    if (!removeDialog.member) return

    removeDialog.removing = true
    try {
        await api.delete(`/api/org/${props.organizationId}/members/${removeDialog.member.id}`)

        // Remove from local list
        members.value = members.value.filter(m => m.id !== removeDialog.member.id)

        showToast(`${removeDialog.member.name} has been removed`)
        closeRemoveDialog()
    } catch (error) {
        console.error('Failed to remove member:', error)
        showToast(error.response?.data?.message || 'Failed to remove member')
        removeDialog.removing = false
    }
}

const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase()
}

const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const showToast = (message) => {
    toast.value = message
    setTimeout(() => toast.value = '', 3000)
}

onMounted(() => {
    fetchMembers()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>