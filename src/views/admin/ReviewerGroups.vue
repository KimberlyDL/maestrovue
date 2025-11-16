<script setup>
import { ref, computed } from 'vue'
import MemberPicker from '@/components/reviewer_groups/member_picker.vue'
import BaseModal from '@/components/modal/base_modal.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/* Mock users (replace with API) */
const users = ref([
    { id: 1, name: 'Ana Santos', orgId: 10, orgName: 'OSAS', email: 'ana@osas.edu' },
    { id: 2, name: 'Miguel Cruz', orgId: 10, orgName: 'OSAS', email: 'miguel@osas.edu' },
    { id: 3, name: 'Carla Reyes', orgId: 20, orgName: 'USG', email: 'carla@usg.edu' },
    { id: 4, name: 'Ramon Dela C', orgId: 20, orgName: 'USG', email: 'ramon@usg.edu' },
    { id: 5, name: 'Jo Tan', orgId: 30, orgName: 'Marketing', email: 'jo@club.edu' },
])

/* Groups state (replace with API) */
let nextGroupId = 3
const groups = ref([
    {
        id: 1,
        name: 'OSAS Core Reviewers',
        memberIds: [1, 2],
        createdAt: '2025-10-10',
    },
    {
        id: 2,
        name: 'USG + OSAS Mix',
        memberIds: [1, 3, 4],
        createdAt: '2025-10-15',
    },
])

/* Helpers */
const userMap = computed(() => Object.fromEntries(users.value.map(u => [u.id, u])))
function resolveMembers(ids = []) { return ids.map(id => userMap.value[id]).filter(Boolean) }

/* Create / Edit modal state */
const formOpen = ref(false)
const editingId = ref(null)
const form = ref({ name: '', memberIds: [] })

function openCreate() {
    editingId.value = null
    form.value = { name: '', memberIds: [] }
    formOpen.value = true
}
function openEdit(id) {
    const g = groups.value.find(x => x.id === id)
    if (!g) return
    editingId.value = id
    form.value = { name: g.name, memberIds: [...g.memberIds] }
    formOpen.value = true
}
function saveGroup() {
    if (!form.value.name.trim() || form.value.memberIds.length === 0) return
    if (editingId.value) {
        const i = groups.value.findIndex(x => x.id === editingId.value)
        if (i !== -1) {
            groups.value[i] = { ...groups.value[i], name: form.value.name.trim(), memberIds: [...form.value.memberIds] }
        }
    } else {
        groups.value.unshift({
            id: nextGroupId++,
            name: form.value.name.trim(),
            memberIds: [...form.value.memberIds],
            createdAt: new Date().toISOString().slice(0, 10),
        })
    }
    formOpen.value = false
}

function deleteGroup(id) {
    const i = groups.value.findIndex(x => x.id === id)
    if (i !== -1) groups.value.splice(i, 1)
}

/* Member picker modal (uses MemberPicker) */
const pickerOpen = ref(false)
function openPicker() { pickerOpen.value = true }

function useGroupForUpload(id) {
    // Navigate to upload page and prefill (you can read from route query later)
    const g = groups.value.find(x => x.id === id)
    if (!g) return
    router.push({ name: 'admin.document-upload-review', query: { groupId: g.id } })
}
</script>

<template>
    <div class="p-6 max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h1 class="text-2xl font-semibold">Reviewer Groups</h1>
                <p class="text-sm text-gray-500">Create reusable reviewer sets from any organization.</p>
            </div>
            <div class="flex items-center gap-2">
                <router-link :to="{ name: 'org.doc-submit' }" class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700
                 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Upload document
                </router-link>
                <button @click="openCreate"
                    class="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    New group
                </button>
            </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
            <div v-for="g in groups" :key="g.id"
                class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <div class="flex items-start justify-between">
                    <div>
                        <h3 class="font-semibold text-gray-800 dark:text-gray-100">{{ g.name }}</h3>
                        <p class="text-xs text-gray-500">Created {{ g.createdAt }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button @click="useGroupForUpload(g.id)"
                            class="px-2.5 py-1 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                            Use for upload
                        </button>
                        <button @click="openEdit(g.id)" class="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700
                           hover:bg-gray-100 dark:hover:bg-gray-800">Edit</button>
                        <button @click="deleteGroup(g.id)" class="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700
                           hover:bg-red-50 text-red-600">Delete</button>
                    </div>
                </div>

                <div class="mt-3">
                    <div class="text-xs text-gray-500 mb-1">Members ({{ g.memberIds.length }}):</div>
                    <ul class="space-y-1">
                        <li v-for="m in resolveMembers(g.memberIds)" :key="m.id"
                            class="flex items-center justify-between rounded border border-gray-100 dark:border-gray-800 px-3 py-2">
                            <div class="min-w-0">
                                <p class="text-sm truncate">{{ m.name }}</p>
                                <p class="text-xs text-gray-500 truncate">{{ m.email }} • {{ m.orgName }}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div v-if="groups.length === 0" class="col-span-full text-center text-sm text-gray-500 py-10">
                No groups yet. Create your first reviewer group.
            </div>
        </div>

        <!-- Create/Edit Group Modal -->
        <BaseModal v-model="formOpen" :width="'520px'" :teleport="false" :persistent="false">
            <h3 class="text-lg font-semibold mb-3">{{ editingId ? 'Edit group' : 'New group' }}</h3>

            <label class="block text-sm mb-1 text-gray-600 dark:text-gray-300">Group name</label>
            <input v-model="form.name" type="text" class="w-full mb-3 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm
               focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="e.g., OSAS Core Reviewers" />

            <div class="mb-2 flex items-center justify-between">
                <div class="text-sm text-gray-600 dark:text-gray-300">Members ({{ form.memberIds.length }})</div>
                <button @click="openPicker" class="text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-700
                                         hover:bg-gray-100 dark:hover:bg-gray-800">Select members</button>
            </div>

            <div class="rounded-lg border border-gray-200 dark:border-gray-800 p-3 max-h-44 overflow-auto space-y-1">
                <div v-if="form.memberIds.length === 0" class="text-xs text-gray-500">No members selected.</div>
                <div v-for="m in resolveMembers(form.memberIds)" :key="m.id"
                    class="flex items-center justify-between text-sm">
                    <span class="truncate">{{ m.name }} • <span class="text-gray-500">{{ m.orgName }}</span></span>
                    <button @click="form.memberIds = form.memberIds.filter(id => id !== m.id)"
                        class="text-xs px-2 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">Remove</button>
                </div>
            </div>

            <div class="flex justify-end gap-2 mt-4">
                <button @click="formOpen = false" class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700
                       hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                <button :disabled="!(form.name && form.memberIds.length)" @click="saveGroup"
                    class="px-3 py-1.5 text-sm rounded-lg text-white"
                    :class="(form.name && form.memberIds.length) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'">
                    Save
                </button>
            </div>
        </BaseModal>

        <!-- Member Picker Modal -->
        <MemberPicker :users="users" v-model:open="pickerOpen" v-model:modelValue="form.memberIds"
            title="Select group members" />
    </div>
</template>
