import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Coordinates, RouteGeoJSON } from "../api/maps";

// MapTiler uses the same protocol as Mapbox GL JS
mapboxgl.accessToken = "no-token"; // MapTiler doesn't use this but the lib requires it

interface RouteMapProps {
  origin: Coordinates;
  destination: Coordinates;
  route: RouteGeoJSON;
}

export default function RouteMap({ origin, destination, route }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
      center: [
        (origin.lng + destination.lng) / 2,
        (origin.lat + destination.lat) / 2,
      ],
      zoom: 10,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Draw the route line
      map.addSource("route", {
        type: "geojson",
        data: route,
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#1565c0",
          "line-width": 4,
          "line-opacity": 0.85,
        },
      });

      // Origin marker (green)
      new mapboxgl.Marker({ color: "#2e7d32" })
        .setLngLat([origin.lng, origin.lat])
        .setPopup(new mapboxgl.Popup().setText("Origin"))
        .addTo(map);

      // Destination marker (red)
      new mapboxgl.Marker({ color: "#c62828" })
        .setLngLat([destination.lng, destination.lat])
        .setPopup(new mapboxgl.Popup().setText("Destination"))
        .addTo(map);

      // Fit the map to show the full route
      const coords = route.geometry.coordinates as [number, number][];
      const bounds = coords.reduce(
        (b, coord) => b.extend(coord),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );

      map.fitBounds(bounds, { padding: 60 });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [origin, destination, route]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "400px", borderRadius: "8px" }}
    />
  );
}