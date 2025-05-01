let view;

require([
  "esri/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/Search"
], function (esriConfig, Map, MapView, Search) {
  esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurA_2jA8sPPf_DuV7jRLl5PwtnXSU0EiBd11SD4M-Bxw09rmd0l6ZSXQcXdC02UAp2lAmFwzFmnG_WD801TT5ANPE-DaFCqD8m2Ldi20FzvxATwBfGGYHd63tKIw-3X5m0bMryDHHfe22v_GGwBbuVp5A1NKlAPUcd2qw-o9qe15R44wcxYyNCio515nFVnc-WVdUDUMAeJaEPFq_tiEoSHcnVnNn_bXNM5TwVfExnWzlAT1_UTCsPQV0";

  const map = new Map({ basemap: "streets-vector" });
  view = new MapView({
    container: "mapDiv",
    map: map,
    center: [-88.7879, 43.7844],
    zoom: 10
  });

  const search = new Search({ view: view });
  view.ui.add(search, "top-right");
});

// ✅ Fetch events via proxy
async function fetchEvents() {
  try {
    const response = await fetch("/api/events"); // ✅ Uses the proxy instead of direct Heroku URL

    if (!response.ok) throw new Error("Failed to fetch events");

    const events = await response.json();
    events.forEach(displayEventOnMap);
  } catch (error) {
    console.error("Error fetching events:", error.message);
  }
}

// ✅ Form submission for event reporting (Now uses proxy)
document.getElementById("eventForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const eventType = document.getElementById("eventType").value;
  const eventDescription = document.getElementById("eventDescription").value;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const response = await fetch("/api/events", { // ✅ Uses the proxy
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
            alert("Error reporting event. Please try again.");
          }
        } catch (error) {
          console.error("Error reporting event:", error.message);
          alert("Error reporting event. Please try again.");
        }
      },
      function (error) {
        console.error("Error obtaining location:", error.message);
        alert("Unable to fetch precise location. Please enable location services.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

// ✅ Display events on the map
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

  // ✅ Automatically remove event after 20 minutes
  setTimeout(() => {
    view.graphics.remove(graphic);
    console.log(`Event removed: ${event.type}`);
  }, 1200000);
}

// ✅ Fetch all events on page load
fetchEvents();