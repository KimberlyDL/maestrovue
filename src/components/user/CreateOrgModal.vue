<!-- src/components/user/CreateOrgModal.vue -->
<template>
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto"
        @click.self="$emit('close')">
        <div class="bg-abyss-800 rounded-lg border border-abyss-700 w-full max-w-2xl my-8">
            <div class="flex items-center justify-between p-5 border-b border-abyss-700">
                <h3 class="text-xl font-semibold text-platinum-50">Create Organization</h3>
                <button @click="$emit('close')" class="text-platinum-400 hover:text-platinum-50 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form @submit.prevent="submitForm" class="p-5 space-y-5">
                <div>
                    <label class="block text-sm font-medium text-platinum-300 mb-2">
                        Organization Name <span class="text-rose-400">*</span>
                    </label>
                    <input v-model="form.name" type="text" placeholder="e.g., UP Tech Guild"
                        class="w-full px-3 py-2 rounded-mdbg-platinum-50 dark:bg-abyss-900 border border-abyss-700 text-platinum-50 placeholder-platinum-500 focus:border-kaitoke-green-700 focus:outline-none"
                        @blur="generateSlug" required maxlength="80" />
                    <p class="text-xs text-platinum-500 mt-1">{{ form.name.length }}/80 characters</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-platinum-300 mb-2">
                        Slug/Handle <span class="text-platinum-500">(auto-generated)</span>
                    </label>
                    <input v-model="form.slug" type="text" placeholder="up-tech-guild" readonly
                        class="w-full px-3 py-2 rounded-mdbg-platinum-50 dark:bg-abyss-900/50 border border-abyss-700 text-platinum-400 cursor-not-allowed" />
                    <p class="text-xs text-platinum-500 mt-1">URL: /orgs/{{ form.slug || 'your-org-slug' }}</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-platinum-300 mb-2">
                        Description <span class="text-rose-400">*</span>
                    </label>
                    <textarea v-model="form.description" rows="4" placeholder="What your organization is about..."
                        class="w-full px-3 py-2 rounded-mdbg-platinum-50 dark:bg-abyss-900 border border-abyss-700 text-platinum-50 placeholder-platinum-500 focus:border-kaitoke-green-700 focus:outline-none"
                        required maxlength="300"></textarea>
                    <p class="text-xs text-platinum-500 mt-1">{{ form.description.length }}/300 characters</p>
                </div>

                <div class="bg-abyss-900/50 rounded-md border border-abyss-700 p-4">
                    <div class="flex items-start gap-3">
                        <div class="text-2xl">ℹ️</div>
                        <div class="flex-1 text-sm text-platinum-400">
                            <p class="font-medium text-platinum-300 mb-1">What happens after creation?</p>
                            <ul class="list-disc list-inside space-y-1">
                                <li>You'll be set as the admin of this organization</li>
                                <li>You can invite members or share an invite code</li>
                                <li>You can manage settings, documents, and reviews</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div v-if="errorMessage"
                    class="p-3 rounded-md bg-rose-900/30 border border-rose-700/50 text-rose-300 text-sm">
                    {{ errorMessage }}
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" @click="$emit('close')"
                        class="flex-1 px-4 py-2 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" :disabled="!canSubmit || isSubmitting"
                        class="flex-1 px-4 py-2 rounded-md bg-kaitoke-green-600 hover:bg-kaitoke-green-500 disabled:bg-abyss-700 disabled:text-platinum-500 text-abyss-900 font-medium transition-colors">
                        {{ isSubmitting ? 'Creating...' : 'Create Organization' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from '@/utils/api'

const emit = defineEmits(['close', 'created'])

const form = ref({
    name: '',
    slug: '',
    description: ''
})

const isSubmitting = ref(false)
const errorMessage = ref('')

const canSubmit = computed(() => {
    return form.value.name.trim().length >= 3 &&
        form.value.slug.trim().length > 0 &&
        form.value.description.trim().length >= 20
})

function generateSlug() {
    if (!form.value.name) return

    const slug = form.value.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

    form.value.slug = slug
}

async function submitForm() {
    if (!canSubmit.value) return

    isSubmitting.value = true
    errorMessage.value = ''

    try {
        const { data } = await axios.post('/organizations', {
            name: form.value.name,
            slug: form.value.slug,
            description: form.value.description
        })

        emit('created', data.organization)
    } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Failed to create organization'
    } finally {
        isSubmitting.value = false
    }
}
</script>