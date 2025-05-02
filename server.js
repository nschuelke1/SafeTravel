const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const pool = require("./db"); // PostgreSQL connection module

const app = express();
const PORT = process.env.PORT || 3000;

//  Apply Global CORS Middleware for ALL Requests
const corsOptions = {
  origin: "https://safetravel-61862bdd5b99.herokuapp.com",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

//  Reverse Proxy Setup (Placed BEFORE routes)
//app.use("/api", createProxyMiddleware({
 // target: "https://safetravel-61862bdd5b99.herokuapp.com",
  //changeOrigin: true,
 // secure: false,
 // logLevel: "debug", //  Logs proxy activity for debugging
 
  //onProxyReq: (proxyReq, req) => {
    //console.log(`Proxying request: ${req.method} ${req.url}`);
 // }
//}));

//  Explicitly Handle Preflight Requests for `/api/events`
app.options("/api/events", (req, res) => {
  console.log("Received OPTIONS request for /api/events");

  res.setHeader("Access-Control-Allow-Origin", "https://safetravel-61862bdd5b99.herokuapp.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  res.sendStatus(204);
});

//  Debugging - Log Incoming Requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  next();
});

//  Serve Static Files
app.use(express.static("public"));

//  Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/api/events", async (req, res) => {
  const { type, description, latitude, longitude } = req.body;
  
  console.log("📌 Received Event Data:", { type, description, latitude, longitude });

  try {
    const query = `
      INSERT INTO events (type, description, latitude, longitude, timestamp)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const values = [type, description, latitude, longitude];

    console.log("🔍 Running Database Query...");
    const result = await pool.query(query, values);
    
    console.log("Event Saved:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("🔥 Error saving event:", error.message);
    res.status(500).json({ error: "Database error", details: error.message });
  }
});

app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

app.get("/api/events", async (req, res, next) => {
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

//  Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});