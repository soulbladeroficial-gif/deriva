import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react'
import { useGameLoop } from '../engine/loop'
import { createInputState, bindKeyboard } from '../engine/input'
import { updateSobrevivencia } from '../systems/sobrevivencia'
import { updateMovimento, type Bounds } from '../systems/movimento'
import { updateOxigenioTraje } from '../systems/oxigenioTraje'
import { updateColeta, pertoDoDeposito } from '../systems/coleta'
import { DEPOSITO_ROCHAS, NOME_PLANETA, ITEM_COLETADO } from '../content/rochosoArido'
import { cloneForHud } from '../state/cloneForHud'
import InventoryGrid from '../ui/InventoryGrid'
import type { GameState } from '../engine/types'
import type { InputState } from '../engine/input'
import './PlanetaScene.css'

const CANVAS_W = 640
const CANVAS_H = 360
const BOUNDS: Bounds = { x0: 20, y0: 20, x1: CANVAS_W - 20, y1: CANVAS_H - 20 }
const SPAWN_PLANETA = { x: 120, y: 180 }
const PLAYER_RAIO = 12

interface Props {
  stateRef: MutableRefObject<GameState>
  onVoltarParaNave: () => void
}

export default function PlanetaScene({ stateRef, onVoltarParaNave }: Props) {
  const inputRef = useRef<InputState>(createInputState())
  const [hud, setHud] = useState(() => cloneForHud(stateRef.current))
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const facingRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 1 })

  useEffect(() => {
    stateRef.current.posicao = { ...SPAWN_PLANETA }
  }, [stateRef])

  const update = useCallback((state: GameState, dt: number) => {
    const input = inputRef.current
    if (input.up || input.down || input.left || input.right) {
      facingRef.current = {
        dx: (input.right ? 1 : 0) - (input.left ? 1 : 0),
        dy: (input.down ? 1 : 0) - (input.up ? 1 : 0),
      }
    }
    updateSobrevivencia(state, dt)
    updateOxigenioTraje(state, dt)
    updateMovimento(state, input, dt, BOUNDS)
    updateColeta(state, input)
  }, [])

  const render = useCallback((state: GameState) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#3a2a1f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 1
    for (let x = 0; x <= canvas.width; x += 32) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y <= canvas.height; y += 32) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // depósito de rochas
    const { x: dx0, y: dy0 } = DEPOSITO_ROCHAS
    ctx.fillStyle = '#8a7a6a'
    ;[
      [0, 0],
      [18, -10],
      [-16, 8],
      [10, 16],
    ].forEach(([ox, oy]) => {
      ctx.beginPath()
      ctx.arc(dx0 + ox, dy0 + oy, 16, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.fillStyle = '#e5e7eb'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Depósito de Rochas', dx0, dy0 + 42)

    if (pertoDoDeposito(state)) {
      ctx.fillStyle = '#f3f4f6'
      ctx.font = 'bold 13px sans-serif'
      ctx.fillText('[E] Minerar', dx0, dy0 - 32)
    }

    // personagem
    const { x: px, y: py } = state.posicao
    ctx.fillStyle = '#f3f4f6'
    ctx.beginPath()
    ctx.arc(px, py, PLAYER_RAIO, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#0b0d14'
    ctx.lineWidth = 2
    ctx.stroke()

    const { dx, dy } = facingRef.current
    ctx.fillStyle = '#4fd1c5'
    ctx.beginPath()
    ctx.arc(px + dx * PLAYER_RAIO, py + dy * PLAYER_RAIO, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.textAlign = 'left'
  }, [])

  useGameLoop(stateRef, update, render)

  useEffect(() => bindKeyboard(inputRef.current), [])

  useEffect(() => {
    const id = setInterval(() => {
      setHud(cloneForHud(stateRef.current))
    }, 150)
    return () => clearInterval(id)
  }, [stateRef])

  function voltar() {
    stateRef.current.jogador.oxigenioTraje = stateRef.current.jogador.oxigenioTrajeMax
    onVoltarParaNave()
  }

  return (
    <div className="planeta-scene">
      <h2>{NOME_PLANETA}</h2>
      <p className="dica">WASD/setas pra andar · chegue perto do depósito e aperte E pra minerar {ITEM_COLETADO}</p>
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="planeta-canvas" />

      <div className="hud">
        <div className="hud-bar">
          <span>O2 do traje</span>
          <progress value={hud.jogador.oxigenioTraje} max={hud.jogador.oxigenioTrajeMax} />
          <small>{hud.jogador.oxigenioTraje.toFixed(0)} / {hud.jogador.oxigenioTrajeMax}</small>
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

      <div className="acoes">
        <button type="button" onClick={voltar}>
          Voltar pra nave
        </button>
      </div>

      <InventoryGrid
        inventario={hud.inventario}
        stateRef={stateRef}
        onChange={() => setHud(cloneForHud(stateRef.current))}
      />
    </div>
  )
}
