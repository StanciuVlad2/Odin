import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <div className="home-hero">
        <div className="hero-content">
          <h1>Welcome to Odin Restaurant</h1>
          <p className="hero-subtitle">Experience Culinary Excellence</p>
          <p>Where tradition meets innovation in every dish</p>
          <button className="cta-btn" onClick={() => navigate("/reservations")}>
            Reserve a Table
          </button>
        </div>
      </div>

      <div className="home-features">
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">👨‍🍳</span>
            <h3>Master Chefs</h3>
            <p>
              Our experienced chefs bring passion and expertise to every dish
            </p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🌿</span>
            <h3>Fresh Ingredients</h3>
            <p>Locally sourced, organic ingredients for the finest quality</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⭐</span>
            <h3>Award Winning</h3>
            <p>Recognized for excellence in culinary innovation</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🍷</span>
            <h3>Fine Wines</h3>
            <p>Curated selection of premium wines from around the world</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
