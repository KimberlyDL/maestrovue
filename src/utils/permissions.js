// src/utils/permissions.js

/**
 * Centralized permission constants
 * These MUST match the permission names in PermissionSeeder.php
 */
export const PERMISSIONS = {
    // Member Management
    VIEW_MEMBERS: 'view_members',
    INVITE_MEMBERS: 'invite_members',
    REMOVE_MEMBERS: 'remove_members',
    MANAGE_MEMBER_ROLES: 'manage_member_roles',
    APPROVE_JOIN_REQUESTS: 'approve_join_requests',

    // Organization Settings
    VIEW_ORG_SETTINGS: 'view_org_settings',
    EDIT_ORG_PROFILE: 'edit_org_profile',
    MANAGE_ORG_SETTINGS: 'manage_org_settings',
    MANAGE_INVITE_CODES: 'manage_invite_codes',
    UPLOAD_ORG_LOGO: 'upload_org_logo',

    // Announcements
    VIEW_ANNOUNCEMENTS: 'view_announcements',
    CREATE_ANNOUNCEMENTS: 'create_announcements',
    EDIT_ANNOUNCEMENTS: 'edit_announcements',
    DELETE_ANNOUNCEMENTS: 'delete_announcements',

    // Document Storage (Simplified)
    VIEW_STORAGE: 'view_storage',
    UPLOAD_DOCUMENTS: 'upload_documents', // Also grants: create folders, share own docs
    CREATE_FOLDERS: 'create_folders',
    DELETE_DOCUMENTS: 'delete_documents', // Delete own documents
    ADMIN_DELETE_DOCUMENTS: 'admin_delete_documents', // Admin: delete any document

    // Review System
    CREATE_REVIEWS: 'create_reviews',
    MANAGE_REVIEWS: 'manage_reviews',

    // Duty Management
    // VIEW_DUTY_SCHEDULES: 'view_duty_schedules',
    // CREATE_DUTY_SCHEDULES: 'create_duty_schedules',
    // EDIT_DUTY_SCHEDULES: 'edit_duty_schedules',
    // DELETE_DUTY_SCHEDULES: 'delete_duty_schedules',
    // ASSIGN_DUTIES: 'assign_duties',
    // APPROVE_DUTY_SWAPS: 'approve_duty_swaps',
    // MANAGE_DUTY_TEMPLATES: 'manage_duty_templates',

    PARTICIPATE_IN_DUTIES: 'participate_in_duties',
    MANAGE_DUTY_SYSTEM: 'manage_duty_system',

    // Analytics & Reports
    VIEW_STATISTICS: 'view_statistics',
    EXPORT_DATA: 'export_data',
    VIEW_ACTIVITY_LOGS: 'view_activity_logs',

    // Advanced Management
    ARCHIVE_ORGANIZATION: 'archive_organization',
    TRANSFER_OWNERSHIP: 'transfer_ownership',
    MANAGE_PERMISSIONS: 'manage_permissions',

    // Implicit Member Permissions (no DB check needed)
    VIEW_OWN_ASSIGNMENTS: 'view_own_assignments',
    MANAGE_OWN_AVAILABILITY: 'manage_own_availability',
    REQUEST_DUTY_SWAP: 'request_duty_swap',
    CHECK_IN_DUTY: 'check_in_duty',
    CHECK_OUT_DUTY: 'check_out_duty',
    RESPOND_TO_ASSIGNMENT: 'respond_to_assignment',
    LEAVE_ORGANIZATION: 'leave_organization',
    VIEW_OWN_STATISTICS: 'view_own_statistics',
}

/**
 * Helper to check if permission exists
 */
export function isValidPermission(permission) {
    return Object.values(PERMISSIONS).includes(permission)
}

/**
 * Get permissions by category
 */
export function getPermissionsByCategory() {
    return {
        members: [
            PERMISSIONS.VIEW_MEMBERS,
            PERMISSIONS.INVITE_MEMBERS,
            PERMISSIONS.REMOVE_MEMBERS,
            PERMISSIONS.MANAGE_MEMBER_ROLES,
            PERMISSIONS.APPROVE_JOIN_REQUESTS,
        ],
        organization: [
            PERMISSIONS.VIEW_ORG_SETTINGS,
            PERMISSIONS.EDIT_ORG_PROFILE,
            PERMISSIONS.MANAGE_ORG_SETTINGS,
            PERMISSIONS.MANAGE_INVITE_CODES,
            PERMISSIONS.UPLOAD_ORG_LOGO,
        ],
        announcements: [
            PERMISSIONS.VIEW_ANNOUNCEMENTS,
            PERMISSIONS.CREATE_ANNOUNCEMENTS,
            PERMISSIONS.EDIT_ANNOUNCEMENTS,
            PERMISSIONS.DELETE_ANNOUNCEMENTS,
        ],
        storage: [
            PERMISSIONS.VIEW_STORAGE,
            PERMISSIONS.UPLOAD_DOCUMENTS,
            PERMISSIONS.CREATE_FOLDERS,
            PERMISSIONS.DELETE_DOCUMENTS,
            PERMISSIONS.ADMIN_DELETE_DOCUMENTS,
        ],
        reviews: [
            PERMISSIONS.CREATE_REVIEWS,
            PERMISSIONS.MANAGE_REVIEWS,
        ],
        // duty: [
        //     PERMISSIONS.VIEW_DUTY_SCHEDULES,
        //     PERMISSIONS.CREATE_DUTY_SCHEDULES,
        //     PERMISSIONS.EDIT_DUTY_SCHEDULES,
        //     PERMISSIONS.DELETE_DUTY_SCHEDULES,
        //     PERMISSIONS.ASSIGN_DUTIES,
        //     PERMISSIONS.APPROVE_DUTY_SWAPS,
        //     PERMISSIONS.MANAGE_DUTY_TEMPLATES,
        // ],
        duty: [
            PERMISSIONS.PARTICIPATE_IN_DUTIES,
            PERMISSIONS.MANAGE_DUTY_SYSTEM,
        ],
        analytics: [
            PERMISSIONS.VIEW_STATISTICS,
            PERMISSIONS.EXPORT_DATA,
            PERMISSIONS.VIEW_ACTIVITY_LOGS,
        ],
        advanced: [
            PERMISSIONS.ARCHIVE_ORGANIZATION,
            PERMISSIONS.TRANSFER_OWNERSHIP,
            PERMISSIONS.MANAGE_PERMISSIONS,
        ],
    }
}