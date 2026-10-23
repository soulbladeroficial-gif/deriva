import { useState, type DragEvent, type MutableRefObject } from 'react'
import type { GameState } from '../engine/types'
import { catalogoConstruivel, criarConstrucao, podeCriar, temRecursos } from '../systems/construcoesNave'
import Chip from './Chip'
import './BancadaModal.css'

interface Props {
  hud: GameState
  stateRef: MutableRefObject<GameState>
  onChange: () => void
  onClose: () => void
}

export default function BancadaModal({ hud, stateRef, onChange, onClose }: Props) {
  const [alvoArrastando, setAlvoArrastando] = useState<string | null>(null)
  const catalogo = catalogoConstruivel()

  function criar(id: string) {
    criarConstrucao(stateRef.current, id)
    onChange()
  }

  function onDropNaReceita(e: DragEvent<HTMLDivElement>, defId: string) {
    e.preventDefault()
    setAlvoArrastando(null)
    const item = e.dataTransfer.getData('text/plain')
    const def = catalogo.find((d) => d.id === defId)
    if (!item || !def) return
    if (!(item in def.niveis[0])) return
    criar(defId)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bancada-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bancada-topo">
          <h3>Bancada de Fabricação</h3>
          <button type="button" className="bancada-fechar" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="bancada-corpo">
          <div className="bancada-coluna">
            <span className="bancada-coluna-titulo">Seu inventário</span>
            <p className="bancada-dica">Arraste um item pra uma receita, ou use o botão Criar.</p>
            <div className="bancada-inventario">
              {Object.entries(hud.inventario).map(([item, qtd]) => (
                <div
                  key={item}
                  className="item-slot"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}
                >
                  <span className="item-icon">{item.slice(0, 2).toUpperCase()}</span>
                  <span className="item-nome">{item}</span>
                  <span className="item-qtd">{Math.round(qtd)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bancada-coluna">
            <span className="bancada-coluna-titulo">Construções</span>
            <p className="bancada-dica">Pode criar quantas quiser — cada uma vira um item pra posicionar.</p>
            <div className="bancada-receitas">
              {catalogo.map((def) => {
                const pronta = temRecursos(hud, def.niveis[0])
                return (
                  <div
                    key={def.id}
                    className={`receita${alvoArrastando === def.id ? ' arrastando' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setAlvoArrastando(def.id)}
                    onDragLeave={() => setAlvoArrastando((atual) => (atual === def.id ? null : atual))}
                    onDrop={(e) => onDropNaReceita(e, def.id)}
                  >
                    <div className="receita-topo">
                      <span className="receita-cor" style={{ background: def.cor }} />
                      <span className="receita-nome">{def.nome}</span>
                      <span className={`receita-status${pronta ? ' pronta' : ''}`}>
                        {pronta ? 'Pronta pra criar' : 'Faltam materiais'}
                      </span>
                    </div>
                    <div className="receita-chips">
                      {Object.entries(def.niveis[0]).map(([item, qtd]) => (
                        <Chip
                          key={item}
                          icone={item.slice(0, 2).toUpperCase()}
                          cor={(hud.inventario[item] ?? 0) >= qtd ? '#4ade80' : '#f87171'}
                          rotulo={item}
                          valor={String(qtd)}
                        />
                      ))}
                    </div>
                    <button type="button" disabled={!podeCriar(hud, def)} onClick={() => criar(def.id)}>
                      Criar
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
