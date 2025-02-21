import { useState, useEffect } from "react";
import { universalSearch } from "../api/common";
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
      <p className="subtitle">Just type what you want to find</p>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="search-results">
        {results.length > 0 ? (
          results.map(
            (section: { category: string; data: { name?: string; title?: string }[] }, index) => (
              <div key={index} className="result-section">
                <h3>{section.category}</h3>
                <ul>
                  {section.data.map((item: { name?: string; title?: string }, i) => (
                    <li key={i}>{item.name || item.title}</li>
                  ))}
                </ul>
              </div>
            )
          )
        ) : (
          searchTerm.length > 1 && (
            <p className="no-results">No results found. Try another search.</p>
          )
        )}
      </div>
    </div>
  );
}

export default ExplorePage;
