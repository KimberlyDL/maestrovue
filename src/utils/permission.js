// src/directives/permission.js
import { usePermissions } from '@/utils/usePermissions'

/**
 * Vue directive for permission-based visibility
 * Usage:
 * <button v-permission="'upload_documents'">Upload</button>
 * <button v-permission="['edit', 'delete']">Edit/Delete</button>
 * <button v-permission:admin>Admin Only</button>
 * <button v-permission:member>Member Only</button>
 */
export const permissionDirective = {
    mounted(el, binding, vnode) {
        const route = vnode.appContext.config.globalProperties.$route
        const orgId = binding.arg === 'orgId' ? binding.value : route.params.id

        if (!orgId) {
            console.warn('No organization ID available for permission directive')
            return
        }

        const { isAdmin, isMember, hasPermission, hasAnyPermission } = usePermissions(orgId)

        let hasAccess = false

        // Check for special modifiers
        if (binding.arg === 'admin') {
            hasAccess = isAdmin.value
        } else if (binding.arg === 'member') {
            hasAccess = isMember.value
        } else if (binding.value) {
            // Check permissions
            if (typeof binding.value === 'string') {
                hasAccess = hasPermission(binding.value)
            } else if (Array.isArray(binding.value)) {
                hasAccess = hasAnyPermission(binding.value)
            }
        }

        // Hide element if no access
        if (!hasAccess) {
            el.style.display = 'none'
        }
    },

    updated(el, binding, vnode) {
        // Re-run the check on updates
        permissionDirective.mounted(el, binding, vnode)
    }
}

// Register globally in main.js:
// app.directive('permission', permissionDirective)