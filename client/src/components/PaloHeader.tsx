import React from "react";

interface PaloHeaderProps {
  name: string;
  description: string;
}

const PaloHeader: React.FC<PaloHeaderProps> = ({ name, description }) => (
  <header className="palo-header">
    <h1>{name}</h1>
    <p>{description}</p>
  </header>
);

export default PaloHeader;
