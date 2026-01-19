"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Box, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { MdHome } from "react-icons/md";
import { useFetchApi } from "@/app/hook/useFetchApi";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const DEFAULT_LOCATION = {
  latitude: -7.2575, // Surabaya
  longitude: 112.7521,
  name: "Default",
};

export default function MapBox() {
  const { sendRequest } = useFetchApi();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const initialViewRef = useRef({ center: null, zoom: 6, bounds: null });

  const fetchAreas = async () => {
    try {
      const result = await sendRequest({ url: "/areas" });
      if (!result?.data || !Array.isArray(result.data)) return [];
      return result.data
        .map((area) => ({
          id: area.id,
          name: area.name ?? "Area",
          latitude: Number(area.latitude),
          longitude: Number(area.longitude),
        }))
        .filter(
          (loc) =>
            !isNaN(loc.latitude) &&
            !isNaN(loc.longitude) &&
            loc.latitude &&
            loc.longitude
        );
    } catch {
      return [];
    }
  };

  const fetchDeviceStatsByArea = async (areaId) => {
    try {
      const res = await sendRequest({
        url: "/devices",
        params: { area_id: areaId },
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      const total = list.length;
      const running = list.filter((d) => {
        const name = d?.status?.name?.toLowerCase?.() || "";
        const sid = d?.status_id;
        const isRunningByName =
          name.includes("active") ||
          name.includes("running") ||
          name.includes("online");
        const isRunningById = sid === 1;
        return isRunningByName || isRunningById;
      }).length;
      return { running, total };
    } catch {
      return { running: 0, total: 0 };
    }
  };

  const buildLocationsWithStats = async (locs) => {
    const results = await Promise.all(
      locs.map(async (loc) => {
        const { running, total } = await fetchDeviceStatsByArea(loc.id);
        const color = total > 0 && running === total ? "blue" : "red";
        return { ...loc, running, total, color };
      })
    );
    return results;
  };

  const popupHTML = (loc) => {
    const areaQuery = encodeURIComponent(String(loc.id));
    return `
      <div style="min-width:230px">
        <b>${loc.name ?? "Area"}</b><br/>
        Lat: ${loc.latitude}, Lng: ${loc.longitude}
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
          <div><b>Device:</b> ${loc.running}/${loc.total}</div>
          <a href="/monitoring?area_id=${areaQuery}"
             style="text-decoration:none; font-size:12px; padding:4px 8px; border-radius:6px; border:1px solid #e5e7eb; background:#ffffff50;">
            Buka
          </a>
        </div>
      </div>
    `;
  };

  useEffect(() => {
    const loadAreas = async () => {
      const data = await fetchAreas();
      setLocations(data.length ? data : [DEFAULT_LOCATION]);
      setLoading(false);
    };
    loadAreas();
  }, []);

  useEffect(() => {
    if (loading || !locations.length) return;
    const node = containerRef.current;
    if (!node) return;

    // cleanup
    try {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    } catch {}

    const first = locations[0] ?? DEFAULT_LOCATION;
    const map = new mapboxgl.Map({
      container: node,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [first.longitude, first.latitude],
      zoom: 12,
      cooperativeGestures: true,
    });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    (async () => {
      const locsWithStats = await buildLocationsWithStats(locations);

      const bounds = new mapboxgl.LngLatBounds();
      for (const loc of locsWithStats) {
        const popup = new mapboxgl.Popup({ className: "cm-popup" }).setHTML(
          popupHTML(loc)
        );

        const marker = new mapboxgl.Marker({ color: loc.color })
          .setLngLat([loc.longitude, loc.latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
        if (!isNaN(loc.longitude) && !isNaN(loc.latitude)) {
          bounds.extend([loc.longitude, loc.latitude]);
        }
      }

      if (locsWithStats.length > 1 && !bounds.isEmpty()) {
        initialViewRef.current = { bounds };
        map.fitBounds(bounds, { padding: 40 });
      } else {
        initialViewRef.current = {
          center: [first.longitude, first.latitude],
          zoom: 12,
        };
        map.flyTo({ center: initialViewRef.current.center, zoom: 12 });
      }

      setTimeout(() => {
        try {
          map.resize();
        } catch {}
      }, 200);
    })();

    return () => {
      try {
        markersRef.current.forEach((m) => m.remove());
      } catch {}
      markersRef.current = [];
      try {
        map.remove();
      } catch {}
      mapRef.current = null;
    };
  }, [loading, locations]);

  const resetView = () => {
    const map = mapRef.current;
    const initView = initialViewRef.current;
    if (!map || !initView) return;
    if (initView.bounds) {
      map.fitBounds(initView.bounds, { padding: 40 });
    } else if (initView.center) {
      map.flyTo({
        center: initView.center,
        zoom: initView.zoom ?? 12,
        essential: true,
      });
    }
  };

  if (loading) {
    return (
      <Box
        sx={(theme) => ({
          height: "300px",
          borderRadius: "12px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f3f4f6",
          [theme.breakpoints.down("md")]: { width: "100%" },
          [theme.breakpoints.up("md")]: { width: "30%" },
        })}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={(theme) => ({
        position: "relative",
        height: "300px",
        borderRadius: "12px",
        overflow: "hidden",
        [theme.breakpoints.down("md")]: { width: "100%" },
        [theme.breakpoints.up("md")]: { width: "30%" },
      })}
    >
      {/* Tombol reset view */}
      <Box
        sx={{ position: "absolute", bottom: 34, right: 0, zIndex: 2, mr: 1 }}
      >
        <Tooltip title="Reset view">
          <IconButton
            onClick={resetView}
            size="small"
            sx={{
              bgcolor: "#00000090",
              boxShadow: 2,
              border: "1px solid rgba(0,0,0,0.08)",
              "&:hover": { bgcolor: "#f2f2f2" },
            }}
          >
            <MdHome size={18} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box ref={containerRef} sx={{ width: "100%", height: "100%" }} />
    </Box>
  );
}
