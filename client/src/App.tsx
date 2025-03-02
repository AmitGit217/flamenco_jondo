import "./style/App.scss";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState,  } from 'react';
import {useLoading, LoadingContext} from './hooks/useLoading';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import RecordTable from './pages/RecordTable';
import ExplorePage from './pages/Explore';
import DataPage from "./pages/DataPage";
import GuessGame from "./pages/GuessGame";
import FeedbackForm from "./pages/FeedBack";

// Create a loading context to share loading state across components



// Create a new Header component that includes back button logic
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading } = useLoading();
  const isHomePage = location.pathname === '/';

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="app-header">
      {!isHomePage && !isLoading && (
        <button 
          onClick={handleBack}
          className="back-button"
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
          </svg>
        </button>
      )}
      <h1>Flamenco Jondo</h1>
    </header>
  );
};

// Main App using BrowserRouter
function App() {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <BrowserRouter>
      <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
        <div className="container">
          <Routes>
            <Route path="*" element={
              <>
                <Header />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={
                    <main>
                      <p>Fun way to learn flamenco</p>
                      <div className="button-group">
                        {/* <Link to="/explore" className="button">Explore Now</Link> */}
                        <Link to="/guess-the-estilo" className="button">Guess the Estilo</Link>
                        <Link to="/feedback" className="button">Feedback</Link>
                        {/* <Link to="/login" className="button">Login</Link> */}
                      </div>
                    </main>
                  } />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/:model" element={<RecordTable />} />
                    {/* Add other protected routes here */}
                  </Route>
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/palo/:id" element={<DataPage />} />
                  <Route path="/guess-the-estilo" element={<GuessGame />} />
                  <Route path="/feedback" element={<FeedbackForm />} />
                  <Route path="*" element={<h1>Not Found</h1>} />
                </Routes>
                <footer>
                  <p>© 2025 Flamenco Jondo</p>
                </footer>
              </>
            } />
          </Routes>
        </div>
      </LoadingContext.Provider>
    </BrowserRouter>
  );
}

export default App;