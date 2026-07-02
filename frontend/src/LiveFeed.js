
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function LiveFeed() {

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  
  async function startCamera() {

  if (cameraOn) return;

  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
      });

    streamRef.current = stream;

    videoRef.current.srcObject = stream;

    setCameraOn(true);

  } catch (err) {

    console.log(err);

  }

}
  useEffect(() => {

    startCamera();

    return () => {

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

    };

}, []);
  
  function stopCamera() {

    if (streamRef.current) {

        streamRef.current.getTracks().forEach(track => track.stop());

        streamRef.current = null;

        videoRef.current.srcObject = null;
    }

    setCameraOn(false);
  }

async function captureAndAnalyze() {

  console.log("Capture button clicked");
  const canvas = canvasRef.current;
  const video = videoRef.current;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");

  ctx.drawImage(video, 0, 0);

  canvas.toBlob(async (blob) => {
    console.log(blob);

    const formData = new FormData();

    formData.append(
      "image",
      blob,
      "camera_capture.jpg"
    );
	console.log("Sending image to backend...");
	setAnalyzing(true);
    const response = await fetch(
      "https://space-station-backend.onrender.com/upload",
      {
        method: "POST",
        body: formData,
      }
    );
	
	console.log(response);

    const data = await response.json();
    console.log(data);

    if (data.success) {
	setAnalyzing(false);
  	localStorage.setItem(
  	"latestPrediction",
  	JSON.stringify(data)
	);

	// Save scan history
	const history = JSON.parse(
  	localStorage.getItem("predictionHistory") || "[]"
	);

	history.unshift({
  	...data,
  	timestamp: new Date().toLocaleString(),
	});

	localStorage.setItem(
  	"predictionHistory",
  	JSON.stringify(history)
	);

  	stopCamera();
	console.log("Navigating to Detection page...");

  	navigate("/detection", {
    	state: data,
  	});

}

  }, "image/jpeg");

}


  return (
	<>
{analyzing && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(3,8,20,0.92)",
      backdropFilter: "blur(8px)",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      color: "#d9f6ff",
      fontFamily: "Orbitron, sans-serif",
    }}
  >
    <h1
      style={{
        color: "#00d9ff",
        letterSpacing: "4px",
        marginBottom: "15px",
      }}
    >
      ORBITAL SENTINEL
    </h1>

    <h2
      style={{
        marginBottom: "35px",
      }}
    >
      AI ANALYSIS IN PROGRESS
    </h2>

    <div
      style={{
        width: "260px",
        height: "12px",
        background: "#1b2435",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "35px",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#00d9ff",
          animation: "loading 2s linear infinite",
        }}
      />
    </div>

    <p>Initializing Vision Module...</p>
    <p>Scanning ISS Environment...</p>
    <p>Running YOLOv8 Detection...</p>
    <p>Calculating Mission Risk...</p>
    <p>Calculating Mission Risk...</p>
  </div>
)}


    <div
      style={{
        padding: 40,
        color: "#d9f6ff",
        minHeight: "100vh",
        background: "#08111f",
      }}
    >

      <h1>Live Camera Feed</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "720px",
          borderRadius: "18px",
          border: "2px solid #00d9ff",
        }}
      />
	<canvas
  	ref={canvasRef}
  	style={{ display: "none" }}
	/>

      <br /><br />

      <div
  style={{
    display: "flex",
    gap: "20px",
    marginTop: "25px",
  }}
>
  <button
    onClick={startCamera}
    disabled={cameraOn}
    style={{
      padding: "14px 28px",
      border: "none",
      borderRadius: "10px",
      cursor: cameraOn ? "not-allowed" : "pointer",
      background: cameraOn ? "#374151" : "#00d9ff",
      color: "#08111f",
      fontWeight: "bold",
      fontSize: "15px",
    }}
  >
    📷 Start Camera
  </button>

  <button
    onClick={stopCamera}
    disabled={!cameraOn || analyzing}
    style={{
      padding: "14px 28px",
      border: "none",
      borderRadius: "10px",
      cursor: !cameraOn ? "not-allowed" : "pointer",
      background: !cameraOn ? "#374151" : "#ef4444",
      color: "white",
      fontWeight: "bold",
      fontSize: "15px",
    }}
  >
    ⏹ Stop Camera
  </button>

  <button
  onClick={captureAndAnalyze}
  disabled={!cameraOn}
  style={{
    marginTop: "25px",
    padding: "14px 32px",
    borderRadius: "10px",
    border: "none",
    background: "#22c55e",
    color: "white",
    cursor:
  !cameraOn || analyzing
    ? "not-allowed"
    : "pointer",
    fontWeight: "bold",
    fontSize: "15px",
  }}
>
  {analyzing
  ? "Analyzing..."
  : "📸 Capture & Analyze"}
</button>

</div>

    </div>
</>

  );

}

export default LiveFeed;