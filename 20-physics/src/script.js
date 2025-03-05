/**
 * You can create another script to handle the physics
 * With another worker thread
 * https://schteppe.github.io/cannon.js/examples/worker.html
 * 
 * Physijs might be a better option
 * or Ammo.js
 */
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as CANNON from 'cannon-es'

/**
 * Debug
 */
const gui = new GUI()
const debugObject = {}

/**
 * Sound
 */
const hitSound = new Audio('./sounds/hit.mp3')
const playHitSound = async (collision) => {
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()
    if (impactStrength > 1.5) {
        hitSound.volume = Math.min(impactStrength / 10, 1)
        hitSound.currentTime = 0
        await hitSound.play()
    }
}
debugObject.playHitSound = playHitSound
gui.add(debugObject, 'playHitSound')

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
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/**
 * Physics
 */
const world = new CANNON.World()

// Performance improvement
/**
 * May buggy if object travel too fast
 * But better performance than NaiveBroadphase
 */
world.broadphase = new CANNON.SAPBroadphase(world) 
/**
 * Allow object to sleep
 * If object is not moving, it will sleep and not be affected by physics
 * It will wake up when it is touched by other object
 */
world.allowSleep = true

world.gravity.set(0, -9.82, 0)
const defaultMaterial = new CANNON.Material('default')

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial, 
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial


/**
 * Floor
 */
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0), // Must be a unit vector
    Math.PI * 0.5 // We have to rotate the floor by 90 degrees to make it face the correct way (if wrong we will have a random bug to object)
)
// Same as:
// floorBody.quaternion.setFromAxisAngle(
//     new CANNON.Vec3(1, 0, 0),
//     - Math.PI * 0.5 
// )

floorBody.addShape(floorShape) // We can create complex shapes by adding multiple shapes
world.addBody(floorBody)

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Utils
 */
const objectsToUpdate = []
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    // envMapIntensity: 0.5
})
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const createSphere = (radius, position) => {
    // Three.js
    const sphereMesh = new THREE.Mesh(
        sphereGeometry,
        sphereMaterial
    )
    sphereMesh.castShadow = true
    sphereMesh.scale.set(radius, radius, radius)
    sphereMesh.position.copy(position)
    scene.add(sphereMesh)

    // Cannon.js
    const sphereShape = new CANNON.Sphere(radius)
    const sphereBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: sphereShape,
        material: defaultMaterial
    })
    sphereBody.position.copy(position)
    sphereBody.addEventListener('collide', playHitSound)
    world.addBody(sphereBody)

    objectsToUpdate.push({
        mesh: sphereMesh,
        body: sphereBody
    })
}
const boxGeometry = new THREE.BoxGeometry(1,1,1)
const createBox = (size, position) => {
    // Three.js
    const mesh = new THREE.Mesh(
        boxGeometry,
        sphereMaterial
    )
    mesh.castShadow = true
    mesh.scale.set(...size)
    mesh.position.copy(position)
    scene.add(mesh)
    // Canon.js
    // Box is start from center (so we have to devide by 2)
    const shape = new CANNON.Box(new CANNON.Vec3(size[0]*0.5, size[1]*0.5, size[2]*0.5))
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(),
        shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    body.addEventListener('collide', playHitSound)
    world.addBody(body)

    objectsToUpdate.push({
        mesh,
        body
    })
}

createBox([1,1,1], new THREE.Vector3(1, 3, 0))
createSphere(0.5, new THREE.Vector3(0, 5, 0))

debugObject.createSphere = () => 
    createSphere(
        (Math.random() * 0.5), 
        new THREE.Vector3(
            (Math.random() - 0.5) * 3, 
            3, 
            (Math.random() - 0.5) * 3
        )
    )
gui.add(debugObject, 'createSphere')
debugObject.createBox = () => 
    createBox(
        [(Math.random() * 0.5), (Math.random() * 0.5), (Math.random() * 0.5)], 
        new THREE.Vector3(
            (Math.random() - 0.5) * 3, 
            3, 
            (Math.random() - 0.5) * 3
        )
    )
gui.add(debugObject, 'createBox')


debugObject.reset = () => {
    objectsToUpdate.forEach(object => {
        object.body.removeEventListener('collide', playHitSound)
        world.removeBody(object.body)
        scene.remove(object.mesh)
    })
    objectsToUpdate.splice(0, objectsToUpdate.length)
}
gui.add(debugObject, 'reset')


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const delta = clock.getDelta()
    const elapsedTime = clock.getElapsedTime()

    // Update physics world
    world.step(1/60, delta, 3)
    objectsToUpdate.forEach(object => {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    })

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()