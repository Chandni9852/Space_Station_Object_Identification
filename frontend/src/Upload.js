import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.2,
      speed: Math.random() * 0.004 + 0.001,
      offset: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      stars.forEach((s) => {
        const twinkle = 0.4 + 0.6 * Math.sin(frame * s.speed + s.offset);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (selected) => {
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setMessage("");
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("No payload detected — select an image first");
      setMsgType("warn");
      return;
    }
    setLoading(true);
    setProgress(0);
    setMessage("");

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 12 : p));
    }, 180);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        if (data.success) {
          setMessage("Transmission complete — anomaly analysis initiated");
          setMsgType("success");
        } else {
          setMessage("Upload sequence failed — retry transmission");
          setMsgType("error");
        }
        setLoading(false);
      }, 400);
    } catch {
      clearInterval(interval);
      setProgress(0);
      setMessage("No signal detected — server unreachable");
      setMsgType("error");
      setLoading(false);
    }
  };

  const msgColors = {
    success: "#86efac",
    error: "#f87171",
    warn: "#fbbf24",
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Rajdhani:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div style={styles.root}>
        <ParticleField />

        {/* Nebula blobs */}
        <div style={styles.blob1} />
        <div style={styles.blob2} />
        <div style={styles.blob3} />

        {/* Back nav */}
        <button style={styles.backBtn} onClick={() => navigate("/home")}>
          ← Return to Bridge
        </button>

        <div style={styles.wrapper}>
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.headerIcon}>⊹</span>
            <h1 style={styles.title}>Payload Uplink</h1>
            <p style={styles.subtitle}>Deep Space Image Transmission · Sector 7</p>
            <div style={styles.divider}>
              <span style={styles.line} />
              <span style={styles.dot}>✦</span>
              <span style={styles.line} />
            </div>
          </div>

          <div style={styles.columns}>
            {/* Drop zone */}
            <div
              style={{
                ...styles.dropzone,
                ...(dragging ? styles.dropzoneDragging : {}),
                ...(preview ? styles.dropzoneHasFile : {}),
              }}
              onClick={() => !preview && fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              {preview ? (
                <div style={styles.previewWrap}>
                  <img src={preview} alt="preview" style={styles.previewImg} />
                  <div style={styles.previewOverlay}>
                    <button
                      style={styles.changeBtn}
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                    >
                      ↺ Replace
                    </button>
                  </div>
                  {/* Scan line effect */}
                  <div style={styles.scanLine} />
                </div>
              ) : (
                <div style={styles.dropPrompt}>
                  <div style={styles.uploadIcon}>
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.6)" strokeWidth="1.2">
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                  </div>
                  <p style={styles.dropText}>
                    {dragging ? "Release to transmit" : "Drop image here"}
                  </p>
                  <p style={styles.dropSub}>or click to browse payload</p>
                  <div style={styles.formatBadges}>
                    {["JPG", "PNG", "WEBP", "GIF"].map((f) => (
                      <span key={f} style={styles.badge}>{f}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Corner ornaments */}
              <span style={{ ...styles.corner, top: 10, left: 10, borderTop: "1px solid rgba(167,139,250,0.4)", borderLeft: "1px solid rgba(167,139,250,0.4)" }} />
              <span style={{ ...styles.corner, top: 10, right: 10, borderTop: "1px solid rgba(167,139,250,0.4)", borderRight: "1px solid rgba(167,139,250,0.4)" }} />
              <span style={{ ...styles.corner, bottom: 10, left: 10, borderBottom: "1px solid rgba(167,139,250,0.4)", borderLeft: "1px solid rgba(167,139,250,0.4)" }} />
              <span style={{ ...styles.corner, bottom: 10, right: 10, borderBottom: "1px solid rgba(167,139,250,0.4)", borderRight: "1px solid rgba(167,139,250,0.4)" }} />
            </div>

            {/* Right panel */}
            <div style={styles.panel}>
              {/* File info */}
              <div style={styles.infoBox}>
                <p style={styles.infoLabel}>Payload Status</p>
                {file ? (
                  <>
                    <p style={styles.fileName}>⬡ {file.name}</p>
                    <p style={styles.fileMeta}>
                      {(file.size / 1024).toFixed(1)} KB · {file.type.split("/")[1]?.toUpperCase()}
                    </p>
                  </>
                ) : (
                  <p style={styles.noFile}>— Awaiting payload —</p>
                )}
              </div>

              {/* Progress bar */}
              {loading && (
                <div style={styles.progressWrap}>
                  <div style={styles.progressLabel}>
                    <span>Transmitting</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressBar,
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Mission brief */}
              <div style={styles.missionBox}>
                <p style={styles.missionLabel}>◈ Mission Brief</p>
                <p style={styles.missionText}>
                  Transmit your deep space image for anomaly detection and analysis. Supported formats include standard visual spectra.
                </p>
              </div>

              {/* Upload button */}
              <button
                onClick={handleUpload}
                disabled={loading}
                style={{
                  ...styles.uploadBtn,
                  ...(loading ? styles.uploadBtnLoading : {}),
                }}
              >
                {loading ? (
                  <span style={styles.pulse}>◉ Transmitting…</span>
                ) : (
                  <>
                    <span>Initiate Transmission</span>
                    <span style={{ opacity: 0.6 }}>↑</span>
                  </>
                )}
              </button>

              {/* Message */}
              {message && (
                <p style={{ ...styles.msg, color: msgColors[msgType] }}>
                  ✦ {message}
                </p>
              )}
            </div>
          </div>

          <p style={styles.footer}>
            Deep Space Navigation Authority · Anomaly Detection Unit
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanMove {
          0% { top: -10% }
          100% { top: 110% }
        }
        @keyframes glow {
          0%,100% { box-shadow: 0 0 30px rgba(80,40,180,0.25), inset 0 0 30px rgba(80,40,200,0.04); }
          50% { box-shadow: 0 0 50px rgba(80,40,180,0.4), inset 0 0 40px rgba(80,40,200,0.08); }
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
    fontFamily: "'Rajdhani', sans-serif",
    position: "relative",
    overflow: "hidden",
  },

  blob1: {
    position: "fixed", width: 700, height: 500, borderRadius: "50%",
    background: "radial-gradient(ellipse, rgba(88,28,220,0.15) 0%, transparent 70%)",
    top: "-150px", left: "-200px", filter: "blur(50px)", zIndex: 1, pointerEvents: "none",
  },
  blob2: {
    position: "fixed", width: 550, height: 420, borderRadius: "50%",
    background: "radial-gradient(ellipse, rgba(20,130,200,0.12) 0%, transparent 70%)",
    bottom: "-80px", right: "-100px", filter: "blur(50px)", zIndex: 1, pointerEvents: "none",
  },
  blob3: {
    position: "fixed", width: 350, height: 250, borderRadius: "50%",
    background: "radial-gradient(ellipse, rgba(180,60,240,0.08) 0%, transparent 70%)",
    top: "40%", left: "50%", filter: "blur(60px)", zIndex: 1, pointerEvents: "none",
  },

  backBtn: {
    position: "fixed", top: 24, left: 28, zIndex: 20,
    background: "transparent",
    border: "1px solid rgba(130,100,220,0.25)",
    color: "rgba(167,139,250,0.65)",
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase",
    padding: "7px 14px", borderRadius: 3, cursor: "pointer",
    transition: "all 0.2s",
  },

  wrapper: {
    position: "relative", zIndex: 10,
    width: "min(880px, 94vw)",
    padding: "44px 0 32px",
    animation: "fadeUp 0.8s ease both",
  },

  header: { textAlign: "center", marginBottom: 36 },
  headerIcon: { fontSize: 24, color: "rgba(167,139,250,0.6)", display: "block", marginBottom: 10 },
  title: {
    fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
    fontSize: 32, letterSpacing: "0.2em", textTransform: "uppercase",
    color: "#e2d9f3", margin: "0 0 6px",
  },
  subtitle: {
    fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase",
    color: "rgba(148,130,210,0.55)", margin: "0 0 20px",
  },
  divider: { display: "flex", alignItems: "center", gap: 8, justifyContent: "center" },
  line: {
    width: 80, height: 1,
    background: "linear-gradient(to right, transparent, rgba(130,100,220,0.3), transparent)",
    display: "block",
  },
  dot: { color: "rgba(167,139,250,0.45)", fontSize: 10 },

  columns: {
    display: "flex", gap: 24, alignItems: "stretch",
  },

  // Drop zone
  dropzone: {
    flex: "1.2", minHeight: 340, position: "relative",
    border: "1px solid rgba(100,80,180,0.25)",
    borderRadius: 4,
    background: "rgba(5,8,22,0.65)",
    backdropFilter: "blur(20px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    transition: "border-color 0.25s, box-shadow 0.25s",
    overflow: "hidden",
    animation: "glow 4s ease infinite",
  },
  dropzoneDragging: {
    borderColor: "rgba(167,139,250,0.7)",
    boxShadow: "0 0 40px rgba(120,80,220,0.3), inset 0 0 40px rgba(80,40,200,0.1)",
  },
  dropzoneHasFile: {
    cursor: "default",
    borderColor: "rgba(130,100,220,0.35)",
  },

  corner: { position: "absolute", width: 14, height: 14, display: "block" },

  dropPrompt: { textAlign: "center", padding: 20 },
  uploadIcon: { marginBottom: 14 },
  dropText: {
    fontSize: 15, letterSpacing: "0.1em", color: "rgba(210,200,240,0.8)",
    margin: "0 0 4px",
  },
  dropSub: { fontSize: 11, color: "rgba(130,110,190,0.5)", letterSpacing: "0.15em", margin: "0 0 16px" },
  formatBadges: { display: "flex", gap: 6, justifyContent: "center" },
  badge: {
    fontSize: 9, letterSpacing: "0.2em",
    border: "1px solid rgba(130,100,220,0.3)",
    color: "rgba(148,130,210,0.6)",
    padding: "3px 8px", borderRadius: 2,
  },

  previewWrap: { width: "100%", height: "100%", position: "relative", minHeight: 340 },
  previewImg: {
    width: "100%", height: "100%", objectFit: "cover",
    display: "block",
  },
  previewOverlay: {
    position: "absolute", inset: 0,
    background: "rgba(3,6,15,0)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
    paddingBottom: 16,
    opacity: 0,
    transition: "opacity 0.2s",
  },
  changeBtn: {
    background: "rgba(5,8,22,0.85)",
    border: "1px solid rgba(130,100,220,0.4)",
    color: "rgba(180,160,240,0.9)",
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 11, letterSpacing: "0.2em",
    padding: "6px 14px", borderRadius: 3, cursor: "pointer",
  },
  scanLine: {
    position: "absolute", left: 0, right: 0, height: "2px",
    background: "linear-gradient(to right, transparent, rgba(120,80,220,0.5), transparent)",
    animation: "scanMove 3s linear infinite",
    pointerEvents: "none",
  },

  // Right panel
  panel: {
    flex: 1, display: "flex", flexDirection: "column", gap: 16,
  },

  infoBox: {
    padding: "18px 20px",
    border: "1px solid rgba(100,80,180,0.2)",
    borderRadius: 4,
    background: "rgba(5,8,22,0.6)",
    backdropFilter: "blur(16px)",
  },
  infoLabel: {
    fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
    color: "rgba(148,130,210,0.55)", margin: "0 0 10px",
  },
  fileName: {
    fontSize: 13, color: "#d4c8f0", letterSpacing: "0.04em",
    margin: "0 0 4px", wordBreak: "break-all",
  },
  fileMeta: { fontSize: 11, color: "rgba(130,110,190,0.6)", margin: 0, letterSpacing: "0.1em" },
  noFile: { fontSize: 12, color: "rgba(100,85,155,0.45)", letterSpacing: "0.15em", margin: 0 },

  progressWrap: { padding: "0 2px" },
  progressLabel: {
    display: "flex", justifyContent: "space-between",
    fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
    color: "rgba(148,130,210,0.6)", marginBottom: 6,
  },
  progressTrack: {
    height: 3, background: "rgba(80,60,140,0.25)", borderRadius: 2, overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(to right, rgba(100,60,200,0.7), rgba(120,180,255,0.8))",
    borderRadius: 2,
    transition: "width 0.2s ease",
    boxShadow: "0 0 8px rgba(120,140,255,0.5)",
  },

  missionBox: {
    padding: "18px 20px", flex: 1,
    border: "1px solid rgba(100,80,180,0.2)",
    borderRadius: 4,
    background: "rgba(5,8,22,0.6)",
    backdropFilter: "blur(16px)",
  },
  missionLabel: {
    fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
    color: "rgba(148,130,210,0.55)", margin: "0 0 10px",
  },
  missionText: {
    fontSize: 13, color: "rgba(180,165,220,0.6)", lineHeight: 1.7,
    letterSpacing: "0.03em", margin: 0,
  },

  uploadBtn: {
    padding: "14px 20px",
    border: "1px solid rgba(130,100,220,0.4)",
    borderRadius: 3,
    background: "linear-gradient(135deg, rgba(80,40,180,0.55) 0%, rgba(30,100,200,0.45) 100%)",
    color: "#e0d4ff",
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: 13, fontWeight: 500, letterSpacing: "0.22em",
    textTransform: "uppercase",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    boxShadow: "0 0 24px rgba(80,40,180,0.3)",
    transition: "all 0.25s",
  },
  uploadBtnLoading: { opacity: 0.65, cursor: "not-allowed" },

  pulse: { animation: "pulse 1.2s ease infinite" },

  msg: {
    fontSize: 11, letterSpacing: "0.15em",
    animation: "fadeUp 0.4s ease both",
    margin: 0, textAlign: "center",
  },

  footer: {
    textAlign: "center", marginTop: 28,
    fontSize: 9.5, letterSpacing: "0.25em", textTransform: "uppercase",
    color: "rgba(100,85,160,0.4)",
  },
};