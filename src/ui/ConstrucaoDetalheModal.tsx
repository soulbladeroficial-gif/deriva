import { useState, type DragEvent, type MutableRefObject } from 'react'
import type { GameState, ConstrucaoInstancia } from '../engine/types'
import type { NivelCusto } from '../content/construcoesNave'
import {
  bancadaConstruida,
  capacidadeBuffer,
  construcaoPorId,
  craftar,
  depositar,
  insumoDe,
  podeCraftar,
  podeUpar,
  quantidadeParaDepositar,
  removerColocada,
  uparConstrucao,
} from '../systems/construcoesNave'
import { efeitosConversor, processoConversor, type Processo } from '../systems/conversor'
import Chip from './Chip'
import Medidor from './Medidor'
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

function ProcessoView({ processo }: { processo: Processo }) {
  return (
    <div className="detalhe-processo">
      <div className="detalhe-processo-fluxo">
        <Chip icone={processo.entrada.icone} cor={processo.entrada.cor} rotulo={processo.entrada.rotulo} valor={String(processo.entrada.qtd)} />
        <span className="detalhe-seta">→</span>
        {processo.saidas.map((s) => (
          <Chip key={s.rotulo} icone={s.icone} cor={s.cor} rotulo={s.rotulo} valor={String(s.qtd)} />
        ))}
      </div>
      <span className="detalhe-processo-tempo">
        a cada {processo.tempoSegundos}s{processo.energiaTexto ? ` · ${processo.energiaTexto}` : ''}
      </span>
    </div>
  )
}

export default function ConstrucaoDetalheModal({ inst, hud, stateRef, onChange, onClose, onMover }: Props) {
  const [quantidadeEscolhida, setQuantidadeEscolhida] = useState<number | null>(null)
  const [arrastando, setArrastando] = useState(false)

  const instAtual = hud.construcoes.find((i) => i.id === inst.id)
  const def = instAtual && construcaoPorId(instAtual.defId)
  if (!instAtual || !def) return null

  function fazerDeposito(qtd: number) {
    depositar(stateRef.current, inst.id, qtd)
    setQuantidadeEscolhida(null)
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

  function onDropNoEstoque(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setArrastando(false)
    if (!insumo) return
    const item = e.dataTransfer.getData('text/plain')
    if (item !== insumo.item) return
    fazerDeposito(quantidadeMax)
  }

  const insumo = insumoDe(def)
  const quantidadeMax = insumo ? quantidadeParaDepositar(hud, def, instAtual) : 0
  const quantidadeEfetiva = Math.min(quantidadeEscolhida ?? quantidadeMax, quantidadeMax)
  const noNivelMax = instAtual.nivel >= def.niveis.length
  const custoProximo = !noNivelMax ? def.niveis[instAtual.nivel] : null
  const precisaBancada = !def.bancada && !bancadaConstruida(hud)
  const processo = def.conversor ? processoConversor(def.conversor, instAtual.nivel) : null
  const efeitosSemProcesso = !processo && def.conversor ? efeitosConversor(def.conversor, instAtual.nivel) : []
  const processoProximo = def.conversor && !noNivelMax ? processoConversor(def.conversor, instAtual.nivel + 1) : null
  const efeitosProximoSemProcesso =
    !processoProximo && def.conversor && !noNivelMax ? efeitosConversor(def.conversor, instAtual.nivel + 1) : []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detalhe-modal detalhe-modal-larga" onClick={(e) => e.stopPropagation()}>
        <div className="detalhe-header">
          <span className="detalhe-cor" style={{ background: def.cor }} />
          <h3>{def.nome}</h3>
          <span className="detalhe-nivel">Nível {instAtual.nivel}</span>
          <button type="button" className="detalhe-fechar" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="detalhe-corpo">
          <div className="detalhe-coluna">
            <span className="detalhe-coluna-titulo">Seu inventário</span>
            <div className="detalhe-inventario">
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

          <div className="detalhe-coluna">
            <div className="detalhe-secao">
              <span className="detalhe-secao-titulo">Status</span>
              {processo ? (
                <ProcessoView processo={processo} />
              ) : efeitosSemProcesso.length > 0 ? (
                <div className="detalhe-chips">
                  {efeitosSemProcesso.map((ef) => (
                    <Chip key={ef.rotulo} icone={ef.icone} cor={ef.cor} rotulo={ef.rotulo} valor={ef.valor} />
                  ))}
                </div>
              ) : (
                <span className="detalhe-vazio">Sem efeito ativo</span>
              )}
            </div>

            {insumo && (
              <div
                className={`detalhe-secao detalhe-drop${arrastando ? ' arrastando' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setArrastando(true)}
                onDragLeave={() => setArrastando(false)}
                onDrop={onDropNoEstoque}
              >
                <span className="detalhe-secao-titulo">Estoque próprio</span>
                <Medidor rotulo={insumo.item} valor={instAtual.bufferEntrada} maximo={capacidadeBuffer(def)} cor="#7dd3fc" />
                <p className="detalhe-dica">Arraste {insumo.item} aqui, ou escolha quanto depositar:</p>
                <input
                  type="range"
                  min={0}
                  max={Math.max(1, Math.round(quantidadeMax))}
                  value={Math.round(quantidadeEfetiva)}
                  onChange={(e) => setQuantidadeEscolhida(Number(e.target.value))}
                  disabled={quantidadeMax <= 0}
                />
                <button type="button" onClick={() => fazerDeposito(quantidadeEfetiva)} disabled={quantidadeEfetiva <= 0}>
                  Depositar {Math.round(quantidadeEfetiva)}
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
                  <span className="detalhe-sub-titulo">Vira nível {instAtual.nivel + 1}</span>
                  {processoProximo ? (
                    <ProcessoView processo={processoProximo} />
                  ) : efeitosProximoSemProcesso.length > 0 ? (
                    <div className="detalhe-chips">
                      {efeitosProximoSemProcesso.map((ef) => (
                        <Chip key={ef.rotulo} icone={ef.icone} cor={ef.cor} rotulo={ef.rotulo} valor={ef.valor} />
                      ))}
                    </div>
                  ) : null}
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
      </div>
    </div>
  )
}
