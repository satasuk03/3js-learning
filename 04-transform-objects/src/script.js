import * as THREE from 'three'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
const group = new THREE.Group()
scene.add(group)

const cube1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1),  new THREE.MeshBasicMaterial({ color: 0xff0000 }))
const cube2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1),  new THREE.MeshBasicMaterial({ color: 0x00ff00 }))
const cube3 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1),  new THREE.MeshBasicMaterial({ color: 0x0000ff }))
cube1.position.x = -1.5
cube2.position.x = 0
cube3.position.x = 1.5
group.add(cube1, cube2, cube3)

// Axes Helper
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

/**
 * Sizes
 */
const sizes = {
    width: 800,
    height: 600
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.set(0, 0, 3)
group.scale.y = 2
group.rotation.y = Math.PI / 4
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)