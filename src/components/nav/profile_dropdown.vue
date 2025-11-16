<!-- src/components/nav/profile_dropdown.vue -->
<template>
    <div class="relative">
        <button @click.stop="open = !open" type="button" :aria-expanded="open" class="group flex items-center gap-2 rounded-full bg-sun-100 p-1 pr-2
             hover:bg-sun-200 text-abyss-900
             dark:bg-abyss-700 dark:hover:bg-abyss-600 dark:text-platinum-200 transition">
            <img :src="avatar" :alt="name" class="h-8 w-8 rounded-full object-cover border border-kaitoke-green-600" />
            <span class="hidden md:inline text-sm font-medium">{{ name }}</span>
            <svg class="w-4 h-4 text-platinum-600 group-hover:text-kaitoke-green-500 transition" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>

        <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="open" class="absolute right-0 mt-2 w-64 rounded-lg shadow-2xl ring-1 ring-white/5
                  bg-white text-abyss-900 dark:bg-abyss-800 dark:text-platinum-100">
                <div class="px-4 py-3 border-b border-sun-200 dark:border-abyss-700">
                    <p class="text-sm font-semibold truncate">{{ name }}</p>
                    <p class="text-xs text-platinum-500 truncate">{{ email }}</p>
                </div>
                <button type="button" @click="goProfile"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-sun-100 dark:hover:bg-abyss-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2" />
                    </svg>
                    Profile Settings
                </button>
                <button type="button" @click="logout"
                    class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-sun-100 dark:hover:bg-abyss-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 16l4-4-4-4M7 12h14M7 8v8" />
                    </svg>
                    Logout
                </button>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@stores/auth'

const open = ref(false)
const router = useRouter()
const auth = useAuthStore()

const name = computed(() => auth.user?.name || 'User')
const email = computed(() => auth.user?.email || '—')
const avatar = computed(() => auth.user?.avatar || 'https://via.placeholder.com/40/1f2937/FFFFFF?text=U')

function onClickAway(e) {
    const hdr = document.getElementById('main-header')
    if (hdr && !hdr.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('click', onClickAway))
onUnmounted(() => document.removeEventListener('click', onClickAway))

function goProfile() {
    open.value = false
    router.push({ name: 'profile-settings' }).catch(() => router.push('/profile'))
}
async function logout() {
    try { await auth.logout?.() } finally {
        open.value = false
        router.push({ name: 'login' })
    }
}
</script>
