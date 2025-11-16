<!-- src/layouts/HomeLayout.vue -->
<template>
    <div class="min-h-screen bg-platinum-50 dark:bg-abyss-900">
        <HomeHeader @toggle-mobile-sidebar="mobileOpen = !mobileOpen" />

        <div class="pt-16">
            <!-- Sidebar -->
            <HomeSidebar :is-mobile-open="mobileOpen" :org-id="$route.params.id || null"
                @close-mobile-sidebar="mobileOpen = false" @expanded-change="isFull = $event" />

            <!-- Main: adjust margin for md+ depending on icon/full -->
            <main :class="[
                'transition-all duration-300 ease-in-out',
                'px-6 py-6',
                // icon (w-20) vs full (w-64)
                'md:ml-20',
                isFull && 'md:ml-64'
            ]">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import HomeHeader from '@/components/nav/home_header.vue'
import HomeSidebar from '@/components/nav/home_sidebar.vue'

const mobileOpen = ref(false)
const isFull = ref(false) // from sidebar expand/collapse (md+)
</script>
