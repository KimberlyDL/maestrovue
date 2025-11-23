<template>
    <div class="min-h-screen bg-gray-100 dark:bg-abyss-900 p-6" :key="routeKey">
        <div class="max-w-6xl mx-auto">
            <div class="mb-6 flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm">
                    <button @click="goBack"
                        class="flex items-center gap-1 text-gray-500 dark:text-platinum-400 hover:text-kaitoke-green-600 transition-colors">
                        <ArrowLeft class="w-4 h-4" />
                        Back to Members
                    </button>
                    <span class="text-gray-400 dark:text-abyss-500">/</span>
                    <span class="text-gray-700 dark:text-platinum-300 font-medium">Member Profile</span>
                </div>
                <span v-if="loading" class="text-sm text-gray-500 dark:text-platinum-500">Loading…</span>
            </div>

            <div v-if="loading" class="space-y-6">
                <div
                    class="rounded-xl border border-gray-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-6 animate-pulse shadow-xl">
                    <div class="flex items-center gap-4">
                        <div class="h-12 w-12 rounded-full bg-gray-200 dark:bg-abyss-700"></div>
                        <div>
                            <div class="h-6 w-56 bg-gray-200 dark:bg-abyss-700 rounded mb-2"></div>
                            <div class="h-4 w-40 bg-gray-200 dark:bg-abyss-700 rounded"></div>
                        </div>
                    </div>
                </div>
                <div
                    class="h-64 rounded-xl border border-gray-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 animate-pulse shadow-xl">
                </div>
            </div>

            <div v-else-if="!member"
                class="rounded-xl border border-gray-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-10 text-center shadow-xl">
                <div class="text-gray-800 dark:text-platinum-50 text-xl font-semibold mb-1">Member not found</div>
                <div class="text-gray-600 dark:text-platinum-500 text-sm mb-6">The member doesn’t exist or was removed
                    from the
                    organization.</div>
                <router-link :to="{ name: 'org.members', params: { id: organizationId } }"
                    class="inline-flex items-center px-4 py-2.5 rounded-xl bg-kaitoke-green-600 text-white font-semibold hover:bg-kaitoke-green-500 transition-colors shadow-md">
                    Go to Members
                </router-link>
            </div>

            <div v-else>
                <div
                    class="rounded-xl border border-gray-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-6 mb-6 shadow-xl">
                    <div class="flex items-start gap-5">
                        <div
                            class="h-16 w-16 flex-shrink-0 rounded-full bg-kaitoke-green-600 border-2 border-kaitoke-green-400 flex items-center justify-center text-xl font-bold text-white">
                            {{ initials(member?.name) }}
                        </div>
                        <div>
                            <div class="text-3xl text-gray-800 dark:text-platinum-50 font-extrabold">{{ member?.name }}
                            </div>
                            <div class="text-gray-600 dark:text-platinum-400 text-md font-light">{{ member?.email }}
                            </div>

                            <div class="mt-4 flex flex-wrap items-center gap-2">
                                <span class="px-3 py-1 text-xs font-semibold rounded-full border"
                                    :class="member?.role === 'admin'
                                        ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50'
                                        : member?.role === 'coordinator'
                                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50'
                                            : 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50'">
                                    {{ title(member?.role) }}
                                </span>

                                <span class="px-3 py-1 text-xs font-semibold rounded-full border"
                                    :class="member?.active
                                        ? 'bg-kaitoke-green-100 text-kaitoke-green-800 border-kaitoke-green-300 dark:bg-kaitoke-green-900/30 dark:text-kaitoke-green-300 dark:border-kaitoke-green-700/50'
                                        : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-platinum-900/30 dark:text-platinum-400 dark:border-abyss-600'">
                                    {{ member?.active ? 'Active' : 'Inactive' }}
                                </span>

                                <span
                                    class="px-3 py-1 text-xs font-medium rounded-full border border-gray-300 dark:border-abyss-600 text-gray-600 dark:text-platinum-400 bg-gray-50 dark:bg-abyss-900">
                                    Joined {{ fmtDate(member?.joined_at) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="rounded-xl border border-gray-200 dark:border-abyss-700 bg-white dark:bg-abyss-800 p-5 max-w-lg shadow-xl">
                    <div
                        class="text-gray-800 dark:text-platinum-50 font-semibold text-lg mb-4 border-b border-gray-200 dark:border-abyss-700 pb-2">
                        Details
                    </div>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-platinum-500">Member ID</span>
                            <span class="text-gray-800 dark:text-platinum-100 font-mono">{{ member?.id }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-platinum-500">Organization ID</span>
                            <span class="text-gray-800 dark:text-platinum-100 font-mono">{{ organizationId }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600 dark:text-platinum-500">Join Method</span>
                            <span class="text-gray-800 dark:text-platinum-100 capitalize font-medium">{{
                                member?.joinMethod || 'N/A'
                                }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <transition name="fade">
            <div v-if="toast"
                class="fixed bottom-4 right-4 px-4 py-3 bg-kaitoke-green-600 text-white font-medium rounded-lg shadow-lg">
                {{ toast }}
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
// ✅ NEW IMPORT: Import ArrowLeft icon
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'
import { ArrowLeft } from 'lucide-vue-next'

/* ---------- Route + state ---------- */
const route = useRoute()
const router = useRouter() // router is now available

// Correctly identify Organization ID and Member ID from the route params
const organizationId = computed(() => route.params.id)
const memberId = computed(() => route.params.memberId)
const routeKey = computed(() => String(memberId.value ?? ''))

const loading = ref(true)
const member = ref(null)
const toast = ref('')

/* ---------- Data Fetching (Simplified) ---------- */
async function fetchMemberData() {
    if (!organizationId.value || !memberId.value) {
        console.warn('Missing organization or member ID.')
        loading.value = false
        return
    }

    loading.value = true
    try {
        // Correct API endpoint using 'org.manage' route definition
        const response = await api.get(`/api/org/${organizationId.value}/members/${memberId.value}`)

        // The API returns 'joined_at', adjust frontend mapping if necessary
        const data = response.data;
        member.value = {
            ...data,
            // Map the Laravel snake_case field to camelCase for the frontend template
            joined_at: data.joined_at,
            // Dummy values since backend only provides basic data now:
            active: true,
            joinMethod: 'invited'
        };

    } catch (error) {
        console.error('Failed to load member profile:', error)
        member.value = null
        toastMsg('Failed to load profile.')
    } finally {
        loading.value = false
    }
}

/* ---------- Utility Functions (Kept for basic display) ---------- */
// ✅ FIX 2: Added function for browser history back navigation
function goBack() {
    router.go(-1)
}

function initials(n) { return (n || '').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() || 'M' }
function title(s) { s = s || ''; return s.charAt(0).toUpperCase() + s.slice(1) }
function fmtDate(d) {
    // Uses 'joined_at' from API response
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
function toastMsg(msg) { toast.value = msg; setTimeout(() => toast.value = '', 1800) }

/* ---------- Load on mount and on route change ---------- */
onMounted(fetchMemberData)
// Watch the memberId to reload data if navigating between member profiles
watch(memberId, fetchMemberData)

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity .2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>