import { Letra } from "../types/letra";

interface Estilo {
  id: number;
  name: string;
  letras: Letra[];
}



interface Props {
  estilo: Estilo;
  onSelectLetra: (letra: Letra) => void;
}

const EstiloCard = ({ estilo, onSelectLetra }: Props) => {
  return (
    <div className="estilo-card">
      <h3>{estilo.name}</h3>
      <ul>
        {estilo.letras.length > 0 ? (
          estilo.letras.map((letra) => (
            <li key={letra.id} className="letra-item" onClick={() => onSelectLetra(letra)}>
              "{letra.content.slice(0, 20)}..." {/* Show preview */}
            </li>
          ))
        ) : (
          <p className="no-letras">No letras available.</p>
        )}
      </ul>
    </div>
  );
};

export default EstiloCard;
