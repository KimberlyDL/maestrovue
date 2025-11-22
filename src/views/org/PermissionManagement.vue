<template>

    <div class="h-full flex flex-col gap-8 p-6 lg:p-8 bg-platinum-50 dark:bg-abyss-900 transition-colors">

        <header class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

            <div>

                <h1 class="text-3xl font-extrabold font-heading text-abyss-900 dark:text-platinum-50">

                    Permission Management

                </h1>

                <p class="text-md text-platinum-600 dark:text-platinum-400 font-body mt-1">

                    Manage member roles and granular access control for your organization.

                </p>

            </div>

            <button @click="loadData" :disabled="loading"
                class="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-platinum-300 dark:border-abyss-600 text-abyss-900 dark:text-platinum-200 bg-white dark:bg-abyss-800 hover:bg-platinum-100 dark:hover:bg-abyss-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm">

                <RefreshCw :size="18" :class="{ 'animate-spin': loading }" />

                Refresh Data

            </button>

        </header>



        <div class="flex-1 flex flex-col gap-6 overflow-hidden">



            <div v-if="loading" class="flex-1 flex items-center justify-center min-h-[400px]">

                <div class="text-center">

                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-kaitoke-green-600 mx-auto mb-4">

                    </div>

                    <p class="text-base text-platinum-600 dark:text-platinum-400 font-body">Loading permissions...</p>

                </div>

            </div>



            <div v-else-if="error"
                class="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/50 shadow-md">

                <div class="flex items-center gap-2 text-red-700 dark:text-red-400 mb-3">

                    <AlertCircle :size="20" />

                    <span class="font-bold font-heading text-lg">Error loading data</span>

                </div>

                <p class="text-sm text-red-600 dark:text-red-300 font-body mb-4">{{ error }}</p>

                <button @click="loadData"
                    class="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline font-medium font-body">

                    Try Again

                </button>

            </div>



            <div v-else class="flex-1 flex flex-col gap-6 overflow-hidden">

                <div
                    class="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-abyss-800 rounded-xl shadow-md border border-platinum-200 dark:border-abyss-700">

                    <div class="relative flex-1">

                        <Search class="absolute left-3 top-2.5 h-4 w-4 text-platinum-600 dark:text-platinum-400" />

                        <input v-model="searchQuery" type="text" placeholder="Search members by name or email..."
                            class="w-full pl-10 pr-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-platinum-50 dark:bg-abyss-700 text-abyss-900 dark:text-platinum-200 focus:ring-2 focus:ring-kaitoke-green-500 focus:border-transparent text-sm font-body transition-colors" />

                    </div>

                    <select v-model="filterRole"
                        class="px-4 py-2 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-platinum-50 dark:bg-abyss-700 text-abyss-900 dark:text-platinum-200 focus:ring-2 focus:ring-kaitoke-green-500 text-sm min-w-[140px] font-body appearance-none pr-8">

                        <option value="">All Roles</option>

                        <option value="admin">Admin</option>

                        <option value="owner">Owner</option>

                        <option value="member">Member</option>

                    </select>

                </div>



                <div
                    class="flex-1 bg-white dark:bg-abyss-800 rounded-xl shadow-lg border border-platinum-200 dark:border-abyss-700 overflow-hidden flex flex-col min-h-0">

                    <div class="overflow-x-auto overflow-y-auto flex-1">

                        <table class="min-w-full divide-y divide-platinum-200 dark:divide-abyss-700">

                            <thead class="bg-platinum-50 dark:bg-abyss-700 sticky top-0 z-10 shadow-sm">

                                <tr>

                                    <th
                                        class="px-6 py-3 text-left text-xs font-semibold font-heading text-platinum-700 dark:text-platinum-300 uppercase tracking-wider min-w-[200px]">

                                        Member

                                    </th>

                                    <th
                                        class="px-6 py-3 text-left text-xs font-semibold font-heading text-platinum-700 dark:text-platinum-300 uppercase tracking-wider min-w-[100px]">

                                        Role

                                    </th>

                                    <th
                                        class="px-6 py-3 text-left text-xs font-semibold font-heading text-platinum-700 dark:text-platinum-300 uppercase tracking-wider min-w-[250px]">

                                        Permissions

                                    </th>

                                    <th
                                        class="px-6 py-3 text-right text-xs font-semibold font-heading text-platinum-700 dark:text-platinum-300 uppercase tracking-wider min-w-[100px]">

                                        Actions

                                    </th>

                                </tr>

                            </thead>

                            <tbody class="divide-y divide-platinum-200 dark:divide-abyss-700">

                                <tr v-if="filteredMembers.length === 0">

                                    <td colspan="4" class="px-6 py-20 text-center">

                                        <Users class="h-14 w-14 mx-auto text-platinum-400 dark:text-abyss-600 mb-4" />

                                        <p
                                            class="text-base font-medium font-body text-platinum-600 dark:text-platinum-400">

                                            No members found</p>

                                    </td>

                                </tr>

                                <tr v-for="member in filteredMembers" :key="member.id"
                                    class="hover:bg-platinum-50 dark:hover:bg-abyss-700 transition-colors">

                                    <td class="px-6 py-4 whitespace-nowrap">

                                        <div class="flex items-center gap-3">

                                            <img v-if="member.avatar" :src="member.avatar" :alt="member.name"
                                                class="h-10 w-10 rounded-full object-cover border border-platinum-300 dark:border-abyss-600" />

                                            <div v-else
                                                class="h-10 w-10 rounded-full bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 flex items-center justify-center text-sm font-semibold text-kaitoke-green-600 dark:text-kaitoke-green-400">

                                                {{ member.name.charAt(0).toUpperCase() }}

                                            </div>

                                            <div>

                                                <div
                                                    class="text-sm font-medium font-body text-abyss-900 dark:text-platinum-200">

                                                    {{ member.name }}

                                                </div>

                                                <div class="text-xs text-platinum-600 dark:text-platinum-400 font-body">

                                                    {{ member.email }}

                                                </div>

                                            </div>

                                        </div>

                                    </td>

                                    <td class="px-6 py-4 whitespace-nowrap">

                                        <span :class="[

                                            'px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase font-body',

                                            member.is_admin || member.role === 'owner'

                                                ? 'bg-electric-lime-100 dark:bg-electric-lime-900/30 text-electric-lime-800 dark:text-electric-lime-400'

                                                : 'bg-sun-100 dark:bg-sun-900/30 text-sun-800 dark:text-sun-400'

                                        ]">

                                            {{ member.role }}

                                        </span>

                                    </td>

                                    <td class="px-6 py-4">

                                        <div v-if="member.is_admin || member.role === 'owner'"
                                            class="text-sm text-kaitoke-green-600 dark:text-kaitoke-green-400 font-body font-semibold">

                                            All permissions

                                            <span class="text-platinum-600 dark:text-platinum-400 font-normal">

                                                ({{ member.role === 'owner' ? 'Owner' : 'Admin' }})

                                            </span>

                                        </div>

                                        <div v-else class="text-sm text-abyss-900 dark:text-platinum-200 font-body">

                                            <div class="font-medium">

                                                {{ member.permissions_count }} granular permission{{

                                                    member.permissions_count !== 1 ?

                                                        's' : '' }}

                                            </div>

                                            <div v-if="member.permissions.length > 0"
                                                class="mt-1 text-xs text-platinum-600 dark:text-platinum-400">

                                                {{ member.permissions.slice(0, 2).join(', ') }}

                                                <span v-if="member.permissions.length > 2">

                                                    +{{ member.permissions.length - 2 }} more

                                                </span>

                                            </div>

                                        </div>

                                    </td>

                                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                                        <button v-if="!member.is_admin && member.role !== 'owner'"
                                            @click="openPermissionModal(member)"
                                            class="inline-flex items-center gap-1.5 text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:text-kaitoke-green-800 dark:hover:text-kaitoke-green-300 transition-colors p-2 rounded-lg hover:bg-kaitoke-green-50/20 dark:hover:bg-abyss-700">

                                            <Settings :size="16" />

                                            Manage

                                        </button>

                                        <span v-else
                                            class="text-platinum-400 dark:text-abyss-600 text-xs italic font-body">

                                            System Role

                                        </span>

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>



        <div v-if="showModal"
            class="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-4"
            @click.self="closeModal">

            <div
                class="bg-white dark:bg-abyss-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100 opacity-100">

                <div class="px-6 py-4 border-b border-platinum-200 dark:border-abyss-700">

                    <div class="flex items-center justify-between">

                        <div>

                            <h3 class="text-xl font-semibold font-heading text-abyss-900 dark:text-platinum-50">

                                Manage Permissions

                            </h3>

                            <p class="mt-1 text-sm text-platinum-600 dark:text-platinum-400 font-body">

                                Member: <span class="font-medium">{{ selectedMember?.name }}</span> ({{

                                    selectedMember?.email }})

                            </p>

                        </div>

                        <button @click="closeModal"
                            class="p-2 hover:bg-platinum-100 dark:hover:bg-abyss-800 rounded-lg transition-colors">

                            <X :size="20" class="text-platinum-600 dark:text-platinum-400" />

                        </button>

                    </div>

                </div>



                <div class="flex-1 overflow-y-auto px-6 py-6">

                    <div v-if="allPermissions" class="space-y-8">

                        <div v-for="(perms, category) in allPermissions" :key="category"
                            class="bg-platinum-50 dark:bg-abyss-800 p-4 rounded-lg border border-platinum-200 dark:border-abyss-700">

                            <div
                                class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-2 border-b border-platinum-200 dark:border-abyss-700">

                                <h4
                                    class="text-md font-bold font-heading text-abyss-900 dark:text-platinum-100 capitalize mb-2 sm:mb-0">

                                    {{ category.replace(/_/g, ' ') }}

                                </h4>

                                <div class="flex gap-4 text-xs">

                                    <button @click="selectAllInCategory(category)"
                                        class="font-semibold text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:text-kaitoke-green-800 dark:hover:text-kaitoke-green-300 transition-colors">

                                        Select All

                                    </button>

                                    <button @click="deselectAllInCategory(category)"
                                        class="font-semibold text-platinum-600 dark:text-platinum-400 hover:text-platinum-800 dark:hover:text-platinum-200 transition-colors">

                                        Deselect All

                                    </button>

                                </div>

                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <label v-for="perm in perms" :key="perm.id"
                                    class="flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-colors border border-transparent hover:border-kaitoke-green-200 dark:hover:border-kaitoke-green-800/50 hover:bg-kaitoke-green-50/30 dark:hover:bg-abyss-700 group">

                                    <input v-model="selectedPermissions" type="checkbox" :value="perm.name"
                                        class="mt-1 h-4 w-4 text-kaitoke-green-600 focus:ring-kaitoke-green-500 border-platinum-300 dark:border-abyss-600 rounded-sm bg-white dark:bg-abyss-800 checked:border-kaitoke-green-600" />

                                    <div class="flex-1">

                                        <div
                                            class="text-sm font-medium font-body text-abyss-900 dark:text-platinum-200 group-hover:text-kaitoke-green-700 dark:group-hover:text-kaitoke-green-300 transition-colors">

                                            {{ perm.display_name }}

                                        </div>

                                        <div class="text-xs text-platinum-600 dark:text-platinum-400 font-body mt-0.5">

                                            {{ perm.description }}

                                        </div>

                                    </div>

                                </label>

                            </div>

                        </div>

                    </div>

                </div>



                <div
                    class="px-6 py-4 border-t border-platinum-200 dark:border-abyss-700 flex flex-col sm:flex-row justify-between items-center gap-3">

                    <div class="text-sm text-platinum-600 dark:text-platinum-400 font-body order-2 sm:order-1">

                        <span class="font-bold text-kaitoke-green-600 dark:text-kaitoke-green-400">{{

                            selectedPermissions.length }}</span>

                        permission{{ selectedPermissions.length !== 1 ? 's' : '' }} selected

                    </div>

                    <div class="flex gap-3 order-1 sm:order-2">

                        <button @click="closeModal"
                            class="px-5 py-2 rounded-lg text-sm font-medium border border-platinum-300 dark:border-abyss-600 text-abyss-900 dark:text-platinum-200 hover:bg-platinum-100 dark:hover:bg-abyss-800 transition-colors font-body">

                            Cancel

                        </button>

                        <button @click="savePermissions" :disabled="savingPermissions"
                            class="px-5 py-2 rounded-lg text-sm font-medium text-white bg-kaitoke-green-600 hover:bg-kaitoke-green-700 dark:bg-kaitoke-green-500 dark:hover:bg-kaitoke-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-md shadow-kaitoke-green-500/20 font-body">

                            <Save v-if="!savingPermissions" :size="16" />

                            <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>

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

import {

    RefreshCw, AlertCircle, Search, Users, Settings, X, Save

} from 'lucide-vue-next'



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
            axios.get(`/api/org/${organizationId.value}/permissions/members`),
            axios.get(`/api/org/${organizationId.value}/permissions`)
        ])

        members.value = membersRes.data || []
        allPermissions.value = permsRes.data || {}
    } catch (err) {
        console.error('Failed to load data:', err)
        error.value = err.response?.data?.message || 'Failed to load permission data'
        toast.error(error.value)
    } finally {
        loading.value = false
    }
}



const openPermissionModal = async (member) => {

    selectedMember.value = member



    // Fetch current permissions for this user

    try {

        const { data } = await axios.get(

            `/api/org/${organizationId.value}/permissions/users/${member.id}`

        )

        selectedPermissions.value = data.granted_permissions || []

    } catch (err) {

        console.error('Failed to load user permissions:', err)

        selectedPermissions.value = []

    }



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

            `/api/org/${organizationId.value}/permissions/users/${selectedMember.value.id}/bulk`,

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
