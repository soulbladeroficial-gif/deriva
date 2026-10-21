import { useState } from 'react'
import './App.css'

type Screen = 'inicio' | 'nave'

function App() {
  const [screen, setScreen] = useState<Screen>('inicio')

  if (screen === 'nave') {
    return (
      <div className="screen screen-nave">
        <h2>Nave</h2>
      </div>
    )
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
