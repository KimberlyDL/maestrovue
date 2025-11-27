<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { Bell, Check, CheckCheck, Trash2, Filter, Settings, Clock, X } from 'lucide-vue-next'

const router = useRouter()
const notificationStore = useNotificationStore()

const filter = ref('all') // all, unread, duty, swap
const loading = ref(false)
const showSettings = ref(false)

const filteredNotifications = computed(() => {
    let notifications = notificationStore.notifications

    if (filter.value === 'unread') {
        notifications = notifications.filter(n => !n.is_read)
    } else if (filter.value === 'duty') {
        notifications = notifications.filter(n => 
            n.type.startsWith('duty.') && !n.type.includes('swap')
        )
    } else if (filter.value === 'swap') {
        notifications = notifications.filter(n => n.type.includes('swap'))
    }

    return notifications
})

onMounted(async () => {
    loading.value = true
    try {
        await notificationStore.fetchNotifications({ per_page: 50 })
        await notificationStore.fetchUnreadCount()
    } finally {
        loading.value = false
    }
})

async function handleNotificationClick(notification) {
    if (!notification.is_read) {
        await notificationStore.markAsRead(notification.id)
    }
    
    if (notification.action_url) {
        router.push(notification.action_url)
    }
}

async function markAsRead(notification, event) {
    event.stopPropagation()
    await notificationStore.markAsRead(notification.id)
}

async function deleteNotification(notification, event) {
    event.stopPropagation()
    if (confirm('Delete this notification?')) {
        await notificationStore.deleteNotification(notification.id)
    }
}

async function markAllAsRead() {
    if (confirm('Mark all notifications as read?')) {
        await notificationStore.markAllAsRead()
    }
}

async function deleteAllRead() {
    if (confirm('Delete all read notifications? This cannot be undone.')) {
        await notificationStore.deleteAllRead()
    }
}

function getNotificationIcon(type) {
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
        urgent: 'border-l-4 border-rose-500',
        high: 'border-l-4 border-amber-500',
        normal: 'border-l-2 border-gray-300 dark:border-abyss-700',
        low: 'border-l-2 border-gray-200 dark:border-abyss-800',
    }
    return classes[priority] || classes.normal
}
</script>

<template>
    <div class="h-full flex flex-col gap-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-800 dark:text-platinum-50 flex items-center gap-2">
                    <Bell class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                    Notifications
                </h1>
                <p class="text-sm text-gray-600 dark:text-platinum-400">
                    Stay updated with your duty assignments and organization activities
                </p>
            </div>
            <button 
                @click="showSettings = true"
                class="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-abyss-600 hover:bg-gray-100 dark:hover:bg-abyss-800 transition-colors"
            >
                <Settings class="w-4 h-4" />
                <span>Settings</span>
            </button>
        </div>

        <!-- Stats & Actions -->
        <div class="grid grid-cols-3 gap-4">
            <div class="p-4 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-md">
                <p class="text-sm text-gray-600 dark:text-platinum-400">Total</p>
                <p class="text-2xl font-bold text-gray-800 dark:text-platinum-100">
                    {{ notificationStore.notifications.length }}
                </p>
            </div>
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-300 dark:border-blue-700/50 shadow-md">
                <p class="text-sm text-blue-700 dark:text-blue-400">Unread</p>
                <p class="text-2xl font-bold text-blue-900 dark:text-blue-300">
                    {{ notificationStore.unreadCount }}
                </p>
            </div>
            <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-300 dark:border-emerald-700/50 shadow-md">
                <p class="text-sm text-emerald-700 dark:text-emerald-400">Read</p>
                <p class="text-2xl font-bold text-emerald-900 dark:text-emerald-300">
                    {{ notificationStore.notifications.length - notificationStore.unreadCount }}
                </p>
            </div>
        </div>

        <!-- Filters & Actions Bar -->
        <div class="flex items-center justify-between p-4 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 shadow-md">
            <div class="flex gap-2">
                <button 
                    v-for="filterOption in ['all', 'unread', 'duty', 'swap']"
                    :key="filterOption"
                    @click="filter = filterOption"
                    class="px-4 py-2 text-sm rounded-lg transition-colors capitalize"
                    :class="filter === filterOption 
                        ? 'bg-kaitoke-green-600 text-white' 
                        : 'bg-gray-100 dark:bg-abyss-700 text-gray-700 dark:text-platinum-300 hover:bg-gray-200 dark:hover:bg-abyss-600'"
                >
                    {{ filterOption }}
                </button>
            </div>

            <div class="flex gap-2">
                <button 
                    v-if="notificationStore.hasUnread"
                    @click="markAllAsRead"
                    class="flex items-center gap-2 px-4 py-2 text-sm text-kaitoke-green-600 dark:text-kaitoke-green-400 hover:bg-kaitoke-green-50 dark:hover:bg-kaitoke-green-900/20 rounded-lg transition-colors"
                >
                    <CheckCheck class="w-4 h-4" />
                    Mark all read
                </button>
                <button 
                    @click="deleteAllRead"
                    class="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <Trash2 class="w-4 h-4" />
                    Delete all read
                </button>
            </div>
        </div>

        <!-- Notifications List -->
        <div class="flex-1 overflow-y-auto">
            <div v-if="loading" class="text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-kaitoke-green-600 mx-auto mb-4"></div>
                <p class="text-sm text-gray-600 dark:text-platinum-400">Loading notifications...</p>
            </div>

            <div v-else-if="filteredNotifications.length === 0" class="text-center py-12 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700">
                <Bell class="h-16 w-16 mx-auto text-gray-400 dark:text-platinum-600 mb-4" />
                <p class="text-gray-600 dark:text-platinum-400 font-medium">No notifications found</p>
                <p class="text-sm text-gray-500 dark:text-platinum-500 mt-2">
                    {{ filter === 'unread' ? 'You\'re all caught up!' : 'Try adjusting your filters' }}
                </p>
            </div>

            <div v-else class="space-y-2">
                <div 
                    v-for="notification in filteredNotifications" 
                    :key="notification.id"
                    @click="handleNotificationClick(notification)"
                    class="p-5 bg-white dark:bg-abyss-800 rounded-xl border border-gray-200 dark:border-abyss-700 hover:border-kaitoke-green-500 cursor-pointer transition-all shadow-md hover:shadow-lg"
                    :class="[
                        !notification.is_read && 'bg-blue-50 dark:bg-blue-900/10',
                        getPriorityClass(notification.priority)
                    ]"
                >
                    <div class="flex items-start gap-4">
                        <!-- Icon -->
                        <div class="flex-shrink-0 text-3xl">
                            {{ getNotificationIcon(notification.type) }}
                        </div>

                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-3 mb-2">
                                <div class="flex-1">
                                    <h3 class="text-base font-semibold text-gray-900 dark:text-platinum-50 mb-1">
                                        {{ notification.title }}
                                    </h3>
                                    <p class="text-sm text-gray-700 dark:text-platinum-300">
                                        {{ notification.message }}
                                    </p>
                                </div>

                                <!-- Actions -->
                                <div class="flex gap-2 flex-shrink-0">
                                    <button 
                                        v-if="!notification.is_read"
                                        @click="markAsRead(notification, $event)"
                                        class="p-2 hover:bg-gray-200 dark:hover:bg-abyss-700 rounded-lg transition-colors"
                                        title="Mark as read"
                                    >
                                        <Check class="w-4 h-4 text-gray-600 dark:text-platinum-400" />
                                    </button>
                                    <button 
                                        @click="deleteNotification(notification, $event)"
                                        class="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 class="w-4 h-4 text-gray-600 dark:text-platinum-400 hover:text-red-600 dark:hover:text-red-400" />
                                    </button>
                                </div>
                            </div>

                            <!-- Metadata -->
                            <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-platinum-500">
                                <div class="flex items-center gap-1">
                                    <Clock class="w-3 h-3" />
                                    <span>{{ notification.time_ago }}</span>
                                </div>
                                <span v-if="notification.organization">
                                    • {{ notification.organization.name }}
                                </span>
                                <span v-if="notification.priority !== 'normal'" class="px-2 py-0.5 rounded-full text-xs font-medium"
                                    :class="{
                                        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300': notification.priority === 'urgent',
                                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300': notification.priority === 'high',
                                    }"
                                >
                                    {{ notification.priority }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Settings Modal -->
        <div v-if="showSettings" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div class="bg-white dark:bg-abyss-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-abyss-700">
                <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-abyss-700">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-platinum-50">
                        Notification Settings
                    </h3>
                    <button @click="showSettings = false" class="p-2 hover:bg-gray-100 dark:hover:bg-abyss-800 rounded-lg">
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <div class="p-6">
                    <p class="text-sm text-gray-600 dark:text-platinum-400 mb-4">
                        Notification preferences coming soon! You'll be able to customize which notifications you receive.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>