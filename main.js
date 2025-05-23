import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const galaxyContainer = document.getElementById('galaxy-container');
const projectDetailsDiv = document.getElementById('project-details');

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
galaxyContainer.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 800;
controls.update();

// Galaxy Background (Fainter Particles for Depth)
const bgParticleCount = 25000;
const bgPositions = new Float32Array(bgParticleCount * 3);
const bgColor = new THREE.Color(0xffffff);
const bgSizes = new Float32Array(bgParticleCount);
const textureLoader = new THREE.TextureLoader();
const starTexture = textureLoader.load('https://threejs.org/examples/textures/sprites/white-point.png');

for (let i = 0; i < bgParticleCount; i++) {
    const i3 = i * 3;
    bgPositions[i3 + 0] = (Math.random() - 0.5) * 2500;
    bgPositions[i3 + 1] = (Math.random() - 0.5) * 2500;
    bgPositions[i3 + 2] = (Math.random() - 0.5) * 2500;
    bgSizes[i] = Math.random() * 1.5 + 0.5;
}

const bgGeometry = new THREE.BufferGeometry();
bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
bgGeometry.setAttribute('size', new THREE.BufferAttribute(bgSizes, 1));

const bgMaterial = new THREE.PointsMaterial({
    sizeAttenuation: true,
    color: 0xffffff,
    size: 2,
    map: starTexture,
    transparent: true,
    alphaTest: 0.01,
    blending: THREE.AdditiveBlending
});

const background = new THREE.Points(bgGeometry, bgMaterial);
scene.add(background);

// Mock research project data
const projects = [
    { id: 'proj1', title: 'Quantum Entanglement Study', topic: 'Quantum Physics', progress: 0.1, size: 15, x: 0, y: 0, z: 100 },
    { id: 'proj2', title: 'Exoplanet Atmosphere Analysis', topic: 'Astrophysics', progress: 0.5, size: 12, x: 150, y: 80, z: -100 },
    { id: 'proj3', title: 'Machine Learning for Drug Discovery', topic: 'AI & Biotech', progress: 0.9, size: 18, x: -100, y: -150, z: 150 },
    { id: 'proj4', title: 'Dark Matter Distribution Mapping', topic: 'Astrophysics', progress: 0.2, size: 10, x: -200, y: 120, z: -120 },
    { id: 'proj5', title: 'Novel Materials Synthesis', topic: 'Materials Science', progress: 0.7, size: 14, x: 120, y: -30, z: 50 },
    { id: 'proj6', title: 'Cosmological Microwave Background Analysis', topic: 'Cosmology', progress: 0.4, size: 11, x: -250, y: 0, z: -150 },
];

function getStarColorByProgress(progress) {
    const step = Math.floor(progress * 10);
    switch (step) {
        case 0: return new THREE.Color(0xb9f2ff); // Bluish-white (O-type)
        case 1: return new THREE.Color(0xffffff); // White (A-type)
        case 2: return new THREE.Color(0xfff5e1); // Yellow-white (F-type)
        case 3: return new THREE.Color(0xfff0d4); // Pale yellow (G-type - like our Sun)
        case 4: return new THREE.Color(0xffdab9); // Yellow-orange (K-type)
        case 5: return new THREE.Color(0xff8c69); // Orange (M-type)
        case 6: return new THREE.Color(0xff69b4); // Pinkish-red (Late M-type/Carbon star) - artistic choice
        case 7: return new THREE.Color(0xff4500); // Red-orange (S-type)
        case 8: return new THREE.Color(0xff0000); // Red (Very late M-type)
        case 9: return new THREE.Color(0x8b00ff); // Violet (White Dwarf - artistic)
        default: return new THREE.Color(0xffffff);
    }
}

const projectStars = [];
const starTextureLoad = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/glow02.png');

// Create project stars (Sprites)
projects.forEach(project => {
    const color = getStarColorByProgress(project.progress);
    const spriteMaterial = new THREE.SpriteMaterial({
        map: starTextureLoad,
        color: color,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: true,
    });
    const starSprite = new THREE.Sprite(spriteMaterial);
    starSprite.scale.set(project.size, project.size, 1);
    starSprite.position.set(project.x, project.y, project.z);
    starSprite.userData = { projectId: project.id, projectData: project };
    scene.add(starSprite);
    projectStars.push(starSprite);
});

// Raycasting for sprites (needs a bit of a workaround as sprites aren't directly in intersects)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(projectStars); // Raycast against the sprites

    if (intersects.length > 0) {
        const intersectedSprite = intersects[0].object;
        if (intersectedSprite.userData && intersectedSprite.userData.projectId) {
            showProjectDetails(intersectedSprite.userData.projectData);
        }
    }
}

function showProjectDetails(project) {
    projectDetailsDiv.innerHTML = `
        <h3>${project.title}</h3>
        <p><strong>Topic:</strong> ${project.topic}</p>
        <p><strong>Progress:</strong> ${(project.progress * 100).toFixed(0)}%</p>
        <button onclick="hideProjectDetails()">Close</button>
    `;
    projectDetailsDiv.style.display = 'block';
}

function hideProjectDetails() {
    projectDetailsDiv.style.display = 'none';
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('click', onMouseClick, false);
animate();
