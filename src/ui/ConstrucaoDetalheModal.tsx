import type { MutableRefObject } from 'react'
import type { GameState } from '../engine/types'
import type { ConstrucaoDef } from '../content/construcoesNave'
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
import { descricaoConversor } from '../systems/conversor'
import './ConstrucaoDetalheModal.css'

interface Props {
  def: ConstrucaoDef
  hud: GameState
  stateRef: MutableRefObject<GameState>
  onChange: () => void
  onClose: () => void
  onMover: (defId: string) => void
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

        {def.conversor && (
          <p className="detalhe-funcionamento">{descricaoConversor(def.conversor, inst.nivel)}</p>
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
            <span>
              Gasta {def.craft.custoBuffer} do estoque → {def.craft.produzQtd} {def.craft.produzItem}
            </span>
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
              {def.conversor && (
                <div className="detalhe-comparacao">
                  <span>Agora: {descricaoConversor(def.conversor, inst.nivel) || '—'}</span>
                  <span>Próximo: {descricaoConversor(def.conversor, inst.nivel + 1) || '—'}</span>
                </div>
              )}
              <span className="detalhe-custo">
                Custa:{' '}
                {custoProximo &&
                  Object.entries(custoProximo)
                    .map(([item, qtd]) => `${qtd} ${item}`)
                    .join(' + ')}
              </span>
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
