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
  hitboxesConstrucoes,
  instanciaPorId,
  pertoDe,
  podeColocarEm,
  colocarPendente,
  updateConstrucoesNave,
} from '../systems/construcoesNave'
import { BANCADA_FABRICACAO_ID } from '../content/construcoesNave'
import { updatePanes, podeRepararCasco, repararCasco, pertoDaAvaria } from '../systems/casco'
import { dormir } from '../systems/dormitorio'
import { PAREDES, SALAS, CAMA, SAIDA, RAIO_SALA, TUBOS, LARGURA_TUBO } from '../content/salasNave'
import { cloneForHud } from '../state/cloneForHud'
import InventarioModal from '../ui/InventarioModal'
import ConstrucaoDetalheModal from '../ui/ConstrucaoDetalheModal'
import BancadaModal from '../ui/BancadaModal'
import PainelNaveModal from '../ui/PainelNaveModal'
import type { GameState } from '../engine/types'
import type { InputState } from '../engine/input'
import './NaveScene.css'

const MARGEM_CASCO = 40
const MUNDO = { x0: 0, y0: 0, x1: 1400, y1: 1120 }
const BOUNDS: Bounds = {
  x0: MUNDO.x0 + MARGEM_CASCO,
  y0: MUNDO.y0 + MARGEM_CASCO,
  x1: MUNDO.x1 - MARGEM_CASCO,
  y1: MUNDO.y1 - MARGEM_CASCO,
}
const SPAWN_NAVE = { x: 700, y: 360 }
const TILE_SIZE = 32
const PLAYER_RAIO = 12
/** quanto mais perto a câmera fica — não dá mais pra ver a nave toda de uma vez */
const ZOOM = 1.7
/** vista superior levemente inclinada (~30°) — achata o eixo Y na hora de desenhar */
const INCLINACAO = (30 * Math.PI) / 180
const ZOOM_Y = ZOOM * Math.cos(INCLINACAO)
const COR_PISO_SALA = '#15182a'

interface Props {
  stateRef: MutableRefObject<GameState>
  onExplorarPlaneta: () => void
}

export default function NaveScene({ stateRef, onExplorarPlaneta }: Props) {
  const inputRef = useRef<InputState>(createInputState())
  const [hud, setHud] = useState(() => cloneForHud(stateRef.current))
  const [avisoSono, setAvisoSono] = useState<string | null>(null)
  const [inventarioAberto, setInventarioAberto] = useState(false)
  const [painelAberto, setPainelAberto] = useState(false)
  const [detalheId, setDetalheId] = useState<string | null>(null)
  const [bancadaAberta, setBancadaAberta] = useState(false)
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
    const resize = () => {
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
    updateMovimento(state, input, dt, BOUNDS, [...PAREDES, ...hitboxesConstrucoes(state)], PLAYER_RAIO)
    updateConstrucoesNave(state, dt)
    updatePanes(state, dt)
  }, [])

  function posicaoDoMouseNoMundo(camera: { x: number; y: number }) {
    const worldX = mouseRef.current.x / ZOOM + camera.x
    const worldY = mouseRef.current.y / ZOOM_Y + camera.y
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

    const viewW = canvas.width / ZOOM
    const viewH = canvas.height / ZOOM_Y
    const camera = computeCamera(state.posicao.x, state.posicao.y, viewW, viewH)

    ctx.save()
    ctx.scale(ZOOM, ZOOM_Y)

    drawEspacoExterior(ctx, camera, viewW, viewH)
    drawCascoNave(ctx, camera, MUNDO)

    const emEdicao = Boolean(posicionandoRef.current)
    if (emEdicao) {
      drawGridFloor(ctx, camera, viewW, viewH, TILE_SIZE, 'rgba(255,255,255,0.12)')
    }

    // tubos de conexão (visual) entre as salas — corredor orgânico, sem quina
    ctx.strokeStyle = COR_PISO_SALA
    ctx.lineWidth = LARGURA_TUBO
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const tubo of TUBOS) {
      ctx.beginPath()
      ctx.moveTo(tubo.a.x - camera.x, tubo.a.y - camera.y)
      ctx.quadraticCurveTo(tubo.c.x - camera.x, tubo.c.y - camera.y, tubo.b.x - camera.x, tubo.b.y - camera.y)
      ctx.stroke()
    }

    // piso das salas — cápsulas arredondadas, não blocos
    ctx.fillStyle = COR_PISO_SALA
    for (const sala of SALAS) {
      const { x0, y0, x1, y1 } = sala.area
      ctx.beginPath()
      ctx.roundRect(x0 - camera.x, y0 - camera.y, x1 - x0, y1 - y0, RAIO_SALA)
      ctx.fill()
    }

    // paredes — segmentos com cantos levemente arredondados
    ctx.fillStyle = '#4b5168'
    for (const p of PAREDES) {
      ctx.beginPath()
      ctx.roundRect(p.x0 - camera.x, p.y0 - camera.y, p.x1 - p.x0, p.y1 - p.y0, 4)
      ctx.fill()
    }

    // construções colocadas (inclui a Bancada) — só o ícone/cor, sem texto; detalhes ficam na UI
    for (const inst of state.construcoes) {
      if (!inst.colocada || inst.posX === undefined || inst.posY === undefined) continue
      const d = construcaoPorId(inst.defId)
      if (!d) continue
      const sx = inst.posX - camera.x
      const sy = inst.posY - camera.y
      ctx.fillStyle = d.cor
      ctx.beginPath()
      ctx.roundRect(sx - 28, sy - 28, 56, 56, 10)
      ctx.fill()
    }

    // cama do dormitório
    const bx = CAMA.x - camera.x
    const by = CAMA.y - camera.y
    ctx.fillStyle = '#581c87'
    ctx.beginPath()
    ctx.roundRect(bx - 32, by - 18, 64, 36, 8)
    ctx.fill()

    // saída da nave (porta/airlock) — é por onde se vai pro planeta
    const ex = SAIDA.x - camera.x
    const ey = SAIDA.y - camera.y
    ctx.fillStyle = '#0d9488'
    ctx.beginPath()
    ctx.roundRect(ex - 22, ey - 32, 44, 64, 10)
    ctx.fill()

    // rachadura da avaria — brilho vermelho visível de longe
    if (state.nave.paneLocal) {
      const rx = state.nave.paneLocal.x - camera.x
      const ry = state.nave.paneLocal.y - camera.y
      const brilho = ctx.createRadialGradient(rx, ry, 4, rx, ry, 70)
      brilho.addColorStop(0, 'rgba(248,113,113,0.55)')
      brilho.addColorStop(1, 'rgba(248,113,113,0)')
      ctx.fillStyle = brilho
      ctx.beginPath()
      ctx.arc(rx, ry, 70, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#f87171'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(rx - 10, ry - 14)
      ctx.lineTo(rx - 2, ry - 2)
      ctx.lineTo(rx - 8, ry + 4)
      ctx.lineTo(rx + 2, ry + 14)
      ctx.stroke()
    }

    // ghost de posicionamento — segue o mouse, ajustado na malha
    if (posicionandoRef.current) {
      const inst = instanciaPorId(state, posicionandoRef.current)
      const def = inst && construcaoPorId(inst.defId)
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
        ctx.textAlign = 'center'
        ctx.fillText(valido ? `Clique pra posicionar ${def.nome}` : 'Posição inválida', viewW / 2, 30)
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
    ctx.restore()
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
      if (e.key === 'Escape') {
        setPosicionando(null)
        setInventarioAberto(false)
        setDetalheId(null)
        setBancadaAberta(false)
        setPainelAberto(false)
        return
      }
      if (posicionandoRef.current) return
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault()
        setInventarioAberto((v) => !v)
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        abrirConstrucaoProximaRef.current()
      }
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        setPainelAberto((v) => !v)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onMouseMoveCanvas(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function onClickCanvas() {
    if (!posicionandoRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const camera = computeCamera(
      stateRef.current.posicao.x,
      stateRef.current.posicao.y,
      canvas.width / ZOOM,
      canvas.height / ZOOM_Y,
    )
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

  function abrirConstrucaoProxima() {
    const proxima = construcaoColocadaProxima(hud)
    if (!proxima) return
    if (proxima.defId === BANCADA_FABRICACAO_ID) setBancadaAberta(true)
    else setDetalheId(proxima.id)
  }

  const abrirConstrucaoProximaRef = useRef(abrirConstrucaoProxima)
  useEffect(() => {
    abrirConstrucaoProximaRef.current = abrirConstrucaoProxima
  })

  const construcaoProxima = construcaoColocadaProxima(hud)
  const pertoDaCama = pertoDe(hud, CAMA)
  const pertoDaSaida = pertoDe(hud, SAIDA)
  const detalheInst = detalheId ? instanciaPorId(hud, detalheId) : null

  return (
    <div className="nave-scene">
      <canvas
        ref={canvasRef}
        className={`nave-canvas-full${posicionando ? ' posicionando' : ''}`}
        onMouseMove={onMouseMoveCanvas}
        onClick={onClickCanvas}
      />

      <div className="hud-jogador hud-jogador-esquerda">
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
              Inventário (E)
            </button>
            <button type="button" onClick={() => setPainelAberto(true)}>
              Painel da Nave (P)
            </button>
            {pertoDaSaida && (
              <button type="button" onClick={onExplorarPlaneta}>
                Sair da nave
              </button>
            )}
            {pertoDaAvaria(hud) && (
              <button type="button" onClick={reparar} disabled={!podeRepararCasco(hud)}>
                Reparar rachadura (2 Peças)
              </button>
            )}
            {construcaoProxima && (
              <button type="button" onClick={abrirConstrucaoProxima}>
                Abrir {construcaoPorId(construcaoProxima.defId)?.nome} (F)
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
          onPosicionar={(instId) => {
            setInventarioAberto(false)
            setPosicionando(instId)
          }}
        />
      )}

      {painelAberto && <PainelNaveModal hud={hud} onClose={() => setPainelAberto(false)} />}

      {detalheInst && (
        <ConstrucaoDetalheModal
          inst={detalheInst}
          hud={hud}
          stateRef={stateRef}
          onChange={() => setHud(cloneForHud(stateRef.current))}
          onClose={() => setDetalheId(null)}
          onMover={(instId) => setPosicionando(instId)}
        />
      )}

      {bancadaAberta && (
        <BancadaModal
          hud={hud}
          stateRef={stateRef}
          onChange={() => setHud(cloneForHud(stateRef.current))}
          onClose={() => setBancadaAberta(false)}
        />
      )}
    </div>
  )
}
