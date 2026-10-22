import { useCallback, useEffect, useRef, useState } from 'react'
import { createInitialState } from '../state/initialState'
import { useGameLoop } from '../engine/loop'
import { updateReatorPrincipal } from '../systems/reatorPrincipal'
import { updateEletrolisador } from '../systems/eletrolisador'
import { updateSobrevivencia } from '../systems/sobrevivencia'
import type { GameState } from '../engine/types'
import './NaveScene.css'

const CUSTO_ELETROLISADOR: Record<string, number> = {
  'Ferro-Níquel': 3,
  'Cobre Nativo': 2,
}

function update(state: GameState, dt: number) {
  state.nave.energiaConsumida = 0
  updateReatorPrincipal(state)
  updateEletrolisador(state, dt)
  updateSobrevivencia(state, dt)
}

function cloneForHud(state: GameState): GameState {
  return {
    ...state,
    nave: { ...state.nave },
    jogador: { ...state.jogador },
    inventario: { ...state.inventario },
    construcoes: { eletrolisador: { ...state.construcoes.eletrolisador } },
  }
}

export default function NaveScene() {
  const stateRef = useRef<GameState>(createInitialState())
  const [hud, setHud] = useState(() => cloneForHud(stateRef.current))
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const render = useCallback((state: GameState) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#05060a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#3a3f55'
    ctx.lineWidth = 2
    ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160)

    if (state.construcoes.eletrolisador.construido) {
      ctx.fillStyle = '#4fd1c5'
      ctx.fillRect(120, 120, 60, 60)
      ctx.fillStyle = '#e5e7eb'
      ctx.font = '12px sans-serif'
      ctx.fillText('Eletrolisador', 108, 198)
    }
  }, [])

  useGameLoop(stateRef, update, render)

  useEffect(() => {
    const id = setInterval(() => {
      setHud(cloneForHud(stateRef.current))
    }, 200)
    return () => clearInterval(id)
  }, [])

  function construirEletrolisador() {
    const inv = stateRef.current.inventario
    if (stateRef.current.construcoes.eletrolisador.construido) return
    const podeConstruir = Object.entries(CUSTO_ELETROLISADOR).every(
      ([item, qtd]) => (inv[item] ?? 0) >= qtd,
    )
    if (!podeConstruir) return
    for (const [item, qtd] of Object.entries(CUSTO_ELETROLISADOR)) {
      inv[item] -= qtd
    }
    stateRef.current.construcoes.eletrolisador.construido = true
    setHud(cloneForHud(stateRef.current))
  }

  function beberAgua() {
    const inv = stateRef.current.inventario
    if ((inv['Água Pura'] ?? 0) < 1) return
    inv['Água Pura'] -= 1
    stateRef.current.jogador.sede = Math.max(0, stateRef.current.jogador.sede - 20)
    setHud(cloneForHud(stateRef.current))
  }

  function comerBiomassa() {
    const inv = stateRef.current.inventario
    if ((inv['Biomassa Comum'] ?? 0) < 1) return
    inv['Biomassa Comum'] -= 1
    stateRef.current.jogador.fome = Math.max(0, stateRef.current.jogador.fome - 20)
    setHud(cloneForHud(stateRef.current))
  }

  return (
    <div className="nave-scene">
      <h2>Nave</h2>
      <canvas ref={canvasRef} width={640} height={360} className="nave-canvas" />

      <div className="hud">
        <div className="hud-bar">
          <span>Energia</span>
          <progress value={hud.nave.energiaConsumida} max={Math.max(hud.nave.energiaGerada, 1)} />
          <small>{hud.nave.energiaConsumida.toFixed(1)} / {hud.nave.energiaGerada.toFixed(1)} W</small>
        </div>
        <div className="hud-bar">
          <span>O2 da nave</span>
          <progress value={hud.nave.oxigenio} max={hud.nave.oxigenioMax} />
          <small>{hud.nave.oxigenio.toFixed(0)} / {hud.nave.oxigenioMax}</small>
        </div>
        <div className="hud-bar">
          <span>Fome</span>
          <progress value={hud.jogador.fome} max={100} />
        </div>
        <div className="hud-bar">
          <span>Sede</span>
          <progress value={hud.jogador.sede} max={100} />
        </div>
        <div className="hud-bar">
          <span>Vida</span>
          <progress value={hud.jogador.vida} max={hud.jogador.vidaMax} />
        </div>
      </div>

      <div className="inventario">
        <h3>Inventário</h3>
        <ul>
          {Object.entries(hud.inventario).map(([item, qtd]) => (
            <li key={item}>{item}: {qtd.toFixed(2)}</li>
          ))}
        </ul>
      </div>

      <div className="acoes">
        <button onClick={construirEletrolisador} disabled={hud.construcoes.eletrolisador.construido}>
          {hud.construcoes.eletrolisador.construido
            ? 'Eletrolisador construído'
            : 'Construir Eletrolisador (3 Ferro-Níquel + 2 Cobre Nativo)'}
        </button>
        <button onClick={beberAgua}>Beber água</button>
        <button onClick={comerBiomassa}>Comer</button>
      </div>
    </div>
  )
}
