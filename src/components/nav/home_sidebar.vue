<!-- frontend\src\components\nav\home_sidebar.vue -->
<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/api'
import {
    ClipboardList,
    UserPlus,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    SquareArrowUpRight,
    Share2 
} from 'lucide-vue-next'

/** Props:
 * - isMobileOpen: toggles off-canvas on small screens
 * - orgId: optional current org id (used for deep links like Manage)
 * - myOrgs, allOrgs, myRequests: optional preloaded lists; if absent we fetch
 */
const props = defineProps({
    isMobileOpen: { type: Boolean, default: false },
    orgId: { type: [String, Number, null], default: null },
    myOrgs: { type: Array, default: null },
    allOrgs: { type: Array, default: null },
    myRequests: { type: Array, default: null },
})
const emit = defineEmits(['close-mobile-sidebar', 'expanded-change'])

const route = useRoute()
const router = useRouter()

/* ------- responsive + mode ------- */
const expanded = ref(false)
const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => (width.value = window.innerWidth))
}

const isMobile = computed(() => width.value < 768)

/* mobile shows FULL (icons + labels) by design */
const mode = computed(() => {
    if (isMobile.value) return props.isMobileOpen ? 'mobile-full' : 'hidden'
    return expanded.value ? 'full' : 'icon'
})
const isHidden = computed(() => mode.value === 'hidden')
const isMobileShown = computed(() => mode.value === 'mobile-full')
const isIcon = computed(() => mode.value === 'icon')
const isFull = computed(() => mode.value === 'full')

watchEffect(() => emit('expanded-change', isFull.value))

/* ------- data (use props if provided, else fetch) ------- */
const loading = ref({ mine: false, all: false, req: false })
const mine = ref(props.myOrgs ?? [])
const all = ref(props.allOrgs ?? [])
const reqs = ref(props.myRequests ?? [])

const needFetchMine = computed(() => !props.myOrgs)
const needFetchAll = computed(() => !props.allOrgs)
const needFetchReq = computed(() => !props.myRequests)

onMounted(async () => {
    await Promise.all([
        needFetchMine.value ? loadMine() : null,
        needFetchAll.value ? loadAll() : null,
        needFetchReq.value ? loadReqs() : null,
    ])
})

async function loadMine() {
    loading.value.mine = true
    try {
        const { data } = await axios.get('/api/organizations', { params: { scope: 'mine' } })
        mine.value = data || []
    } finally {
        loading.value.mine = false
    }
}

async function loadAll() {
    loading.value.all = true
    try {
        const { data } = await axios.get('/api/organizations', { params: { scope: 'others' } })
        all.value = data || []
    } finally {
        loading.value.all = false
    }
}


async function loadReqs() {
    loading.value.req = true
    try {
        const { data } = await axios.get('/api/organizations/my-requests')
        reqs.value = data || []

        console.log('Loaded my requests:', reqs.value);
    } finally {
        loading.value.req = false
    }
}

/* ------- logo helpers (same behavior as OrgDetail) ------- */
const R2_WORKER_ENDPOINT = import.meta.env.VITE_R2_WORKER_ENDPOINT || ''

function getOrgLogoUrl(org) {
    if (!org || !org.logo) return ''

    const path = org.logo
    if (typeof path !== 'string') return ''

    // Already full URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
    }

    // Use R2 worker endpoint if configured
    if (!R2_WORKER_ENDPOINT) return ''

    const cleanEndpoint = R2_WORKER_ENDPOINT.replace(/\/$/, '')
    const cleanPath = path.startsWith('/') ? path.slice(1) : path

    return `${cleanEndpoint}/${cleanPath}`
}

function getOrgInitials(org) {
    const name = org?.name || ''
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return '?'

    const first = parts[0]?.[0] || ''
    const second = parts[1]?.[0] || ''
    return (first + second).toUpperCase()
}

function goSharedDocuments() {
    // If user has a current org, show shared docs for that org
    if (currentId.value) {
        router.push({
            name: 'org.shared-documents',
            params: { id: currentId.value }
        })
    } else {
        // Otherwise go to home with a shared docs filter
        router.push({ name: 'home', query: { tab: 'shared' } })
    }
}

/* ------- helpers ------- */
const currentId = computed(() => props.orgId ?? route.params.id ?? null)

function goOrg(id) {
    router.push({ name: 'orgs.org', params: { id } })
}

function goManage(id) {
    router.push({ name: 'org.overview', params: { id } })
}



function goMyRequests() {
    router.push({ name: 'orgs.requests' })
}
</script>

<template>
    <!-- Mobile overlay -->
    <Transition enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-to-class="opacity-0">
        <div v-if="isMobileShown" class="fixed inset-0 z-40 md:hidden bg-black/50"
            @click="$emit('close-mobile-sidebar')" />
    </Transition>

    <aside :class="[
        'fixed top-16 left-0 bottom-0 z-40',
        'border-r bg-white text-abyss-900 border-sun-200',
        'dark:bg-abyss-900 dark:text-platinum-300 dark:border-abyss-700',
        'transition-all duration-300 ease-in-out',
        isHidden && 'hidden md:block',
        isIcon && 'w-20 md:block',
        isFull && 'w-64 md:block',
        isMobileShown && 'w-72 md:hidden'
    ]">
        <div class="h-full flex flex-col overflow-y-auto">
            <!-- Expand/Collapse button (desktop only) -->
            <div v-if="!isMobileShown"
                class="hidden md:flex items-center justify-end p-2 border-b border-sun-200 dark:border-abyss-700">
                <button @click="expanded = !expanded"
                    class="p-2 rounded-lg hover:bg-sun-100 dark:hover:bg-abyss-800 transition"
                    :aria-label="isFull ? 'Collapse sidebar' : 'Expand sidebar'">
                    <ChevronLeft v-if="isFull" class="h-4 w-4" />
                    <ChevronRight v-else class="h-4 w-4" />
                </button>
            </div>

            <nav class="flex-1 px-2 py-4 space-y-4">
                <!-- My Organizations -->
                <section>
                    <div v-if="isFull || isMobileShown"
                        class="px-2 text-[11px] uppercase tracking-wide text-kaitoke-green-500 dark:text-kaitoke-green-400">
                        My Organizations
                    </div>
                    <div v-else class="my-2 border-t border-sun-200 dark:border-abyss-700"></div>

                    <div v-if="loading.mine" class="px-3 py-2 text-sm text-platinum-500">Loading…</div>
                    <template v-else>
                        <button v-for="org in mine" :key="'mine-' + org.id" @click="goOrg(org.id)" :title="org.name"
                            :class="[
                                'w-full rounded-lg transition px-3 py-2',
                                'hover:bg-sun-100 dark:hover:bg-abyss-800',
                                'text-left',
                                route.params.id == org.id
                                    ? 'bg-kaitoke-green-100 text-kaitoke-green-700 dark:bg-kaitoke-green-900/30 dark:text-kaitoke-green-300'
                                    : ''
                            ]">
                            <div :class="[
                                'flex items-center gap-3',
                                isIcon ? 'justify-center' : 'justify-start'
                            ]">
                                <!-- Avatar / Logo -->
                                <div
                                    class="h-8 w-8 rounded-md flex-shrink-0 overflow-hidden bg-sun-300 dark:bg-abyss-700 flex items-center justify-center">
                                    <img v-if="getOrgLogoUrl(org)" :src="getOrgLogoUrl(org)" :alt="org.name"
                                        class="h-full w-full object-cover" />
                                    <span v-else
                                        class="text-[10px] font-semibold text-abyss-900 dark:text-platinum-100">
                                        {{ getOrgInitials(org) }}
                                    </span>
                                </div>

                                <div v-if="!isIcon" class="flex items-center justify-between min-w-0 flex-1">
                                    <span class="truncate font-normal flex-1 font-heading text-sm font-[300]">
                                        {{ org.name }}
                                    </span>

                                    <button v-if="isFull || isMobileShown"
                                        class="flex-shrink-0 text-platinum-500 hover:text-kaitoke-green-500 p-1 pl-2 -m-1"
                                        @click.stop="goManage(org.id)" :title="'Manage ' + org.name">
                                        <SquareArrowUpRight class="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </button>

                        <div v-if="!mine.length" class="px-3 py-2 text-sm text-platinum-500">
                            No organizations yet.
                        </div>
                    </template>
                </section>

                <hr class="border-sun-200 dark:border-abyss-700" />

                <!-- All Organizations -->
                <section>
                    <div v-if="isFull || isMobileShown"
                        class="px-2 text-[11px] uppercase tracking-wide text-kaitoke-green-500 dark:text-kaitoke-green-400">
                        Discover Organizations
                    </div>
                    <div v-else class="my-2 border-t border-sun-200 dark:border-abyss-700"></div>

                    <div v-if="loading.all" class="px-3 py-2 text-sm text-platinum-500">Loading…</div>
                    <template v-else>
                        <button v-for="org in all" :key="'all-' + org.id" @click="goOrg(org.id)" :title="org.name"
                            :class="[
                                'w-full rounded-lg transition px-3 py-2',
                                'hover:bg-sun-100 dark:hover:bg-abyss-800',
                            ]">
                            <div :class="[
                                'flex items-center gap-3',
                                isIcon ? 'justify-center' : 'justify-start'
                            ]">
                                <!-- Avatar / Logo -->
                                <div
                                    class="h-8 w-8 rounded-md flex-shrink-0 overflow-hidden bg-sun-300 dark:bg-abyss-700 flex items-center justify-center">
                                    <img v-if="getOrgLogoUrl(org)" :src="getOrgLogoUrl(org)" :alt="org.name"
                                        class="h-full w-full object-cover" />
                                    <span v-else
                                        class="text-[10px] font-semibold text-abyss-900 dark:text-platinum-100">
                                        {{ getOrgInitials(org) }}
                                    </span>
                                </div>

                                <span v-if="!isIcon" class="truncate font-normal">
                                    {{ org.name }}
                                </span>
                            </div>
                        </button>

                        <div v-if="!all.length" class="px-3 py-2 text-sm text-platinum-500">
                            No other orgs found.
                        </div>
                    </template>
                </section>

                <hr class="border-sun-200 dark:border-abyss-700" />

                <section>
                    <div v-if="isFull || isMobileShown"
                        class="px-2 text-[11px] uppercase tracking-wide text-kaitoke-green-500 dark:text-kaitoke-green-400">
                        My Requests
                    </div>
                    <div v-else class="my-2 border-t border-sun-200 dark:border-abyss-700"></div>

                    <button @click="goMyRequests()" :title="'View all my join requests'" :class="[
                        'w-full rounded-lg transition px-3 py-2',
                        'hover:bg-sun-100 dark:hover:bg-abyss-800',
                        'text-left',
                        route.name === 'user.my-requests'
                            ? 'bg-kaitoke-green-100 text-kaitoke-green-700 dark:bg-kaitoke-green-900/30 dark:text-kaitoke-green-300'
                            : ''
                    ]">
                        <div :class="[
                            'flex items-center gap-3',
                            isIcon ? 'justify-center' : 'justify-between'
                        ]">
                            <div
                                :class="[isIcon ? '' : 'flex items-center gap-3', reqs.length > 0 ? 'text-sun-500' : '']">
                                <ClipboardList class="h-5 w-5 flex-shrink-0" />
                                <span v-if="!isIcon" class="font-heading text-sm font-[300]">
                                    My Requests
                                </span>
                            </div>
                            <!-- Badge showing count of requests -->
                            <span v-if="!isIcon && reqs.length > 0"
                                class="rounded-full px-2 py-0.5 text-xs font-medium text-abyss-900 bg-sun-500 dark:text-platinum-100 dark:bg-electric-lime-600">
                                {{ reqs.length || 2 }}
                            </span>
                        </div>
                    </button>
                </section>

                <hr class="border-sun-200 dark:border-abyss-700" />

                <section>
                    <div v-if="isFull || isMobileShown"
                        class="px-2 text-[11px] uppercase tracking-wide text-kaitoke-green-500 dark:text-kaitoke-green-400">
                        Shared with Me
                    </div>

                    <button @click="goSharedDocuments()" :class="[
                        'w-full rounded-lg transition px-3 py-2',
                        'hover:bg-sun-100 dark:hover:bg-abyss-800',
                        'text-left',
                        route.name === 'org.shared-documents'
                            ? 'bg-kaitoke-green-100 text-kaitoke-green-700 dark:bg-kaitoke-green-900/30 dark:text-kaitoke-green-300'
                            : ''
                    ]">
                        <div :class="[
                            'flex items-center gap-3',
                            isIcon ? 'justify-center' : 'justify-between'
                        ]">
                            <div class="flex items-center gap-3">
                                <Share2 class="h-5 w-5 flex-shrink-0" />
                                <span v-if="!isIcon" class="font-heading text-sm font-[300]">
                                    Shared Documents
                                </span>
                            </div>
                        </div>
                    </button>
                </section>
            </nav>
        </div>
    </aside>
</template>
