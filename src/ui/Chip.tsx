import './Chip.css'

interface Props {
  icone: string
  cor: string
  rotulo: string
  valor?: string
}

/** selo visual reutilizável (ícone + nome + valor) — usado no lugar de texto técnico cru */
export default function Chip({ icone, cor, rotulo, valor }: Props) {
  return (
    <span className="chip">
      <span className="chip-icone" style={{ background: cor }}>
        {icone}
      </span>
      <span className="chip-rotulo">{rotulo}</span>
      {valor && <span className="chip-valor">{valor}</span>}
    </span>
  )
}
