<!-- frontend/src/components/org/OverviewTab.vue -->
<template>
    <div class="space-y-8">
        <!-- Logo Section -->
        <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-8 shadow-xl">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-platinum-50 mb-6 flex items-center gap-2">
                <Camera class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Organization Logo
            </h2>
            <div class="flex flex-col sm:flex-row items-start gap-8">
                <div class="flex-shrink-0">
                    <div v-if="currentLogo || previewLogo"
                        class="w-32 h-32 rounded-xl border-4 border-gray-100 dark:border-abyss-600 overflow-hidden bg-abyss-900 shadow-lg">
                        <img :src="currentLogoUrl" alt="Logo" class="w-full h-full object-cover" />
                    </div>
                    <div v-else
                        class="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-abyss-600 bg-gray-50 dark:bg-abyss-900 flex items-center justify-center">
                        <Image class="w-12 h-12 text-gray-400 dark:text-platinum-600" />
                    </div>
                </div>

                <div class="flex-1 space-y-3">
                    <p class="text-gray-600 dark:text-platinum-300 text-sm">
                        Upload a square image (1:1 ratio) for your organization logo. Maximum size: 2MB.
                    </p>
                    <p class="text-gray-500 dark:text-platinum-500 text-xs">
                        Recommended: 512x512px or larger, JPG/PNG format
                    </p>

                    <div class="flex gap-3 pt-2">
                        <label
                            class="px-5 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-medium cursor-pointer transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                            <Upload class="w-4 h-4" /> Choose Image
                            <input type="file" ref="fileInput" accept="image/*" class="hidden"
                                @change="handleFileSelect" />
                        </label>
                        <button v-if="currentLogo" @click="confirmDeleteLogo" :disabled="isDeleting"
                            class="px-5 py-2.5 rounded-xl border border-rose-400/50 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/30 disabled:opacity-50 transition-all font-medium flex items-center gap-2">
                            <Trash2 class="w-4 h-4" /> {{ isDeleting ? 'Deleting...' : 'Remove Logo' }}
                        </button>
                    </div>

                    <p v-if="logoError"
                        class="mt-3 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-1">
                        <AlertTriangle class="w-4 h-4" /> {{ logoError }}
                    </p>
                    <p v-if="logoSuccess"
                        class="mt-3 text-kaitoke-green-600 dark:text-kaitoke-green-400 text-sm font-medium flex items-center gap-1">
                        <CheckCircle class="w-4 h-4" /> {{ logoSuccess }}
                    </p>
                </div>
            </div>

            <div v-if="isUploading" class="mt-6 pt-4 border-t border-gray-200 dark:border-abyss-700">
                <div class="flex items-center justify-between text-sm text-gray-600 dark:text-platinum-400 mb-2">
                    <span>Uploading...</span>
                    <span>{{ uploadProgress }}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-abyss-900 rounded-full h-2 shadow-inner">
                    <div class="bg-kaitoke-green-600 h-2 rounded-full transition-all duration-300"
                        :style="{ width: uploadProgress + '%' }"></div>
                </div>
            </div>
        </div>

        <!-- Organization Details -->
        <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-8 shadow-xl">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                    <Info class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Organization Details
                </h2>
                <button v-if="!isEditing" @click="startEditing"
                    class="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-abyss-700 border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-600 transition-colors shadow-sm flex items-center gap-2">
                    <Pencil class="w-4 h-4" /> Edit
                </button>
                <div v-else class="flex gap-3">
                    <button @click="cancelEditing"
                        class="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-abyss-700 border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-600 transition-colors shadow-sm flex items-center gap-2">
                        <X class="w-4 h-4" /> Cancel
                    </button>
                    <button @click="saveChanges" :disabled="isSaving"
                        class="px-5 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-medium disabled:opacity-50 transition-colors shadow-md hover:shadow-lg flex items-center gap-2">
                        <Save class="w-4 h-4" /> {{ isSaving ? 'Saving...' : 'Save Changes' }}
                    </button>
                </div>
            </div>

            <div class="space-y-6">
                <div class="border-b border-gray-100 dark:border-abyss-700 pb-4">
                    <label class="block text-sm text-gray-500 dark:text-platinum-400 mb-1 font-medium">Name</label>
                    <input v-if="isEditing" v-model="form.name" type="text"
                        class="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner" />
                    <p v-else class="text-lg text-gray-800 dark:text-platinum-50">{{ organization?.name }}</p>
                </div>

                <div class="border-b border-gray-100 dark:border-abyss-700 pb-4">
                    <label
                        class="block text-sm text-gray-500 dark:text-platinum-400 mb-1 font-medium">Description</label>
                    <textarea v-if="isEditing" v-model="form.description" rows="3"
                        class="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner resize-none"></textarea>
                    <p v-else class="text-gray-800 dark:text-platinum-50 whitespace-pre-wrap text-sm">{{
                        organization?.description || 'No description provided.' }}</p>
                </div>

                <div class="border-b border-gray-100 dark:border-abyss-700 pb-4">
                    <label class="block text-sm text-gray-500 dark:text-platinum-400 mb-1 font-medium">Mission</label>
                    <textarea v-if="isEditing" v-model="form.mission" rows="3"
                        class="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner resize-none"></textarea>
                    <p v-else class="text-gray-800 dark:text-platinum-50 whitespace-pre-wrap text-sm">{{
                        organization?.mission || 'No mission statement provided.' }}</p>
                </div>

                <div class="border-b border-gray-100 dark:border-abyss-700 pb-4">
                    <label class="block text-sm text-gray-500 dark:text-platinum-400 mb-1 font-medium">Vision</label>
                    <textarea v-if="isEditing" v-model="form.vision" rows="3"
                        class="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner resize-none"></textarea>
                    <p v-else class="text-gray-800 dark:text-platinum-50 whitespace-pre-wrap text-sm">{{
                        organization?.vision || 'No vision statement provided.' }}</p>
                </div>

                <div class="border-b border-gray-100 dark:border-abyss-700 pb-4">
                    <label class="block text-sm text-gray-500 dark:text-platinum-400 mb-1 font-medium">Website</label>
                    <input v-if="isEditing" v-model="form.website" type="url"
                        class="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner" />
                    <a v-else-if="organization?.website" :href="organization.website" target="_blank"
                        class="text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:underline flex items-center gap-1">{{
                            organization.website }}
                        <ExternalLink class="w-4 h-4" />
                    </a>
                    <p v-else class="text-gray-500 dark:text-platinum-500 text-sm">No website</p>
                </div>

                <!-- Enhanced Location Section -->
                <div>
                    <label
                        class="block text-sm text-gray-500 dark:text-platinum-400 mb-3 font-medium flex items-center gap-2">
                        <MapPin class="w-4 h-4" /> Location
                    </label>

                    <!-- Edit Mode: Enhanced Interactive Map -->
                    <div v-if="isEditing">
                        <MapDisplay v-model:lat="form.location_lat" v-model:lng="form.location_lng"
                            v-model:address="form.location_address" :zoom="15" :editable="true" :show-controls="true"
                            height="400px" @location-changed="handleLocationChange" />
                    </div>

                    <!-- View Mode: Display Map with Distance -->
                    <div v-else>
                        <p v-if="organization?.location?.address"
                            class="text-gray-800 dark:text-platinum-50 text-sm mb-3">
                            {{ organization.location.address }}
                        </p>
                        <p v-else class="text-gray-500 dark:text-platinum-500 text-sm mb-3">No location specified</p>

                        <MapDisplay v-if="organization?.location?.lat && organization?.location?.lng"
                            :lat="parseFloat(organization.location.lat)" :lng="parseFloat(organization.location.lng)"
                            :zoom="15" :address="organization.location.address" :marker-title="organization.name"
                            :editable="false" :show-controls="true" height="400px" />
                    </div>
                </div>
            </div>

            <p v-if="saveError"
                class="mt-4 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-1">
                <AlertTriangle class="w-4 h-4" /> {{ saveError }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from '@/utils/api'
import {
    Camera, Image, Upload, Trash2, CheckCircle, AlertTriangle,
    Pencil, X, Save, Info, ExternalLink, MapPin
} from 'lucide-vue-next'
import MapDisplay from '@/components/ui/map.vue'

const props = defineProps({
    organization: { type: Object, required: true }
})

const emit = defineEmits(['updated', 'logo-updated'])

// Get the R2 Worker Endpoint from environment variables
const R2_WORKER_ENDPOINT = import.meta.env.VITE_R2_WORKER_ENDPOINT;

// Logo upload
const fileInput = ref(null)
const previewLogo = ref(null)
const currentLogo = ref(props.organization?.logo)
const isUploading = ref(false)
const isDeleting = ref(false)
const uploadProgress = ref(0)
const logoError = ref('')
const logoSuccess = ref('')

// Form editing
const isEditing = ref(false)
const isSaving = ref(false)
const saveError = ref('')
const form = ref({
    name: '',
    description: '',
    mission: '',
    vision: '',
    website: '',
    location_address: '',
    location_lat: null,
    location_lng: null,
})

watch(() => props.organization, (newOrg) => {
    if (newOrg) {
        currentLogo.value = newOrg.logo
        form.value = {
            name: newOrg.name || '',
            description: newOrg.description || '',
            mission: newOrg.mission || '',
            vision: newOrg.vision || '',
            website: newOrg.website || '',
            location_address: newOrg.location_address || '',
            location_lat: newOrg.location_lat || null,
            location_lng: newOrg.location_lng || null,
        }
    }
}, { immediate: true })

const currentLogoUrl = computed(() => {
    if (previewLogo.value) return previewLogo.value
    if (props.organization?.logo_url) return props.organization.logo_url

    const path = props.organization?.logo
    if (!path) return ''
    if (path.startsWith('http')) return path

    if (R2_WORKER_ENDPOINT) {
        const cleanEndpoint = R2_WORKER_ENDPOINT.replace(/\/$/, '')
        const cleanPath = path.startsWith('/') ? path.substring(1) : path
        return `${cleanEndpoint}/${cleanPath}`
    }

    return ''
})

function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    logoError.value = ''
    logoSuccess.value = ''

    if (!file.type.startsWith('image/')) {
        logoError.value = 'Please select an image file'
        return
    }

    if (file.size > 2 * 1024 * 1024) {
        logoError.value = 'Image must be smaller than 2MB'
        return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
            const ratio = img.width / img.height
            if (ratio < 0.9 || ratio > 1.1) {
                logoError.value = `Image must be square (1:1 ratio). Current ratio: ${ratio.toFixed(2)}`
                previewLogo.value = null
                return
            }
            previewLogo.value = e.target.result
            uploadLogo(file)
        }
        img.src = e.target.result
    }
    reader.readAsDataURL(file)
}

async function uploadLogo(file) {
    isUploading.value = true
    uploadProgress.value = 0

    const formData = new FormData()
    formData.append('logo', file)

    try {
        const { data } = await axios.post(
            `/api/org/${props.organization.id}/logo`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    uploadProgress.value = Math.round((e.loaded * 100) / e.total)
                }
            }
        )

        currentLogo.value = data.logo
        previewLogo.value = null
        logoSuccess.value = 'Logo uploaded successfully'
        emit('logo-updated')

        setTimeout(() => {
            logoSuccess.value = ''
        }, 3000)
    } catch (error) {
        console.error('Logo upload failed:', error)
        logoError.value = error.response?.data?.message || 'Failed to upload logo'
        previewLogo.value = null
    } finally {
        isUploading.value = false
        uploadProgress.value = 0
        if (fileInput.value) fileInput.value.value = ''
    }
}

async function confirmDeleteLogo() {
    if (!confirm('Are you sure you want to remove the logo?')) return

    isDeleting.value = true
    try {
        await axios.delete(`/api/org/${props.organization.id}/logo`)
        currentLogo.value = null
        logoSuccess.value = 'Logo removed successfully'
        emit('logo-updated')

        setTimeout(() => {
            logoSuccess.value = ''
        }, 3000)
    } catch (error) {
        console.error('Logo deletion failed:', error)
        logoError.value = 'Failed to remove logo'
    } finally {
        isDeleting.value = false
    }
}

function startEditing() {
    isEditing.value = true
    saveError.value = ''
}

function cancelEditing() {
    isEditing.value = false
    form.value = {
        name: props.organization.name || '',
        description: props.organization.description || '',
        mission: props.organization.mission || '',
        vision: props.organization.vision || '',
        website: props.organization.website || '',
        location_address: props.organization.location_address || '',
        location_lat: props.organization.location_lat || null,
        location_lng: props.organization.location_lng || null,
    }
}

async function saveChanges() {
    isSaving.value = true
    saveError.value = ''

    try {
        await axios.patch(`/api/org/${props.organization.id}/overview`, form.value)
        isEditing.value = false
        emit('updated')
    } catch (error) {
        console.error('Failed to save changes:', error)
        saveError.value = error.response?.data?.message || 'Failed to save changes'
    } finally {
        isSaving.value = false
    }
}

function handleLocationChange(locationData) {
    // Location changed via map interaction
    console.log('Location changed:', locationData)
}
</script>