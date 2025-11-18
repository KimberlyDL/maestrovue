// src/router/modules/authenticated.js
import { PERMISSIONS } from '@/utils/usePermissions'

const authenticatedRoutes = [
  // ========================================
  // Home Feed - Public to all authenticated users
  // ========================================
  {
    path: "/home",
    component: () => import("@/layouts/HomeLayout.vue"),
    meta: { requiresAuth: true }, // Only requires authentication, no org permissions
    children: [
      {
        path: "",
        name: "home",
        component: () => import("@views/org_discovery/OrgsFeed.vue"),
        meta: { title: "Home Feed" },
      },
    ],
  },

  // ========================================
  // Organization Discovery - Public routes
  // ========================================
  {
    path: "/orgs",
    component: () => import("@/layouts/HomeLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: ":id",
        name: "orgs.org",
        component: () => import("@views/org_discovery/OrgDetail.vue"),
        meta: { title: "Organization" },
      },
      {
        path: "",
        name: "orgs.orgs",
        component: () => import("@views/org_discovery/OrgsList.vue"),
        meta: { title: "Organizations" },
      },
      {
        path: "requests",
        name: "orgs.requests",
        component: () => import("@views/org_discovery/MyOrgRequests.vue"),
        meta: { title: "My Join Requests" },
      },
      {
        path: "request",
        name: "orgs.join",
        component: () => import("@views/org_discovery/JoinOrg.vue"),
        meta: { title: "Join Organization" },
      },
    ],
  },

  // ========================================
  // Create Organization - No sidebar
  // ========================================
  {
    path: "/orgs",
    component: () => import("@/layouts/HomeLayoutWithoutSidebar.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "create",
        name: "orgs.create",
        component: () => import("@views/org_discovery/Create.vue"),
        meta: { title: "Create Organization" },
      },
    ],
  },

  // ========================================
  // Join Redirect
  // ========================================
  {
    path: "/join",
    name: "JoinRedirect",
    component: () => import("@/views/org_discovery/JoinRedirect.vue"),
    meta: { requiresAuth: true, title: "Join Organization" },
  },

  // ========================================
  // Organization Dashboard - Member access required
  // ========================================
  {
    path: "/org/:id",
    component: () => import("@/layouts/AdminLayout.vue"),
    meta: { 
      requiresAuth: true, 
      requiresMember: true // User must be a member of the organization
    },
    children: [
      // Organization Management
      {
        path: "manage",
        name: "org.manage",
        component: () => import("@views/org/OrgManagement.vue"),
        meta: { 
          title: "Manage Organization",
          requiresPermission: PERMISSIONS.VIEW_ORG_SETTINGS
        },
      },

      // Document Storage
      {
        path: "storage",
        name: "org.doc-storage",
        component: () => import("@views/storage/DocStorage.vue"),
        meta: { 
          title: "Document Storage",
          requiresPermission: PERMISSIONS.VIEW_STORAGE
        },
      },

      // Document Review System
      {
        path: "documents",
        name: "org.doc-review",
        component: () => import("@views/doc/DocReview.vue"),
        meta: { 
          title: "Document Review",
          requiresPermission: PERMISSIONS.VIEW_REVIEWS
        },
      },
      {
        path: "documents/submit",
        name: "org.doc-submit",
        component: () => import("@views/doc/DocFileUpload.vue"),
        meta: { 
          title: "Upload Document",
          requiresPermission: PERMISSIONS.CREATE_REVIEWS
        },
      },
      {
        path: "documents/reviews",
        name: "reviewer.mailbox",
        component: () => import("@views/reviewer/ReviewMailBox.vue"),
        meta: { 
          title: "Review Mailbox",
          requiresPermission: PERMISSIONS.COMMENT_ON_REVIEWS
        },
      },
      {
        path: "documents/submissions",
        name: "org.doc-submission",
        component: () => import("@views/doc/PublisherReviewbox.vue"),
        meta: { 
          title: "Submissions",
          requiresPermission: PERMISSIONS.MANAGE_REVIEWS
        },
      },

      // Permissions Management
      {
        path: "permission",
        name: "permission",
        component: () => import("@views/org/PermissionManagement.vue"),
        meta: { 
          title: "Permission Management",
          requiresAdmin: true // Only admins can manage permissions
        },
      },
    ],
  },
];

export default authenticatedRoutes;