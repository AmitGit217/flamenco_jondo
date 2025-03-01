import {  useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { universalSearch } from "../api/common";
import "../style/Explore.scss";

function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState(""); // Holds the term that will be searched
  const [results, setResults] = useState([]);
  const navigate = useNavigate();



   useEffect(() => {
    if (query.length > 1) {
      universalSearch(query)
        .then((data) => setResults(data))
        .catch((error) => console.error("Error fetching data:", error));
    } else {
      setResults([]);
    }
  }, [query]); // Runs only when `query` changes

  const handleSearch = () => {
    setQuery(searchTerm); // Updates `query`, triggering `useEffect`
  };

  const handleResultClick = (category: string, item: { id?: number }) => {
    if (!item.id) return;
    let path = "";

    switch (category.toLowerCase()) {
      case "palos":
        path = `/palo/${item.id}`;
        break;
      default:
        console.warn(`No route defined for category: ${category}`);
        return;
    }

    navigate(path);
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
        <button className="search-button" onClick={() => { setQuery(searchTerm); handleSearch(); }}>
          Search
        </button>
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
          query.length > 1 && <p className="no-results">No results found. Try another search.</p>
        )}
      </div>
    </div>
  );
}

export default ExplorePage;
