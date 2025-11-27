// src/router/modules/authenticated.js
import { PERMISSIONS } from '@/utils/permissions'

const authenticatedRoutes = [
  // ========================================
  // Home Feed - Public to all authenticated users
  // ========================================
  {
    path: "/home",
    component: () => import("@/layouts/HomeLayout.vue"),
    meta: { requiresAuth: true },
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
  // Organization Manage - Admin? --LEYNARDDDDDD
  // ========================================

  {
    path: '/organizations/:id/manage',
    name: 'org.manage',
    component: () => import('@/views/org/OrgManagement.vue'),
    meta: { requiresAuth: true }
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
  // Organization Dashboard - SEPARATED ROUTES
  // ========================================
  {
    path: "/org/:id",
    name: 'org-dashboard',
    component: () => import("@/layouts/AdminLayout.vue"),
    meta: {
      requiresAuth: true,
      requiresMember: true
    },
    children: [
      // ===== OVERVIEW (All members can access) =====
      {
        path: "overview",
        name: "org.overview",
        component: () => import("@views/org/OverviewTab.vue"),
        meta: {
          title: "Organization Overview",
          requiresMember: true
        },
      },

      // ===== ANNOUNCEMENTS (All members can view) =====
      {
        path: "announcements",
        name: "org.announcements",
        component: () => import("@views/org/AnnouncementsTab.vue"),
        meta: {
          title: "Announcements",
          requiresMember: true
        },
      },

      // ===== MEMBERS (All members can view) =====
      {
        path: "members",
        name: "org.members",
        component: () => import("@views/org/MembersTab.vue"),
        meta: {
          title: "Members",
          requiresMember: true
        },
      },

      // ===== MEMBER PROFILE (All members can view) =====
      {
        path: "members/:memberId",
        name: "member.profile",
        component: () => import("@views/org/MemberProfile.vue"),
        meta: {
          title: "Member Profile",
          requiresMember: true
        },
      },

      // ===== REQUESTS & INVITES (Admin/Permission only) =====
      {
        path: "requests",
        name: "org.requests",
        component: () => import("@views/org/RequestsInvitesTab.vue"),
        meta: {
          title: "Requests & Invites",
          requiresPermission: PERMISSIONS.APPROVE_JOIN_REQUESTS
        },
      },

      // ===== SETTINGS (Admin/Permission only) =====
      {
        path: "settings",
        name: "org.settings",
        component: () => import("@views/org/SettingsTab.vue"),
        meta: {
          title: "Settings",
          requiresPermission: PERMISSIONS.MANAGE_ORG_SETTINGS
        },
      },

      // ===== PERMISSIONS MANAGEMENT (Admins only) =====
      {
        path: "permissions",
        name: "org.permissions",
        component: () => import("@views/org/PermissionManagement.vue"),
        meta: {
          title: "Manage Permissions",
          requiresPermission: PERMISSIONS.MANAGE_PERMISSIONS
        },
      },

      // ===== DOCUMENT STORAGE =====
      {
        path: "storage",
        name: "org.doc-storage",
        component: () => import("@views/storage/DocStorage.vue"),
        meta: {
          title: "Document Storage",
          requiresPermission: PERMISSIONS.VIEW_STORAGE
        },
      },

      // ===== DOCUMENT REVIEW SYSTEM =====
      // {
      //   path: "documents",
      //   name: "org.doc-review",
      //   component: () => import("@views/doc/DocReview.vue"),
      //   meta: {
      //     title: "Document Review",
      //     requiresPermission: PERMISSIONS.VIEW_REVIEWS
      //   },
      // },
      {
        path: "documents/my-submissions",
        name: "org.my-submissions",
        component: () => import("@views/doc/ReviewDashboard.vue"),
        meta: {
          title: "My Submissions",
          requiresPermission: PERMISSIONS.CREATE_REVIEWS
        },
      },
      {
        path: "documents/all-submissions",
        name: "org.submissions",
        component: () => import("@views/doc/AdminSubmissions.vue"),
        meta: {
          title: "Upload Document",
          requiresPermission: PERMISSIONS.MANAGE_REVIEWS
        },
      },


      // {
      //   path: "documents/submit",
      //   name: "org.review-submit",
      //   component: () => import("@views/doc/ReviewUpload.vue"),
      //   meta: {
      //     title: "Upload Document",
      //     requiresPermission: PERMISSIONS.CREATE_REVIEWS
      //   },
      // },


      // {
      //   path: "documents/submissions",
      //   name: "org.doc-submission",
      //   component: () => import("@views/doc/PublisherReviewbox.vue"),
      //   meta: {
      //     title: "Submissions",
      //     // requiresPermission: PERMISSIONS.MANAGE_REVIEWS
      //     requiresPermission: 'manage_reviews'
      //   },
      // },


      // eto ang gamit talaga
      {
        path: "reviews/submit",
        name: "org.review-submit",
        component: () => import("@views/doc/ReviewUpload.vue"),
        meta: {
          title: "Submit Review",
          requiresPermission: PERMISSIONS.CREATE_REVIEWS
        },
      },

      {
        path: "incoming-reviews",
        name: "reviewer.mailbox", // Or "org.incoming-reviews"
        component: () => import("@views/reviewer/ReviewMailBox.vue"),
        meta: {
          title: "Review Inbox",
          requiresMember: true // Any member can access, controller filters by assignment
        },
      },
      {
        path: "incoming-reviews/:reviewId",
        name: "org.incoming-review-workspace",
        component: () => import("@views/reviewer/ReviewerWorkspace.vue"),
        props: true,
        meta: {
          title: "Review Workspace",
          requiresMember: true
        },
      },


{
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/views/duty/NotificationPage.vue'),
    meta: { requiresAuth: true, title: 'Notifications' }
}

    ],
  },
];

export default authenticatedRoutes;