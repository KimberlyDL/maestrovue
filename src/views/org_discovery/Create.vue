<!-- src/views/org/CreateOrganization.vue -->
<template>
    <div class="min-h-screen pt-28 py-10
              bg-platinum-50 text-bg-abyss-900
              dark:bg-abyss-900 dark:text-platinum-50">
        <div class="max-w-xl mx-auto px-4">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-platinum-50">
                    Create New Organization
                </h1>
                <p class="mt-1 text-sm text-slate-600 dark:text-platinum-400">
                    Set up your new organization and invite members.
                </p>
            </div>

            <!-- Card -->
            <div class="rounded-xl border shadow-xl
               bg-white/85 backdrop-blur-sm
               border-slate-200 ring-1 ring-black/5
               dark:bg-abyss-800/80 dark:border-abyss-700 dark:ring-white/5">
                <form @submit.prevent="createOrganization" class="p-6 space-y-5">
                    <!-- Org Name -->
                    <div>
                        <label for="new-org-name"
                            class="block text-sm font-medium text-slate-800 dark:text-platinum-300 mb-2">
                            Organization Name
                        </label>

                        <input id="new-org-name" v-model.trim="createForm.name" type="text"
                            placeholder="e.g. The Science Club" :disabled="isSubmitting" class="w-full px-4 py-2.5 rounded-lg
                     bg-white border border-slate-300
                     text-slate-900 placeholder-slate-400
                     focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500 focus:border-kaitoke-green-500
                     disabled:opacity-60 disabled:cursor-not-allowed
                     dark:bg-abyss-700 dark:border-abyss-600
                     dark:text-platinum-50 dark:placeholder-platinum-500
                     dark:focus:ring-kaitoke-green-500 dark:focus:border-kaitoke-green-500" required minlength="2"
                            autocomplete="off" />
                        <p class="mt-1.5 text-xs text-slate-500 dark:text-platinum-400">
                            Use a clear, recognizable name your members will expect.
                        </p>
                    </div>

                    <!-- Description -->
                    <div>
                        <label for="description"
                            class="block text-sm font-medium text-slate-800 dark:text-platinum-300 mb-2">
                            Description <span class="text-slate-400 dark:text-platinum-500">(Optional)</span>
                        </label>

                        <textarea id="description" v-model.trim="createForm.description" rows="3"
                            placeholder="A brief description of your organization" :disabled="isSubmitting" class="w-full px-4 py-2.5 rounded-lg
                     bg-white border border-slate-300
                     text-slate-900 placeholder-slate-400
                     focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500 focus:border-kaitoke-green-500
                     disabled:opacity-60 disabled:cursor-not-allowed
                     dark:bg-abyss-700 dark:border-abyss-600
                     dark:text-platinum-50 dark:placeholder-platinum-500
                     dark:focus:ring-kaitoke-green-500 dark:focus:border-kaitoke-green-500"></textarea>
                    </div>

                    <!-- Actions -->
                    <div class="pt-2">
                        <button type="submit" :disabled="isSubmitting || !isValid" class="w-full inline-flex items-center justify-center gap-2
                     px-4 py-2.5 rounded-lg font-medium
                     text-white bg-kaitoke-green-600
                     hover:bg-kaitoke-green-500
                     disabled:bg-slate-300 disabled:text-slate-600
                     disabled:cursor-not-allowed
                     transition-colors">
                            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                            <span>{{ isSubmitting ? 'Creating…' : 'Create Organization' }}</span>
                        </button>

                        <!-- Optional inline feedback (you’re already using toasts) -->
                        <div v-if="successMessage" class="mt-3 p-3 rounded-md text-sm
                        bg-kaitoke-green-900/20 border border-kaitoke-green-700
                        text-kaitoke-green-300">
                            {{ successMessage }}
                        </div>
                        <div v-if="errorMessage" class="mt-3 p-3 rounded-md text-sm
                        bg-red-900/20 border border-red-700
                        text-red-300">
                            {{ errorMessage }}
                        </div>
                    </div>
                </form>
            </div>

            <!-- Small subtext -->
            <p class="mt-4 text-center text-xs text-slate-500 dark:text-platinum-500">
                You can invite members right after creation.
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/api'
import { useToast } from '@/utils/useToast'
import { Loader2 } from 'lucide-vue-next'

const router = useRouter()
const toast = useToast()

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const createForm = ref({
    name: '',
    description: ''
})

const isValid = computed(() => createForm.value.name.trim().length >= 2)

async function createOrganization() {
    if (!isValid.value) return

    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const { data } = await axios.post('/api/organizations', createForm.value)

        toast.success(`Organization "${data.name}" created successfully!`)

        // Route safety: try canonical names, then fallback to /orgs/:id
        try {
            await router.push({ name: 'orgs.org', params: { id: data.id } })
        } catch {
            try {
                await router.push({ name: 'orgs.detail', params: { id: data.id } })
            } catch {
                await router.push(`/orgs/${data.id}`)
            }
        }
    } catch (error) {
        const msg = error?.response?.data?.message || 'Failed to create organization.'
        errorMessage.value = msg
        toast.error(msg)
    } finally {
        isSubmitting.value = false
    }
}
</script>
