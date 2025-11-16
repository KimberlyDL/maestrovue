<template>
    <div class="min-h-screen bg-abyss-900">
        <HomeHeader />

        <div class="max-w-screen mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                <main class=" md:col-span-12 lg:col-span-12">
                    <router-view />
                </main>
            </div>
        </div>
    </div>
</template>

<script setup>
import HomeHeader from '@components/nav/home_header.vue'
import HomeSidebar from '@components/nav/home_sidebar.vue'
// Note: Ensure HomeHeader.vue and HomeSidebar.vue are placed in the correct path
</script>