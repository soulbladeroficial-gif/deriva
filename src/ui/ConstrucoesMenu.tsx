import type { MutableRefObject } from 'react'
import type { GameState } from '../engine/types'
import { CONSTRUCOES } from '../content/construcoesNave'
import { criarConstrucao, temRecursos } from '../systems/construcoesNave'
import './ConstrucoesMenu.css'

interface Props {
  hud: GameState
  stateRef: MutableRefObject<GameState>
  onChange: () => void
}

export default function ConstrucoesMenu({ hud, stateRef, onChange }: Props) {
  function criar(id: string) {
    criarConstrucao(stateRef.current, id)
    onChange()
  }

  return (
    <div className="construcoes-menu">
      <h3>Construções</h3>
      <div className="construcoes-lista">
        {CONSTRUCOES.map((def) => {
          const inst = hud.construcoes[def.id]
          const nivel = inst?.nivel ?? 0
          const custoTexto = Object.entries(def.niveis[0])
            .map(([item, qtd]) => `${qtd} ${item}`)
            .join(' + ')

          let status: string
          if (nivel === 0) status = `Custa: ${custoTexto}`
          else if (!inst.colocada) status = 'Pronta — leve até um slot vazio e aperte E'
          else status = `Instalada, nível ${inst.nivel}`

          return (
            <div key={def.id} className="construcao-item">
              <span className="construcao-cor" style={{ background: def.cor }} />
              <div className="construcao-info">
                <span className="construcao-nome">{def.nome}</span>
                <span className="construcao-status">{status}</span>
              </div>
              {nivel === 0 && (
                <button
                  type="button"
                  disabled={!temRecursos(hud, def.niveis[0])}
                  onClick={() => criar(def.id)}
                >
                  Criar
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
