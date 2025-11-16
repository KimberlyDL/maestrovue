<template>
  <div class='min-h-screen bg-gray-50 dark:bg-abyss-900 p-6'>
    <DocReviewUnit v-for='d in docs' :key='d.id' :doc='d' :handlers='handlers' />
  </div>
</template>
<script setup>
import DocReviewUnit from './DocReviewUnit.vue'
defineProps({ docs: Array, handlers: Object })
</script>
