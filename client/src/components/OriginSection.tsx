import React from "react";
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

interface OriginsSectionProps {
  estilos: Estilo[];
}

const OriginsSection: React.FC<OriginsSectionProps> = ({ estilos }) => {
  const groupedByOrigin = estilos.reduce<Record<string, Estilo[]>>((acc, estilo) => {
    if (!acc[estilo.origin]) acc[estilo.origin] = [];
    acc[estilo.origin].push(estilo);
    return acc;
  }, {});

  return (
    <section className="origins-section">
      {Object.entries(groupedByOrigin).map(([origin, estilos]) => (
        <div key={origin} className="origin-group">
          <h2>{origin}</h2>
          {estilos.map((estilo) => (
            <EstiloCard key={estilo.id} estilo={estilo} />
          ))}
        </div>
      ))}
    </section>
  );
};

export default OriginsSection;
