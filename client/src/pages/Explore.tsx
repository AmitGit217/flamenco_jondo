import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { universalSearch } from "../api/common";
import "../style/Explore.scss";

function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    if (searchTerm.length > 1) {
      universalSearch(searchTerm)
        .then((data) => setResults(data))
        .catch((error) => console.error("Error fetching data:", error));
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  const handleResultClick = (category: string, item: { id?: number }) => {
    if (!item.id) return;

    let path = "";

    // Generic navigation based on category
    switch (category.toLowerCase()) {
      case "palos":
        path = `/palo/${item.id}`;
        break;
      default:
        console.warn(`No route defined for category: ${category}`);
        return;
    }

    navigate(path); // Redirect to the correct page
  };

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
            (section: { category: string; data: { id?: number; name?: string; title?: string }[] }, index) => (
              <div key={index} className="result-section">
                <h3>{section.category}</h3>
                <ul>
                  {section.data.map((item, i) => (
                    <li 
                      key={i} 
                      className="search-item"
                      onClick={() => handleResultClick(section.category, item)}
                    >
                      {item.name || item.title}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )
        ) : (
          searchTerm.length > 1 && <p className="no-results">No results found. Try another search.</p>
        )}
      </div>
    </div>
  );
}

export default ExplorePage;
