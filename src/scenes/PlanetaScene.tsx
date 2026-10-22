import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react'
import { useGameLoop } from '../engine/loop'
import { createInputState, bindKeyboard } from '../engine/input'
import { computeCamera } from '../engine/camera'
import { drawGridFloor } from '../rendering/drawGridFloor'
import { updateSobrevivencia } from '../systems/sobrevivencia'
import { updateMovimento, type Bounds } from '../systems/movimento'
import { updateOxigenioTraje } from '../systems/oxigenioTraje'
import { updateColeta, depositoMaisProximo } from '../systems/coleta'
import { DEPOSITOS, NOME_PLANETA } from '../content/rochosoArido'
import { cloneForHud } from '../state/cloneForHud'
import InventoryGrid from '../ui/InventoryGrid'
import type { GameState } from '../engine/types'
import type { InputState } from '../engine/input'
import './PlanetaScene.css'

const CANVAS_W = 640
const CANVAS_H = 360
const BOUNDS: Bounds = { x0: 20, y0: 20, x1: 1380, y1: 880 }
const SPAWN_PLANETA = { x: 150, y: 450 }
const TILE_SIZE = 32
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

    const camera = computeCamera(state.posicao.x, state.posicao.y, CANVAS_W, CANVAS_H)

    ctx.fillStyle = '#3a2a1f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawGridFloor(ctx, camera, CANVAS_W, CANVAS_H, TILE_SIZE, 'rgba(0,0,0,0.15)')

    // depósitos de recurso
    const alvo = depositoMaisProximo(state)
    for (const dep of DEPOSITOS) {
      const dx0 = dep.posicao.x - camera.x
      const dy0 = dep.posicao.y - camera.y
      ctx.fillStyle = dep.cor
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
      ctx.fillText(dep.nome, dx0, dy0 + 42)

      if (alvo?.id === dep.id) {
        ctx.fillStyle = '#f3f4f6'
        ctx.font = 'bold 13px sans-serif'
        ctx.fillText('[E] Coletar', dx0, dy0 - 32)
      }
    }

    // personagem — sempre centralizado na tela
    const px = CANVAS_W / 2
    const py = CANVAS_H / 2
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
      <p className="dica">WASD/setas pra andar · chegue perto de um depósito e aperte E pra coletar</p>
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
