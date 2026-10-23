import { useState, type MutableRefObject } from 'react'
import type { GameState } from '../engine/types'
import { ITEM_ACTIONS, usarItem, type ItemAction } from '../content/itemActions'
import { construcaoPorId, pendentes } from '../systems/construcoesNave'
import './InventarioModal.css'

interface Props {
  hud: GameState
  stateRef: MutableRefObject<GameState>
  onChange: () => void
  onClose: () => void
  onPosicionar?: (instId: string) => void
}

export default function InventarioModal({ hud, stateRef, onChange, onClose, onPosicionar }: Props) {
  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null)

  function aplicarAcao(item: string, acao: ItemAction) {
    usarItem(stateRef.current, item, acao)
    setItemSelecionado(null)
    onChange()
  }

  const gruposPendentes = new Map<string, string[]>()
  for (const inst of pendentes(hud)) {
    const lista = gruposPendentes.get(inst.defId) ?? []
    lista.push(inst.id)
    gruposPendentes.set(inst.defId, lista)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="inventario-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inventario-topo">
          <h3>Inventário</h3>
          <button type="button" className="inventario-fechar" onClick={onClose}>
            ×
          </button>
        </div>

        {gruposPendentes.size > 0 && (
          <div className="inventario-secao">
            <span className="inventario-secao-titulo">Construções</span>
            <div className="inventario-grid">
              {[...gruposPendentes.entries()].map(([defId, instIds]) => {
                const def = construcaoPorId(defId)
                if (!def) return null
                return (
                  <div key={defId} className="item-slot-wrap">
                    <button type="button" className="item-slot item-slot-construcao">
                      <span className="item-icon" style={{ background: def.cor }} />
                      <span className="item-nome">{def.nome}</span>
                      <span className="item-qtd">{instIds.length}</span>
                    </button>
                    <div className="item-acoes item-acoes-fixa">
                      {onPosicionar ? (
                        <button onClick={() => onPosicionar(instIds[0])}>Posicionar</button>
                      ) : (
                        <span className="sem-acao">volte pra nave pra posicionar</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="inventario-secao">
          <span className="inventario-secao-titulo">Itens</span>
          <div className="inventario-grid">
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
                    <span className="item-qtd">{Math.round(qtd)}</span>
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
    </div>
  )
}
