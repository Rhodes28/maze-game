import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.0/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/controls/PointerLockControls.js';
import { Maze } from './maze.js';

let camera, scene, renderer, controls;
let maze;
const size = 24;

// Pick song file
const songIndex = Math.ceil(Math.random() * 3);
const song = new Audio(`music/${songIndex}.mp3`);
song.loop = true;
song.volume = 0.4;

// Create a cube texture loader
const cubeLoader = new THREE.CubeTextureLoader();
let envMap;

// Pick environment and skybox based on song
if (songIndex === 1) {
  // Park2
  envMap = cubeLoader.load([
    'https://threejs.org/examples/textures/cube/Park2/posx.jpg',
    'https://threejs.org/examples/textures/cube/Park2/negx.jpg',
    'https://threejs.org/examples/textures/cube/Park2/posy.jpg',
    'https://threejs.org/examples/textures/cube/Park2/negy.jpg',
    'https://threejs.org/examples/textures/cube/Park2/posz.jpg',
    'https://threejs.org/examples/textures/cube/Park2/negz.jpg'
  ]);
} else if (songIndex === 2) {
  // Bridge2
  envMap = cubeLoader.load([
    'https://threejs.org/examples/textures/cube/Bridge2/posx.jpg',
    'https://threejs.org/examples/textures/cube/Bridge2/negx.jpg',
    'https://threejs.org/examples/textures/cube/Bridge2/posy.jpg',
    'https://threejs.org/examples/textures/cube/Bridge2/negy.jpg',
    'https://threejs.org/examples/textures/cube/Bridge2/posz.jpg',
    'https://threejs.org/examples/textures/cube/Bridge2/negz.jpg'
  ]);
} else {
  // MilkyWay
  envMap = cubeLoader.load([
    'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_px.jpg',
    'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_nx.jpg',
    'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_py.jpg',
    'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_ny.jpg',
    'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_pz.jpg',
    'https://threejs.org/examples/textures/cube/MilkyWay/dark-s_nz.jpg'
  ]);
}

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = envMap; // Skybox now matches

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new PointerLockControls(camera, document.body);
  document.addEventListener('click', () => controls.lock());
  scene.add(controls.getObject());

  // Maze generation
  maze = new Maze(size, size);
  maze.generate();
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  const reflectiveMaterial = new THREE.MeshStandardMaterial({
    envMap: envMap,
    metalness: 1.0,
    roughness: 0.05
  });

  // Create maze walls and floor
  const offset = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (maze.grid[y][x] === 1) {
        const wall = new THREE.Mesh(geometry, reflectiveMaterial);
        wall.position.set(x - offset, 0.5, y - offset);
        scene.add(wall);
      }
    }
  }

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    reflectiveMaterial
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  scene.add(floor);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(5, 10, 7);
  scene.add(ambient, directional);

  // Camera start position
  camera.position.set(0, 1.6, 0);

  song.play();

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
