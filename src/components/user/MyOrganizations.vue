<!-- src/components/user/MyOrganizations.vue -->
<template>
    <div>
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-platinum-50">My Organizations</h2>
            <p class="text-platinum-400 text-sm">{{ organizations.length }} organization{{ organizations.length !== 1 ?
                's' : '' }}</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-kaitoke-green-600"></div>
            <span class="ml-3 text-platinum-400">Loading organizations...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="!organizations.length"
            class="text-center py-12 bg-abyss-800 rounded-lg border border-abyss-700">
            <div class="text-4xl mb-3">🏢</div>
            <p class="text-platinum-400 mb-4">You haven't joined any organizations yet</p>
            <button @click="$emit('join-org')"
                class="px-4 py-2 rounded-md bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-abyss-900 font-medium">
                Browse Organizations
            </button>
        </div>

        <!-- Organizations Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="org in organizations" :key="org.id"
                class="rounded-lg border border-abyss-700 bg-abyss-800 p-5 hover:border-kaitoke-green-700/50 transition-all cursor-pointer"
                @click="$emit('view-org', org.id)">
                <div class="flex items-start justify-between mb-3">
                    <h3 class="text-lg font-semibold text-platinum-50">{{ org.name }}</h3>
                    <span :class="[
                        'px-2 py-1 text-xs rounded-full font-medium',
                        org.role === 'admin' && 'bg-kaitoke-green-900/30 text-kaitoke-green-300 border border-kaitoke-green-700/50',
                        org.role === 'member' && 'bg-blue-900/30 text-blue-300 border border-blue-700/50',
                        org.role === 'viewer' && 'bg-gray-700/30 text-gray-400 border border-gray-600/50'
                    ]">
                        {{ org.role }}
                    </span>
                </div>

                <p class="text-platinum-400 text-sm line-clamp-2 mb-3">
                    {{ org.description || 'No description available' }}
                </p>

                <div class="flex items-center gap-4 text-xs text-platinum-500">
                    <span v-if="org.member_count">👥 {{ org.member_count }} members</span>
                    <span>🔗 {{ org.slug }}</span>
                </div>

                <div class="mt-4 pt-3 border-t border-abyss-700 flex gap-2">
                    <button @click.stop="$emit('view-org', org.id)"
                        class="flex-1 px-3 py-1.5 text-sm rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-700">
                        View Details
                    </button>
                    <button v-if="org.role === 'admin'" @click.stop="$emit('manage-org', org.id)"
                        class="flex-1 px-3 py-1.5 text-sm rounded-md bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-abyss-900 font-medium">
                        Manage
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    organizations: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false }
})

defineEmits(['view-org', 'manage-org', 'join-org'])
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>