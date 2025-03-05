import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import GUI from 'lil-gui'
import { RGBELoader } from 'three/addons/loaders/RGBELoader'

/**
 * Debug
 */
const gui = new GUI()
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

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
 * Textures
 */
const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)

const doorColorTexture = textureLoader.load('./textures/door/color.jpg')
doorColorTexture.colorSpace = THREE.SRGBColorSpace
const doorAmbientOcclusionTexture = textureLoader.load('./textures/door/ambientOcclusion.jpg')
const doorAlphaTexture = textureLoader.load('./textures/door/alpha.jpg')
const doorHeightTexture = textureLoader.load('./textures/door/height.jpg')
const doorNormalTexture = textureLoader.load('./textures/door/normal.jpg')
const doorMetalnessTexture = textureLoader.load('./textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('./textures/door/roughness.jpg')
const matcapTexture = textureLoader.load('./textures/matcaps/8.png')
matcapTexture.colorSpace = THREE.SRGBColorSpace
const gradientTexture = textureLoader.load('./textures/gradients/5.jpg')

/**
 * Light
 */
// const ambientLight = new THREE.AmbientLight(0xffffff, 1)
// scene.add(ambientLight)

// const pointLight = new THREE.PointLight(0xffffff, 30)
// pointLight.position.set(2, 3, 4)
// scene.add(pointLight)

/**
 * Environment map
 * No need lighting for environment map 
 */
const rgbeLoader = new RGBELoader()
rgbeLoader.load('./textures/environmentMap/2k.hdr', (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping
    scene.background = environmentMap
    scene.environment = environmentMap
})

/**
 * Materials
 */
// const material = new THREE.MeshBasicMaterial()
// material.map = doorColorTexture
// // material.transparent = true
// // material.alphaMap = doorAlphaTexture
// // material.opacity = 0.2
// material.side = THREE.DoubleSide

// MeshNormalMaterial for debugging normals
// const material = new THREE.MeshNormalMaterial()
// material.flatShading = true

// MeshMatcapMaterial show material to the camera in one direction
// Really good performance
// Downside: can't change lighting
// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexture

// MeshDepthMaterial (Near white, Far Dark)
// const material = new THREE.MeshDepthMaterial()

// MeshLambertMaterial -> Require lighting
// Good Performance compared to other materials
// const material = new THREE.MeshLambertMaterial()

// MeshPhongMaterial
// Better lighting but slower than MeshLambertMaterial
// Not really realistic
// const material = new THREE.MeshPhongMaterial()
// material.shininess = 100
// material.specular = new THREE.Color(0x1188ff)

// MeshToonMaterial (Cell shading)
// const material = new THREE.MeshToonMaterial()
// gradientTexture.minFilter = THREE.NearestFilter
// gradientTexture.magFilter = THREE.NearestFilter
// gradientTexture.generateMipmaps = false
// material.gradientMap = gradientTexture

// MeshStandardMaterial
// const material = new THREE.MeshStandardMaterial()
// material.metalness = 1
// material.roughness = 1
// material.map = doorColorTexture
// material.aoMap = doorAmbientOcclusionTexture
// material.aoMapIntensity = 0.8
// material.displacementMap = doorHeightTexture // Require more subdivision
// material.displacementScale = 0.02
// material.metalnessMap = doorMetalnessTexture
// material.roughnessMap = doorRoughnessTexture
// material.normalMap = doorNormalTexture // Better perf than displacementMap
// material.normalScale.set(0.5, 0.5)
// material.alphaMap = doorAlphaTexture
// material.transparent = true

// MeshPhysicalMaterial
const material = new THREE.MeshPhysicalMaterial()
material.metalness = 1
material.roughness = 1
material.map = doorColorTexture
material.aoMap = doorAmbientOcclusionTexture
material.aoMapIntensity = 0.8
material.displacementMap = doorHeightTexture // Require more subdivision
material.displacementScale = 0.25
material.metalnessMap = doorMetalnessTexture
material.roughnessMap = doorRoughnessTexture
material.normalMap = doorNormalTexture // Better perf than displacementMap
material.normalScale.set(0.5, 0.5)
material.alphaMap = doorAlphaTexture
material.transparent = true

// Clearcoat (Like covering a glass over an object) (bad performance)
// material.clearcoat = 1
// material.clearcoatRoughness = 0
// gui.add(material, 'clearcoat').min(0).max(1).step(0.0001)
// gui.add(material, 'clearcoatRoughness').min(0).max(1).step(0.0001)

// Sheen (like fluffy material)
// material.sheen = 1
// material.sheenRoughness = 0.25
// material.sheenColor.set(1,1,1)
// gui.add(material, 'sheen').min(0).max(1).step(0.0001)
// gui.add(material, 'sheenRoughness').min(0).max(1).step(0.0001)
// gui.addColor(material, 'sheenColor')

// Iridesscence
// material.iridescence = 1
// material.iridescenceIOR = 1.3
// material.iridescenceThicknessRange = [100, 800]
// gui.add(material, 'iridescence').min(0).max(1).step(0.0001)
// gui.add(material, 'iridescenceIOR').min(1).max(2.333).step(0.0001)
// gui.add(material.iridescenceThicknessRange, '0').min(1).max(1000).step(1)
// gui.add(material.iridescenceThicknessRange, '1').min(1).max(1000).step(1)

// Transmission (See through), bad performance
// If remove all material map will make it like glass
material.transmission = 1
material.ior = 1.33 // index of refraction (depends on type of material) can be found in Wiki
material.thickness = 0.5
gui.add(material, 'transmission').min(0).max(1).step(0.0001)
gui.add(material, 'ior').min(1).max(10).step(0.0001)
gui.add(material, 'thickness').min(0).max(10).step(0.0001)


gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Object
 */
const sphereGeometry = new THREE.SphereGeometry(0.5, 64, 64)
const planeGeometry = new THREE.PlaneGeometry(1, 1, 100, 100)
const torusGeometry = new THREE.TorusGeometry(0.3, 0.2, 64, 128)

const sphere = new THREE.Mesh(sphereGeometry, material)
const plane = new THREE.Mesh(planeGeometry, material)
const torus = new THREE.Mesh(torusGeometry, material)
sphere.position.x = -1.5
plane.position.x = 0
torus.position.x = 1.5

scene.add(sphere, plane, torus)

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

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    plane.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = -0.15 * elapsedTime
    plane.rotation.x = -0.15 * elapsedTime
    torus.rotation.x = -0.15 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()