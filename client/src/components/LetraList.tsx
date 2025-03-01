import React, { useState } from "react";
import "../style/LetrasList.scss"; // Ensure you create this stylesheet

interface Letra {
  id: number;
  content: string;
  artist: string;
}

interface LetrasListProps {
  letras: Letra[];
}

const LetrasList: React.FC<LetrasListProps> = ({ letras }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleLetra = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="letras-list">
      {letras.map((letra, index) => (
        <div key={letra.id} className={`letra-item ${openIndex === index ? "open" : ""}`}>
          <div className="letra-header" onClick={() => toggleLetra(index)}>
            <strong>{letra.artist}</strong>
            <span className="icon">{openIndex === index ? "▲" : "▼"}</span>
          </div>
          <div className={`letra-content ${openIndex === index ? "visible" : "hidden"}`}>
            <p>"{letra.content}"</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LetrasList;
