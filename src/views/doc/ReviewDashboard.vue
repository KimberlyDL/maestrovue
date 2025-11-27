<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ReviewSidebar from '@components/doc/review_sidebar.vue'
import ReviewDetails from '@components/doc/review_details.vue' // Placeholder for future component
import ReviewChat from '@components/doc/review_chat.vue' // Placeholder for future component

import { Loader2, ArrowLeft } from 'lucide-vue-next'
import axios from '@/utils/api'

const route = useRoute()
const orgId = computed(() => route.params.id)

// State for the selected review
const selectedReview = ref(null)
const loadingDetails = ref(false)
const chatRef = ref(null)

const handleReviewSelect = async (reviewId) => {
    if (selectedReview.value && selectedReview.value.id === reviewId) {
        return
    }

    loadingDetails.value = true
    selectedReview.value = null

    try {
        // CORRECTION: Use the route defined in routes/api.php
        // Route: Route::get('/reviews/{review}', ...) inside prefix('org/{organization}')
        const response = await axios.get(`/api/org/${orgId.value}/reviews/${reviewId}`)

        // OPTIONAL: Transform data here if you need specific fields like 'reviewer_org_name'
        // derived from the relationships, similar to what we did in the sidebar.
        const data = response.data
        data.reviewer_org_name = data.recipients?.[0]?.reviewer_org?.name || 'N/A' // Example mapping

        selectedReview.value = data

    } catch (error) {
        console.error('Failed to load review details:', error)
    } finally {
        loadingDetails.value = false
    }
}

// Function to update the review state from child components (e.g., after editing)
const updateSelectedReview = (updatedData) => {
    // Merge updates into the current selected review object
    if (selectedReview.value) {
        selectedReview.value = { ...selectedReview.value, ...updatedData }
    }

    if (updatedData.version && chatRef.value) {
        chatRef.value.refresh()
    }
}

onMounted(() => {
    if (!orgId.value) {
        console.error("Organization ID is required for Review Dashboard.")
    }
})

</script>

<template>
    <div class="h-full flex flex-col bg-platinum-100 dark:bg-abyss-900">
        <!-- Header -->
        <header class="p-4 border-b border-platinum-300 dark:border-abyss-700 bg-white dark:bg-abyss-800">
            <h1 class="text-xl font-bold text-abyss-900 dark:text-platinum-50">
                <ArrowLeft
                    class="inline w-5 h-5 mr-3 text-abyss-600 dark:text-platinum-300 cursor-pointer hover:text-kaitoke-green-600"
                    @click="$router.go(-1)" />
                Organization Review Hub (Publisher View)
            </h1>
        </header>

        <!-- Main Content Area: Sidebar (List) + Details -->
        <div class="flex-1 overflow-hidden grid" style="grid-template-columns: 320px 1fr;">

            <!-- 1. Sidebar Component (List of Reviews) -->
            <ReviewSidebar :organization-id="orgId" :selected-review-id="selectedReview?.id"
                @select-review="handleReviewSelect"
                class="border-r border-platinum-300 dark:border-abyss-700 bg-white dark:bg-abyss-800 overflow-y-auto" />

            <!-- 2. Main Detail Area -->
            <div class="overflow-y-auto bg-platinum-50 dark:bg-abyss-900 p-6">
                <div v-if="!selectedReview"
                    class="flex flex-col items-center justify-center h-full text-abyss-500 dark:text-platinum-500">
                    <img src="https://placehold.co/128x128/f0f0f0/888?text=Select+Review" alt="Select Review"
                        class="mb-4 opacity-70 rounded-lg">
                    <p class="text-xl font-medium">Select a Submission</p>
                    <p class="text-sm">Choose a review request from the sidebar to view details and start collaborating.
                    </p>
                </div>

                <div v-else-if="loadingDetails" class="text-center p-10">
                    <Loader2 class="w-8 h-8 mx-auto animate-spin text-kaitoke-green-600" />
                    <p class="mt-2 text-abyss-600 dark:text-platinum-400">Loading review details...</p>
                </div>

                <div v-else>
                    <!-- Review Details (including edit/remind actions) -->
                    <!-- Note: The ReviewDetails and ReviewChat components will be built in later steps -->
                    <ReviewDetails :review="selectedReview" :org-id="orgId" @update-review="updateSelectedReview" />

                    <!-- Chat Component -->
                    <ReviewChat ref="chatRef" :review-id="selectedReview.id" :org-id="orgId" class="mt-8" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* No specific styles needed outside of Tailwind */
</style>