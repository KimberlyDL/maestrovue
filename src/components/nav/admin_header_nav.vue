<!-- src/components/layout/AppHeader.vue -->
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { Bell, MessageSquare, ChevronDown, User, Settings, LogOut } from 'lucide-vue-next'
import axios from '@/utils/api'


const activeDropdown = ref(null)
const notifications = ref([
    { id: 1, text: 'New feature deployed successfully.', time: '5m ago' },
    { id: 2, text: 'Your monthly usage report is ready.', time: '1h ago' },
])
const messages = ref([
    { id: 1, sender: 'Alice', subject: 'Urgent: Project Feedback', time: '10m ago' },
    { id: 2, sender: 'Bob', subject: 'Meeting Invite', time: '2h ago' },
])

const auth = useAuthStore()
const orgStore = useOrganizationStore()
const router = useRouter()

const userOrganizations = ref([])
const currentUser = computed(() => auth.user || null)
const isAuthed = computed(() => auth.isAuthenticated)
const initials = computed(() => {
    const n = currentUser.value?.name || 'Guest'
    return n.trim().split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase()
})

const toggleDropdown = (name) => {
    activeDropdown.value = activeDropdown.value === name ? null : name
}
const handleClickOutside = (e) => {
    const el = document.getElementById('main-header')
    if (el && !el.contains(e.target)) activeDropdown.value = null
}

async function goProfileSettings() {
    activeDropdown.value = null
    // your route name from the module below:
    router.push({ name: 'profile-settings' })
}

async function doLogout() {
    try { await auth.logout() } finally {
        activeDropdown.value = null
        router.push({ name: 'login' })
    }
}

function switchOrganization(orgId) {
    orgStore.setCurrentOrg(orgId)
    // Optionally reload the page or navigate
    window.location.href = `/org/${orgId}/manage`
}

onMounted(async () => {
    document.addEventListener('click', handleClickOutside)
    if (!isAuthed.value) await auth.restoreSession()

    // Load user's organizations
    try {
        const { data } = await axios.get('/api/organizations?scope=mine')
        userOrganizations.value = data
    } catch (error) {
        console.error('Failed to load organizations:', error)
    }
})
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <header id="main-header"
        class="sticky top-0 z-40 border-b border-sun-200 dark:border-abyss-700 bg-white dark:bg-abyss-900">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="h-16 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <slot name="brand">
                        <router-link :to="{ name: 'home' }"
                            class="flex items-center gap-2 text-xl font-extrabold tracking-wider text-kaitoke-green-600 dark:text-kaitoke-green-400">
                            <svg class="w-6 h-6" viewBox="0 0 500 416" xmlns="http://www.w3.org/2000/svg">
                                <g>
                                    <path
                                        d="m0,0h159.81l91.66,295.44L340.78,0h159.22l-115.77,415.98h-14.08l35.15-337.61-99.19,337.61h-111.63L91.8,74.3l38.63,341.68h-12.33L0,0Z"
                                        fill="currentColor" />
                                    <polygon
                                        points="470.72 328.42 456.73 328.42 431.91 415.98 459.89 415.98 470.72 328.42"
                                        fill="currentColor" />
                                    <polygon points="27.73 328.42 41.72 328.42 66.54 415.98 38.56 415.98 27.73 328.42"
                                        fill="currentColor" />
                                    <polygon points="250 102.76 218.21 0 281.79 0 250 102.76" fill="currentColor" />
                                </g>
                            </svg>
                            Maestro
                        </router-link>
                    </slot>
                </div>
                <!-- Add organization selector -->
                <div v-if="userOrganizations.length > 0" class="relative">
                    <select :value="orgStore.currentOrgId" @change="switchOrganization($event.target.value)"
                        class="px-3 py-2 rounded-md bg-platinum-50 dark:bg-abyss-900 border-b border-sun-200 dark:border-abyss-700 text-abyss-900 dark:text-platinum-50">
                        <option disabled :value="null">Select Organization</option>
                        <option v-for="org in userOrganizations" :key="org.id" :value="org.id">
                            {{ org.name }}
                        </option>
                    </select>
                </div>

                <div class="flex items-center gap-2 sm:gap-4">
                    <!-- Notifications -->
                    <div class="relative">
                        <button @click.stop="toggleDropdown('notifications')" type="button"
                            :aria-expanded="activeDropdown === 'notifications'" aria-label="View notifications"
                            class="relative p-2 rounded-full text-abyss-600/90 dark:text-platinum-200 hover:text-kaitoke-green-700 hover:bg-kaitoke-green-50 dark:hover:bg-abyss-800 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-400"
                            :class="{ 'bg-kaitoke-green-50 text-kaitoke-green-700': activeDropdown === 'notifications' }">
                            <Bell class="w-5 h-5" />
                            <span v-if="notifications.length"
                                class="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] font-bold text-white bg-red-600 rounded-full ring-2 ring-white dark:ring-abyss-900">{{
                                    notifications.length }}</span>
                        </button>

                        <Transition enter-active-class="transition ease-out duration-200"
                            enter-from-class="transform opacity-0 scale-95"
                            enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-150"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95">
                            <div v-if="activeDropdown === 'notifications'"
                                class="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl ring-1 ring-black/5 bg-white dark:bg-abyss-900 divide-y divide-platinum-200/70 dark:divide-abyss-800">
                                <div
                                    class="px-5 py-3 text-base font-bold text-abyss-900 dark:text-white border-b border-platinum-200/70 dark:border-abyss-800">
                                    Notifications</div>
                                <div class="max-h-[320px] overflow-auto">
                                    <a v-for="n in notifications" :key="n.id" href="#"
                                        class="block px-5 py-3 hover:bg-kaitoke-green-50/70 dark:hover:bg-abyss-800 transition">
                                        <p class="text-sm font-medium text-abyss-900 dark:text-platinum-50">{{ n.text }}
                                        </p>
                                        <p class="text-xs text-kaitoke-green-700 dark:text-platinum-300 mt-1">{{ n.time
                                            }}</p>
                                    </a>
                                    <div v-if="!notifications.length"
                                        class="px-5 py-3 text-sm text-abyss-500 dark:text-platinum-300">No new
                                        notifications.</div>
                                </div>
                                <button type="button"
                                    class="w-full text-center py-2 text-sm font-medium text-kaitoke-green-700 hover:bg-platinum-100 dark:hover:bg-abyss-800 rounded-b-2xl">View
                                    All</button>
                            </div>
                        </Transition>
                    </div>

                    <!-- Messages -->
                    <div class="relative">
                        <button @click.stop="toggleDropdown('messages')" type="button"
                            :aria-expanded="activeDropdown === 'messages'" aria-label="View messages"
                            class="relative p-2 rounded-full text-abyss-600/90 dark:text-platinum-200 hover:text-kaitoke-green-700 hover:bg-kaitoke-green-50 dark:hover:bg-abyss-800 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-400"
                            :class="{ 'bg-kaitoke-green-50 text-kaitoke-green-700': activeDropdown === 'messages' }">
                            <MessageSquare class="w-5 h-5" />
                            <span v-if="messages.length"
                                class="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] font-bold text-white bg-red-600 rounded-full ring-2 ring-white dark:ring-abyss-900">{{
                                    messages.length }}</span>
                        </button>

                        <Transition enter-active-class="transition ease-out duration-200"
                            enter-from-class="transform opacity-0 scale-95"
                            enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-150"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95">
                            <div v-if="activeDropdown === 'messages'"
                                class="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl ring-1 ring-black/5 bg-white dark:bg-abyss-900 divide-y divide-platinum-200/70 dark:divide-abyss-800">
                                <div
                                    class="px-5 py-3 text-base font-bold text-abyss-900 dark:text-white border-b border-platinum-200/70 dark:border-abyss-800">
                                    Messages</div>
                                <div class="max-h-[320px] overflow-auto">
                                    <a v-for="m in messages" :key="m.id" href="#"
                                        class="block px-5 py-3 hover:bg-kaitoke-green-50/70 dark:hover:bg-abyss-800 transition">
                                        <p class="text-sm font-bold text-abyss-900 dark:text-platinum-50">{{ m.sender }}
                                        </p>
                                        <p class="text-sm text-abyss-700 dark:text-platinum-200 truncate">{{ m.subject
                                            }}</p>
                                        <p class="text-xs text-kaitoke-green-700 dark:text-platinum-300 mt-1">{{ m.time
                                            }}</p>
                                    </a>
                                    <div v-if="!messages.length"
                                        class="px-5 py-3 text-sm text-abyss-500 dark:text-platinum-300">No
                                        new messages.
                                    </div>
                                </div>
                                <button type="button"
                                    class="w-full text-center py-2 text-sm font-medium text-kaitoke-green-700 hover:bg-platinum-100 dark:hover:bg-abyss-800 rounded-b-2xl">View
                                    All</button>
                            </div>
                        </Transition>
                    </div>

                    <!-- Profile -->
                    <div class="relative">
                        <!-- Button: JUST avatar + chevron -->
                        <button @click.stop="toggleDropdown('profile')" type="button"
                            :aria-expanded="activeDropdown === 'profile'" aria-haspopup="true"
                            class="group flex items-center gap-2 rounded-full bg-platinum-100 dark:bg-abyss-800 p-1 pr-2 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-400"
                            :class="{ 'ring-2 ring-kaitoke-green-400': activeDropdown === 'profile' }">
                            <img v-if="currentUser?.avatar" :src="currentUser.avatar" :alt="currentUser?.name"
                                class="h-9 w-9 rounded-full object-cover" />
                            <div v-else
                                class="h-9 w-9 rounded-full flex items-center justify-center bg-kaitoke-green-600 text-white text-sm font-bold">
                                {{ initials }}
                            </div>
                            <ChevronDown class="w-4 h-4 text-abyss-500 group-hover:text-kaitoke-green-700 transition" />
                        </button>

                        <!-- Dropdown: SHOW full profile details here -->
                        <Transition enter-active-class="transition ease-out duration-200"
                            enter-from-class="transform opacity-0 scale-95"
                            enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-150"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95">
                            <div v-if="activeDropdown === 'profile'"
                                class="absolute right-0 mt-3 w-72 rounded-2xl shadow-2xl ring-1 ring-black/5 bg-white dark:bg-abyss-900 py-1"
                                role="menu">
                                <!-- Identity block -->
                                <div class="px-4 py-3">
                                    <p class="text-sm font-semibold text-abyss-900 dark:text-white">
                                        {{ currentUser?.name || 'Guest' }}
                                    </p>
                                    <p class="text-xs text-abyss-600 dark:text-platinum-300 truncate">
                                        {{ currentUser?.email || '' }}
                                    </p>
                                    <p v-if="currentUser?.role"
                                        class="mt-1 text-[11px] inline-flex items-center px-2 py-0.5 rounded-full bg-kaitoke-green-50 text-kaitoke-green-800 dark:bg-abyss-800 dark:text-platinum-200">
                                        {{ currentUser.role }}
                                    </p>
                                </div>
                                <div class="my-1 h-px bg-platinum-200/70 dark:bg-abyss-800" />

                                <!-- Actions -->
                                <button type="button" @click="goProfileSettings"
                                    class="flex w-full items-center gap-2 px-4 py-2 text-sm text-abyss-700 dark:text-platinum-100 hover:bg-kaitoke-green-50/70 dark:hover:bg-abyss-800">
                                    <Settings class="w-4 h-4" /> Profile Settings
                                </button>
                                <button type="button" @click="doLogout"
                                    class="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-abyss-800">
                                    <LogOut class="w-4 h-4" /> Logout
                                </button>
                            </div>
                        </Transition>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>


<!-- <style scoped>
@import "tailwindcss";
/*
  The scoped attribute will ensure these classes only apply
  to elements within this component's template.
*/

/* 1. Item Movement */
/* Applies when an item changes position (for TransitionGroup) */
.notif-item-move {
    /* Use 'transition' utility class and specify duration/timing */
    @apply transition ease-in-out duration-300;
}

/* 2. Entering items (from nothing to visible) */
.notif-item-enter-active {
    /* Use 'transition' and specify the transform/opacity transition */
    @apply transition-all ease-out duration-300;
}

.notif-item-enter-from {
    /* Starting state: translate Y up and fade out */
    @apply transform translate-y-2 opacity-0;
}

.notif-item-enter-to {
    /* Ending state: normal position and full opacity */
    @apply transform translate-y-0 opacity-100;
}

/* 3. Leaving items (from visible to nothing) */
.notif-item-leave-active {
    /* Positioning is important for 'leave-active' in TransitionGroup */
    @apply absolute w-full transition-all ease-in duration-200;
}

.notif-item-leave-to {
    /* Ending state: translate X left and fade out */
    @apply transform -translate-x-full opacity-0;
}
</style> -->