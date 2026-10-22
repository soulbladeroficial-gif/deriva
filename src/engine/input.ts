export interface InputState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  interactRequested: boolean
  eHeld: boolean
}

export function createInputState(): InputState {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    interactRequested: false,
    eHeld: false,
  }
}

export function bindKeyboard(input: InputState): () => void {
  function onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'w':
      case 'W':
      case 'ArrowUp':
        input.up = true
        break
      case 's':
      case 'S':
      case 'ArrowDown':
        input.down = true
        break
      case 'a':
      case 'A':
      case 'ArrowLeft':
        input.left = true
        break
      case 'd':
      case 'D':
      case 'ArrowRight':
        input.right = true
        break
      case 'e':
      case 'E':
        if (!input.eHeld) {
          input.eHeld = true
          input.interactRequested = true
        }
        break
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    switch (e.key) {
      case 'w':
      case 'W':
      case 'ArrowUp':
        input.up = false
        break
      case 's':
      case 'S':
      case 'ArrowDown':
        input.down = false
        break
      case 'a':
      case 'A':
      case 'ArrowLeft':
        input.left = false
        break
      case 'd':
      case 'D':
      case 'ArrowRight':
        input.right = false
        break
      case 'e':
      case 'E':
        input.eHeld = false
        break
    }
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  return () => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
  }
}
