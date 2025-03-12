import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import GUI from 'lil-gui'

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
 * Model
 */
let model = null
const gltfLoader = new GLTFLoader()
gltfLoader.load('./models/Duck/glTF-Binary/Duck.glb', (gltf) =>
{
    model = gltf.scene
    scene.add(gltf.scene)
})

/**
 * Light
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

/**
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

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
 * Mouse
 */
const mouse = new THREE.Vector2()
window.addEventListener('mousemove', (event) =>
{
    mouse.x = (event.clientX / sizes.width - 0.5) * 2
    mouse.y = - (event.clientY / sizes.height - 0.5) * 2
})
window.addEventListener('click', () =>
{
    if (currentIntersect) {
        console.log('clicked')
        // Can compare object like currentIntersect === object1
    }
})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

/**
 * Raycaster
 * 
 * One object can have more than one intersect (like donut)
 */
/**
 * Three.js updates the objects’ coordinates (called matrices) right before rendering them. 
 * Since we do the ray casting immediately, none of the objects have been rendered.
 * You can fix that by updating the matrices manually before ray casting:
 */
object1.updateMatrixWorld()
object2.updateMatrixWorld()
object3.updateMatrixWorld()

const raycaster = new THREE.Raycaster()
// const rayOrigin = new THREE.Vector3(-3,0,0)
// const rayDirection = new THREE.Vector3(1,0,0)
// rayDirection.normalize()
// raycaster.set(rayOrigin, rayDirection)

// const raycastIntersects = raycaster.intersectObjects(scene.children)
// console.log(raycastIntersects)

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
 * Animate
 */
const clock = new THREE.Clock()
let currentIntersect = null

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Animate objects
    object1.position.y = Math.sin(elapsedTime * 0.8) * 1.5
    object2.position.y = Math.cos(elapsedTime * 0.5) * 1.5
    object3.position.y = Math.sin(elapsedTime * 1) * 1.5

    // Cast ray
    // const rayOrigin = new THREE.Vector3(-3,0,0)
    // const rayDirection = new THREE.Vector3(1,0,0)
    // rayDirection.normalize()
    // raycaster.set(rayOrigin, rayDirection)

    // Hovering with raycaster
    raycaster.setFromCamera(mouse, camera)

    const objectsToTest = [object1, object2, object3]
    const raycastIntersects = raycaster.intersectObjects(objectsToTest)

    objectsToTest.forEach(object =>
    {
        object.material.color.set('#ff0000')
    })

    raycastIntersects.forEach(intersect =>
    {
        intersect.object.material.color.set('#00ff00')
    })

    if (raycastIntersects.length > 0){
        if (!currentIntersect) {
            console.log('entered')
        }
        currentIntersect = raycastIntersects[0].object
    } else {
        if (currentIntersect) {
            console.log('exited')
        }
        currentIntersect = null
    }

    if (model) {
        const modelIntersects = raycaster.intersectObject(model)
        // console.log(modelIntersects)
        if (modelIntersects.length > 0) {
            model.scale.set(1.5, 1.5, 1.5)
        } else {
            model.scale.set(1, 1, 1)
        }
    }


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()