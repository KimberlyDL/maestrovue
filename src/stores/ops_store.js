import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useOpsStore = defineStore("ops", () => {
    const scheduleTemplates = ref([
        {
            id: 1,
            title: "Officer 1 - Friday Duty",
            description: "Officer 1 takes duty every Friday",
            staffId: 1,
            staffName: "Officer 1",
            role: "Duty Officer",
            recurrence: "weekly",
            recurrencePattern: {
                frequency: "weekly",
                daysOfWeek: [5], // Friday (0=Sunday, 5=Friday)
                interval: 1,
            },
            startTime: "08:00",
            endTime: "17:00",
            location: "Main Office",
            startDate: "2025-10-01",
            endDate: null, // null = ongoing
            status: "active",
            createdAt: "2025-10-01",
        },
        {
            id: 2,
            title: "Officer 2 - Tuesday Duty",
            description: "Officer 2 takes duty every Tuesday",
            staffId: 2,
            staffName: "Officer 2",
            role: "Duty Officer",
            recurrence: "weekly",
            recurrencePattern: {
                frequency: "weekly",
                daysOfWeek: [2], // Tuesday
                interval: 1,
            },
            startTime: "08:00",
            endTime: "17:00",
            location: "Main Office",
            startDate: "2025-10-01",
            endDate: null,
            status: "active",
            createdAt: "2025-10-01",
        },
        {
            id: 3,
            title: "Cleaning Duty - Every 3rd Week",
            description: "Officers 1-3 handle cleaning duty every 3rd week",
            staffIds: [1, 2, 3],
            staffNames: ["Officer 1", "Officer 2", "Officer 3"],
            role: "Cleaning Team",
            recurrence: "weekly",
            recurrencePattern: {
                frequency: "weekly",
                daysOfWeek: [1], // Monday
                interval: 3, // Every 3 weeks
                startWeek: 1, // Start from week 1
            },
            startTime: "09:00",
            endTime: "16:00",
            location: "Facility",
            startDate: "2025-10-01",
            endDate: null,
            status: "active",
            createdAt: "2025-10-01",
        },
        {
            id: 4,
            title: "Reports & Liquidation - Q4",
            description: "Compilation of reports and liquidation every 4th quarter",
            staffIds: [1, 2, 3, 4],
            staffNames: ["Officer 1", "Officer 2", "Officer 3", "Officer 4"],
            role: "Admin Team",
            recurrence: "quarterly",
            recurrencePattern: {
                frequency: "quarterly",
                quarter: 4, // Q4
                interval: 1,
            },
            startTime: "08:00",
            endTime: "17:00",
            location: "Admin Office",
            startDate: "2025-01-01",
            endDate: null,
            status: "active",
            createdAt: "2025-10-01",
        },
    ])

    const generatedShifts = ref([
        {
            id: 1,
            templateId: 1,
            date: "2025-10-03", // Friday
            staffId: 1,
            staffName: "Officer 1",
            role: "Duty Officer",
            startTime: "08:00",
            endTime: "17:00",
            location: "Main Office",
            status: "scheduled",
        },
        {
            id: 2,
            templateId: 1,
            date: "2025-10-10",
            staffId: 1,
            staffName: "Officer 1",
            role: "Duty Officer",
            startTime: "08:00",
            endTime: "17:00",
            location: "Main Office",
            status: "scheduled",
        },
        {
            id: 3,
            templateId: 2,
            date: "2025-10-07", // Tuesday
            staffId: 2,
            staffName: "Officer 2",
            role: "Duty Officer",
            startTime: "08:00",
            endTime: "17:00",
            location: "Main Office",
            status: "scheduled",
        },
        {
            id: 4,
            templateId: 3,
            date: "2025-10-06", // 3rd week Monday
            staffIds: [1, 2, 3],
            staffNames: ["Officer 1", "Officer 2", "Officer 3"],
            role: "Cleaning Team",
            startTime: "09:00",
            endTime: "16:00",
            location: "Facility",
            status: "scheduled",
        },
    ])

    const attendance = ref([
        {
            id: 1,
            shiftId: 1,
            staffId: 1,
            staffName: "Officer 1",
            date: "2025-10-03",
            status: "present",
            checkInTime: "08:05",
            checkOutTime: "17:00",
            hoursWorked: 8.92,
            notes: "",
        },
        {
            id: 2,
            shiftId: 2,
            staffId: 1,
            staffName: "Officer 1",
            date: "2025-10-10",
            status: "present",
            checkInTime: "08:00",
            checkOutTime: "17:00",
            hoursWorked: 9,
            notes: "",
        },
        {
            id: 3,
            shiftId: 3,
            staffId: 2,
            staffName: "Officer 2",
            date: "2025-10-07",
            status: "late",
            checkInTime: "08:30",
            checkOutTime: "17:00",
            hoursWorked: 8.5,
            notes: "Traffic delay",
        },
        {
            id: 4,
            shiftId: 4,
            staffId: 1,
            staffName: "Officer 1",
            date: "2025-10-06",
            status: "absent",
            checkInTime: null,
            checkOutTime: null,
            hoursWorked: 0,
            notes: "No excuse submitted",
        },
    ])

    const excuses = ref([
        {
            id: 1,
            staffId: 1,
            staffName: "Officer 1",
            shiftId: 4,
            date: "2025-10-06",
            reason: "Medical appointment",
            status: "pending",
            submittedAt: "2025-10-05",
            approvedAt: null,
            approvedBy: null,
        },
        {
            id: 2,
            staffId: 2,
            staffName: "Officer 2",
            shiftId: 3,
            date: "2025-10-07",
            reason: "Family emergency",
            status: "approved",
            submittedAt: "2025-10-06",
            approvedAt: "2025-10-06",
            approvedBy: "Admin",
        },
    ])

    const scheduleOverrides = ref([
        {
            id: 1,
            templateId: 1,
            month: "2025-11",
            staffId: 5, // Different officer for November
            staffName: "Officer 5",
            reason: "Officer 1 on leave",
            createdAt: "2025-10-15",
        },
    ])

    // Actions for Schedule Templates
    function addScheduleTemplate(templateData) {
        const newId = Math.max(...scheduleTemplates.value.map((s) => s.id), 0) + 1
        scheduleTemplates.value.push({
            id: newId,
            ...templateData,
            createdAt: new Date().toISOString().split("T")[0],
        })
    }

    function updateScheduleTemplate(id, templateData) {
        const index = scheduleTemplates.value.findIndex((s) => s.id === id)
        if (index !== -1) {
            scheduleTemplates.value[index] = { ...scheduleTemplates.value[index], ...templateData }
        }
    }

    function deleteScheduleTemplate(id) {
        scheduleTemplates.value = scheduleTemplates.value.filter((s) => s.id !== id)
        // Also remove generated shifts from this template
        generatedShifts.value = generatedShifts.value.filter((shift) => shift.templateId !== id)
    }

    // Actions for Generated Shifts
    function generateShiftsFromTemplate(templateId, monthYear) {
        // This would generate shifts for a specific month based on the template
        // For now, shifts are pre-populated in mockup data
    }

    function addGeneratedShift(shiftData) {
        const newId = Math.max(...generatedShifts.value.map((s) => s.id), 0) + 1
        generatedShifts.value.push({
            id: newId,
            ...shiftData,
        })
    }

    function updateGeneratedShift(id, shiftData) {
        const index = generatedShifts.value.findIndex((s) => s.id === id)
        if (index !== -1) {
            generatedShifts.value[index] = { ...generatedShifts.value[index], ...shiftData }
        }
    }

    function deleteGeneratedShift(id) {
        generatedShifts.value = generatedShifts.value.filter((s) => s.id !== id)
    }

    // Actions for Attendance
    function markAttendance(attendanceData) {
        const newId = Math.max(...attendance.value.map((a) => a.id), 0) + 1
        attendance.value.push({
            id: newId,
            ...attendanceData,
        })
    }

    function updateAttendance(id, attendanceData) {
        const index = attendance.value.findIndex((a) => a.id === id)
        if (index !== -1) {
            attendance.value[index] = { ...attendance.value[index], ...attendanceData }
        }
    }

    function checkIn(shiftId, staffId) {
        const now = new Date()
        const timeString = now.toTimeString().slice(0, 5)
        const attendance_record = attendance.value.find((a) => a.shiftId === shiftId && a.staffId === staffId)
        if (attendance_record) {
            attendance_record.checkInTime = timeString
            attendance_record.status = "present"
        }
    }

    function checkOut(shiftId, staffId) {
        const now = new Date()
        const timeString = now.toTimeString().slice(0, 5)
        const attendance_record = attendance.value.find((a) => a.shiftId === shiftId && a.staffId === staffId)
        if (attendance_record) {
            attendance_record.checkOutTime = timeString
            // Calculate hours worked
            if (attendance_record.checkInTime) {
                const [inHour, inMin] = attendance_record.checkInTime.split(":").map(Number)
                const [outHour, outMin] = timeString.split(":").map(Number)
                const hours = outHour - inHour + (outMin - inMin) / 60
                attendance_record.hoursWorked = Math.round(hours * 100) / 100
            }
        }
    }

    // Actions for Excuses
    function submitExcuse(excuseData) {
        const newId = Math.max(...excuses.value.map((e) => e.id), 0) + 1
        excuses.value.push({
            id: newId,
            ...excuseData,
            status: "pending",
            submittedAt: new Date().toISOString().split("T")[0],
        })
    }

    function approveExcuse(id) {
        const excuse = excuses.value.find((e) => e.id === id)
        if (excuse) {
            excuse.status = "approved"
            excuse.approvedAt = new Date().toISOString().split("T")[0]
            excuse.approvedBy = "Admin"
        }
    }

    function rejectExcuse(id) {
        const excuse = excuses.value.find((e) => e.id === id)
        if (excuse) {
            excuse.status = "rejected"
        }
    }

    // Actions for Schedule Overrides
    function addScheduleOverride(overrideData) {
        const newId = Math.max(...scheduleOverrides.value.map((o) => o.id), 0) + 1
        scheduleOverrides.value.push({
            id: newId,
            ...overrideData,
            createdAt: new Date().toISOString().split("T")[0],
        })
    }

    function deleteScheduleOverride(id) {
        scheduleOverrides.value = scheduleOverrides.value.filter((o) => o.id !== id)
    }

    // Computed
    const pendingExcuses = computed(() => excuses.value.filter((e) => e.status === "pending"))

    const attendanceStats = computed(() => {
        const total = attendance.value.length
        const present = attendance.value.filter((a) => a.status === "present").length
        const late = attendance.value.filter((a) => a.status === "late").length
        const absent = attendance.value.filter((a) => a.status === "absent").length
        return {
            total,
            present,
            late,
            absent,
            presentRate: total > 0 ? Math.round((present / total) * 100) : 0,
        }
    })

    return {
        scheduleTemplates,
        generatedShifts,
        attendance,
        excuses,
        scheduleOverrides,
        pendingExcuses,
        attendanceStats,
        addScheduleTemplate,
        updateScheduleTemplate,
        deleteScheduleTemplate,
        generateShiftsFromTemplate,
        addGeneratedShift,
        updateGeneratedShift,
        deleteGeneratedShift,
        markAttendance,
        updateAttendance,
        checkIn,
        checkOut,
        submitExcuse,
        approveExcuse,
        rejectExcuse,
        addScheduleOverride,
        deleteScheduleOverride,
    }
})
