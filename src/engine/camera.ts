export interface Camera {
  x: number
  y: number
}

export function computeCamera(playerX: number, playerY: number, viewW: number, viewH: number): Camera {
  return { x: playerX - viewW / 2, y: playerY - viewH / 2 }
}
