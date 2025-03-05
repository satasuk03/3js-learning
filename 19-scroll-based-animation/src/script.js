import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(() =>
    {
        material.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

/**
 * Objects
 */
const material = new THREE.MeshToonMaterial({ color: parameters.materialColor, gradientMap: gradientTexture })

const objectDistance = 4

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, .4, 16, 60),
    material
)

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)

const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(.8, .35, 100, 16),
    material
)

scene.add(mesh1, mesh2, mesh3)
const sectionMeshes = [mesh1, mesh2, mesh3]

mesh1.position.y = -objectDistance * 0
mesh2.position.y = -objectDistance * 1
mesh3.position.y = -objectDistance * 2

mesh1.position.x = 2
mesh2.position.x = -2
mesh3.position.x = 2

/**
 * Particles
 */
const particleCount = 500

const positions = new Float32Array(particleCount * 3)
for (let i = 0; i < particleCount; i++)
{
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = objectDistance * 0.5 - Math.random() * objectDistance * 3
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const particlesMaterial = new THREE.PointsMaterial({ color: parameters.materialColor, size: 0.03, sizeAttenuation: true })

const particlesSystem = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particlesSystem)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('white', 3)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

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

const cursor = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (event) =>
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
let scrollY = 0
let currentSection = 0
window.addEventListener('scroll', () =>
{
    scrollY = window.scrollY
    const newSection = Math.round(scrollY / sizes.height)
    if (currentSection !== newSection)
    {
        currentSection = newSection
        gsap.to(sectionMeshes[currentSection].rotation, {
            duration: 1.5,
            ease: 'power2.inOut',
            x: '+=6',
            y: '+=6',
            z: '+=1.5',
        })
    }
    // console.log(currentSection)
    // console.log(scrollY, sizes.height)
})

/**
 * Animate
 */
const clock = new THREE.Clock()



const tick = () =>
{
    const delta = clock.getDelta()
    const elapsedTime = clock.getElapsedTime()

    // Animate camera
    // Section size is 100vh so each section will be size.height
    // scrollY / sizes.height is 1 unit of screen (so we have objectDistance for 1 unit)
    camera.position.y = - scrollY / sizes.height * objectDistance

    // https://en.wikipedia.org/wiki/Lissajous_curve
    const parallaxX = cursor.x * 0.5 + Math.sin(0.2 * elapsedTime) * 0.05;
    const parallaxY = -cursor.y * 0.5 + Math.cos(0.6 * elapsedTime+3) * 0.08
    // Easing camera movement (increasing the value untile it reaches the parallax target)
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * delta
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * delta

    // Animate meshes
    sectionMeshes.forEach(mesh =>
    {
        mesh.rotation.x += delta * 0.1
        mesh.rotation.y += delta * 0.12
    })

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()