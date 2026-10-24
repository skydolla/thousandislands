"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapPin } from "@/lib/types";
import { MAP_STYLE_URL } from "@/lib/map-style";

interface MapComponentProps {
  pins: MapPin[];
  onPinClick: (islandId: string) => void;
}

function toGeoJSON(pins: MapPin[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: pins.map((pin) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [pin.longitude, pin.latitude],
      },
      properties: {
        islandId: pin.islandId,
        islandName: pin.islandName,
        country: pin.country,
      },
    })),
  };
}

export default function MapComponent({ pins, onPinClick }: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  // The map is created once; these refs let its event handlers see the latest props
  // without tearing down and rebuilding the map.
  const pinsRef = useRef(pins);
  const onPinClickRef = useRef(onPinClick);

  useEffect(() => {
    onPinClickRef.current = onPinClick;
  }, [onPinClick]);

  useEffect(() => {
    pinsRef.current = pins;
    const source = mapRef.current?.getSource("islands") as
      | maplibregl.GeoJSONSource
      | undefined;
    source?.setData(toGeoJSON(pins));
  }, [pins]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [20, 15],
      zoom: 2,
      minZoom: 1.5,
      maxZoom: 18,
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");

    map.on("load", () => {
      map.addSource("islands", {
        type: "geojson",
        data: toGeoJSON(pinsRef.current),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "islands",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#06b6d4",
            5,
            "#0891b2",
            10,
            "#0e7490",
            25,
            "#155e75",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            18,
            5,
            24,
            10,
            30,
            25,
            36,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#22d3ee",
          "circle-opacity": 0.9,
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "islands",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 13,
          "text-font": ["Noto Sans Bold"],
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "islands",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#22d3ee",
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.95,
        },
      });

      map.addLayer({
        id: "unclustered-label",
        type: "symbol",
        source: "islands",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "text-field": ["get", "islandName"],
          "text-size": 11,
          "text-offset": [0, 1.8],
          "text-anchor": "top",
          "text-font": ["Noto Sans Regular"],
          "text-max-width": 10,
        },
        paint: {
          "text-color": "#e2e8f0",
          "text-halo-color": "rgba(0,0,0,0.8)",
          "text-halo-width": 1.5,
        },
      });

      map.on("click", "clusters", async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        if (!features.length) return;

        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource("islands") as maplibregl.GeoJSONSource;

        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          const geometry = features[0].geometry;
          if (geometry.type === "Point") {
            map.easeTo({
              center: geometry.coordinates as [number, number],
              zoom: zoom + 0.5,
            });
          }
        } catch {
          // ignore cluster zoom errors
        }
      });

      map.on("click", "unclustered-point", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["unclustered-point"],
        });
        if (!features.length) return;

        const props = features[0].properties;
        if (!props) return;

        const geometry = features[0].geometry;
        if (geometry.type === "Point") {
          map.easeTo({
            center: geometry.coordinates as [number, number],
            zoom: Math.max(map.getZoom(), 6),
            duration: 500,
          });
        }

        onPinClickRef.current(props.islandId);
      });

      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
