const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./db"); // PostgreSQL connection module

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: "https://safetravel-61862bdd5b99.herokuapp.com", 
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Enable cookies/session handling if needed
  optionsSuccessStatus: 200 // Handle preflight requests smoothly

};

app.use(cors(corsOptions));
app.options("/api/events", cors(corsOptions));
app.use(express.json());

// Debugging - Log requests for troubleshooting
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  next();
});



// Serve static files from the "public" directory
app.use(express.static("public"));

// Serve the homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// POST: Add new event
app.post("/api/events", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://safetravel-61862bdd5b99.herokuapp.com"); // ✅ Explicitly allow your frontend
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // ✅ Allow necessary methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // ✅ Ensure headers are allowed

  const { type, description, latitude, longitude } = req.body;
  try {
    const query = `
      INSERT INTO events (type, description, latitude, longitude, timestamp)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const values = [type, description, latitude, longitude];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving event:", error.message);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/events", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://safetravel-61862bdd5b99.herokuapp.com"); // ✅ Ensure frontend access
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  try {
    const query = "SELECT * FROM events ORDER BY timestamp DESC;";
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching events:", error.message);
    res.status(500).json({ error: "Database error" });
  }
});
// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});