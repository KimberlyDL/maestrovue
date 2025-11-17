<!-- src/utils/PermissionGuard.vue -->
<template>
    <div v-if="loading && !hasAccess" class="flex items-center justify-center p-4">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-kaitoke-green-600"></div>
    </div>
    <div v-else-if="hasAccess">
        <slot />
    </div>
    <div v-else-if="$slots.fallback">
        <slot name="fallback" />
    </div>
    <div v-else-if="showDefaultFallback"
        class="p-6 text-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/50">
        <p class="text-sm text-red-700 dark:text-red-400">
            You don't have permission to access this content.
        </p>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissions } from './usePermissions'

const props = defineProps({
    permission: {
        type: [String, Array],
        default: null
    },
    requireAll: {
        type: Boolean,
        default: false
    },
    adminOnly: {
        type: Boolean,
        default: false
    },
    memberOnly: {
        type: Boolean,
        default: false
    },
    organizationId: {
        type: [String, Number],
        default: null
    },
    showDefaultFallback: {
        type: Boolean,
        default: false
    }
})

const route = useRoute()
const orgId = computed(() => props.organizationId || route.params.id)

const {
    isAdmin,
    isMember,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading,
    loadPermissions
} = usePermissions(orgId.value)

// Load permissions on mount
onMounted(async () => {
    if (orgId.value) {
        await loadPermissions(orgId.value)
    }
})

const hasAccess = computed(() => {
    // Wait for loading to complete
    if (loading.value) {
        return false
    }

    // Admin only check
    if (props.adminOnly) {
        return isAdmin.value
    }

    // Member only check (any member including admin)
    if (props.memberOnly) {
        return isMember.value
    }

    // No permission required
    if (!props.permission) {
        return true
    }

    // Single permission
    if (typeof props.permission === 'string') {
        return hasPermission(props.permission)
    }

    // Multiple permissions
    if (Array.isArray(props.permission)) {
        if (props.requireAll) {
            return hasAllPermissions(props.permission)
        }
        return hasAnyPermission(props.permission)
    }

    return false
})
</script>