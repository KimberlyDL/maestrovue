<script setup>
import { ref, computed } from 'vue'
import { Share2, Link2, Copy, CheckCircle, Globe, Users, Lock } from 'lucide-vue-next'
import { useDocumentShare } from '@/utils/useDocumentShare'
import ShareDocumentModal from '@/components/storage/ShareDocumentModal.vue'

const props = defineProps({
    document: {
        type: Object,
        required: true
    },
    organizationId: {
        type: Number,
        required: true
    },
    // Show as icon button or full button
    iconOnly: {
        type: Boolean,
        default: false
    },
    // Size: 'sm', 'md', 'lg'
    size: {
        type: String,
        default: 'md'
    }
})

const emit = defineEmits(['shared', 'updated'])

const { share, loadShare, copyShareLink } = useDocumentShare()

const showModal = ref(false)
const loading = ref(false)
const quickCopied = ref(false)

// Computed
const shareIcon = computed(() => {
    if (!share.value) return Share2

    switch (share.value.access_level) {
        case 'public':
            return Globe
        case 'link':
            return Link2
        case 'org_only':
        default:
            return Users
    }
})

const shareStatus = computed(() => {
    if (!share.value) return 'Not shared'

    switch (share.value.access_level) {
        case 'public':
            return 'Public'
        case 'link':
            return 'Shared via link'
        case 'org_only':
        default:
            return 'Organization only'
    }
})

const isShared = computed(() => {
    return share.value?.access_level !== 'org_only'
})

const buttonSizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return props.iconOnly ? 'p-1.5' : 'px-3 py-1.5 text-xs'
        case 'lg':
            return props.iconOnly ? 'p-3' : 'px-6 py-3 text-base'
        case 'md':
        default:
            return props.iconOnly ? 'p-2' : 'px-4 py-2 text-sm'
    }
})

const iconSizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'h-3.5 w-3.5'
        case 'lg':
            return 'h-5 w-5'
        case 'md':
        default:
            return 'h-4 w-4'
    }
})

// Methods
async function openShareModal() {
    loading.value = true

    try {
        await loadShare(props.document.id, props.organizationId)
        showModal.value = true
    } catch (error) {
        console.error('Failed to load share:', error)
    } finally {
        loading.value = false
    }
}

async function quickCopyLink() {
    if (!isShared.value) {
        // If not shared, open modal instead
        await openShareModal()
        return
    }

    const success = await copyShareLink()
    if (success) {
        quickCopied.value = true
        setTimeout(() => quickCopied.value = false, 2000)
        emit('shared', share.value)
    }
}

function handleModalUpdated(updatedShare) {
    emit('updated', updatedShare)
}
</script>

<template>
    <div class="inline-flex items-center gap-1">
        <!-- Main share button -->
        <button @click="openShareModal" :disabled="loading" :class="[
            'rounded-xl font-medium transition-all disabled:opacity-50',
            buttonSizeClasses,
            isShared
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/40'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-abyss-700 dark:text-platinum-300 dark:hover:bg-abyss-600'
        ]" :title="shareStatus">
            <div class="flex items-center gap-2">
                <component :is="shareIcon" :class="iconSizeClasses" />
                <span v-if="!iconOnly">{{ isShared ? 'Shared' : 'Share' }}</span>
            </div>
        </button>

        <!-- Quick copy button (only show if already shared) -->
        <button v-if="isShared && !iconOnly" @click="quickCopyLink" :class="[
            'rounded-xl transition-all',
            buttonSizeClasses,
            quickCopied
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-abyss-700 dark:text-platinum-400 dark:hover:bg-abyss-600'
        ]" title="Copy share link">
            <component :is="quickCopied ? CheckCircle : Copy" :class="iconSizeClasses" />
        </button>

        <!-- Share modal -->
        <ShareDocumentModal v-if="showModal" :document="document" :organization-id="organizationId"
            @close="showModal = false" @updated="handleModalUpdated" />
    </div>
</template>