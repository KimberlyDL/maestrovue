import { defineStore } from "pinia"
import { ref } from "vue"

export const useEventsStore = defineStore("events", () => {
    // Mock data
    const events = ref([
        {
            id: 1,
            title: "Community Cleanup Drive",
            description: "Help us clean up the local park and surrounding areas",
            date: "2025-11-15",
            startTime: "09:00",
            endTime: "12:00",
            location: "Central Park",
            volunteersNeeded: 20,
            status: "upcoming",
            volunteers: [
                {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    phone: "+1 (555) 123-4567",
                    role: "lead",
                    attended: true,
                },
                {
                    id: 2,
                    name: "Jane Smith",
                    email: "jane@example.com",
                    phone: "+1 (555) 234-5678",
                    role: "volunteer",
                    attended: true,
                },
                {
                    id: 3,
                    name: "Bob Johnson",
                    email: "bob@example.com",
                    phone: "+1 (555) 345-6789",
                    role: "volunteer",
                    attended: false,
                },
                {
                    id: 4,
                    name: "Alice Brown",
                    email: "alice@example.com",
                    phone: "+1 (555) 456-7890",
                    role: "volunteer",
                    attended: true,
                },
            ],
        },
        {
            id: 2,
            title: "Food Bank Distribution",
            description: "Distribute food packages to families in need",
            date: "2025-11-22",
            startTime: "10:00",
            endTime: "14:00",
            location: "Downtown Community Center",
            volunteersNeeded: 15,
            status: "upcoming",
            volunteers: [
                {
                    id: 5,
                    name: "Charlie Wilson",
                    email: "charlie@example.com",
                    phone: "+1 (555) 567-8901",
                    role: "lead",
                    attended: false,
                },
                {
                    id: 6,
                    name: "Diana Martinez",
                    email: "diana@example.com",
                    phone: "+1 (555) 678-9012",
                    role: "volunteer",
                    attended: true,
                },
            ],
        },
        {
            id: 3,
            title: "Youth Mentoring Program",
            description: "Mentor young students in academic and life skills",
            date: "2025-11-08",
            startTime: "14:00",
            endTime: "17:00",
            location: "Local High School",
            volunteersNeeded: 10,
            status: "completed",
            volunteers: [
                {
                    id: 7,
                    name: "Eve Taylor",
                    email: "eve@example.com",
                    phone: "+1 (555) 789-0123",
                    role: "volunteer",
                    attended: true,
                },
                {
                    id: 8,
                    name: "Frank Anderson",
                    email: "frank@example.com",
                    phone: "+1 (555) 890-1234",
                    role: "volunteer",
                    attended: true,
                },
            ],
        },
    ])

    let nextEventId = 4
    let nextVolunteerId = 9

    // Event CRUD
    function addEvent(eventData) {
        events.value.unshift({
            id: nextEventId++,
            ...eventData,
            volunteers: [],
        })
    }

    function updateEvent(eventId, eventData) {
        const event = events.value.find((e) => e.id === eventId)
        if (event) {
            Object.assign(event, eventData)
        }
    }

    function deleteEvent(eventId) {
        const idx = events.value.findIndex((e) => e.id === eventId)
        if (idx !== -1) {
            events.value.splice(idx, 1)
        }
    }

    // Volunteer CRUD
    function addVolunteer(eventId, volunteerData) {
        const event = events.value.find((e) => e.id === eventId)
        if (event) {
            event.volunteers.push({
                id: nextVolunteerId++,
                ...volunteerData,
            })
        }
    }

    function updateVolunteer(eventId, volunteerId, volunteerData) {
        const event = events.value.find((e) => e.id === eventId)
        if (event) {
            const volunteer = event.volunteers.find((v) => v.id === volunteerId)
            if (volunteer) {
                Object.assign(volunteer, volunteerData)
            }
        }
    }

    function removeVolunteer(eventId, volunteerId) {
        const event = events.value.find((e) => e.id === eventId)
        if (event) {
            const idx = event.volunteers.findIndex((v) => v.id === volunteerId)
            if (idx !== -1) {
                event.volunteers.splice(idx, 1)
            }
        }
    }

    function toggleVolunteerAttendance(eventId, volunteerId) {
        const event = events.value.find((e) => e.id === eventId)
        if (event) {
            const volunteer = event.volunteers.find((v) => v.id === volunteerId)
            if (volunteer) {
                volunteer.attended = !volunteer.attended
            }
        }
    }

    const excuses = ref([
        {
            id: 1,
            eventId: 1,
            volunteerId: 3,
            volunteerName: "Bob Johnson",
            reason: "Personal emergency",
            description: "Had to attend to a family matter",
            submittedAt: "2025-11-14",
            status: "pending",
        },
        {
            id: 2,
            eventId: 2,
            volunteerId: 5,
            volunteerName: "Charlie Wilson",
            reason: "Illness",
            description: "Came down with flu",
            submittedAt: "2025-11-21",
            status: "approved",
        },
    ])

    const shifts = ref([
        {
            id: 1,
            eventId: 1,
            title: "Morning Shift",
            startTime: "09:00",
            endTime: "12:00",
            capacity: 10,
            volunteers: [1, 2, 4],
        },
        {
            id: 2,
            eventId: 1,
            title: "Afternoon Shift",
            startTime: "12:00",
            endTime: "15:00",
            capacity: 10,
            volunteers: [3],
        },
        {
            id: 3,
            eventId: 2,
            title: "Full Day",
            startTime: "10:00",
            endTime: "14:00",
            capacity: 15,
            volunteers: [5, 6],
        },
    ])

    const reports = ref([
        {
            id: 1,
            eventId: 1,
            eventTitle: "Community Cleanup Drive",
            eventDate: "2025-11-15",
            totalVolunteers: 4,
            attendedVolunteers: 3,
            excusesSubmitted: 1,
            hoursContributed: 9,
            generatedAt: "2025-11-15",
            status: "completed",
        },
        {
            id: 2,
            eventId: 3,
            eventTitle: "Youth Mentoring Program",
            eventDate: "2025-11-08",
            totalVolunteers: 2,
            attendedVolunteers: 2,
            excusesSubmitted: 0,
            hoursContributed: 6,
            generatedAt: "2025-11-08",
            status: "completed",
        },
    ])

    let nextExcuseId = 3
    let nextShiftId = 4
    let nextReportId = 3

    // Excuses CRUD
    function addExcuse(excuseData) {
        excuses.value.unshift({
            id: nextExcuseId++,
            submittedAt: new Date().toISOString().split("T")[0],
            status: "pending",
            ...excuseData,
        })
    }

    function updateExcuse(excuseId, excuseData) {
        const excuse = excuses.value.find((e) => e.id === excuseId)
        if (excuse) {
            Object.assign(excuse, excuseData)
        }
    }

    function deleteExcuse(excuseId) {
        const idx = excuses.value.findIndex((e) => e.id === excuseId)
        if (idx !== -1) {
            excuses.value.splice(idx, 1)
        }
    }

    function approveExcuse(excuseId) {
        const excuse = excuses.value.find((e) => e.id === excuseId)
        if (excuse) {
            excuse.status = "approved"
        }
    }

    function rejectExcuse(excuseId) {
        const excuse = excuses.value.find((e) => e.id === excuseId)
        if (excuse) {
            excuse.status = "rejected"
        }
    }

    // Shifts CRUD
    function addShift(eventId, shiftData) {
        shifts.value.push({
            id: nextShiftId++,
            eventId,
            volunteers: [],
            ...shiftData,
        })
    }

    function updateShift(shiftId, shiftData) {
        const shift = shifts.value.find((s) => s.id === shiftId)
        if (shift) {
            Object.assign(shift, shiftData)
        }
    }

    function deleteShift(shiftId) {
        const idx = shifts.value.findIndex((s) => s.id === shiftId)
        if (idx !== -1) {
            shifts.value.splice(idx, 1)
        }
    }

    function addVolunteerToShift(shiftId, volunteerId) {
        const shift = shifts.value.find((s) => s.id === shiftId)
        if (shift && !shift.volunteers.includes(volunteerId)) {
            shift.volunteers.push(volunteerId)
        }
    }

    function removeVolunteerFromShift(shiftId, volunteerId) {
        const shift = shifts.value.find((s) => s.id === shiftId)
        if (shift) {
            const idx = shift.volunteers.indexOf(volunteerId)
            if (idx !== -1) {
                shift.volunteers.splice(idx, 1)
            }
        }
    }

    // Reports CRUD
    function addReport(reportData) {
        reports.value.unshift({
            id: nextReportId++,
            generatedAt: new Date().toISOString().split("T")[0],
            status: "completed",
            ...reportData,
        })
    }

    function deleteReport(reportId) {
        const idx = reports.value.findIndex((r) => r.id === reportId)
        if (idx !== -1) {
            reports.value.splice(idx, 1)
        }
    }

    function getEventReport(eventId) {
        return reports.value.find((r) => r.eventId === eventId)
    }

    return {
        events,
        excuses,
        shifts,
        reports,
        addEvent,
        updateEvent,
        deleteEvent,
        addVolunteer,
        updateVolunteer,
        removeVolunteer,
        toggleVolunteerAttendance,
        addExcuse,
        updateExcuse,
        deleteExcuse,
        approveExcuse,
        rejectExcuse,
        addShift,
        updateShift,
        deleteShift,
        addVolunteerToShift,
        removeVolunteerFromShift,
        addReport,
        deleteReport,
        getEventReport,
    }
})
