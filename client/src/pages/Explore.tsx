import { useState, useEffect } from "react";
import { universalSearch } from "../api/static-data";
import "../style/Explore.scss";

function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (searchTerm.length > 1) {
     universalSearch(searchTerm)
        .then((data) => setResults(data))
        .catch((error) => console.error("Error fetching data:", error));
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  return (
    <div className="explore-container">
      <h2>Search Flamenco</h2>
      <input
        type="text"
        placeholder="Search anything about Flamenco..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <div className="search-results">
        {results.map((section: { category: string, data: { name?: string, title?: string }[] }, index) => (
          <div key={index}>
            <h3>{section.category}</h3>
            <ul>
              {section.data.map((item: { name?: string, title?: string }, i) => (
                <li key={i}>{item.name || item.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExplorePage;
