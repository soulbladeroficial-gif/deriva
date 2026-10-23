import { useState } from 'react'
import type { GameState } from '../engine/types'
import './PainelNaveModal.css'

interface Props {
  hud: GameState
  onClose: () => void
}

type Pagina = 'navegacao' | 'status'

export default function PainelNaveModal({ hud, onClose }: Props) {
  const [pagina, setPagina] = useState<Pagina>('navegacao')
  const capacidadeEnergia = Math.max(hud.nave.energiaGerada, 1)
  const energiaDisponivel = Math.max(0, hud.nave.energiaGerada - hud.nave.energiaConsumida)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="painel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="painel-topo">
          <div className="painel-abas">
            <button type="button" className={pagina === 'navegacao' ? 'ativa' : ''} onClick={() => setPagina('navegacao')}>
              Navegação
            </button>
            <button type="button" className={pagina === 'status' ? 'ativa' : ''} onClick={() => setPagina('status')}>
              Status
            </button>
          </div>
          <button type="button" className="painel-fechar" onClick={onClose}>
            ×
          </button>
        </div>

        {pagina === 'navegacao' && (
          <div className="painel-pagina">
            <p className="painel-vazio">Sistema de navegação ainda não disponível — a rota até o próximo planeta vem em uma fase futura.</p>
          </div>
        )}

        {pagina === 'status' && (
          <div className="painel-pagina">
            <div className="painel-linha">
              <span>Casco</span>
              <progress value={hud.nave.casco} max={hud.nave.cascoMax} />
              <small>{hud.nave.casco.toFixed(0)} / {hud.nave.cascoMax}</small>
            </div>
            <div className="painel-linha">
              <span>Energia</span>
              <progress value={energiaDisponivel} max={capacidadeEnergia} />
              <small>{energiaDisponivel.toFixed(1)} / {capacidadeEnergia.toFixed(1)} W livres</small>
            </div>
            <div className="painel-linha">
              <span>O2 da nave</span>
              <progress value={hud.nave.oxigenio} max={hud.nave.oxigenioMax} />
              <small>{hud.nave.oxigenio.toFixed(0)} / {hud.nave.oxigenioMax}</small>
            </div>
            {hud.nave.paneLocal && (
              <p className="painel-aviso">
                Avaria ativa na estrutura — o oxigênio está vazando mais rápido. Vá até a rachadura na
                parede pra consertar.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
