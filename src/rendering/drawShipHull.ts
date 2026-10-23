import type { Camera } from '../engine/camera'

interface Mundo {
  x0: number
  y0: number
  x1: number
  y1: number
}

function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

/** campo de estrelas fora do casco — determinístico por posição de mundo, sem precisar guardar estado */
export function drawEspacoExterior(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  viewW: number,
  viewH: number,
) {
  ctx.fillStyle = '#05060a'
  ctx.fillRect(0, 0, viewW, viewH)

  const CELL = 48
  const startX = Math.floor(camera.x / CELL) * CELL
  const startY = Math.floor(camera.y / CELL) * CELL

  for (let wx = startX; wx <= camera.x + viewW + CELL; wx += CELL) {
    for (let wy = startY; wy <= camera.y + viewH + CELL; wy += CELL) {
      const h = hash(wx, wy)
      if (h > 0.08) continue
      const sx = wx - camera.x + h * CELL
      const sy = wy - camera.y + hash(wy, wx) * CELL
      const r = h > 0.04 ? 1 : 2
      ctx.fillStyle = h > 0.04 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.8)'
      ctx.beginPath()
      ctx.arc(sx, sy, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

/** perfil do casco: de cima (nariz, estreito) até embaixo (cauda dos propulsores, afunila) */
const PERFIL_CASCO = [
  { y: 0, meiaLargura: 200 },
  { y: 150, meiaLargura: 220 },
  { y: 280, meiaLargura: 600 },
  { y: 340, meiaLargura: 680 },
  { y: 1150, meiaLargura: 680 },
  { y: 1200, meiaLargura: 140 },
]

function caminhoCasco(ctx: CanvasRenderingContext2D, mundo: Mundo, camera: Camera, encolher: number) {
  const cx = (mundo.x0 + mundo.x1) / 2 - camera.x
  const perfil = PERFIL_CASCO
  ctx.beginPath()
  ctx.moveTo(cx + perfil[0].meiaLargura - encolher, perfil[0].y - camera.y)
  for (let i = 1; i < perfil.length; i++) {
    ctx.lineTo(cx + perfil[i].meiaLargura - encolher, perfil[i].y - camera.y)
  }
  for (let i = perfil.length - 1; i >= 0; i--) {
    ctx.lineTo(cx - perfil[i].meiaLargura + encolher, perfil[i].y - camera.y)
  }
  ctx.closePath()
}

/** casco visível por fora da nave — nariz estreito na frente, afunila atrás nos propulsores */
export function drawCascoNave(ctx: CanvasRenderingContext2D, camera: Camera, mundo: Mundo) {
  ctx.save()
  ctx.lineJoin = 'round'
  caminhoCasco(ctx, mundo, camera, 0)
  ctx.fillStyle = '#3a3f55'
  ctx.fill()
  ctx.strokeStyle = '#555c78'
  ctx.lineWidth = 8
  ctx.stroke()
  ctx.restore()

  // piso interno (recorte levemente menor que o casco)
  ctx.save()
  caminhoCasco(ctx, mundo, camera, 10)
  ctx.clip()
  ctx.fillStyle = '#0b0d14'
  ctx.fillRect(-2000, -2000, 6000, 6000)
  ctx.restore()
}
