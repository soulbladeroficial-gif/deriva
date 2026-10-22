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

/** casco visível por fora da nave, estilo "Among Us": silhueta arredondada com bicos de motor */
export function drawCascoNave(ctx: CanvasRenderingContext2D, camera: Camera, mundo: Mundo) {
  const x0 = mundo.x0 - camera.x
  const y0 = mundo.y0 - camera.y
  const w = mundo.x1 - mundo.x0
  const h = mundo.y1 - mundo.y0
  const raio = 46

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x0, y0, w, h, raio)
  ctx.fillStyle = '#3a3f55'
  ctx.fill()
  ctx.strokeStyle = '#555c78'
  ctx.lineWidth = 8
  ctx.stroke()

  // bicos de motor na lateral esquerda
  const nubH = 70
  const nubW = 26
  ctx.fillStyle = '#2e3146'
  ctx.fillRect(x0 - nubW, y0 + h * 0.3 - nubH / 2, nubW + 4, nubH)
  ctx.fillRect(x0 - nubW, y0 + h * 0.7 - nubH / 2, nubW + 4, nubH)
  ctx.restore()

  // piso interno (recorte levemente menor que o casco)
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x0 + 10, y0 + 10, w - 20, h - 20, raio - 10)
  ctx.clip()
  ctx.fillStyle = '#0b0d14'
  ctx.fillRect(x0, y0, w, h)
  ctx.restore()
}
