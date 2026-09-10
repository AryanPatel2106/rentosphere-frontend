import { useEffect, useRef, useState } from "react";
import { FaSpinner, FaCircleExclamation, FaMap } from "react-icons/fa6";

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyDzbmMXlOJgYVNg_fjl_XtAXgIQGIbuZjw";

function formatDistance(meters) {
  if (meters === undefined || meters === null) return null;
  if (meters < 1000) return `${Math.round(meters)} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}

// ─── Script loaders ──────────────────────────────────────────────────────────

function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.Map) {
      resolve(window.google.maps);
      return;
    }

    const existing = document.getElementById("google-maps-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google.maps));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setTimeout(() => resolve(window.google.maps), 50);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadLeafletScript() {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L);
      return;
    }

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const existing = document.getElementById("leaflet-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.L));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = "leaflet-script";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

function PropertyMap({
  properties = [],
  searchLocation = null,
  selectedProperty = null,
  onSelectProperty = () => {},
}) {
  const mapContainerRef = useRef(null);
  const [mapEngine, setMapEngine] = useState("google");
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [googleAuthError, setGoogleAuthError] = useState(false);

  // Google refs
  const googleMapRef = useRef(null);
  const googleMarkersRef = useRef([]);
  const googleInfoWindowRef = useRef(null);

  // Leaflet refs
  const leafletMapRef = useRef(null);
  const leafletMarkersRef = useRef([]);

  // ── Auth failure listener ──────────────────────────────────────────────────
  useEffect(() => {
    window.gm_authFailure = () => {
      console.warn("Google Maps auth failure → switching to OSM");
      setGoogleAuthError(true);
      setMapEngine("osm");
      setMapReady(false);
    };
    return () => {
      window.gm_authFailure = null;
    };
  }, []);

  // ── Google Maps initialisation ─────────────────────────────────────────────
  useEffect(() => {
    if (mapEngine !== "google") return;
    let cancelled = false;
    setLoading(true);
    setMapReady(false);

    loadGoogleMapsScript()
      .then((maps) => {
        if (cancelled || !mapContainerRef.current) return;

        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const lat = searchLocation?.latitude ?? searchLocation?.lat;
        const lng = searchLocation?.longitude ?? searchLocation?.lng;
        const defaultCenter =
          lat !== undefined && lng !== undefined
            ? { lat: Number(lat), lng: Number(lng) }
            : { lat: 13.0827, lng: 80.2707 };

        const map = new maps.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: lat !== undefined && lng !== undefined ? 14 : 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        googleMapRef.current = map;
        googleInfoWindowRef.current = new maps.InfoWindow();

        setLoading(false);
        setMapReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setGoogleAuthError(true);
          setMapEngine("osm");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mapEngine]);

  // ── Auto-zoom and pan to searched location ──────────────────────────────────
  useEffect(() => {
    if (!mapReady) return;
    const lat = searchLocation?.latitude ?? searchLocation?.lat;
    const lng = searchLocation?.longitude ?? searchLocation?.lng;
    if (lat === undefined || lng === undefined) return;

    const centre = { lat: Number(lat), lng: Number(lng) };

    if (mapEngine === "google" && googleMapRef.current) {
      googleMapRef.current.panTo(centre);
      googleMapRef.current.setZoom(14);
    } else if (mapEngine === "osm" && leafletMapRef.current) {
      leafletMapRef.current.setView([Number(lat), Number(lng)], 14, { animate: true });
    }
  }, [searchLocation?.latitude, searchLocation?.longitude, mapEngine, mapReady]);

  // ── Google Markers (only when map is ready) ────────────────────────────────
  useEffect(() => {
    if (mapEngine !== "google" || !mapReady || !googleMapRef.current || !window.google?.maps)
      return;

    const maps = window.google.maps;
    const map = googleMapRef.current;

    // Clear old markers
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];

    const bounds = new maps.LatLngBounds();
    let hasPoints = false;

    // ── Search-centre pin ────────────────────────────────────────────────────
    const lat = searchLocation?.latitude ?? searchLocation?.lat;
    const lng = searchLocation?.longitude ?? searchLocation?.lng;

    if (lat !== undefined && lng !== undefined) {
      const centre = { lat: Number(lat), lng: Number(lng) };
      const searchMarker = new maps.Marker({
        position: centre,
        map,
        title: `Searched: ${searchLocation?.label || "Centre"}`,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: "#009587",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
        zIndex: 999,
      });

      searchMarker.addListener("click", () => {
        googleInfoWindowRef.current.setContent(
          `<div style="padding:6px;font-family:inherit;max-width:240px">
            <div style="font-size:12px;font-weight:700;color:#009587">📍 ${
              searchLocation?.label || "Searched Location"
            }</div>
            ${
              searchLocation?.address
                ? `<div style="font-size:11px;color:#6b7280;margin-top:2px">${searchLocation.address}</div>`
                : ""
            }
          </div>`
        );
        googleInfoWindowRef.current.open(map, searchMarker);
      });

      googleMarkersRef.current.push(searchMarker);
      bounds.extend(centre);
      hasPoints = true;
    }

    // ── Property pins ────────────────────────────────────────────────────────
    properties.forEach((property, index) => {
      const coords = property.location?.coordinates;
      if (!coords || coords.length !== 2) return;

      const position = { lat: Number(coords[1]), lng: Number(coords[0]) };
      const isSelected = selectedProperty?._id === property._id;
      const distanceText = formatDistance(property.distance);

      const marker = new maps.Marker({
        position,
        map,
        title: property.title,
        label: {
          text: String(index + 1),
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: "bold",
        },
        icon: {
          path: "M 0,-30 C -10,-30 -15,-20 -15,-12 C -15,5 0,20 0,20 C 0,20 15,5 15,-12 C 15,-20 10,-30 0,-30 Z",
          fillColor: isSelected ? "#ef4444" : "#009587",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 1.5,
          scale: 0.9,
          labelOrigin: new maps.Point(0, -12),
          anchor: new maps.Point(0, 20),
        },
        zIndex: isSelected ? 100 : 10,
      });

      marker.addListener("click", () => {
        onSelectProperty(property);
        googleInfoWindowRef.current.setContent(`
          <div style="padding:6px;font-family:inherit;max-width:240px">
            <div style="font-size:11px;font-weight:700;color:#009587;text-transform:uppercase">
              ${property.BHKType || "Apartment"} • ${property.Furnishing || "Unfurnished"}
            </div>
            <div style="font-size:13px;font-weight:700;color:#1f2937;margin:4px 0">
              ${property.title}
            </div>
            <div style="font-size:11px;color:#6b7280;margin-bottom:6px">
              📍 ${property.locality?.label || property.locality?.text || ""}
            </div>
            ${
              distanceText
                ? `<span style="background:#009587;color:#fff;font-size:10px;font-weight:700;padding:2px 8px">📍 ${distanceText}</span>`
                : ""
            }
          </div>
        `);
        googleInfoWindowRef.current.open(map, marker);
      });

      googleMarkersRef.current.push(marker);
      bounds.extend(position);
      hasPoints = true;
    });

    // ── Zoom / Viewport bounds handling ──────────────────────────────────────
    if (lat !== undefined && lng !== undefined) {
      const centre = { lat: Number(lat), lng: Number(lng) };

      // Find nearby properties within 15 km so distant cities don't pull zoom out
      const nearbyProperties = properties.filter((p) => {
        const coords = p.location?.coordinates;
        if (!coords || coords.length !== 2) return false;
        if (p.distance !== undefined && p.distance !== null) {
          return p.distance <= 15000;
        }
        return false;
      });

      if (nearbyProperties.length > 0) {
        const nearbyBounds = new maps.LatLngBounds();
        nearbyBounds.extend(centre);
        nearbyProperties.forEach((p) => {
          nearbyBounds.extend({
            lat: Number(p.location.coordinates[1]),
            lng: Number(p.location.coordinates[0]),
          });
        });
        map.fitBounds(nearbyBounds, { padding: 60 });
        maps.event.addListenerOnce(map, "idle", () => {
          if (map.getZoom() > 16) map.setZoom(16);
          if (map.getZoom() < 13) map.setZoom(13);
        });
      } else {
        // No properties nearby: zoom straight into searched location
        map.panTo(centre);
        map.setZoom(14);
      }
    } else if (hasPoints) {
      if (googleMarkersRef.current.length === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(14);
      } else {
        map.fitBounds(bounds, { padding: 60 });
      }
    }
  }, [mapEngine, mapReady, properties, searchLocation, selectedProperty, onSelectProperty]);

  // ── Leaflet initialisation ─────────────────────────────────────────────────
  useEffect(() => {
    if (mapEngine !== "osm") return;
    let cancelled = false;
    setLoading(true);
    setMapReady(false);

    loadLeafletScript()
      .then((L) => {
        if (cancelled || !mapContainerRef.current) return;

        if (googleMapRef.current) {
          googleMapRef.current = null;
          googleMarkersRef.current = [];
        }

        const lat = searchLocation?.latitude ?? searchLocation?.lat;
        const lng = searchLocation?.longitude ?? searchLocation?.lng;
        const defaultCenter =
          lat !== undefined && lng !== undefined
            ? [Number(lat), Number(lng)]
            : [13.0827, 80.2707];

        if (!leafletMapRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: defaultCenter,
            zoom: lat !== undefined && lng !== undefined ? 14 : 12,
          });
          L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors",
          }).addTo(map);
          leafletMapRef.current = map;
        } else {
          leafletMapRef.current.setView(defaultCenter, lat !== undefined && lng !== undefined ? 14 : 12);
        }

        setLoading(false);
        setMapReady(true);
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [mapEngine]);

  // ── Leaflet Markers ────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapEngine !== "osm" || !mapReady || !leafletMapRef.current || !window.L) return;

    const L = window.L;
    const map = leafletMapRef.current;

    leafletMarkersRef.current.forEach((m) => m.remove());
    leafletMarkersRef.current = [];

    const group = [];

    const lat = searchLocation?.latitude ?? searchLocation?.lat;
    const lng = searchLocation?.longitude ?? searchLocation?.lng;

    if (lat !== undefined && lng !== undefined) {
      const pt = [Number(lat), Number(lng)];
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;background:#009587;border:3px solid #fff;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,.4)"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const m = L.marker(pt, { icon, zIndexOffset: 999 }).addTo(map);
      m.bindPopup(`<b>📍 ${searchLocation?.label || "Searched Location"}</b>`);
      leafletMarkersRef.current.push(m);
      group.push(pt);
    }

    properties.forEach((property, index) => {
      const coords = property.location?.coordinates;
      if (!coords || coords.length !== 2) return;

      const position = [Number(coords[1]), Number(coords[0])];
      const isSelected = selectedProperty?._id === property._id;
      const distanceText = formatDistance(property.distance);

      const icon = L.divIcon({
        className: "",
        html: `<div style="background:${
          isSelected ? "#ef4444" : "#009587"
        };color:#fff;padding:3px 8px;font-size:11px;font-weight:700;border:1.5px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.3);white-space:nowrap;cursor:pointer">${
          index + 1
        }. ${property.BHKType || "Rental"}</div>`,
        iconSize: [90, 26],
        iconAnchor: [45, 26],
      });

      const m = L.marker(position, { icon }).addTo(map);
      m.bindPopup(`
        <div style="padding:4px;max-width:240px">
          <div style="font-size:11px;font-weight:700;color:#009587;text-transform:uppercase">${
            property.BHKType || "Apartment"
          } • ${property.Furnishing || "Unfurnished"}</div>
          <div style="font-size:13px;font-weight:700;color:#1f2937;margin:4px 0">${
            property.title
          }</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:6px">📍 ${
            property.locality?.label || property.locality?.text || ""
          }</div>
          ${
            distanceText
              ? `<span style="background:#009587;color:#fff;font-size:10px;font-weight:700;padding:2px 8px">📍 ${distanceText}</span>`
              : ""
          }
        </div>
      `);
      m.on("click", () => onSelectProperty(property));

      leafletMarkersRef.current.push(m);
      group.push(position);
    });

    // ── Zoom handling for Leaflet ────────────────────────────────────────────
    if (lat !== undefined && lng !== undefined) {
      const pt = [Number(lat), Number(lng)];
      const nearbyProperties = properties.filter((p) => {
        const coords = p.location?.coordinates;
        if (!coords || coords.length !== 2) return false;
        if (p.distance !== undefined && p.distance !== null) {
          return p.distance <= 15000;
        }
        return false;
      });

      if (nearbyProperties.length > 0) {
        const nearbyGroup = [pt];
        nearbyProperties.forEach((p) => {
          nearbyGroup.push([Number(p.location.coordinates[1]), Number(p.location.coordinates[0])]);
        });
        map.fitBounds(nearbyGroup, { padding: [50, 50], maxZoom: 16 });
      } else {
        map.setView(pt, 14, { animate: true });
      }
    } else if (group.length > 0) {
      if (group.length === 1) map.setView(group[0], 14);
      else map.fitBounds(group, { padding: [50, 50] });
    }
  }, [mapEngine, mapReady, properties, searchLocation, selectedProperty, onSelectProperty]);

  // ── Pan to selected property ───────────────────────────────────────────────
  useEffect(() => {
    if (!selectedProperty) return;
    const coords = selectedProperty.location?.coordinates;
    if (!coords || coords.length !== 2) return;

    if (mapEngine === "google" && googleMapRef.current) {
      googleMapRef.current.panTo({ lat: Number(coords[1]), lng: Number(coords[0]) });
      googleMapRef.current.setZoom(15);
    } else if (mapEngine === "osm" && leafletMapRef.current) {
      leafletMapRef.current.setView([Number(coords[1]), Number(coords[0])], 15);
    }
  }, [selectedProperty, mapEngine]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex h-full w-full flex-col border border-gray-300 bg-gray-100">
      {googleAuthError && (
        <div className="flex items-start gap-2 border-b border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
          <FaCircleExclamation className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <span className="font-semibold">Google Maps API not activated.</span> Showing{" "}
            <span className="font-semibold">OpenStreetMap</span> instead.
          </div>
        </div>
      )}

      {/* Control bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-gray-600">
          <FaMap className="text-[#009587]" />
          <span>{mapEngine === "google" ? "Google Maps" : "OpenStreetMap"}</span>
        </div>

        <div className="flex border border-gray-300 bg-gray-50 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setMapEngine("google");
              setMapReady(false);
            }}
            className={`px-2.5 py-1 font-semibold transition ${
              mapEngine === "google"
                ? "bg-[#009587] text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Google Maps
          </button>
          <button
            type="button"
            onClick={() => {
              setMapEngine("osm");
              setMapReady(false);
            }}
            className={`px-2.5 py-1 font-semibold transition ${
              mapEngine === "osm"
                ? "bg-[#009587] text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            OpenStreetMap
          </button>
        </div>
      </div>

      {/* Map container */}
      <div className="relative flex-1" style={{ minHeight: "400px" }}>
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-white/80 text-xs text-gray-500">
            <FaSpinner className="animate-spin text-xl text-[#009587]" />
            <span>Loading map…</span>
          </div>
        )}
        <div ref={mapContainerRef} className="h-full w-full" style={{ minHeight: "400px" }} />
      </div>
    </div>
  );
}

export default PropertyMap;
