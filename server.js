const express = require("express");
const cors = require("cors");
const pool = require("./db"); // PostgreSQL connection module

const app = express();
const PORT = process.env.PORT || 3000;

//  Apply Global CORS Middleware
const corsOptions = {
  origin: "https://safetravel-61862bdd5b99.herokuapp.com",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

//  Explicitly Handle Preflight Requests for `/api/events`
app.options("/api/events", (req, res) => {
  console.log("Received OPTIONS request for /api/events");
  // Set CORS headers for preflight request
  res.header("Access-Control-Allow-Origin", "https://safetravel-61862bdd5b99.herokuapp.com");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(204); // ✅ Proper response for preflight requests
});

//  Debugging - Log requests for troubleshooting
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  next();
});

//  Serve static files
app.use(express.static("public"));

//  Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/api/events", async (req, res) => {
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