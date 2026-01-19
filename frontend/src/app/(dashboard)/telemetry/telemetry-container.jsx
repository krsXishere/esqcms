"use client";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Stack,
  Box,
  CircularProgress,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import AreaChartCard from "./area-chart-card";
import FilterAnalysisDialog from "./filter-analysis-diagnose";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { getSocket } from "@/lib/socket";

const POLL_MS = 20000; // 10 seconds polling

/* ===== Utils ===== */
const PALETTE = [
  "#0075FF",
  "#01b574",
  "#8554fd",
  "#FF2056",
  "#F5BC1E",
  "#B6F500",
  "#00C2C7",
  "#F57C00",
  "#08CB00",
  "#FF2DD1",
  "#FF0B55",
  "#5800FF",
  "#F7EC09",
  "#37E2D5",
];

const colorForKey = (key) => {
  const s = String(key);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return PALETTE[h % PALETTE.length];
};

const ALLOWED_SPAN = new Set(["1h", "1d", "4d", "1w", "15d", "1m", "3m", "6m", "1y"]);

const normalizeSpan = (s) => {
  const v = s == null ? "" : String(s).toLowerCase();
  return ALLOWED_SPAN.has(v) ? v : "1d";
};

const isAll = (v) => v == null || String(v).trim() === "" || String(v).toLowerCase() === "all";

// label waktu (UTC/GMT+0)
const fmtLabel = (iso, span = "1d") => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const base = { timeZone: "UTC" };

  if (span === "1h") {
    return new Intl.DateTimeFormat("id-ID", {
      ...base,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
      hour12: false,
    }).format(d);
  }
  if (span === "1d") {
    return new Intl.DateTimeFormat("id-ID", {
      ...base,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(d);
  }
  if (span === "4d") {
    return new Intl.DateTimeFormat("id-ID", {
      ...base,
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  }
  if (span === "1y") {
    return new Intl.DateTimeFormat("id-ID", { ...base, month: "short" }).format(d);
  }
  return new Intl.DateTimeFormat("id-ID", { ...base, day: "2-digit", month: "short" }).format(d);
};

// ===== NORMALISASI response { data: { X,Y,Z,Other } } dari backend baru =====
const normalizeToArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.rows)) return res.rows;

  // bentuk utama sekarang: { data: { X:[], Y:[], ... }, metrics_length, data_length }
  if (res?.data && typeof res.data === "object") {
    const out = [];
    for (const [key, arr] of Object.entries(res.data)) {
      if (Array.isArray(arr)) {
        for (const it of arr) out.push({ ...it, metric_key: key });
      }
    }
    return out;
  }
  return [];
};

// state -> URL (linkable)
const toQueryString = ({ area_id, utility_id }) => {
  const p = new URLSearchParams();
  if (!isAll(area_id)) p.set("area_id", String(area_id));
  if (!isAll(utility_id)) p.set("utility_id", String(utility_id));
  const qs = p.toString();
  return qs ? `?${qs}` : "?";
};

// helper device info
const getDeviceId = (it) => it?.device_id ?? it?.Device?.id ?? "unknown";

/* ================= Component ================= */
const TelemetryContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendRequest } = useFetchApi();

  const [raw, setRaw] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [deviceDict, setDeviceDict] = useState({});
  const [layoutMode, setLayoutMode] = useState("list"); // "list" or "grid"

  // Refs for polling and socket
  const sendRequestRef = useRef(sendRequest);
  const pollRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    sendRequestRef.current = sendRequest;
  }, [sendRequest]);

  const loadDevicesByUtility = useCallback(async (utilityVal) => {
    const isAllUtility = isAll(utilityVal);
    const res = await sendRequestRef.current({
      url: "/devices",
      params: isAllUtility ? {} : { utility_id: utilityVal },
    });

    const list = Array.isArray(res?.data) ? res.data : [];
    const dict = {};
    list.forEach((d) => {
      dict[String(d.id)] = {
        name: d.name,
        areaName: d?.area?.name || "",
        area_id: d?.area?.id ?? d?.area_id ?? "",
        statusName: d?.status?.name || "",
      };
    });
    setDeviceDict(dict);
    return { ids: list.map((d) => String(d.id)), dict };
  }, []);

  const loadUtilitiesByArea = useCallback(async (areaVal) => {
    const isAllArea = isAll(areaVal);
    const res = await sendRequestRef.current({
      url: "/utilities",
      params: isAllArea ? {} : { area_id: areaVal },
    });
    const list = Array.isArray(res?.data) ? res.data : [];
    return { ids: list.map((u) => String(u.id)), list };
  }, []);

  const fetchByUtility = useCallback(async (apiParams) => {
    const res = await sendRequestRef.current({
      url: "/device/datas",
      method: "GET",
      params: apiParams,
    });
    return normalizeToArray(res);
  }, []);

  const reload = useCallback(async () => {
    setHasLoaded(false);

    let areaParam = searchParams.get("area_id");
    let utilityParam = searchParams.get("utility_id");

    try {
      if (!areaParam) {
        const areasRes = await sendRequestRef.current({ url: "/areas" });
        const areas = Array.isArray(areasRes?.data) ? areasRes.data : [];
        if (areas.length === 0) {
          setRaw([]);
          return;
        }
        areaParam = String(areas[0].id);
      }

      // If no utility in URL, pick first utility in the area
      if (!utilityParam) {
        const { ids } = await loadUtilitiesByArea(areaParam);
        if (ids.length > 0) utilityParam = String(ids[0]);
      }

      // Update URL if needed
      if (searchParams.get("area_id") !== areaParam || searchParams.get("utility_id") !== utilityParam) {
        router.replace(
          toQueryString({ area_id: areaParam ?? "", utility_id: utilityParam ?? "" }),
          { scroll: false }
        );
      }

      // Load device dict for the utility
      if (utilityParam) {
        await loadDevicesByUtility(utilityParam);
      }

      // Fetch data by utility
      if (utilityParam) {
        const baseApiParams = { sort: "time_stamp:desc", limit: 15 };
        const data = await fetchByUtility({ ...baseApiParams, utility_id: utilityParam });
        setRaw(data);
      } else {
        setRaw([]);
      }
    } finally {
      setHasLoaded(true);
    }
  }, [fetchByUtility, loadDevicesByUtility, loadUtilitiesByArea, router, searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await reload();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const refetchRef = useRef(null);
  refetchRef.current = async () => {
    const utilityParam = searchParams.get("utility_id");
    const baseApiParams = { sort: "time_stamp:desc", limit: 15 };

    try {
      if (utilityParam) {
        await loadDevicesByUtility(utilityParam);
        const data = await fetchByUtility({ ...baseApiParams, utility_id: utilityParam });
        setRaw(data);
      }
    } catch (e) {
      console.error("Refetch failed:", e);
    }
  };

  /* ===== SOCKET realtime ===== */
  useEffect(() => {
    const socket = getSocket();

    const onNew = () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        refetchRef.current?.();
      }, 5000);
    };

    socket.on("new-device-data", onNew);
    return () => {
      socket.off("new-device-data", onNew);
      clearTimeout(debounceRef.current);
    };
  }, []);

  /* ===== POLLING fallback ===== */
  useEffect(() => {
    const startPolling = () => {
      clearInterval(pollRef.current);
      pollRef.current = setInterval(() => refetchRef.current?.(), POLL_MS);
    };
    const stopPolling = () => clearInterval(pollRef.current);

    const onVis = () => {
      if (document.hidden) stopPolling();
      else {
        refetchRef.current?.();
        startPolling();
      }
    };
    const onOnline = () => refetchRef.current?.();

    startPolling();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("online", onOnline);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const handleApplyFilter = ({ area_id, utility_id }) => {
    const next = { area_id: area_id || "", utility_id: utility_id || "" };
    router.replace(toQueryString(next), { scroll: false });
  };

  // === MAPPING response backend ke chart + statistik ===
  const datasets = useMemo(() => {
    const span = normalizeSpan(searchParams.get("time_span") || "1d");
    const groups = new Map();

    for (const it of raw || []) {
      const metricKey = it?.metric_key ?? it?.metricType?.name ?? it?.metric_type_id ?? "unknown";

      // Extract pure metric name (remove device name prefix if present)
      const metricName = it?.metricType?.name ?? 
        (String(metricKey).includes(" - ") 
          ? String(metricKey).split(" - ").slice(1).join(" - ") 
          : String(metricKey));

      const devId = String(getDeviceId(it));
      const gKey = `${devId}::${metricKey}`;

      if (!groups.has(gKey)) {
        groups.set(gKey, {
          items: [],
          meta: { 
            device_id: devId, 
            metric_key: String(metricKey), 
            metric_name: metricName, // pure metric name for alarm variable matching
            metric_unit: it?.metricType?.unit ?? "" 
          },
        });
      }
      groups.get(gKey).items.push(it);
    }

    const out = [];
    for (const [key, group] of groups.entries()) {
      const { items, meta } = group;
      if (!items.length) continue;

      const sorted = items
        .slice()
        .sort((a, b) => new Date(a.time_stamp).getTime() - new Date(b.time_stamp).getTime());

      const series = sorted.map((it) => ({
        time: fmtLabel(it.time_stamp, span),
        value: it.value == null || Number.isNaN(Number(it.value)) ? null : Number(it.value),
        unit: meta.metric_unit,
      }));

      const vals = series.map((p) => p.value).filter((v) => v != null && !Number.isNaN(v));
      const min = vals.length ? Math.min(...vals) : 0;
      const max = vals.length ? Math.max(...vals) : 0;
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      const range = max - min;

      out.push({
        key,
        title: String(meta.metric_key).toLowerCase(),
        metricName: meta.metric_name, // pure metric name for alarm variable matching
        unit: meta.metric_unit,
        color: colorForKey(key),
        lastValue: vals.length ? vals[vals.length - 1] : 0,
        datas: series,
        stats: { min, max, avg, range },
        device_id: meta.device_id,
      });
    }

    return out.sort((a, b) => a.title.localeCompare(b.title));
  }, [raw, searchParams]);

  // === GROUP datasets BY DEVICE ===
  const groupedByDevice = useMemo(() => {
    const groups = new Map();
    for (const dataset of datasets) {
      const deviceId = dataset.device_id;
      if (!groups.has(deviceId)) groups.set(deviceId, []);
      groups.get(deviceId).push(dataset);
    }

    const result = Array.from(groups.entries()).map(([deviceId, charts]) => ({
      device_id: deviceId,
      device_name: deviceDict[deviceId]?.name || `Device ${deviceId}`,
      area_id: deviceDict[deviceId]?.area_id || "",
      status_name: deviceDict[deviceId]?.statusName || "",
      charts: charts.sort((a, b) => a.title.localeCompare(b.title)),
    }));

    return result.sort((a, b) => a.device_name.localeCompare(b.device_name));
  }, [datasets, deviceDict]);

  const isEmpty = hasLoaded && (raw.length === 0 || datasets.length === 0);

  return (
    <Stack sx={{ gap: "32px", width: "100%", maxWidth: "100%", mx: 0, px: 0 }}>
      <Stack sx={{ gap: "16px", width: "100%", maxWidth: "100%", mx: 0, px: 0 }}>

        <FilterAnalysisDialog
          onApply={handleApplyFilter}
          defaultValues={{
            area_id: searchParams.get("area_id") ?? undefined,
            utility_id: searchParams.get("utility_id") ?? undefined,
          }}
        />
        <ToggleButtonGroup
          value={layoutMode}
          exclusive
          onChange={(e, newMode) => {
            if (newMode !== null) setLayoutMode(newMode);
          }}
          sx={{
            alignSelf: "flex-start",
            "& .MuiToggleButton-root": { textTransform: "none", fontSize: "0.9rem" },
          }}
        >
          <ToggleButton value="list">List</ToggleButton>
          <ToggleButton value="grid">Grid</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {!hasLoaded ? (
        <Box
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            color: "text.secondary",
            minHeight: 240,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: "100%",
            mx: 0,
            px: 0,
          }}
        >
          <CircularProgress />
        </Box>
      ) : isEmpty ? (
        <Box
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            color: "text.secondary",
            width: "100%",
            maxWidth: "100%",
            mx: 0,
            px: 0,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Data Is Empty
          </Typography>
        </Box>
      ) : layoutMode === "list" ? (
        <Stack sx={{ gap: "24px", width: "100%", maxWidth: "100%", mx: 0, px: 0 }}>
          {groupedByDevice.map((group) => (
            <Box
              key={group.device_id}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 3,
                backgroundColor: "transparent",
                width: "100%",
                maxWidth: "100%",
                mx: 0,
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, color: "text.primary", fontSize: "1.1rem", wordBreak: "break-word" }}
              >
                {group.device_name}
              </Typography>

              <Stack sx={{ gap: "8px", minWidth: 0 }}>
                {group.charts.map((d) => (
                  <AreaChartCard
                    key={d.key}
                    chartColor={d.color}
                    title={d.title}
                    metricName={d.metricName}
                    unit={d.unit}
                    lastValue={d.lastValue}
                    datas={d.datas}
                    stats={d.stats}
                    device_id={d.device_id}
                    area_id={group.area_id}
                    status={group.status_name}
                  />
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        // ✅ GRID MODE:
        // - 2 kolom (5:5) di sm+
        // - jika jumlah card ganjil, card terakhir dibuat full width (span 2 kolom)
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            mx: 0,
            px: 0,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          {groupedByDevice.map((group, idx) => {
            const total = groupedByDevice.length;
            const isLast = idx === total - 1;
            const shouldSpanFull = total % 2 === 1 && isLast; // ganjil & item terakhir

            return (
              <Box
                key={group.device_id}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 3,
                  backgroundColor: "transparent",
                  minWidth: 0,
                  // ✅ bikin item terakhir span full row saat ganjil (sm+)
                  gridColumn: shouldSpanFull ? { sm: "1 / -1" } : "auto",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 600, color: "text.primary", fontSize: "1.1rem", wordBreak: "break-word" }}
                >
                  {group.device_name}
                </Typography>

                <Stack sx={{ gap: "8px", minWidth: 0 }}>
                  {group.charts.map((d) => (
                    <AreaChartCard
                      key={d.key}
                      chartColor={d.color}
                      title={d.title}
                      metricName={d.metricName}
                      unit={d.unit}
                      lastValue={d.lastValue}
                      datas={d.datas}
                      stats={d.stats}
                      device_id={d.device_id}
                      area_id={group.area_id}
                      status={group.status_name}
                    />
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Box>
      )}
    </Stack>
  );
};

export default TelemetryContainer;
