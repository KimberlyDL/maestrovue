<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold text-abyss-900">Event Reports</h1>
                <p class="text-platinum-600 mt-1">View and manage event reports and statistics</p>
            </div>
            <button @click="showGenerateModal = true"
                class="flex items-center gap-2 px-4 py-2 bg-kaitoke-green text-white rounded-lg hover:bg-kaitoke-green/90 transition-colors">
                <Plus :size="20" />
                Generate Report
            </button>
        </div>

        <!-- Filters -->
        <div class="flex gap-4 flex-wrap">
            <select v-model="filterStatus"
                class="px-4 py-2 border border-platinum-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kaitoke-green">
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
            </select>
        </div>

        <!-- Reports Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="report in filteredReports" :key="report.id"
                class="bg-white rounded-lg border border-platinum-200 p-6 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-abyss-900">{{ report.eventTitle }}</h3>
                        <p class="text-sm text-platinum-600">{{ report.eventDate }}</p>
                    </div>
                    <button @click="deleteReportItem(report.id)"
                        class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 :size="18" />
                    </button>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="bg-platinum-50 rounded-lg p-3">
                        <p class="text-xs text-platinum-600 mb-1">Total Volunteers</p>
                        <p class="text-2xl font-bold text-abyss-900">{{ report.totalVolunteers }}</p>
                    </div>
                    <div class="bg-kaitoke-green/10 rounded-lg p-3">
                        <p class="text-xs text-kaitoke-green mb-1">Attended</p>
                        <p class="text-2xl font-bold text-kaitoke-green">{{ report.attendedVolunteers }}</p>
                    </div>
                    <div class="bg-sun-100 rounded-lg p-3">
                        <p class="text-xs text-sun-800 mb-1">Excuses</p>
                        <p class="text-2xl font-bold text-sun-800">{{ report.excusesSubmitted }}</p>
                    </div>
                    <div class="bg-platinum-50 rounded-lg p-3">
                        <p class="text-xs text-platinum-600 mb-1">Hours Contributed</p>
                        <p class="text-2xl font-bold text-abyss-900">{{ report.hoursContributed }}</p>
                    </div>
                </div>

                <div class="pt-4 border-t border-platinum-200">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-platinum-600">Attendance Rate</span>
                        <span class="font-semibold text-abyss-900">
                            {{
                                report.totalVolunteers > 0
                                    ? Math.round((report.attendedVolunteers / report.totalVolunteers) * 100)
                                    : 0
                            }}%
                        </span>
                    </div>
                    <div class="w-full bg-platinum-200 rounded-full h-2 mt-2">
                        <div class="bg-kaitoke-green h-2 rounded-full transition-all" :style="{
                            width:
                                report.totalVolunteers > 0
                                    ? (report.attendedVolunteers / report.totalVolunteers) * 100 + '%'
                                    : '0%',
                        }" />
                    </div>
                </div>

                <button @click="downloadReport(report)"
                    class="w-full mt-4 px-4 py-2 border border-kaitoke-green text-kaitoke-green rounded-lg hover:bg-kaitoke-green/5 transition-colors flex items-center justify-center gap-2">
                    <Download :size="18" />
                    Download Report
                </button>
            </div>
        </div>

        <div v-if="filteredReports.length === 0" class="text-center py-12 text-platinum-600">
            No reports found
        </div>

        <!-- Generate Report Modal -->
        <ReportGenerateModal v-if="showGenerateModal" :events="eventsStore.events" @save="handleGenerateReport"
            @close="showGenerateModal = false" />
    </div>

</template>

<script setup>
import { ref, computed } from "vue"
import { useEventsStore } from "@/stores/events_store"
import ReportGenerateModal from "@/components/events/report_generate_modal.vue"
import { Plus, Trash2, Download } from "lucide-vue-next"

// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const eventsStore = useEventsStore()

const filterStatus = ref("")
const showGenerateModal = ref(false)

const filteredReports = computed(() => {
    if (!filterStatus.value) {
        return eventsStore.reports
    }
    return eventsStore.reports.filter((report) => report.status === filterStatus.value)
})

function handleGenerateReport(reportData) {
    eventsStore.addReport(reportData)
    showGenerateModal.value = false
}

function deleteReportItem(reportId) {
    if (confirm("Are you sure you want to delete this report?")) {
        eventsStore.deleteReport(reportId)
    }
}

function downloadReport(report) {
    const csv = [
        ["Event Report"],
        ["Event Title", report.eventTitle],
        ["Event Date", report.eventDate],
        ["Total Volunteers", report.totalVolunteers],
        ["Attended", report.attendedVolunteers],
        ["Excuses Submitted", report.excusesSubmitted],
        ["Hours Contributed", report.hoursContributed],
        ["Attendance Rate", `${Math.round((report.attendedVolunteers / report.totalVolunteers) * 100)}%`],
    ]
        .map((row) => row.join(","))
        .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report-${report.eventTitle}-${report.eventDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
}
</script>
