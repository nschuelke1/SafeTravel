const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./db"); // PostgreSQL connection module

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: "https://safetravel-61862bdd5b99.herokuapp.com", 
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static("public"));

// Serve the homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// POST: Add new event
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

// GET: Retrieve events
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