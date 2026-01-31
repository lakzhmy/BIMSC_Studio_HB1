<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-200">
      <div class="h-16 px-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold">Lung Tower Studio</h1>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-100">
            <UserAvatar size="32px" />
            <div class="text-sm">
              <p class="font-semibold">{{ userStore.currentUser.name }}</p>
              <p class="text-xs text-slate-600 capitalize">{{ userStore.selectedTeam }} Team</p>
            </div>
          </div>
          <button @click="$router.push('/profile')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium">Profile</button>
          <button @click="handleLogout" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium">Logout</button>
        </div>
      </div>
      <div class="border-t px-6 flex gap-1 overflow-x-auto border-slate-200">
        <router-link v-for="item in navigationItems" :key="item.path" :to="item.path" :class="['px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap', isActiveRoute(item.path) ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900']">{{ item.label }}</router-link>
      </div>
    </header>
    <main class="py-8 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-slate-900">3D Building Viewer</h1>
          <p class="text-slate-600 mt-1">Click on the tower to add sticky notes • Use the timeline to travel through versions</p>
        </div>

        <!-- Main Viewer Area -->
        <div class="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col" style="height: 700px;">
          <!-- 3D Canvas -->
          <div ref="canvasContainer" class="flex-1 relative">
            <canvas ref="canvas" class="w-full h-full"></canvas>
            
            <!-- Instructions Overlay -->
            <div class="absolute top-4 left-4 bg-slate-900/80 text-white text-xs rounded-lg p-3 max-w-xs">
              <p class="font-semibold mb-2">3D Tower Controls:</p>
              <ul class="space-y-1 text-slate-300">
                <li>• <strong>Drag</strong> to rotate</li>
                <li>• <strong>Scroll</strong> to zoom (Rhino-style)</li>
                <li>• <strong>Click</strong> to add annotation</li>
                <li>• <strong>Hover</strong> point to see annotation</li>
              </ul>
            </div>

            <!-- Annotation Input Modal -->
            <div
              v-if="showAnnotationInput"
              class="absolute inset-0 bg-black/40 flex items-center justify-center z-50"
              @click.self="cancelAnnotation"
            >
              <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
                <h3 class="text-lg font-semibold text-slate-900 mb-2">Add Annotation</h3>
                <p class="text-sm text-slate-600 mb-4">
                  Level {{ pendingAnnotation.floor }} - {{ pendingAnnotation.zone }}
                </p>
                <textarea
                  v-model="pendingAnnotation.text"
                  class="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-4"
                  placeholder="Enter your annotation text..."
                ></textarea>
                
                <!-- Team Selection Dropdown -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-slate-700 mb-2">Assign to Team:</label>
                  <select
                    v-model="pendingAnnotation.team"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option v-for="team in teamOptions" :key="team.value" :value="team.value">
                      {{ team.label }}
                    </option>
                  </select>
                </div>
                
                <div class="flex gap-3">
                  <button
                    @click="cancelAnnotation"
                    class="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-medium transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    @click="saveAnnotation"
                    class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            <!-- 3D Annotation Hover Tooltip -->
            <div
              v-if="hoveredAnnotationIdx !== null"
              class="absolute text-white text-xs rounded-lg p-3 shadow-xl z-20 cursor-pointer transition-opacity hover:opacity-90"
              :style="{ 
                left: hoveredAnnotationPos.x + 'px', 
                top: hoveredAnnotationPos.y + 'px', 
                transform: 'translate(-50%, -100%)',
                backgroundColor: hoveredAnnotationColor
              }"
              @click="removeNote(hoveredAnnotationIdx)"
            >
              <div class="font-semibold whitespace-nowrap">L{{ stickyNotes.value[hoveredAnnotationIdx].floor }} - {{ stickyNotes.value[hoveredAnnotationIdx].zone }}</div>
              <div class="text-white/90 text-xs mt-2 max-w-xs">{{ stickyNotes.value[hoveredAnnotationIdx].text }}</div>
              <div class="text-white/70 text-xs mt-2 whitespace-nowrap">{{ new Date(stickyNotes.value[hoveredAnnotationIdx].timestamp).toLocaleString() }}</div>
              <div class="text-white/60 text-xs mt-2 whitespace-nowrap font-medium">(Click to delete)</div>
            </div>
          </div>
          <div class="bg-slate-100 border-t border-slate-200 p-6">
            <div class="flex flex-col gap-4">
              <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span class="text-sm font-medium text-slate-700 whitespace-nowrap">Timeline:</span>
                <input
                  v-model.number="currentVersion"
                  type="range"
                  min="1"
                  max="10"
                  class="flex-1 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                  @input="updateModelVersion"
                />
                <div class="text-sm font-semibold text-slate-900 bg-white px-4 py-2 rounded-lg min-w-fit text-center">
                  Version {{ currentVersion }} / 10
                </div>
              </div>
              <div class="text-sm text-slate-700">
                <span class="font-medium block mb-1">Showing:</span>
                <span class="font-semibold text-slate-900 text-base">{{ versionLabels[currentVersion - 1] }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Panel -->
        <div class="grid grid-cols-3 gap-4 mt-6">
          <div class="bg-white p-4 rounded-lg border border-slate-200">
            <h4 class="font-semibold text-slate-900 mb-2">Current View</h4>
            <p class="text-sm text-slate-600">
              Rotation: {{ modelRotation.x.toFixed(2) }} rad, {{ modelRotation.y.toFixed(2) }} rad
            </p>
            <p class="text-sm text-slate-600 mt-1">
              Zoom: {{ zoomLevel.toFixed(2) }}x
            </p>
          </div>
          <div class="bg-white p-4 rounded-lg border border-slate-200">
            <h4 class="font-semibold text-slate-900 mb-2">Annotations</h4>
            <p class="text-sm text-slate-600">
              Total sticky notes: <span class="font-semibold">{{ stickyNotes.length }}</span>
            </p>
            <p class="text-sm text-slate-600 mt-1">
              Click on tower to add more
            </p>
          </div>
          <div class="bg-white p-4 rounded-lg border border-slate-200">
            <h4 class="font-semibold text-slate-900 mb-2">Model Info</h4>
            <p class="text-sm text-slate-600">
              Status: <span class="font-semibold text-green-600">Active</span>
            </p>
            <p class="text-sm text-slate-600 mt-1">
              Geometry: 200-Level Tower
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import UserAvatar from '@/components/UserAvatar.vue'

const router = useRouter()
const userStore = useUserStore()

const canvas = ref(null)
const canvasContainer = ref(null)
const currentVersion = ref(1)
const stickyNotes = ref([])
const annotation3DMarkers = ref([]) // 3D markers
const nextMarkerId = ref(0)
const hoveredAnnotationIdx = ref(null)
const hoveredAnnotationPos = ref({ x: 0, y: 0 })
const hoveredAnnotationColor = ref('#000000')
const modelRotation = ref({ x: 0, y: 0 })
const zoomLevel = ref(1)
const userColor = ref('#3b82f6')
const showAnnotationInput = ref(false)
const pendingAnnotation = ref({ floor: 0, zone: '', text: '', x: 0, y: 0, z: 0, team: 'data', point: null })

const teamOptions = [
  { label: 'Data', value: 'data', color: '#ef4444' },
  { label: 'Structure', value: 'structure', color: '#22c55e' },
  { label: 'Program', value: 'program', color: '#3b82f6' }
]

const versionLabels = [
  'Foundation Phase',
  'Structural Core',
  'Lower Levels (1-50)',
  'Mid Levels (51-100)',
  'Upper Levels (101-150)',
  'Top Levels (151-200)',
  'MEP Installation',
  'Interior Finishes',
  'Systems Testing',
  'Final Review'
]

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/kpi', label: 'KPI Dashboard' },
  { path: '/meetings', label: 'Meetings' },
  { path: '/actions', label: 'Actions' },
  { path: '/viewer', label: '3D Viewer' },
  { path: '/teams', label: 'Teams' },
]

let scene, camera, renderer, tower, towerMesh
let raycaster, mouse, intersects
let isDragging = false
let previousMousePosition = { x: 0, y: 0 }

function initThreeJS() {
  // Get user color from store
  const teamColors = {
    'structure-facade': '#ef4444',
    'program': '#22c55e',
    'data': '#3b82f6'
  }
  userColor.value = teamColors[userStore.selectedTeam] || '#3b82f6'

  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  // Perspective Camera setup
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000)
  camera.position.set(80, 50, 80)
  camera.lookAt(0, 50, 0)

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  // Raycaster for clicking
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(100, 200, 100)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  // Create tower
  createTower()

  // Create ground plane
  const groundGeometry = new THREE.PlaneGeometry(300, 300)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.1,
    roughness: 0.8
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -2
  ground.receiveShadow = true
  scene.add(ground)

  // Event listeners
  canvas.value.addEventListener('mousedown', onMouseDown)
  canvas.value.addEventListener('mousemove', onMouseMove)
  canvas.value.addEventListener('mouseup', onMouseUp)
  canvas.value.addEventListener('click', onCanvasClick)
  canvas.value.addEventListener('wheel', onMouseWheel, { passive: false })
  window.addEventListener('resize', onWindowResize)

  // Start animation loop
  animate()
}

function createTower() {
  tower = new THREE.Group()
  
  // Create a single tower that sits on the ground
  const towerWidth = 12
  const towerDepth = 12
  const towerHeight = 100

  
  // Create a rectangular prism (box geometry)
  const geometry = new THREE.BoxGeometry(towerWidth, towerHeight, towerDepth)
  
  // Create a canvas texture with vertical gradient
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  
  // Draw gradient from green (bottom) to blue (top)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#22c55e') // Green at bottom
  gradient.addColorStop(1, '#3b82f6') // Blue at top
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.magFilter = THREE.NearestFilter
  
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    metalness: 0.3,
    roughness: 0.7
  })
  
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  
  // Store mesh globally for color updates
  towerMesh = mesh
  
  // Position tower so its bottom sits on the ground (y = 0)
  mesh.position.set(0, towerHeight / 2, 0)
  
  // Store metadata for raycasting
  mesh.userData = {
    type: 'tower',
    towerHeight: towerHeight,
    material: material
  }
  
  tower.add(mesh)
  tower.position.y = 0
  scene.add(tower)
}

function onMouseDown(event) {
  isDragging = true
  previousMousePosition = { x: event.clientX, y: event.clientY }
}

function onMouseMove(event) {
  window.console.log('onMouseMove called')
  // Handle camera dragging
  if (isDragging && tower) {
    const deltaX = event.clientX - previousMousePosition.x
    const deltaY = event.clientY - previousMousePosition.y
    
    // Update rotation angles (slower for smoothness)
    modelRotation.value.y += deltaX * 0.005
    modelRotation.value.x += deltaY * 0.005
    
    // Clamp vertical rotation to avoid flipping
    modelRotation.value.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, modelRotation.value.x))
    
    // Orbit camera around tower center
    const towerCenter = new THREE.Vector3(0, 50, 0)
    
    // Get current distance to maintain zoom level
    const currentDistance = camera.position.distanceTo(towerCenter)
    
    camera.position.x = Math.sin(modelRotation.value.y) * Math.cos(modelRotation.value.x) * currentDistance
    camera.position.y = 50 + Math.sin(modelRotation.value.x) * currentDistance
    camera.position.z = Math.cos(modelRotation.value.y) * Math.cos(modelRotation.value.x) * currentDistance
    
    camera.lookAt(towerCenter)
    
    previousMousePosition = { x: event.clientX, y: event.clientY }
    return
  }
  
  // Check for marker hover (only when not dragging)
  if (!canvas.value) return
  
  const rect = canvas.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  raycaster.setFromCamera(mouse, camera)
  
  // Check intersection with all markers
  if (annotation3DMarkers.value && annotation3DMarkers.value.length > 0) {
    // Pass the actual array values to raycaster
    const intersects = raycaster.intersectObjects(annotation3DMarkers.value, false)
    
    if (intersects && intersects.length > 0) {
      const hoverMarker = intersects[0].object
      const markerId = hoverMarker.userData?.markerId
      
      // Find the note with this markerId
      const noteIdx = stickyNotes.value.findIndex(note => note.markerId === markerId)
      
      if (noteIdx !== -1) {
        hoveredAnnotationIdx.value = noteIdx
        hoveredAnnotationColor.value = stickyNotes.value[noteIdx]?.color || '#000000'
        
        // Convert 3D position to screen coordinates
        const screenPos = new THREE.Vector3()
        screenPos.copy(hoverMarker.position)
        screenPos.project(camera)
        
        hoveredAnnotationPos.value = {
          x: (screenPos.x * 0.5 + 0.5) * rect.width,
          y: (screenPos.y * -0.5 + 0.5) * rect.height
        }
        return
      }
    }
  }
  
  hoveredAnnotationIdx.value = null
}

function onMouseUp() {
  isDragging = false
}

function onCanvasClick(event) {
  // Don't add annotation if input modal is showing
  if (showAnnotationInput.value) return
  
  // Calculate mouse position in normalized device coordinates
  const rect = canvas.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  // Update raycaster
  raycaster.setFromCamera(mouse, camera)
  
  // First check if clicking on a marker to delete
  if (annotation3DMarkers.value.length > 0) {
    const markerIntersects = raycaster.intersectObjects(annotation3DMarkers.value)
    console.log('Marker intersects:', markerIntersects.length)
    if (markerIntersects.length > 0) {
      const clickedMarker = markerIntersects[0].object
      const markerId = clickedMarker.userData.markerId
      console.log('Clicked marker with ID:', markerId)
      // Find note with this marker ID and remove it
      const noteIdx = stickyNotes.value.findIndex(note => note.markerId === markerId)
      console.log('Found note at index:', noteIdx)
      if (noteIdx !== -1) {
        removeNote(noteIdx)
        return
      }
    }
  }
  
  // Then check tower for new annotations - raycast against all objects in tower group
  if (tower) {
    // Get all meshes from tower
    const meshes = []
    tower.traverse((child) => {
      if (child.isMesh && child.userData.type === 'tower') {
        meshes.push(child)
      }
    })
    
    if (meshes.length > 0) {
      const intersects = raycaster.intersectObjects(meshes)
      
      if (intersects.length > 0) {
        const intersection = intersects[0]
        const point = intersection.point
        
        // Calculate floor level based on Y position (0 to towerHeight)
        const userData = intersection.object.userData
        if (userData && userData.type === 'tower') {
          const normalizedHeight = (point.y / userData.towerHeight) * 200
          const floorLevel = Math.max(1, Math.min(200, Math.floor(normalizedHeight)))
          
          pendingAnnotation.value = {
            floor: floorLevel,
            zone: 'Tower',
            text: '',
            x: 0,
            y: 0,
            team: 'data',
            point: point.clone()
          }
          showAnnotationInput.value = true
        }
      }
    }
  }
}

function saveAnnotation() {
  if (pendingAnnotation.value.text.trim()) {
    const teamColor = teamOptions.find(t => t.value === pendingAnnotation.value.team)?.color || '#3b82f6'
    const markerId = nextMarkerId.value++
    
    console.log('Saving annotation with markerId:', markerId)
    
    const note = {
      floor: pendingAnnotation.value.floor,
      zone: pendingAnnotation.value.zone,
      text: pendingAnnotation.value.text,
      timestamp: new Date(),
      team: pendingAnnotation.value.team,
      color: teamColor,
      userId: userStore.currentUser.id,
      point: pendingAnnotation.value.point,
      markerId: markerId // Store unique marker ID
    }
    
    stickyNotes.value.push(note)
    
    // Create 3D marker on tower
    if (scene && pendingAnnotation.value.point) {
      const markerGeometry = new THREE.SphereGeometry(0.75, 16, 16)
      const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(teamColor),
        emissive: new THREE.Color(teamColor),
        emissiveIntensity: 0.5
      })
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)
      marker.position.copy(pendingAnnotation.value.point)
      marker.userData = { type: 'annotation', markerId: markerId }
      scene.add(marker)
      
      annotation3DMarkers.value.push(marker)
      console.log('Marker created and added to scene. Total markers:', annotation3DMarkers.value.length)
    }
  }
  cancelAnnotation()
}

function cancelAnnotation() {
  showAnnotationInput.value = false
  pendingAnnotation.value = { floor: 0, zone: '', text: '', x: 0, y: 0, z: 0, team: 'data', point: null }
}

function onMouseWheel(event) {
  event.preventDefault()
  
  const zoomSpeed = 3
  const direction = event.deltaY > 0 ? 1 : -1
  
  // Zoom by moving camera along the orbit direction
  const towerCenter = new THREE.Vector3(0, 50, 0)
  const currentDir = camera.position.clone().sub(towerCenter).normalize()
  let currentDistance = camera.position.distanceTo(towerCenter)
  
  currentDistance = Math.max(20, Math.min(200, currentDistance + direction * zoomSpeed))
  
  camera.position.copy(currentDir.multiplyScalar(currentDistance).add(towerCenter))
  camera.lookAt(towerCenter)
  
  zoomLevel.value = currentDistance
}

function updateModelVersion() {
  // Color transition based on version
  if (towerMesh && towerMesh.material) {
    const versionFraction = (currentVersion.value - 1) / 9
    
    // Create new gradient based on version
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    
    // Shift hue based on version
    const hueShift = versionFraction * 0.3
    
    // Create gradient that shifts colors
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    
    // Base colors that shift with version
    const bottomHue = (0.33 + hueShift) % 1 // Green shifting
    const topHue = (0.66 + hueShift) % 1    // Blue shifting
    
    const bottomColor = new THREE.Color().setHSL(bottomHue, 0.7, 0.5)
    const topColor = new THREE.Color().setHSL(topHue, 0.7, 0.5)
    
    gradient.addColorStop(0, '#' + bottomColor.getHexString())
    gradient.addColorStop(1, '#' + topColor.getHexString())
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.magFilter = THREE.NearestFilter
    towerMesh.material.map = texture
    towerMesh.material.map.needsUpdate = true
  }
}

function removeNote(idx) {
  if (idx < 0 || idx >= stickyNotes.value.length) return
  
  const noteToRemove = stickyNotes.value[idx]
  const markerId = noteToRemove.markerId
  
  console.log('Removing note with markerId:', markerId, 'from', annotation3DMarkers.value.length, 'markers')
  
  // Find and remove the marker from scene by markerId
  const markerToRemoveIdx = annotation3DMarkers.value.findIndex(
    marker => marker.userData.markerId === markerId
  )
  
  console.log('Found marker at index:', markerToRemoveIdx)
  
  if (markerToRemoveIdx !== -1) {
    const markerToRemove = annotation3DMarkers.value[markerToRemoveIdx]
    console.log('Marker to remove:', markerToRemove)
    console.log('Scene:', scene)
    if (scene && markerToRemove) {
      scene.remove(markerToRemove)
      console.log('Removed from scene')
      // Dispose of geometry and material
      if (markerToRemove.geometry) markerToRemove.geometry.dispose()
      if (markerToRemove.material) markerToRemove.material.dispose()
    }
    annotation3DMarkers.value.splice(markerToRemoveIdx, 1)
  }
  
  // Remove the note
  stickyNotes.value.splice(idx, 1)
  
  // Clear hover state
  hoveredAnnotationIdx.value = null
}

function onWindowResize() {
  if (!canvasContainer.value) return
  
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  
  renderer.setSize(width, height)
}

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

function isActiveRoute(path) {
  return router.currentRoute.value.path === path
}

function handleLogout() {
  userStore.logout()
  router.push('/')
}

onMounted(() => {
  initThreeJS()
})

onUnmounted(() => {
  if (canvas.value) {
    canvas.value.removeEventListener('mousedown', onMouseDown)
    canvas.value.removeEventListener('mousemove', onMouseMove)
    canvas.value.removeEventListener('mouseup', onMouseUp)
    canvas.value.removeEventListener('click', onCanvasClick)
    canvas.value.removeEventListener('wheel', onMouseWheel)
  }
  window.removeEventListener('resize', onWindowResize)
  
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<style scoped>
canvas {
  display: block;
}

input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: none;
}
</style>
