<!-- src/layouts/AdminLayout.vue -->
<script setup>
import { watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrganizationStore } from '@/stores/organization'
import AdminSidebar from '@/components/sidebar/admin_sidebar.vue'
import HeaderComponent from '@/components/nav/admin_header_nav.vue'

const route = useRoute()
const orgStore = useOrganizationStore()

// Watch for route changes and update current org
watch(() => route.params.id, (newId) => {
    if (newId) {
        orgStore.setCurrentOrg(newId)
    }
}, { immediate: true })

onMounted(() => {
    // Set from route params if available
    if (route.params.id) {
        orgStore.setCurrentOrg(route.params.id)
    } else {
        // Try to restore from localStorage
        orgStore.restoreCurrentOrg()
    }
})
</script>

<template>
    <div class="min-h-screen flex bg-platinum-400 dark:bg-abyss-900">
        <AdminSidebar />
        <div class="flex-1 flex overflow-y-hidden h-screen py-2">
            <div class="flex-1 flex flex-col overflow-y-auto rounded-l-3xl bg-platinum-400 dark:bg-abyss-800">
                <HeaderComponent />
                <main class="flex-1 p-6">
                    <router-view />
                </main>
            </div>
        </div>
    </div>
</template>