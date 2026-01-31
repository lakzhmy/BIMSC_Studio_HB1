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
          <p class="text-slate-600 mt-1">Explore building versions with the timeline slider</p>
        </div>

        <!-- Main Viewer Area -->
        <div class="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col" style="height: 700px;">
          <!-- 3D Canvas -->
          <div ref="canvasContainer" class="flex-1 relative">
            <canvas ref="canvas" class="w-full h-full"></canvas>
          </div>
        </div>

        <!-- Timeline Control -->
        <div class="bg-white rounded-lg border border-slate-200 p-6 mt-6">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span class="text-sm font-medium text-slate-700 whitespace-nowrap">Project Timeline:</span>
              <input
                v-model.number="currentVersion"
                type="range"
                min="1"
                max="10"
                class="flex-1 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                @input="updateModelVersion"
              />
              <div class="text-sm font-semibold text-slate-900 bg-slate-100 px-4 py-2 rounded-lg min-w-fit text-center">
                Version {{ currentVersion }} / 10
              </div>
            </div>
            <div class="text-sm text-slate-700">
              <span class="font-medium block mb-1">Current Phase:</span>
              <span class="font-semibold text-slate-900 text-base">{{ versionLabels[currentVersion - 1] }}</span>
            </div>
          </div>
        </div>

        <!-- Info Panel -->
        <div class="grid grid-cols-2 gap-4 mt-6">
          <div class="bg-white p-4 rounded-lg border border-slate-200">
            <h4 class="font-semibold text-slate-900 mb-2">Current View</h4>
            <p class="text-sm text-slate-600">
              Rotation: {{ modelRotation.x.toFixed(2) }} rad, {{ modelRotation.y.toFixed(2) }} rad
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
const modelRotation = ref({ x: 0, y: 0 })

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
let isDragging = false
let previousMousePosition = { x: 0, y: 0 }

function initThreeJS() {
  console.log('initThreeJS called')
  console.log('canvasContainer.value:', canvasContainer.value)
  console.log('canvas.value:', canvas.value)

  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xd1d5db)

  // Perspective Camera setup
  const width = canvasContainer.value.clientWidth || window.innerWidth
  const height = canvasContainer.value.clientHeight || 700
  console.log('Canvas dimensions:', width, 'x', height)
  
  if (width === 0 || height === 0) {
    console.warn('Canvas has invalid dimensions, retrying...')
    setTimeout(initThreeJS, 100)
    return
  }
  
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000)
  camera.position.set(50, 60, 50)
  camera.lookAt(0, 50, 0)

  // Renderer setup
  canvas.value.width = width
  canvas.value.height = height
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  console.log('Renderer created and sized:', width, 'x', height)

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

  // Add axes helper for debugging
  const axesHelper = new THREE.AxesHelper(50)
  scene.add(axesHelper)

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
  canvas.value.addEventListener('wheel', onMouseWheel, { passive: false })
  window.addEventListener('resize', onWindowResize)

  // Start animation loop
  animate()
}

function createTower() {
  console.log('createTower called')
  tower = new THREE.Group()
  
  // Create a single tower that sits on the ground
  const towerWidth = 12
  const towerDepth = 12
  const towerHeight = 100

  
  // Create a rectangular prism (box geometry)
  const geometry = new THREE.BoxGeometry(towerWidth, towerHeight, towerDepth)
  
  // Create a canvas texture with vertical gradient
  const textureCanvas = document.createElement('canvas')
  textureCanvas.width = 64
  textureCanvas.height = 512
  const ctx = textureCanvas.getContext('2d')
  
  // Draw gradient from green (bottom) to blue (top)
  const gradient = ctx.createLinearGradient(0, 0, 0, textureCanvas.height)
  gradient.addColorStop(0, '#22c55e') // Green at bottom
  gradient.addColorStop(1, '#3b82f6') // Blue at top
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height)
  
  const texture = new THREE.CanvasTexture(textureCanvas)
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
  console.log('Tower added to scene:', tower)
}

function onMouseDown(event) {
  isDragging = true
  previousMousePosition = { x: event.clientX, y: event.clientY }
}

function onMouseMove(event) {
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
  }
}

function onMouseUp() {
  isDragging = false
}

function updateModelVersion() {
  // Color transition based on version
  if (towerMesh && towerMesh.material) {
    const versionFraction = (currentVersion.value - 1) / 9
    
    // Create new gradient based on version
    const textureCanvas = document.createElement('canvas')
    textureCanvas.width = 64
    textureCanvas.height = 512
    const ctx = textureCanvas.getContext('2d')
    
    // Shift hue based on version
    const hueShift = versionFraction * 0.3
    
    // Create gradient that shifts colors
    const gradient = ctx.createLinearGradient(0, 0, 0, textureCanvas.height)
    
    // Base colors that shift with version
    const bottomHue = (0.33 + hueShift) % 1
    const topHue = (0.66 + hueShift) % 1
    
    const bottomColor = new THREE.Color().setHSL(bottomHue, 0.7, 0.5)
    const topColor = new THREE.Color().setHSL(topHue, 0.7, 0.5)
    
    gradient.addColorStop(0, '#' + bottomColor.getHexString())
    gradient.addColorStop(1, '#' + topColor.getHexString())
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height)
    
    const texture = new THREE.CanvasTexture(textureCanvas)
    texture.magFilter = THREE.NearestFilter
    towerMesh.material.map = texture
    towerMesh.material.map.needsUpdate = true
  }
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
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
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
