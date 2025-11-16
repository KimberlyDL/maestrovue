<!-- frontend/src/components/ui/map.vue -->
<template>
    <div class="map-wrapper">
        <!-- Map Controls Bar -->
        <div v-if="showControls"
            class="absolute top-4 left-4 z-[1000] bg-white dark:bg-abyss-800 rounded-lg shadow-lg border border-sun-200 dark:border-abyss-700 p-2 space-y-2">
            <!-- Map Type Toggle -->
            <div class="flex gap-1">
                <button v-for="layer in availableLayers" :key="layer.id" @click="changeMapLayer(layer.id)" :class="[
                    'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                    currentLayer === layer.id
                        ? 'bg-kaitoke-green-600 text-white'
                        : 'bg-platinum-100 dark:bg-abyss-700 text-abyss-700 dark:text-platinum-300 hover:bg-platinum-200 dark:hover:bg-abyss-600'
                ]" :title="layer.name">
                    {{ layer.name }}
                </button>
            </div>

            <!-- Location Tools (Admin Only) -->
            <div v-if="editable" class="pt-2 border-t border-platinum-200 dark:border-abyss-600 space-y-2">
                <button @click="toggleLocationPicker" :class="[
                    'w-full px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-2',
                    isPickingLocation
                        ? 'bg-rose-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                ]">
                    <MapPin :size="14" />
                    {{ isPickingLocation ? 'Cancel Selection' : 'Set Location' }}
                </button>

                <button v-if="hasLocation" @click="getCurrentLocation"
                    class="w-full px-3 py-1.5 text-xs font-medium rounded bg-kaitoke-green-600 text-white hover:bg-kaitoke-green-500 transition-colors flex items-center justify-center gap-2">
                    <Navigation :size="14" />
                    My Location
                </button>
            </div>

            <!-- Distance Calculator -->
            <div v-if="hasLocation && !editable"
                class="pt-2 border-t border-platinum-200 dark:border-abyss-600 space-y-2">
                <button @click="calculateDistance"
                    class="w-full px-3 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                    <Navigation :size="14" />
                    Distance from Me
                </button>
            </div>
        </div>

        <!-- Distance Display -->
        <div v-if="distanceInfo && !editable"
            class="absolute top-4 right-4 z-[1000] bg-white dark:bg-abyss-800 rounded-lg shadow-lg border border-sun-200 dark:border-abyss-700 p-3 max-w-xs">
            <div class="flex items-start gap-2">
                <Navigation :size="16" class="text-kaitoke-green-600 mt-0.5 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-abyss-900 dark:text-platinum-100 mb-1">
                        {{ distanceInfo.routeType === 'route' ? 'Route Distance' : 'Direct Distance' }}
                    </p>
                    <p class="text-lg font-bold text-kaitoke-green-600 dark:text-kaitoke-green-400">
                        {{ distanceInfo.distance }}
                    </p>
                    <p class="text-xs text-platinum-600 dark:text-platinum-400 mt-1">
                        {{ distanceInfo.duration }}
                    </p>
                    <p v-if="distanceInfo.routeType === 'route'" class="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        📍 Following roads
                    </p>
                    <p v-else class="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        ⚠️ Direct line (route unavailable)
                    </p>
                </div>
                <button @click="clearDistance"
                    class="p-1 hover:bg-platinum-100 dark:hover:bg-abyss-700 rounded transition-colors">
                    <X :size="14" class="text-platinum-600" />
                </button>
            </div>
        </div>

        <!-- Route Calculating Indicator -->
        <div v-if="isCalculatingRoute"
            class="absolute top-4 right-4 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Calculating route...
        </div>

        <!-- Location Picker Instruction -->
        <div v-if="isPickingLocation"
            class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
            Click on the map to set location
        </div>

        <!-- Map Container -->
        <div :class="containerClass" :style="containerStyle">
            <LMap ref="mapRef" :key="mapKey" :center="mapCenter" :zoom="currentZoom" :options="mapOptions"
                @ready="onMapReady" @click="onMapClick" style="height: 100%; width: 100%; display: block;" class="z-0">
                <!-- Tile Layer -->
                <LTileLayer :url="currentTileUrl" :attribution="currentAttribution" />

                <!-- Target Location Marker -->
                <LMarker v-if="hasLocation" :lat-lng="targetLatLng">
                    <LIcon :icon-url="customMarkerIcon" :icon-size="[32, 32]" :icon-anchor="[16, 32]"
                        :popup-anchor="[0, -32]" />
                    <LPopup v-if="address">
                        <div class="min-w-48 p-2">
                            <p class="font-semibold text-abyss-900 dark:text-platinum-50 mb-1">
                                {{ markerTitle || 'Location' }}
                            </p>
                            <p class="text-sm text-abyss-600 dark:text-platinum-300">{{ address }}</p>
                        </div>
                    </LPopup>
                </LMarker>

                <!-- User Location Marker -->
                <LMarker v-if="userLocation" :lat-lng="userLocationLatLng">
                    <LIcon :icon-url="userMarkerIcon" :icon-size="[32, 32]" :icon-anchor="[16, 32]"
                        :popup-anchor="[0, -32]" />
                    <LPopup>
                        <div class="p-2">
                            <p class="font-semibold text-blue-600 text-sm">Your Location</p>
                        </div>
                    </LPopup>
                </LMarker>

                <!-- Distance Route Polyline -->
                <LPolyline v-if="routeCoordinates.length > 0" :lat-lngs="routeCoordinates" :color="'#059669'"
                    :weight="4" :opacity="0.7" />
            </LMap>
        </div>

        <!-- Location Info Badge (when not editing) -->
        <div v-if="address && !editable"
            class="mt-3 flex items-start gap-2 p-3 bg-sun-50 dark:bg-abyss-800/50 rounded-lg border border-sun-200 dark:border-abyss-700">
            <MapPin :size="20" class="text-kaitoke-green-600 dark:text-kaitoke-green-400 flex-shrink-0 mt-0.5" />
            <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-abyss-600 dark:text-platinum-400 uppercase tracking-wide">
                    {{ markerTitle || 'Address' }}
                </p>
                <p class="text-sm text-abyss-700 dark:text-platinum-300 mt-1 break-words">{{ address }}</p>
            </div>
        </div>

        <!-- Coordinate Input (Admin Edit Mode) -->
        <div v-if="editable" class="mt-3 space-y-3">
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-medium text-abyss-700 dark:text-platinum-300 mb-1">
                        Latitude
                    </label>
                    <input v-model.number="editableLat" @input="updateFromInput" type="number" step="0.0000001"
                        placeholder="e.g., 14.6760"
                        class="w-full px-3 py-2 text-sm rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-100 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-abyss-700 dark:text-platinum-300 mb-1">
                        Longitude
                    </label>
                    <input v-model.number="editableLng" @input="updateFromInput" type="number" step="0.0000001"
                        placeholder="e.g., 121.0437"
                        class="w-full px-3 py-2 text-sm rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-100 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500" />
                </div>
            </div>

            <div>
                <label class="block text-xs font-medium text-abyss-700 dark:text-platinum-300 mb-1">
                    Address
                </label>
                <input v-model="editableAddress" @input="emitChanges" type="text" placeholder="Enter address"
                    class="w-full px-3 py-2 text-sm rounded-lg border border-platinum-300 dark:border-abyss-600 bg-white dark:bg-abyss-900 text-abyss-900 dark:text-platinum-100 focus:outline-none focus:ring-2 focus:ring-kaitoke-green-500" />
            </div>

            <p class="text-xs text-platinum-600 dark:text-platinum-400">
                💡 Tip: Click "Set Location" and click on the map, or enter coordinates manually
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup, LIcon, LPolyline } from '@vue-leaflet/vue-leaflet'
import { MapPin, Navigation, X } from 'lucide-vue-next'
import L from 'leaflet'

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

const props = defineProps({
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    zoom: { type: Number, default: 15 },
    address: { type: String, default: '' },
    markerTitle: { type: String, default: 'Location' },
    height: { type: String, default: '400px' },
    editable: { type: Boolean, default: false },
    showControls: { type: Boolean, default: true },
    containerClass: { type: String, default: 'map-container rounded-lg overflow-hidden shadow-md border border-sun-200 dark:border-abyss-700' }
})

const emit = defineEmits(['update:lat', 'update:lng', 'update:address', 'location-changed'])

// Map state
const mapRef = ref(null)
const mapKey = ref(0)
const currentZoom = ref(props.zoom)
const isPickingLocation = ref(false)
const userLocation = ref(null)
const distanceInfo = ref(null)
const routeCoordinates = ref([])
const isCalculatingRoute = ref(false)

// Editable values
const editableLat = ref(props.lat)
const editableLng = ref(props.lng)
const editableAddress = ref(props.address)

// Map layer state
const currentLayer = ref('standard')

const availableLayers = [
    {
        id: 'standard',
        name: 'Standard',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    {
        id: 'terrain',
        name: 'Terrain',
        url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
    },
    {
        id: 'satellite',
        name: 'Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    {
        id: 'topo',
        name: 'Topo',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }
]

const currentTileUrl = computed(() => {
    return availableLayers.find(l => l.id === currentLayer.value)?.url || availableLayers[0].url
})

const currentAttribution = computed(() => {
    return availableLayers.find(l => l.id === currentLayer.value)?.attribution || availableLayers[0].attribution
})

const hasLocation = computed(() => {
    return editableLat.value !== null && editableLng.value !== null &&
        !isNaN(editableLat.value) && !isNaN(editableLng.value)
})

const mapCenter = computed(() => {
    if (hasLocation.value) {
        return [editableLat.value, editableLng.value]
    }
    // Default to Manila, Philippines
    return [14.5995, 120.9842]
})

const targetLatLng = computed(() => {
    if (!hasLocation.value) return null
    return L.latLng(editableLat.value, editableLng.value)
})

const userLocationLatLng = computed(() => {
    if (!userLocation.value) return null
    return L.latLng(userLocation.value.lat, userLocation.value.lng)
})

const distanceLine = computed(() => {
    if (!userLocation.value || !hasLocation.value) return []
    return [
        [userLocation.value.lat, userLocation.value.lng],
        [editableLat.value, editableLng.value]
    ]
})

const containerStyle = computed(() => ({
    height: props.height,
    width: '100%',
    position: 'relative'
}))

const mapOptions = {
    zoomControl: false, // We'll add it manually to control position
    attributionControl: true
}

// Custom marker icons using data URIs
const customMarkerIcon = computed(() => {
    const svg = `
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2C11.589 2 8 5.589 8 10c0 6 8 18 8 18s8-12 8-18c0-4.411-3.589-8-8-8z" 
                  fill="#059669" stroke="#fff" stroke-width="2"/>
            <circle cx="16" cy="10" r="3" fill="#fff"/>
        </svg>
    `
    return 'data:image/svg+xml;base64,' + btoa(svg)
})

const userMarkerIcon = computed(() => {
    const svg = `
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="8" fill="#3b82f6" stroke="#fff" stroke-width="3"/>
            <circle cx="16" cy="16" r="4" fill="#fff"/>
        </svg>
    `
    return 'data:image/svg+xml;base64,' + btoa(svg)
})

// Watch for prop changes
watch(() => [props.lat, props.lng, props.address], ([newLat, newLng, newAddress]) => {
    editableLat.value = newLat
    editableLng.value = newLng
    editableAddress.value = newAddress
}, { immediate: true })

function changeMapLayer(layerId) {
    currentLayer.value = layerId
    // Force map refresh
    nextTick(() => {
        mapRef.value?.leafletObject?.invalidateSize()
    })
}

function toggleLocationPicker() {
    isPickingLocation.value = !isPickingLocation.value
    if (isPickingLocation.value && mapRef.value?.leafletObject) {
        mapRef.value.leafletObject.getContainer().style.cursor = 'crosshair'
    } else if (mapRef.value?.leafletObject) {
        mapRef.value.leafletObject.getContainer().style.cursor = ''
    }
}

function onMapReady() {
    nextTick(() => {
        if (mapRef.value?.leafletObject) {
            mapRef.value.leafletObject.invalidateSize()
        }
    })
}

function onMapClick(event) {
    if (!props.editable || !isPickingLocation.value) return

    const { lat, lng } = event.latlng
    editableLat.value = parseFloat(lat.toFixed(7))
    editableLng.value = parseFloat(lng.toFixed(7))

    // Reverse geocode to get address (simplified)
    reverseGeocode(lat, lng)

    isPickingLocation.value = false
    if (mapRef.value?.leafletObject) {
        mapRef.value.leafletObject.getContainer().style.cursor = ''
    }

    emitChanges()
}

async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        )
        const data = await response.json()
        if (data.display_name) {
            editableAddress.value = data.display_name
            emitChanges()
        }
    } catch (error) {
        console.error('Reverse geocode failed:', error)
    }
}

function updateFromInput() {
    if (hasLocation.value) {
        // Center map on new coordinates
        nextTick(() => {
            if (mapRef.value?.leafletObject) {
                mapRef.value.leafletObject.setView([editableLat.value, editableLng.value], currentZoom.value)
            }
        })
    }
    emitChanges()
}

function emitChanges() {
    emit('update:lat', editableLat.value)
    emit('update:lng', editableLng.value)
    emit('update:address', editableAddress.value)
    emit('location-changed', {
        lat: editableLat.value,
        lng: editableLng.value,
        address: editableAddress.value
    })
}

async function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser')
        return
    }

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
        })

        const lat = position.coords.latitude
        const lng = position.coords.longitude

        userLocation.value = { lat, lng }

        if (props.editable) {
            editableLat.value = parseFloat(lat.toFixed(7))
            editableLng.value = parseFloat(lng.toFixed(7))
            await reverseGeocode(lat, lng)
            emitChanges()
        }

        // Center map on user location
        if (mapRef.value?.leafletObject) {
            mapRef.value.leafletObject.setView([lat, lng], 15)
        }
    } catch (error) {
        alert('Unable to get your location: ' + error.message)
    }
}

async function calculateDistance() {
    if (!hasLocation.value) {
        alert('No target location set')
        return
    }

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            })
        })

        const userLat = position.coords.latitude
        const userLng = position.coords.longitude

        userLocation.value = { lat: userLat, lng: userLng }

        // Show calculating indicator
        isCalculatingRoute.value = true
        routeCoordinates.value = []
        distanceInfo.value = null

        try {
            // Try to get actual route using OSRM (Open Source Routing Machine)
            const routeData = await fetchRoutingData(userLat, userLng, editableLat.value, editableLng.value)

            if (routeData && routeData.routes && routeData.routes.length > 0) {
                const route = routeData.routes[0]

                // Extract route coordinates
                const coordinates = decodePolyline(route.geometry)
                routeCoordinates.value = coordinates

                // Get distance and duration from route
                const distanceKm = route.distance / 1000
                const durationSeconds = route.duration

                distanceInfo.value = {
                    distance: distanceKm < 1
                        ? `${Math.round(distanceKm * 1000)} m`
                        : `${distanceKm.toFixed(2)} km`,
                    duration: formatDuration(durationSeconds),
                    routeType: 'route'
                }

                // Fit map to show route
                if (mapRef.value?.leafletObject && coordinates.length > 0) {
                    const bounds = L.latLngBounds(coordinates)
                    mapRef.value.leafletObject.fitBounds(bounds, { padding: [50, 50] })
                }
            } else {
                // Fallback to straight-line distance
                throw new Error('Route not found')
            }
        } catch (routingError) {
            console.warn('Routing failed, falling back to straight-line distance:', routingError)

            // Calculate straight-line distance as fallback
            const distance = calculateHaversineDistance(
                userLat, userLng,
                editableLat.value, editableLng.value
            )

            // Set straight line
            routeCoordinates.value = [
                [userLat, userLng],
                [editableLat.value, editableLng.value]
            ]

            // Estimate duration (assuming average speed of 50 km/h)
            const durationHours = distance / 50
            const durationMinutes = Math.round(durationHours * 60)

            distanceInfo.value = {
                distance: distance < 1
                    ? `${Math.round(distance * 1000)} m`
                    : `${distance.toFixed(2)} km`,
                duration: durationMinutes < 60
                    ? `~${durationMinutes} min`
                    : `~${Math.round(durationHours * 10) / 10} hr`,
                routeType: 'straight'
            }

            // Fit map to show both markers
            if (mapRef.value?.leafletObject) {
                const bounds = L.latLngBounds([
                    [userLat, userLng],
                    [editableLat.value, editableLng.value]
                ])
                mapRef.value.leafletObject.fitBounds(bounds, { padding: [50, 50] })
            }
        }
    } catch (error) {
        alert('Unable to get your location: ' + error.message)
    } finally {
        isCalculatingRoute.value = false
    }
}

/**
 * Fetch routing data from OSRM API
 * Uses OpenStreetMap routing service
 */
async function fetchRoutingData(fromLat, fromLng, toLat, toLng) {
    try {
        // OSRM demo server (for production, consider self-hosting or paid service)
        const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=polyline`

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Routing request failed')
        }

        const data = await response.json()

        if (data.code !== 'Ok') {
            throw new Error('No route found')
        }

        return data
    } catch (error) {
        console.error('OSRM routing error:', error)
        throw error
    }
}

/**
 * Decode OSRM polyline format to lat/lng coordinates
 */
function decodePolyline(encoded) {
    const coordinates = []
    let index = 0
    let lat = 0
    let lng = 0

    while (index < encoded.length) {
        let b
        let shift = 0
        let result = 0

        do {
            b = encoded.charCodeAt(index++) - 63
            result |= (b & 0x1f) << shift
            shift += 5
        } while (b >= 0x20)

        const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
        lat += dlat

        shift = 0
        result = 0

        do {
            b = encoded.charCodeAt(index++) - 63
            result |= (b & 0x1f) << shift
            shift += 5
        } while (b >= 0x20)

        const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
        lng += dlng

        coordinates.push([lat / 1e5, lng / 1e5])
    }

    return coordinates
}

/**
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
        return `${hours} hr ${minutes} min`
    }
    return `${minutes} min`
}

function clearDistance() {
    distanceInfo.value = null
    routeCoordinates.value = []
    userLocation.value = null
}

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth's radius in km
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function toRad(degrees) {
    return degrees * (Math.PI / 180)
}

defineExpose({
    getCurrentLocation,
    calculateDistance,
    clearDistance,
    setLocation: (lat, lng, address) => {
        editableLat.value = lat
        editableLng.value = lng
        editableAddress.value = address
        emitChanges()
    }
})
</script>

<style scoped>
.map-wrapper {
    width: 100%;
    position: relative;
}

.map-container {
    width: 100%;
    display: block;
}

:deep(.leaflet-container) {
    font-family: inherit;
}

:deep(.leaflet-popup-content-wrapper) {
    border-radius: 0.5rem;
}

:deep(.leaflet-popup-content) {
    margin: 0;
}
</style>