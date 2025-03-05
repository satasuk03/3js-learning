import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
// const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('./textures/particles/2.png')
const matcapTexture = textureLoader.load('./textures/matcap/4.png')
/**
 * Particles
 */
// Geometry
const particlesGeometry = new THREE.BufferGeometry()
const count = 20000
const positions = new Float32Array(count * 3) // XYZ
const colors = new Float32Array(count * 3) // RGB

for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10

    colors[i * 3] = Math.random()
    colors[i * 3 + 1] = Math.random()
    colors[i * 3 + 2] = Math.random()
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)) // 3 because we use 3 values for each vertex
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3)) // 3 because we use 3 values for each vertex

// Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true, // smaller particle the farther away
    transparent: true,
    alphaMap: particleTexture,
})
// particlesMaterial.color.set('salmon')

/**
 * Techniques to fix alpha issues
 * may combine some of them
 */
// particlesMaterial.alphaTest = 0.001 // Tell GPU to not render particles that have an alpha of 0.001 or less
// But we still can see the particle edges (If particle is moving it's ok to use this)

// This may cause bug if we have other color particles or objects (you can see particles through the cube)
// particlesMaterial.depthTest = false // Tell GPU to not render particles that are behind other particles

// Good solution (might bug sometimes)
particlesMaterial.depthWrite = false // Tell GPU to not write to the depth buffer

// Blending (Worse performance)
particlesMaterial.blending = THREE.AdditiveBlending // When particles are stacked on top of each other, it gets brighter

const donut = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.4, 16, 60),
    new THREE.MeshMatcapMaterial({
        matcap: matcapTexture
    })
)
scene.add(donut)

// change color of particles to mixed (by colors array)
particlesMaterial.vertexColors = true

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.maxDistance = 6
controls.minDistance = 2
controls.enablePan = false
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Rotate donut
    // donut.rotation.y = elapsedTime * 0.5
    donut.rotation.x = elapsedTime * 0.5

    // Particles
    particles.rotation.y = Math.sin(elapsedTime * 0.12)
    particles.position.y = Math.sin(elapsedTime * 0.12)

    // Bad performance should use shader if want to do this
    // for(let i =0; i<count; i++){
    //     // particlesGeometry.attributes.position.array
    //     const i3 = i * 3
    //     const x = particlesGeometry.attributes.position.array[i3]
    //     particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x) 
    // }
    // particlesGeometry.attributes.position.needsUpdate = true


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()