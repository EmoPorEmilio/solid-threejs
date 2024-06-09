import { createSignal } from 'solid-js'
import './App.css'

function App() {
  const [count, setCount] = createSignal(0)

  return (
    <main>
      <canvas id ="main_canvas"></canvas>
    </main>
  )
}

export default App
