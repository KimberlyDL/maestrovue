// stores/notification.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/utils/api'

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref([])
    const unreadCount = ref(0)
    const unreadPerOrg = ref({})
    const loading = ref(false)
    const preferences = ref(null)

    // Computed
    const hasUnread = computed(() => unreadCount.value > 0)
    
    const unreadNotifications = computed(() => 
        notifications.value.filter(n => !n.is_read)
    )

    // Actions
    async function fetchNotifications(params = {}) {
        loading.value = true
        try {
            const { data } = await api.get('/api/notifications', { params })
            notifications.value = data.data || data
            return notifications.value
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    async function fetchUnreadCount() {
        try {
            const { data } = await api.get('/api/notifications/unread-count')
            unreadCount.value = data.total || 0
            unreadPerOrg.value = data.per_organization || {}
            return data
        } catch (error) {
            console.error('Failed to fetch unread count:', error)
        }
    }

    async function markAsRead(notificationId) {
        try {
            const { data } = await api.post(`/api/notifications/${notificationId}/mark-read`)
            
            // Update local state
            const index = notifications.value.findIndex(n => n.id === notificationId)
            if (index !== -1) {
                notifications.value[index] = data
            }
            
            // Decrement unread count
            if (unreadCount.value > 0) {
                unreadCount.value--
            }
            
            return data
        } catch (error) {
            console.error('Failed to mark as read:', error)
            throw error
        }
    }

    async function markAsUnread(notificationId) {
        try {
            const { data } = await api.post(`/api/notifications/${notificationId}/mark-unread`)
            
            // Update local state
            const index = notifications.value.findIndex(n => n.id === notificationId)
            if (index !== -1) {
                notifications.value[index] = data
            }
            
            // Increment unread count
            unreadCount.value++
            
            return data
        } catch (error) {
            console.error('Failed to mark as unread:', error)
            throw error
        }
    }

    async function markAllAsRead(organizationId = null) {
        try {
            const params = organizationId ? { organization_id: organizationId } : {}
            await api.post('/api/notifications/mark-all-read', params)
            
            // Update local state
            notifications.value.forEach(n => {
                if (!organizationId || n.organization_id === organizationId) {
                    n.is_read = true
                    n.read_at = new Date().toISOString()
                }
            })
            
            // Reset unread counts
            if (organizationId) {
                delete unreadPerOrg.value[organizationId]
                unreadCount.value = Object.values(unreadPerOrg.value).reduce((a, b) => a + b, 0)
            } else {
                unreadCount.value = 0
                unreadPerOrg.value = {}
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error)
            throw error
        }
    }

    async function deleteNotification(notificationId) {
        try {
            await api.delete(`/api/notifications/${notificationId}`)
            
            // Remove from local state
            const index = notifications.value.findIndex(n => n.id === notificationId)
            if (index !== -1) {
                const notification = notifications.value[index]
                if (!notification.is_read && unreadCount.value > 0) {
                    unreadCount.value--
                }
                notifications.value.splice(index, 1)
            }
        } catch (error) {
            console.error('Failed to delete notification:', error)
            throw error
        }
    }

    async function deleteAllRead() {
        try {
            await api.delete('/api/notifications/delete-all-read')
            
            // Remove read notifications from local state
            notifications.value = notifications.value.filter(n => !n.is_read)
        } catch (error) {
            console.error('Failed to delete all read:', error)
            throw error
        }
    }

    async function fetchPreferences() {
        try {
            const { data } = await api.get('/api/notifications/preferences')
            preferences.value = data
            return data
        } catch (error) {
            console.error('Failed to fetch preferences:', error)
            throw error
        }
    }

    async function updatePreferences(newPreferences) {
        try {
            const { data } = await api.put('/api/notifications/preferences', newPreferences)
            preferences.value = data.preferences
            return data
        } catch (error) {
            console.error('Failed to update preferences:', error)
            throw error
        }
    }

    function addNotification(notification) {
        notifications.value.unshift(notification)
        if (!notification.is_read) {
            unreadCount.value++
            if (notification.organization_id) {
                unreadPerOrg.value[notification.organization_id] = 
                    (unreadPerOrg.value[notification.organization_id] || 0) + 1
            }
        }
    }

    function clearAll() {
        notifications.value = []
        unreadCount.value = 0
        unreadPerOrg.value = {}
    }

    return {
        // State
        notifications,
        unreadCount,
        unreadPerOrg,
        loading,
        preferences,
        
        // Computed
        hasUnread,
        unreadNotifications,
        
        // Actions
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        deleteNotification,
        deleteAllRead,
        fetchPreferences,
        updatePreferences,
        addNotification,
        clearAll
    }
})