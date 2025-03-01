import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PaloHeader from "../components/PaloHeader";
import OriginSection from "../components/OriginSection";
import LetraModal from "../components/LetraModal";
import "../style/DataPage.scss";
import { getPalo } from "../api/palo";
import { Letra } from '../types/letra';

interface Estilo {
  id: number;
  name: string;
  origin: string;
  letras: Letra[];
}

interface Palo {
  id: number;
  name: string;
  description: string;
  estilos: Estilo[];
}

const DataPage = () => {
  const { id } = useParams<{ id: string }>();
  const [palo, setPalo] = useState<Palo | null>(null);
  const [selectedLetra, setSelectedLetra] = useState<Letra | null>(null);

  useEffect(() => {
    if (!id || isNaN(Number(id))) return;
    getPalo(parseInt(id))
      .then(setPalo)
      .catch((error) => console.error("Error fetching Palo data:", error));
  }, [id]);

  if (!palo) return <div className="loading">Loading...</div>;

  return (
    <div className="data-page">
      <PaloHeader name={palo.name} description={palo.description} />
      <div className="origins-list">
        <OriginSection 
          estilos={palo.estilos} 
          onSelectLetra={(letra: Letra) => setSelectedLetra(letra)} 
        />
      </div>
      
      {/* Modal for Letra */}
      {selectedLetra && (
        <LetraModal letra={selectedLetra} onClose={() => setSelectedLetra(null)} />
      )}
    </div>
  );
};

export default DataPage;
