<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Permission Management</h1>
            <p class="mt-2 text-gray-600">Manage member permissions and access control</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800">{{ error }}</p>
            <button @click="loadData" class="mt-2 text-red-600 hover:text-red-800 underline">
                Try Again
            </button>
        </div>

        <!-- Main Content -->
        <div v-else>
            <!-- Search & Filter -->
            <div class="mb-6 flex gap-4">
                <div class="flex-1">
                    <input v-model="searchQuery" type="text" placeholder="Search members..."
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <select v-model="filterRole"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                </select>
            </div>

            <!-- Members List -->
            <div class="bg-white shadow rounded-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Member
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Permissions
                                </th>
                                <th
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-if="filteredMembers.length === 0">
                                <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                                    No members found
                                </td>
                            </tr>
                            <tr v-for="member in filteredMembers" :key="member.id" class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <img :src="member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`"
                                            :alt="member.name" class="h-10 w-10 rounded-full object-cover" />
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-900">{{ member.name }}</div>
                                            <div class="text-sm text-gray-500">{{ member.email }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span :class="[
                                        'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                                        member.is_admin
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-blue-100 text-blue-800'
                                    ]">
                                        {{ member.role }}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <div v-if="member.is_admin" class="text-sm text-gray-600">
                                        All permissions (Admin)
                                    </div>
                                    <div v-else class="text-sm text-gray-900">
                                        {{ member.permissions_count }} permission{{ member.permissions_count !== 1 ? 's'
                                        : '' }}
                                        <div v-if="member.permissions.length > 0" class="mt-1 text-xs text-gray-500">
                                            {{ member.permissions.slice(0, 3).join(', ') }}
                                            <span v-if="member.permissions.length > 3">
                                                +{{ member.permissions.length - 3 }} more
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button v-if="!member.is_admin" @click="openPermissionModal(member)"
                                        class="text-blue-600 hover:text-blue-900">
                                        Manage
                                    </button>
                                    <span v-else class="text-gray-400">
                                        N/A
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Permission Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4"
            @click.self="closeModal">
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <!-- Modal Header -->
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-lg font-medium text-gray-900">
                                Manage Permissions for {{ selectedMember?.name }}
                            </h3>
                            <p class="mt-1 text-sm text-gray-500">{{ selectedMember?.email }}</p>
                        </div>
                        <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Modal Body -->
                <div class="px-6 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div v-if="allPermissions" class="space-y-6">
                        <div v-for="(perms, category) in allPermissions" :key="category">
                            <div class="flex items-center justify-between mb-3">
                                <h4 class="text-sm font-medium text-gray-900 capitalize">{{ category }}</h4>
                                <div class="flex gap-2">
                                    <button @click="selectAllInCategory(category)"
                                        class="text-xs text-blue-600 hover:text-blue-800">
                                        Select All
                                    </button>
                                    <button @click="deselectAllInCategory(category)"
                                        class="text-xs text-gray-600 hover:text-gray-800">
                                        Deselect All
                                    </button>
                                </div>
                            </div>
                            <div class="space-y-2 pl-4">
                                <label v-for="perm in perms" :key="perm.id"
                                    class="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded">
                                    <input v-model="selectedPermissions" type="checkbox" :value="perm.name"
                                        class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                    <div class="ml-3">
                                        <div class="text-sm font-medium text-gray-900">{{ perm.display_name }}</div>
                                        <div class="text-xs text-gray-500">{{ perm.description }}</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                    <div class="text-sm text-gray-600">
                        {{ selectedPermissions.length }} permission{{ selectedPermissions.length !== 1 ? 's' : '' }}
                        selected
                    </div>
                    <div class="flex gap-3">
                        <button @click="closeModal"
                            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            Cancel
                        </button>
                        <button @click="savePermissions" :disabled="savingPermissions"
                            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                            {{ savingPermissions ? 'Saving...' : 'Save Changes' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/utils/api'
import { useToast } from '@/utils/useToast'

const route = useRoute()
const toast = useToast()

const organizationId = computed(() => route.params.id)

// State
const members = ref([])
const allPermissions = ref(null)
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const filterRole = ref('')
const showModal = ref(false)
const selectedMember = ref(null)
const selectedPermissions = ref([])
const savingPermissions = ref(false)

// Computed
const filteredMembers = computed(() => {
    let filtered = members.value || []

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(m =>
            m.name.toLowerCase().includes(query) ||
            m.email.toLowerCase().includes(query)
        )
    }

    if (filterRole.value) {
        filtered = filtered.filter(m => m.role === filterRole.value)
    }

    return filtered
})

// Methods
const loadData = async () => {
    loading.value = true
    error.value = null

    try {
        const [membersRes, permsRes] = await Promise.all([
            axios.get(`/api/organizations/${organizationId.value}/permissions/members`),
            axios.get('/api/permissions')
        ])

        members.value = membersRes.data || []
        allPermissions.value = permsRes.data || {}
    } catch (err) {
        console.error('Failed to load data:', err)
        error.value = err.response?.data?.message || 'Failed to load data'
    } finally {
        loading.value = false
    }
}

const openPermissionModal = (member) => {
    selectedMember.value = member
    selectedPermissions.value = [...(member.permission_ids || [])]
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    selectedMember.value = null
    selectedPermissions.value = []
}

const selectAllInCategory = (category) => {
    const categoryPerms = allPermissions.value[category] || []
    categoryPerms.forEach(perm => {
        if (!selectedPermissions.value.includes(perm.name)) {
            selectedPermissions.value.push(perm.name)
        }
    })
}

const deselectAllInCategory = (category) => {
    const categoryPerms = allPermissions.value[category] || []
    const categoryPermNames = categoryPerms.map(p => p.name)
    selectedPermissions.value = selectedPermissions.value.filter(
        p => !categoryPermNames.includes(p)
    )
}

const savePermissions = async () => {
    savingPermissions.value = true

    try {
        await axios.post(
            `/api/organizations/${organizationId.value}/permissions/users/${selectedMember.value.id}/bulk`,
            { permissions: selectedPermissions.value }
        )

        toast.success('Permissions updated successfully')
        closeModal()
        await loadData()
    } catch (err) {
        console.error('Failed to save permissions:', err)
        toast.error(err.response?.data?.message || 'Failed to save permissions')
    } finally {
        savingPermissions.value = false
    }
}

onMounted(() => {
    loadData()
})
</script>