<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/api'
import MapDisplay from '@/components/ui/map.vue'
import { SquareArrowOutUpRight, Crown, Users2, Target, Eye, MapPin } from 'lucide-vue-next'
import { useToast } from '@/utils/useToast'

const toast = useToast()
const route = useRoute()
const router = useRouter()

const org = ref(null)
const loading = ref(true)
const isSubmitting = ref(false)
const message = ref({ text: '', type: '' })

const joinStatus = ref({
    isMember: false,
    isAdmin: false,
    isPending: false,
    role: null,
})

const R2_WORKER_ENDPOINT = import.meta.env.VITE_R2_WORKER_ENDPOINT || ''

const orgId = computed(() => (route.params.id ? route.params.id : null))

const orgLogoUrl = computed(() => {
    if (!org.value || !org.value.logo) return ''

    const path = org.value.logo
    if (typeof path !== 'string') return ''

    if (path.startsWith('http')) return path

    if (!R2_WORKER_ENDPOINT) return ''

    const cleanEndpoint = R2_WORKER_ENDPOINT.replace(/\/$/, '')
    const cleanPath = path.startsWith('/') ? path.slice(1) : path

    return `${cleanEndpoint}/${cleanPath}`
})

const isMemberOrAdmin = computed(() => {
    if (joinStatus.value.isAdmin) return 'Admin'
    if (joinStatus.value.isMember) return 'Member'
    return null
})


async function fetchOrganizationDetails() {
    if (!orgId.value) {
        toast.error('Could not load organization. Please try again later.')
        loading.value = false
        org.value = null
        return
    }

    loading.value = true
    try {
        const { data } = await axios.get(`/api/organizations/${orgId.value}`)
        org.value = data

        const userStatus = data.user_status || 'none'

        if (userStatus === 'admin') {
            joinStatus.value = { isMember: true, isAdmin: true, isPending: false, role: 'admin' }
        } else if (userStatus === 'member') {
            joinStatus.value = { isMember: true, isAdmin: false, isPending: false, role: 'member' }
        } else if (userStatus === 'pending') {
            joinStatus.value = { isMember: false, isAdmin: false, isPending: true, role: null }
        } else {
            joinStatus.value = { isMember: false, isAdmin: false, isPending: false, role: null }
        }
    } catch (err) {
        console.error('API Error:', err)
        org.value = null

        const errorMessage = err.response?.data?.message || 'Failed to load organization details from the server.'
        toast.error(errorMessage, 5000)
    } finally {
        loading.value = false
    }
}

async function requestJoinOrg() {
    isSubmitting.value = true
    message.value = { text: '', type: '' }

    const orgName = org.value?.name || 'the organization'

    try {
        await axios.post('/api/organizations/join/request', {
            organization_name: orgName,
        })

        joinStatus.value.isPending = true
        toast.success(`Request sent to join ${orgName}!`, 3000)
        message.value = {
            text: `Join request sent to ${orgName}. An admin will review it shortly.`,
            type: 'success',
        }
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to send join request.'
        toast.error(errorMessage, 5000)
        message.value = {
            text: errorMessage,
            type: 'error',
        }
    } finally {
        isSubmitting.value = false
    }
}


function navigateToManage() {
    router.push({ name: 'org.manage', params: { id: orgId.value } })
}

function goBack() {
    router.push({ name: 'orgs.orgs' })
}

watchEffect(() => {
    if (orgId.value) {
        fetchOrganizationDetails()
    }
})
</script>

<template>
    <div class="min-h-screen bg-platinum-50 dark:bg-abyss-900 py-8">
        <div class="max-w-4xl mx-auto px-6">
            <!-- Skeleton Loading -->
            <div v-if="loading" class="space-y-6 animate-pulse">
                <!-- Header/Hero Skeleton -->
                <div class="bg-sun-50 dark:bg-abyss-800 border border-sun-200 dark:border-abyss-700 rounded-lg p-8">
                    <div class="flex items-start gap-6">
                        <div class="w-24 h-24 rounded-lg bg-sun-200 dark:bg-abyss-700 flex-shrink-0"></div>
                        <div class="flex-1 space-y-3 pt-2">
                            <div class="h-8 bg-sun-200 dark:bg-abyss-700 rounded w-3/4"></div>
                            <div class="h-4 bg-sun-200 dark:bg-abyss-700 rounded w-1/4"></div>
                            <div class="h-4 bg-sun-200 dark:bg-abyss-700 rounded w-full"></div>
                            <div class="h-4 bg-sun-200 dark:bg-abyss-700 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
                <!-- More skeleton content... -->
            </div>

            <!-- Error -->
            <div v-else-if="org === null"
                class="text-center p-8 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400">
                <p class="mb-4 text-lg">⚠️ Failed to load organization details.</p>
                <button @click="goBack"
                    class="mt-4 px-4 py-2 rounded-md border border-abyss-300 dark:border-platinum-700 text-abyss-900 dark:text-platinum-200 hover:bg-sun-100 dark:hover:bg-abyss-700 transition-colors">
                    Back to Organizations
                </button>
            </div>

            <!-- Content -->
            <div v-else-if="org" class="space-y-6">
                <!-- Hero with logo -->
                <div
                    class="bg-gradient-to-r relative from-platinum-50 to-sun-50 dark:from-abyss-800 dark:to-abyss-900 border border-sun-200 dark:border-abyss-700 rounded-lg overflow-hidden">

                    <div class="absolute top-4 right-4 flex space-x-2 z-20">
                        <button v-if="isMemberOrAdmin == `Admin`" title="Admin"
                            class="p-2 text-sun-500 dark:text-sun-400 hover:text-sun-600 dark:hover:text-sun-300 hover:bg-sun-200 dark:hover:bg-abyss-700 rounded-full transition-colors">
                            <Crown class="w-6 h-6" :stroke-width="1.25" fill="currentColor" />
                        </button>
                        <button v-if="isMemberOrAdmin == `Member`" title="Member"
                            class="p-2 text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:text-kaitoke-green-700 dark:hover:text-red-300 hover:bg-sun-200 dark:hover:bg-abyss-700 rounded-full transition-colors">
                            <Users2 class="w-6 h-6" :stroke-width="1.25" />
                        </button>

                        <button v-if="isMemberOrAdmin" @click="navigateToManage" title="Manage Organization"
                            class="p-2 text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:text-kaitoke-green-700 dark:hover:text-kaitoke-green-300 hover:bg-sun-200 dark:hover:bg-abyss-700 rounded-full transition-colors">
                            <SquareArrowOutUpRight class="w-6 h-6" :stroke-width="1.25" />
                        </button>
                    </div>

                    <div class="p-8">
                        <div class="flex items-start gap-6 mb-6">
                            <div class="flex-shrink-0">
                                <img v-if="orgLogoUrl" :src="orgLogoUrl" :alt="org.name"
                                    class="w-24 h-24 rounded-lg object-cover" />
                                <div v-else
                                    class="w-24 h-24 rounded-lg bg-gradient-to-br from-kaitoke-green-500 to-electric-lime-500 dark:from-kaitoke-green-600 dark:to-electric-lime-600 flex items-center justify-center">
                                    <svg class="w-12 h-12 text-platinum-50 dark:text-abyss-900" fill="currentColor"
                                        viewBox="0 0 20 20">
                                        <path
                                            d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM2 9a2 2 0 11-4 0 2 2 0 014 0zM16 12a1 1 0 100-2 1 1 0 000 2z" />
                                    </svg>
                                </div>
                            </div>

                            <div class="flex-1">
                                <h1 class="text-3xl font-bold text-abyss-900 dark:text-platinum-50 mb-2">
                                    {{ org.name }}
                                </h1>
                                <p class="font-body text-sun-600 dark:text-sun-400 text-sm mb-4">
                                    {{ org.members || 0 }} {{ org.members <= 1 ? "Member" : "Members" }} </p>
                                        <p v-if="org.description"
                                            class="font-heading text-abyss-700 dark:text-platinum-300 text-sm">
                                            {{ org.description }}
                                        </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CTA buttons -->
                <div class="flex gap-3 flex-wrap">
                    <button v-if="!isMemberOrAdmin && !joinStatus.isPending" @click="requestJoinOrg"
                        :disabled="isSubmitting" class="px-6 py-3 rounded-lg font-medium transition-all duration-300"
                        :class="[
                            isSubmitting
                                ? 'bg-sun-200 dark:bg-abyss-700 text-abyss-500 dark:text-platinum-400 cursor-not-allowed'
                                : 'bg-kaitoke-green-600 hover:bg-kaitoke-green-700 dark:hover:bg-kaitoke-green-500 text-platinum-50 dark:text-abyss-900 shadow-lg shadow-kaitoke-green-500/20'
                        ]">
                        {{ isSubmitting ? 'Sending Request...' : 'Request to Join' }}
                    </button>

                    <span v-else-if="joinStatus.isPending"
                        class="px-6 py-3 rounded-lg bg-sun-200 dark:bg-platinum-700/30 text-abyss-700 dark:text-platinum-300 font-medium border border-sun-300 dark:border-platinum-600">
                        Request Pending ⏳
                    </span>
                </div>

                <!-- Mission / Vision -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div v-if="org.mission"
                        class="relative bg-sun-50 dark:bg-abyss-800 border border-sun-200 dark:border-abyss-700 rounded-lg p-6 overflow-hidden">
                        <div
                            class="absolute -top-20 -left-14 text-kaitoke-green-200 dark:text-kaitoke-green-800 opacity-40 transform z-0">
                            <Target class="w-36 h-36 md:w-48 md:h-48" />
                        </div>
                        <div class="relative z-10">
                            <h2
                                class="text-lg font-semibold mb-3 text-kaitoke-green-700 dark:text-kaitoke-green-400 flex items-center gap-2">
                                <Target class="w-5 h-5 -mt-2 -ml-2" />
                                Mission
                            </h2>
                            <p class="text-abyss-700 dark:text-platinum-300 text-sm leading-relaxed">
                                {{ org.mission }}
                            </p>
                        </div>
                    </div>

                    <div v-if="org.vision"
                        class="relative bg-sun-50 dark:bg-abyss-800 border border-sun-200 dark:border-abyss-700 rounded-lg p-6 overflow-hidden">
                        <div
                            class="absolute -top-25 -left-14 text-electric-lime-200 dark:text-electric-lime-800 opacity-40 transform z-0">
                            <Eye class="w-36 h-36 md:w-48 md:h-48" />
                        </div>
                        <div class="relative z-10">
                            <h2
                                class="text-lg font-semibold mb-3 text-electric-lime-700 dark:text-electric-lime-400 flex items-center gap-2">
                                <Eye class="w-5 h-5 -mt-2 -ml-2" />
                                Vision
                            </h2>
                            <p class="text-abyss-700 dark:text-platinum-300 text-sm leading-relaxed">
                                {{ org.vision }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Location & Map -->
                <div>
                    <h2 class="text-xl font-semibold mb-2 text-abyss-900 dark:text-platinum-50">Location</h2>
                    <p class="text-abyss-600 dark:text-platinum-400 mb-4">
                        {{ org.location && org.location.address ? org.location.address : 'Location Not Specified' }}
                    </p>

                    <!-- Enhanced Map with Distance Calculator -->
                    <MapDisplay v-if="org.location && org.location.lat && org.location.lng" :lat="org.location.lat"
                        :lng="org.location.lng" :zoom="15" :address="org.location.address" :marker-title="org.name"
                        :editable="false" :show-controls="true" height="500px" />

                    <div v-else
                        class="h-96 w-full rounded-md flex items-center justify-center bg-platinum-100 dark:bg-abyss-800 border border-sun-200 dark:border-abyss-700">
                        <div class="text-center text-abyss-600 dark:text-platinum-400">
                            <MapPin class="w-12 h-12 mx-auto mb-2 text-platinum-400" />
                            <p>No location set for this organization</p>
                        </div>
                    </div>
                </div>

                <!-- Back button -->
                <button @click="goBack"
                    class="mt-4 px-4 py-2 rounded-md border border-abyss-300 dark:border-platinum-700 text-abyss-900 dark:text-platinum-200 hover:bg-sun-100 dark:hover:bg-abyss-700 transition-colors">
                    Back to Organizations
                </button>
            </div>
        </div>
    </div>
</template>