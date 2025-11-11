// === 3D Maze Explorer with working movement and look ===

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101010);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const directional = new THREE.DirectionalLight(0xffffff, 0.8);
directional.position.set(10, 10, 5);
scene.add(directional);

// Maze generation (simple grid maze)
const mazeSize = 10;
const cellSize = 4;
const wallHeight = 3;
const wallThickness = 0.5;
const maze = [];

for (let i = 0; i < mazeSize; i++) {
  maze[i] = [];
  for (let j = 0; j < mazeSize; j++) {
    maze[i][j] = Math.random() > 0.7 ? 1 : 0; // 30% walls
  }
}

// Make sure start and end are open
maze[0][0] = 0;
maze[mazeSize - 1][mazeSize - 1] = 0;

// Build walls
const wallGeo = new THREE.BoxGeometry(cellSize, wallHeight, wallThickness);
const wallMat = new THREE.MeshLambertMaterial({ color: 0x228822 });

for (let i = 0; i < mazeSize; i++) {
  for (let j = 0; j < mazeSize; j++) {
    if (maze[i][j] === 1) {
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(
        i * cellSize - (mazeSize * cellSize) / 2,
        wallHeight / 2,
        j * cellSize - (mazeSize * cellSize) / 2
      );
      wall.scale.z = cellSize; // make full square
      scene.add(wall);
    }
  }
}

// Floor
const floorGeo = new THREE.PlaneGeometry(mazeSize * cellSize, mazeSize * cellSize);
const floorMat = new THREE.MeshLambertMaterial({ color: 0x303030 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let yaw = 0; // rotation around y-axis
let pitch = 0;
const speed = 0.1;
const rotationSpeed = 0.03;

document.addEventListener("keydown", (e) => {
  if (e.key === "w") moveForward = true;
  if (e.key === "s") moveBackward = true;
  if (e.key === "a") moveLeft = true;
  if (e.key === "d") moveRight = true;

  if (e.key === "ArrowLeft") yaw += rotationSpeed * 5;
  if (e.key === "ArrowRight") yaw -= rotationSpeed * 5;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "w") moveForward = false;
  if (e.key === "s") moveBackward = false;
  if (e.key === "a") moveLeft = false;
  if (e.key === "d") moveRight = false;
});

function animate() {
  requestAnimationFrame(animate);

  // Direction vector relative to camera rotation
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

  if (moveForward) camera.position.addScaledVector(forward, -speed);
  if (moveBackward) camera.position.addScaledVector(forward, speed);
  if (moveLeft) camera.position.addScaledVector(right, -speed);
  if (moveRight) camera.position.addScaledVector(right, speed);

  // Apply rotation
  camera.rotation.set(0, yaw, 0);

  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
