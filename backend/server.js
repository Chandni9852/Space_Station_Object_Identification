const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/predictions",
  express.static(path.join(__dirname, "predictions_web"))
);

const uploadDir = path.join(__dirname, "uploads");
console.log("Upload directory:", uploadDir);
console.log("Exists:", fs.existsSync(uploadDir));

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Creating uploads directory...");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
},
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "admin@gmail.com" && password === "1234") {
    return res.json({
      success: true,
      message: "Login successful",
    });
  }

  return res.json({
    success: false,
    message: "Invalid credentials",
  });
});

// UPLOAD
app.post("/upload", upload.single("image"), (req, res) => {

    if (!req.file) {
        return res.json({
            success: false,
            message: "No file uploaded"
        });
    }

    const imagePath = path.join(__dirname, "uploads", req.file.filename);

    const command = `python3 detect_image.py "${imagePath}"`;

    exec(command, (error, stdout, stderr) => {

    if (error) {
        console.log("Python Error:");
        console.log(stderr);

        return res.json({
            success: false,
            message: "Prediction failed"
        });
    }

    console.log("========== PYTHON OUTPUT ==========");
    console.log(stdout);
    console.log("===================================");

    try {

        const prediction = JSON.parse(stdout);
	console.log(prediction);

        return res.json(prediction);

    } catch (err) {

        console.log("JSON Parse Error:");
        console.log(err);

        return res.json({
            success: false,
            message: "Could not parse prediction"
        });

    }

});
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});
app.get("/test", (req, res) => {
  res.send("UPLOAD SERVER VERSION");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});