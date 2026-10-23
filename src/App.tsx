import { useRef, useState } from 'react'
import NaveScene from './scenes/NaveScene'
import PlanetaScene from './scenes/PlanetaScene'
import { createInitialState } from './state/initialState'
import type { GameState } from './engine/types'
import './App.css'

type Screen = 'inicio' | 'nave' | 'planeta'

function App() {
  const [screen, setScreen] = useState<Screen>('inicio')
  const stateRef = useRef<GameState>(createInitialState())

  if (screen === 'nave') {
    return <NaveScene stateRef={stateRef} onExplorarPlaneta={() => setScreen('planeta')} />
  }

  if (screen === 'planeta') {
    return <PlanetaScene stateRef={stateRef} onVoltarParaNave={() => setScreen('nave')} />
  }

  return (
    <div className="screen screen-inicio">
      <h1>Voyage Deriva</h1>
      <button type="button" onClick={() => setScreen('nave')}>
        Nova Viagem
      </button>
    </div>
  )
}

export default App
