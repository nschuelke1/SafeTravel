let view;

require([
  "esri/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/Search"
], function (esriConfig, Map, MapView, Search) {
  esriConfig.apiKey = "YOUR_API_KEY";

  const map = new Map({ basemap: "streets-vector" });
  view = new MapView({
    container: "mapDiv",
    map: map,
    center: [-88.7879, 43.7844],
    zoom: 10
  });

  const search = new Search({ view: view });
  view.ui.add(search, "top-right");

  //  Listen for clicks on the map
  view.on("click", (event) => {
    const { latitude, longitude } = event.mapPoint;
    console.log(`Clicked location: Lat ${latitude}, Lon ${longitude}`);
    openEventForm(latitude, longitude);
  });
});

//  Fetch events from the backend
async function fetchEvents() {
  try {
    const response = await fetch("/api/events");
    if (!response.ok) throw new Error("Failed to fetch events");

    const events = await response.json();
    events.forEach(displayEventOnMap);
  } catch (error) {
    console.error("Error fetching events:", error.message);
  }
}

//  Show event form for clicked locations
function openEventForm(lat, lon) {
  document.getElementById("latitude").value = lat;
  document.getElementById("longitude").value = lon;
  document.getElementById("eventForm").style.display = "block";
}

//  Handle form submission
document.getElementById("eventForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const eventType = document.getElementById("eventType").value;
  const eventDescription = document.getElementById("eventDescription").value;
  const latitude = document.getElementById("latitude").value;
  const longitude = document.getElementById("longitude").value;

  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: eventType, description: eventDescription, latitude, longitude }),
    });

    if (response.ok) {
      const event = await response.json();
      console.log("Event saved:", event);
      alert("Event reported successfully!");
      displayEventOnMap(event);
    } else {
      alert("Error reporting event.");
    }
  } catch (error) {
    console.error("Error:", error.message);
    alert("Network error.");
  }
});

//  Display events on the map
function displayEventOnMap(event) {
  let eventSymbol;

  switch (event.type) {
    case "traffic":
      eventSymbol = { type: "simple-marker", color: "orange", size: "10px", outline: { color: "white", width: 1 } };
      break;
    case "vehicle":
      eventSymbol = { type: "simple-marker", color: "blue", size: "10px", outline: { color: "white", width: 1 } };
      break;
    case "police":
      eventSymbol = { type: "simple-marker", color: "red", size: "10px", outline: { color: "white", width: 1 } };
      break;
    case "object":
      eventSymbol = { type: "simple-marker", color: "green", size: "10px", outline: { color: "white", width: 1 } };
      break;
    default:
      eventSymbol = { type: "simple-marker", color: "gray", size: "10px", outline: { color: "white", width: 1 } };
  }

  const pointGraphic = {
    geometry: { type: "point", longitude: event.longitude, latitude: event.latitude },
    symbol: eventSymbol,
    attributes: { type: event.type, description: event.description, timestamp: event.timestamp },
    popupTemplate: { title: "{type}", content: "{description}<br><b>Timestamp:</b> {timestamp}" },
  };

  const graphic = view.graphics.add(pointGraphic);

  //  Automatically remove event after 20 minutes
  setTimeout(() => {
    view.graphics.remove(graphic);
    console.log(`Event removed: ${event.type}`);
  }, 1200000);
}

//  Fetch all events on page load
fetchEvents();