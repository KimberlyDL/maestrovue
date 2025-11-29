<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@stores/auth'
import {
    User, Mail, Phone, MapPin, Save, Upload, X, Lock, Eye, EyeOff, Settings, Camera, Lightbulb
} from 'lucide-vue-next'
import { useToast } from '@/utils/useToast';

// --- Component: ToggleSwitch (Updated for Dark/Light Mode) ---
const ToggleSwitch = {
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
    template: `
        <div class="flex items-center justify-between py-2">
            <label v-if="label" class="text-abyss-900 dark:text-platinum-100 font-medium cursor-pointer text-sm">{{ label }}</label>
            <button @click="$emit('update:modelValue', !modelValue)"
                :class="modelValue ? 'bg-kaitoke-green-600' : 'bg-platinum-300 dark:bg-abyss-700'"
                class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-abyss-900 focus:ring-kaitoke-green-500">
                <span class="sr-only">Toggle switch</span>
                <span aria-hidden="true"
                    :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
                    class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform ring-0 transition ease-in-out duration-200">
                </span>
            </button>
        </div>
    `,
}

const auth = useAuthStore()
const toast = useToast()

const isSaving = ref(false)
const avatarFile = ref(null)

const form = reactive({
    name: '',
    email: '',          // immutable
    phone: '',
    address: '',
    city: '',
    country: '',
    bio: '',
    avatar_url: '',
})
const initialForm = ref({})

// --- State for Preferences ---
const preferences = reactive({
    emailNotifications: true,
    darkMode: true, // This state is now mostly illustrative, as the system controls the mode
    publicProfile: false,
})


onMounted(async () => {
    if (!auth.user) await auth.restoreSession()
    const u = auth.user || {}
    form.name = u.name || ''
    form.email = u.email || ''
    form.phone = u.phone || ''
    form.address = u.address || ''
    form.city = u.city || ''
    form.country = u.country || ''
    form.bio = u.bio || ''
    form.avatar_url = u.avatar_url || ''
    initialForm.value = JSON.parse(JSON.stringify(form))
})

const hasChanges = computed(() =>
    JSON.stringify(form) !== JSON.stringify(initialForm.value)
)

function handleAvatarInput(e) {
    const file = e.target.files?.[0]
    if (!file) return
    avatarFile.value = file
    form.avatar_url = URL.createObjectURL(file) // local preview
}

function removeAvatar() {
    avatarFile.value = null
    form.avatar_url = ''
}

async function onUploadAvatar() {
    if (!avatarFile.value) return
    isSaving.value = true
    try {
        await auth.uploadAvatar(avatarFile.value)
        toast.success('Profile picture updated!');
        initialForm.value.avatar_url = form.avatar_url
    } catch (e) {
        toast.error(e?.response?.data?.message || e?.message || 'Avatar upload failed.');
    } finally {
        isSaving.value = false
    }
}

async function onSaveProfile() {
    isSaving.value = true
    try {
        await auth.updateProfile({
            name: form.name,
            phone: form.phone,
            address: form.address,
            city: form.city,
            country: form.country,
            bio: form.bio,
        })
        initialForm.value = JSON.parse(JSON.stringify(form))
        toast.success('Profile updated successfully! 🚀');
    } catch (e) {
        toast.error(e?.response?.data?.message || e?.message || 'Update failed.');
    } finally {
        isSaving.value = false
    }
}

/* -------- Change Password ---------- */
const pwd = reactive({
    current_password: '',
    password: '',
    password_confirmation: ''
})
const pwdSaving = ref(false)
const show = reactive({ current: false, new: false, confirm: false })

const pwdHints = computed(() => ({
    min8: pwd.password.length >= 8,
    mixed: /[a-z]/.test(pwd.password) && /[A-Z]/.test(pwd.password),
    num: /\d/.test(pwd.password),
    match: !!pwd.password && pwd.password === pwd.password_confirmation,
}))

async function onChangePassword() {
    if (!pwdHints.value.min8 || !pwdHints.value.mixed || !pwdHints.value.num || !pwdHints.value.match) {
        toast.error('Please satisfy all password requirements.');
        return
    }
    pwdSaving.value = true
    try {
        await auth.changePassword({
            current_password: pwd.current_password,
            password: pwd.password,
            password_confirmation: pwd.password_confirmation,
        })
        toast.success('Password changed successfully. 🎉');
        pwd.current_password = ''
        pwd.password = ''
        pwd.password_confirmation = ''
    } catch (e) {
        toast.error(e?.response?.data?.message || e?.message || 'Password change failed.');
    } finally {
        pwdSaving.value = false
    }
}
</script>

<template>
    <div class="min-h-screen h-full bg-platinum-50 dark:bg-abyss-900">
        <!-- Sticky Header -->
        <div
            class="bg-white/90 dark:bg-abyss-800/90 border-b border-sun-200 dark:border-abyss-700 sticky top-0 z-10 backdrop-blur shadow-sm">
            <div class="max-w-6xl mx-auto px-6 py-6">
                <h1
                    class="text-3xl font-heading font-bold text-abyss-900 dark:text-platinum-50 flex items-center gap-3">
                    <Settings class="w-7 h-7 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Account Settings
                </h1>
                <p class="text-platinum-600 dark:text-platinum-400 mt-1">Manage your account information, preferences,
                    and security.</p>
            </div>
        </div>

        <div class="max-w-6xl mx-auto px-6 py-8 space-y-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <!-- Main Content Column -->
                <div class="lg:col-span-2 space-y-8">

                    <!-- Avatar Section -->
                    <section
                        class="bg-white dark:bg-abyss-800 rounded-2xl border border-sun-200 dark:border-abyss-700 p-8 shadow-sm">
                        <h2
                            class="text-xl font-bold font-heading text-abyss-900 dark:text-platinum-50 mb-6 flex items-center gap-2">
                            <Camera class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Profile
                            Picture
                        </h2>
                        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                            <div class="relative flex-shrink-0">
                                <img :src="form.avatar_url || '/placeholder.svg?height=128&width=128'"
                                    class="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-abyss-700 ring-2 ring-sun-200 dark:ring-abyss-600 shadow-md" />
                            </div>
                            <div class="flex-1 space-y-3 w-full">
                                <div @click="$refs.avatarInput?.click()"
                                    class="border-2 border-dashed border-platinum-300 dark:border-abyss-600 rounded-xl p-4 text-center cursor-pointer
                                    hover:border-kaitoke-green-500 hover:bg-kaitoke-green-50 dark:hover:bg-kaitoke-green-900/10 transition duration-300 ease-in-out group">
                                    <Upload
                                        class="w-6 h-6 text-platinum-400 group-hover:text-kaitoke-green-600 dark:text-platinum-500 dark:group-hover:text-kaitoke-green-400 mx-auto mb-1 transition-colors" />
                                    <p class="text-abyss-700 dark:text-platinum-200 text-sm font-medium">Click to upload
                                        <span class="text-kaitoke-green-600 dark:text-kaitoke-green-400">new
                                            photo</span></p>
                                </div>
                                <input ref="avatarInput" type="file" accept="image/*" class="hidden"
                                    @change="handleAvatarInput" />
                                <div class="flex flex-wrap gap-3 pt-1">
                                    <button class="px-4 py-2 rounded-lg bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white font-medium text-sm shadow-md
                                        disabled:opacity-60 disabled:cursor-not-allowed transition duration-200"
                                        :disabled="!avatarFile || isSaving" @click="onUploadAvatar">
                                        Upload Avatar
                                    </button>
                                    <button class="px-4 py-2 rounded-lg bg-white dark:bg-abyss-900 border border-platinum-300 dark:border-abyss-600 
                                        hover:bg-platinum-50 dark:hover:bg-abyss-700 text-abyss-700 dark:text-platinum-200 font-medium text-sm transition duration-200
                                        hover:text-red-600 dark:hover:text-red-400" @click="removeAvatar">
                                        <X class="w-3 h-3 inline-block mr-1" /> Remove
                                    </button>
                                </div>
                                <p class="text-platinum-500 dark:text-platinum-500 text-xs mt-2">PNG, JPG, GIF up to
                                    10MB. We recommend a square image.</p>
                            </div>
                        </div>
                    </section>

                    <!-- Personal Details Section -->
                    <section
                        class="bg-white dark:bg-abyss-800 rounded-2xl border border-sun-200 dark:border-abyss-700 p-8 shadow-sm">
                        <h2
                            class="text-xl font-bold font-heading text-abyss-900 dark:text-platinum-50 mb-6 flex items-center gap-2">
                            <User class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Personal Details
                        </h2>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label class="block text-sm font-medium text-abyss-700 dark:text-platinum-200 mb-2">Full
                                    Name *</label>
                                <div class="relative">
                                    <User
                                        class="absolute left-3 top-3 w-5 h-5 text-platinum-400 dark:text-platinum-500" />
                                    <input v-model="form.name" type="text" placeholder="Your name"
                                        class="w-full pl-10 pr-4 py-2.5 
                                    bg-platinum-50 dark:bg-abyss-900/50 border border-platinum-300 dark:border-abyss-600 rounded-xl
                                    text-abyss-900 dark:text-platinum-50 placeholder:text-platinum-400 dark:placeholder:platinum-600 focus:outline-none 
                                    focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500 transition duration-150" />
                                </div>
                            </div>

                            <div>
                                <label
                                    class="block text-sm font-medium text-abyss-700 dark:text-platinum-200 mb-2">Email
                                    Address *</label>
                                <div class="relative">
                                    <Mail
                                        class="absolute left-3 top-3 w-5 h-5 text-platinum-400 dark:text-platinum-500" />
                                    <input v-model="form.email" type="email" disabled class="w-full pl-10 pr-4 py-2.5 
                                    bg-platinum-100 dark:bg-abyss-900 border border-platinum-200 dark:border-abyss-700 rounded-xl
                                    text-platinum-500 dark:text-platinum-500 cursor-not-allowed" />
                                    <span
                                        class="absolute right-3 top-3 text-xs text-platinum-500 dark:text-platinum-600 font-medium bg-platinum-200 dark:bg-abyss-800 px-2 py-0.5 rounded">Immutable</span>
                                </div>
                            </div>

                            <div class="md:col-span-2">
                                <label
                                    class="block text-sm font-medium text-abyss-700 dark:text-platinum-200 mb-2">Phone
                                    Number</label>
                                <div class="relative">
                                    <Phone
                                        class="absolute left-3 top-3 w-5 h-5 text-platinum-400 dark:text-platinum-500" />
                                    <input v-model="form.phone" type="tel" placeholder="(555) 123-4567"
                                        class="w-full pl-10 pr-4 py-2.5 bg-platinum-50 dark:bg-abyss-900/50 border border-platinum-300 dark:border-abyss-600 rounded-xl
                                    text-abyss-900 dark:text-platinum-50 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500 transition duration-150" />
                                </div>
                            </div>
                        </div>

                        <div class="mb-6 border-t border-platinum-200 dark:border-abyss-700 pt-6">
                            <label class="block text-sm font-medium text-abyss-700 dark:text-platinum-200 mb-2">Bio /
                                About Me</label>
                            <textarea v-model="form.bio" rows="4"
                                placeholder="Tell us a little about yourself (optional)"
                                class="w-full px-4 py-2.5 bg-platinum-50 dark:bg-abyss-900/50 border border-platinum-300 dark:border-abyss-600 rounded-xl
                            text-abyss-900 dark:text-platinum-50 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500 transition duration-150 resize-none" />
                        </div>

                        <div class="border-t border-platinum-200 dark:border-abyss-700 pt-6">
                            <h3
                                class="text-lg font-semibold text-abyss-800 dark:text-platinum-100 mb-4 flex items-center gap-2">
                                <MapPin class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Address
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="md:col-span-2">
                                    <label
                                        class="block text-sm font-medium text-abyss-700 dark:text-platinum-200 mb-2">Street
                                        Address</label>
                                    <div class="relative">
                                        <MapPin
                                            class="absolute left-3 top-3 w-5 h-5 text-platinum-400 dark:text-platinum-500" />
                                        <input v-model="form.address" type="text" placeholder="123 Main St"
                                            class="w-full pl-10 pr-4 py-2.5 bg-platinum-50 dark:bg-abyss-900/50 border border-platinum-300 dark:border-abyss-600 rounded-xl
                                        text-abyss-900 dark:text-platinum-50 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500 transition duration-150" />
                                    </div>
                                </div>
                                <div>
                                    <label
                                        class="block text-sm font-medium text-abyss-700 dark:text-platinum-200 mb-2">City</label>
                                    <input v-model="form.city" type="text" placeholder="New York"
                                        class="w-full px-4 py-2.5 bg-platinum-50 dark:bg-abyss-900/50 border border-platinum-300 dark:border-abyss-600 rounded-xl
                                    text-abyss-900 dark:text-platinum-50 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500 transition duration-150" />
                                </div>
                                <div>
                                    <label
                                        class="block text-sm font-medium text-abyss-700 dark:text-platinum-200 mb-2">Country</label>
                                    <input v-model="form.country" type="text" placeholder="USA"
                                        class="w-full px-4 py-2.5 bg-platinum-50 dark:bg-abyss-900/50 border border-platinum-300 dark:border-abyss-600 rounded-xl
                                    text-abyss-900 dark:text-platinum-50 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500 transition duration-150" />
                                </div>
                            </div>
                        </div>

                        <div
                            class="flex gap-4 justify-end border-t border-platinum-200 dark:border-abyss-700 mt-8 pt-6">
                            <button @click="() => { Object.assign(form, initialForm.value) }"
                                :disabled="!hasChanges || isSaving" class="px-6 py-2.5 rounded-xl bg-white dark:bg-abyss-900 border border-platinum-300 dark:border-abyss-600 
                                hover:bg-platinum-50 dark:hover:bg-abyss-700 text-abyss-700 dark:text-platinum-200 font-medium
                                disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">
                                Cancel
                            </button>
                            <button @click="onSaveProfile" :disabled="!hasChanges || isSaving"
                                class="px-6 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white font-semibold
                            flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition duration-200">
                                <Save class="w-4 h-4" />
                                <span v-if="!isSaving">Save Changes</span>
                                <span v-else class="flex items-center gap-2">
                                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4" />
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Saving...
                                </span>
                            </button>
                        </div>
                    </section>
                </div>

                <!-- Sidebar Column -->
                <div class="lg:col-span-1 space-y-8">
                    <section
                        class="bg-white dark:bg-abyss-800 rounded-2xl border border-sun-200 dark:border-abyss-700 p-6 shadow-sm sticky lg:top-24">
                        <h2
                            class="text-xl font-bold font-heading text-abyss-900 dark:text-platinum-50 mb-4 flex items-center gap-2">
                            <Lightbulb class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Preferences
                        </h2>
                        <div class="space-y-4 pt-2">
                            <ToggleSwitch v-model="preferences.emailNotifications" label="Email Notifications" />
                            <ToggleSwitch v-model="preferences.darkMode" label="Enable Dark Mode" />
                            <ToggleSwitch v-model="preferences.publicProfile" label="Public Profile" />
                        </div>
                        <p
                            class="text-sm text-platinum-500 dark:text-platinum-400 border-t border-platinum-200 dark:border-abyss-700 pt-4 mt-4">
                            Adjust your email, interface, and visibility settings.
                        </p>
                    </section>

                    <section
                        class="bg-white dark:bg-abyss-800 rounded-2xl border border-sun-200 dark:border-abyss-700 p-6 shadow-sm">
                        <h2
                            class="text-xl font-bold font-heading text-abyss-900 dark:text-platinum-50 mb-6 flex items-center gap-2">
                            <Lock class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Change Password
                        </h2>

                        <div class="space-y-4 mb-4">
                            <div>
                                <label
                                    class="block text-sm font-medium text-abyss-700 dark:text-platinum-200 mb-2">Current
                                    Password *</label>
                                <div class="relative">
                                    <Lock
                                        class="absolute left-3 top-3 w-5 h-5 text-platinum-400 dark:text-platinum-500" />
                                    <input :type="show.current ? 'text' : 'password'" v-model="pwd.current_password"
                                        class="w-full pl-10 pr-10 py-2.5 bg-platinum-50 dark:bg-abyss-900/50 border border-platinum-300 dark:border-abyss-600 rounded-xl
                                    text-abyss-900 dark:text-platinum-50 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500 transition duration-150"
                                        placeholder="••••••••" />
                                    <button type="button"
                                        class="absolute right-2.5 top-2.5 p-1 text-platinum-400 dark:text-platinum-500 hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition duration-150"
                                        @click="show.current = !show.current">
                                        <Eye v-if="!show.current" class="w-5 h-5" />
                                        <EyeOff v-else class="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-abyss-700 dark:text-platinum-200 mb-2">New
                                    Password *</label>
                                <div class="relative">
                                    <Lock
                                        class="absolute left-3 top-3 w-5 h-5 text-platinum-400 dark:text-platinum-500" />
                                    <input :type="show.new ? 'text' : 'password'" v-model="pwd.password"
                                        class="w-full pl-10 pr-10 py-2.5 bg-platinum-50 dark:bg-abyss-900/50 border border-platinum-300 dark:border-abyss-600 rounded-xl
                                    text-abyss-900 dark:text-platinum-50 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500 transition duration-150"
                                        placeholder="At least 8 characters" />
                                    <button type="button"
                                        class="absolute right-2.5 top-2.5 p-1 text-platinum-400 dark:text-platinum-500 hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition duration-150"
                                        @click="show.new = !show.new">
                                        <Eye v-if="!show.new" class="w-5 h-5" />
                                        <EyeOff v-else class="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label
                                    class="block text-sm font-medium text-abyss-700 dark:text-platinum-200 mb-2">Confirm
                                    Password *</label>
                                <div class="relative">
                                    <Lock
                                        class="absolute left-3 top-3 w-5 h-5 text-platinum-400 dark:text-platinum-500" />
                                    <input :type="show.confirm ? 'text' : 'password'"
                                        v-model="pwd.password_confirmation"
                                        class="w-full pl-10 pr-10 py-2.5 bg-platinum-50 dark:bg-abyss-900/50 border border-platinum-300 dark:border-abyss-600 rounded-xl
                                    text-abyss-900 dark:text-platinum-50 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500/50 focus:border-kaitoke-green-500 transition duration-150"
                                        placeholder="Re-type new password" />
                                    <button type="button"
                                        class="absolute right-2.5 top-2.5 p-1 text-platinum-400 dark:text-platinum-500 hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition duration-150"
                                        @click="show.confirm = !show.confirm">
                                        <Eye v-if="!show.confirm" class="w-5 h-5" />
                                        <EyeOff v-else class="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <ul
                            class="mt-4 space-y-1 text-xs font-medium border-t border-platinum-200 dark:border-abyss-700 pt-4">
                            <li
                                :class="pwdHints.min8 ? 'text-kaitoke-green-600 dark:text-kaitoke-green-400' : 'text-platinum-400 dark:text-platinum-500'">
                                • At least 8 characters</li>
                            <li
                                :class="pwdHints.mixed ? 'text-kaitoke-green-600 dark:text-kaitoke-green-400' : 'text-platinum-400 dark:text-platinum-500'">
                                • Uppercase & lowercase letters</li>
                            <li
                                :class="pwdHints.num ? 'text-kaitoke-green-600 dark:text-kaitoke-green-400' : 'text-platinum-400 dark:text-platinum-500'">
                                • At least one number</li>
                            <li
                                :class="pwdHints.match ? 'text-kaitoke-green-600 dark:text-kaitoke-green-400' : 'text-platinum-400 dark:text-platinum-500'">
                                • Passwords match</li>
                        </ul>

                        <div class="mt-6 flex justify-end border-t border-platinum-200 dark:border-abyss-700 pt-6">
                            <button @click="onChangePassword" :disabled="pwdSaving"
                                class="px-6 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white font-semibold
                            disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition duration-200">
                                <span v-if="!pwdSaving">Update Password</span>
                                <span v-else class="flex items-center gap-2">
                                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4" />
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Saving...
                                </span>
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>