const authenticatedRoutes = [
    {
        path: '/home',
        component: () => import('@/layouts/HomeLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'home',
                component: () => import('@views/org_discovery/OrgsFeed.vue'),
                meta: { title: 'Review Mails' },
            },
        ],
    },

    {
        path: '/orgs',
        component: () => import('@/layouts/HomeLayout.vue'),
        meta: { requiresAuth: true, title: 'Home' },
        children: [
            // {
            //     path: '',
            //     name: 'orgs.feed',
            //     component: () => import('@views/org_discovery/OrgsFeed.vue'),
            //     meta: { title: 'Review Mails' },
            // },
            {
                path: ':id',
                name: 'orgs.org',
                component: () => import('@views/org_discovery/OrgDetail.vue'),
                meta: { title: 'Organization' },
            },
            {
                path: '',
                name: 'orgs.orgs',
                component: () => import('@views/org_discovery/OrgsList.vue'),
                meta: { title: 'Org Lists' },
            },
            {
                path: 'requests',
                name: 'orgs.requests',
                component: () => import('@views/org_discovery/MyOrgRequests.vue'),
                meta: { title: 'My Join Requests' },
            },
            {
                path: 'request',
                name: 'orgs.join',
                component: () => import('@views/org_discovery/JoinOrg.vue'),
                meta: { title: 'Join Org' },
            },
        ],
    },


    {
        path: '/orgs',
        component: () => import('@/layouts/HomeLayoutWithoutSidebar.vue'),
        meta: { requiresAuth: true, title: 'Home' },
        children: [
            {
                path: 'create',
                name: 'orgs.create',
                component: () => import('@views/org_discovery/Create.vue'),
                meta: { title: 'Create Org' },
            },
        ],
    },
    // {
    //     path: '/org',
    //     component: () => import('@/layouts/HomeLayout.vue'),
    //     meta: { requiresAuth: true, title: 'Home' },
    //     children: [
    //         {
    //             path: ':id/manage',
    //             name: 'org.manage',
    //             component: () => import('@views/org/OrgManagement.vue'),
    //             meta: { requiresAuth: true, title: 'Manage Organization' },
    //         }
    //     ],
    // },

    {
        path: '/join',
        name: 'JoinRedirect',
        component: () => import('@/views/org_discovery/JoinRedirect.vue'),
        meta: { requiresAuth: true, title: 'Join Org' },
    },

    {
        path: '/org/:id',
        component: () => import('@/layouts/AdminLayout.vue'), // ✅ parent layout for all doc pages
        // meta: { requiresAuth: true, title: 'Document Management' },
        children: [
            {
                path: 'manage',
                name: 'org.manage',
                component: () => import('@views/org/OrgManagement.vue'),
                meta: { requiresAuth: true, title: 'Manage Organization' },
            },
            {
                path: "storage",
                name: "org.doc-storage",
                component: () => import("@views/storage/DocStorage.vue"),
                meta: { title: "Document Storage" },
            },
            {
                path: 'documents',
                name: 'org.doc-review',
                component: () => import('@views/doc/DocReview.vue'),
                meta: { title: 'Document Review' },
            },
            {
                path: 'documents/submit',
                name: 'org.doc-submit',
                component: () => import('@views/doc/DocFileUpload.vue'),
                meta: { title: 'Upload Document' },
            },
            {
                path: 'documents/reviews',
                name: 'reviewer.mailbox',
                component: () => import('@views/reviewer/ReviewMailBox.vue'),
                meta: { title: 'Review Mails' },
            },
            {
                path: 'documents/submissions',
                name: 'org.doc-submission',
                component: () => import('@views/doc/PublisherReviewbox.vue'),
                meta: { title: 'Submissions' },
            },
        ],
    },
]

export default authenticatedRoutes
