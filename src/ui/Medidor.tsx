import './Medidor.css'

interface Props {
  rotulo: string
  valor: number
  maximo: number
  cor?: string
}

/** medidor visual (barra de nível) em vez de só número cru — "3/10" vira uma barra 30% cheia */
export default function Medidor({ rotulo, valor, maximo, cor = '#7dd3fc' }: Props) {
  const percentual = maximo > 0 ? Math.min(100, Math.max(0, (valor / maximo) * 100)) : 0
  return (
    <div className="medidor">
      <div className="medidor-topo">
        <span className="medidor-rotulo">{rotulo}</span>
        <span className="medidor-valor">
          {Math.round(valor)}/{Math.round(maximo)}
        </span>
      </div>
      <div className="medidor-trilho">
        <div className="medidor-preenchido" style={{ width: `${percentual}%`, background: cor }} />
      </div>
    </div>
  )
}
