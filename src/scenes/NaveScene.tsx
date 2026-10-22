import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { useGameLoop } from '../engine/loop'
import { createInputState, bindKeyboard } from '../engine/input'
import { computeCamera } from '../engine/camera'
import { drawGridFloor } from '../rendering/drawGridFloor'
import { updateReatorPrincipal } from '../systems/reatorPrincipal'
import { updateEletrolisador } from '../systems/eletrolisador'
import { updateSobrevivencia } from '../systems/sobrevivencia'
import { updateMovimento, type Bounds } from '../systems/movimento'
import {
  ELETROLISADOR_SLOT,
  CUSTO_ELETROLISADOR,
  pertoDoEletrolisador,
  podeConstruirEletrolisador,
  updateInteracao,
} from '../systems/interacao'
import { cloneForHud } from '../state/cloneForHud'
import InventoryGrid from '../ui/InventoryGrid'
import type { GameState } from '../engine/types'
import type { InputState } from '../engine/input'
import './NaveScene.css'

const CANVAS_W = 640
const CANVAS_H = 360
const MARGEM_CASCO = 40
const MUNDO = { x0: 0, y0: 0, x1: 900, y1: 550 }
const BOUNDS: Bounds = {
  x0: MUNDO.x0 + MARGEM_CASCO,
  y0: MUNDO.y0 + MARGEM_CASCO,
  x1: MUNDO.x1 - MARGEM_CASCO,
  y1: MUNDO.y1 - MARGEM_CASCO,
}
const SPAWN_NAVE = { x: 450, y: 275 }
const TILE_SIZE = 32
const PLAYER_RAIO = 12

interface Props {
  stateRef: MutableRefObject<GameState>
  onExplorarPlaneta: () => void
}

export default function NaveScene({ stateRef, onExplorarPlaneta }: Props) {
  const inputRef = useRef<InputState>(createInputState())
  const [hud, setHud] = useState(() => cloneForHud(stateRef.current))
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const facingRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 1 })

  useEffect(() => {
    stateRef.current.posicao = { ...SPAWN_NAVE }
  }, [stateRef])

  const update = useCallback((state: GameState, dt: number) => {
    const input = inputRef.current
    if (input.up || input.down || input.left || input.right) {
      facingRef.current = {
        dx: (input.right ? 1 : 0) - (input.left ? 1 : 0),
        dy: (input.down ? 1 : 0) - (input.up ? 1 : 0),
      }
    }
    state.nave.energiaConsumida = 0
    updateReatorPrincipal(state)
    updateEletrolisador(state, dt)
    updateSobrevivencia(state, dt)
    updateMovimento(state, input, dt, BOUNDS)
    updateInteracao(state, input)
  }, [])

  const render = useCallback((state: GameState) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const camera = computeCamera(state.posicao.x, state.posicao.y, CANVAS_W, CANVAS_H)

    ctx.fillStyle = '#0b0d14'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawGridFloor(ctx, camera, CANVAS_W, CANVAS_H, TILE_SIZE, 'rgba(255,255,255,0.04)')

    // casco da nave (em coordenadas de mundo, convertido pra tela)
    ctx.strokeStyle = '#3a3f55'
    ctx.lineWidth = 2
    ctx.strokeRect(
      MUNDO.x0 - camera.x,
      MUNDO.y0 - camera.y,
      MUNDO.x1 - MUNDO.x0,
      MUNDO.y1 - MUNDO.y0,
    )

    // slot do eletrolisador
    const construido = state.construcoes.eletrolisador.construido
    const ex = ELETROLISADOR_SLOT.x - camera.x
    const ey = ELETROLISADOR_SLOT.y - camera.y
    if (construido) {
      ctx.fillStyle = '#4fd1c5'
      ctx.fillRect(ex - 28, ey - 28, 56, 56)
      ctx.fillStyle = '#e5e7eb'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Eletrolisador', ex, ey + 44)
    } else {
      ctx.strokeStyle = 'rgba(192,132,252,0.5)'
      ctx.setLineDash([4, 4])
      ctx.strokeRect(ex - 28, ey - 28, 56, 56)
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(192,132,252,0.7)'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Construir Eletrolisador', ex, ey + 44)
    }

    if (!construido && pertoDoEletrolisador(state) && podeConstruirEletrolisador(state)) {
      ctx.fillStyle = '#f3f4f6'
      ctx.font = 'bold 13px sans-serif'
      ctx.fillText('[E] Construir', ex, ey - 40)
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
    ctx.fillStyle = '#c084fc'
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

  const custoTexto = useMemo(
    () => Object.entries(CUSTO_ELETROLISADOR).map(([item, qtd]) => `${qtd} ${item}`).join(' + '),
    [],
  )

  return (
    <div className="nave-scene">
      <h2>Nave</h2>
      <p className="dica">WASD/setas pra andar · chegue perto de um slot e aperte E pra construir ({custoTexto})</p>
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="nave-canvas" />

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

      <div className="acoes">
        <button type="button" onClick={onExplorarPlaneta}>
          Explorar planeta próximo (Rochoso Árido)
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
