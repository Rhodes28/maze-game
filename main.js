// Maze parameters
const ROWS = 15;
const COLS = 15;
const CELL_SIZE = 5;

// Set up scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// Generate maze using recursive backtracking
function generateMaze(rows, cols) {
  const maze = Array(rows)
    .fill()
    .map(() => Array(cols).fill(1));

  function carve(x, y) {
    const dirs = [
      [0, 2],
      [0, -2],
      [2, 0],
      [-2, 0],
    ].sort(() => Math.random() - 0.5);

    maze[y][x] = 0;

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

// Build 3D walls
const wallGeo = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
const wallMat = new THREE.MeshLambertMaterial({ color: 0x228b22 });
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    if (maze[y][x] === 1) {
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(x * CELL_SIZE, CELL_SIZE / 2, y * CELL_SIZE);
      scene.add(wall);
    }
  }
}

// Add ground
const groundGeo = new THREE.PlaneGeometry(ROWS * CELL_SIZE, COLS * CELL_SIZE);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Player position and movement
let player = { x: 1, y: 1, angle: 0 };
camera.position.set(player.x * CELL_SIZE, 2, player.y * CELL_SIZE);

const keys = {};
document.addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
document.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

function canMove(x, y) {
  const mx = Math.floor(x / CELL_SIZE);
  const my = Math.floor(y / CELL_SIZE);
  return maze[my] && maze[my][mx] === 0;
}

function updatePlayer() {
  const speed = 0.1 * CELL_SIZE;
  const rotSpeed = 0.05;
  if (keys["arrowleft"]) player.angle += rotSpeed;
  if (keys["arrowright"]) player.angle -= rotSpeed;

  let dx = 0,
    dz = 0;
  if (keys["arrowup"]) {
    dx = Math.sin(player.angle) * speed;
    dz = Math.cos(player.angle) * speed;
  }
  if (keys["arrowdown"]) {
    dx = -Math.sin(player.angle) * speed;
    dz = -Math.cos(player.angle) * speed;
  }

  const newX = player.x * CELL_SIZE + dx;
  const newZ = player.y * CELL_SIZE + dz;

  if (canMove(newX, newZ)) {
    camera.position.x = newX;
    camera.position.z = newZ;
    player.x = newX / CELL_SIZE;
    player.y = newZ / CELL_SIZE;
  }

  camera.rotation.y = player.angle;
}

// Render loop
function animate() {
  requestAnimationFrame(animate);
  updatePlayer();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
