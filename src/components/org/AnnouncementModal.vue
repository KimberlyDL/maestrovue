<template>
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" @click.self="$emit('close')">
        <div
            class="bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="flex items-center justify-between p-5 border-b border-gray-200 dark:border-abyss-700">
                <h3 class="text-xl font-semibold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                    <Megaphone class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                    {{ isEditing ? 'Edit Announcement' : 'Create New Announcement' }}
                </h3>
                <button @click="$emit('close')"
                    class="text-gray-500 dark:text-platinum-400 hover:text-gray-800 dark:hover:text-platinum-50 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-abyss-700">
                    <X class="w-5 h-5" />
                </button>
            </div>

            <div class="p-6 space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-600 dark:text-platinum-300 mb-2">
                        Title <span class="text-rose-400">*</span>
                    </label>
                    <input v-model="form.title" type="text" maxlength="255"
                        placeholder="e.g., Important Update About..."
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 placeholder-gray-400 dark:placeholder-platinum-500 focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 focus:outline-none shadow-inner" />
                    <p class="text-xs text-gray-500 dark:text-platinum-500 mt-1 text-right">{{ form.title.length }}/255
                        characters</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-600 dark:text-platinum-300 mb-2">
                        Content <span class="text-rose-400">*</span>
                    </label>
                    <textarea v-model="form.content" rows="8" maxlength="5000"
                        placeholder="Write your announcement here..."
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 placeholder-gray-400 dark:placeholder-platinum-500 focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 focus:outline-none shadow-inner resize-none"></textarea>
                    <p class="text-xs text-gray-500 dark:text-platinum-500 mt-1 text-right">{{ form.content.length
                        }}/5000 characters</p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-600 dark:text-platinum-300 mb-2">
                        <Image class="w-4 h-4 inline mr-1" /> Image (Optional)
                    </label>

                    <div v-if="imagePreview || existingImageUrl" class="mb-4">
                        <div class="relative inline-block shadow-lg">
                            <img :src="imagePreview || existingImageUrl" alt="Preview"
                                class="max-w-full h-auto rounded-lg border border-gray-300 dark:border-abyss-700 max-h-64 object-cover" />
                            <button type="button" @click="removeImage"
                                class="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-md">
                                <X class="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div v-if="!imagePreview && !existingImageUrl">
                        <input ref="imageInput" type="file" accept="image/*" @change="handleImageSelect"
                            class="hidden" />
                        <button type="button" @click="$refs.imageInput.click()"
                            class="px-4 py-2 rounded-xl border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 transition-colors flex items-center gap-2 shadow-sm">
                            <Upload class="w-4 h-4" /> Upload Image
                        </button>
                        <p class="text-xs text-gray-500 dark:text-platinum-500 mt-2">Max size: 5MB. Supported: JPG, PNG,
                            GIF</p>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-600 dark:text-platinum-300 mb-2">
                        <Hash class="w-4 h-4 inline mr-1" /> Tags (Optional)
                    </label>
                    <div class="flex gap-3 mb-3">
                        <input v-model="tagInput" type="text" placeholder="Add a tag (e.g., urgent)"
                            @keydown.enter.prevent="addTag"
                            class="flex-1 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 placeholder-gray-400 dark:placeholder-platinum-500 focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 focus:outline-none shadow-inner" />
                        <button type="button" @click="addTag"
                            class="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 transition-colors shadow-sm flex items-center gap-2">
                            <Plus class="w-4 h-4" /> Add
                        </button>
                    </div>
                    <div v-if="form.tags.length" class="flex flex-wrap gap-2 pt-1">
                        <span v-for="(tag, index) in form.tags" :key="index"
                            class="inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-gray-200 dark:bg-abyss-700 text-gray-700 dark:text-platinum-300 border border-gray-300 dark:border-abyss-600 font-medium">
                            {{ tag }}
                            <button type="button" @click="removeTag(index)"
                                class="text-gray-500 dark:text-platinum-500 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 transition-colors">
                                <X class="w-3 h-3" />
                            </button>
                        </span>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-6 border-t border-gray-200 dark:border-abyss-700 pt-5">
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input v-model="form.is_public" type="checkbox"
                            class="h-5 w-5 rounded border-gray-300 text-kaitoke-green-600 focus:ring-kaitoke-green-500 bg-gray-100 dark:bg-abyss-700" />
                        <span class="text-sm text-gray-700 dark:text-platinum-300 flex items-center gap-1">
                            <Globe class="w-4 h-4" /> Make Public
                        </span>
                    </label>

                    <label class="flex items-center gap-3 cursor-pointer">
                        <input v-model="form.priority" type="checkbox"
                            class="h-5 w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500 bg-gray-100 dark:bg-abyss-700" />
                        <span class="text-sm text-gray-700 dark:text-platinum-300 flex items-center gap-1">
                            <MapPin class="w-4 h-4" /> Pin Announcement
                        </span>
                    </label>
                </div>

                <div v-if="errorMessage"
                    class="p-4 rounded-lg bg-rose-100 dark:bg-rose-900/30 border border-rose-400 dark:border-rose-700 text-rose-700 dark:text-rose-300 text-sm font-medium flex items-center gap-2">
                    <AlertTriangle class="w-4 h-4" /> {{ errorMessage }}
                </div>

                <div class="flex gap-3 pt-3">
                    <button type="button" @click="$emit('close')"
                        class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-100 dark:hover:bg-abyss-700 transition-colors font-medium">
                        Cancel
                    </button>
                    <button type="button" @click="saveAnnouncement" :disabled="isSaving || !form.title || !form.content"
                        class="flex-1 px-4 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 disabled:bg-gray-400 disabled:text-gray-700 disabled:cursor-not-allowed text-white font-semibold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                        <Save class="w-4 h-4" /> {{ isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/utils/api'
import { Megaphone, X, Image, Upload, Plus, Hash, Globe, MapPin, Save, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
    announcement: { type: Object, default: null },
    organizationId: { type: [String, Number], required: true }
})

const emit = defineEmits(['close', 'saved'])

const R2_WORKER_ENDPOINT = import.meta.env.VITE_R2_WORKER_ENDPOINT

const isEditing = computed(() => !!props.announcement)
const isSaving = ref(false)
const errorMessage = ref('')
const tagInput = ref('')
const imageInput = ref(null)
const imageFile = ref(null)
const imagePreview = ref(null)
const existingImageUrl = ref(null)
const removeExistingImage = ref(false)

const form = ref({
    title: '',
    content: '',
    is_public: true,
    priority: false,
    tags: []
})

onMounted(() => {
    if (props.announcement) {
        form.value = {
            title: props.announcement.title || '',
            content: props.announcement.content || '',
            is_public: props.announcement.is_public ?? true,
            priority: props.announcement.priority ?? false,
            tags: Array.isArray(props.announcement.tags) ? props.announcement.tags : []
        }

        if (props.announcement.image_path) {
            existingImageUrl.value = getImageUrl(props.announcement.image_path)
        }
    }
})

function getImageUrl(path) {
    if (!path) return ''
    if (path.startsWith('http')) return path

    if (R2_WORKER_ENDPOINT) {
        const cleanEndpoint = R2_WORKER_ENDPOINT.replace(/\/$/, '')
        const cleanPath = path.startsWith('/') ? path.substring(1) : path
        return `${cleanEndpoint}/${cleanPath}`
    }

    return path
}

function handleImageSelect(event) {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
        errorMessage.value = 'Please select an image file'
        return
    }

    if (file.size > 5 * 1024 * 1024) {
        errorMessage.value = 'Image size must be less than 5MB'
        return
    }

    imageFile.value = file
    errorMessage.value = ''

    const reader = new FileReader()
    reader.onload = (e) => {
        imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
}

function removeImage() {
    imageFile.value = null
    imagePreview.value = null

    if (existingImageUrl.value) {
        removeExistingImage.value = true
        existingImageUrl.value = null
    }

    if (imageInput.value) {
        imageInput.value.value = ''
    }
}

function addTag() {
    const tag = tagInput.value.trim().replace(/^#/, '')
    if (tag && !form.value.tags.includes(tag)) {
        form.value.tags.push(tag)
        tagInput.value = ''
    }
}

function removeTag(index) {
    form.value.tags.splice(index, 1)
}

async function saveAnnouncement() {
    if (!form.value.title || !form.value.content) {
        errorMessage.value = 'Title and content are required'
        return
    }

    isSaving.value = true
    errorMessage.value = ''

    try {
        const formData = new FormData()
        formData.append('title', form.value.title)
        formData.append('content', form.value.content)
        formData.append('is_public', form.value.is_public ? '1' : '0')
        formData.append('priority', form.value.priority ? '1' : '0')

        if (form.value.tags.length > 0) {
            form.value.tags.forEach((tag, index) => {
                formData.append(`tags[${index}]`, tag)
            })
        }

        if (imageFile.value) {
            formData.append('image', imageFile.value)
        }

        if (removeExistingImage.value) {
            formData.append('remove_image', '1')
        }

        if (isEditing.value) {
            await axios.post(
                `/api/org/${props.organizationId}/announcements/${props.announcement.id}?_method=PATCH`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
        } else {
            await axios.post(
                `/api/org/${props.organizationId}/announcements`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
        }

        emit('saved')
    } catch (error) {
        console.error('Save failed:', error)
        errorMessage.value = error.response?.data?.message || 'Failed to save announcement'
    } finally {
        isSaving.value = false
    }
}
</script>