// import "./index.scss";
import "./style/App.scss";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import RecordTable from './pages/RecordTable';
import ExplorePage from './pages/Explore';
import DataPage from "./pages/DataPage";
import GuessGame from "./pages/GuessGame";
import FeedbackForm from "./pages/FeedBack";

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <header>
          <h1>Flamenco Jondo</h1>
        </header>

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
      </div>
    </BrowserRouter>
  );
}

export default App;
