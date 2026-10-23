import type { MutableRefObject } from 'react'
import type { GameState, ConstrucaoInstancia } from '../engine/types'
import type { NivelCusto } from '../content/construcoesNave'
import {
  bancadaConstruida,
  construcaoPorId,
  craftar,
  depositar,
  descricaoBufferDef,
  insumoDe,
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
  inst: ConstrucaoInstancia
  hud: GameState
  stateRef: MutableRefObject<GameState>
  onChange: () => void
  onClose: () => void
  onMover: (instId: string) => void
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

export default function ConstrucaoDetalheModal({ inst, hud, stateRef, onChange, onClose, onMover }: Props) {
  const instAtual = hud.construcoes.find((i) => i.id === inst.id)
  const def = instAtual && construcaoPorId(instAtual.defId)
  if (!instAtual || !def) return null

  function fazerDeposito() {
    depositar(stateRef.current, inst.id)
    onChange()
  }

  function fazerCraft() {
    craftar(stateRef.current, inst.id)
    onChange()
  }

  function fazerUpgrade() {
    uparConstrucao(stateRef.current, inst.id)
    onChange()
  }

  function fazerMover() {
    removerColocada(stateRef.current, inst.id)
    onClose()
    onChange()
    onMover(inst.id)
  }

  function fazerRemover() {
    removerColocada(stateRef.current, inst.id)
    onClose()
    onChange()
  }

  const insumo = insumoDe(def)
  const bufferTexto = descricaoBufferDef(def, instAtual)
  const noNivelMax = instAtual.nivel >= def.niveis.length
  const custoProximo = !noNivelMax ? def.niveis[instAtual.nivel] : null
  const precisaBancada = !def.bancada && !bancadaConstruida(hud)
  const efeitosAgora = def.conversor ? efeitosConversor(def.conversor, instAtual.nivel) : []
  const efeitosProximo = def.conversor && !noNivelMax ? efeitosConversor(def.conversor, instAtual.nivel + 1) : []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detalhe-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detalhe-header">
          <span className="detalhe-cor" style={{ background: def.cor }} />
          <h3>{def.nome}</h3>
          <span className="detalhe-nivel">Nível {instAtual.nivel}</span>
          <button type="button" className="detalhe-fechar" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="detalhe-secao">
          <span className="detalhe-secao-titulo">Status</span>
          {efeitosAgora.length > 0 ? (
            <div className="detalhe-chips">
              {efeitosAgora.map((ef) => (
                <Chip key={ef.rotulo} icone={ef.icone} cor={ef.cor} rotulo={ef.rotulo} valor={ef.valor} />
              ))}
            </div>
          ) : (
            <span className="detalhe-vazio">Sem efeito ativo</span>
          )}
        </div>

        {insumo && (
          <div className="detalhe-secao">
            <span className="detalhe-secao-titulo">Estoque próprio</span>
            <span className="detalhe-buffer">{bufferTexto}</span>
            <div className="detalhe-chips">
              <Chip
                icone={insumo.item.slice(0, 2).toUpperCase()}
                cor="#7dd3fc"
                rotulo={`${insumo.item} no inventário`}
                valor={(hud.inventario[insumo.item] ?? 0).toFixed(1)}
              />
            </div>
            <button type="button" onClick={fazerDeposito} disabled={!podeDepositar(hud, def, instAtual)}>
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
            <button type="button" onClick={fazerCraft} disabled={!podeCraftar(def, instAtual)}>
              Criar {def.craft.produzItem}
            </button>
          </div>
        )}

        <div className="detalhe-secao detalhe-melhoria">
          <span className="detalhe-secao-titulo">Melhoria</span>
          {noNivelMax ? (
            <span className="detalhe-vazio">Nível máximo</span>
          ) : (
            <>
              {efeitosProximo.length > 0 && (
                <>
                  <span className="detalhe-sub-titulo">Vira nível {instAtual.nivel + 1}</span>
                  <div className="detalhe-chips">
                    {efeitosProximo.map((ef) => (
                      <Chip key={ef.rotulo} icone={ef.icone} cor={ef.cor} rotulo={ef.rotulo} valor={ef.valor} />
                    ))}
                  </div>
                </>
              )}
              {precisaBancada && <span className="detalhe-aviso">Precisa de uma Bancada de Upgrade instalada</span>}
              <div className="detalhe-botao-custo">
                <button type="button" className="detalhe-botao-melhorar" onClick={fazerUpgrade} disabled={!podeUpar(hud, def, instAtual)}>
                  Melhorar
                </button>
                {custoProximo && <ChipsCusto custo={custoProximo} />}
              </div>
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
