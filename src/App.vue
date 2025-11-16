<!-- src\App.vue -->

<template>
  <div class="min-h-screen bg-platinum-50 dark:bg-abyss-900">
    <ToastContainer />
    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
import ToastContainer from '@/components/ui/toast_container.vue'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  authStore.restoreSession()
})
</script>

<style scoped>
/* Global app styles */
</style>