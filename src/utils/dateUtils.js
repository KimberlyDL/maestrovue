// src/utils/dateUtils.js

/**
 * Format date to "MMM dd" (e.g., Nov 25)
 * This replaces 'MMM dd' format from date-fns
 * @param {string|Date} date - Date string or Date object
 * @returns {string} - Formatted date
 */
export function formatMonthDay(date) {
    if (!date) return ''

    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
    }).format(d)
}

/**
 * Calculates the distance to a due date (e.g., 'Due in 3 days', 'Overdue by 5 days')
 * @param {string|Date} due_at - The due date
 * @param {string|Date} [now=new Date()] - The current date/time to compare against
 * @returns {{text: string, isOverdue: boolean}} - The distance text and status
 */
export function formatDueDistance(due_at, now = new Date()) {
    if (!due_at) {
        return { text: 'N/A', isOverdue: false }
    }

    const dueDate = new Date(due_at)

    // Calculate difference in milliseconds
    const diffMs = dueDate - now
    const diffDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24))

    if (diffMs > 0) {
        // Due in the future
        if (diffDays === 0) {
            // Check if due today
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
            if (diffHours < 1) return { text: 'Due soon', isOverdue: false }
            return { text: `Due today`, isOverdue: false }
        }
        if (diffDays === 1) {
            return { text: `Due tomorrow`, isOverdue: false }
        }
        if (diffDays < 7) {
            return { text: `Due in ${diffDays} days`, isOverdue: false }
        }
        // Fallback to absolute date for longer periods
        return { text: `Due: ${formatMonthDay(dueDate)}`, isOverdue: false }
    } else {
        // Overdue
        if (diffDays === 0) {
            return { text: 'Overdue today', isOverdue: true }
        }
        if (diffDays === 1) {
            return { text: 'Overdue by 1 day', isOverdue: true }
        }
        return { text: `Overdue by ${diffDays} days`, isOverdue: true }
    }
}

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