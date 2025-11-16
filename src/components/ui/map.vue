<script setup>
import { computed } from 'vue'

// FIX: Import the Leaflet components using their common 'L' prefix.
// The exact import statement depends on your project's main configuration 
// (e.g., if they are globally registered in main.js/ts), 
// but for component-level import, this is usually the correct naming convention
// when the dependency is installed.
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'

// Define props with defaults
const props = defineProps({
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    zoom: {
        type: Number,
        default: 13
    },
    showMarker: {
        type: Boolean,
        default: true
    },
    address: {
        type: String,
        default: ''
    },
    height: {
        type: String,
        default: '300px'
    }
})

// Computed center for the map (reactive to props)
const center = computed(() => [props.lat, props.lng])

// Map tile settings (free OpenStreetMap)
const url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
</script>

<template>
    <div class="map-container">
        <div :style="{ height: height }" class="border border-abyss-700 rounded-md overflow-hidden">
            <LMap :center="center" :zoom="zoom" :minZoom="1" style="height: 100%; width: 100%;">
                <LTileLayer :url="url" :attribution="attribution" />

                <LMarker v-if="showMarker" :lat-lng="center" />
            </LMap>
        </div>
        <p v-if="address" class="mt-2 text-sm text-platinum-400">
            **Location:** {{ address }}
        </p>
    </div>
</template>

<style scoped>
/* You may still need to globally import the Leaflet CSS file in your main entry point (main.js/ts):
   import 'leaflet/dist/leaflet.css'; 
*/
</style>