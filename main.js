// === 3D Maze Explorer (fixed version) ===

// Maze parameters
const ROWS = 15;
const COLS = 15;
const CELL_SIZE = 5;

// Set up scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight(0x888888);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(30, 50, 20);
scene.add(dirLight);

// === Maze generation ===
function generateMaze(rows, cols) {
  const maze = Array(rows)
    .fill()
    .map(() => Array(cols).fill(1));

  function carve(x, y) {
    maze[y][x] = 0;
    const dirs = [
      [0, 2],
      [0, -2],
      [2, 0],
      [-2, 0],
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (ny > 0 && ny < rows && nx > 0 && nx < cols && maze[ny][nx] === 1) {
        maze[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);
  return maze;
}

const maze = generateMaze(ROWS, COLS);

// === Build maze walls ===
const wallGeo = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
const wallMat = new THREE.MeshLambertMaterial({ color: 0x2e8b57 });

for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    if (maze[y][x] === 1) {
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(x * CELL_SIZE, CELL_SIZE / 2, y * CELL_SIZE);
      scene.add(wall);
    }
  }
}

// === Add floor ===
const floorGeo = new THREE.PlaneGeometry(ROWS * CELL_SIZE, COLS * CELL_SIZE);
const floorMat = new THREE.MeshLambertMaterial({ color: 0x303030 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// === Player setup ===
const player = {
  x: 1,
  y: 1,
  angle: 0,
};
camera.position.set(player.x * CELL_SIZE, 2, player.y * CELL_SIZE);

// === Movement controls ===
const keys = {};
document.addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
document.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

function canMove(x, z) {
  const mx = Math.floor(x / CELL_SIZE);
  const mz = Math.floor(z / CELL_SIZE);
  return maze[mz] && maze[mz][mx] === 0;
}

function updatePlayer() {
  const moveSpeed = 0.1 * CELL_SIZE;
  const rotSpeed = 0.05;

  if (keys["arrowleft"]) player.angle += rotSpeed;
  if (keys["arrowright"]) player.angle -= rotSpeed;

  let dx = 0,
    dz = 0;
  if (keys["arrowup"]) {
    dx = Math.sin(player.angle) * moveSpeed;
    dz = Math.cos(player.angle) * moveSpeed;
  }
  if (keys["arrowdown"]) {
    dx = -Math.sin(player.angle) * moveSpeed;
    dz = -Math.cos(player.angle) * moveSpeed;
  }

  const newX = camera.position.x + dx;
  const newZ = camera.position.z + dz;

  if (canMove(newX, newZ)) {
    camera.position.x = newX;
    camera.position.z = newZ;
  }

  camera.rotation.y = player.angle;
}

// === Animation loop ===
function animate() {
  requestAnimationFrame(animate);
  updatePlayer();
  renderer.render(scene, camera);
}
animate();

// Handle resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
