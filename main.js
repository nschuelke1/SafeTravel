let view;

require([
  "esri/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/Search"
], function (esriConfig, Map, MapView, Search) {
  esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurA_2jA8sPPf_DuV7jRLl5PwtnXSU0EiBd11SD4M-Bxw09rmd0l6ZSXQcXdC02UAp2lAmFwzFmnG_WD801TT5ANPE-DaFCqD8m2Ldi20FzvxATwBfGGYHd63tKIw-3X5m0bMryDHHfe22v_GGwBbuVp5A1NKlAPUcd2qw-o9qe15R44wcxYyNCio515nFVnc-WVdUDUMAeJaEPFq_tiEoSHcnVnNn_bXNM5TwVfExnWzlAT1_UTCsPQV0";

  const map = new Map({ basemap: "streets" });
  view = new MapView({
    container: "mapDiv",
    map: map,
    center: [-118.80500, 34.02700],
    zoom: 13
  });

  const search = new Search({ view: view });
  view.ui.add(search, "top-right");
});

const pool = require("./db");

document.getElementById("eventForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const eventType = document.getElementById("eventType").value;
  const eventDescription = document.getElementById("eventDescription").value;
  const latitude = view.center.latitude; // Get latitude from map view center
  const longitude = view.center.longitude; // Get longitude from map view center

  try {
    const query = `
      INSERT INTO events (type, description, latitude, longitude)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [eventType, eventDescription, latitude, longitude];
    const result = await pool.query(query, values);

    console.log("Event saved:", result.rows[0]);
    alert("Event reported and saved to the database!");
  } catch (error) {
    console.error("Error saving event:", error.message);
    alert("Error saving event. Please try again.");
  }
});
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./db"); // PostgreSQL connection

const app = express();
const PORT = 8000;

// Middleware
app.use(cors()); // Allows frontend to access the backend
app.use(bodyParser.json());

// POST: Add new event to the database
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

    res.status(201).json(result.rows[0]); // Return the saved event
  } catch (error) {
    console.error("Error saving event:", error.message);
    res.status(500).json({ error: "Error saving event to database" });
  }
});

// GET: Fetch all events from the database
app.get("/api/events", async (req, res) => {
  try {
    const query = "SELECT * FROM events ORDER BY timestamp DESC;";
    const result = await pool.query(query);

    res.status(200).json(result.rows); // Return all events
  } catch (error) {
    console.error("Error fetching events:", error.message);
    res.status(500).json({ error: "Error fetching events from database" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});