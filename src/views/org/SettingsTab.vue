<!-- src/views/admin/SettingsTab.vue - COMPLETE WITH ALL FEATURES -->
<template>
    <div class="space-y-8">
        <!-- Logo Upload Section (MOVED FROM OVERVIEW) -->
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

        <!-- General Settings (ORG DETAILS - MOVED FROM OVERVIEW) -->
        <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-8 shadow-xl">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-xl font-semibold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                        <Cog class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> General Settings
                    </h2>
                    <p class="text-gray-500 dark:text-platinum-500 text-sm mt-1">Manage organization details and
                        information</p>
                </div>
                <button v-if="!isEditingDetails" @click="startEditingDetails"
                    class="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-abyss-700 border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-600 transition-colors shadow-sm flex items-center gap-2">
                    <Pencil class="w-4 h-4" /> Edit
                </button>
                <div v-else class="flex gap-3">
                    <button @click="cancelEditingDetails"
                        class="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-abyss-700 border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-600 transition-colors shadow-sm flex items-center gap-2">
                        <X class="w-4 h-4" /> Cancel
                    </button>
                    <button @click="saveDetails" :disabled="isSavingDetails"
                        class="px-5 py-2.5 rounded-xl bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-white font-medium disabled:opacity-50 transition-colors shadow-md hover:shadow-lg flex items-center gap-2">
                        <Save class="w-4 h-4" /> {{ isSavingDetails ? 'Saving...' : 'Save Changes' }}
                    </button>
                </div>
            </div>

            <div class="space-y-6">
                <div class="border-b border-gray-100 dark:border-abyss-700 pb-4">
                    <label class="block text-sm text-gray-700 dark:text-platinum-400 mb-1 font-medium">Name *</label>
                    <input v-if="isEditingDetails" v-model="detailsForm.name" type="text"
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner" />
                    <p v-else class="text-lg text-gray-800 dark:text-platinum-50">{{ organization?.name }}</p>
                </div>

                <div class="border-b border-gray-100 dark:border-abyss-700 pb-4">
                    <label
                        class="block text-sm text-gray-700 dark:text-platinum-400 mb-1 font-medium">Description</label>
                    <textarea v-if="isEditingDetails" v-model="detailsForm.description" rows="3"
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner resize-none"></textarea>
                    <p v-else class="text-gray-800 dark:text-platinum-50 text-sm whitespace-pre-wrap">{{
                        organization?.description || 'No description' }}</p>
                </div>

                <div class="border-b border-gray-100 dark:border-abyss-700 pb-4">
                    <label class="block text-sm text-gray-700 dark:text-platinum-400 mb-1 font-medium">Mission</label>
                    <textarea v-if="isEditingDetails" v-model="detailsForm.mission" rows="3"
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner resize-none"></textarea>
                    <p v-else class="text-gray-800 dark:text-platinum-50 text-sm whitespace-pre-wrap">{{
                        organization?.mission || 'No mission statement' }}</p>
                </div>

                <div class="border-b border-gray-100 dark:border-abyss-700 pb-4">
                    <label class="block text-sm text-gray-700 dark:text-platinum-400 mb-1 font-medium">Vision</label>
                    <textarea v-if="isEditingDetails" v-model="detailsForm.vision" rows="3"
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner resize-none"></textarea>
                    <p v-else class="text-gray-800 dark:text-platinum-50 text-sm whitespace-pre-wrap">{{
                        organization?.vision || 'No vision statement' }}</p>
                </div>

                <div class="border-b border-gray-100 dark:border-abyss-700 pb-4">
                    <label class="block text-sm text-gray-700 dark:text-platinum-400 mb-1 font-medium">Website</label>
                    <input v-if="isEditingDetails" v-model="detailsForm.website" type="url"
                        placeholder="https://example.com"
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner" />
                    <a v-else-if="organization?.website" :href="organization.website" target="_blank"
                        class="text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:underline flex items-center gap-1 text-sm">
                        {{ organization.website }}
                        <ExternalLink class="w-4 h-4" />
                    </a>
                    <p v-else class="text-gray-500 dark:text-platinum-500 text-sm">No website</p>
                </div>

                <!-- Location with Map -->
                <div>
                    <label
                        class="block text-sm text-gray-700 dark:text-platinum-400 mb-2 font-medium flex items-center gap-2">
                        <MapPin class="w-4 h-4" /> Location
                    </label>

                    <!-- Edit Mode: Interactive Map -->
                    <div v-if="isEditingDetails">
                        <MapDisplay v-model:lat="detailsForm.location_lat" v-model:lng="detailsForm.location_lng"
                            v-model:address="detailsForm.location_address" :zoom="15" :editable="true"
                            :show-controls="true" height="400px" @location-changed="handleLocationChange" />
                    </div>

                    <!-- View Mode: Display Map -->
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

            <p v-if="detailsError"
                class="mt-4 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-1">
                <AlertTriangle class="w-4 h-4" /> {{ detailsError }}
            </p>
        </div>

        <!-- Access Control Settings (ORIGINAL) -->
        <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-8 shadow-xl">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-platinum-50 mb-6 flex items-center gap-2">
                <Zap class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Access Control
            </h2>

            <div class="space-y-4">
                <div class="flex items-start justify-between py-3 border-b border-gray-200 dark:border-abyss-700">
                    <div class="max-w-md">
                        <div class="text-gray-800 dark:text-platinum-50 font-medium">Auto-Accept Join Requests</div>
                        <div class="text-gray-500 dark:text-platinum-500 text-sm mt-1">Automatically accept users who
                            join with valid invite code</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input v-model="settings.auto_accept_invites" type="checkbox" class="sr-only peer"
                            @change="updateSetting('auto_accept_invites', settings.auto_accept_invites)">
                        <div
                            class="w-11 h-6 bg-gray-300 dark:bg-abyss-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kaitoke-green-600 shadow-inner">
                        </div>
                    </label>
                </div>

                <div class="flex items-start justify-between py-3 border-b border-gray-200 dark:border-abyss-700">
                    <div class="max-w-md">
                        <div class="text-gray-800 dark:text-platinum-50 font-medium">Public Profile</div>
                        <div class="text-gray-500 dark:text-platinum-500 text-sm mt-1">Allow non-members to view
                            organization details</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input v-model="settings.public_profile" type="checkbox" class="sr-only peer"
                            @change="updateSetting('public_profile', settings.public_profile)">
                        <div
                            class="w-11 h-6 bg-gray-300 dark:bg-abyss-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kaitoke-green-600 shadow-inner">
                        </div>
                    </label>
                </div>

                <div class="flex items-start justify-between py-3">
                    <div class="max-w-md">
                        <div class="text-gray-800 dark:text-platinum-50 font-medium">Members Can Invite</div>
                        <div class="text-gray-500 dark:text-platinum-500 text-sm mt-1">Let regular members generate
                            their own invite codes</div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input v-model="settings.member_can_invite" type="checkbox" class="sr-only peer"
                            @change="updateSetting('member_can_invite', settings.member_can_invite)">
                        <div
                            class="w-11 h-6 bg-gray-300 dark:bg-abyss-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kaitoke-green-600 shadow-inner">
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <!-- Data & Privacy (ORIGINAL) -->
        <div class="bg-white dark:bg-abyss-800 border border-gray-200 dark:border-abyss-700 rounded-xl p-8 shadow-xl">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-platinum-50 mb-6 flex items-center gap-2">
                <Shield class="w-5 h-5 text-kaitoke-green-600 dark:text-kaitoke-green-400" /> Data & Privacy
            </h2>

            <div class="space-y-6">
                <div class="pb-4 border-b border-gray-200 dark:border-abyss-700">
                    <button @click="exportData" :disabled="isExporting"
                        class="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-abyss-700 border border-gray-300 dark:border-platinum-700 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-600 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2 font-medium">
                        <Download class="w-4 h-4" /> {{ isExporting ? 'Exporting...' : 'Export Organization Data' }}
                    </button>
                    <p class="text-gray-500 dark:text-platinum-500 text-sm mt-2">Download all organization data (JSON
                        format)</p>
                </div>

                <div class="pt-2">
                    <div class="text-gray-800 dark:text-platinum-50 font-medium mb-2">Activity Log Retention</div>
                    <select v-model="settings.log_retention_days"
                        class="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-kaitoke-green-600 focus:ring-1 focus:ring-kaitoke-green-600 shadow-inner"
                        @change="updateSetting('log_retention_days', parseInt(settings.log_retention_days))">
                        <option :value="30">30 days</option>
                        <option :value="90">90 days</option>
                        <option :value="180">6 months</option>
                        <option :value="365">1 year</option>
                        <option :value="3650">Unlimited (10 years)</option>
                    </select>
                    <p class="text-gray-500 dark:text-platinum-500 text-sm mt-2">How long to keep activity logs before
                        deletion</p>
                </div>
            </div>
        </div>

        <!-- Danger Zone (ORIGINAL - ALL FEATURES) -->
        <div
            class="bg-rose-50 dark:bg-rose-900/10 border border-rose-400 dark:border-rose-700/50 rounded-xl p-8 shadow-2xl">
            <h2 class="text-xl font-semibold text-rose-700 dark:text-rose-400 mb-6 flex items-center gap-2">
                <AlertTriangle class="w-5 h-5" /> Danger Zone
            </h2>

            <div class="space-y-6">
                <div class="flex items-center justify-between pb-4 border-b border-rose-300 dark:border-rose-700/30">
                    <div>
                        <div class="text-gray-800 dark:text-platinum-50 font-medium">Transfer Ownership</div>
                        <div class="text-gray-500 dark:text-platinum-500 text-sm mt-1">Transfer organization admin
                            rights to another member</div>
                    </div>
                    <button @click="showTransferModal = true"
                        class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-md flex items-center gap-2">
                        <Users class="w-4 h-4" /> Transfer
                    </button>
                </div>

                <div class="flex items-center justify-between pb-4 border-b border-rose-300 dark:border-rose-700/30">
                    <div>
                        <div class="text-gray-800 dark:text-platinum-50 font-medium">Archive Organization</div>
                        <div class="text-gray-500 dark:text-platinum-500 text-sm mt-1">Hide organization from members
                            (can be restored)</div>
                    </div>
                    <button @click="archiveOrganization"
                        class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-md flex items-center gap-2">
                        <Archive class="w-4 h-4" /> Archive
                    </button>
                </div>

                <div class="flex items-center justify-between pt-2">
                    <div>
                        <div class="text-rose-700 dark:text-rose-400 font-bold">Permanently Delete Organization</div>
                        <div class="text-gray-500 dark:text-platinum-500 text-sm mt-1">This action is irreversible and
                            deletes all data</div>
                    </div>
                    <button @click="confirmDelete"
                        class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg flex items-center gap-2">
                        <Trash2 class="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>
        </div>

        <!-- Transfer Modal (ORIGINAL) -->
        <div v-if="showTransferModal" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/70" @click="showTransferModal = false"></div>
            <div
                class="relative w-full max-w-md rounded-xl border border-amber-400/50 bg-white dark:bg-abyss-900 p-6 shadow-2xl">
                <h3 class="text-xl font-semibold text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
                    <Users class="w-5 h-5" /> Transfer Ownership
                </h3>
                <p class="text-gray-700 dark:text-platinum-300 text-sm mb-5">
                    Select a member to transfer admin rights to. They must accept the transfer.
                </p>

                <div class="mb-4">
                    <label class="block text-sm text-gray-700 dark:text-platinum-400 mb-2 font-medium">Select
                        Member</label>
                    <select v-model="transferData.to_user_id"
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 shadow-inner">
                        <option value="">-- Select a member --</option>
                        <option v-for="member in eligibleMembers" :key="member.id" :value="member.id">
                            {{ member.name }} ({{ member.email }})
                        </option>
                    </select>
                </div>

                <div class="mb-6">
                    <label class="block text-sm text-gray-700 dark:text-platinum-400 mb-2 font-medium">Message
                        (Optional)</label>
                    <textarea v-model="transferData.message" rows="3" placeholder="Add a message for the new owner..."
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 shadow-inner resize-none"></textarea>
                </div>

                <div class="flex justify-end gap-3">
                    <button @click="showTransferModal = false"
                        class="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-abyss-800 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-700 font-medium transition-colors shadow-sm">
                        Cancel
                    </button>
                    <button @click="initiateTransfer" :disabled="!transferData.to_user_id || isTransferring"
                        class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-md flex items-center gap-2">
                        <Send class="w-4 h-4" /> {{ isTransferring ? 'Sending...' : 'Send Transfer Request' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Delete Modal (ORIGINAL) -->
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/70" @click="showDeleteModal = false"></div>
            <div
                class="relative w-full max-w-md rounded-xl border border-rose-400 dark:border-rose-700/50 bg-white dark:bg-abyss-900 p-6 shadow-2xl">
                <h3 class="text-xl font-semibold text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-2">
                    <AlertTriangle class="w-5 h-5" /> Delete Organization?
                </h3>
                <p class="text-gray-700 dark:text-platinum-300 text-sm mb-4">
                    This action <strong class="text-rose-700 dark:text-rose-400">cannot be undone</strong>. This will
                    permanently delete:
                </p>
                <ul
                    class="text-gray-700 dark:text-platinum-400 text-sm mb-4 space-y-1 list-disc list-inside bg-rose-50 dark:bg-abyss-800 p-4 rounded-lg border border-rose-300 dark:border-abyss-700">
                    <li>All members and their roles</li>
                    <li>All documents and versions</li>
                    <li>All announcements</li>
                    <li>All activity logs</li>
                </ul>
                <div class="mb-4">
                    <label class="block text-sm text-gray-700 dark:text-platinum-400 mb-2 font-medium">
                        Type <strong class="text-rose-700 dark:text-platinum-50">{{ organization?.name }}</strong> to
                        confirm:
                    </label>
                    <input v-model="deleteConfirmText" type="text"
                        class="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-abyss-900 border border-gray-300 dark:border-abyss-700 text-gray-800 dark:text-platinum-50 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 shadow-inner" />
                </div>
                <div class="flex justify-end gap-3">
                    <button @click="showDeleteModal = false"
                        class="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-abyss-800 text-gray-700 dark:text-platinum-200 hover:bg-gray-200 dark:hover:bg-abyss-700 font-medium transition-colors shadow-sm">
                        Cancel
                    </button>
                    <button @click="deleteOrganization" :disabled="deleteConfirmText !== organization?.name"
                        class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-md flex items-center gap-2">
                        <Trash2 class="w-4 h-4" /> Delete Permanently
                    </button>
                </div>
            </div>
        </div>

        <!-- Toast Notification -->
        <transition name="fade">
            <div v-if="toast"
                class="fixed bottom-6 right-6 px-5 py-3 bg-kaitoke-green-600 text-white font-medium rounded-xl shadow-2xl flex items-center gap-2 z-50">
                <CheckCircle class="w-5 h-5" /> {{ toast }}
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'
import {
    Camera, Image, Upload, Trash2, CheckCircle, AlertTriangle,
    Cog, Pencil, X, Save, ExternalLink, MapPin,
    Zap, Shield, Download, Users, Archive, Send
} from 'lucide-vue-next'
import MapDisplay from '@/components/ui/map.vue'

const props = defineProps({
    organization: { type: Object, required: true }
})

const emit = defineEmits(['updated', 'logo-updated'])
const router = useRouter()

const R2_WORKER_ENDPOINT = import.meta.env.VITE_R2_WORKER_ENDPOINT

// Logo upload state
const fileInput = ref(null)
const previewLogo = ref(null)
const currentLogo = ref(props.organization?.logo)
const isUploading = ref(false)
const isDeleting = ref(false)
const uploadProgress = ref(0)
const logoError = ref('')
const logoSuccess = ref('')

// Details form state
const isEditingDetails = ref(false)
const isSavingDetails = ref(false)
const detailsError = ref('')
const detailsForm = ref({
    name: '',
    description: '',
    mission: '',
    vision: '',
    website: '',
    location_address: '',
    location_lat: null,
    location_lng: null
})

// Settings state
const settings = ref({
    auto_accept_invites: false,
    public_profile: true,
    member_can_invite: false,
    log_retention_days: 365
})

// Other state
const isExporting = ref(false)
const showDeleteModal = ref(false)
const showTransferModal = ref(false)
const deleteConfirmText = ref('')
const isTransferring = ref(false)
const toast = ref('')
const eligibleMembers = ref([])

const transferData = ref({
    to_user_id: '',
    message: ''
})

// Watch for organization changes
watch(() => props.organization, (newOrg) => {
    if (newOrg) {
        currentLogo.value = newOrg.logo
        detailsForm.value = {
            name: newOrg.name || '',
            description: newOrg.description || '',
            mission: newOrg.mission || '',
            vision: newOrg.vision || '',
            website: newOrg.website || '',
            location_address: newOrg.location_address || newOrg.location?.address || '',
            location_lat: newOrg.location_lat || newOrg.location?.lat || null,
            location_lng: newOrg.location_lng || newOrg.location?.lng || null
        }
        settings.value = {
            auto_accept_invites: newOrg.auto_accept_invites || false,
            public_profile: newOrg.public_profile ?? true,
            member_can_invite: newOrg.member_can_invite || false,
            log_retention_days: newOrg.log_retention_days || 365
        }
    }
}, { immediate: true })

onMounted(async () => {
    await loadEligibleMembers()
})

const currentLogoUrl = computed(() => {
    if (previewLogo.value) return previewLogo.value
    if (props.organization?.logo_url) return props.organization.logo_url

    const path = currentLogo.value || props.organization?.logo
    if (!path) return ''
    if (path.startsWith('http')) return path

    if (R2_WORKER_ENDPOINT) {
        const cleanEndpoint = R2_WORKER_ENDPOINT.replace(/\/$/, '')
        const cleanPath = path.startsWith('/') ? path.substring(1) : path
        return `${cleanEndpoint}/${cleanPath}`
    }

    return path
})

async function loadEligibleMembers() {
    try {
        const { data } = await api.get(`/api/org/${props.organization.id}/members`)
        eligibleMembers.value = data.filter(m => m.id !== props.organization.current_user_id)
    } catch (error) {
        console.error('Failed to load members:', error)
    }
}

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
        const img = new window.Image()
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
        const { data } = await api.post(
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
        await api.delete(`/api/org/${props.organization.id}/logo`)
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

function startEditingDetails() {
    isEditingDetails.value = true
    detailsError.value = ''
}

function cancelEditingDetails() {
    isEditingDetails.value = false
    detailsForm.value = {
        name: props.organization.name || '',
        description: props.organization.description || '',
        mission: props.organization.mission || '',
        vision: props.organization.vision || '',
        website: props.organization.website || '',
        location_address: props.organization.location_address || props.organization.location?.address || '',
        location_lat: props.organization.location_lat || props.organization.location?.lat || null,
        location_lng: props.organization.location_lng || props.organization.location?.lng || null
    }
}

async function saveDetails() {
    isSavingDetails.value = true
    detailsError.value = ''

    try {
        await api.patch(`/api/org/${props.organization.id}/overview`, detailsForm.value)
        isEditingDetails.value = false
        emit('updated')
        showToast('Details saved successfully')
    } catch (error) {
        console.error('Failed to save details:', error)
        detailsError.value = error.response?.data?.message || 'Failed to save details'
    } finally {
        isSavingDetails.value = false
    }
}

function handleLocationChange(locationData) {
    console.log('Location changed:', locationData)
}

async function updateSetting(key, value) {
    try {
        await api.patch(`/api/org/${props.organization.id}/settings`, { [key]: value })
        showToast(`${key.replace(/_/g, ' ')} updated`)
        emit('updated')
    } catch (error) {
        console.error(`Failed to update ${key}:`, error)
        showToast(`Failed to update ${key.replace(/_/g, ' ')}`)
        settings.value[key] = !value
    }
}

async function exportData() {
    isExporting.value = true
    try {
        const { data } = await api.get(`/api/org/${props.organization.id}/export-data`)

        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${props.organization.slug}_export_${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)

        showToast('Data exported successfully')
    } catch (error) {
        console.error('Failed to export data:', error)
        showToast('Failed to export data')
    } finally {
        isExporting.value = false
    }
}

async function initiateTransfer() {
    isTransferring.value = true
    try {
        await api.post(`/api/org/${props.organization.id}/transfer-ownership`, transferData.value)
        showTransferModal.value = false
        transferData.value = { to_user_id: '', message: '' }
        showToast('Transfer request sent successfully')
    } catch (error) {
        console.error('Failed to initiate transfer:', error)
        showToast(error.response?.data?.message || 'Failed to send transfer request')
    } finally {
        isTransferring.value = false
    }
}

async function archiveOrganization() {
    if (!confirm('Archive this organization? Members will no longer be able to access it until restored.')) return

    try {
        await api.post(`/api/org/${props.organization.id}/archive`)
        showToast('Organization archived successfully')
        setTimeout(() => {
            router.push({ name: 'home' })
        }, 1500)
    } catch (error) {
        console.error('Failed to archive organization:', error)
        showToast('Failed to archive organization')
    }
}

function confirmDelete() {
    showDeleteModal.value = true
    deleteConfirmText.value = ''
}

async function deleteOrganization() {
    if (deleteConfirmText.value !== props.organization.name) return

    try {
        await api.delete(`/api/organizations/${props.organization.id}`)
        showToast('Organization deleted')
        setTimeout(() => {
            router.push({ name: 'home' })
        }, 1500)
    } catch (error) {
        console.error('Failed to delete organization:', error)
        showToast('Failed to delete organization')
    } finally {
        showDeleteModal.value = false
    }
}

function showToast(message) {
    toast.value = message
    setTimeout(() => {
        toast.value = ''
    }, 3000)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease-in-out;
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>