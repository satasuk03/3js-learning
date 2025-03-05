import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const bakedShadowTexture = textureLoader.load('/textures/bakedShadow.jpg')
bakedShadowTexture.colorSpace = THREE.SRGBColorSpace
const simpleShadowTexture = textureLoader.load('/textures/simpleShadow.jpg')

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 * 
 * Only 3 types of light can cast shadows
 * DirectionalLight
 * PointLight
 * SpotLight
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
gui.add(ambientLight, 'intensity').min(0).max(3).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(2, 2, - 1)
gui.add(directionalLight, 'intensity').min(0).max(3).step(0.001)
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)

// Enable shadow should have power of 2 (because of mipmap)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
// Improve performance (only render shadow at the object we interested in)
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 6
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.bottom = - 2
directionalLight.shadow.camera.left = - 2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.radius = 10 // Blur shadow

const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
directionalLightCameraHelper.visible = false
scene.add(directionalLightCameraHelper)

// Spotlight (FOV of the shadow depends on the light angle)
const spotLight = new THREE.SpotLight(0xffffff, 5, 10, Math.PI * 0.3)
spotLight.position.set(0, 2, 2)
scene.add(spotLight)
scene.add(spotLight.target)

spotLight.castShadow = true
spotLight.shadow.mapSize.set(1024, 1024)
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 6
const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
spotLightCameraHelper.visible = false
scene.add(spotLightCameraHelper)

// PointLight
const pointLight = new THREE.PointLight(0xffffff, 2.7)
pointLight.position.set(-1, 1, 0)
scene.add(pointLight)

pointLight.castShadow = true
pointLight.shadow.mapSize.set(1024, 1024)
pointLight.shadow.camera.near = 0.1
pointLight.shadow.camera.far = 5

// It will render in 6 directions with perspective camera -> Absolutely bad performance
const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
pointLightCameraHelper.visible = false
scene.add(pointLightCameraHelper)

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.castShadow = true

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
    // new THREE.MeshStandardMaterial({
    //     map: bakedShadowTexture
    // })
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5
plane.receiveShadow = true
scene.add(sphere, plane)

/**
 * simple shadow plane
 */
const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
        alphaMap: simpleShadowTexture,
        color: 0x000000,
        transparent: true
    })
)
sphereShadow.rotation.x = - Math.PI * 0.5
sphereShadow.position.y = plane.position.y + 0.01 // Avoid z-fighting
scene.add(sphereShadow)

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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = false
renderer.shadowMap.type = THREE.PCFSoftShadowMap // shadow.radius doens't work with PCF
// renderer.shadowMap.type = THREE.PCFShadowMap // shadow.radius works with PCF (Default one)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Move the sphere
    sphere.position.x = Math.sin(elapsedTime * 0.5) * 1.5
    sphere.position.z = Math.cos(elapsedTime * 0.5) * 1.5
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 2)) 

    // Update shadow plane
    sphereShadow.position.x = sphere.position.x
    sphereShadow.position.z = sphere.position.z
    sphereShadow.material.opacity = (1 - sphere.position.y) * 0.5

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()