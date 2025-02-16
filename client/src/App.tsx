// import "./index.scss";
import "./style/App.scss";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

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
              <p>Discover, learn, and contribute to the world of flamenco.</p>
              <div className="button-group">
                <Link to="/explore" className="button">Explore Now</Link>
                <Link to="/login" className="button">Login</Link>
              </div>
            </main>
          } />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Add other protected routes here */}
          </Route>
        </Routes>

        <footer>
          <p>© 2025 Flamenco Jondo</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
