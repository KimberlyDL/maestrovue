// src/utils/dateUtils.js

/**
 * Format a date to "X time ago" format
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted string like "2 hours ago"
 */
export function formatDistanceToNow(date) {
    if (!date) return ''
    
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInSeconds = Math.floor((now - d) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    }
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) {
        return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
    }
    
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
    }
    
    const diffInYears = Math.floor(diffInDays / 365)
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
    if (!date) return ''
    
    const d = typeof date === 'string' ? new Date(date) : date
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    }
    
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(d)
}

/**
 * Format date to short format
 * @param {string|Date} date - Date to format
 * @returns {string} - Short formatted date like "Jan 15, 2025"
 */
export function formatDateShort(date) {
    if (!date) return ''
    
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(d)
}

/**
 * Format date and time
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date and time
 */
export function formatDateTime(date) {
    if (!date) return ''
    
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(d)
}

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean}
 */
export function isToday(date) {
    if (!date) return false
    
    const d = typeof date === 'string' ? new Date(date) : date
    const today = new Date()
    
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear()
}

/**
 * Check if date is within the last N days
 * @param {string|Date} date - Date to check
 * @param {number} days - Number of days
 * @returns {boolean}
 */
export function isWithinDays(date, days) {
    if (!date) return false
    
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInMs = now - d
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24)
    
    return diffInDays <= days
}