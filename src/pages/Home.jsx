import { useNavigate, Link } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const handleOpen = () => navigate("/cake");

  return (
    <main className="hero" onClick={handleOpen}>
      <div className="hero-content">
        <div className="birthday-badge">
          <span className="badge-text">Special Day</span>
        </div>

        <h1 className="title">
          <span className="title-main">Happy Birthday Rosiii</span>
          <span className="title-sub">Wishing you joy and surprises!</span>
        </h1>

        <p className="subtitle">
          Your special moment awaits - tap anywhere to begin the magic
        </p>

        <div className="cta-section">
          <Link
            className="cta-primary"
            to="/cake"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="cta-icon">✨</span>
            <span>Reveal Surprise</span>
            <span className="cta-arrow">→</span>
          </Link>
          <span className="click-hint">or tap anywhere on the screen</span>
        </div>
      </div>

      <div className="floating-elements">
        <div className="float-element float-1">🎈</div>
        <div className="float-element float-2">⭐</div>
        <div className="float-element float-3">🎊</div>
        <div className="float-element float-4">💝</div>
      </div>
    </main>
  );
}
