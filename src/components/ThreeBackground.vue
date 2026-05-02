<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'

const container = ref<HTMLElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let particlesMesh: THREE.Points
let mouseX = 0
let mouseY = 0
let timer: THREE.Timer | null = null

// To handle cleanup
let animationFrameId: number

const initThree = () => {
  if (!container.value) return

  // Scene setup
  scene = new THREE.Scene()
  
  // Camera setup
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 5

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
  // Use modern color space
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.value.appendChild(renderer.domElement)

  // Particles setup
  const particlesGeometry = new THREE.BufferGeometry()
  const particlesCount = 1400 // Matches skill count conceptually
  
  const posArray = new Float32Array(particlesCount * 3)
  const colorsArray = new Float32Array(particlesCount * 3)
  
  for(let i = 0; i < particlesCount * 3; i+=3) {
    // Spherical distribution
    const r = 10 * Math.cbrt(Math.random())
    const theta = Math.random() * 2 * Math.PI
    const phi = Math.acos(2 * Math.random() - 1)
    
    posArray[i] = r * Math.sin(phi) * Math.cos(theta)
    posArray[i+1] = r * Math.sin(phi) * Math.sin(theta)
    posArray[i+2] = r * Math.cos(phi)

    // Color gradient based on position
    const color = new THREE.Color()
    color.setHSL(0.6 + (posArray[i] / 20), 0.8, 0.6)
    colorsArray[i] = color.r
    colorsArray[i+1] = color.g
    colorsArray[i+2] = color.b
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3))

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.03,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })

  particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particlesMesh)

  // Ambient interaction light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  // Event listeners
  window.addEventListener('resize', onWindowResize)
  window.addEventListener('mousemove', onMouseMove)

  // Start animation loop
  animate()
}

const onWindowResize = () => {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

const onMouseMove = (event: MouseEvent) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1
}

const animate = () => {
  if (!renderer || !scene || !camera) return
  
  animationFrameId = requestAnimationFrame(animate)

  // Gentle autonomous rotation
  particlesMesh.rotation.y += 0.001
  particlesMesh.rotation.x += 0.0005

  // Interactive parallax based on mouse
  const targetX = mouseX * 0.5
  const targetY = mouseY * 0.5
  
  camera.position.x += (targetX - camera.position.x) * 0.02
  camera.position.y += (targetY - camera.position.y) * 0.02
  camera.lookAt(scene.position)

  renderer.render(scene, camera)
}

onMounted(() => {
  initThree()
  
  // Entry animation
  gsap.fromTo(particlesMesh.scale, 
    { x: 0.1, y: 0.1, z: 0.1 },
    { x: 1, y: 1, z: 1, duration: 2, ease: "power3.out" }
  )
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize)
  window.removeEventListener('mousemove', onMouseMove)
  cancelAnimationFrame(animationFrameId)
  
  if (renderer && container.value) {
    container.value.removeChild(renderer.domElement)
    renderer.dispose()
  }
})
</script>

<template>
  <div ref="container" class="three-canvas-container"></div>
</template>

<style scoped>
.three-canvas-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  background: radial-gradient(circle at center, #1a1a2e 0%, #0f0f1a 100%);
  pointer-events: none; /* Let clicks pass through to the UI */
}
</style>
