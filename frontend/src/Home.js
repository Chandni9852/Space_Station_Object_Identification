import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import Detection from "./Detection";
import LiveFeed from "./LiveFeed";
import { useLocation } from "react-router-dom";

/* ─── FONTS & GLOBAL STYLES ─────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0c1321; color: #dce2f6; font-family: 'JetBrains Mono', monospace; overflow: hidden; }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #3c494e; border-radius: 10px; }

    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      font-family: 'Material Symbols Outlined';
      font-style: normal;
      line-height: 1;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
    }
    @keyframes loading {
    0% {
    transform: translateX(-100%);
    }

    100% {
    transform: translateX(100%);
    }
    }
    @keyframes scan {
      0%   { top: -2px; opacity: 0; }
      5%   { opacity: 0.6; }
      95%  { opacity: 0.6; }
      100% { top: 100%; opacity: 0; }
    }
    @keyframes pulse-ring {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50%       { opacity: 0.7; transform: scale(1.05); }
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes countUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes float {
      0%,100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    @keyframes glow-pulse {
      0%,100% { box-shadow: 0 0 12px rgba(0,209,255,0.3); }
      50% { box-shadow: 0 0 28px rgba(0,209,255,0.7); }
    }

    .blink { animation: blink 1.5s ease-in-out infinite; }
    .float-anim { animation: float 5s ease-in-out infinite; }
    .glow-anim { animation: glow-pulse 2.5s ease-in-out infinite; }
    .nav-active {
      background: #19202e;
      color: #00d1ff !important;
      border-left: 3px solid #00d1ff;
    }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 16px; cursor: pointer;
      color: #6b7fa8; font-size: 13px; font-weight: 600;
      letter-spacing: 0.04em; transition: all 0.18s ease;
      border-left: 3px solid transparent;
    }
    .nav-item:hover { color: #a4e6ff; background: #13192a; }
    .stat-card {
      background: #19202e;
      border: 1px solid rgba(0,209,255,0.08);
      border-radius: 12px;
      padding: 20px;
      position: relative;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .stat-card:hover { border-color: rgba(0,209,255,0.25); }
    .stat-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0,209,255,0.4), transparent);
    }
    .glass-card {
      background: rgba(25,32,46,0.8);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(0,209,255,0.07);
      border-radius: 12px;
    }
  `}</style>
);

/* ─── 3D GLOBE SCENE ─────────────────────────────────────────────────── */
function HazardMarker({ position, color }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.8;
  });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function OrbitalRing({ radius, tilt, speed, color, opacity }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 8, 180]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function GlobeScene() {
  const meshRef = useRef();
  const innerRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.09;
      meshRef.current.rotation.x = Math.sin(t * 0.04) * 0.08;
    }
    if (innerRef.current) innerRef.current.rotation.y = -t * 0.05;
  });

  return (
    <group>
      <mesh ref={innerRef}>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshStandardMaterial color="#040c18" transparent opacity={0.95} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.62, 40, 40]} />
        <meshStandardMaterial color="#00d1ff" wireframe transparent opacity={0.14} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.75, 32, 32]} />
        <meshStandardMaterial color="#00d1ff" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
      <OrbitalRing radius={2.3} tilt={1.2} speed={0.18} color="#00d1ff" opacity={0.35} />
      <OrbitalRing radius={2.8} tilt={0.6} speed={-0.12} color="#a4e6ff" opacity={0.18} />
      <OrbitalRing radius={3.2} tilt={1.8} speed={0.08} color="#ffd59c" opacity={0.12} />
      <HazardMarker position={[1.7, 0.8, 0.5]} color="#ff4444" />
      <HazardMarker position={[-1.3, -0.9, 1.2]} color="#ffd59c" />
      <HazardMarker position={[0.5, 1.5, -1.1]} color="#00d1ff" />
      <HazardMarker position={[-0.8, 0.5, -1.6]} color="#ff8c00" />
    </group>
  );
}

/* ─── SIDEBAR ────────────────────────────────────────────────────────── */
function Sidebar({ active, setActive, navigate }) {
  const items = [
  { icon: "dashboard", label: "Dashboard" },

  { icon: "upload_file", label: "Upload Image" },

  { icon: "sensors", label: "Live Feed" },
  { icon: "visibility", label: "Detection" },
  { icon: "local_fire_department", label: "Fire Risk" },
  { icon: "history", label: "History" },
  { icon: "settings", label: "Settings" },
];
  return (
    <aside style={{
      position: "fixed", left: 0, top: 0, width: 240, height: "100vh",
      background: "#0c1321", borderRight: "1px solid rgba(0,209,255,0.07)",
      display: "flex", flexDirection: "column", zIndex: 50,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Logo */}
      <div style={{ padding: "28px 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            border: "1.5px solid rgba(0,209,255,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(0,209,255,0.35)",
          }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00d1ff" }} />
          </div>
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontWeight: 900, fontSize: 13, letterSpacing: "0.15em",
            color: "#a4e6ff", textTransform: "uppercase",
          }}>Orbital Sentinel</span>
        </div>
        <p style={{ fontSize: 9, color: "rgba(164,230,255,0.4)", letterSpacing: "0.35em", paddingLeft: 38, textTransform: "uppercase" }}>
          Celestial Observer
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {items.map(({ icon, label }) => (
          <div
            key={label}
            className={`nav-item ${active === label ? "nav-active" : ""}`}
            onClick={() => {
    		if (label === "Upload Image") {
        	navigate("/upload");
    		} else {
        	setActive(label);
    		}
		}}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
            {label}
          </div>
        ))}
      </nav>

      {/* System Status */}
      <div style={{ padding: "16px 16px 24px" }}>
        <div style={{
          padding: "14px 16px", borderRadius: 10,
          background: "#111827", border: "1px solid rgba(0,209,255,0.08)",
        }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "#6b7fa8", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 10 }}>
            System Status
          </p>
          {[
            { label: "Optics Online", color: "#00d1ff", pulse: true },
            { label: "YOLOv8 Active", color: "#4ade80", pulse: true },
            { label: "Risk Engine", color: "#ffd59c", pulse: false },
          ].map(({ label, color, pulse }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", background: color,
                boxShadow: `0 0 8px ${color}`,
                ...(pulse ? { animation: "blink 1.5s ease-in-out infinite" } : {}),
              }} />
              <span style={{ fontSize: 10, color: "#a4bfc9" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ─── TOP BAR ────────────────────────────────────────────────────────── */
function TopBar({ active }) {
  return (
    <header style={{
      position: "fixed", top: 0, left: 240, right: 0, height: 62, zIndex: 40,
      background: "rgba(12,19,33,0.85)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(0,209,255,0.08)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "rgba(0,209,255,0.35)", fontWeight: 900, fontSize: 16, letterSpacing: 4 }}>///</span>
        <span style={{
          fontFamily: "'Orbitron', monospace", fontSize: 10, fontWeight: 700,
          color: "#00d1ff", letterSpacing: "0.2em", textTransform: "uppercase",
        }}>
          Orbital Sentinel / {active}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative" }}>
          <span className="material-symbols-outlined" style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            fontSize: 14, color: "#6b7fa8",
          }}>search</span>
          <input
            placeholder="SEARCH SENSOR DATA..."
            style={{
              background: "#0a1020", border: "1px solid rgba(0,209,255,0.12)",
              borderRadius: 20, padding: "7px 14px 7px 32px",
              fontSize: 9, color: "#a4e6ff", letterSpacing: "0.15em",
              outline: "none", width: 200, fontFamily: "'JetBrains Mono', monospace",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderLeft: "1px solid rgba(0,209,255,0.1)", paddingLeft: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #00d1ff, #004e60)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1.5px solid rgba(0,209,255,0.3)", fontSize: 12, fontWeight: 700, color: "#fff",
          }}>CA</div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#dce2f6", letterSpacing: "0.1em" }}>COMMANDER ALPHA</div>
            <div style={{ fontSize: 8, color: "#6b7fa8", letterSpacing: "0.1em" }}>LEVEL 4 CLEARANCE</div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─── STAT CARDS ─────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, color, delay }) {
  const [display, setDisplay] = useState(0);
  const numVal = parseInt(value);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(numVal / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= numVal) { setDisplay(numVal); clearInterval(timer); }
      else setDisplay(start);
    }, 40);
    return () => clearInterval(timer);
  }, [numVal]);

  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: color, opacity: 0.6 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#6b7fa8", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Orbitron', monospace", fontSize: 32, fontWeight: 900,
        color: color, lineHeight: 1,
        textShadow: `0 0 20px ${color}55`,
      }}>
        {typeof value === "string" && value.includes("%") ? value : display}
        {typeof value === "string" && value.includes("%") ? "" : ""}
      </div>
      <div style={{ fontSize: 9, color: "#4a5a6a", marginTop: 6 }}>{sub}</div>
      <div style={{ marginTop: 10, height: 2, background: "#1e2a3a", borderRadius: 2 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((numVal / 150) * 100, 100)}%` }}
          transition={{ delay: delay + 0.3, duration: 0.8 }}
          style={{ height: "100%", background: color, borderRadius: 2, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </motion.div>
  );
}

/* ─── DETECTION LOG ──────────────────────────────────────────────────── */


function DetectionLog() {
  const latestPrediction = JSON.parse(
  localStorage.getItem("latestPrediction") || "null"
  );
  return (
    <div className="glass-card" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#00d1ff" }}>format_list_bulleted</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#dce2f6" }}>
            Detection Log
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff4444", boxShadow: "0 0 6px #ff4444" }} className="blink" />
          <span style={{ fontSize: 8, color: "#ff4444", fontWeight: 700, letterSpacing: "0.15em" }}>LIVE</span>
        </div>
      </div>
      
	<div style={{ overflowY: "auto", maxHeight: 220 }}>
  {latestPrediction ? (
    latestPrediction.objects.map((obj, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 * index }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px",
          marginBottom: "10px",
          borderRadius: "8px",
          background: "#121b2b",
        }}
      >
        <div>
          <div
            style={{
              color: "#dce2f6",
              fontWeight: "600",
            }}
          >
            {obj.name}
          </div>

          <div
            style={{
              color: "#6b7fa8",
              fontSize: "12px",
            }}
          >
            Confidence: {(obj.confidence * 100).toFixed(1)}%
          </div>
        </div>

        <span
          style={{
            color: "#00d9ff",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          DETECTED
        </span>
      </motion.div>
    ))
  ) : (
    <p>No detections yet.</p>
  )}
</div>
    </div>
  );
}

/* ─── ZONE RISK ──────────────────────────────────────────────────────── */
const zones = [
  { zone: "Zone A", score: 82, label: "CRITICAL", color: "#ff4444" },
  { zone: "Zone B", score: 54, label: "HIGH", color: "#ff8c00" },
  { zone: "Zone C", score: 31, label: "MEDIUM", color: "#ffd59c" },
  { zone: "Zone D", score: 12, label: "LOW", color: "#4ade80" },
];

function ZoneRisk() {
  return (
    <div className="glass-card" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#ffd59c" }}>local_fire_department</span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#dce2f6" }}>
          Zone Fire Risk
        </span>
      </div>
      {zones.map((z, i) => (
        <motion.div key={z.zone} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: "#a4bfc9" }}>{z.zone}</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: z.color }}>{z.score}</span>
              <span style={{
                fontSize: 7, fontWeight: 700, color: z.color, letterSpacing: "0.1em",
                padding: "1px 5px", borderRadius: 3, background: `${z.color}18`, border: `1px solid ${z.color}30`,
              }}>{z.label}</span>
            </div>
          </div>
          <div style={{ height: 4, background: "#1e2a3a", borderRadius: 2 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${z.score}%` }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.7 }}
              style={{ height: "100%", background: `linear-gradient(90deg, ${z.color}88, ${z.color})`, borderRadius: 2, boxShadow: `0 0 8px ${z.color}60` }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── RELOCATION SUGGESTIONS ─────────────────────────────────────────── */
function RelocationPanel() {
  const suggestions = [
    { from: "Zone A-1", to: "Zone D-2", reason: "Proximity to fuel canister", urgency: "URGENT" },
    { from: "Zone B-2", to: "Zone C-3", reason: "O₂ tank near heat source", urgency: "HIGH" },
    { from: "Zone A-4", to: "Zone A-1", reason: "Extinguisher coverage gap", urgency: "MED" },
  ];
  return (
    <div className="glass-card" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#a4e6ff" }}>swap_horiz</span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#dce2f6" }}>
          Extinguisher Relocation
        </span>
      </div>
      {suggestions.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          style={{
            padding: "10px 12px", marginBottom: 8, borderRadius: 8,
            background: "rgba(0,209,255,0.04)", border: "1px solid rgba(0,209,255,0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10 }}>
              <span style={{ color: "#ff8c00" }}>{s.from}</span>
              <span className="material-symbols-outlined" style={{ fontSize: 12, color: "#4a6070" }}>arrow_forward</span>
              <span style={{ color: "#4ade80" }}>{s.to}</span>
            </div>
            <span style={{
              fontSize: 7, fontWeight: 700, letterSpacing: "0.1em",
              color: s.urgency === "URGENT" ? "#ff4444" : s.urgency === "HIGH" ? "#ff8c00" : "#ffd59c",
              padding: "2px 5px", borderRadius: 3,
              background: s.urgency === "URGENT" ? "#ff444418" : s.urgency === "HIGH" ? "#ff8c0018" : "#ffd59c18",
            }}>{s.urgency}</span>
          </div>
          <p style={{ fontSize: 9, color: "#4a6070" }}>{s.reason}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── 3D PANEL ───────────────────────────────────────────────────────── */
function ThreeDPanel() {
  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,209,255,0.1)", height: 320 }}>
      {/* scan line */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(0,209,255,0.5), transparent)",
          boxShadow: "0 0 10px #00d1ff",
          animation: "scan 6s linear infinite",
        }} />
      </div>
      {/* grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.04,
        backgroundImage: "linear-gradient(rgba(0,209,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,1) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      {/* corner accents */}
      {[
        { top: 12, left: 12, borderTop: "2px solid rgba(0,209,255,0.4)", borderLeft: "2px solid rgba(0,209,255,0.4)" },
        { top: 12, right: 12, borderTop: "2px solid rgba(0,209,255,0.4)", borderRight: "2px solid rgba(0,209,255,0.4)" },
        { bottom: 12, left: 12, borderBottom: "2px solid rgba(0,209,255,0.4)", borderLeft: "2px solid rgba(0,209,255,0.4)" },
        { bottom: 12, right: 12, borderBottom: "2px solid rgba(0,209,255,0.4)", borderRight: "2px solid rgba(0,209,255,0.4)" },
      ].map((s, i) => (
        <div key={i} style={{ position: "absolute", width: 18, height: 18, zIndex: 3, ...s }} />
      ))}
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} style={{ background: "#060d1a" }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} color="#00d1ff" />
        <pointLight position={[-4, -4, -4]} intensity={0.3} color="#4cd6ff" />
        <Stars radius={60} depth={30} count={2000} factor={3} fade speed={0.3} />
        <GlobeScene />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
      {/* overlay label */}
      <div style={{
        position: "absolute", bottom: 14, left: 16, zIndex: 4,
        fontFamily: "'Orbitron', monospace", fontSize: 8, color: "rgba(0,209,255,0.6)",
        letterSpacing: "0.2em", textTransform: "uppercase",
      }}>
        ◈ Orbital Grid — Live Hazard Map
      </div>
      <div style={{
        position: "absolute", bottom: 14, right: 16, zIndex: 4,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "rgba(164,230,255,0.4)",
        letterSpacing: "0.1em",
      }}>
        ISS-STA 408KM ▸ 28.5°N 77.1°E
      </div>
    </div>
  );
}
/* ─── Latest Prediction ───────────────────────────────────────────────────────── */

function LatestPrediction() {

  const latestPrediction = JSON.parse(
    localStorage.getItem("latestPrediction")
  );

  return (
    <div
      className="glass-card"
      style={{
        height: 320,
        padding: "18px",
        borderRadius: "12px",
        border: "1px solid rgba(0,209,255,.12)",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: "#00d1ff",
          letterSpacing: "0.18em",
          marginBottom: "12px",
          textTransform: "uppercase",
        }}
      >
        Latest AI Detection
      </div>

      {latestPrediction ? (
        <>
          <img
            src={`https://space-station-backend.onrender.com${latestPrediction.annotatedImage}`}
            alt="Latest Detection"
            style={{
              width: "100%",
              height: "220px",
              objectFit: "contain",
              borderRadius: "10px",
            }}
          />

          <div
            style={{
              marginTop: "10px",
              color: "#9fb4d3",
              fontSize: "12px",
            }}
          >
            Zone: <span style={{ color: "#00d1ff" }}>{latestPrediction.zone}</span>
          </div>

          <div
            style={{
              color: "#9fb4d3",
              fontSize: "12px",
            }}
          >
            Risk Score: <span style={{ color: "#ff6961" }}>{latestPrediction.risk}/10</span>
          </div>
        </>
      ) : (
        <div
          style={{
            height: "240px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#6b7fa8",
          }}
        >
          Awaiting AI Scan...
        </div>
      )}
    </div>
  );
}

/* ─── COMMING SOON ─────────────────────────────────────────────────── */


function ComingSoon({ page }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: 40,
          color: "rgba(0,209,255,0.2)",
        }}
      >
        construction
      </span>

      <h2 style={{ color: "#d9f6ff" }}>{page}</h2>

      <p
        style={{
          fontSize: 11,
          color: "#4a6070",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        Coming Soon
      </p>
    </div>
  );
}

/* ─── DASHBOARD PAGE ─────────────────────────────────────────────────── */
function DashboardPage() {

	const latestPrediction = JSON.parse(
  	localStorage.getItem("latestPrediction")
	);
	const objectCount = latestPrediction
  	? latestPrediction.objects.length
  	: 0;

	const riskScore = latestPrediction
  	? latestPrediction.risk
  	: 0;

	const zone = latestPrediction
  	? latestPrediction.zone
  	: "N/A";
	
	const zoneCount = latestPrediction ? 1 : 0;

	const recommendations = latestPrediction
  	? latestPrediction.recommendations
  	: [];

  	return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%", paddingTop: 20 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#00d1ff", display: "block", marginBottom: 4 }}>
          Detection Engine
        </span>
        <h2 style={{
          fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 700,
          color: "#dce2f6", letterSpacing: "0.04em",
        }}>
          Space Safety <span style={{ color: "#00d1ff" }}>Dashboard</span>
        </h2>
        <p style={{ fontSize: 10, color: "#4a6878", marginTop: 4 }}>
          YOLOv8 · Real-time object detection · Fire risk analysis · Extinguisher relocation
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard
  icon="category"
  label="Objects Detected"
  value={objectCount.toString()}
  sub={latestPrediction ? "Latest AI Scan" : "No scan yet"}
  color="#00d1ff"
  delay={0.1}
/>

<StatCard
  icon="local_fire_department"
  label="Fire Risk Score"
  value={riskScore.toString()}
  sub={zone}
  color="#ff4444"
  delay={0.2}
/>

<StatCard
  icon="grid_view"
  label="Zones Monitored"
  value={zoneCount.toString()}
  sub={zone}
  color="#ffd59c"
  delay={0.3}
/>
<StatCard
  icon="notifications_active"
  label="Recommendations"
  value={recommendations.length.toString()}
  sub="AI Suggestions"
  color="#ff8c00"
  delay={0.4}
/>

</div>

      {/* 3D Globe + AI Detection + Detection Log */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 14,
    marginBottom: 14,
  }}
>
  <ThreeDPanel />

  <LatestPrediction />

  <DetectionLog />
</div>
      {/* Zone Risk + Relocation */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <ZoneRisk />
        <RelocationPanel />
      </div>
    </div>
  );
}

/* ─── FIRE RISK PAGE ───────────────────────────────────────────────────────── */
function FireRiskPage() {
  const latestPrediction = JSON.parse(
    localStorage.getItem("latestPrediction") || "null"
  );

  if (!latestPrediction) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h1>No Fire Risk Data Available</h1>
        <p>Perform a scan first.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px", color: "#dce2f6" }}>

      <h1
        style={{
          color: "#00d1ff",
          marginBottom: "30px",
          fontFamily: "Orbitron",
        }}
      >
        🔥 Fire Risk Analysis
      </h1>

      {/* Top Cards */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "20px",
          marginBottom: "25px",
        }}
      >

        <div className="glass-card" style={{ padding: 25 }}>
          <h3>Overall Risk</h3>

          <h1
            style={{
              color:
                latestPrediction.risk >= 7
                  ? "#ef4444"
                  : latestPrediction.risk >= 4
                  ? "#f59e0b"
                  : "#22c55e",
            }}
          >
            {latestPrediction.risk}/10
          </h1>
        </div>

        <div className="glass-card" style={{ padding: 25 }}>
          <h3>Assigned Zone</h3>

          <h1 style={{ color: "#00d1ff" }}>
            {latestPrediction.zone}
          </h1>
        </div>

        <div className="glass-card" style={{ padding: 25 }}>
          <h3>Mission Status</h3>

          <h1
            style={{
              color:
                latestPrediction.risk >= 7
                  ? "#ef4444"
                  : latestPrediction.risk >= 4
                  ? "#f59e0b"
                  : "#22c55e",
            }}
          >
            {latestPrediction.risk >= 7
              ? "CRITICAL"
              : latestPrediction.risk >= 4
              ? "WARNING"
              : "SAFE"}
          </h1>
        </div>

      </div>

      {/* Risk Meter */}

      <div className="glass-card" style={{ padding: 25 }}>

        <h2 style={{ marginBottom: 20 }}>Risk Meter</h2>

        <div
          style={{
            width: "100%",
            height: "18px",
            background: "#1d2435",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${latestPrediction.risk * 10}%`,
              height: "100%",
              background:
                latestPrediction.risk >= 7
                  ? "#ef4444"
                  : latestPrediction.risk >= 4
                  ? "#f59e0b"
                  : "#22c55e",
            }}
          />
        </div>

      </div>

      {/* Recommendations */}

      <div
        className="glass-card"
        style={{
          marginTop: 25,
          padding: 25,
        }}
      >

        <h2
          style={{
            color: "#00d1ff",
            marginBottom: 20,
          }}
        >
          AI Recommendations
        </h2>

        {latestPrediction.recommendations.map((item, index) => (
          <div
            key={index}
            style={{
              background: "#121b2b",
              padding: "14px",
              borderRadius: "10px",
              marginBottom: "12px",
            }}
          >
            ✓ {item}
          </div>
        ))}

      </div>

      {/* Equipment */}

      <div
        className="glass-card"
        style={{
          marginTop: 25,
          padding: 25,
        }}
      >

        <h2
          style={{
            color: "#00d1ff",
            marginBottom: 20,
          }}
        >
          Detected Equipment
        </h2>

        {latestPrediction.objects.map((obj, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              background: "#121b2b",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "10px",
            }}
          >
            <span>{obj.name}</span>

            <span style={{ color: "#00d1ff" }}>
              {(obj.confidence * 100).toFixed(1)}%
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}

/* ─── HISTORY PAGE ───────────────────────────────────────────────────────── */

function HistoryPage() {

  const history = JSON.parse(
    localStorage.getItem("predictionHistory") || "[]"
  );

  return (
    <div
      style={{
        padding: "30px",
        color: "#dce2f6",
      }}
    >
      <h1
        style={{
          color: "#00d1ff",
          marginBottom: "30px",
          fontFamily: "Orbitron",
        }}
      >
        📜 Mission History
      </h1>

      {history.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: "40px",
            textAlign: "center",
          }}
        >
          <h2>No mission history available</h2>
          <p>Perform your first detection scan.</p>
        </div>
      ) : (

        history.map((scan, index) => (

          <div
            key={index}
            className="glass-card"
            style={{
              marginBottom: "20px",
              padding: "25px",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
              }}
            >

              <h2>
                Scan #{history.length - index}
              </h2>

              <span
                style={{
                  color: "#7ea8c7",
                }}
              >
                {scan.timestamp}
              </span>

            </div>

            <hr
              style={{
                borderColor: "#1f2937",
                marginBottom: "20px",
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "20px",
                marginBottom: "20px",
              }}
            >

              <div>
                <h4>Risk Score</h4>
                <p
                  style={{
                    color:
                      scan.risk >= 7
                        ? "#ef4444"
                        : scan.risk >= 4
                        ? "#f59e0b"
                        : "#22c55e",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  {scan.risk}/10
                </p>
              </div>

              <div>
                <h4>Zone</h4>
                <p
                  style={{
                    color: "#00d1ff",
                    fontSize: "22px",
                  }}
                >
                  {scan.zone}
                </p>
              </div>

              <div>
                <h4>Objects</h4>
                <p
                  style={{
                    color: "#00d1ff",
                    fontSize: "22px",
                  }}
                >
                  {scan.objects.length}
                </p>
              </div>

            </div>

            <h3
              style={{
                color: "#00d1ff",
                marginBottom: "15px",
              }}
            >
              Detected Equipment
            </h3>

            {scan.objects.length === 0 ? (

              <p>No equipment detected.</p>

            ) : (

              scan.objects.map((obj, i) => (

                <div
                  key={i}
                  style={{
                    background: "#121b2b",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{obj.name}</span>

                  <span style={{ color: "#00d1ff" }}>
                    {(obj.confidence * 100).toFixed(1)}%
                  </span>
                </div>

              ))

            )}

          </div>

        ))

      )}
    </div>
  );
}

/* ─── SETTINGS PAGE ───────────────────────────────────────────────────────── */

function SettingsPage() {

  const latestPrediction = JSON.parse(
    localStorage.getItem("latestPrediction") || "null"
  );

  return (
    <div
      style={{
        padding: "30px",
        color: "#dce2f6",
      }}
    >
      <h1
        style={{
          color: "#00d1ff",
          marginBottom: "30px",
          fontFamily: "Orbitron",
        }}
      >
        ⚙ System Settings
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: "20px",
        }}
      >

        {/* Model */}

        <div className="glass-card" style={{ padding: "25px" }}>
          <h2 style={{ color: "#00d1ff" }}>AI Model</h2>

          <p><b>Model:</b> YOLOv8</p>
          <p><b>Framework:</b> Ultralytics</p>
          <p><b>Detection Threshold:</b> 0.30</p>
          <p><b>Classes:</b> FireExtinguisher, OxygenTank, ToolBox</p>
        </div>

        {/* Application */}

        <div className="glass-card" style={{ padding: "25px" }}>
          <h2 style={{ color: "#00d1ff" }}>Application</h2>

          <p><b>Frontend:</b> React</p>
          <p><b>Backend:</b> Express + Python</p>
          <p><b>Database:</b> Local Storage</p>
          <p><b>Version:</b> v1.0</p>
        </div>

        {/* Mission */}

        <div className="glass-card" style={{ padding: "25px" }}>
          <h2 style={{ color: "#00d1ff" }}>Mission Statistics</h2>

          <p>
            <b>Latest Zone:</b>{" "}
            {latestPrediction ? latestPrediction.zone : "N/A"}
          </p>

          <p>
            <b>Latest Risk:</b>{" "}
            {latestPrediction ? `${latestPrediction.risk}/10` : "N/A"}
          </p>

          <p>
            <b>Objects Detected:</b>{" "}
            {latestPrediction ? latestPrediction.objects.length : 0}
          </p>
        </div>

        {/* About */}

        <div className="glass-card" style={{ padding: "25px" }}>
          <h2 style={{ color: "#00d1ff" }}>About</h2>

          <p>
            Orbital Sentinel is an AI-powered space station safety monitoring
            system that detects critical equipment using YOLOv8, performs
            fire-risk analysis, and generates intelligent mission
            recommendations in real time.
          </p>
        </div>

      </div>
    </div>
  );
}

/* ─── APP ROOT ───────────────────────────────────────────────────────── */
export default function App() {
  const location = useLocation();
  const [active, setActive] = useState(
  location.state?.activeTab || "Dashboard"
);
  useEffect(() => {
  if (location.state?.activeTab) {
    setActive(location.state.activeTab);
  }
}, [location]);
  const navigate = useNavigate();

 

  return (
    <>
      <GlobalStyles />
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#0c1321" }}>
        <Sidebar
    	active={active}
    	setActive={setActive}
    	navigate={navigate}
	/>
        <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <TopBar active={active} />
          <main style={{ marginTop: 62, flex: 1, overflow: "hidden" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                style={{ height: "100%", overflowY: "auto" }}
                className="custom-scrollbar"
              >
                {active === "Dashboard" && <DashboardPage />}

		{active === "Detection" && <Detection />}

		{active === "Live Feed" && (
  		<LiveFeed />
		)}

		{active === "Fire Risk" && <FireRiskPage />}

		{active === "History" && <HistoryPage />}

		{active === "Settings" && <SettingsPage />}

              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </>
  );
}