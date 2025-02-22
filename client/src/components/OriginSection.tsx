import { useState } from "react";
import EstiloCard from "./EstiloCard";

interface Estilo {
  id: number;
  name: string;
  origin: string;
  letras: Letra[];
}

interface Letra {
  id: number;
  content: string;
  artist: string;
}

interface Props {
  estilos: Estilo[];
  onSelectLetra: (letra: Letra) => void;
}

const OriginSection = ({ estilos, onSelectLetra }: Props) => {
  const [expandedOrigin, setExpandedOrigin] = useState<string | null>(null);

  // Group estilos by origin
  const groupedByOrigin = estilos.reduce<Record<string, Estilo[]>>((acc, estilo) => {
    if (!acc[estilo.origin]) acc[estilo.origin] = [];
    acc[estilo.origin].push(estilo);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(groupedByOrigin).map(([origin, estilos]) => (
        <div key={origin} className="origin-section">
          <div className="origin-header" onClick={() => setExpandedOrigin(expandedOrigin === origin ? null : origin)}>
            <h2>{origin}</h2>
            <span>{expandedOrigin === origin ? "▲" : "▼"}</span>
          </div>
          {expandedOrigin === origin && (
            <div className="estilos-list">
              {estilos.map((estilo) => (
                <EstiloCard key={estilo.id} estilo={estilo} onSelectLetra={onSelectLetra} />
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default OriginSection;
