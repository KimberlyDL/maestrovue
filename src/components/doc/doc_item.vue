<!-- src\components\doc\doc_item.vue -->
<template>
  <div class="group relative w-full rounded-2xl border border-platinum-300/60 bg-white/80 
           dark:bg-abyss-800/70 p-4 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-start gap-3">
      <!-- Icon -->
      <div class="flex h-11 w-11 items-center justify-center rounded-xl 
               bg-kaitoke-green-50 text-kaitoke-green-700 ring-1 ring-kaitoke-green-200">
        <slot name="icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h10M7 11h10M7 15h6" />
          </svg>
        </slot>
      </div>

      <!-- Info -->
      <div class="min-w-0 flex-1">
        <h3 class="truncate font-heading text-[15px] font-semibold text-abyss-900 dark:text-platinum-50">
          {{ doc.title }}
        </h3>
        <p class="text-[11px] text-abyss-500 dark:text-platinum-500">
          {{ doc.type }} • {{ formatDate(doc.uploadedAt) }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1">
        <button @click.stop="handleOpen" class="btn-small">Open</button>
        <button @click.stop="handleViewLogs" class="btn-small">Logs</button>
        <button @click.stop="toggleMenu" class="menu-button btn-icon">⋮</button>

        <!-- Dropdown -->
        <div v-if="menuOpen" class="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-platinum-300/60 
                 bg-white dark:bg-abyss-800 shadow-lg overflow-hidden">
          <ul class="py-1 text-[13px]">
            <li><button class="menu-item" @click="handleOpenFull">Open Full View</button></li>
            <li><button class="menu-item" @click="handleUploadVersion">Upload New Version</button></li>
            <li><button class="menu-item" @click="handleRename">Rename</button></li>
            <li><button class="menu-item" @click="handleDuplicate">Duplicate</button></li>
            <li><button class="menu-item" @click="handleArchive">Archive</button></li>
            <li>
              <button class="menu-item text-red-600" @click="handleDelete">
                Delete
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"

const props = defineProps({
  doc: { type: Object, required: true },
})
const emit = defineEmits([
  "open",
  "open-full",
  "view-logs",
  "upload-version",
  "rename",
  "duplicate",
  "archive",
  "delete",
])

const menuOpen = ref(false)

// ---------------------------
// 🔧 Local helper functions
// ---------------------------
function formatDate(dt) {
  try {
    return new Date(dt).toLocaleDateString()
  } catch {
    return dt
  }
}
function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
function handleOutside(e) {
  if (!e.target.closest(".menu-button") && !e.target.closest(".menu-item")) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener("click", handleOutside))
onBeforeUnmount(() => document.removeEventListener("click", handleOutside))

// ---------------------------
// ⚙️ Modular Operation Handlers
// ---------------------------
function handleOpen() {
  console.log("Open document:", props.doc.id)
  emit("open", props.doc.id)
}

function handleOpenFull() {
  console.log("Open full view:", props.doc.id)
  emit("open-full", props.doc.id)
  menuOpen.value = false
}

function handleViewLogs() {
  console.log("View logs for:", props.doc.id)
  emit("view-logs", props.doc.id)
}

function handleUploadVersion() {
  console.log("Upload new version:", props.doc.id)
  emit("upload-version", props.doc.id)
  menuOpen.value = false
}

function handleRename() {
  console.log("Rename:", props.doc.id)
  emit("rename", props.doc.id)
  menuOpen.value = false
}

function handleDuplicate() {
  console.log("Duplicate:", props.doc.id)
  emit("duplicate", props.doc.id)
  menuOpen.value = false
}

function handleArchive() {
  console.log("Archive:", props.doc.id)
  emit("archive", props.doc.id)
  menuOpen.value = false
}

function handleDelete() {
  if (confirm(`Are you sure you want to delete "${props.doc.title}"?`)) {
    console.log("Delete:", props.doc.id)
    emit("delete", props.doc.id)
  }
  menuOpen.value = false
}
</script>

<style scoped>
.btn-small {
  @apply rounded-lg px-2 py-1 text-[12px] ring-1 ring-platinum-300 hover:bg-platinum-100/60 dark:hover:bg-abyss-700 transition-colors;
}

.btn-icon {
  @apply rounded-lg p-1 ring-1 ring-platinum-300 hover:bg-platinum-100/60 dark:hover:bg-abyss-700;
}

.menu-item {
  @apply w-full text-left px-3 py-2 hover:bg-platinum-100/60 dark:hover:bg-abyss-700 transition-colors;
}
</style>
