import { useState } from 'react'
import type { GameState } from '../engine/types'
import { ITEM_ACTIONS, usarItem, type ItemAction } from '../content/itemActions'
import './InventoryGrid.css'

interface Props {
  inventario: GameState['inventario']
  stateRef: React.MutableRefObject<GameState>
  onChange: () => void
}

export default function InventoryGrid({ inventario, stateRef, onChange }: Props) {
  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null)

  function aplicarAcao(item: string, acao: ItemAction) {
    usarItem(stateRef.current, item, acao)
    setItemSelecionado(null)
    onChange()
  }

  return (
    <div className="inventario">
      <h3>Inventário</h3>
      <div className="inventario-grid">
        {Object.entries(inventario).map(([item, qtd]) => {
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
  )
}
