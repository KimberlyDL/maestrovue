<script setup>
import { Edit2, Trash2, CheckCircle2, Circle } from 'lucide-vue-next'

defineProps({
    volunteers: { type: Array, default: () => [] }
})

const emit = defineEmits(['edit', 'delete', 'toggle-attendance'])
</script>

<template>
    <div class="bg-white dark:bg-abyss-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div v-if="volunteers.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
            <p>No volunteers found</p>
        </div>

        <div v-else class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Name</th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Email
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Phone
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Role</th>
                        <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Attendance</th>
                        <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                    <tr v-for="volunteer in volunteers" :key="volunteer.id"
                        class="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <td class="px-4 py-3 text-sm text-abyss-900 dark:text-platinum-300 font-medium">{{
                            volunteer.name }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ volunteer.email }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ volunteer.phone }}</td>
                        <td class="px-4 py-3 text-sm">
                            <span class="px-2 py-1 rounded-full text-xs font-medium" :class="volunteer.role === 'lead'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'">
                                {{ volunteer.role }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-center">
                            <button @click="$emit('toggle-attendance', volunteer.id)"
                                class="inline-flex items-center justify-center p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                :title="volunteer.attended ? 'Mark as absent' : 'Mark as attended'">
                                <CheckCircle2 v-if="volunteer.attended" :size="20"
                                    class="text-emerald-600 dark:text-emerald-400" />
                                <Circle v-else :size="20" class="text-gray-400 dark:text-gray-600" />
                            </button>
                        </td>
                        <td class="px-4 py-3 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button @click="$emit('edit', volunteer.id)"
                                    class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                    title="Edit volunteer">
                                    <Edit2 :size="16" class="text-gray-600 dark:text-gray-400" />
                                </button>
                                <button @click="$emit('delete', volunteer.id)"
                                    class="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                    title="Remove volunteer">
                                    <Trash2 :size="16" class="text-red-600 dark:text-red-400" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
