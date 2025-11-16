<template>
    <div
        class="min-h-screen bg-gradient-to-b from-platinum-50 to-platinum-100 dark:from-abyss-900 dark:to-abyss-950 text-abyss-900 dark:text-platinum-50 transition-colors">
        <!-- Navigation -->
        <nav
            class="sticky top-0 z-40 border-b border-sun-500 dark:border-abyss-700 bg-platinum-50/95 dark:bg-abyss-900/95 backdrop-blur-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <svg class="w-8 h-8" viewBox="0 0 500 416" xmlns="http://www.w3.org/2000/svg">
                        <g>
                            <path
                                d="m0,0h159.81l91.66,295.44L340.78,0h159.22l-115.77,415.98h-14.08l35.15-337.61-99.19,337.61h-111.63L91.8,74.3l38.63,341.68h-12.33L0,0Z"
                                fill="#0ed964" />
                            <polygon points="470.72 328.42 456.73 328.42 431.91 415.98 459.89 415.98 470.72 328.42"
                                fill="#0ed964" />
                            <polygon points="27.73 328.42 41.72 328.42 66.54 415.98 38.56 415.98 27.73 328.42"
                                fill="#0ed964" />
                            <polygon points="250 102.76 218.21 0 281.79 0 250 102.76" fill="#0ed964" />
                        </g>
                    </svg>
                    <span class="font-heading text-xl font-bold">Maestro</span>
                </div>

                <div class="hidden md:flex items-center gap-8 text-sm">
                    <a href="#features"
                        class="hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition">Features</a>
                    <a href="#how" class="hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition">How
                        it works</a>
                </div>

                <div class="flex items-center gap-3">
                    <router-link :to="{ name: 'signup' }"
                        class="text-sm font-medium hover:text-kaitoke-green-600 dark:hover:text-kaitoke-green-400 transition">Sign
                        in
                    </router-link>
                    <router-link :to="{ name: 'login' }"
                        class="bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                        Create account
                    </router-link>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto">
                <!-- Decorative elements -->
                <div
                    class="absolute top-10 left-0 w-96 h-96 bg-kaitoke-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5 animate-blob">
                </div>
                <div
                    class="absolute top-40 right-0 w-96 h-96 bg-electric-lime-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5 animate-blob animation-delay-2000">
                </div>

                <div class="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <!-- Left: Logo and Title -->
                    <div class="flex flex-col items-start gap-8">
                        <div class="flex self-center md:self-center lg:self-start items-center gap-4">
                            <svg class="w-24 h-24" viewBox="0 0 500 416" xmlns="http://www.w3.org/2000/svg">
                                <g>
                                    <path
                                        d="m0,0h159.81l91.66,295.44L340.78,0h159.22l-115.77,415.98h-14.08l35.15-337.61-99.19,337.61h-111.63L91.8,74.3l38.63,341.68h-12.33L0,0Z"
                                        fill="#0ed964" />
                                    <polygon
                                        points="470.72 328.42 456.73 328.42 431.91 415.98 459.89 415.98 470.72 328.42"
                                        fill="#0ed964" />
                                    <polygon points="27.73 328.42 41.72 328.42 66.54 415.98 38.56 415.98 27.73 328.42"
                                        fill="#0ed964" />
                                    <polygon points="250 102.76 218.21 0 281.79 0 250 102.76" fill="#0ed964" />
                                </g>
                            </svg>
                        </div>

                        <div class="space-y-6">
                            <div>
                                <h1 class="font-heading text-5xl md:text-6xl font-bold leading-tight mb-4">
                                    Collaborate,
                                    <span class="text-kaitoke-green-600 dark:text-kaitoke-green-400">organize,</span>
                                    <br />
                                    approve.
                                </h1>
                                <p class="text-lg text-abyss-600 dark:text-platinum-300 max-w-xl font-body">
                                    The platform for student orgs to manage documents, chat, and streamline approvals.
                                </p>
                            </div>

                            <div class="flex gap-3 pt-4">
                                <button
                                    class="bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white px-6 py-3 rounded-lg font-medium transition">
                                    Create account
                                </button>
                                <button
                                    class="border-2 border-sun-500 dark:border-platinum-400 text-abyss-900 dark:text-platinum-50 hover:bg-sun-100 dark:hover:bg-abyss-800 px-6 py-3 rounded-lg font-medium transition">
                                    Sign in
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Visual Element -->
                    <div class="relative hidden lg:block">
                        <!-- <svg class="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" x="20" y="20" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="2" fill="#0ed964" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#dots)"/>
              <rect x="50" y="50" width="300" height="300" fill="none" stroke="#0ed964" stroke-width="2" opacity="0.5"/>
            </svg> -->
                        <div class="relative w-full aspect-square">
                            <!-- Grid pattern -->
                            <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                <defs>
                                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0ed964" strokeWidth="0.5"
                                            opacity="0.2" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                            </svg>

                            <!-- Content boxes -->
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="space-y-4 w-4/5">
                                    <div
                                        class="h-24 bg-gradient-to-r from-kaitoke-green-400 to-kaitoke-green-500 rounded-lg opacity-80 dark:opacity-60">
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div class="h-16 bg-electric-lime-400 rounded-lg opacity-80 dark:opacity-60">
                                        </div>
                                        <div class="h-16 bg-sun-400 rounded-lg opacity-80 dark:opacity-60"></div>
                                    </div>
                                    <div class="h-20 bg-kaitoke-green-300 rounded-lg opacity-80 dark:opacity-60"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="py-20 px-4 sm:px-6 lg:px-8 border-y border-sun-500 dark:border-abyss-700">
            <div class="max-w-6xl mx-auto">
                <h2 class="font-heading text-4xl font-bold text-center mb-16">Features</h2>

                <div class="grid md:grid-cols-3 gap-8">
                    <div class="space-y-3">
                        <div
                            class="w-12 h-12 bg-kaitoke-green-100 dark:bg-kaitoke-green-900/30 rounded-lg flex items-center justify-center">
                            <FileText class="w-6 h-6 text-kaitoke-green-600 dark:text-kaitoke-green-400" />
                        </div>
                        <h3 class="font-heading text-xl font-semibold">Documents</h3>
                        <p class="text-abyss-600 dark:text-platinum-300 font-body">Organize, version, and share files
                            securely with your team.</p>
                    </div>

                    <div class="space-y-3">
                        <div
                            class="w-12 h-12 bg-electric-lime-100 dark:bg-electric-lime-900/30 rounded-lg flex items-center justify-center">
                            <MessageSquare class="w-6 h-6 text-electric-lime-700 dark:text-electric-lime-400" />
                        </div>
                        <h3 class="font-heading text-xl font-semibold">Chat</h3>
                        <p class="text-abyss-600 dark:text-platinum-300 font-body">Real-time messaging and collaboration
                            for faster decisions.</p>
                    </div>

                    <div class="space-y-3">
                        <div
                            class="w-12 h-12 bg-sun-100 dark:bg-sun-900/30 rounded-lg flex items-center justify-center">
                            <CheckCircle class="w-6 h-6 text-sun-700 dark:text-sun-400" />
                        </div>
                        <h3 class="font-heading text-xl font-semibold">Approvals</h3>
                        <p class="text-abyss-600 dark:text-platinum-300 font-body">Streamline workflows with clear
                            approval processes and audit trails.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- How it Works Section -->
        <section id="how" class="py-20 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto">
                <h2 class="font-heading text-4xl font-bold text-center mb-16">How it works</h2>

                <div class="grid md:grid-cols-4 gap-6">
                    <div class="relative">
                        <div class="flex flex-col items-center text-center space-y-4">
                            <div
                                class="w-14 h-14 rounded-full bg-kaitoke-green-600 text-white flex items-center justify-center font-heading font-bold text-xl">
                                1</div>
                            <div>
                                <h3 class="font-heading font-semibold mb-2">Register</h3>
                                <p class="text-sm text-abyss-600 dark:text-platinum-300 font-body">Create your account
                                    in seconds.</p>
                            </div>
                        </div>
                        <!-- {/* <div
                            class="hidden md:block absolute top-7 left-full w-8 h-0.5 bg-gradient-to-r from-kaitoke-green-400 to-transparent">
                        </div> */} -->
                    </div>

                    <div class="relative">
                        <div class="flex flex-col items-center text-center space-y-4">
                            <div
                                class="w-14 h-14 rounded-full bg-electric-lime-600 text-white flex items-center justify-center font-heading font-bold text-xl">
                                2</div>
                            <div>
                                <h3 class="font-heading font-semibold mb-2">Create or Join</h3>
                                <p class="text-sm text-abyss-600 dark:text-platinum-300 font-body">Start an org or join
                                    existing teams.</p>
                            </div>
                        </div>
                    </div>

                    <div class="relative">
                        <div class="flex flex-col items-center text-center space-y-4">
                            <div
                                class="w-14 h-14 rounded-full bg-sun-600 text-white flex items-center justify-center font-heading font-bold text-xl">
                                3</div>
                            <div>
                                <h3 class="font-heading font-semibold mb-2">Collaborate</h3>
                                <p class="text-sm text-abyss-600 dark:text-platinum-300 font-body">Chat, share docs, and
                                    plan together.</p>
                            </div>
                        </div>
                    </div>

                    <div class="relative">
                        <div class="flex flex-col items-center text-center space-y-4">
                            <div
                                class="w-14 h-14 rounded-full bg-kaitoke-green-600 text-white flex items-center justify-center font-heading font-bold text-xl">
                                4</div>
                            <div>
                                <h3 class="font-heading font-semibold mb-2">Approve</h3>
                                <p class="text-sm text-abyss-600 dark:text-platinum-300 font-body">Get proposals
                                    approved with clear tracking.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section
            class="py-20 px-4 sm:px-6 lg:px-8 bg-kaitoke-green-50 dark:bg-kaitoke-green-950/20 border-t border-sun-500 dark:border-kaitoke-green-900">
            <div class="max-w-4xl mx-auto text-center">
                <h2 class="font-heading text-4xl font-bold mb-4">Ready to get started?</h2>
                <p class="text-lg text-abyss-600 dark:text-platinum-300 mb-8 font-body">Join student organizations
                    managing their workflow on Maestro.</p>

                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <!-- <button
                        class="bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white px-8 py-3 rounded-lg font-medium transition">
                        Create account
                    </button> -->
                    <router-link :to="{ name: 'signup' }"
                        class="bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white px-8 py-3 rounded-lg font-medium transition">
                        Create account
                    </router-link>
                    <router-link :to="{ name: 'login' }"
                        class="border-2 border-sun-500 dark:border-platinum-400 text-abyss-900 dark:text-platinum-50 hover:bg-sun-100 dark:hover:bg-abyss-800 px-8 py-3 rounded-lg font-medium transition">
                        Sign in
                    </router-link>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer
            class="border-t border-sun-500 dark:border-abyss-700 bg-platinum-50 dark:bg-abyss-900 py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-6xl mx-auto text-center">
                <div class="flex items-center justify-center gap-2 mb-4">
                    <svg class="w-6 h-6" viewBox="0 0 500 416" xmlns="http://www.w3.org/2000/svg">
                        <g>
                            <path
                                d="m0,0h159.81l91.66,295.44L340.78,0h159.22l-115.77,415.98h-14.08l35.15-337.61-99.19,337.61h-111.63L91.8,74.3l38.63,341.68h-12.33L0,0Z"
                                fill="#0ed964" />
                            <polygon points="470.72 328.42 456.73 328.42 431.91 415.98 459.89 415.98 470.72 328.42"
                                fill="#0ed964" />
                            <polygon points="27.73 328.42 41.72 328.42 66.54 415.98 38.56 415.98 27.73 328.42"
                                fill="#0ed964" />
                            <polygon points="250 102.76 218.21 0 281.79 0 250 102.76" fill="#0ed964" />
                        </g>
                    </svg>
                    <span class="font-heading font-bold">Maestro</span>
                </div>
                <p class="text-sm text-abyss-600 dark:text-platinum-400 font-body">© 2025 Maestro. Built for student
                    organizations.</p>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { FileText, MessageSquare, CheckCircle } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
</script>

<style scoped>
@keyframes blob {

    0%,
    100% {
        transform: translate(0, 0) scale(1);
    }

    33% {
        transform: translate(30px, -50px) scale(1.1);
    }

    66% {
        transform: translate(-20px, 20px) scale(0.9);
    }
}

.animate-blob {
    animation: blob 7s infinite;
}

.animation-delay-2000 {
    animation-delay: 2s;
}

.font-heading {
    font-family: 'Poppins', sans-serif;
}

.font-body {
    font-family: 'OpenSans', sans-serif;
}
</style>
