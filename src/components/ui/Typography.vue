<template>
    <div class="min-h-dvh bg-platinum-50 text-abyss-900 dark:bg-abyss-900 dark:text-platinum-50">
        <header class="sticky top-0 z-10 border-b border-platinum-300/70 dark:border-abyss-700
                       bg-white/80 dark:bg-abyss-900/80 backdrop-blur">
            <div class="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center gap-3">
                <h1 class="font-heading text-lg font-semibold">Typography Playground</h1>

                <div class="ml-auto flex flex-wrap items-center gap-2">
                    <button @click="toggleTheme"
                        class="px-3 py-1.5 rounded-lg border border-platinum-300 dark:border-abyss-700
                    text-abyss-900 dark:text-platinum-50 bg-white dark:bg-abyss-800 hover:bg-platinum-100 dark:hover:bg-abyss-700"
                        :title="isDark ? 'Switch to Light' : 'Switch to Dark'">
                        <span v-if="isDark">🌙 Dark</span>
                        <span v-else>☀️ Light</span>
                    </button>

                    <label class="flex items-center gap-2">
                        <span class="text-xs opacity-70">Font</span>
                        <select v-model="family"
                            class="px-2 py-1.5 rounded-lg border border-platinum-300 dark:border-abyss-700 bg-white dark:bg-abyss-800">
                            <option value="font-body">Body (OpenSans)</option>
                            <option value="font-heading">Heading (Poppins)</option>
                        </select>
                    </label>

                    <label class="flex items-center gap-2">
                        <span class="text-xs opacity-70">Tracking</span>
                        <select v-model="tracking"
                            class="px-2 py-1.5 rounded-lg border border-platinum-300 dark:border-abyss-700 bg-white dark:bg-abyss-800">
                            <option value="tracking-tight">tight</option>
                            <option value="tracking-normal">normal</option>
                            <option value="tracking-wide">wide</option>
                            <option value="tracking-wider">wider</option>
                            <option value="tracking-widest">widest</option>
                        </select>
                    </label>

                    <label class="flex items-center gap-2">
                        <span class="text-xs opacity-70">Width</span>
                        <select v-model="container"
                            class="px-2 py-1.5 rounded-lg border border-platinum-300 dark:border-abyss-700 bg-white dark:bg-abyss-800">
                            <option value="max-w-prose">prose</option>
                            <option value="max-w-xl">xl</option>
                            <option value="max-w-2xl">2xl</option>
                            <option value="max-w-3xl">3xl</option>
                            <option value="max-w-4xl">4xl</option>
                            <option value="max-w-5xl">5xl</option>
                        </select>
                    </label>
                </div>
            </div>
        </header>

        <main class="mx-auto w-full px-4 py-8 md:py-12">
            <div :class="['mx-auto', container, family, tracking, 'space-y-10']">

                <section class="space-y-2">
                    <h2 class="text-sm uppercase text-woodsmoke-500 dark:text-platinum-300/70">Headings (Poppins)</h2>
                    <div class="space-y-3">
                        <h1 class="text-4xl md:text-5xl font-heading font-black">H1 — Poppins Black (900)</h1>
                        <h2 class="text-3xl md:text-4xl font-heading font-extrabold">H2 — Poppins ExtraBold (800)</h2>
                        <h3 class="text-2xl md:text-3xl font-heading font-bold">H3 — Poppins Bold (700)</h3>
                        <h4 class="text-xl md:text-2xl font-heading font-semibold">H4 — Poppins SemiBold (600)</h4>
                        <h5 class="text-lg font-heading font-medium">H5 — Poppins Medium (500)</h5>
                        <h6 class="text-base font-heading font-normal">H6 — Poppins Normal (400)</h6>
                        <p class="text-sm font-heading font-light">Small Heading / Label — Poppins Light (300)</p>
                        <p class="text-sm font-heading font-thin">Tiny Heading / Label — Poppins Thin (100)</p>
                    </div>
                </section>

                ---

                <section class="space-y-4">
                    <h2 class="text-sm uppercase text-woodsmoke-500 dark:text-platinum-300/70">Copy (OpenSans)</h2>
                    <p class="text-lg text-woodsmoke-700 dark:text-platinum-200">
                        Lead — Friendly intro paragraph that uses your body font. It should balance contrast on
                        <span class="font-semibold text-abyss-900 dark:text-platinum-50">light</span> and
                        <span class="font-semibold text-platinum-50 bg-abyss-900 px-1 rounded">dark</span> backgrounds.
                    </p>
                    <p class="text-woodsmoke-700 dark:text-platinum-300">
                        Body — Lorem ipsum dolor sit amet, <a href="#"
                            class="text-kaitoke-green-600 dark:text-electric-lime-400 underline-offset-2 hover:underline">link
                            style</a>,
                        <strong>strong</strong>, <em>emphasis</em>, and <code
                            class="px-1 py-0.5 rounded bg-platinum-200 dark:bg-abyss-800">inline code</code>.
                        Small note looks like <small class="text-xs opacity-80">this one</small>.
                    </p>
                </section>

                ---

                <section class="space-y-3">
                    <h2 class="text-sm uppercase text-woodsmoke-500 dark:text-platinum-300/70">Body Copy Weights
                        (OpenSans)</h2>
                    <p class="font-extrabold">OpenSans ExtraBold (800): The quick brown fox jumps over the lazy dog.</p>
                    <p class="font-bold">OpenSans Bold (700): The quick brown fox jumps over the lazy dog.</p>
                    <p class="font-semibold">OpenSans SemiBold (600): The quick brown fox jumps over the lazy dog.</p>
                    <p class="font-medium">OpenSans Medium (500): The quick brown fox jumps over the lazy dog.</p>
                    <p class="font-normal">OpenSans Normal (400): The quick brown fox jumps over the lazy dog.</p>
                    <p class="font-light">OpenSans Light (300): The quick brown fox jumps over the lazy dog.</p>
                    <p class="font-extralight">OpenSans ExtraLight (200): The quick brown fox jumps over the lazy dog.
                    </p>
                    <p class="font-thin">OpenSans Thin (100): The quick brown fox jumps over the lazy dog.</p>
                </section>

                ---

                <section class="space-y-2">
                    <h2 class="text-sm uppercase text-woodsmoke-500 dark:text-platinum-300/70">Blockquote</h2>
                    <blockquote
                        class="border-l-4 pl-4 italic text-woodsmoke-700 dark:text-platinum-200 border-kaitoke-green-500">
                        “Design-forward, farm-focused. Real-time inventory, made human.”
                    </blockquote>
                </section>

                ---

                <section class="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 class="mb-2 text-sm uppercase text-woodsmoke-500 dark:text-platinum-300/70">Unordered list
                        </h3>
                        <ul class="list-disc pl-6 space-y-1 text-woodsmoke-700 dark:text-platinum-300">
                            <li>Responsive & accessible</li>
                            <li>Uses your custom palette</li>
                            <li>Dark mode aware</li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="mb-2 text-sm uppercase text-woodsmoke-500 dark:text-platinum-300/70">Ordered list
                        </h3>
                        <ol class="list-decimal pl-6 space-y-1 text-woodsmoke-700 dark:text-platinum-300">
                            <li>Define tokens</li>
                            <li>Apply styles</li>
                            <li>Ship ✨</li>
                        </ol>
                    </div>
                </section>

                ---

                <section class="space-y-3">
                    <h2 class="text-sm uppercase text-woodsmoke-500 dark:text-platinum-300/70">Code & Keyboard</h2>
                    <pre class="overflow-x-auto rounded-xl bg-platinum-100 dark:bg-abyss-800 p-4 text-sm">
<code>// Example token usage
.btn-primary {
    @apply bg-kaitoke-green-600 hover:bg-kaitoke-green-700 text-white rounded-lg px-3 py-2;
}</code></pre>

                    <p class="text-woodsmoke-700 dark:text-platinum-300">
                        Press <kbd
                            class="border rounded px-1.5 py-0.5 text-xs border-platinum-300 dark:border-abyss-700 bg-white dark:bg-abyss-800">Ctrl</kbd>
                        +
                        <kbd
                            class="border rounded px-1.5 py-0.5 text-xs border-platinum-300 dark:border-abyss-700 bg-white dark:bg-abyss-800">S</kbd>
                        to save your styles.
                    </p>
                </section>

                ---

                <section class="space-y-2">
                    <h2 class="text-sm uppercase text-woodsmoke-500 dark:text-platinum-300/70">Brand Colors</h2>
                    <div class="flex flex-wrap gap-2">
                        <span class="px-3 py-1 rounded-full text-xs bg-kaitoke-green-600 text-white">kaitoke-600</span>
                        <span
                            class="px-3 py-1 rounded-full text-xs bg-electric-lime-400 text-abyss-900">electric-lime-400</span>
                        <span class="px-3 py-1 rounded-full text-xs bg-sun-400 text-abyss-900">sun-400</span>
                        <span
                            class="px-3 py-1 rounded-full text-xs bg-woodsmoke-900 text-platinum-50">woodsmoke-900</span>
                        <span class="px-3 py-1 rounded-full text-xs bg-abyss-800 text-platinum-50">abyss-800</span>
                        <span class="px-3 py-1 rounded-full text-xs bg-platinum-200 text-abyss-900">platinum-200</span>
                    </div>
                </section>

            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const isDark = ref(false);
const family = ref("font-body");         // 'font-body' | 'font-heading'
const tracking = ref("tracking-normal"); // tailwind tracking classes
const container = ref("max-w-3xl");      // width presets

const applyTheme = () => {
    const el = document.documentElement;
    if (isDark.value) el.classList.add("dark");
    else el.classList.remove("dark");
};

const toggleTheme = () => {
    isDark.value = !isDark.value;
    applyTheme();
};

onMounted(() => {
    // Check local storage or system preference on mount for initial dark mode state
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme === 'dark' || (storedTheme === null && prefersDark)) {
        isDark.value = true;
    }
    applyTheme();
});
</script>