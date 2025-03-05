import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer'
import { Sky } from 'three/addons/objects/Sky'
import GUI from 'lil-gui'

const textureLoader = new THREE.TextureLoader()

const bushTexture = textureLoader.load('/bush/leaves_forest_ground_diff_1k.jpg')
bushTexture.colorSpace = THREE.SRGBColorSpace
const bushARM = textureLoader.load('/bush/leaves_forest_ground_arm_1k.jpg')
const bushNormal = textureLoader.load('/bush/leaves_forest_ground_nor_gl_1k.jpg')

const roofTexture = textureLoader.load('/roof/ceramic_roof_01_diff_1k.jpg')
roofTexture.colorSpace = THREE.SRGBColorSpace
roofTexture.repeat.set(3, 1)
roofTexture.wrapS = THREE.RepeatWrapping
const roofARM = textureLoader.load('/roof/ceramic_roof_01_arm_1k.jpg')
roofARM.repeat.set(3, 1)
roofARM.wrapS = THREE.RepeatWrapping
const roofNormal = textureLoader.load('/roof/ceramic_roof_01_nor_gl_1k.jpg')
roofNormal.repeat.set(3, 1)
roofNormal.wrapS = THREE.RepeatWrapping
const roofDisp = textureLoader.load('/roof/ceramic_roof_01_disp_1k.jpg')
roofDisp.repeat.set(3, 1)
roofDisp.wrapS = THREE.RepeatWrapping

const wallTexture = textureLoader.load('/wall/random_bricks_thick_diff_1k.jpg')
wallTexture.colorSpace = THREE.SRGBColorSpace
wallTexture.repeat.set(2, 2)
wallTexture.wrapS = THREE.RepeatWrapping
wallTexture.wrapT = THREE.RepeatWrapping
const wallARM = textureLoader.load('/wall/random_bricks_thick_arm_1k.jpg')
wallARM.repeat.set(2, 2)
wallARM.wrapS = THREE.RepeatWrapping
wallARM.wrapT = THREE.RepeatWrapping
const wallNormal = textureLoader.load('/wall/random_bricks_thick_nor_gl_1k.jpg')
wallNormal.repeat.set(2, 2)
wallNormal.wrapS = THREE.RepeatWrapping
wallNormal.wrapT = THREE.RepeatWrapping
const wallDisp = textureLoader.load('/wall/random_bricks_thick_disp_1k.jpg')
wallDisp.repeat.set(2, 2)
wallDisp.wrapS = THREE.RepeatWrapping
wallDisp.wrapT = THREE.RepeatWrapping

const floorAlpha = textureLoader.load('/floor/alpha.webp')
const floorTexture = textureLoader.load('/floor/coast_sand_rocks_02_diff_1k.webp')
floorTexture.colorSpace = THREE.SRGBColorSpace
floorTexture.repeat.set(8, 8)
floorTexture.wrapS = THREE.RepeatWrapping
floorTexture.wrapT = THREE.RepeatWrapping
const floorARM = textureLoader.load('/floor/coast_sand_rocks_02_arm_1k.webp')
floorARM.repeat.set(8, 8)
floorARM.wrapS = THREE.RepeatWrapping
floorARM.wrapT = THREE.RepeatWrapping
const floorDisp = textureLoader.load('/floor/coast_sand_rocks_02_disp_1k.webp')
floorDisp.repeat.set(8, 8)
floorDisp.wrapS = THREE.RepeatWrapping
floorDisp.wrapT = THREE.RepeatWrapping
const floorNormal = textureLoader.load('/floor/coast_sand_rocks_02_nor_gl_1k.webp')
floorNormal.repeat.set(8, 8)
floorNormal.wrapS = THREE.RepeatWrapping
floorNormal.wrapT = THREE.RepeatWrapping

const graveTexture = textureLoader.load('/grave/plastered_stone_wall_diff_1k.jpg')
graveTexture.colorSpace = THREE.SRGBColorSpace
graveTexture.repeat.set(0.3, 0.4)
const graveARM = textureLoader.load('/grave/plastered_stone_wall_arm_1k.jpg')
graveARM.repeat.set(0.3, 0.4)
const graveNormal = textureLoader.load('/grave/plastered_stone_wall_nor_gl_1k.jpg')
graveNormal.repeat.set(0.3, 0.4)

const doorTexture = textureLoader.load('/door/color.webp')
doorTexture.colorSpace = THREE.SRGBColorSpace
const doorAlpha = textureLoader.load('/door/alpha.webp')
const doorAO = textureLoader.load('/door/ambientOcclusion.webp')
const doorHeight = textureLoader.load('/door/height.webp')
const doorNormal = textureLoader.load('/door/normal.webp')
const doorMetalness = textureLoader.load('/door/metalness.webp')
const doorRoughness = textureLoader.load('/door/roughness.webp')

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
        map: floorTexture,
        aoMap: floorARM,
        roughnessMap: floorARM,
        metalnessMap: floorARM,
        normalMap: floorNormal,
        displacementMap: floorDisp,
        displacementScale: 0.2,
        displacementBias: -0.1,
        alphaMap: floorAlpha,
        transparent: true
    })
)
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)
gui.add(floor.material, 'displacementScale').min(0).max(1).step(0.01).name('displacementScale')
gui.add(floor.material, 'displacementBias').min(-1).max(1).step(0.01).name('displacementBias')

/**
 * House
 */
const houseMeasurements = {
    width: 4,
    depth: 4,
    height: 2.5
}
const house = new THREE.Group()
scene.add(house)

const walls = new THREE.Mesh(
    new THREE.BoxGeometry(houseMeasurements.width, houseMeasurements.height, houseMeasurements.depth, 200, 200),
    new THREE.MeshStandardMaterial({
        map: wallTexture,
        aoMap: wallARM,
        roughnessMap: wallARM,
        metalnessMap: wallARM,
        normalMap: wallNormal,
        displacementMap: wallDisp,
        displacementScale: 0.02,
        displacementBias: -0.015,
    })
)
walls.position.y = houseMeasurements.height/2
house.add(walls)
gui.add(walls.material, 'displacementScale').min(0).max(1).step(0.01).name('displacementScale')
gui.add(walls.material, 'displacementBias').min(-1).max(1).step(0.001).name('displacementBias')

const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1.5, 4),
    new THREE.MeshStandardMaterial({
        map: roofTexture,
        aoMap: roofARM,
        roughnessMap: roofARM,
        metalnessMap: roofARM,
        normalMap: roofNormal,
        displacementMap: roofDisp,
        displacementScale: 0.02,
        displacementBias: -0.015,
    })
)
roof.rotation.y = Math.PI * 0.25
roof.position.y = houseMeasurements.height + 0.75
house.add(roof)

const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
        map: doorTexture,
        aoMap: doorAO,
        roughnessMap: doorRoughness,
        metalnessMap: doorMetalness,
        normalMap: doorNormal,
        transparent: true,
        alphaMap: doorAlpha,
        displacementMap: doorHeight,
        displacementScale: 0.1,
        displacementBias: 0.015,
    })
)
door.position.y = 2.1/2
door.position.z = houseMeasurements.depth/2 + 0.001
house.add(door)

const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({
    map: bushTexture,
    aoMap: bushARM,
    roughnessMap: bushARM,
    metalnessMap: bushARM,
    normalMap: bushNormal,
})
bushMaterial.color.set('#708238')
const bush = new THREE.Mesh(bushGeometry, bushMaterial)
bush.position.set(0.8, 0.2, 2.2)
bush.scale.setScalar(0.5)
const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.position.set(1.4, 0.18, 2.3)
bush2.scale.setScalar(0.25)
const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.position.set(-1.2, 0.2, 2.3)
bush3.scale.setScalar(0.4)
const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.position.set(-1.5, 0.1, 2.5)
bush4.scale.setScalar(0.2)
house.add(bush, bush2, bush3, bush4)

// Graves
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({
    map: graveTexture,
    aoMap: graveARM,
    roughnessMap: graveARM,
    metalnessMap: graveARM,
    normalMap: graveNormal,
})
const graves = new THREE.Group()
scene.add(graves)

for (let i = 0; i < 30; i++) {
    // Geometry
    const grave = new THREE.Mesh(graveGeometry, graveMaterial)
    const angle = Math.random() * 2 * Math.PI
    const radius = houseMeasurements.width/2 + 0.1 + Math.random() * 5
    const x = Math.cos(angle) * radius
    const y = Math.random() * 0.4
    const z = Math.sin(angle) * radius
    const rotationX = (Math.random() - 0.5) * 0.4
    const rotationY = (Math.random() - 0.5) * Math.PI * 4
    const rotationZ = (Math.random() - 0.5) * 0.4

    // Position
    grave.position.set(x, y, z)
    grave.rotation.set(rotationX, rotationY, rotationZ)
    // Add to graves group
    graves.add(grave)
}



/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#86cdff', 0.15)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#86cdff', 1)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

// Door light
const doorLight = new THREE.PointLight('#ff7d46', 5, 3.42, 1.74)
doorLight.position.set(0, 2.2, 2.5)
house.add(doorLight)
const doorLightFolder = gui.addFolder('Door Light')
doorLightFolder.add(doorLight, 'intensity').min(0).max(10).step(0.01).name('intensity')
doorLightFolder.add(doorLight, 'distance').min(0).max(10).step(0.01).name('distance')
doorLightFolder.add(doorLight, 'decay').min(0).max(2).step(0.01).name('decay')

// Ghost light
const ghostLight1 = new THREE.PointLight('#8800ff', 5, 10, 1.74)
const ghostLight2 = new THREE.PointLight('#ff0088', 5, 10, 1.74)
const ghostLight3 = new THREE.PointLight('#ff0000', 5, 10, 1.74)

scene.add(ghostLight1, ghostLight2, ghostLight3)

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
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
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
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Shadows
 */
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
ghostLight1.castShadow = true
ghostLight2.castShadow = true
ghostLight3.castShadow = true
directionalLight.castShadow = true
floor.receiveShadow = true
walls.receiveShadow = true
walls.castShadow = true
roof.castShadow = true
graves.children.forEach(child => {
    child.castShadow = true
    child.receiveShadow = true
})
// Mapping
directionalLight.shadow.mapSize.set(256, 256)
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 20

ghostLight1.shadow.mapSize.set(256, 256)
ghostLight1.shadow.camera.far = 10
ghostLight2.shadow.mapSize.set(256, 256)
ghostLight2.shadow.camera.far = 10
ghostLight3.shadow.mapSize.set(256, 256)
ghostLight3.shadow.camera.far = 10

/**
 * Sky
 */
const sky = new Sky()
sky.scale.setScalar(100)
sky.material.uniforms.turbidity.value = 10
sky.material.uniforms.rayleigh.value = 3
sky.material.uniforms.mieCoefficient.value = 0.1
sky.material.uniforms.mieDirectionalG.value = 0.95
sky.material.uniforms.sunPosition.value.set(0.3, -0.03, -0.95)
scene.add(sky)

/**
 * Fog
 */
// scene.fog = new THREE.Fog('#2e2a2a', 2, 10)
scene.fog = new THREE.FogExp2('#2e2a2a', 0.14)

/**
 * Animate
 */
const timer = new Timer()

const tick = () =>
{
    // Timer
    timer.update()
    const elapsedTime = timer.getElapsed()

    // Ghost light
    const ghost1Angle = elapsedTime * 0.5
    ghostLight1.position.x = Math.cos(ghost1Angle) * 4
    ghostLight1.position.z = Math.sin(ghost1Angle) * 4
    ghostLight1.position.y = Math.sin(ghost1Angle) * Math.sin(ghost1Angle * 2.3) * Math.sin(ghost1Angle * 3.4) + 0.2

    const ghost2Angle = elapsedTime * -0.5 + Math.PI * 0.5
    ghostLight2.position.x = Math.cos(ghost2Angle) * 5
    ghostLight2.position.z = Math.sin(ghost2Angle) * 5
    ghostLight2.position.y = Math.sin(ghost2Angle) * Math.sin(ghost2Angle * 2.3) * Math.sin(ghost2Angle * 3.4) + 0.2

    const ghost3Angle = elapsedTime * 0.5 + 3 * Math.PI * 0.25
    ghostLight3.position.x = Math.cos(ghost3Angle) * 6
    ghostLight3.position.z = Math.sin(ghost3Angle) * 6
    ghostLight3.position.y = Math.sin(ghost3Angle) * Math.sin(ghost3Angle * 2.3) * Math.sin(ghost3Angle * 3.4) + 0.2
    

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()