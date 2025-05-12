// Three.js Scene Configuration
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#threeCanvas'),
    alpha: true
});

// Renderer Setup
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.sortObjects = false; // Better transparency handling

// Node System Parameters
const NODE_COUNT = 300;
const nodes = [];
const nodeGroup = new THREE.Group();

// Geometry & Material Setup
const nodeGeometry = new THREE.SphereGeometry(0.06, 8, 8);
const baseMaterial = new THREE.MeshBasicMaterial({
    color: 0x800080,    // Purple color
    transparent: true,
    opacity: 0.25,      // Initial 25% alpha
    depthWrite: false   // Essential for transparency
});

// Create Node Network
for(let i = 0; i < NODE_COUNT; i++) {
    const node = new THREE.Mesh(nodeGeometry, baseMaterial.clone());
    
    // Random initial positioning
    node.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15
    );
    
    // Store original position for transformations
    node.basePosition = node.position.clone();
    node.velocity = new THREE.Vector3(
        Math.random() * 0.01 - 0.005,
        Math.random() * 0.01 - 0.005,
        Math.random() * 0.01 - 0.005
    );
    
    nodeGroup.add(node);
    nodes.push(node);
}

scene.add(nodeGroup);
camera.position.z = 20;

// Animation Control
const clock = new THREE.Clock();
const params = {
    blinkSpeed: 0.8,
    waveIntensity: 0.8,
    scaleVariation: 0.4
};

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    
    nodes.forEach(node => {
        // Dynamic opacity (blinking effect)
        node.material.opacity = Math.abs(Math.sin(
            time * params.blinkSpeed * Math.random() * Math.PI
        )) * 0.25 + 0.25;

        // Space vector transformations
        node.position.x = node.basePosition.x + Math.sin(time * 0.3 + node.position.z) * params.waveIntensity;
        node.position.y = node.basePosition.y + Math.cos(time * 0.4 + node.position.x) * params.waveIntensity;
        node.position.z = node.basePosition.z + Math.sin(time * 0.5 + node.position.y) * params.waveIntensity;

        // Scale pulsation
        node.scale.setScalar(
            Math.sin(time * 0.5 + node.position.x) * params.scaleVariation + 1.2
        );
    });

    // Gentle rotation
    nodeGroup.rotation.x = time * 0.05;
    nodeGroup.rotation.y = time * 0.03;

    renderer.render(scene, camera);
}

// Window Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
