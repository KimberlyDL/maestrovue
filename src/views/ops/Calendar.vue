<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import OpsCalendarView from '@/components/ops/ops_calendar_view.vue'
import ScheduleDetailPanel from '@/components/ops/schedule_detail_panel.vue'
import ScheduleTemplateFormModal from '@/components/ops/schedule_template_form_modal.vue'
import { useOpsStore } from '@/stores/ops_store.js'

const selectedTemplateId = ref(null)
const showTemplateForm = ref(false)
const editingTemplateId = ref(null)
const currentMonth = ref(new Date())

// biome-ignore lint/correctness/useHookAtTopLevel: Pinia stores are safe to call at top level
const opsStore = useOpsStore()

const selectedTemplate = computed(() =>
    opsStore.scheduleTemplates.find(t => t.id === selectedTemplateId.value)
)

const shiftsForCurrentMonth = computed(() => {
    const year = currentMonth.value.getFullYear()
    const month = String(currentMonth.value.getMonth() + 1).padStart(2, '0')
    const monthStr = `${year}-${month}`

    return opsStore.generatedShifts.filter(shift => shift.date.startsWith(monthStr))
})

function selectTemplate(templateId) {
    selectedTemplateId.value = templateId
}

function openNewTemplateForm() {
    editingTemplateId.value = null
    showTemplateForm.value = true
}

function openEditTemplateForm(templateId) {
    editingTemplateId.value = templateId
    showTemplateForm.value = true
}

function handleSaveTemplate(templateData) {
    if (editingTemplateId.value) {
        opsStore.updateScheduleTemplate(editingTemplateId.value, templateData)
    } else {
        opsStore.addScheduleTemplate(templateData)
    }
    showTemplateForm.value = false
    editingTemplateId.value = null
}

function handleDeleteTemplate(templateId) {
    if (confirm('Are you sure you want to delete this schedule template? This will affect all future shifts.')) {
        opsStore.deleteScheduleTemplate(templateId)
        if (selectedTemplateId.value === templateId) {
            selectedTemplateId.value = null
        }
    }
}

function previousMonth() {
    currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1)
}

function nextMonth() {
    currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1)
}

onMounted(() => {
    if (opsStore.scheduleTemplates.length > 0 && !selectedTemplateId.value) {
        selectedTemplateId.value = opsStore.scheduleTemplates[0].id
    }
})

watch(() => opsStore.scheduleTemplates.length, () => {
    if (!selectedTemplateId.value && opsStore.scheduleTemplates.length > 0) {
        selectedTemplateId.value = opsStore.scheduleTemplates[0].id
    }
})
</script>

<template>
    <div class="grid grid-cols-12 gap-4 h-full">
        <!-- Left: Calendar View -->
        <section class="col-span-8">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-4">
                    <h2 class="text-lg font-semibold text-abyss-900 dark:text-platinum-300">Duty Schedule Calendar</h2>
                    <div class="flex items-center gap-2">
                        <button @click="previousMonth"
                            class="px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                            ←
                        </button>
                        <span class="text-sm font-medium min-w-32 text-center">
                            {{ currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
                        </span>
                        <button @click="nextMonth"
                            class="px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                            →
                        </button>
                    </div>
                </div>
                <button @click="openNewTemplateForm"
                    class="px-3 py-1.5 bg-electric-lime-500 text-abyss-900 text-sm rounded-lg hover:bg-electric-lime-600 dark:bg-electric-lime-600 dark:hover:bg-electric-lime-700 font-medium">
                    + New Schedule Template
                </button>
            </div>
            <OpsCalendarView :shifts="shiftsForCurrentMonth" :selectedTemplateId="selectedTemplateId"
                :currentMonth="currentMonth" @select-template="selectTemplate" />
        </section>

        <!-- Right: Template Details Panel -->
        <section class="col-span-4">
            <ScheduleDetailPanel v-if="selectedTemplate" :template="selectedTemplate" @edit="openEditTemplateForm"
                @delete="handleDeleteTemplate" />
            <div v-else
                class="rounded-lg border border-gray-300 dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400">
                <p>Select a schedule template to view details</p>
            </div>
        </section>

        <!-- Template Form Modal -->
        <ScheduleTemplateFormModal v-model="showTemplateForm" :templateId="editingTemplateId"
            @save="handleSaveTemplate" />
    </div>
</template>
