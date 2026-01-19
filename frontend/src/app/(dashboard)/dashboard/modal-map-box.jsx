"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Fade,
  Modal,
  Box,
  Button,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { MdHome } from "react-icons/md";
import mapboxgl from "mapbox-gl";
import { useFetchApi } from "@/app/hook/useFetchApi";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const DEFAULT_LOCATION = {
  latitude: -7.2575,
  longitude: 112.7521,
  name: "Default",
};

const ModalMapBox = ({ open, setOpen }) => {
  const { sendRequest } = useFetchApi();

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const initialViewRef = useRef({ center: null, zoom: 12, bounds: null });
  const sendRequestRef = useRef(sendRequest);
  useEffect(() => {
    sendRequestRef.current = sendRequest;
  }, [sendRequest]);

  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);

  const handleClose = () => setOpen(false);

  /* ================= Helpers ================= */

  const fetchAreas = async () => {
    const result = await sendRequestRef.current({ url: "/areas" });
    const list = Array.isArray(result?.data)
      ? result.data
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
              loc.latitude !== 0 &&
              loc.longitude !== 0
          )
      : [];
    return list.length ? list : [DEFAULT_LOCATION];
  };

  // Hitung running/total per area
  const fetchDeviceStatsByArea = async (areaId) => {
    try {
      const res = await sendRequestRef.current({
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

  // Prefetch stats semua lokasi → tentukan warna & isi popup
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

  // Template popup: Device x/y (kanan) + tombol Monitoring (kiri), sejajar
  const popupHTML = (loc) => {
    const areaQuery = encodeURIComponent(String(loc.id));
    return `
      <div style="min-width:240px">
        <b>${loc.name ?? "Area"}</b><br/>
        Lat: ${loc.latitude}, Lng: ${loc.longitude}
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:8px; padding-right:15px">
        <div style="text-align:right; font-size:12px;">
            <b>Device:</b> ${loc.running}/${loc.total}
          </div>
          <a href="/monitoring?area_id=${areaQuery}"
             style="text-decoration:none; font-size:12px; padding:6px 10px; border-radius:8px; border:1px solid #e5e7eb; background:#ffffff50; color:#fff; font-weight:600;">
            Buka
          </a>
          
        </div>
      </div>
    `;
  };

  /* ============== Fetch /areas saat modal dibuka ============== */
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const areas = await fetchAreas();
        setLocations(areas);
      } catch (err) {
        console.error("Gagal fetch /areas:", err);
        setLocations([DEFAULT_LOCATION]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  /* ============== Init map + markers (prefetch stats) ============== */
  useEffect(() => {
    if (!open) return;
    if (!mapboxgl.accessToken) return;
    if (!locations.length) return;

    let cancelled = false;

    const init = async () => {
      const node = containerRef.current;
      if (!node) return;

      // cleanup sebelumnya
      try {
        markersRef.current.forEach((m) => m.remove());
      } catch {}
      markersRef.current = [];
      try {
        mapRef.current?.remove();
      } catch {}
      mapRef.current = null;

      const first = locations[0] ?? DEFAULT_LOCATION;

      const map = new mapboxgl.Map({
        container: node,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [
          first.longitude ?? DEFAULT_LOCATION.longitude,
          first.latitude ?? DEFAULT_LOCATION.latitude,
        ],
        zoom: locations.length > 1 ? 5 : 12,
        cooperativeGestures: true,
      });
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      mapRef.current = map;

      // Prefetch stats → baru pasang marker & bounds
      const locsWithStats = await buildLocationsWithStats(locations);
      if (cancelled) return;

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

      // Atur initial view (fitBounds jika multi, else flyTo)
      if (locsWithStats.length > 1 && !bounds.isEmpty()) {
        initialViewRef.current = { center: null, zoom: null, bounds };
        map.fitBounds(bounds, { padding: 48 });
      } else {
        initialViewRef.current = {
          center: [
            first.longitude ?? DEFAULT_LOCATION.longitude,
            first.latitude ?? DEFAULT_LOCATION.latitude,
          ],
          zoom: 12,
          bounds: null,
        };
        map.flyTo({ center: initialViewRef.current.center, zoom: 12 });
      }

      setTimeout(() => {
        try {
          map.resize();
        } catch {}
      }, 220);
    };

    init();

    return () => {
      cancelled = true;
      try {
        markersRef.current.forEach((m) => m.remove());
      } catch {}
      markersRef.current = [];
      try {
        mapRef.current?.remove();
      } catch {}
      mapRef.current = null;
    };
  }, [open, locations]);

  // Reset view
  const doResetView = () => {
    const map = mapRef.current;
    const initView = initialViewRef.current;
    if (!map || !initView) return;

    if (initView.bounds) {
      map.fitBounds(initView.bounds, { padding: 48 });
    } else if (initView.center) {
      map.flyTo({
        center: initView.center,
        zoom: initView.zoom ?? 12,
        essential: true,
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      keepMounted
      closeAfterTransition
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 900,
            maxWidth: "92vw",
            bgcolor: "#ffffff15",
            backdropFilter: "blur(10px)",
            borderRadius: 2,
            border: "1px solid #fff",
            boxShadow: 24,
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Header modal */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={handleClose}
              sx={{
                bgcolor: "#FF3F33",
                "&:hover": { bgcolor: "#ED3500" },
                color: "#fff",
              }}
            >
              Close
            </Button>
          </Box>

          {/* Container Map */}
          <Box
            sx={{
              position: "relative",
              height: 500,
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "#fff",
            }}
          >
            {loading && (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 1,
                  bgcolor: "rgba(255,255,255,0.6)",
                }}
              >
                <CircularProgress />
              </Stack>
            )}

            {/* Tombol Reset View Floating */}
            <Box sx={{ position: "absolute", bottom: 16, right: 0, zIndex: 2 }}>
              <Tooltip title="Reset view">
                <IconButton
                  onClick={doResetView}
                  size="medium"
                  sx={{
                    bgcolor: "#00000090",
                    mr: "16px",
                    boxShadow: 2,
                    border: "1px solid rgba(0,0,0,0.08)",
                    "&:hover": { bgcolor: "#f2f2f2" },
                  }}
                >
                  <MdHome size={22} />
                </IconButton>
              </Tooltip>
            </Box>

            <Box ref={containerRef} sx={{ height: "100%", width: "100%" }} />
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalMapBox;
