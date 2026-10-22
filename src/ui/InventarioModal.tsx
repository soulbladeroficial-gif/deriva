import { useState, type MutableRefObject } from 'react'
import type { GameState } from '../engine/types'
import { ITEM_ACTIONS, usarItem, type ItemAction } from '../content/itemActions'
import { CONSTRUCOES } from '../content/construcoesNave'
import { criarConstrucao, pendentes, pertoDaBancada, podeCriar } from '../systems/construcoesNave'
import './InventarioModal.css'

interface Props {
  hud: GameState
  stateRef: MutableRefObject<GameState>
  onChange: () => void
  onClose: () => void
  onPosicionar?: (defId: string) => void
}

type Aba = 'itens' | 'construcoes'

export default function InventarioModal({ hud, stateRef, onChange, onClose, onPosicionar }: Props) {
  const [aba, setAba] = useState<Aba>('itens')
  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null)

  function aplicarAcao(item: string, acao: ItemAction) {
    usarItem(stateRef.current, item, acao)
    setItemSelecionado(null)
    onChange()
  }

  function criar(id: string) {
    criarConstrucao(stateRef.current, id)
    onChange()
  }

  const itensPendentes = pendentes(hud)
  const naBancada = pertoDaBancada(hud)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="inventario-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inventario-topo">
          <div className="inventario-abas">
            <button
              type="button"
              className={aba === 'itens' ? 'ativa' : ''}
              onClick={() => setAba('itens')}
            >
              Itens
            </button>
            <button
              type="button"
              className={aba === 'construcoes' ? 'ativa' : ''}
              onClick={() => setAba('construcoes')}
            >
              Construções
            </button>
          </div>
          <button type="button" className="inventario-fechar" onClick={onClose}>
            ×
          </button>
        </div>

        {aba === 'itens' && (
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
        )}

        {aba === 'construcoes' && (
          <div className="construcoes-lista">
            {!naBancada && (
              <p className="construcoes-aviso">
                Precisa estar perto da Bancada de Fabricação pra criar construções novas.
              </p>
            )}
            {CONSTRUCOES.map((def) => {
              const inst = hud.construcoes[def.id]
              const nivel = inst?.nivel ?? 0
              const custoTexto = Object.entries(def.niveis[0])
                .map(([item, qtd]) => `${qtd} ${item}`)
                .join(' + ')

              let status: string
              if (nivel === 0) status = `Custa: ${custoTexto}`
              else if (!inst.colocada) status = 'Criada — posicione pela aba Itens'
              else status = `Instalada, nível ${inst.nivel}`

              return (
                <div key={def.id} className="construcao-item">
                  <span className="construcao-cor" style={{ background: def.cor }} />
                  <div className="construcao-info">
                    <span className="construcao-nome">{def.nome}</span>
                    <span className="construcao-status">{status}</span>
                  </div>
                  {nivel === 0 && (
                    <button type="button" disabled={!podeCriar(hud, def)} onClick={() => criar(def.id)}>
                      Criar
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
