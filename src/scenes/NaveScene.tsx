import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createInitialState } from '../state/initialState'
import { useGameLoop } from '../engine/loop'
import { createInputState, bindKeyboard } from '../engine/input'
import { updateReatorPrincipal } from '../systems/reatorPrincipal'
import { updateEletrolisador } from '../systems/eletrolisador'
import { updateSobrevivencia } from '../systems/sobrevivencia'
import { updateMovimento, type Bounds } from '../systems/movimento'
import {
  ELETROLISADOR_SLOT,
  RAIO_INTERACAO,
  CUSTO_ELETROLISADOR,
  pertoDoEletrolisador,
  podeConstruirEletrolisador,
  updateInteracao,
} from '../systems/interacao'
import { ITEM_ACTIONS, usarItem } from '../content/itemActions'
import type { GameState } from '../engine/types'
import type { InputState } from '../engine/input'
import './NaveScene.css'

const CANVAS_W = 640
const CANVAS_H = 360
const BOUNDS: Bounds = { x0: 100, y0: 100, x1: CANVAS_W - 100, y1: CANVAS_H - 100 }
const TILE_SIZE = 32
const PLAYER_RAIO = 12

function cloneForHud(state: GameState): GameState {
  return {
    ...state,
    nave: { ...state.nave },
    jogador: { ...state.jogador },
    inventario: { ...state.inventario },
    construcoes: { eletrolisador: { ...state.construcoes.eletrolisador } },
    posicao: { ...state.posicao },
  }
}

export default function NaveScene() {
  const stateRef = useRef<GameState>(createInitialState())
  const inputRef = useRef<InputState>(createInputState())
  const [hud, setHud] = useState(() => cloneForHud(stateRef.current))
  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const facingRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 1 })

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

    ctx.fillStyle = '#0b0d14'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // chão em grade
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    for (let x = BOUNDS.x0 - TILE_SIZE; x <= BOUNDS.x1 + TILE_SIZE; x += TILE_SIZE) {
      ctx.beginPath()
      ctx.moveTo(x, 70)
      ctx.lineTo(x, canvas.height - 70)
      ctx.stroke()
    }
    for (let y = 70; y <= canvas.height - 70; y += TILE_SIZE) {
      ctx.beginPath()
      ctx.moveTo(70, y)
      ctx.lineTo(canvas.width - 70, y)
      ctx.stroke()
    }

    // casco da nave
    ctx.strokeStyle = '#3a3f55'
    ctx.lineWidth = 2
    ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140)

    // slot do eletrolisador
    const construido = state.construcoes.eletrolisador.construido
    const { x: ex, y: ey } = ELETROLISADOR_SLOT
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

    // prompt de interação
    if (!construido && pertoDoEletrolisador(state) && podeConstruirEletrolisador(state)) {
      ctx.fillStyle = '#f3f4f6'
      ctx.font = 'bold 13px sans-serif'
      ctx.fillText('[E] Construir', ex, ey - 40)
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
  }, [])

  function aplicarAcao(item: string, action: (typeof ITEM_ACTIONS)[string][number]) {
    usarItem(stateRef.current, item, action)
    setHud(cloneForHud(stateRef.current))
    setItemSelecionado(null)
  }

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

      <div className="inventario">
        <h3>Inventário</h3>
        <div className="inventario-grid">
          {Object.entries(hud.inventario).map(([item, qtd]) => {
            const acoes = ITEM_ACTIONS[item]
            const aberto = itemSelecionado === item
            return (
              <div key={item} className="item-slot-wrap">
                <button
                  type="button"
                  className={`item-slot${aberto ? ' aberto' : ''}`}
                  onClick={() => setItemSelecionado(aberto ? null : item)}
                >
                  <span className="item-icon">{item.slice(0, 2).toUpperCase()}</span>
                  <span className="item-nome">{item}</span>
                  <span className="item-qtd">{qtd.toFixed(1)}</span>
                </button>
                {aberto && (
                  <div className="item-acoes">
                    {acoes && acoes.length > 0 ? (
                      acoes.map((acao) => (
                        <button key={acao.label} onClick={() => aplicarAcao(item, acao)}>
                          {acao.label}
                        </button>
                      ))
                    ) : (
                      <span className="sem-acao">sem uso ainda</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
