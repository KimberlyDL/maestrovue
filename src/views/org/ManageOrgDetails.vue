<template>
    <div class="min-h-screen bg-abyss-900 p-6">
        <div class="max-w-5xl mx-auto">
            <!-- Header -->
            <div class="mb-6 flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-platinum-50">Create Organization</h1>
                    <p class="text-platinum-500 text-sm">Propose a new student organization and set up its structure.
                    </p>
                </div>
                <div class="flex gap-2">
                    <button class="px-3 py-2 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-800"
                        @click="saveDraft" :disabled="isSaving">
                        {{ isSaving ? 'Saving…' : 'Save Draft' }}
                    </button>
                    <button
                        class="px-3 py-2 rounded-md bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-abyss-900 font-medium"
                        @click="submit" :disabled="!canSubmit || isSubmitting">
                        {{ isSubmitting ? 'Submitting…' : 'Submit for Review' }}
                    </button>
                </div>
            </div>

            <!-- Stepper -->
            <div class="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-2">
                <button v-for="(s, idx) in steps" :key="s.key"
                    class="flex items-center gap-2 rounded-md border p-3 text-left"
                    :class="currentStep === idx ? 'border-kaitoke-green-700/60 bg-kaitoke-green-900/20 text-platinum-50' : 'border-abyss-700 bg-abyss-800 text-platinum-300'"
                    @click="goStep(idx)">
                    <span class="inline-flex h-6 w-6 items-center justify-center rounded-full" :class="stepStatus(idx)">
                        {{ idx + 1 }}
                    </span>
                    <span class="text-sm font-medium">{{ s.title }}</span>
                </button>
            </div>

            <!-- Form card -->
            <div class="rounded-lg border border-abyss-700 bg-abyss-800">
                <div class="p-5">
                    <!-- STEP 1: Basic Info -->
                    <div v-if="currentStep === 0" class="space-y-5">
                        <SectionHeader title="Basic Information"
                            description="Provide the foundational details for your org." />
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Proposed Organization Name" v-model="form.name" :error="errors.name"
                                placeholder="e.g., UP Tech Guild" :maxlength="80" :counter="true" @blur="makeSlug" />
                            <FormInput label="Slug / Handle (auto)" v-model="form.slug" :error="errors.slug"
                                placeholder="up-tech-guild" :readonly="true" />
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormSelect label="Type of Organization" v-model="form.type" :error="errors.type"
                                :options="orgTypes" placeholder="Select type" />
                            <FormInput label="Department / Campus Affiliation" v-model="form.affiliation"
                                :error="errors.affiliation" placeholder="e.g., College of Engineering" />
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormDate label="Date of Establishment" v-model="form.establishedAt"
                                :error="errors.establishedAt" />
                            <div></div>
                        </div>

                        <FormTextarea label="Short Description or Purpose" v-model="form.description"
                            :error="errors.description" :maxlength="300"
                            placeholder="What your org is about and who it serves…" :counter="true" />
                    </div>

                    <!-- STEP 2: Organizational Details -->
                    <div v-else-if="currentStep === 1" class="space-y-6">
                        <SectionHeader title="Organizational Details"
                            description="Goals and structure of the organization." />

                        <FormTextarea label="Vision, Mission, and Objectives" v-model="form.vmo" :error="errors.vmo"
                            :maxlength="2000" placeholder="State the Vision, Mission, and Objectives…"
                            :counter="true" />

                        <!-- Activities Builder -->
                        <div class="rounded-lg border border-abyss-700">
                            <div class="flex items-center justify-between p-4">
                                <div>
                                    <div class="text-platinum-50 font-semibold">Proposed Activities/Projects (School
                                        Year)</div>
                                    <div class="text-platinum-500 text-sm">Outline events, timelines, and owners.</div>
                                </div>
                                <button
                                    class="px-3 py-1.5 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-700"
                                    @click="addActivity">Add Activity</button>
                            </div>
                            <div class="divide-y divide-abyss-700">
                                <div v-for="(a, i) in form.activities" :key="a.uid" class="p-4 bg-abyss-900/40">
                                    <div class="grid md:grid-cols-6 gap-3">
                                        <div class="md:col-span-2">
                                            <FormInput label="Title" v-model="a.title"
                                                placeholder="e.g., Tech Bootcamp" />
                                        </div>
                                        <div>
                                            <FormDate label="Start" v-model="a.start" />
                                        </div>
                                        <div>
                                            <FormDate label="End" v-model="a.end" />
                                        </div>
                                        <div>
                                            <FormInput label="Owner" v-model="a.owner"
                                                placeholder="e.g., Events Committee" />
                                        </div>
                                        <div class="flex items-end">
                                            <button
                                                class="px-3 py-2 rounded-md border border-rose-700/50 text-rose-300 hover:bg-rose-900/30"
                                                @click="removeActivity(i)">Remove</button>
                                        </div>
                                    </div>
                                    <FormTextarea class="mt-3" label="Details" v-model="a.details" :maxlength="500"
                                        :counter="true" placeholder="Objectives, beneficiaries, expected outcomes…" />
                                </div>
                                <div v-if="!form.activities.length" class="p-4 text-sm text-platinum-500">No activities
                                    yet.</div>
                            </div>
                        </div>

                        <!-- Budget Mini-Table -->
                        <div class="rounded-lg border border-abyss-700">
                            <div class="flex items-center justify-between p-4">
                                <div>
                                    <div class="text-platinum-50 font-semibold">Funding / Budget Plan</div>
                                    <div class="text-platinum-500 text-sm">List projected expenses and sources (if
                                        applicable).</div>
                                </div>
                                <div class="flex gap-2">
                                    <button
                                        class="px-3 py-1.5 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-700"
                                        @click="addBudgetRow">Add Item</button>
                                    <button
                                        class="px-3 py-1.5 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-700"
                                        @click="recalcBudget">Recalculate</button>
                                </div>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="min-w-full text-sm">
                                    <thead class="bg-abyss-900 text-platinum-400">
                                        <tr>
                                            <th class="px-3 py-2 text-left">Item</th>
                                            <th class="px-3 py-2 text-left">Category</th>
                                            <th class="px-3 py-2 text-right">Amount (₱)</th>
                                            <th class="px-3 py-2 text-left">Source</th>
                                            <th class="px-3 py-2 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-abyss-800 bg-abyss-900">
                                        <tr v-for="(b, i) in form.budget" :key="b.uid">
                                            <td class="px-3 py-2">
                                                <input v-model="b.item"
                                                    class="w-full px-2 py-1 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50" />
                                            </td>
                                            <td class="px-3 py-2">
                                                <select v-model="b.category"
                                                    class="w-full px-2 py-1 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50">
                                                    <option value="operations">Operations</option>
                                                    <option value="events">Events</option>
                                                    <option value="equipment">Equipment</option>
                                                    <option value="others">Others</option>
                                                </select>
                                            </td>
                                            <td class="px-3 py-2 text-right">
                                                <input v-model.number="b.amount" type="number" min="0" step="0.01"
                                                    class="w-36 px-2 py-1 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50 text-right" />
                                            </td>
                                            <td class="px-3 py-2">
                                                <input v-model="b.source" placeholder="e.g., membership, sponsors"
                                                    class="w-full px-2 py-1 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50" />
                                            </td>
                                            <td class="px-3 py-2 text-right">
                                                <button
                                                    class="px-3 py-1.5 rounded-md border border-rose-700/50 text-rose-300 hover:bg-rose-900/30"
                                                    @click="removeBudgetRow(i)">Remove</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot class="bg-abyss-900">
                                        <tr>
                                            <td class="px-3 py-2 font-medium text-platinum-300" colspan="2">Total</td>
                                            <td class="px-3 py-2 text-right font-semibold text-platinum-50">₱ {{
                                                formatCurrency(budgetTotal) }}</td>
                                            <td class="px-3 py-2" colspan="2"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <!-- Drive-like refs -->
                        <div class="rounded-lg border border-abyss-700">
                            <div class="p-4">
                                <div class="text-platinum-50 font-semibold">Reference Folders (Org Drive)</div>
                                <div class="text-platinum-500 text-sm mb-3">
                                    Link folders from your internal drive feature so reviewers and officers can jump to
                                    documents.
                                </div>
                                <div class="grid md:grid-cols-2 gap-4">
                                    <DriveLinkInput label="VMO Folder" v-model="form.driveRefs.vmo" />
                                    <DriveLinkInput label="Activities/Projects Folder"
                                        v-model="form.driveRefs.activities" />
                                    <DriveLinkInput label="Budget/Finance Folder" v-model="form.driveRefs.budget" />
                                    <DriveLinkInput label="Other References" v-model="form.driveRefs.misc" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- STEP 3: Review & Submit -->
                    <div v-else-if="currentStep === 2" class="space-y-6">
                        <SectionHeader title="Review & Submit"
                            description="Double-check your info before submitting for admin review." />

                        <ReviewRow label="Organization" :value="form.name" />
                        <ReviewRow label="Slug" :value="form.slug" />
                        <ReviewRow label="Type" :value="form.type" />
                        <ReviewRow label="Affiliation" :value="form.affiliation" />
                        <ReviewRow label="Established" :value="fmtDate(form.establishedAt)" />
                        <ReviewRow label="Description" :value="form.description || '—'" />

                        <div class="rounded-lg border border-abyss-700">
                            <div class="p-4 text-platinum-50 font-semibold">VMO</div>
                            <div class="px-4 pb-4 text-platinum-300 whitespace-pre-wrap">{{ form.vmo || '—' }}</div>
                        </div>

                        <div class="rounded-lg border border-abyss-700">
                            <div class="p-4 text-platinum-50 font-semibold">Activities ({{ form.activities.length }})
                            </div>
                            <div class="divide-y divide-abyss-800">
                                <div v-for="a in form.activities" :key="a.uid" class="p-4">
                                    <div class="flex flex-wrap items-center gap-3 text-sm">
                                        <span class="text-platinum-50 font-medium">{{ a.title || 'Untitled' }}</span>
                                        <span class="text-platinum-400">•</span>
                                        <span class="text-platinum-400">{{ fmtDate(a.start) }} → {{ fmtDate(a.end)
                                            }}</span>
                                        <span class="text-platinum-400">•</span>
                                        <span class="text-platinum-400">Owner: {{ a.owner || '—' }}</span>
                                    </div>
                                    <div class="text-platinum-300 text-sm mt-1 whitespace-pre-wrap">{{ a.details || '—'
                                        }}</div>
                                </div>
                                <div v-if="!form.activities.length" class="p-4 text-sm text-platinum-500">No activities
                                    listed.</div>
                            </div>
                        </div>

                        <div class="rounded-lg border border-abyss-700">
                            <div class="p-4 text-platinum-50 font-semibold">Budget Summary — Total ₱ {{
                                formatCurrency(budgetTotal) }}</div>
                            <div class="overflow-x-auto">
                                <table class="min-w-full text-sm">
                                    <thead class="bg-abyss-900 text-platinum-400">
                                        <tr>
                                            <th class="px-3 py-2 text-left">Item</th>
                                            <th class="px-3 py-2 text-left">Category</th>
                                            <th class="px-3 py-2 text-right">Amount (₱)</th>
                                            <th class="px-3 py-2 text-left">Source</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-abyss-800 bg-abyss-900">
                                        <tr v-for="b in form.budget" :key="b.uid">
                                            <td class="px-3 py-2 text-platinum-200">{{ b.item || '—' }}</td>
                                            <td class="px-3 py-2 text-platinum-200 capitalize">{{ b.category || '—' }}
                                            </td>
                                            <td class="px-3 py-2 text-right text-platinum-100">₱ {{
                                                formatCurrency(b.amount || 0) }}</td>
                                            <td class="px-3 py-2 text-platinum-200">{{ b.source || '—' }}</td>
                                        </tr>
                                        <tr v-if="!form.budget.length">
                                            <td colspan="4" class="px-3 py-4 text-platinum-500 text-center">No budget
                                                items.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="rounded-lg border border-abyss-700">
                            <div class="p-4 text-platinum-50 font-semibold">Drive References</div>
                            <div class="p-4 grid md:grid-cols-2 gap-4">
                                <DriveRef label="VMO" :href="form.driveRefs.vmo" />
                                <DriveRef label="Activities" :href="form.driveRefs.activities" />
                                <DriveRef label="Budget" :href="form.driveRefs.budget" />
                                <DriveRef label="Other" :href="form.driveRefs.misc" />
                            </div>
                        </div>

                        <div class="flex items-center justify-between">
                            <div class="text-platinum-500 text-sm">By submitting, you agree that this proposal will be
                                routed to reviewers.</div>
                            <div class="flex gap-2">
                                <button
                                    class="px-3 py-2 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-800"
                                    @click="goStep(0)">Edit Basic</button>
                                <button
                                    class="px-3 py-2 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-800"
                                    @click="goStep(1)">Edit Details</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer nav -->
                <div class="border-t border-abyss-700 p-4 flex items-center justify-between">
                    <button class="px-3 py-2 rounded-md border border-abyss-600 text-platinum-200 hover:bg-abyss-800"
                        :disabled="currentStep === 0" @click="prevStep">Back</button>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-platinum-500">Step {{ currentStep + 1 }} of {{ steps.length }}</span>
                        <button
                            class="px-3 py-2 rounded-md bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-abyss-900 font-medium"
                            v-if="currentStep < steps.length - 1" @click="nextStep" :disabled="!canGoNext">
                            Next
                        </button>
                        <button
                            class="px-3 py-2 rounded-md bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-abyss-900 font-medium"
                            v-else @click="submit" :disabled="!canSubmit || isSubmitting">
                            {{ isSubmitting ? 'Submitting…' : 'Submit for Review' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Toast -->
            <transition name="fade">
                <div v-if="toast"
                    class="fixed bottom-4 right-4 px-4 py-3 bg-kaitoke-green-600 text-abyss-900 font-medium rounded-lg shadow-lg">
                    {{ toast }}
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

/* ----------------------- Mini UI Partials ----------------------- */
const SectionHeader = {
    props: { title: String, description: String },
    template: `
    <div class="mb-1">
      <div class="text-platinum-50 font-semibold">{{ title }}</div>
      <div v-if="description" class="text-platinum-500 text-sm">{{ description }}</div>
    </div>`
}

const FormInput = {
    props: { label: String, modelValue: [String, Number], error: String, placeholder: String, maxlength: Number, readonly: Boolean, counter: Boolean },
    emits: ['update:modelValue', 'blur'],
    template: `
  <label class="block">
    <span class="block text-xs text-platinum-600 mb-1">{{ label }}</span>
    <input :readonly="readonly"
           :placeholder="placeholder"
           :maxlength="maxlength"
           :value="modelValue"
           @input="$emit('update:modelValue', $event.target.value)"
           @blur="$emit('blur')"
           class="w-full px-3 py-2 rounded-md bg-abyss-900 border"
           :class="error ? 'border-rose-700/60 text-platinum-50' : 'border-abyss-700 text-platinum-50'"
    />
    <div class="flex justify-between mt-1">
      <span v-if="error" class="text-rose-300 text-xs">{{ error }}</span>
      <span v-if="counter && maxlength" class="text-platinum-500 text-xs ml-auto">
        {{ String(modelValue || '').length }} / {{ maxlength }}
      </span>
    </div>
  </label>`
}

const FormTextarea = {
    props: { label: String, modelValue: String, error: String, placeholder: String, maxlength: Number, counter: Boolean },
    emits: ['update:modelValue'],
    template: `
  <label class="block">
    <span class="block text-xs text-platinum-600 mb-1">{{ label }}</span>
    <textarea
      :placeholder="placeholder"
      :maxlength="maxlength"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full min-h-[120px] px-3 py-2 rounded-md bg-abyss-900 border"
      :class="error ? 'border-rose-700/60 text-platinum-50' : 'border-abyss-700 text-platinum-50'"></textarea>
    <div class="flex justify-between mt-1">
      <span v-if="error" class="text-rose-300 text-xs">{{ error }}</span>
      <span v-if="counter && maxlength" class="text-platinum-500 text-xs ml-auto">
        {{ String(modelValue || '').length }} / {{ maxlength }}
      </span>
    </div>
  </label>`
}

const FormDate = {
    props: { label: String, modelValue: [String, Date], error: String },
    emits: ['update:modelValue'],
    template: `
  <label class="block">
    <span class="block text-xs text-platinum-600 mb-1">{{ label }}</span>
    <input type="date" :value="toDateInput(modelValue)" @input="$emit('update:modelValue', $event.target.value)"
           class="w-full px-3 py-2 rounded-md bg-abyss-900 border"
           :class="error ? 'border-rose-700/60 text-platinum-50' : 'border-abyss-700 text-platinum-50'" />
    <span v-if="error" class="text-rose-300 text-xs">{{ error }}</span>
  </label>`,
    methods: {
        toDateInput(v) { if (!v) return ''; const d = new Date(v); if (Number.isNaN(d)) return ''; return d.toISOString().slice(0, 10) }
    }
}

const FormSelect = {
    props: { label: String, modelValue: String, options: Array, placeholder: String, error: String },
    emits: ['update:modelValue'],
    template: `
  <label class="block">
    <span class="block text-xs text-platinum-600 mb-1">{{ label }}</span>
    <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)"
            class="w-full px-3 py-2 rounded-md bg-abyss-900 border"
            :class="error ? 'border-rose-700/60 text-platinum-50' : 'border-abyss-700 text-platinum-50'">
      <option value="" disabled selected hidden>{{ placeholder || 'Select' }}</option>
      <option v-for="o in options" :key="o" :value="o">{{ o }}</option>
    </select>
    <span v-if="error" class="text-rose-300 text-xs">{{ error }}</span>
  </label>`
}

const ReviewRow = {
    props: { label: String, value: String }, template: `
  <div class="grid grid-cols-3 gap-3 text-sm">
    <div class="text-platinum-500">{{ label }}</div>
    <div class="col-span-2 text-platinum-200">{{ value || '—' }}</div>
  </div>` }

const DriveLinkInput = {
    props: { label: String, modelValue: String },
    emits: ['update:modelValue'],
    data: () => ({ tmp: '' }),
    mounted() { this.tmp = this.modelValue || '' },
    template: `
  <label class="block">
    <span class="block text-xs text-platinum-600 mb-1">{{ label }}</span>
    <div class="flex gap-2">
      <input :value="tmp" @input="tmp=$event.target.value"
             placeholder="drive://orgs/{slug}/(folder)"
             class="flex-1 px-3 py-2 rounded-md bg-abyss-900 border border-abyss-700 text-platinum-50" />
      <button class="px-3 py-2 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-700"
              @click="$emit('update:modelValue', tmp)">Set</button>
    </div>
    <div class="text-xs text-platinum-500 mt-1">Example: <code>drive://orgs/up-tech-guild/vmo</code></div>
  </label>`
}

const DriveRef = {
    props: { label: String, href: String },
    methods: {
        open() { if (this.href) window.open(this.href.replace(/^drive:\/\//, '/drive/'), '_blank') }
    },
    template: `
  <div class="flex items-center justify-between rounded-md border border-abyss-700 p-3">
    <div>
      <div class="text-platinum-50 text-sm font-medium">{{ label }}</div>
      <div class="text-platinum-400 text-xs break-all">{{ href || '—' }}</div>
    </div>
    <button :disabled="!href" @click="open"
            class="px-3 py-1.5 rounded-md border border-platinum-700 text-platinum-200 hover:bg-abyss-700 disabled:opacity-40">
      Open
    </button>
  </div>`
}

/* ----------------------- State ----------------------- */
const steps = [
    { key: 'basic', title: 'Basic Info' },
    { key: 'details', title: 'Org Details' },
    { key: 'review', title: 'Review & Submit' }
]
const currentStep = ref(0)

const orgTypes = ['Academic', 'Sports', 'Arts', 'Socio-Civic', 'Science & Tech', 'Entrepreneurial', 'Religious', 'Others']

const form = reactive({
    name: '',
    slug: '',
    type: '',
    description: '',
    establishedAt: '',
    affiliation: '',
    vmo: '',
    activities: [],
    budget: [],
    driveRefs: { vmo: '', activities: '', budget: '', misc: '' }
})

const isSaving = ref(false)
const isSubmitting = ref(false)
const toast = ref('')
const errors = reactive({})

/* ----------------------- Watchers / Draft ----------------------- */
const DRAFT_KEY = 'org_create_draft_v1'
watch(form, () => debounceSaveLocal(), { deep: true })

let draftTimer = null
function debounceSaveLocal() {
    clearTimeout(draftTimer)
    draftTimer = setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    }, 300)
}
onMounted(() => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) {
        try { Object.assign(form, JSON.parse(saved)) } catch { }
    }
    window.addEventListener('beforeunload', navGuard)
})
onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', navGuard)
})
function navGuard(e) {
    if (!isPristine.value) {
        e.preventDefault()
        e.returnValue = ''
    }
}
const isPristine = computed(() =>
    !form.name && !form.type && !form.description && !form.vmo && !form.activities.length && !form.budget.length
)

/* ----------------------- Activities ----------------------- */
function addActivity() {
    form.activities.push({ uid: cryptoUid(), title: '', start: '', end: '', owner: '', details: '' })
}
function removeActivity(i) { form.activities.splice(i, 1) }

/* ----------------------- Budget ----------------------- */
function addBudgetRow() { form.budget.push({ uid: cryptoUid(), item: '', category: 'operations', amount: 0, source: '' }) }
function removeBudgetRow(i) { form.budget.splice(i, 1) }
const budgetTotal = computed(() => form.budget.reduce((s, b) => s + (Number(b.amount) || 0), 0))
function recalcBudget() { /* placeholder for future server-side calc */ toastMsg('Budget recalculated') }

/* ----------------------- Validation ----------------------- */
function validateStep(idx = currentStep.value) {
    Object.keys(errors).forEach(k => delete errors[k])

    if (idx === 0) {
        if (!form.name || form.name.trim().length < 3) errors.name = 'Enter at least 3 characters'
        if (!form.slug) errors.slug = 'Slug not generated'
        if (!/^[a-z0-9\-]+$/.test(form.slug)) errors.slug = 'Slug must be lowercase and hyphen-separated'
        if (!form.type) errors.type = 'Select a type'
        if (!form.affiliation) errors.affiliation = 'Required'
        if (!form.establishedAt) errors.establishedAt = 'Select a date'
        else if (new Date(form.establishedAt) > new Date()) errors.establishedAt = 'Date cannot be in the future'
        if (!form.description || form.description.trim().length < 20) errors.description = 'Describe your org (min 20 chars)'
    }

    if (idx === 1) {
        if (!form.vmo || form.vmo.trim().length < 30) errors.vmo = 'Provide clear VMO (min 30 chars)'
        // Optional: At least one activity when proposing
        // if (!form.activities.length) errors.activities = 'Add at least one proposed activity'
        // Budget may be optional
    }

    return Object.keys(errors).length === 0
}
const canGoNext = computed(() => validateStep(currentStep.value))
const canSubmit = computed(() => validateStep(0) && validateStep(1))

/* ----------------------- Navigation ----------------------- */
function goStep(i) { currentStep.value = i }
function nextStep() { if (validateStep(currentStep.value)) currentStep.value = Math.min(currentStep.value + 1, steps.length - 1) }
function prevStep() { currentStep.value = Math.max(currentStep.value - 1, 0) }
function stepStatus(idx) {
    if (currentStep.value === idx) return 'bg-kaitoke-green-600 text-abyss-900'
    return (idx < currentStep.value) ? 'bg-kaitoke-green-900/50 text-kaitoke-green-300 border border-kaitoke-green-800' : 'bg-abyss-700 text-platinum-300'
}

/* ----------------------- Helpers ----------------------- */
function makeSlug() {
    if (!form.name) return
    const s = form.name.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    form.slug = s
}
function fmtDate(v) { if (!v) return '—'; const d = new Date(v); if (isNaN(d)) return '—'; return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
function formatCurrency(n) { return (Number(n) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function cryptoUid() { return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase() }
function toastMsg(m) { toast.value = m; setTimeout(() => toast.value = '', 1700) }

/* ----------------------- Persist ----------------------- */
async function saveDraft() {
    isSaving.value = true
    // mock API call
    await new Promise(r => setTimeout(r, 400))
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    isSaving.value = false
    toastMsg('Draft saved')
}

async function submit() {
    if (!canSubmit.value) {
        // Show first invalid step
        if (!validateStep(0)) currentStep.value = 0
        else if (!validateStep(1)) currentStep.value = 1
        return
    }
    isSubmitting.value = true
    // mock API
    await new Promise(r => setTimeout(r, 800))
    isSubmitting.value = false
    toastMsg('Submitted for review')
    // Optionally: navigate to org detail / pending review
    // this.$router.push({ name: 'org.members' })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity .2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
