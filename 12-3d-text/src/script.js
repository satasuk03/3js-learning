import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import GUI from 'lil-gui'
// import typefaceFont from 'three/addons/fonts/helvetiker_regular.typeface.json'
import { FontLoader } from 'three/addons/loaders/FontLoader'
import { TextGeometry } from 'three/addons/geometries/TextGeometry' 

/**
 * Need to use TypeFace.js font
 * https://gero3.github.io/facetype.js/
 */

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Axes helper
// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/8.png')
matcapTexture.colorSpace = THREE.SRGBColorSpace


/**
 * Fonts
 */
const fontLoader = new FontLoader()
fontLoader.load('/fonts/Zerove_Regular.typeface.json', (font) => {
    const textGeometry = new TextGeometry('Satasuk Vip', {
        font,
        size: 0.5,
        depth: 0.2,
        curveSegments: 5,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 4,
    })

    const material = new THREE.MeshMatcapMaterial({matcap: matcapTexture})
    const text = new THREE.Mesh(textGeometry, material)

    // textGeometry.computeBoundingBox() // by default it uses sphere
    // console.log(textGeometry.boundingBox)
    textGeometry.center()
    // -0.02, -0.03 to include bevel
    // textGeometry.translate(
    //     -(textGeometry.boundingBox.max.x-0.02) * 0.5,
    //     -(textGeometry.boundingBox.max.y-0.02) * 0.5,
    //     -(textGeometry.boundingBox.max.z-0.03) * 0.5,
    // )
    // textGeometry.computeBoundingBox()
    // console.log('recomputed',textGeometry.boundingBox)
    scene.add(text)

    const startTime = Date.now()
    /**
     * If put donutGeometry here, it will be faster like 10x
     * compared put it into the for loop
     */
    const donutGeometry = new THREE.TorusGeometry(0.35, 0.20, 20, 45)
    for (let i = 0; i < 300; i++) {
        const donut = new THREE.Mesh(donutGeometry, material)

        donut.position.x = (Math.random()-0.5) * 10
        donut.position.y = (Math.random()-0.5) * 10
        donut.position.z = (Math.random()-0.5) * 10

        donut.rotation.x = Math.random() * Math.PI
        donut.rotation.y = Math.random() * Math.PI

        const scale = Math.random()
        donut.scale.set(scale, scale, scale)

        scene.add(donut)
    }
    const endTime = Date.now()
    console.log(`Time taken: ${endTime - startTime}ms`)
})

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
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()