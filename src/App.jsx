import { createSignal, onMount } from 'solid-js'
import './App.css'
import * as THREE from 'three';


function drawInitialGrid() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(512, 512);
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 5;

  function animate() {
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);
  document.getElementById('root').appendChild(renderer.domElement);
}

function App() {
  const [count, setCount] = createSignal(0);

  onMount(() => drawInitialGrid())

  return (<></>
  )
}

export default App
