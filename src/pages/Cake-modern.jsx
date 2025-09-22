import { useEffect, useRef, useState } from "react";
import "./Cake.css";

export default function Cake() {
  const canvasRef = useRef(null);

  const [lit, setLit] = useState(false);
  const [blown, setBlown] = useState(false);
  const [isWishing, setIsWishing] = useState(false);

  // WebAudio: keep one context and a master gain so we can fade out
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);

  // ─────────────────────────────────────────────
  // Confetti animation (background loop)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W, H, raf;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    const pieces = Array.from({ length: 150 }, () => ({
      x: Math.random() * W,
      y: Math.random() * -H,
      s: 4 + Math.random() * 6,
      r: Math.random() * Math.PI,
      vx: -1 + Math.random() * 2,
      vy: 1 + Math.random() * 3,
      vr: -0.05 + Math.random() * 0.1,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        if (p.y > H) {
          p.y = -10;
          p.x = Math.random() * W;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = `hsl(${(p.x + p.y) % 360},100%,60%)`;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ─────────────────────────────────────────────
  // Notes & melody (Happy Birthday)
  const NOTES = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.0,
    A4: 440.0,
    B4: 493.88,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
    A5: 880.0,
  };

  // note,beats pairs
  const MELODY = [
    ["G4", 1],
    ["G4", 1],
    ["A4", 2],
    ["G4", 2],
    ["C5", 2],
    ["B4", 4],
    ["G4", 1],
    ["G4", 1],
    ["A4", 2],
    ["G4", 2],
    ["D5", 2],
    ["C5", 4],
    ["G4", 1],
    ["G4", 1],
    ["G5", 2],
    ["E5", 2],
    ["C5", 2],
    ["B4", 2],
    ["A4", 2],
    ["F5", 1],
    ["F5", 1],
    ["E5", 2],
    ["C5", 2],
    ["D5", 2],
    ["C5", 4],
  ];

  function ensureAudioGraph() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    if (!masterGainRef.current) {
      const ctx = audioCtxRef.current;
      const g = ctx.createGain();
      g.gain.value = 0.8;
      g.connect(ctx.destination);
      masterGainRef.current = g;
    }
  }

  function playMelody(tempoBPM = 152) {
    ensureAudioGraph();
    const audioCtx = audioCtxRef.current;
    const master = masterGainRef.current;

    // in case we previously faded to zero, bring it back up quickly
    const now = audioCtx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(0.8, now, 0.02);

    const beat = 60 / tempoBPM;
    const startAt = now + 0.05;

    let t = startAt;
    MELODY.forEach(([note, beats]) => {
      const dur = beats * beat * 0.95;
      const freq = NOTES[note];

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      const g = gain.gain;
      g.setValueAtTime(0.0001, t);
      g.linearRampToValueAtTime(0.35, t + 0.02);
      g.exponentialRampToValueAtTime(0.15, t + dur * 0.7);
      g.exponentialRampToValueAtTime(0.0001, t + dur);

      // route through per-note gain -> master
      osc.connect(gain).connect(master);

      osc.start(t);
      osc.stop(t + dur + 0.02);

      t += beats * beat;
    });
  }

  // Enhanced confetti burst when lighting
  function burstConfetti() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { width: W, height: H } = canvas;

    // Create multiple bursts
    for (let burst = 0; burst < 3; burst++) {
      setTimeout(() => {
        for (let i = 0; i < 300; i++) {
          setTimeout(() => {
            const x = W / 2 + (Math.random() - 0.5) * 400;
            const y = H / 2 + (Math.random() - 0.5) * 300;
            const size = 2 + Math.random() * 4;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.random() * Math.PI * 2);
            ctx.fillStyle = `hsl(${Math.random() * 360},85%,65%)`;
            ctx.fillRect(-size / 2, -size / 2, size, size * 0.8);
            ctx.restore();

            // Sparkle effect
            if (Math.random() < 0.3) {
              ctx.fillStyle = "#fff";
              ctx.beginPath();
              ctx.arc(
                x + Math.random() * 20 - 10,
                y + Math.random() * 20 - 10,
                1,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
          }, i * 3);
        }
      }, burst * 500);
    }
  }

  // ─────────────────────────────────────────────
  // Buttons
  const onLight = (e) => {
    e.stopPropagation();
    if (!lit) {
      setLit(true);
      setBlown(false);
      playMelody();
      burstConfetti();
    }
  };

  const blowCandles = () => {
    setIsWishing(true);

    // Add a small delay for the wishing animation
    setTimeout(() => {
      setLit(false);
      setBlown(true);
      setIsWishing(false);

      // Create wish sparkles
      burstConfetti();
    }, 1500);

    // fade master gain (audio) smoothly
    if (audioCtxRef.current && masterGainRef.current) {
      const ctx = audioCtxRef.current;
      const m = masterGainRef.current;
      const now = ctx.currentTime;
      m.gain.cancelScheduledValues(now);
      m.gain.setValueAtTime(m.gain.value, now);
      m.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
    }
  };

  const relight = () => {
    setBlown(false);
    setIsWishing(false);
    onLight(new Event("noop"));
  };

  // ─────────────────────────────────────────────
  return (
    <div className="stage">
      <div className="stage-bg">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>

      <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />

      <div className="celebration-container">
        <div className="card">
          <div className="card-header">
            <div className="status-indicator">
              <div className={`status-dot ${lit ? "active" : ""}`}></div>
              <span className="status-text">
                {isWishing
                  ? "Wishing..."
                  : lit
                  ? "Candles Lit"
                  : blown
                  ? "Wish Made!"
                  : "Ready to Light"}
              </span>
            </div>

            <h1 className="title">
              {isWishing ? "✨ Making Your Wish..." : "Birthday Magic ✨"}
            </h1>
            <p className="subtitle">
              {isWishing
                ? "Close your eyes and make the perfect wish!"
                : lit
                ? "Beautiful! Now make a wish and blow out the candles"
                : blown
                ? "Your wish has been sent to the universe! 🌟"
                : "Light the candles and let the celebration begin!"}
            </p>
          </div>

          <div
            className={`cake-container ${isWishing ? "wishing" : ""}`}
            aria-label="Interactive birthday cake"
          >
            <div className="cake-glow"></div>

            <div className="cake">
              <div className="layer top">
                <div className="layer-decoration">
                  <div className="rose rose-1">🌹</div>
                  <div className="rose rose-2">🌹</div>
                  <div className="rose rose-3">🌹</div>
                </div>

                <div className="candles" id="candles">
                  {[...Array(7)].map((_, i) => (
                    <div
                      className="candle"
                      key={i}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className={`flame ${lit && !blown ? "on" : ""}`} />
                      <div className="wax-base"></div>
                    </div>
                  ))}
                </div>

                <div className="frosting-drips">
                  <div className="drip" style={{ left: "15%" }} />
                  <div className="drip" style={{ left: "35%" }} />
                  <div className="drip" style={{ left: "55%" }} />
                  <div className="drip" style={{ left: "75%" }} />
                </div>
              </div>

              <div className="layer mid">
                <div className="layer-pattern"></div>
              </div>

              <div className="layer bot">
                <div className="layer-shadow"></div>
              </div>

              <div className="plate">
                <div className="plate-reflection"></div>
              </div>
            </div>

            {lit && <div className="ambient-glow"></div>}
          </div>

          <div className="controls">
            {!lit && !blown && !isWishing && (
              <button className="btn btn-primary" onClick={onLight}>
                <span className="btn-icon">🕯️</span>
                <span className="btn-text">Light the Magic</span>
                <span className="btn-sparkle">✨</span>
              </button>
            )}

            {lit && !blown && !isWishing && (
              <button className="btn btn-wish" onClick={blowCandles}>
                <span className="btn-icon">💨</span>
                <span className="btn-text">Make a Wish</span>
                <span className="btn-heart">💖</span>
              </button>
            )}

            {isWishing && (
              <div className="wishing-state">
                <div className="wish-animation">
                  <div className="wish-text">Making your wish come true...</div>
                  <div className="wish-particles">
                    <span>✨</span>
                    <span>🌟</span>
                    <span>💫</span>
                    <span>⭐</span>
                  </div>
                </div>
              </div>
            )}

            {!lit && blown && !isWishing && (
              <div className="wish-complete">
                <div className="completion-message">
                  <h3>🎉 Wish Complete! 🎉</h3>
                  <p>Your birthday wish is on its way!</p>
                </div>
                <button className="btn btn-secondary" onClick={relight}>
                  <span className="btn-icon">🔥</span>
                  <span className="btn-text">Light Again</span>
                </button>
              </div>
            )}
          </div>

          <div className="cake-stats">
            <div className="stat">
              <span className="stat-value">{lit ? "7" : "0"}</span>
              <span className="stat-label">Candles Lit</span>
            </div>
            <div className="stat">
              <span className="stat-value">{blown ? "1" : "0"}</span>
              <span className="stat-label">Wishes Made</span>
            </div>
            <div className="stat">
              <span className="stat-value">∞</span>
              <span className="stat-label">Joy Created</span>
            </div>
          </div>
        </div>
      </div>

      <div className="credits">
        <span>🎵 Musical birthday celebration with WebAudio magic</span>
      </div>
    </div>
  );
}
