import React, { useState } from "react";
import LetrasList from "./LetraList";

interface Estilo {
  id: number;
  name: string;
  letras: Letra[];
}

interface Letra {
  id: number;
  content: string;
  artist: string;
}

interface EstiloCardProps {
  estilo: Estilo;
}

const EstiloCard: React.FC<EstiloCardProps> = ({ estilo }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="estilo-card">
      <div className="estilo-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>{estilo.name}</h3>
        <span>{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && <LetrasList letras={estilo.letras} />}
    </div>
  );
};

export default EstiloCard;
