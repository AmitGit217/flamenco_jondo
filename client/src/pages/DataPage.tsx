import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PaloHeader from "../components/PaloHeader";
import "../style/DataPage.scss";
import { getPalo } from "../api/palo";

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

interface Palo {
  id: number;
  name: string;
  description: string;
  estilos: Estilo[];
}

const DataPage = () => {
  const { id } = useParams<{ id: string }>();
  const [palo, setPalo] = useState<Palo | null>(null);
  const [expandedOrigin, setExpandedOrigin] = useState<string | null>(null);
  const [expandedEstilo, setExpandedEstilo] = useState<number | null>(null);

  useEffect(() => {
    if (!id || isNaN(Number(id))) return;

    getPalo(parseInt(id))
      .then(setPalo)
      .catch((error: Error) =>
        console.error("Error fetching Palo data:", error),
      );
  }, [id]);

  if (!palo) return <div className="loading">Loading...</div>;

  // Group estilos by origin
  const groupedByOrigin = palo.estilos.reduce<Record<string, Estilo[]>>((acc, estilo) => {
    if (!acc[estilo.origin]) acc[estilo.origin] = [];
    acc[estilo.origin].push(estilo);
    return acc;
  }, {});

  return (
    <div className="data-page">
      <PaloHeader name={palo.name} description={palo.description} />

      <div className="origins-list">
        {Object.entries(groupedByOrigin).map(([origin, estilos]) => (
          <div key={origin} className="origin-section">
            <div className="origin-header" onClick={() => setExpandedOrigin(expandedOrigin === origin ? null : origin)}>
              <h2>{origin}</h2>
              <span>{expandedOrigin === origin ? "▲" : "▼"}</span>
            </div>

            {expandedOrigin === origin && (
              <div className="estilos-list">
                {estilos.map((estilo) => (
                  <div key={estilo.id} className="estilo-card">
                    <div className="estilo-header" onClick={() => setExpandedEstilo(expandedEstilo === estilo.id ? null : estilo.id)}>
                      <h3>{estilo.name}</h3>
                      <span>{expandedEstilo === estilo.id ? "▲" : "▼"}</span>
                    </div>

                    {expandedEstilo === estilo.id && (
                      <div className="letras-list">
                        {estilo.letras.length > 0 ? (
                          estilo.letras.map((letra, index) => (
                            <div key={index} className="letra-item">
                              <p className="letra-content">"{letra.content}"</p>
                              <span className="letra-artist">- {letra.artist}</span>
                            </div>
                          ))
                        ) : (
                          <p className="no-letras">No letras available.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataPage;
