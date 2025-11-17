<script setup>
import { useRouter } from 'vue-router'
import { Frown, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

function goHome() {
    router.push({ path: '/' })
}

function goBack() {
    router.go(-1)
}
</script>

<template>
    <div
        class="min-h-screen flex items-center justify-center bg-platinum-50 dark:bg-abyss-900 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8 text-center">
            <div
                class="p-10 bg-sun-50 dark:bg-abyss-800 border border-sun-200 dark:border-abyss-700 rounded-xl shadow-2xl">

                <div class="flex justify-center mb-6">
                    <Frown class="w-16 h-16 text-sun-600 dark:text-sun-400" :stroke-width="1.5" />
                </div>

                <h1 class="text-6xl font-extrabold text-abyss-900 dark:text-platinum-50 mb-3">
                    404
                </h1>

                <h2 class="text-2xl font-semibold text-abyss-800 dark:text-platinum-100 mb-4">
                    Page Not Found
                </h2>

                <p class="mt-2 text-abyss-600 dark:text-platinum-400 text-sm">
                    Oops! The page you are looking for might have been removed, had its name changed, or is temporarily
                    unavailable.
                </p>

                <div class="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                    <button @click="goHome"
                        class="flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300
                            bg-kaitoke-green-600 hover:bg-kaitoke-green-700 dark:hover:bg-kaitoke-green-500 text-platinum-50 dark:text-abyss-900 shadow-lg shadow-kaitoke-green-500/20">
                        Go to Homepage
                    </button>
                    <button @click="goBack"
                        class="flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors
                            border border-abyss-300 dark:border-platinum-700 text-abyss-900 dark:text-platinum-200 hover:bg-sun-100 dark:hover:bg-abyss-700">
                        <ArrowLeft class="w-5 h-5 mr-2" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>