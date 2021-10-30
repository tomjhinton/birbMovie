import './style.scss'
import * as THREE from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import vertexShaderScreen from './shaders/screen/vertex.glsl'
import fragmentShaderScreen from './shaders/screen/fragment.glsl'

import vertexShaderHonk from './shaders/honk/vertex.glsl'
import fragmentShaderHonk from './shaders/honk/fragment.glsl'


const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

const gtlfLoader = new GLTFLoader()


const geometryScreen = new THREE.PlaneGeometry( 2, 2, 128, 128)


// Materials
const materialScreen = new THREE.ShaderMaterial({
  vertexShader: vertexShaderScreen,
  fragmentShader: fragmentShaderScreen,
  transparent: true,
  depthWrite: true,
  clipShadows: true,
  wireframe: false,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: {
      value: 0
    },
    uMouse: {
      value: {x: 0.5, y: 0.5}
    },
    uResolution: { type: 'v2', value: new THREE.Vector2() },
    uPosition: {
      value: {
        x: 0
      }
    }
  }
})

const materialText = new THREE.ShaderMaterial({
  vertexShader: vertexShaderHonk,
  fragmentShader: fragmentShaderHonk,
  transparent: true,
  depthWrite: true,
  clipShadows: true,
  wireframe: false,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: {
      value: 0
    },
    uMouse: {
      value: {x: 0.5, y: 0.5}
    },
    uResolution: { type: 'v2', value: new THREE.Vector2() },
    uPosition: {
      value: {
        x: 0
      }
    }
  }
})



//Mouse stuff
window.addEventListener('mousemove', function (e) {
  materialScreen.uniforms.uMouse.value.x =  (e.clientX / window.innerWidth) * 2 - 1
  materialScreen.uniforms.uMouse.value.y = -(event.clientY / window.innerHeight) * 2 + 1

})




const screenMesh = new THREE.Mesh(geometryScreen, materialScreen)



scene.add(screenMesh)




const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () =>{

  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2 ))

  materialScreen.uniforms.uResolution.value.x = renderer.domElement.width
  materialScreen.uniforms.uResolution.value.y = renderer.domElement.height


})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
scene.add(camera)



/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})

renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.setClearColor( 0x000000, 1 )

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()


//Text stuff

let textMesh
var loader = new THREE.FontLoader()
loader.load( 'Tapeworm_RegularH.json', function ( font ) {

  var textGeometry = new THREE.TextGeometry( 'Birbs go honk,  the movie', {

    font: font,

    size: 1,
    height: 1,
    curveSegments: 0,

    bevelThickness: 1.,
    bevelSize: 1.,
    bevelEnabled: false

  })



  textMesh = new THREE.Mesh( textGeometry, materialText )

  scene.add( textMesh )


  textMesh.position.z-=15
  textMesh.position.x-=8
})


//Model stuff

let sceneGroup, mixer
gtlfLoader.load(
  'birds.glb',
  (gltf) => {

    gltf.scene.scale.set(1.5,1.5,1.5)
    sceneGroup = gltf.scene
    sceneGroup.needsUpdate = true
    sceneGroup.position.z -= 17
    sceneGroup.position.x += 1.6
    scene.add(sceneGroup)

    if(gltf.animations[0]){
      mixer = new THREE.AnimationMixer(gltf.scene)

      const action2 = mixer.clipAction(gltf.animations[1])

      action2.play()

    }


  }
)


const light = new THREE.AmbientLight( 0x404040 )
scene.add( light )



const clock = new THREE.Clock()

const tick = () =>{
  if ( mixer ) mixer.update( clock.getDelta() )
  const elapsedTime = clock.getElapsedTime()


  if(materialScreen.uniforms.uResolution.value.x === 0 && materialScreen.uniforms.uResolution.value.y === 0 ){
    materialScreen.uniforms.uResolution.value.x = renderer.domElement.width
    materialScreen.uniforms.uResolution.value.y = renderer.domElement.height
  }

  materialScreen.uniforms.uTime.value = elapsedTime

  materialText.uniforms.uTime.value = elapsedTime


  renderer.render(scene, camera)


  window.requestAnimationFrame(tick)
}

tick()
