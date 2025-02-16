import { Link } from "react-router-dom";
import "../style/Dashboard.scss";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>
      <nav className="dashboard-nav">
        <Link
          to="/login"
          className="dashboard-link logout"
          onClick={() => {
            localStorage.removeItem("token");
          }}
        >
          Logout
        </Link>
        <Link to="/dashboard/palo" className="dashboard-link">Palo</Link>
        <Link to="/dashboard/compas" className="dashboard-link">Compas</Link>
        <Link to="/dashboard/letra" className="dashboard-link">Letra</Link>
        <Link to="/dashboard/estilo" className="dashboard-link">Estilo</Link>
        <Link to="/dashboard/artista" className="dashboard-link">Artista</Link>
      </nav>
    </div>
  );
};

export default Dashboard;
