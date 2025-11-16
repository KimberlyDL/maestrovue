import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/utils/api'

export const useDutyStore = defineStore('duty', () => {
    const schedules = ref([])
    const assignments = ref([])
    const availability = ref([])
    const swapRequests = ref([])
    const templates = ref([])
    const statistics = ref(null)
    const loading = ref(false)

    // Fetch duty schedules
    async function fetchSchedules(organizationId, filters = {}) {
        loading.value = true
        try {
            const { data } = await axios.get(`/api/org/${organizationId}/duty-schedules`, { params: filters })
            schedules.value = Array.isArray(data) ? data : (data.data || [])
            return schedules.value
        } catch (error) {
            console.error('Failed to fetch schedules:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // Fetch MY assignments
    async function fetchMyAssignments(organizationId, filters = {}) {
        loading.value = true
        try {
            const { data } = await axios.get(`/api/org/${organizationId}/duty-assignments/me`, { params: filters })
            assignments.value = Array.isArray(data) ? data : (data.data || [])
            return assignments.value
        } catch (error) {
            console.error('Failed to fetch assignments:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

// Replace ONLY this function
// Replace ONLY this function in src/stores/duty.js
async function fetchCalendar(organizationId, startDate, endDate, axiosCfg = {}) {
  try {
    // 1) Primary endpoint (your current one) but send BOTH param styles
    const { data } = await axios.get(
      `/api/org/${organizationId}/duty-schedules/calendar`,
      {
        params: {
          start_date: startDate,
          end_date: endDate,
          start: startDate,   // add for backends expecting "start"
          end: endDate,       // add for backends expecting "end"
        },
        ...axiosCfg,
      }
    )

    let events = Array.isArray(data) ? data : (data?.data ?? [])
    if (events.length) return events

    // 2) Fallback to alternate route some backends use
    const { data: alt } = await axios.get(
      `/api/org/${organizationId}/duty/calendar`,
      {
        params: { start: startDate, end: endDate },
        ...axiosCfg,
      }
    )
    return Array.isArray(alt) ? alt : (alt?.data ?? [])
  } catch (error) {
    // ignore expected cancellations
    if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
      return []
    }
    console.error('Failed to fetch calendar:', error)
    throw error
  }
}


    // Create duty schedule
    async function createSchedule(organizationId, scheduleData) {
        try {
            const { data } = await axios.post(`/api/org/${organizationId}/duty-schedules`, scheduleData)
            schedules.value.unshift(data)
            return data
        } catch (error) {
            console.error('Failed to create schedule:', error)
            throw error
        }
    }

    // Update schedule
    async function updateSchedule(organizationId, scheduleId, updates) {
        try {
            const { data } = await axios.patch(`/api/org/${organizationId}/duty-schedules/${scheduleId}`, updates)
            const index = schedules.value.findIndex(s => s.id === scheduleId)
            if (index !== -1) schedules.value[index] = data
            return data
        } catch (error) {
            console.error('Failed to update schedule:', error)
            throw error
        }
    }

    // Delete schedule
    async function deleteSchedule(organizationId, scheduleId) {
        try {
            await axios.delete(`/api/org/${organizationId}/duty-schedules/${scheduleId}`)
            schedules.value = schedules.value.filter(s => s.id !== scheduleId)
        } catch (error) {
            console.error('Failed to delete schedule:', error)
            throw error
        }
    }

    // Assign officers
    async function assignOfficers(organizationId, scheduleId, officerIds, notes = null) {
        try {
            const { data } = await axios.post(
                `/api/org/${organizationId}/duty-schedules/${scheduleId}/assignments`,
                { officer_ids: officerIds, notes }
            )
            return data
        } catch (error) {
            console.error('Failed to assign officers:', error)
            throw error
        }
    }

    // Respond to assignment
    async function respondToAssignment(organizationId, scheduleId, assignmentId, response, notes = null) {
        try {
            const { data } = await axios.post(
                `/api/org/${organizationId}/duty-schedules/${scheduleId}/assignments/${assignmentId}/respond`,
                { response, notes }
            )
            return data
        } catch (error) {
            console.error('Failed to respond to assignment:', error)
            throw error
        }
    }

    // Check in
    async function checkIn(organizationId, scheduleId, assignmentId) {
        try {
            const { data } = await axios.post(
                `/api/org/${organizationId}/duty-schedules/${scheduleId}/assignments/${assignmentId}/check-in`
            )
            return data
        } catch (error) {
            console.error('Failed to check in:', error)
            throw error
        }
    }

    // Check out
    async function checkOut(organizationId, scheduleId, assignmentId) {
        try {
            const { data } = await axios.post(
                `/api/org/${organizationId}/duty-schedules/${scheduleId}/assignments/${assignmentId}/check-out`
            )
            return data
        } catch (error) {
            console.error('Failed to check out:', error)
            throw error
        }
    }

    // Set availability
    async function setAvailability(organizationId, availabilityData) {
        try {
            const { data } = await axios.post(`/api/org/${organizationId}/duty-availability`, availabilityData)
            availability.value.push(data)
            return data
        } catch (error) {
            console.error('Failed to set availability:', error)
            throw error
        }
    }

    // Request swap
    async function requestSwap(organizationId, assignmentId, toOfficerId, reason) {
        try {
            const { data } = await axios.post(
                `/api/org/${organizationId}/duty-assignments/${assignmentId}/swap`,
                { to_officer_id: toOfficerId, reason }
            )
            swapRequests.value.push(data)
            return data
        } catch (error) {
            console.error('Failed to request swap:', error)
            throw error
        }
    }

    // Fetch statistics
    async function fetchStatistics(organizationId, startDate, endDate) {
        try {
            const { data } = await axios.get(`/api/org/${organizationId}/duty-schedules/statistics`, {
                params: { start_date: startDate, end_date: endDate }
            })
            statistics.value = data
            return data
        } catch (error) {
            console.error('Failed to fetch statistics:', error)
            throw error
        }
    }

    return {
        schedules,
        assignments,
        availability,
        swapRequests,
        templates,
        statistics,
        loading,
        fetchSchedules,
        fetchMyAssignments,
        fetchCalendar,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        assignOfficers,
        respondToAssignment,
        checkIn,
        checkOut,
        setAvailability,
        requestSwap,
        fetchStatistics,
    }
})