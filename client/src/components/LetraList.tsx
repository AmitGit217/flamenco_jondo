import React, { useState } from "react";

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

  return (
    <div className="letras-list">
      {letras.map((letra, index) => (
        <div key={letra.id} className="letra-item">
          <div
            className="letra-header"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <strong>{letra.artist}</strong>
            <span>{openIndex === index ? "▲" : "▼"}</span>
          </div>
          {openIndex === index && <p className="letra-content">{letra.content}</p>}
        </div>
      ))}
    </div>
  );
};

export default LetrasList;
