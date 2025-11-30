<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { Bell, X, Check, CheckCheck, Trash2, Settings, Clock } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const notificationStore = useNotificationStore()

const showDropdown = ref(false)
const filter = ref('all') // all, unread
const loading = ref(false)

const filteredNotifications = computed(() => {
    if (filter.value === 'unread') {
        return notificationStore.unreadNotifications
    }
    return notificationStore.notifications.slice(0, 20)
})

onMounted(async () => {
    await loadNotifications()
    await notificationStore.fetchUnreadCount()
    
    // Poll for new notifications every 30 seconds
    setInterval(() => {
        notificationStore.fetchUnreadCount()
    }, 30000)
})

async function loadNotifications() {
    loading.value = true
    try {
        await notificationStore.fetchNotifications({
            per_page: 20,
            unread_only: filter.value === 'unread'
        })
    } finally {
        loading.value = false
    }
}

watch(filter, loadNotifications)

async function handleNotificationClick(notification) {
    // Mark as read
    if (!notification.is_read) {
        await notificationStore.markAsRead(notification.id)
    }
    
    // Navigate to action URL
    if (notification.action_url) {
        showDropdown.value = false
        router.push(notification.action_url)
    }
}

async function markAsRead(notification, event) {
    event.stopPropagation()
    await notificationStore.markAsRead(notification.id)
}

async function deleteNotification(notification, event) {
    event.stopPropagation()
    await notificationStore.deleteNotification(notification.id)
}

async function markAllAsRead() {
    await notificationStore.markAllAsRead()
}

function getNotificationIcon(type) {
    // Return appropriate icon based on notification type
    const iconMap = {
        'duty.assigned': '📋',
        'duty.updated': '✏️',
        'duty.cancelled': '❌',
        'duty.reminder': '⏰',
        'duty.swap_requested': '🔄',
        'duty.swap_accepted': '✅',
        'duty.swap_declined': '❌',
        'duty.assignment_confirmed': '✅',
        'duty.assignment_declined': '❌',
    }
    return iconMap[type] || '📢'
}

function getPriorityClass(priority) {
    const classes = {
        urgent: 'border-l-4 border-rose-500 bg-rose-50 dark:bg-rose-900/20',
        high: 'border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20',
        normal: 'border-l-2 border-gray-300 dark:border-abyss-700',
        low: 'border-l-2 border-gray-200 dark:border-abyss-800',
    }
    return classes[priority] || classes.normal
}

function toggleDropdown() {
    showDropdown.value = !showDropdown.value
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
    const dropdown = document.getElementById('notification-dropdown')
    const button = document.getElementById('notification-button')
    
    if (dropdown && !dropdown.contains(event.target) && !button.contains(event.target)) {
        showDropdown.value = false
    }
}

function viewAllNotifications() {
    showDropdown.value = false
    // Navigate using the Named Route and pass the current Org ID
    router.push({ 
        name: 'org.notifications', 
        params: { id: route.params.id } 
    })
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})
</script>

<template>
    <div class="relative">
        <button 
            id="notification-button"
            @click="toggleDropdown"
            class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-abyss-800 transition-colors"
            :class="{ 'bg-gray-100 dark:bg-abyss-800': showDropdown }"
        >
            <Bell class="w-5 h-5 text-gray-700 dark:text-platinum-300" />
            
            <span 
                v-if="notificationStore.hasUnread"
                class="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full"
            >
                {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
            </span>
        </button>

        <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div 
                v-if="showDropdown"
                id="notification-dropdown"
                class="absolute right-0 mt-2 w-96 bg-white dark:bg-abyss-900 rounded-xl border border-gray-200 dark:border-abyss-700 z-50 max-h-[600px] flex flex-col"
            >
                <div class="p-4 border-b border-gray-200 dark:border-abyss-700">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-platinum-50">
                            Notifications
                        </h3>
                        <button 
                            @click="showDropdown = false"
                            class="p-1 hover:bg-gray-100 dark:hover:bg-abyss-800 rounded-lg transition-colors"
                        >
                            <X class="w-4 h-4" />
                        </button>
                    </div>

                    <div class="flex gap-2">
                        <button 
                            @click="filter = 'all'"
                            class="flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors"
                            :class="filter === 'all' 
                                ? 'bg-kaitoke-green-600 text-white' 
                                : 'bg-gray-100 dark:bg-abyss-800 text-gray-700 dark:text-platinum-300 hover:bg-gray-200 dark:hover:bg-abyss-700'"
                        >
                            All
                        </button>
                        <button 
                            @click="filter = 'unread'"
                            class="flex-1 px-3 py-1.5 text-sm rounded-lg transition-colors"
                            :class="filter === 'unread' 
                                ? 'bg-kaitoke-green-600 text-white' 
                                : 'bg-gray-100 dark:bg-abyss-800 text-gray-700 dark:text-platinum-300 hover:bg-gray-200 dark:hover:bg-abyss-700'"
                        >
                            Unread ({{ notificationStore.unreadCount }})
                        </button>
                    </div>
                </div>

                <div v-if="notificationStore.hasUnread" class="px-4 py-2 border-b border-gray-200 dark:border-abyss-700 flex justify-end gap-2">
                    <button 
                        @click="markAllAsRead"
                        class="flex items-center gap-2 px-3 py-1.5 text-sm text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:bg-kaitoke-green-50 dark:hover:bg-kaitoke-green-900/20 rounded-lg transition-colors"
                    >
                        <CheckCheck class="w-4 h-4" />
                        Mark all read
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto">
                    <div v-if="loading" class="p-8 text-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-kaitoke-green-600 mx-auto"></div>
                        <p class="mt-2 text-sm text-gray-600 dark:text-platinum-400">Loading notifications...</p>
                    </div>

                    <div v-else-if="filteredNotifications.length === 0" class="p-8 text-center">
                        <Bell class="w-12 h-12 mx-auto text-gray-400 dark:text-platinum-600 mb-2" />
                        <p class="text-sm text-gray-600 dark:text-platinum-400">No notifications</p>
                    </div>

                    <div v-else class="divide-y divide-gray-200 dark:divide-abyss-700">
                        <div 
                            v-for="notification in filteredNotifications" 
                            :key="notification.id"
                            @click="handleNotificationClick(notification)"
                            class="p-4 hover:bg-gray-50 dark:hover:bg-abyss-800 cursor-pointer transition-colors"
                            :class="[
                                !notification.is_read && 'bg-blue-50 dark:bg-blue-900/10',
                                getPriorityClass(notification.priority)
                            ]"
                        >
                            <div class="flex items-start gap-3">
                                <div class="flex-shrink-0 text-2xl">
                                    {{ getNotificationIcon(notification.type) }}
                                </div>

                                <div class="flex-1 min-w-0">
                                    <div class="flex items-start justify-between gap-2 mb-1">
                                        <p class="text-sm font-semibold text-gray-900 dark:text-platinum-50">
                                            {{ notification.title }}
                                        </p>
                                        <button 
                                            v-if="!notification.is_read"
                                            @click="markAsRead(notification, $event)"
                                            class="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-abyss-700 rounded transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check class="w-3 h-3 text-gray-600 dark:text-platinum-400" />
                                        </button>
                                    </div>

                                    <p class="text-sm text-gray-700 dark:text-platinum-300 mb-2">
                                        {{ notification.message }}
                                    </p>

                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-platinum-500">
                                            <Clock class="w-3 h-3" />
                                            <span>{{ notification.time_ago }}</span>
                                            <span v-if="notification.organization">
                                                • {{ notification.organization.name }}
                                            </span>
                                        </div>

                                        <button 
                                            @click="deleteNotification(notification, $event)"
                                            class="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 class="w-3 h-3 text-gray-500 dark:text-platinum-500 hover:text-red-600 dark:hover:text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-3 border-t border-gray-200 dark:border-abyss-700">
                    <button 
                        @click="viewAllNotifications"
                        class="w-full px-4 py-2 text-sm font-medium text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:bg-kaitoke-green-50 dark:hover:bg-kaitoke-green-900/20 rounded-lg transition-colors"
                    >
                        View all notifications
                    </button>
                </div>
            </div>
        </Transition>
    </div>
</template>