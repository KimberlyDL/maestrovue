<script setup>
import { computed } from 'vue'
import { Clock, CheckCircle2, XCircle, FileText, User } from 'lucide-vue-next'
// Updated imports for all custom date formatting utilities
import {
    formatDate,
    formatDistanceToNow,
    formatDueDistance
} from '@/utils/dateUtils'

const props = defineProps({
    review: {
        type: Object,
        required: true,
        // Expected structure for a list item:
        // { id, subject, status, created_at, reviewer_name, due_at }
    },
    isSelected: {
        type: Boolean,
        default: false
    },
    statusOptions: {
        type: Array,
        required: true
    }
})

// --- Status Metadata ---
const statusMeta = computed(() => {
    return props.statusOptions.find(opt => opt.value === props.review.status) || {
        label: props.review.status || 'Unknown',
        icon: Clock,
        color: 'text-gray-500'
    }
})

// --- Submission Date (Relative + Tooltip) ---
const formattedRelativeDate = computed(() => {
    // Show submission date in relative format (e.g., "5 hours ago")
    return formatDistanceToNow(props.review.created_at)
})

const formattedExactDate = computed(() => {
    // Full date for tooltip/fallback (e.g., "Nov 25, 2025")
    return formatDate(props.review.created_at)
})

// --- Due Date (Relative Distance) ---
const dueDistanceMeta = computed(() => {
    // Show due date as distance (e.g., "Due in 3 days", "Overdue by 5 days")
    // Only calculate if status is not final (approved/declined)
    if (['approved', 'declined'].includes(props.review.status)) {
        // Only show 'Completed before due' if a due date was actually set
        return {
            text: props.review.due_at ? `Completed` : 'N/A',
            isOverdue: false
        }
    }
    return formatDueDistance(props.review.due_at)
})

const StatusIcon = computed(() => statusMeta.value.icon)

</script>

<template>
    <div :class="[
        'p-4 border-b border-platinum-200 dark:border-abyss-700 cursor-pointer transition',
        isSelected
            ? 'bg-kaitoke-green-50 dark:bg-kaitoke-green-900/20 border-l-4 border-kaitoke-green-600 dark:border-kaitoke-green-500'
            : 'hover:bg-platinum-100 dark:hover:bg-abyss-700'
    ]">
        <div class="flex items-start justify-between">
            <!-- Review Subject and ID -->
            <h4 :class="[
                'text-base font-semibold truncate flex items-center',
                isSelected ? 'text-abyss-900 dark:text-platinum-50' : 'text-abyss-700 dark:text-platinum-200'
            ]" :title="review.subject">
                <!-- 1. Document Icon -->
                <FileText class="w-4 h-4 mr-2 text-kaitoke-green-600 dark:text-kaitoke-green-400 flex-shrink-0" />
                {{ review.subject }}
            </h4>
        </div>

        <!-- Meta Information -->
        <div class="mt-1 space-y-1">

            <!-- Reviewer and ID -->
            <div class="flex justify-between items-center text-xs text-abyss-500 dark:text-platinum-500">
                <!-- Reviewer -->
                <div class="flex items-center">
                    <User class="w-3 h-3 mr-1" />
                    <span>Reviewer: {{ review.reviewer_name || 'N/A' }}</span>
                </div>
                <!-- 2. Review ID -->
                <span class="font-mono text-abyss-400 dark:text-platinum-600 text-[10px] md:text-xs">
                    #{{ review.id }}
                </span>
            </div>

            <!-- Status -->
            <div class="flex items-center text-xs">
                <component :is="StatusIcon" class="w-3 h-3 mr-1" :class="statusMeta.color" />
                <span class="font-medium" :class="statusMeta.color">{{ statusMeta.label }}</span>
            </div>

            <!-- Date Submitted / Due Date -->
            <div class="flex justify-between text-xs text-abyss-400 dark:text-platinum-600">
                <!-- 4. Submitted Date (Relative Time) -->
                <span :title="'Submitted: ' + formattedExactDate"
                    class="hover:text-abyss-500 dark:hover:text-platinum-500 transition">
                    Submitted: {{ formattedRelativeDate }}
                </span>

                <!-- 3. Due Date (Relative Distance) -->
                <span :title="review.due_at ? 'Exact Due Date: ' + formattedExactDate : 'No due date set'" :class="[
                    'transition font-medium',
                    { 'text-red-600 dark:text-red-400': dueDistanceMeta.isOverdue && review.status !== 'approved' && review.status !== 'declined' },
                    { 'text-orange-500 dark:text-orange-300': dueDistanceMeta.text.includes('today') || dueDistanceMeta.text.includes('tomorrow') },
                ]">
                    {{ dueDistanceMeta.text }}
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* No specific styles needed outside of Tailwind */
</style>