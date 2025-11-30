<template>
    <div class="h-full flex flex-col space-y-6 p-6 lg:p-8 overflow-y-auto bg-platinum-50 dark:bg-abyss-900">
        <header class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-extrabold font-heading text-abyss-900 dark:text-platinum-50">
                    Storage Statistics
                </h1>
                <p class="text-md text-platinum-600 dark:text-platinum-400 font-body mt-1">
                    Overview of your organization's document usage and capacity.
                </p>
            </div>
            <button @click="loadStats"
                class="p-2.5 rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-800 hover:bg-platinum-100 dark:hover:bg-abyss-700 transition-colors text-platinum-600 dark:text-platinum-400">
                <RefreshCw :size="20" :class="{ 'animate-spin': loading }" />
            </button>
        </header>

        <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-kaitoke-green-600"></div>
        </div>

        <div v-else-if="error"
            class="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/50">
            <div class="flex items-center gap-2 text-red-700 dark:text-red-400 mb-3">
                <AlertCircle :size="20" />
                <span class="font-bold font-heading text-lg">Failed to load statistics</span>
            </div>
            <p class="text-sm text-red-600 dark:text-red-300 font-body">{{ error }}</p>
            <button @click="loadStats" class="mt-4 text-sm font-medium text-red-700 dark:text-red-300 hover:underline">
                Try Again
            </button>
        </div>

        <div v-else class="flex-1 flex flex-col gap-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Storage Used" :value="stats.total_size_formatted" icon="HardDrive" color="blue"
                    trend="Across all files" />

                <StatCard title="Total Files" :value="stats.total_files" icon="FileText" color="green" />

                <StatCard title="Folders" :value="stats.total_folders" icon="Folder" color="yellow" />

                <StatCard title="Public Documents" :value="stats.public_files" icon="Share2" color="purple"
                    :trend="percentagePublic + '% of total files'" />
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white dark:bg-abyss-800 rounded-xl border border-platinum-200 dark:border-abyss-700 p-6">
                    <h3
                        class="text-lg font-bold font-heading text-abyss-900 dark:text-platinum-100 mb-4 flex items-center gap-2">
                        <PieChart :size="20" class="text-kaitoke-green-600" />
                        Composition
                    </h3>
                    <div class="space-y-4">
                        <div
                            class="flex justify-between items-center p-4 bg-platinum-50 dark:bg-abyss-700/50 rounded-lg">
                            <span class="text-sm font-medium text-platinum-600 dark:text-platinum-400">Total Items
                                (Files + Folders)</span>
                            <span class="text-lg font-bold text-abyss-900 dark:text-platinum-100">{{ stats.total_items
                                }}</span>
                        </div>
                        <div
                            class="flex justify-between items-center p-4 bg-platinum-50 dark:bg-abyss-700/50 rounded-lg">
                            <span class="text-sm font-medium text-platinum-600 dark:text-platinum-400">Average File
                                Size</span>
                            <span class="text-lg font-bold text-abyss-900 dark:text-platinum-100">
                                {{ averageFileSize }}
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-white dark:bg-abyss-800 rounded-xl border border-platinum-200 dark:border-abyss-700 p-6 flex flex-col justify-center">
                    <h3
                        class="text-lg font-bold font-heading text-abyss-900 dark:text-platinum-100 mb-4 flex items-center gap-2">
                        <BarChart2 :size="20" class="text-blue-600" />
                        Storage Capacity
                    </h3>

                    <div class="flex-1 flex flex-col justify-center gap-2">
                        <div class="flex justify-between mb-1">
                            <span class="text-sm font-medium text-platinum-600 dark:text-platinum-400">Current
                                Usage</span>
                            <span class="text-sm font-bold text-kaitoke-green-600">{{ stats.total_size_formatted
                                }}</span>
                        </div>
                        <div class="w-full bg-platinum-200 dark:bg-abyss-700 rounded-full h-6 overflow-hidden relative">
                            <div class="bg-gradient-to-r from-kaitoke-green-500 to-kaitoke-green-600 h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                                style="width: 15%">
                            </div>
                        </div>
                        <p class="text-xs text-platinum-500 dark:text-platinum-400 mt-2">
                            * System currently has soft limits on storage.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/utils/api'
import { RefreshCw, HardDrive, FileText, Folder, Share2, AlertCircle, PieChart, BarChart2 } from 'lucide-vue-next'
import StatCard from '@/components/user/StatCard.vue'

const route = useRoute()
const orgId = computed(() => route.params.id)

const loading = ref(true)
const error = ref(null)
const stats = ref({
    total_items: 0,
    total_folders: 0,
    total_files: 0,
    public_files: 0,
    total_size: 0,
    total_size_formatted: '0 B'
})

// Helper to format bytes
const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const averageFileSize = computed(() => {
    if (stats.value.total_files > 0) {
        return formatBytes(stats.value.total_size / stats.value.total_files);
    }
    return '0 B';
})

const percentagePublic = computed(() => {
    if (stats.value.total_files > 0) {
        return ((stats.value.public_files / stats.value.total_files) * 100).toFixed(1);
    }
    return '0.0';
})

const loadStats = async () => {
    loading.value = true
    error.value = null
    try {
        const response = await axios.get(`/api/org/${orgId.value}/storage/statistics`)
        stats.value = response.data
    } catch (err) {
        console.error('Failed to load storage stats:', err)
        error.value = 'Failed to load storage statistics. Please try again later.'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadStats()
})
</script>