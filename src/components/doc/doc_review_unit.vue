<template>
  <div class="min-h-screen bg-platinum-50 dark:bg-abyss-900 p-6 flex items-center justify-center">
    <div class="w-full max-w-4xl">
      <!-- ✅ Your component inline -->
      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl border border-platinum-300/60 bg-white/80 dark:bg-abyss-800/70 shadow-sm">
        <!-- Left: Document Item -->
        <div class="md:col-span-1 flex flex-col justify-between">
          <div>
            <h3 class="text-[15px] font-semibold text-abyss-900 dark:text-platinum-50 mb-1">
              {{ doc.title }}
            </h3>
            <p class="text-[13px] text-abyss-500 dark:text-platinum-400 mb-2">
              {{ doc.type }} — v{{ doc.version }}
            </p>
            <p class="text-[12px] text-abyss-600 dark:text-platinum-400 italic">
              Department: {{ doc.department }}
            </p>
          </div>
          <div class="mt-3 flex gap-2">
            <button
              class="rounded-lg px-3 py-1.5 text-[12px] font-semibold bg-kaitoke-green-600 text-white hover:bg-kaitoke-green-700 transition">
              Open
            </button>
            <button
              class="rounded-lg px-3 py-1.5 text-[12px] font-semibold ring-1 ring-platinum-300 hover:bg-platinum-100/60 dark:hover:bg-abyss-700 transition">
              View Logs
            </button>
          </div>
        </div>

        <!-- Right: Reviewers List -->
        <div class="md:col-span-2">
          <h4 class="text-sm font-semibold mb-2 text-abyss-800 dark:text-platinum-100">Reviewers</h4>
          <ul class="divide-y divide-platinum-200/60 dark:divide-abyss-700">
            <li v-for="r in reviewers" :key="r.id" class="flex items-center justify-between py-2">
              <div class="flex items-center gap-2">
                <div
                  class="h-7 w-7 flex items-center justify-center rounded-full bg-kaitoke-green-600 text-white text-[12px]">
                  {{ r.name[0].toUpperCase() }}
                </div>
                <div>
                  <p class="text-[13px] font-medium text-abyss-900 dark:text-platinum-50">
                    {{ r.name }}
                  </p>
                  <p class="text-[11px] text-abyss-500 dark:text-platinum-400 capitalize">
                    {{ r.status }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-1">
                <button
                  class="rounded-lg px-2 py-1 text-[12px] ring-1 ring-platinum-300 hover:bg-platinum-100/60 dark:hover:bg-abyss-700 transition-colors">Remind</button>
                <button
                  class="rounded-lg px-2 py-1 text-[12px] ring-1 ring-platinum-300 hover:bg-platinum-100/60 dark:hover:bg-abyss-700 transition-colors">Approve</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// mock document
const doc = {
  id: 11,
  title: 'Q4 Budget Proposal',
  type: 'Proposal',
  version: 2,
  department: 'Finance',
  status: 'In Review',
}

// mock reviewers
const reviewers = [
  { id: 1, name: 'Ana Cruz', status: 'approved' },
  { id: 2, name: 'Liam Tan', status: 'pending' },
  { id: 3, name: 'Mira Santos', status: 'in review' },
]
</script>

<style scoped>
</style>
