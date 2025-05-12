// === Three.js Scene Setup ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#threeCanvas'),
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.sortObjects = false;

camera.position.z = 20;

// === Node Parameters ===
const NODE_COUNT = 120;
const nodes = [];
const nodeGroup = new THREE.Group();
const nodeGeometry = new THREE.SphereGeometry(0.07, 8, 8);
const baseMaterial = new THREE.MeshBasicMaterial({
    color: 0x800080,
    transparent: true,
    opacity: 0.25,
    depthWrite: false
});

// Create nodes with random positions and velocities
for (let i = 0; i < NODE_COUNT; i++) {
    const node = new THREE.Mesh(nodeGeometry, baseMaterial.clone());
    node.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15
    );
    node.basePosition = node.position.clone();
    node.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
    );
    nodes.push(node);
    nodeGroup.add(node);
}
scene.add(nodeGroup);

// === Line Setup ===
let lineSegments;
const MAX_CONNECTION_DISTANCE = 3.5; // Only connect nearby nodes

function createLineSegments() {
    // Prepare arrays for line positions
    const positions = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i].position;
            const b = nodes[j].position;
            const dist = a.distanceTo(b);
            if (dist < MAX_CONNECTION_DISTANCE) {
                positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
            }
        }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
    );
    // Very transparent gray lines
    const material = new THREE.LineBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.10 // 10% alpha
    });
    if (lineSegments) scene.remove(lineSegments);
    lineSegments = new THREE.LineSegments(geometry, material);
    scene.add(lineSegments);
}

// === Mouse Interaction ===
let mouse3D = new THREE.Vector3(0, 0, 0);

function onMouseMove(event) {
    // Convert mouse to NDC (-1 to +1)
    const ndc = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
    };
    // Project mouse onto z=0 plane in world space
    const vector = new THREE.Vector3(ndc.x, ndc.y, 0.5).unproject(camera);
    mouse3D.copy(vector);
}
window.addEventListener('mousemove', onMouseMove);

// === Animation Parameters ===
const clock = new THREE.Clock();
const params = {
    blinkSpeed: 0.8,
    waveIntensity: 0.8,
    scaleVariation: 0.4,
    gravityStrength: 0.018 // Attraction force to mouse
};

// === Animation Loop ===
function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Animate nodes
    nodes.forEach(node => {
        // Blinking effect
        node.material.opacity = Math.abs(Math.sin(
            time * params.blinkSpeed * Math.random() * Math.PI
        )) * 0.25 + 0.25;

        // Space vector transformations
        node.position.x = node.basePosition.x + Math.sin(time * 0.3 + node.position.z) * params.waveIntensity;
        node.position.y = node.basePosition.y + Math.cos(time * 0.4 + node.position.x) * params.waveIntensity;
        node.position.z = node.basePosition.z + Math.sin(time * 0.5 + node.position.y) * params.waveIntensity;

        // Gravity-like attraction to mouse
        const dir = new THREE.Vector3().subVectors(mouse3D, node.position);
        const dist = dir.length();
        if (dist < 7) { // Only attract if mouse is not too far
            dir.normalize();
            node.position.addScaledVector(dir, params.gravityStrength * (7 - dist));
        }

        // Scale pulsation
        node.scale.setScalar(
            Math.sin(time * 0.5 + node.position.x) * params.scaleVariation + 1.2
        );
    });

    // Group rotation
    nodeGroup.rotation.x = time * 0.05;
    nodeGroup.rotation.y = time * 0.03;

    // Update lines
    createLineSegments();

    renderer.render(scene, camera);
}

// === Responsive Resize ===
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Start Animation ===
animate();
