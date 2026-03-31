import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 320 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.004 + 0.001,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    // Shooting stars
    const shootingStars = [];
    function spawnShooting() {
      shootingStars.push({
        x: Math.random() * canvas.width * 0.7,
        y: Math.random() * canvas.height * 0.4,
        len: Math.random() * 120 + 60,
        speed: Math.random() * 8 + 6,
        alpha: 1,
        angle: Math.PI / 5,
      });
    }
    setInterval(spawnShooting, 3200);

    let frame = 0;
    let animId;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      // Stars
      stars.forEach((s) => {
        const twinkle = 0.45 + 0.55 * Math.sin(frame * s.speed + s.twinkleOffset);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.fill();
      });

      // Shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        const grad = ctx.createLinearGradient(
          ss.x, ss.y,
          ss.x - Math.cos(ss.angle) * ss.len,
          ss.y - Math.sin(ss.angle) * ss.len
        );
        grad.addColorStop(0, `rgba(255,255,255,${ss.alpha})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(
          ss.x - Math.cos(ss.angle) * ss.len,
          ss.y - Math.sin(ss.angle) * ss.len
        );
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.alpha -= 0.018;
        if (ss.alpha <= 0) shootingStars.splice(i, 1);
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
      setMessage("access_granted");
      setTimeout(() => navigate("/home"), 1000); // small delay so user sees "Access Granted"
        } else {
      setMessage("access_denied");
        }
    } catch {
      setMessage("server_error");
    } finally {
      setLoading(false);
    }
  };

  const msgConfig = {
    access_granted: { text: "✦ Access Granted — Welcome, Commander", color: "#a8edba" },
    access_denied:  { text: "✦ Access Denied — Unknown Signal",       color: "#f87171" },
    server_error:   { text: "✦ No Signal Detected",                   color: "#fbbf24" },
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Rajdhani:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      <div style={styles.root}>
        <StarField />

        {/* Deep space glow layers */}
        <div style={styles.galaxyBlob1} />
        <div style={styles.galaxyBlob2} />
        <div style={styles.galaxyBlob3} />
        <div style={styles.horizonGlow} />

        {/* Card */}
        <div style={styles.card}>
          {/* Corner ornaments */}
          <span style={{ ...styles.corner, top: 12, left: 12, borderTop: "1px solid rgba(167,139,250,0.5)", borderLeft: "1px solid rgba(167,139,250,0.5)" }} />
          <span style={{ ...styles.corner, top: 12, right: 12, borderTop: "1px solid rgba(167,139,250,0.5)", borderRight: "1px solid rgba(167,139,250,0.5)" }} />
          <span style={{ ...styles.corner, bottom: 12, left: 12, borderBottom: "1px solid rgba(167,139,250,0.5)", borderLeft: "1px solid rgba(167,139,250,0.5)" }} />
          <span style={{ ...styles.corner, bottom: 12, right: 12, borderBottom: "1px solid rgba(167,139,250,0.5)", borderRight: "1px solid rgba(167,139,250,0.5)" }} />

          <div style={styles.eyepiece}>◉</div>
          <h1 style={styles.heading}>Space Station</h1>
          <p style={styles.subheading}>Access Terminal · Sector 7</p>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerDot}>✦</span>
            <span style={styles.dividerLine} />
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Commander ID</label>
              <input
                type="email"
                placeholder="signal@deepspace.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                required
                style={{
                  ...styles.input,
                  ...(focused === "email" ? styles.inputFocused : {}),
                }}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Access Code</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                required
                style={{
                  ...styles.input,
                  ...(focused === "password" ? styles.inputFocused : {}),
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonLoading : {}),
              }}
            >
              {loading ? (
                <span style={styles.pulseText}>Transmitting…</span>
              ) : (
                <>
                  <span>Initiate Launch</span>
                  <span style={styles.btnIcon}>→</span>
                </>
              )}
            </button>
          </form>

          {message && (
            <p style={{ ...styles.message, color: msgConfig[message]?.color }}>
              {msgConfig[message]?.text}
            </p>
          )}

          <p style={styles.footer}>
            Est. 2147 · Deep Space Navigation Authority
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulseText {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#03060f",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Rajdhani', sans-serif",
  },

  // Galaxy nebula blobs
  galaxyBlob1: {
    position: "fixed",
    width: 700,
    height: 500,
    borderRadius: "50%",
    background:
      "radial-gradient(ellipse, rgba(88,28,220,0.18) 0%, rgba(30,10,80,0.08) 55%, transparent 75%)",
    top: "-120px",
    left: "-180px",
    filter: "blur(40px)",
    zIndex: 1,
    pointerEvents: "none",
  },
  galaxyBlob2: {
    position: "fixed",
    width: 600,
    height: 450,
    borderRadius: "50%",
    background:
      "radial-gradient(ellipse, rgba(20,130,200,0.15) 0%, rgba(10,60,120,0.06) 55%, transparent 75%)",
    bottom: "-80px",
    right: "-100px",
    filter: "blur(50px)",
    zIndex: 1,
    pointerEvents: "none",
  },
  galaxyBlob3: {
    position: "fixed",
    width: 400,
    height: 300,
    borderRadius: "50%",
    background:
      "radial-gradient(ellipse, rgba(180,60,240,0.1) 0%, transparent 70%)",
    top: "40%",
    left: "55%",
    filter: "blur(60px)",
    zIndex: 1,
    pointerEvents: "none",
  },
  horizonGlow: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "260px",
    background:
      "linear-gradient(to top, rgba(30,15,80,0.35) 0%, transparent 100%)",
    zIndex: 1,
    pointerEvents: "none",
  },

  // Card
  card: {
    position: "relative",
    zIndex: 10,
    width: 360,
    padding: "48px 40px 36px",
    borderRadius: 4,
    background: "rgba(5, 8, 22, 0.72)",
    border: "1px solid rgba(130, 100, 220, 0.22)",
    boxShadow:
      "0 0 80px rgba(70,30,180,0.18), 0 0 20px rgba(0,0,0,0.9), inset 0 0 40px rgba(80,40,200,0.05)",
    backdropFilter: "blur(24px)",
    textAlign: "center",
    animation: "fadeIn 0.9s ease both",
  },

  corner: {
    position: "absolute",
    width: 16,
    height: 16,
    display: "block",
  },

  eyepiece: {
    fontSize: 28,
    color: "rgba(167,139,250,0.7)",
    marginBottom: 12,
    display: "block",
    letterSpacing: 2,
  },

  heading: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    fontSize: 30,
    letterSpacing: "0.18em",
    color: "#e2d9f3",
    margin: "0 0 4px",
    textTransform: "uppercase",
  },

  subheading: {
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 400,
    fontSize: 11,
    letterSpacing: "0.35em",
    color: "rgba(148,130,210,0.65)",
    margin: "0 0 22px",
    textTransform: "uppercase",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "linear-gradient(to right, transparent, rgba(130,100,220,0.3), transparent)",
    display: "block",
  },
  dividerDot: {
    color: "rgba(167,139,250,0.5)",
    fontSize: 10,
  },

  form: { display: "flex", flexDirection: "column", gap: 16 },

  field: { textAlign: "left" },

  label: {
    display: "block",
    fontSize: 10,
    letterSpacing: "0.3em",
    color: "rgba(148,130,210,0.7)",
    marginBottom: 6,
    textTransform: "uppercase",
  },

  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 3,
    border: "1px solid rgba(100,80,180,0.25)",
    background: "rgba(15,10,40,0.6)",
    color: "#d4c8f0",
    fontSize: 14,
    fontFamily: "'Rajdhani', sans-serif",
    letterSpacing: "0.04em",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.25s, box-shadow 0.25s",
  },
  inputFocused: {
    borderColor: "rgba(167,139,250,0.7)",
    boxShadow: "0 0 0 2px rgba(130,100,220,0.12), 0 0 12px rgba(100,60,200,0.2)",
  },

  button: {
    marginTop: 8,
    padding: "13px 20px",
    border: "1px solid rgba(130,100,220,0.4)",
    borderRadius: 3,
    background: "linear-gradient(135deg, rgba(80,40,180,0.55) 0%, rgba(30,100,200,0.45) 100%)",
    color: "#e0d4ff",
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    transition: "background 0.3s, box-shadow 0.3s, transform 0.15s",
    boxShadow: "0 0 20px rgba(80,40,180,0.3)",
  },
  buttonLoading: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  btnIcon: {
    fontSize: 16,
    opacity: 0.7,
  },
  pulseText: {
    animation: "pulseText 1.2s ease infinite",
  },

  message: {
    marginTop: 18,
    fontSize: 12,
    letterSpacing: "0.15em",
    fontFamily: "'Rajdhani', sans-serif",
    animation: "fadeIn 0.4s ease both",
  },

  footer: {
    marginTop: 28,
    fontSize: 9.5,
    letterSpacing: "0.25em",
    color: "rgba(100,85,160,0.45)",
    textTransform: "uppercase",
  },
};