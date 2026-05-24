import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="home-hero">
        <h1 className="home-title">
          MET BHUJBAL KNOWLEDGE CITY
        </h1>
        <h2 className="home-subtitle">
          INSTITUTE OF ENGINEERING
        </h2>
        <p className="home-location">Adgaon, Nashik</p>
      </header>

      {/* Main */}
      <div className="home-main">
        <div className="card border-0 shadow-lg p-5 text-center fade-in hero-card">
          <div className="hero-icon-badge">
            <i className="bi bi-shield-check" style={{ fontSize: "2rem", color: "#fff" }}></i>
          </div>

          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.2rem", color: "#1a1a2e", marginBottom: "0.5rem" }}>
            Welcome to <span style={{ color: "#dc3545" }}>MET<span style={{ textTransform: "lowercase" }}>track</span></span>
          </h2>
          <p className="text-muted" style={{ fontSize: "1.05rem", marginBottom: "2rem", lineHeight: 1.6 }}>
            Your comprehensive tracking system for NAAC data precision and institutional documentation.
          </p>

          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <button className="btn btn-danger px-5 py-3 fw-bold rounded-pill shadow" onClick={() => navigate("/login")}>
              <i className="bi bi-box-arrow-in-right me-2"></i> Login to Portal
            </button>
            <button className="btn btn-outline-dark px-5 py-3 fw-bold rounded-pill" onClick={() => navigate("/register")}>
              <i className="bi bi-person-plus me-2"></i> Register Account
            </button>
          </div>

          <div className="mt-4 pt-3 border-top">
            <p className="small text-uppercase text-muted fw-bold mb-0" style={{ letterSpacing: 2, fontSize: "0.72rem" }}>
              Excellence in Quality Assurance
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
