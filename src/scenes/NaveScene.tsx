import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react'
import { useGameLoop } from '../engine/loop'
import { createInputState, bindKeyboard } from '../engine/input'
import { computeCamera } from '../engine/camera'
import { drawGridFloor } from '../rendering/drawGridFloor'
import { drawEspacoExterior, drawCascoNave } from '../rendering/drawShipHull'
import { updateReatorPrincipal } from '../systems/reatorPrincipal'
import { updateSobrevivencia } from '../systems/sobrevivencia'
import { updateMovimento, type Bounds } from '../systems/movimento'
import {
  construcaoColocadaProxima,
  construcaoPorId,
  descricaoBufferDef,
  pertoDe,
  podeColocarEm,
  colocarPendente,
  updateConstrucoesNave,
} from '../systems/construcoesNave'
import { descricaoConversor } from '../systems/conversor'
import { updatePanes, podeRepararCasco, repararCasco } from '../systems/casco'
import { dormir } from '../systems/dormitorio'
import { PAREDES, CAMA, BANCADA_FABRICACAO } from '../content/salasNave'
import { cloneForHud } from '../state/cloneForHud'
import InventarioModal from '../ui/InventarioModal'
import ConstrucaoDetalheModal from '../ui/ConstrucaoDetalheModal'
import type { GameState } from '../engine/types'
import type { InputState } from '../engine/input'
import './NaveScene.css'

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
  const [inventarioAberto, setInventarioAberto] = useState(false)
  const [detalheId, setDetalheId] = useState<string | null>(null)
  const [posicionando, setPosicionando] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const facingRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 1 })
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const posicionandoRef = useRef<string | null>(null)

  useEffect(() => {
    posicionandoRef.current = posicionando
  }, [posicionando])

  useEffect(() => {
    stateRef.current.posicao = { ...SPAWN_NAVE }
  }, [stateRef])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

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
    updateMovimento(state, input, dt, BOUNDS, PAREDES, PLAYER_RAIO)
    updateConstrucoesNave(state, dt)
    updatePanes(state, dt)
  }, [])

  function posicaoDoMouseNoMundo(camera: { x: number; y: number }) {
    const worldX = mouseRef.current.x + camera.x
    const worldY = mouseRef.current.y + camera.y
    return {
      x: Math.round(worldX / TILE_SIZE) * TILE_SIZE,
      y: Math.round(worldY / TILE_SIZE) * TILE_SIZE,
    }
  }

  const render = useCallback((state: GameState) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const viewW = canvas.width
    const viewH = canvas.height
    const camera = computeCamera(state.posicao.x, state.posicao.y, viewW, viewH)

    drawEspacoExterior(ctx, camera, viewW, viewH)
    drawCascoNave(ctx, camera, MUNDO)

    const emEdicao = Boolean(posicionandoRef.current)
    if (emEdicao) {
      drawGridFloor(ctx, camera, viewW, viewH, TILE_SIZE, 'rgba(255,255,255,0.12)')
    }

    ctx.fillStyle = '#4b5168'
    for (const p of PAREDES) {
      ctx.fillRect(p.x0 - camera.x, p.y0 - camera.y, p.x1 - p.x0, p.y1 - p.y0)
    }

    for (const defId of Object.keys(state.construcoes)) {
      const inst = state.construcoes[defId]
      if (!inst?.colocada || inst.posX === undefined || inst.posY === undefined) continue
      const d = construcaoPorId(defId)
      if (!d) continue
      const sx = inst.posX - camera.x
      const sy = inst.posY - camera.y
      ctx.fillStyle = d.cor
      ctx.fillRect(sx - 28, sy - 28, 56, 56)
      ctx.fillStyle = '#e5e7eb'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${d.nome} Nv${inst.nivel}`, sx, sy + 44)
      if (d.conversor) {
        const texto = descricaoConversor(d.conversor, inst.nivel)
        if (texto) {
          ctx.fillStyle = '#9ca3af'
          ctx.font = '10px sans-serif'
          ctx.fillText(texto, sx, sy + 58)
        }
      }
      const bufferTexto = descricaoBufferDef(d, inst)
      if (bufferTexto) {
        ctx.fillStyle = '#7dd3fc'
        ctx.font = '10px sans-serif'
        ctx.fillText(bufferTexto, sx, sy + 70)
      }
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

    // bancada de fabricação
    const kx = BANCADA_FABRICACAO.x - camera.x
    const ky = BANCADA_FABRICACAO.y - camera.y
    ctx.fillStyle = '#92400e'
    ctx.fillRect(kx - 34, ky - 22, 68, 44)
    ctx.fillStyle = '#e5e7eb'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Bancada', kx, ky + 38)

    // ghost de posicionamento — segue o mouse, ajustado na malha
    if (posicionandoRef.current) {
      const def = construcaoPorId(posicionandoRef.current)
      if (def) {
        const alvo = posicaoDoMouseNoMundo(camera)
        const valido = podeColocarEm(state, alvo)
        const sx = alvo.x - camera.x
        const sy = alvo.y - camera.y
        ctx.globalAlpha = 0.55
        ctx.fillStyle = valido ? def.cor : '#f87171'
        ctx.fillRect(sx - 28, sy - 28, 56, 56)
        ctx.globalAlpha = 1
        ctx.strokeStyle = valido ? '#4ade80' : '#f87171'
        ctx.lineWidth = 2
        ctx.strokeRect(sx - 28, sy - 28, 56, 56)
        ctx.fillStyle = '#f3f4f6'
        ctx.font = 'bold 13px sans-serif'
        ctx.fillText(
          valido ? `Clique pra posicionar ${def.nome}` : 'Posição inválida',
          viewW / 2,
          40,
        )
      }
    }

    // personagem — sempre centralizado na tela
    const px = viewW / 2
    const py = viewH / 2
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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setPosicionando(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function onMouseMoveCanvas(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function onClickCanvas() {
    if (!posicionandoRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const camera = computeCamera(stateRef.current.posicao.x, stateRef.current.posicao.y, canvas.width, canvas.height)
    const alvo = posicaoDoMouseNoMundo(camera)
    if (!podeColocarEm(stateRef.current, alvo)) return
    colocarPendente(stateRef.current, posicionandoRef.current, alvo)
    setPosicionando(null)
    setHud(cloneForHud(stateRef.current))
  }

  function reparar() {
    repararCasco(stateRef.current)
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

  const construcaoProxima = construcaoColocadaProxima(hud)
  const pertoDaCama = pertoDe(hud, CAMA)
  const detalheDef = detalheId ? construcaoPorId(detalheId) : null
  const capacidadeEnergia = Math.max(hud.nave.energiaGerada, 1)
  const energiaDisponivel = Math.max(0, hud.nave.energiaGerada - hud.nave.energiaConsumida)

  return (
    <div className="nave-scene">
      <canvas
        ref={canvasRef}
        className={`nave-canvas-full${posicionando ? ' posicionando' : ''}`}
        onMouseMove={onMouseMoveCanvas}
        onClick={onClickCanvas}
      />

      <div className="hud-nave">
        <span className="hud-titulo">NAVE</span>
        <div className="hud-linha">
          <span>Casco</span>
          <progress value={hud.nave.casco} max={hud.nave.cascoMax} />
        </div>
        <div className="hud-linha">
          <span>Energia</span>
          <progress value={energiaDisponivel} max={capacidadeEnergia} />
        </div>
        <div className="hud-linha">
          <span>O2</span>
          <progress value={hud.nave.oxigenio} max={hud.nave.oxigenioMax} />
        </div>
      </div>

      <div className="hud-jogador">
        <span className="hud-titulo">JOGADOR</span>
        <div className="hud-linha">
          <span>Fome</span>
          <progress value={hud.jogador.fome} max={100} />
        </div>
        <div className="hud-linha">
          <span>Sede</span>
          <progress value={hud.jogador.sede} max={100} />
        </div>
        <div className="hud-linha">
          <span>Vida</span>
          <progress value={hud.jogador.vida} max={hud.jogador.vidaMax} />
        </div>
      </div>

      {avisoSono && <p className="aviso-sono">{avisoSono}</p>}

      <div className="acoes">
        {posicionando ? (
          <button type="button" onClick={() => setPosicionando(null)}>
            Cancelar posicionamento (Esc)
          </button>
        ) : (
          <>
            <button type="button" onClick={() => setInventarioAberto(true)}>
              Inventário
            </button>
            <button type="button" onClick={onExplorarPlaneta}>
              Explorar planeta próximo (Rochoso Árido)
            </button>
            <button type="button" onClick={reparar} disabled={!podeRepararCasco(hud)}>
              Reparar Casco (2 Peças)
            </button>
            {construcaoProxima && (
              <button type="button" onClick={() => setDetalheId(construcaoProxima.id)}>
                Abrir {construcaoProxima.nome}
              </button>
            )}
            {pertoDaCama && (
              <button type="button" onClick={dormirAgora}>
                Dormir
              </button>
            )}
          </>
        )}
      </div>

      {inventarioAberto && (
        <InventarioModal
          hud={hud}
          stateRef={stateRef}
          onChange={() => setHud(cloneForHud(stateRef.current))}
          onClose={() => setInventarioAberto(false)}
          onPosicionar={(defId) => {
            setInventarioAberto(false)
            setPosicionando(defId)
          }}
        />
      )}

      {detalheDef && (
        <ConstrucaoDetalheModal
          def={detalheDef}
          hud={hud}
          stateRef={stateRef}
          onChange={() => setHud(cloneForHud(stateRef.current))}
          onClose={() => setDetalheId(null)}
          onMover={(defId) => setPosicionando(defId)}
        />
      )}
    </div>
  )
}
