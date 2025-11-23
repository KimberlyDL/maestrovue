<script setup>
import { ref, computed, watch, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useOrganizationStore } from '@/stores/organization'
import { usePermissionStore } from '@/stores/permission'
import AdminSidebar from '@/components/sidebar/admin_sidebar.vue'
import HeaderComponent from '@/components/nav/admin_header_nav.vue'

const route = useRoute()
const orgStore = useOrganizationStore()
const permissionStore = usePermissionStore()

const loading = ref(true)

// Get organization ID from route
const organizationId = computed(() => {
    return route.params.id ? String(route.params.id) : null
})

// Get organization data from store
const organization = computed(() => {
    return organizationId.value ? orgStore.getOrganization(organizationId.value) : null
})

// 🔥 CRITICAL: Provide organizationId to all child components
provide('organizationId', organizationId)
provide('organization', organization)

// Load organization data when ID changes
async function loadOrganizationData() {
    if (!organizationId.value) {
        loading.value = false
        return
    }

    loading.value = true
    console.log('🏢 AdminLayout loading org:', organizationId.value)

    try {
        // Load from store (will fetch if not cached)
        await orgStore.fetchOrganization(organizationId.value)

        // Load permissions
        await permissionStore.load(organizationId.value)

        // Set as current org
        orgStore.setCurrentOrg(organizationId.value)

        console.log('✅ AdminLayout loaded org:', organization.value?.name)
    } catch (error) {
        console.error('❌ AdminLayout failed to load org:', error)
    } finally {
        loading.value = false
    }
}

// Watch for route changes
watch(() => route.params.id, (newId) => {
    console.log('🔄 AdminLayout org ID changed:', newId)
    if (newId) {
        orgStore.setCurrentOrg(newId)
        loadOrganizationData()
    }
}, { immediate: false })

onMounted(() => {
    console.log('🚀 AdminLayout mounted with org ID:', organizationId.value)
    if (organizationId.value) {
        orgStore.setCurrentOrg(organizationId.value)
        loadOrganizationData()
    } else {
        orgStore.restoreCurrentOrg()
        loading.value = false
    }
})
</script>

<template>
    <div class="min-h-screen flex bg-platinum-50 dark:bg-abyss-900">
        <AdminSidebar />
        <div class="flex-1 flex overflow-y-hidden h-screen">
            <div class="flex-1 flex flex-col overflow-y-auto bg-platinum-50 dark:bg-abyss-800 dark:border-sun-700">
                <HeaderComponent />
                <main class="flex-1">
                    <!-- 🔥 Loading State -->
                    <div v-if="loading" class="flex items-center justify-center h-64">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-kaitoke-green-600"></div>
                    </div>

                    <!-- 🔥 Pass organizationId as prop to all child routes -->
                    <router-view v-else :organization-id="organizationId" :organization="organization"
                        :key="organizationId" />
                </main>
            </div>
        </div>
    </div>
</template>