<!-- src/components/user/BrowseOrganizations.vue -->
<template>
    <div>
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-platinum-50">Browse Organizations</h2>
            <div class="flex gap-2">
                <input v-model="searchQuery" type="text" placeholder="Search organizations..."
                    class="px-3 py-2 rounded-md bg-abyss-800 border border-abyss-700 text-platinum-50 text-sm w-64 focus:border-kaitoke-green-700 focus:outline-none" />
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-kaitoke-green-600"></div>
            <span class="ml-3 text-platinum-400">Loading organizations...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="!filteredOrgs.length" class="text-center py-12 bg-abyss-800 rounded-lg border border-abyss-700">
            <div class="text-4xl mb-3">🔍</div>
            <p class="text-platinum-400">No organizations found</p>
        </div>

        <!-- Organizations Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="org in filteredOrgs" :key="org.id"
                class="rounded-lg border border-abyss-700 bg-abyss-800 p-5 hover:border-kaitoke-green-700/50 transition-all">
                <div class="mb-3">
                    <h3 class="text-lg font-semibold text-platinum-50 mb-1">{{ org.name }}</h3>
                    <p class="text-platinum-500 text-xs">@{{ org.slug }}</p>
                </div>

                <p class="text-platinum-400 text-sm line-clamp-3 mb-4">
                    {{ org.description || 'No description available' }}
                </p>

                <div class="flex items-center gap-4 text-xs text-platinum-500 mb-4">
                    <span v-if="org.member_count">👥 {{ org.member_count }} members</span>
                    <span v-if="org.type">📋 {{ org.type }}</span>
                </div>

                <div class="flex gap-2">
                    <button @click="$emit('view-org', org.id)"
                        class="flex-1 px-3 py-2 text-sm rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-700">
                        View Details
                    </button>
                    <button @click="$emit('request-join', org)"
                        class="flex-1 px-3 py-2 text-sm rounded-md bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-abyss-900 font-medium">
                        Request to Join
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    organizations: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false }
})

defineEmits(['view-org', 'request-join'])

const searchQuery = ref('')

const filteredOrgs = computed(() => {
    if (!searchQuery.value) return props.organizations

    const query = searchQuery.value.toLowerCase()
    return props.organizations.filter(org =>
        org.name.toLowerCase().includes(query) ||
        org.slug.toLowerCase().includes(query) ||
        org.description?.toLowerCase().includes(query)
    )
})
</script>

<style scoped>
.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>