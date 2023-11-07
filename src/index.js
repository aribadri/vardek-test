import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


// инициализируем переменные
const scaleWidthInput = document.getElementById('scale-width');
const scaleHeightInput = document.getElementById('scale-height');
const BACKGROUND_COLOR = new THREE.Color(0xf1f1f1);


// cubemap

const reflectionCubeTexture = new THREE.CubeTextureLoader().load([
    'textures/posx.jpg', 'textures/negx.jpg',
    'textures/posy.jpg', 'textures/negy.jpg',
    'textures/posz.jpg', 'textures/negz.jpg'
]);

// текстура двери
const textureLoader = new THREE.TextureLoader();
const doorTexture = textureLoader.load('textures/door-texture.jpeg');


// создаем сцену
const scene = new THREE.Scene();


// камера
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.set(0, 8.5, 25);
scene.add(camera);

// создаем рендер
const renderer = new THREE.WebGLRenderer();
renderer.antialias = true
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio * 2);

// добавляем сцену в дом
document.body.appendChild(renderer.domElement);


// примитив плейн (пол)
const groundGeometry = new THREE.PlaneGeometry(500, 500);
const groundMaterial = new THREE.MeshPhysicalMaterial({
    color: BACKGROUND_COLOR,
    roughness: 0.2,
    metalness: 0.8,
    envMap: reflectionCubeTexture,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);


// reflection


const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512, {
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
});

const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget)
const pivot = new THREE.Object3D()
scene.add(pivot)

const reflectionMaterial = new THREE.MeshPhongMaterial({
    envMap: cubeRenderTarget.texture,
})

// примитив сфера
const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), reflectionMaterial)
ball.position.set(3.5, 1, 5);
ball.castShadow = true
ball.receiveShadow = true
ball.add(cubeCamera)
pivot.add(ball)


// материал для стекла
const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.7,
    envMap: reflectionCubeTexture,

});

// примитив куб
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cube = new THREE.Mesh(cubeGeometry, glassMaterial);
cube.castShadow = true;
cube.position.set(-3.5, 1, 5);
cube.scale.set(0.9, 0.9, 0.9);
scene.add(cube);


// загружаем glb модель
let door
const modelLoader = new GLTFLoader();
modelLoader.load('models/door.glb', (glb) => {
    glb.scene.traverse((child) => {
        if (child.isMesh) {
            console.log(child)
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.name && child.name === 'Cube001_Material002_0') {
                child.material = glassMaterial // устнавливаем отражение на стекло двери
            } else {
                child.material.map = doorTexture // устанавливаем текстуру дерева на дверь
            }
        }
    });

    door = glb.scene;
    door.scale.set(.05, .05, .05);
    door.position.set(2, 0, 0);
    scene.add(door);
});

// свет
const ambientLight = new THREE.AmbientLight(0xffffff, .3);
const directionLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionLight.position.set(0, 5, 6);
directionLight.castShadow = true;
directionLight.shadow.camera.near = 1;
directionLight.shadow.camera.far = 100;
directionLight.shadow.mapSize.width = 2048;
directionLight.shadow.mapSize.height = 2048;
directionLight.shadow.bias = -0.002;
scene.add(directionLight, ambientLight);



// система координат
const axes = new THREE.AxesHelper(50);
axes.position.set(0, 0, 0); scene.add(axes);


// управление камерой
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;
controls.maxPolarAngle = Math.PI / 2 - 0.08;
controls.minDistance = 5;
controls.maxDistance = 35;


// уменьшения и увелечения скейла двери
const onWidthInputChange = () => {
    const newScaleWidth = parseFloat(scaleWidthInput.value);
    if (!isNaN(newScaleWidth) && door) {
      door.scale.x = newScaleWidth;
      directionLight.shadow.map.needsUpdate = true;
    }
  };
  
  const onHeightInputChange = () => {
    const newScaleHeight = parseFloat(scaleHeightInput.value);
    if (!isNaN(newScaleHeight) && door) {
      door.scale.y = newScaleHeight;
      directionLight.shadow.map.needsUpdate = true;
    }
  };
  

// окружение 

const envSphereGeometry = new THREE.SphereGeometry(50, 128, 128);
const envSphereMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('textures/env.jpeg'),
    side: THREE.BackSide,
});
const environmentSphere = new THREE.Mesh(envSphereGeometry, envSphereMaterial);
scene.add(environmentSphere);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    onWidthInputChange();
    onHeightInputChange();
    cubeCamera.update(renderer, scene)
    renderer.render(scene, camera);
}

function onWindowResize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
}

window.addEventListener('resize', onWindowResize);
scaleWidthInput.addEventListener('input', onWidthInputChange);
scaleHeightInput.addEventListener('input', onHeightInputChange);


onWindowResize();
animate();
