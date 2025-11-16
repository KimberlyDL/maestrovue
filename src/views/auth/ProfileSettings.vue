<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@stores/auth'
import {
    User, Mail, Phone, MapPin, Save, Upload, X, Lock, Eye, EyeOff, Settings, Camera, Lightbulb
} from 'lucide-vue-next'

// --- Component: ToggleSwitch (Updated for Dark/Light Mode) ---
const ToggleSwitch = {
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
    template: `
        <div class="flex items-center justify-between py-2">
            <label v-if="label" class="text-gray-800 dark:text-platinum-100 font-medium cursor-pointer">{{ label }}</label>
            <button @click="$emit('update:modelValue', !modelValue)"
                :class="modelValue ? 'bg-kaitoke-green-600' : 'bg-gray-400 dark:bg-abyss-700'"
                class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-abyss-900 focus:ring-kaitoke-green-500 shadow-inner">
                <span class="sr-only">Toggle switch</span>
                <span aria-hidden="true"
                    :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
                    class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200">
                </span>
            </button>
        </div>
    `,
}

const auth = useAuthStore()

const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
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
    errorMessage.value = ''
    successMessage.value = ''
    isSaving.value = true
    try {
        await auth.uploadAvatar(avatarFile.value)
        successMessage.value = 'Profile picture updated!'
        initialForm.value.avatar_url = form.avatar_url 
    } catch (e) {
        errorMessage.value = e?.response?.data?.message || e?.message || 'Avatar upload failed.'
    } finally {
        isSaving.value = false
        setTimeout(() => (successMessage.value = ''), 2200)
    }
}

async function onSaveProfile() {
    errorMessage.value = ''
    successMessage.value = ''
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
        successMessage.value = 'Profile updated successfully! 🚀'
    } catch (e) {
        errorMessage.value = e?.response?.data?.message || e?.message || 'Update failed.'
    } finally {
        isSaving.value = false
        setTimeout(() => (successMessage.value = ''), 2200)
    }
}

/* -------- Change Password ---------- */
const pwd = reactive({
    current_password: '',
    password: '',
    password_confirmation: ''
})
const pwdSaving = ref(false)
const pwdError = ref('')
const pwdSuccess = ref('')
const show = reactive({ current: false, new: false, confirm: false })

const pwdHints = computed(() => ({
    min8: pwd.password.length >= 8,
    mixed: /[a-z]/.test(pwd.password) && /[A-Z]/.test(pwd.password),
    num: /\d/.test(pwd.password),
    match: !!pwd.password && pwd.password === pwd.password_confirmation,
}))

async function onChangePassword() {
    pwdError.value = ''
    pwdSuccess.value = ''
    if (!pwdHints.value.min8 || !pwdHints.value.mixed || !pwdHints.value.num || !pwdHints.value.match) {
        pwdError.value = 'Please satisfy all password requirements.'
        return
    }
    pwdSaving.value = true
    try {
        await auth.changePassword({
            current_password: pwd.current_password,
            password: pwd.password,
            password_confirmation: pwd.password_confirmation,
        })
        pwdSuccess.value = 'Password changed successfully. 🎉'
        pwd.current_password = ''
        pwd.password = ''
        pwd.password_confirmation = ''
    } catch (e) {
        pwdError.value = e?.response?.data?.message || e?.message || 'Password change failed.'
    } finally {
        pwdSaving.value = false
        setTimeout(() => (pwdSuccess.value = ''), 2500)
    }
}
</script>

<template>
    <div class="min-h-screen h-full bg-gray-100 dark:bg-abyss-900">
        <div class="bg-white/80 dark:bg-abyss-900/80 border-b border-gray-300/60 dark:border-platinum-300/20 sticky top-0 z-10 backdrop-blur shadow-xl">
            <div class="max-w-6xl mx-auto px-6 py-6">
                <h1 class="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                    <Settings class="w-7 h-7 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Account Settings
                </h1>
                <p class="text-gray-500 dark:text-platinum-300 mt-1">Manage your account information, preferences, and security.</p>
            </div>
        </div>

        <div class="max-w-6xl mx-auto px-6 py-8 space-y-8">
            <div v-if="successMessage"
                class="p-4 bg-kaitoke-green-100/80 dark:bg-kaitoke-green-900/40 border border-kaitoke-green-400 dark:border-kaitoke-green-600/60 rounded-xl shadow-lg">
                <p class="text-kaitoke-green-700 dark:text-kaitoke-green-300 text-sm font-medium">{{ successMessage }}</p>
            </div>
            <div v-if="errorMessage" class="p-4 bg-red-100/80 dark:bg-red-900/40 border border-red-500 dark:border-red-700/70 rounded-xl shadow-lg">
                <p class="text-red-700 dark:text-red-300 text-sm font-medium">{{ errorMessage }}</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 space-y-8">
                    
                    <section class="bg-white dark:bg-abyss-900/60 rounded-2xl border border-gray-200 dark:border-platinum-300/20 p-8 shadow-2xl">
                        <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2"><Camera class="w-5 h-5" /> Profile Picture</h2>
                        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                            <div class="relative flex-shrink-0">
                                <img :src="form.avatar_url || '/placeholder.svg?height=128&width=128'"
                                    class="w-28 h-28 rounded-full object-cover border-4 border-gray-100 dark:border-abyss-800 ring-2 ring-kaitoke-green-600/50 dark:ring-kaitoke-green-400/30 shadow-xl" />
                            </div>
                            <div class="flex-1 space-y-3 w-full">
                                <div @click="$refs.avatarInput?.click()" class="border-2 border-dashed border-gray-300/80 dark:border-platinum-300/30 rounded-xl p-4 text-center cursor-pointer
                                    hover:border-kaitoke-green-500 hover:bg-kaitoke-green-500/10 transition duration-300 ease-in-out">
                                    <Upload class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400 mx-auto mb-1" />
                                    <p class="text-gray-800 dark:text-white text-sm font-medium">Click to upload <span class="text-kaitoke-green-600 dark:text-kaitoke-green-400">new photo</span></p>
                                </div>
                                <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="handleAvatarInput" />
                                <div class="flex flex-wrap gap-3 pt-1">
                                    <button class="px-4 py-2 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-medium text-sm shadow-lg
                                disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 hover:scale-[1.02] active:scale-[0.98]" :disabled="!avatarFile || isSaving"
                                        @click="onUploadAvatar">
                                        Upload Avatar
                                    </button>
                                    <button class="px-4 py-2 rounded-xl bg-gray-200 dark:bg-abyss-800 hover:bg-gray-300 dark:hover:bg-abyss-700 text-gray-700 dark:text-platinum-100 font-medium text-sm transition duration-200 shadow-md
                                    hover:text-red-600 dark:hover:text-red-400 hover:scale-[1.02] active:scale-[0.98]" @click="removeAvatar">
                                        <X class="w-3 h-3 inline-block mr-1" /> Remove
                                    </button>
                                </div>
                                <p class="text-gray-500 dark:text-platinum-400 text-xs mt-2">PNG, JPG, GIF up to 10MB. We recommend a square image.</p>
                            </div>
                        </div>
                    </section>

                    <section class="bg-white dark:bg-abyss-900/60 rounded-2xl border border-gray-200 dark:border-platinum-300/20 p-8 shadow-2xl">
                        <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2"><User class="w-5 h-5" /> Personal Details</h2>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-platinum-200 mb-2">Full Name *</label>
                                <div class="relative">
                                    <User class="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-platinum-400" />
                                    <input v-model="form.name" type="text" placeholder="Your name" class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-abyss-800/80 border border-gray-300 dark:border-platinum-300/20 rounded-xl
                                    text-gray-800 dark:text-platinum-50 placeholder:text-gray-400 dark:placeholder:platinum-300 focus:outline-none shadow-inner
                                    focus:ring-2 focus:ring-kaitoke-green-600 dark:focus:ring-kaitoke-green-400 focus:border-kaitoke-green-600/50 dark:focus:border-kaitoke-green-400/50 transition duration-150" />
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-platinum-200 mb-2">Email Address *</label>
                                <div class="relative">
                                    <Mail class="absolute left-3 top-3 w-5 h-5 text-gray-500 dark:text-platinum-500" />
                                    <input v-model="form.email" type="email" disabled class="w-full pl-10 pr-4 py-2.5 bg-gray-200 dark:bg-abyss-900/60 border border-gray-300 dark:border-platinum-300/20 rounded-xl
                                    text-gray-500 dark:text-platinum-400 cursor-not-allowed shadow-inner" />
                                    <span class="absolute right-3 top-3 text-xs text-gray-500 dark:text-platinum-500">Immutable</span>
                                </div>
                            </div>

                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 dark:text-platinum-200 mb-2">Phone Number</label>
                                <div class="relative">
                                    <Phone class="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-platinum-400" />
                                    <input v-model="form.phone" type="tel" placeholder="(555) 123-4567"
                                        class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-abyss-800/80 border border-gray-300 dark:border-platinum-300/20 rounded-xl
                                    text-gray-800 dark:text-platinum-50 focus:outline-none shadow-inner focus:ring-2 focus:ring-kaitoke-green-600 dark:focus:ring-kaitoke-green-400 focus:border-kaitoke-green-600/50 dark:focus:border-kaitoke-green-400/50 transition duration-150" />
                                </div>
                            </div>
                        </div>

                        <div class="mb-6 border-t border-gray-200 dark:border-platinum-300/20 pt-6">
                            <label class="block text-sm font-medium text-gray-700 dark:text-platinum-200 mb-2">Bio / About Me</label>
                            <textarea v-model="form.bio" rows="4" placeholder="Tell us a little about yourself (optional)"
                                class="w-full px-4 py-2.5 bg-gray-50 dark:bg-abyss-800/80 border border-gray-300 dark:border-platinum-300/20 rounded-xl
                            text-gray-800 dark:text-platinum-50 focus:outline-none shadow-inner focus:ring-2 focus:ring-kaitoke-green-600 dark:focus:ring-kaitoke-green-400 focus:border-kaitoke-green-600/50 dark:focus:border-kaitoke-green-400/50 transition duration-150 resize-none" />
                        </div>

                        <div class="border-t border-gray-200 dark:border-platinum-300/20 pt-6">
                             <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><MapPin class="w-5 h-5" /> Shipping/Billing Address</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-gray-700 dark:text-platinum-200 mb-2">Street Address</label>
                                    <div class="relative">
                                        <MapPin class="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-platinum-400" />
                                        <input v-model="form.address" type="text" placeholder="123 Main St"
                                            class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-abyss-800/80 border border-gray-300 dark:border-platinum-300/20 rounded-xl
                                        text-gray-800 dark:text-platinum-50 focus:outline-none shadow-inner focus:ring-2 focus:ring-kaitoke-green-600 dark:focus:ring-kaitoke-green-400 focus:border-kaitoke-green-600/50 dark:focus:border-kaitoke-green-400/50 transition duration-150" />
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-platinum-200 mb-2">City</label>
                                    <input v-model="form.city" type="text" placeholder="New York"
                                        class="w-full px-4 py-2.5 bg-gray-50 dark:bg-abyss-800/80 border border-gray-300 dark:border-platinum-300/20 rounded-xl
                                    text-gray-800 dark:text-platinum-50 focus:outline-none shadow-inner focus:ring-2 focus:ring-kaitoke-green-600 dark:focus:ring-kaitoke-green-400 focus:border-kaitoke-green-600/50 dark:focus:border-kaitoke-green-400/50 transition duration-150" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-platinum-200 mb-2">Country</label>
                                    <input v-model="form.country" type="text" placeholder="USA"
                                        class="w-full px-4 py-2.5 bg-gray-50 dark:bg-abyss-800/80 border border-gray-300 dark:border-platinum-300/20 rounded-xl
                                    text-gray-800 dark:text-platinum-50 focus:outline-none shadow-inner focus:ring-2 focus:ring-kaitoke-green-600 dark:focus:ring-kaitoke-green-400 focus:border-kaitoke-green-600/50 dark:focus:border-kaitoke-green-400/50 transition duration-150" />
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-4 justify-end border-t border-gray-200 dark:border-platinum-300/20 mt-8 pt-6">
                            <button @click="() => { Object.assign(form, initialForm.value) }"
                                :disabled="!hasChanges || isSaving" class="px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-abyss-800 hover:bg-gray-300 dark:hover:bg-abyss-700 text-gray-700 dark:text-platinum-50 font-medium
                            disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 hover:scale-[1.02] active:scale-[0.98]">
                                Cancel
                            </button>
                            <button @click="onSaveProfile" :disabled="!hasChanges || isSaving" class="px-6 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-semibold
                            flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition duration-200 hover:scale-[1.02] active:scale-[0.98]">
                                <Save class="w-4 h-4" />
                                <span v-if="!isSaving">Save Changes</span>
                                <span v-else class="flex items-center gap-2">
                                    <span
                                        class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Saving...
                                </span>
                            </button>
                        </div>
                    </section>
                </div>

                <div class="lg:col-span-1 space-y-8">
                    <section class="bg-white dark:bg-abyss-900/60 rounded-2xl border border-gray-200 dark:border-platinum-300/20 p-6 shadow-2xl sticky lg:top-24">
                        <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><Lightbulb class="w-5 h-5" /> Preferences</h2>
                        <div class="space-y-4 pt-2">
                            <ToggleSwitch v-model="preferences.emailNotifications" label="Email Notifications" />
                            <ToggleSwitch v-model="preferences.darkMode" label="Enable Dark Mode" />
                            <ToggleSwitch v-model="preferences.publicProfile" label="Public Profile" />
                        </div>
                        <p class="text-sm text-gray-500 dark:text-platinum-400 border-t border-gray-200 dark:border-platinum-300/20 pt-4 mt-4">Adjust your email, interface, and visibility settings.</p>
                    </section>
                    
                    <section class="bg-white dark:bg-abyss-900/60 rounded-2xl border border-gray-200 dark:border-platinum-300/20 p-6 shadow-2xl">
                        <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2"><Lock class="w-5 h-5" /> Change Password</h2>

                        <div v-if="pwdSuccess"
                            class="mb-4 p-3 rounded-xl border border-kaitoke-green-400 dark:border-kaitoke-green-600/60 bg-kaitoke-green-100 dark:bg-kaitoke-green-900/40 text-kaitoke-green-700 dark:text-kaitoke-green-300 text-sm font-medium shadow-md">
                            {{ pwdSuccess }}
                        </div>
                        <div v-if="pwdError"
                            class="mb-4 p-3 rounded-xl border border-red-500 dark:border-red-700/70 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-sm font-medium shadow-md">
                            {{ pwdError }}
                        </div>

                        <div class="space-y-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-platinum-200 mb-2">Current Password *</label>
                                <div class="relative">
                                    <Lock class="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-platinum-400" />
                                    <input :type="show.current ? 'text' : 'password'" v-model="pwd.current_password"
                                        class="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-abyss-800/80 border border-gray-300 dark:border-platinum-300/20 rounded-xl
                                    text-gray-800 dark:text-platinum-50 focus:outline-none shadow-inner focus:ring-2 focus:ring-kaitoke-green-600 dark:focus:ring-kaitoke-green-400 focus:border-kaitoke-green-600/50 dark:focus:border-kaitoke-green-400/50 transition duration-150" placeholder="••••••••" />
                                    <button type="button"
                                        class="absolute right-2.5 top-2.5 p-1 text-gray-500 dark:text-platinum-300 hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition duration-150"
                                        @click="show.current = !show.current">
                                        <Eye v-if="!show.current" class="w-5 h-5" />
                                        <EyeOff v-else class="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-platinum-200 mb-2">New Password *</label>
                                <div class="relative">
                                    <Lock class="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-platinum-400" />
                                    <input :type="show.new ? 'text' : 'password'" v-model="pwd.password"
                                        class="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-abyss-800/80 border border-gray-300 dark:border-platinum-300/20 rounded-xl
                                    text-gray-800 dark:text-platinum-50 focus:outline-none shadow-inner focus:ring-2 focus:ring-kaitoke-green-600 dark:focus:ring-kaitoke-green-400 focus:border-kaitoke-green-600/50 dark:focus:border-kaitoke-green-400/50 transition duration-150" placeholder="At least 8 characters" />
                                    <button type="button"
                                        class="absolute right-2.5 top-2.5 p-1 text-gray-500 dark:text-platinum-300 hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition duration-150"
                                        @click="show.new = !show.new">
                                        <Eye v-if="!show.new" class="w-5 h-5" />
                                        <EyeOff v-else class="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-platinum-200 mb-2">Confirm Password *</label>
                                <div class="relative">
                                    <Lock class="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-platinum-400" />
                                    <input :type="show.confirm ? 'text' : 'password'" v-model="pwd.password_confirmation"
                                        class="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-abyss-800/80 border border-gray-300 dark:border-platinum-300/20 rounded-xl
                                    text-gray-800 dark:text-platinum-50 focus:outline-none shadow-inner focus:ring-2 focus:ring-kaitoke-green-600 dark:focus:ring-kaitoke-green-400 focus:border-kaitoke-green-600/50 dark:focus:border-kaitoke-green-400/50 transition duration-150" placeholder="Re-type new password" />
                                    <button type="button"
                                        class="absolute right-2.5 top-2.5 p-1 text-gray-500 dark:text-platinum-300 hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition duration-150"
                                        @click="show.confirm = !show.confirm">
                                        <Eye v-if="!show.confirm" class="w-5 h-5" />
                                        <EyeOff v-else class="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <ul class="mt-4 space-y-1 text-xs font-medium">
                            <li :class="pwdHints.min8 ? 'text-kaitoke-green-600 dark:text-kaitoke-green-400' : 'text-gray-500 dark:text-platinum-400'">• At least 8 characters</li>
                            <li :class="pwdHints.mixed ? 'text-kaitoke-green-600 dark:text-kaitoke-green-400' : 'text-gray-500 dark:text-platinum-400'">• Uppercase & lowercase letters</li>
                            <li :class="pwdHints.num ? 'text-kaitoke-green-600 dark:text-kaitoke-green-400' : 'text-gray-500 dark:text-platinum-400'">• At least one number</li>
                            <li :class="pwdHints.match ? 'text-kaitoke-green-600 dark:text-kaitoke-green-400' : 'text-gray-500 dark:text-platinum-400'">• Passwords match</li>
                        </ul>

                        <div class="mt-6 flex justify-end border-t border-gray-200 dark:border-platinum-300/20 pt-6">
                            <button @click="onChangePassword" :disabled="pwdSaving" class="px-6 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-semibold
                            disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition duration-200 hover:scale-[1.02] active:scale-[0.98]">
                                <span v-if="!pwdSaving">Update Password</span>
                                <span v-else class="flex items-center gap-2">
                                    <span
                                        class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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