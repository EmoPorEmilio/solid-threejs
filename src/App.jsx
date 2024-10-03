import { createSignal, onMount } from 'solid-js'
import './App.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import * as CANNON from 'cannon-es';

const MAX_WIDTH = 512;
const MAX_HEIGHT = 512;

// Constants
const SPHERE_RADIUS = 0.2;
const FLOOR_SIZE = 10;
const SPAWN_HEIGHT = 10;
const ANIMATION_DURATION = 5000; // 5 seconds in milliseconds

// Color constants
const WHITE = 0xFFFFFF;
const RED = 0xD91E26; // WYEWORKS red

function App() {
  let scene, camera, renderer, physicsWorld, floor, spheres = [];
  let specialSpheres = [];
  let animationStartTime;
  let font;

  function init() {
    // Set up Three.js scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Set up physics world
    physicsWorld = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0)
    });

    // Create floor
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({
      mass: 0,
      shape: floorShape
    });
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    physicsWorld.addBody(floorBody);

    const floorGeometry = new THREE.PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Set camera position
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Load font
    const loader = new FontLoader();
    loader.load('Merriweather_Regular.json', (loadedFont) => {
      font = loadedFont;
      createSpecialSpheres();
      animationStartTime = Date.now();
      animate();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  function createSpecialSpheres() {
    const positions = [
      [-2, 0, 0], [-1.5, 0, 0], [-1, 0, 0], [-0.5, 0, 0], // W, Y, E, dot
      [0.5, 0, 0], [1, 0, 0], [1.5, 0, 0], [2, 0, 0], [2.5, 0, 0] // W, O, R, K, S
    ];
    const colors = [WHITE, WHITE, WHITE, WHITE, RED, RED, RED, RED, RED];

    positions.forEach((pos, index) => {
      const sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 32);
      const sphereMaterial = new THREE.MeshLambertMaterial({ color: colors[index] });
      const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

      const sphereBody = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Sphere(SPHERE_RADIUS),
        position: new CANNON.Vec3(pos[0], SPAWN_HEIGHT, pos[2])
      });

      physicsWorld.addBody(sphereBody);
      scene.add(sphereMesh);
      specialSpheres.push({ body: sphereBody, mesh: sphereMesh, targetPosition: new THREE.Vector3(...pos) });
    });
  }

  function spawnRandomSphere() {
    const sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 32);
    const sphereMaterial = new THREE.MeshLambertMaterial({
      color: Math.random() < 0.5 ? WHITE : RED
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

    const sphereBody = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(SPHERE_RADIUS),
      position: new CANNON.Vec3(
        (Math.random() - 0.5) * FLOOR_SIZE,
        SPAWN_HEIGHT,
        (Math.random() - 0.5) * FLOOR_SIZE
      )
    });

    physicsWorld.addBody(sphereBody);
    scene.add(sphereMesh);
    spheres.push({ body: sphereBody, mesh: sphereMesh });
  }

  function updateSpheres(elapsedTime) {
    const progress = Math.min(elapsedTime / ANIMATION_DURATION, 1);

    // Update special spheres
    specialSpheres.forEach((sphere, index) => {
      if (progress < 1) {
        sphere.body.position.copy(sphere.mesh.position);
        sphere.body.velocity.set(0, 0, 0);
      } else {
        const targetPos = sphere.targetPosition;
        sphere.mesh.position.lerp(targetPos, 0.1);
        sphere.body.position.copy(sphere.mesh.position);
      }
    });

    // Update random spheres
    for (let i = spheres.length - 1; i >= 0; i--) {
      const sphere = spheres[i];
      if (progress < 1) {
        sphere.mesh.position.copy(sphere.body.position);
        sphere.mesh.quaternion.copy(sphere.body.quaternion);
      } else {
        scene.remove(sphere.mesh);
        physicsWorld.removeBody(sphere.body);
        spheres.splice(i, 1);
      }
    }

    // Spawn random spheres during the first 5 seconds
    if (progress < 1 && Math.random() < 0.1 * (1 - progress)) {
      spawnRandomSphere();
    }
  }

  function morphToLetters() {
    const textGeometry = new TextGeometry('WYEWORKS', {
      font: font,
      size: 1,
      height: 0.2,
    });

    textGeometry.computeBoundingBox();
    textGeometry.center();

    const textMesh = new THREE.Mesh(textGeometry);
    const textPoints = textMesh.geometry.attributes.position.array;

    specialSpheres.forEach((sphere, index) => {
      if (index < specialSpheres.length - 1) { // Exclude the last sphere (dot)
        const targetPosition = new THREE.Vector3(
          textPoints[index * 3],
          textPoints[index * 3 + 1],
          textPoints[index * 3 + 2]
        );
        sphere.mesh.position.copy(targetPosition);
        sphere.body.position.copy(targetPosition);
      }
    });
  }

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = Date.now() - animationStartTime;
    updateSpheres(elapsedTime);

    if (elapsedTime >= ANIMATION_DURATION) {
      morphToLetters();
    }

    physicsWorld.step(1 / 60);
    renderer.render(scene, camera);
  }

  onMount(() => init())

  return (<></>)
}

export default App