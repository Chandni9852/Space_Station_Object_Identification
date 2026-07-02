import { useNavigate } from "react-router-dom";

function Detection() {
    const navigate = useNavigate();

    const data = JSON.parse(
    localStorage.getItem("latestPrediction")
  );
  if (!data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#070b18",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          color: "white",
        }}
      >
        <h1>No Detection Data Found</h1>

        <button
  onClick={() =>
    navigate("/home", {
      state: {
        activeTab: "Live Feed",
      },
    })
  }
  style={{
    marginTop: "20px",
    padding: "14px 28px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "#00d9ff",
    color: "#08111f",
    fontWeight: "bold",
  }}
>
  Start New Scan
</button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #111827 0%, #0a1020 45%, #050814 100%)",
        color: "#d9f6ff",
        padding: "40px",
        fontFamily: "Orbitron, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h3
          style={{
            color: "#00d9ff",
            letterSpacing: "5px",
            marginBottom: "10px",
          }}
        >
          ORBITAL SENTINEL
        </h3>

        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "40px",
          }}
        >
          Payload Analysis Report
        </h1>

        {/* TOP SECTION */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "30px",
            marginBottom: "35px",
          }}
        >
          {/* IMAGE */}

          <div
            style={{
              background: "rgba(20,28,45,.9)",
              borderRadius: "18px",
              padding: "20px",
              border: "1px solid rgba(0,217,255,.25)",
            }}
          >
            <h2 style={{ marginBottom: "20px", color: "#00d9ff" }}>
              Annotated Detection
            </h2>

            <img
              src={`https://space-station-backend.onrender.com${data.annotatedImage}`}
              alt="Prediction"
              style={{
                width: "100%",
                borderRadius: "14px",
              }}
            />
          </div>

          {/* SUMMARY */}

          <div
            style={{
              background: "rgba(20,28,45,.9)",
              borderRadius: "18px",
              padding: "25px",
              border: "1px solid rgba(0,217,255,.25)",
            }}
          >
            <h2
              style={{
                color: "#00d9ff",
                marginBottom: "25px",
              }}
            >
              Threat Assessment
            </h2>

            <h3>Risk Score</h3>

            <div
              style={{
                width: "100%",
                height: "14px",
                background: "#222",
                borderRadius: "8px",
                overflow: "hidden",
                marginTop: "12px",
              }}
            >
              <div
                style={{
                  width: `${data.risk * 10}%`,
                  height: "100%",
                  background:
                    data.risk >= 7
                      ? "#ef4444"
                      : data.risk >= 4
                      ? "#f59e0b"
                      : "#22c55e",
                }}
              />
            </div>

            <p
              style={{
                fontSize: "26px",
                marginTop: "15px",
                fontWeight: "bold",
              }}
            >
              {data.risk} / 10
            </p>

            <hr
              style={{
                margin: "30px 0",
                borderColor: "rgba(255,255,255,.08)",
              }}
            />

            <h3>Assigned Zone</h3>

            <p
              style={{
                color: "#00d9ff",
                fontSize: "22px",
              }}
            >
              {data.zone}
            </p>

            <hr
              style={{
                margin: "30px 0",
                borderColor: "rgba(255,255,255,.08)",
              }}
            />

            <h3>Objects Detected</h3>

            <p
              style={{
                fontSize: "24px",
                color: "#00d9ff",
              }}
            >
              {data.objects.length}
            </p>
          </div>
        </div>

        {/* OBJECTS */}

        <div
          style={{
            background: "rgba(20,28,45,.9)",
            borderRadius: "18px",
            padding: "25px",
            border: "1px solid rgba(0,217,255,.25)",
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              color: "#00d9ff",
              marginBottom: "20px",
            }}
          >
            Detected Equipment
          </h2>

          {data.objects.length === 0 ? (
            <p>No objects detected.</p>
          ) : (
            data.objects.map((obj, index) => (
  <div
    key={index}
    style={{
      background: "#111827",
      padding: "14px",
      borderRadius: "10px",
      marginBottom: "12px",
      borderLeft: "4px solid #00d9ff",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <span>✓ {obj.name}</span>

    <span
      style={{
        color: "#00d9ff",
        fontWeight: "bold",
      }}
    >
      {(obj.confidence * 100).toFixed(1)}%
    </span>
  </div>
))
          )}
        </div>

        {/* RECOMMENDATION */}

        <div
          style={{
            background: "rgba(20,28,45,.9)",
            borderRadius: "18px",
            padding: "25px",
            border: "1px solid rgba(0,217,255,.25)",
          }}
        >
          <h2
            style={{
              color: "#00d9ff",
              marginBottom: "18px",
            }}
          >
  Mission Recommendation
</h2>

{data.recommendations && data.recommendations.length > 0 ? (
  data.recommendations.map((item, index) => (
    <div
      key={index}
      style={{
        background: "#111827",
        padding: "14px",
        borderRadius: "10px",
        marginBottom: "12px",
        borderLeft: "4px solid #00d9ff",
      }}
    >
      ✓ {item}
    </div>
  ))
) : (
  <p>No recommendations available.</p>
)}

<button
  onClick={() =>
    navigate("/home", {
      state: {
        activeTab: "Live Feed",
      },
    })
  }
  style={{
    marginTop: "30px",
    padding: "15px 35px",
    border: "none",
    borderRadius: "10px",
    background: "#00d9ff",
    color: "#08111f",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
	Start Another Scan
</button>      
</div>
</div>
</div>
);
}

export default Detection;