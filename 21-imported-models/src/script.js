/**
 * GLTF is the best format
 * https://github.com/KhronosGroup/glTF-Sample-Assets
 * 
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader';

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
 * Models
 * 
 * We can add model multiple way (if we have many object in gltf)
 * - Add the whole scene in our scene. We can do that because even if its name is scene, it's in fact a Group.
 * - Add the children of the scene to our scene and ignore the unused PerspectiveCamera.
 * - Filter the children before adding to the scene to remove the unwanted objects like the PerspectiveCamera.
 * - Add only the Mesh but end up with a duck that could be wrongly scaled, positioned or rotated.
 * - Open the file in a 3D software and remove the PerspectiveCamera then export it again.
 */
const gltfLoader = new GLTFLoader()
// gltfLoader.load(
//     // '/models/Duck/glTF/Duck.gltf',
//     // '/models/Duck/glTF-Binary/Duck.glb',
//     '/models/Duck/glTF-Embedded/Duck.gltf',
//     (gltf) => {
//         console.log('loaded')
//         console.log(gltf)
//         scene.add(gltf.scene.children[0])
//     },
//     () => {
//         console.log('progress')
//     },
//     () => {
//         console.log('error')
//     }
// )

// gltfLoader.load(
//     '/models/FlightHelmet/glTF/FlightHelmet.gltf',
//     (gltf) => {
//         console.log('loaded')
//         console.log(gltf)

//         // While loop (because once you add to the scene obj will be moved from the array   )
//         // while (gltf.scene.children.length > 0){
//         //     scene.add(gltf.scene.children[0])
//         // }

//         // Or duplicate children before add to the scene
//         // const children = [...gltf.scene.children]
//         // children.map(child => scene.add(child))

//         // Or just add the scene
//         scene.add(gltf.scene)
//     },
//     () => {
//         console.log('progress')
//     },
//     () => {
//         console.log('error')
//     }  
// )

// Better for 15MB models (huge)
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/libs/draco/');
gltfLoader.setDRACOLoader(dracoLoader)

gltfLoader.load(
    '/models/Duck/glTF-Draco/Duck.gltf',
    (gltf) => {
        scene.add(gltf.scene)
    }
)

/**
 * Fox with Animation
 */
let mixer;
gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf) => {
        mixer = new THREE.AnimationMixer(gltf.scene)

        const action = mixer.clipAction(gltf.animations[2])
        action.play()

        gltf.scene.scale.set(0.03, 0.03, 0.03)
        scene.add(gltf.scene)
    }
)
/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
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
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
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
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    mixer?.update(deltaTime)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()