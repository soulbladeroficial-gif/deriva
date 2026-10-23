import type { MutableRefObject } from 'react'
import type { GameState } from '../engine/types'
import type { ConstrucaoDef, NivelCusto } from '../content/construcoesNave'
import {
  bancadaConstruida,
  craftar,
  depositar,
  descricaoBufferDef,
  podeCraftar,
  podeDepositar,
  podeUpar,
  removerColocada,
  uparConstrucao,
} from '../systems/construcoesNave'
import { efeitosConversor } from '../systems/conversor'
import Chip from './Chip'
import './ConstrucaoDetalheModal.css'

interface Props {
  def: ConstrucaoDef
  hud: GameState
  stateRef: MutableRefObject<GameState>
  onChange: () => void
  onClose: () => void
  onMover: (defId: string) => void
}

function ChipsCusto({ custo }: { custo: NivelCusto }) {
  return (
    <div className="detalhe-chips">
      {Object.entries(custo).map(([item, qtd]) => (
        <Chip key={item} icone={item.slice(0, 2).toUpperCase()} cor="#9ca3af" rotulo={item} valor={String(qtd)} />
      ))}
    </div>
  )
}

export default function ConstrucaoDetalheModal({ def, hud, stateRef, onChange, onClose, onMover }: Props) {
  const inst = hud.construcoes[def.id]
  if (!inst) return null

  function fazerDeposito() {
    depositar(stateRef.current, def.id)
    onChange()
  }

  function fazerCraft() {
    craftar(stateRef.current, def.id)
    onChange()
  }

  function fazerUpgrade() {
    uparConstrucao(stateRef.current, def.id)
    onChange()
  }

  function fazerMover() {
    removerColocada(stateRef.current, def.id)
    onClose()
    onChange()
    onMover(def.id)
  }

  function fazerRemover() {
    removerColocada(stateRef.current, def.id)
    onClose()
    onChange()
  }

  const bufferTexto = descricaoBufferDef(def, inst)
  const noNivelMax = inst.nivel >= def.niveis.length
  const custoProximo = !noNivelMax ? def.niveis[inst.nivel] : null
  const precisaBancada = !def.bancada && !bancadaConstruida(hud)
  const efeitosAgora = def.conversor ? efeitosConversor(def.conversor, inst.nivel) : []
  const efeitosProximo = def.conversor ? efeitosConversor(def.conversor, inst.nivel + 1) : []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detalhe-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detalhe-header">
          <span className="detalhe-cor" style={{ background: def.cor }} />
          <h3>{def.nome}</h3>
          <span className="detalhe-nivel">Nível {inst.nivel}</span>
          <button type="button" className="detalhe-fechar" onClick={onClose}>
            ×
          </button>
        </div>

        {efeitosAgora.length > 0 && (
          <div className="detalhe-chips">
            {efeitosAgora.map((ef) => (
              <Chip key={ef.rotulo} icone={ef.icone} cor={ef.cor} rotulo={ef.rotulo} valor={ef.valor} />
            ))}
          </div>
        )}

        {bufferTexto && (
          <div className="detalhe-secao">
            <span className="detalhe-secao-titulo">Estoque próprio</span>
            <span className="detalhe-buffer">{bufferTexto}</span>
            <button type="button" onClick={fazerDeposito} disabled={!podeDepositar(hud, def)}>
              Depositar
            </button>
          </div>
        )}

        {def.craft && (
          <div className="detalhe-secao">
            <span className="detalhe-secao-titulo">Fabricação</span>
            <div className="detalhe-chips">
              <Chip
                icone={def.craft.produzItem.slice(0, 2).toUpperCase()}
                cor="#4ade80"
                rotulo={def.craft.produzItem}
                valor={`+${def.craft.produzQtd}`}
              />
              <Chip icone="—" cor="#9ca3af" rotulo="custo" valor={`${def.craft.custoBuffer} do estoque`} />
            </div>
            <button type="button" onClick={fazerCraft} disabled={!podeCraftar(hud, def)}>
              Criar {def.craft.produzItem}
            </button>
          </div>
        )}

        <div className="detalhe-secao">
          <span className="detalhe-secao-titulo">Melhoria</span>
          {noNivelMax ? (
            <span>Nível máximo</span>
          ) : (
            <>
              {efeitosAgora.length > 0 && (
                <div className="detalhe-comparacao">
                  <div>
                    <span className="detalhe-comparacao-titulo">Agora</span>
                    <div className="detalhe-chips">
                      {efeitosAgora.map((ef) => (
                        <Chip key={ef.rotulo} icone={ef.icone} cor={ef.cor} rotulo={ef.rotulo} valor={ef.valor} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="detalhe-comparacao-titulo">Próximo</span>
                    <div className="detalhe-chips">
                      {efeitosProximo.map((ef) => (
                        <Chip key={ef.rotulo} icone={ef.icone} cor={ef.cor} rotulo={ef.rotulo} valor={ef.valor} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {custoProximo && <ChipsCusto custo={custoProximo} />}
              {precisaBancada && <span className="detalhe-aviso">Precisa de uma Bancada de Upgrade instalada</span>}
              <button type="button" onClick={fazerUpgrade} disabled={!podeUpar(hud, def)}>
                Melhorar
              </button>
            </>
          )}
        </div>

        <div className="detalhe-rodape">
          <button type="button" onClick={fazerMover}>
            Mover
          </button>
          <button type="button" className="detalhe-remover" onClick={fazerRemover}>
            Remover da nave
          </button>
        </div>
      </div>
    </div>
  )
}
