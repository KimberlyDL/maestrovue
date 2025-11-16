<template>
    <div class="max-w-7xl mx-auto p-6">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                Permission Management
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
                Manage member permissions and access control
            </p>
        </div>

        <!-- Member List -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Organization Members
                </h2>
            </div>

            <div class="divide-y divide-gray-200 dark:divide-gray-700">
                <div v-for="member in members" :key="member.id"
                    class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div class="flex items-center justify-between">
                        <!-- Member Info -->
                        <div class="flex items-center space-x-4">
                            <img :src="member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`"
                                :alt="member.name" class="w-12 h-12 rounded-full" />
                            <div>
                                <h3 class="font-medium text-gray-900 dark:text-white">
                                    {{ member.name }}
                                </h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">
                                    {{ member.email }}
                                </p>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                                        :class="getRoleBadgeClass(member.role)">
                                        {{ member.role }}
                                    </span>
                                    <span v-if="!member.is_admin && member.permissions_count > 0"
                                        class="text-xs text-gray-600 dark:text-gray-400">
                                        {{ member.permissions_count }} permission(s)
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <button v-if="!member.is_admin" @click="selectMember(member)"
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Lock :size="16" />
                            Manage Permissions
                        </button>
                        <span v-else class="text-sm text-gray-500 dark:text-gray-400">
                            Full Admin Access
                        </span>
                    </div>

                    <!-- Current Permissions Preview -->
                    <div v-if="!member.is_admin && member.permissions.length > 0" class="mt-4 flex flex-wrap gap-2">
                        <span v-for="permission in member.permissions.slice(0, 5)" :key="permission"
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {{ permission }}
                        </span>
                        <span v-if="member.permissions.length > 5"
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            +{{ member.permissions.length - 5 }} more
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Permission Modal -->
        <div v-if="selectedMember"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            @click.self="closeModal">
            <div
                class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <!-- Modal Header -->
                <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                            Manage Permissions
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {{ selectedMember.name }}
                        </p>
                    </div>
                    <button @click="closeModal"
                        class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <X :size="20" />
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="flex-1 overflow-y-auto p-6">
                    <div v-if="loading" class="flex items-center justify-center py-12">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>

                    <div v-else class="space-y-6">
                        <div v-for="(perms, category) in groupedPermissions" :key="category">
                            <h4
                                class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                                {{ category }}
                            </h4>
                            <div class="space-y-2">
                                <label v-for="permission in perms" :key="permission.name"
                                    class="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                                    <input type="checkbox" :value="permission.name" v-model="selectedPermissions"
                                        class="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    <div class="ml-3">
                                        <p class="font-medium text-gray-900 dark:text-white">
                                            {{ permission.display_name }}
                                        </p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">
                                            {{ permission.description }}
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button @click="closeModal"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button @click="savePermissions" :disabled="saving"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                        <Save :size="16" />
                        {{ saving ? 'Saving...' : 'Save Changes' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Lock, X, Save } from 'lucide-vue-next'
import axios from 'axios'

const props = defineProps({
    organizationId: {
        type: Number,
        required: true
    }
})

const members = ref([])
const allPermissions = ref({})
const selectedMember = ref(null)
const selectedPermissions = ref([])
const originalPermissions = ref([])
const loading = ref(false)
const saving = ref(false)

const groupedPermissions = computed(() => {
    return allPermissions.value
})

const getRoleBadgeClass = (role) => {
    const classes = {
        admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        member: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
    return classes[role] || classes.member
}

const fetchMembers = async () => {
    try {
        const { data } = await axios.get(`/api/organizations/${props.organizationId}/permissions/members`)
        members.value = data
    } catch (error) {
        console.error('Failed to fetch members:', error)
    }
}

const fetchAllPermissions = async () => {
    try {
        const { data } = await axios.get('/api/permissions')
        allPermissions.value = data
    } catch (error) {
        console.error('Failed to fetch permissions:', error)
    }
}

const selectMember = async (member) => {
    selectedMember.value = member
    loading.value = true

    try {
        const { data } = await axios.get(
            `/api/organizations/${props.organizationId}/permissions/users/${member.id}`
        )

        selectedPermissions.value = data.granted_permissions || []
        originalPermissions.value = [...selectedPermissions.value]
    } catch (error) {
        console.error('Failed to fetch user permissions:', error)
    } finally {
        loading.value = false
    }
}

const savePermissions = async () => {
    if (!selectedMember.value) return

    saving.value = true

    try {
        await axios.post(
            `/api/organizations/${props.organizationId}/permissions/users/${selectedMember.value.id}/bulk`,
            {
                permissions: selectedPermissions.value
            }
        )

        // Update local member data
        const memberIndex = members.value.findIndex(m => m.id === selectedMember.value.id)
        if (memberIndex !== -1) {
            await fetchMembers() // Refresh the list
        }

        closeModal()
    } catch (error) {
        console.error('Failed to save permissions:', error)
        alert('Failed to save permissions')
    } finally {
        saving.value = false
    }
}

const closeModal = () => {
    selectedMember.value = null
    selectedPermissions.value = []
    originalPermissions.value = []
}

onMounted(() => {
    fetchMembers()
    fetchAllPermissions()
})
</script>