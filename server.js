const express = require("express");
const cors = require("cors");
const pool = require("./db"); // PostgreSQL connection module

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Apply Global CORS Middleware for ALL Requests
const corsOptions = {
  origin: "https://safetravel-61862bdd5b99.herokuapp.com",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Explicitly Handle Preflight Requests for `/api/events`
app.options("/api/events", (req, res) => {
  console.log("Received OPTIONS request for /api/events");

  res.setHeader("Access-Control-Allow-Origin", "https://safetravel-61862bdd5b99.herokuapp.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  res.sendStatus(204);
});

// ✅ Debugging - Log Incoming Requests
app.use((req, res, next) => {
  console.log(`🛠 Incoming request: ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  next();
});

// ✅ API Routes
app.get("/api/events", async (req, res) => {
  console.log("✅ `/api/events` route hit!");
  try {
    const query = "SELECT * FROM events ORDER BY timestamp DESC;";
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("🔥 Error fetching events:", error.message);
    res.status(500).json({ error: "Database error" });
  }
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
    console.error("🔥 Error saving event:", error.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ✅ Serve Static Files
app.use(express.static("public"));

// ✅ Home Route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// ✅ Debugging: Log All Active Routes
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`🛠 Route registered: ${middleware.route.path}`);
  } else if (middleware.name === "router") {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log(`🛠 Route registered: ${handler.route.path}`);
      }
    });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});