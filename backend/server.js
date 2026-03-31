const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 🔐 Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // 👉 For now: hardcoded user (you can upgrade later)
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

// 🧪 Test Route (optional)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});