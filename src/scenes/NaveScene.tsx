import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react'
import { useGameLoop } from '../engine/loop'
import { createInputState, bindKeyboard } from '../engine/input'
import { computeCamera } from '../engine/camera'
import { drawGridFloor } from '../rendering/drawGridFloor'
import { updateReatorPrincipal } from '../systems/reatorPrincipal'
import { updateSobrevivencia } from '../systems/sobrevivencia'
import { updateMovimento, type Bounds } from '../systems/movimento'
import {
  acaoUparDisponivel,
  capacidadeBuffer,
  construcaoColocadaProxima,
  construcaoNoSlot,
  depositar,
  pendentes,
  pertoDe,
  podeDepositar,
  removerColocada,
  slotVazioProximo,
  updateConstrucoesNave,
} from '../systems/construcoesNave'
import { descricaoBuffer, descricaoConversor } from '../systems/conversor'
import { updatePanes, podeRepararCasco, repararCasco } from '../systems/casco'
import { dormir } from '../systems/dormitorio'
import { SALAS, CAMA } from '../content/salasNave'
import { cloneForHud } from '../state/cloneForHud'
import InventoryGrid from '../ui/InventoryGrid'
import ConstrucoesMenu from '../ui/ConstrucoesMenu'
import type { GameState } from '../engine/types'
import type { InputState } from '../engine/input'
import './NaveScene.css'

const CANVAS_W = 640
const CANVAS_H = 360
const MARGEM_CASCO = 40
const MUNDO = { x0: 0, y0: 0, x1: 1400, y1: 820 }
const BOUNDS: Bounds = {
  x0: MUNDO.x0 + MARGEM_CASCO,
  y0: MUNDO.y0 + MARGEM_CASCO,
  x1: MUNDO.x1 - MARGEM_CASCO,
  y1: MUNDO.y1 - MARGEM_CASCO,
}
const SPAWN_NAVE = { x: 700, y: 400 }
const TILE_SIZE = 32
const PLAYER_RAIO = 12

interface Props {
  stateRef: MutableRefObject<GameState>
  onExplorarPlaneta: () => void
}

export default function NaveScene({ stateRef, onExplorarPlaneta }: Props) {
  const inputRef = useRef<InputState>(createInputState())
  const [hud, setHud] = useState(() => cloneForHud(stateRef.current))
  const [avisoSono, setAvisoSono] = useState<string | null>(null)
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
    updateSobrevivencia(state, dt)
    updateMovimento(state, input, dt, BOUNDS)
    updateConstrucoesNave(state, input, dt)
    updatePanes(state, dt)
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

    ctx.strokeStyle = '#23263a'
    ctx.lineWidth = 2
    ctx.strokeRect(
      MUNDO.x0 - camera.x,
      MUNDO.y0 - camera.y,
      MUNDO.x1 - MUNDO.x0,
      MUNDO.y1 - MUNDO.y0,
    )

    for (const sala of SALAS) {
      const sx0 = sala.area.x0 - camera.x
      const sy0 = sala.area.y0 - camera.y
      ctx.strokeStyle = '#3a3f55'
      ctx.lineWidth = 2
      ctx.strokeRect(sx0, sy0, sala.area.x1 - sala.area.x0, sala.area.y1 - sala.area.y0)
      ctx.fillStyle = '#6b7280'
      ctx.font = '13px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(sala.nome, sx0 + 10, sy0 + 20)

      sala.slots.forEach((slotPos, i) => {
        const sx = slotPos.x - camera.x
        const sy = slotPos.y - camera.y
        const def = construcaoNoSlot(state, sala.id, i)

        if (def) {
          const inst = state.construcoes[def.id]
          ctx.fillStyle = def.cor
          ctx.fillRect(sx - 28, sy - 28, 56, 56)
          ctx.fillStyle = '#e5e7eb'
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`${def.nome} Nv${inst.nivel}`, sx, sy + 44)
          if (def.conversor) {
            ctx.fillStyle = '#9ca3af'
            ctx.font = '10px sans-serif'
            ctx.fillText(descricaoConversor(def.conversor, inst.nivel), sx, sy + 58)
            const bufferTexto = descricaoBuffer(def.conversor, inst.bufferEntrada, capacidadeBuffer(def))
            if (bufferTexto) {
              ctx.fillStyle = '#7dd3fc'
              ctx.fillText(bufferTexto, sx, sy + 70)
            }
          }
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.15)'
          ctx.setLineDash([4, 4])
          ctx.strokeRect(sx - 28, sy - 28, 56, 56)
          ctx.setLineDash([])
        }
      })
    }

    // cama do dormitório
    const bx = CAMA.x - camera.x
    const by = CAMA.y - camera.y
    ctx.fillStyle = '#581c87'
    ctx.fillRect(bx - 32, by - 18, 64, 36)
    ctx.fillStyle = '#e5e7eb'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Cama', bx, by + 34)

    // prompt de interação — upar tem prioridade sobre instalar
    const upar = acaoUparDisponivel(state)
    if (upar) {
      const inst = state.construcoes[upar.id]
      const sala = SALAS.find((s) => s.id === inst.salaId)
      const slot = sala?.slots[inst.slotIndex ?? -1]
      if (slot) {
        ctx.fillStyle = '#f3f4f6'
        ctx.font = 'bold 13px sans-serif'
        ctx.fillText(`[E] Upar p/ Nv${inst.nivel + 1}`, slot.x - camera.x, slot.y - camera.y - 40)
      }
    } else {
      const slotVazio = slotVazioProximo(state)
      const pend = pendentes(state)
      if (slotVazio && pend.length > 0) {
        const slot = slotVazio.sala.slots[slotVazio.slotIndex]
        ctx.fillStyle = '#f3f4f6'
        ctx.font = 'bold 13px sans-serif'
        ctx.fillText(`[E] Instalar ${pend[0].nome}`, slot.x - camera.x, slot.y - camera.y - 40)
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

  function reparar() {
    repararCasco(stateRef.current)
    setHud(cloneForHud(stateRef.current))
  }

  function remover() {
    const def = construcaoColocadaProxima(stateRef.current)
    if (!def) return
    removerColocada(stateRef.current, def.id)
    setHud(cloneForHud(stateRef.current))
  }

  function depositarAgora() {
    const def = construcaoColocadaProxima(stateRef.current)
    if (!def) return
    depositar(stateRef.current, def.id)
    setHud(cloneForHud(stateRef.current))
  }

  function dormirAgora() {
    const resultado = dormir(stateRef.current)
    setHud(cloneForHud(stateRef.current))
    const minutos = Math.round(resultado.segundosPassados / 60)
    setAvisoSono(
      resultado.teveAvaria
        ? `Dormiu ~${minutos} min e acordou com uma pane na nave.`
        : `Dormiu ~${minutos} min sem imprevistos.`,
    )
    setTimeout(() => setAvisoSono(null), 4000)
  }

  const construcaoProximaParaRemover = construcaoColocadaProxima(hud)
  const pertoDaCama = pertoDe(hud, CAMA)

  return (
    <div className="nave-scene">
      <h2>Nave</h2>
      <p className="dica">
        WASD/setas pra andar · crie construções no menu abaixo · leve até um slot vazio e aperte E
        pra instalar · chegue perto de uma instalada e aperte E pra upar · construções que
        processam material (Eletrolisador, Oficina etc.) têm um estoque próprio — deposite o
        material nelas pra elas funcionarem
      </p>
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="nave-canvas" />
      {avisoSono && <p className="aviso-sono">{avisoSono}</p>}

      <div className="hud">
        <div className="hud-bar">
          <span>Casco</span>
          <progress value={hud.nave.casco} max={hud.nave.cascoMax} />
          <small>{hud.nave.casco.toFixed(0)} / {hud.nave.cascoMax}</small>
        </div>
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
        <button type="button" onClick={reparar} disabled={!podeRepararCasco(hud)}>
          Reparar Casco (2 Peças)
        </button>
        {construcaoProximaParaRemover && (
          <button type="button" onClick={remover}>
            Remover {construcaoProximaParaRemover.nome}
          </button>
        )}
        {construcaoProximaParaRemover?.conversor?.consomeItem && (
          <button
            type="button"
            onClick={depositarAgora}
            disabled={!podeDepositar(hud, construcaoProximaParaRemover)}
          >
            Depositar {construcaoProximaParaRemover.conversor.consomeItem.item}
          </button>
        )}
        {pertoDaCama && (
          <button type="button" onClick={dormirAgora}>
            Dormir
          </button>
        )}
      </div>

      <ConstrucoesMenu
        hud={hud}
        stateRef={stateRef}
        onChange={() => setHud(cloneForHud(stateRef.current))}
      />

      <InventoryGrid
        inventario={hud.inventario}
        stateRef={stateRef}
        onChange={() => setHud(cloneForHud(stateRef.current))}
      />
    </div>
  )
}
