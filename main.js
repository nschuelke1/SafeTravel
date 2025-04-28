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

// Form submission for event reporting
document.getElementById("eventForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const eventType = document.getElementById("eventType").value;
  const eventDescription = document.getElementById("eventDescription").value;
  const latitude = view.center.latitude; // Map center latitude
  const longitude = view.center.longitude; // Map center longitude

  try {
    const response = await fetch("http://localhost:3000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: eventType, description: eventDescription, latitude, longitude }),
    });

    if (response.ok) {
      const event = await response.json();
      console.log("Event saved:", event);
      alert("Event reported successfully!");
      displayEventOnMap(event); // Add the event to the map
    } else {
      alert("Error reporting event. Please try again.");
    }
  } catch (error) {
    console.error("Error reporting event:", error.message);
    alert("Error reporting event. Please try again.");
  }
});

// Fetch events from backend
async function fetchEvents() {
  try {
    const response = await fetch("http://localhost:3000/api/events");
    const events = await response.json();

    events.forEach(displayEventOnMap); // Display each event on the map
  } catch (error) {
    console.error("Error fetching events:", error.message);
  }
}

// Display events on the map
function displayEventOnMap(event) {
  const pointGraphic = {
    geometry: {
      type: "point",
      longitude: event.longitude,
      latitude: event.latitude,
    },
    symbol: {
      type: "simple-marker",
      color: "red",
      size: "8px",
      outline: { color: "white", width: 1 },
    },
    attributes: {
      type: event.type,
      description: event.description,
      timestamp: event.timestamp,
    },
    popupTemplate: {
      title: "{type}",
      content: "{description}<br><b>Timestamp:</b> {timestamp}",
    },
  };

  view.graphics.add(pointGraphic);
}

// Fetch all events on page load
fetchEvents();