import { createSignal, onMount } from 'solid-js'
import './App.css'

// Import necessary Three.js modules
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

const MAX_WIDTH = 512;
const MAX_HEIGHT = 512;



function App() {
  function init() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Materials
    const worksMaterial = new THREE.MeshLambertMaterial({
      color: 0xD91E26,
      shininess: 100,
    });

    const wyeMaterial = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF,
      shininess: 100,
    });

    let wyeMesh, worksMesh;

    const loader = new FontLoader();
    loader.load('Oswald Medium_Regular.json', (font) => {

      const textOptions = {
        font: font,
        size: 1,
        height: 0.2,
        curveSegments: 12,
      };

      // Create "WYE" geometry
      const wyeGeometry = new TextGeometry('WYE', textOptions);
      wyeGeometry.computeBoundingBox();
      wyeGeometry.center();
      wyeMesh = new THREE.Mesh(wyeGeometry, wyeMaterial);
      wyeMesh.position.set(-2, 0, 0);
      scene.add(wyeMesh);

      // Create "WORKS" geometry
      const worksGeometry = new TextGeometry('WORKS', textOptions);
      worksGeometry.computeBoundingBox();
      worksGeometry.center();
      worksMesh = new THREE.Mesh(worksGeometry, worksMaterial);
      worksMesh.position.set(1.2, 0, 0);
      scene.add(worksMesh);

      // Create a small white sphere
      const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32); // Radius of 0.1
      const sphereMaterial = new THREE.MeshLambertMaterial({
        color: 0xFFFFFF,
        shininess: 100,
      }); // White color
      const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

      // Position the sphere
      // You may need to adjust these values based on your text size and position
      sphereMesh.position.set(3.4, -0.5, 0); // Adjust x value to position it after "WORKS"

      // Add the sphere to the scene
      scene.add(sphereMesh);

      // Set camera position after creating meshes
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5; // Zoom out a little so objects don't fill the screen

      camera.position.set(center.x, center.y, center.z + cameraZ);
      camera.lookAt(center);
      controls.target.copy(center);

      // Animation function
      function animate() {
        requestAnimationFrame(animate);
        //if (worksMesh) worksMesh.rotation.y += 0.005;
        controls.update();
        renderer.render(scene, camera);
      }

      animate();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

  }
  onMount(() => init())

  return (<></>
  )
}

export default App
