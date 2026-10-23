import { useState, type MutableRefObject } from 'react'
import type { GameState } from '../engine/types'
import { ITEM_ACTIONS, usarItem, type ItemAction } from '../content/itemActions'
import { pendentes } from '../systems/construcoesNave'
import './InventarioModal.css'

interface Props {
  hud: GameState
  stateRef: MutableRefObject<GameState>
  onChange: () => void
  onClose: () => void
  onPosicionar?: (defId: string) => void
}

export default function InventarioModal({ hud, stateRef, onChange, onClose, onPosicionar }: Props) {
  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null)

  function aplicarAcao(item: string, acao: ItemAction) {
    usarItem(stateRef.current, item, acao)
    setItemSelecionado(null)
    onChange()
  }

  const itensPendentes = pendentes(hud)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="inventario-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inventario-topo">
          <h3>Inventário</h3>
          <button type="button" className="inventario-fechar" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="inventario-grid">
          {itensPendentes.map((def) => (
            <div key={def.id} className="item-slot-wrap">
              <button type="button" className="item-slot item-slot-construcao">
                <span className="item-icon" style={{ background: def.cor }} />
                <span className="item-nome">{def.nome}</span>
                <span className="item-qtd">1</span>
              </button>
              <div className="item-acoes item-acoes-fixa">
                {onPosicionar ? (
                  <button onClick={() => onPosicionar(def.id)}>Posicionar</button>
                ) : (
                  <span className="sem-acao">volte pra nave pra posicionar</span>
                )}
              </div>
            </div>
          ))}
          {Object.entries(hud.inventario).map(([item, qtd]) => {
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
    </div>
  )
}
