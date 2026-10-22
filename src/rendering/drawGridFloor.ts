import type { Camera } from '../engine/camera'

export function drawGridFloor(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  viewW: number,
  viewH: number,
  tileSize: number,
  color: string,
) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1

  const startX = Math.floor(camera.x / tileSize) * tileSize
  for (let wx = startX; wx <= camera.x + viewW; wx += tileSize) {
    const sx = wx - camera.x
    ctx.beginPath()
    ctx.moveTo(sx, 0)
    ctx.lineTo(sx, viewH)
    ctx.stroke()
  }

  const startY = Math.floor(camera.y / tileSize) * tileSize
  for (let wy = startY; wy <= camera.y + viewH; wy += tileSize) {
    const sy = wy - camera.y
    ctx.beginPath()
    ctx.moveTo(0, sy)
    ctx.lineTo(viewW, sy)
    ctx.stroke()
  }
}
