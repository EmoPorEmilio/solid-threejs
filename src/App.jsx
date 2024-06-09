import { createSignal, onMount } from 'solid-js'
import './App.css'

let mainCanvas;

function drawInitialGrid(gl) {
  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it.",
    );
    return;
  }

  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function App() {
  const [count, setCount] = createSignal(0);

  onMount(() => drawInitialGrid(mainCanvas.getContext('webgl')))

  return (
    <canvas ref={mainCanvas} id="main_canvas"></canvas>
  )
}

export default App
