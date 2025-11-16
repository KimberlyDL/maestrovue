<template>
    <div class="max-w-screen overflow-auto">
        <div class="flex gap-2">
            <StatCard label="Total Documents" :value="256" subLabel="All time"
                iconColorClass="bg-indigo-500 dark:bg-indigo-400" />
            <div class="w-4"></div>
            <StatCard label="Reviewed Documents" :value="128" subLabel="This month"
                iconColorClass="bg-green-500 dark:bg-green-400" />
            <div class="w-4"></div>
            <StatCard label="Pending Review" :value="32" subLabel="Needs attention"
                iconColorClass="bg-yellow-500 dark:bg-yellow-400" />
            <StatCard label="Pending Review" :value="32" subLabel="Needs attention"
                iconColorClass="bg-yellow-500 dark:bg-yellow-400" />
            <StatCard label="Total Documents" :value="256" subLabel="All time"
                iconColorClass="bg-indigo-500 dark:bg-indigo-400" />
            <div class="w-4"></div>
            <StatCard label="Reviewed Documents" :value="128" subLabel="This month"
                iconColorClass="bg-green-500 dark:bg-green-400" />
            <div class="w-4"></div>
            <StatCard label="Pending Review" :value="32" subLabel="Needs attention"
                iconColorClass="bg-yellow-500 dark:bg-yellow-400" />
            <StatCard label="Pending Review" :value="32" subLabel="Needs attention"
                iconColorClass="bg-yellow-500 dark:bg-yellow-400" />
            <StatCard label="Total Documents" :value="256" subLabel="All time"
                iconColorClass="bg-indigo-500 dark:bg-indigo-400" />
            <div class="w-4"></div>
            <StatCard label="Reviewed Documents" :value="128" subLabel="This month"
                iconColorClass="bg-green-500 dark:bg-green-400" />
            <div class="w-4"></div>
            <StatCard label="Pending Review" :value="32" subLabel="Needs attention"
                iconColorClass="bg-yellow-500 dark:bg-yellow-400" />
            <StatCard label="Pending Review" :value="32" subLabel="Needs attention"
                iconColorClass="bg-yellow-500 dark:bg-yellow-400" />
        </div>
    </div>
</template>
<script setup>
import StatCard from '@/components/ui/small_card.vue'
</script>