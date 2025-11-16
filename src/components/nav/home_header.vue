<template>
    <header id="main-header" class="fixed top-0 left-0 right-0 z-50 border-b
            bg-white text-abyss-900 border-sun-200
            dark:bg-abyss-800 dark:text-platinum-50 dark:border-abyss-700">
        <div class="max-w-7xl mx-auto px-2 sm:px-4">
            <div class="h-16 flex items-center justify-between gap-4">
                <!-- Left: menu + brand -->
                <div class="flex items-center gap-3">
                    <!-- Mobile menu -->
                    <button class="md:hidden p-2 rounded-lg text-abyss-900 hover:bg-sun-100
                    dark:text-platinum-200 dark:hover:bg-abyss-700 transition" @click="$emit('toggle-mobile-sidebar')"
                        aria-label="Toggle navigation">
                        <!-- lucide burger -->
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <!-- UPDATED: Brand Logo (SVG) and Name (Maestro) -->
                    <router-link :to="{ name: 'home' }"
                        class="flex items-center gap-2 text-xl font-extrabold tracking-wider text-kaitoke-green-600 dark:text-kaitoke-green-400">
                        <!-- SVG Icon - uses currentColor to inherit the text-kaitoke-green color -->
                        <svg class="w-6 h-6" viewBox="0 0 500 416" xmlns="http://www.w3.org/2000/svg">
                            <g>
                                <path
                                    d="m0,0h159.81l91.66,295.44L340.78,0h159.22l-115.77,415.98h-14.08l35.15-337.61-99.19,337.61h-111.63L91.8,74.3l38.63,341.68h-12.33L0,0Z"
                                    fill="currentColor" />
                                <polygon points="470.72 328.42 456.73 328.42 431.91 415.98 459.89 415.98 470.72 328.42"
                                    fill="currentColor" />
                                <polygon points="27.73 328.42 41.72 328.42 66.54 415.98 38.56 415.98 27.73 328.42"
                                    fill="currentColor" />
                                <polygon points="250 102.76 218.21 0 281.79 0 250 102.76" fill="currentColor" />
                            </g>
                        </svg>
                        Maestro
                    </router-link>

                    <!-- search (lg+) -->
                    <div class="relative hidden lg:block">
                        <input type="text" placeholder="Search organizations…" class="w-64 pl-10 pr-3 py-2 text-sm rounded-full outline-none
                    bg-white border border-sun-200 text-abyss-900
                    focus:border-kaitoke-green-500 focus:ring-1 focus:ring-kaitoke-green-500
                    dark:bg-abyss-900 dark:text-platinum-50 dark:border-abyss-700" />
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-platinum-500" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <!-- Right: quick actions -->
                <div class="flex items-center gap-2 sm:gap-3">
                    <router-link :to="{ name: 'orgs.create' }" class="hidden sm:inline-block px-3 py-2 text-sm rounded-full
                    bg-kaitoke-green-600 hover:bg-kaitoke-green-500 text-abyss-900 font-medium transition">
                        Create Org
                    </router-link>
                    <router-link :to="{ name: 'orgs.join' }" class="hidden sm:inline-block px-3 py-2 text-sm rounded-full
                    border border-sun-200 text-abyss-900 hover:bg-sun-100
                    dark:border-abyss-700 dark:text-platinum-200 dark:hover:bg-abyss-700 transition">
                        Join Org
                    </router-link>

                    <!-- Profile dropdown moved out as its own component -->
                    <ProfileDropdown />
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import ProfileDropdown from '@/components/nav/profile_dropdown.vue'
</script>