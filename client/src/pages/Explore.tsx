import { useState, useEffect } from "react";
import { getStaticDataByType } from "../api/static-data";
import "../style/Explore.scss";

function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("palo");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (searchTerm.length > 1) {
      getStaticDataByType(selectedType, searchTerm)
        .then((data) => setResults(data))
        .catch((error) => console.error("Error fetching data:", error));
    } else {
      setResults([]); // Clear results when input is empty
    }
  }, [searchTerm, selectedType]);

  return (
    <div className="explore-container">
      <h2>Explore Flamenco</h2>
      
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search for Palos, Estilos, Artists..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Type Filter Dropdown */}
      <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
        <option value="palo">Palo</option>
        <option value="estilo">Estilo</option>
        <option value="artist">Artist</option>
        <option value="compas">Compás</option>
        <option value="letra">Letra</option>
        <option value="letra_artist">Letra Artist</option>
      </select>

      {/* Search Results */}
      <ul>
        {results.map((item: {name?: string, title?: string}, index) => (
          <li key={index}>{item.name || item.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default ExplorePage;
