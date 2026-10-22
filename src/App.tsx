import { useState } from 'react'
import NaveScene from './scenes/NaveScene'
import './App.css'

type Screen = 'inicio' | 'nave'

function App() {
  const [screen, setScreen] = useState<Screen>('inicio')

  if (screen === 'nave') {
    return <NaveScene />
  }

  return (
    <div className="screen screen-inicio">
      <h1>Deriva</h1>
      <button type="button" onClick={() => setScreen('nave')}>
        Nova Viagem
      </button>
    </div>
  )
}

export default App
