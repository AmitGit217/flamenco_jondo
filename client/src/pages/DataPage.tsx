import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // ✅ Use React Router for cleaner routing
import PaloHeader from "../components/PaloHeader";
import OriginsSection from "../components/OriginSection";
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
  const { id } = useParams<{ id: string }>(); // ✅ Get the ID from the URL
  const [palo, setPalo] = useState<Palo | null>(null);

  useEffect(() => {
    if (!id || isNaN(Number(id))) return;
  
    getPalo(parseInt(id))
      .then((data) => {
        console.log("Fetched Palo:", data); // ✅ Debugging log
        setPalo(data);
      })
      .catch((error: Error) =>
        console.error("Error fetching Palo data:", error),
      );
  }, [id]);
  

  if (!palo) return <div>Loading...</div>;

  return (
    <div className="data-page">
      <PaloHeader name={palo.name} description={palo.description} />
      {palo.estilos.length > 0 ? (
        <OriginsSection estilos={palo.estilos} />
      ) : (
        <p>No estilos available for this Palo.</p>
      )}
    </div>
  );
};

export default DataPage;
