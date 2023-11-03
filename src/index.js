import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';



const BACKGROUND_COLOR = new THREE.Color(0xf1f1f1);
// const clock = new THREE.Clock();
const scene = new THREE.Scene();
scene.background = new THREE.Color(BACKGROUND_COLOR);
scene.fog = new THREE.Fog(BACKGROUND_COLOR, 10, 100);
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 3000);
camera.position.set(0, 1.5, 10);
scene.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.antialias = true
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
const groundMaterial = new THREE.MeshStandardMaterial({ color: BACKGROUND_COLOR });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0.1;
ground.receiveShadow = true;
scene.add(ground);


const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: '#441010' });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.castShadow = true;
cube.position.set(-1.5, 1, 3);
cube.scale.set(0.6, 0.6, 0.6);
scene.add(cube);

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 'yellow' });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.castShadow = true;
sphere.position.set(1.5, 1, 3);
sphere.scale.set(0.6, 0.6, 0.6);
scene.add(sphere);

const modelLoader = new GLTFLoader();
modelLoader.load('models/metal_door_animated.glb', (gltf) => {
    const door = gltf.scene;
    door.scale.set(.01, .01, .01);
    door.position.set(0, 0, 0);
    door.rotateY = 90
    door.castShadow = true;
    scene.add(door);
});

const directionLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionLight.position.set(0, 6, 4);
directionLight.castShadow = true;
directionLight.shadow.mapSize.width = 1024;
directionLight.shadow.mapSize.height = 1024;
directionLight.shadow.camera.near = 1;
directionLight.shadow.camera.far = 10;
scene.add(directionLight);

const axes = new THREE.AxesHelper(50);
axes.position.set(0, 0, 0); scene.add(axes);



const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;
controls.maxPolarAngle = Math.PI / 2 - 0.08;


function animate() {
    requestAnimationFrame(animate);
    controls.update();
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

onWindowResize();
animate();
