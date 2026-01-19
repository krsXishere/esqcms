"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import RecentEvents from "./recent-events";
import RecentAlarm from "./recent-alarm";
import FilterAnalysisDialog from "./filter-analysis-diagnose";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { getCached } from "@/lib/apiCache";

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

const ALLOWED_SPAN = new Set([
  "1h",
  "1d",
  "4d",
  "1w",
  "15d",
  "1m",
  "3m",
  "6m",
  "1y",
]);

const normalizeSpan = (s) => {
  const v = s == null ? "" : String(s).toLowerCase();
  return ALLOWED_SPAN.has(v) ? v : "1d";
};

const isAll = (v) =>
  v == null || String(v).trim() === "" || String(v).toLowerCase() === "all";

// label waktu (UTC / GMT+0)
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
    return new Intl.DateTimeFormat("id-ID", {
      ...base,
      month: "short",
    }).format(d);
  }
  return new Intl.DateTimeFormat("id-ID", {
    ...base,
    day: "2-digit",
    month: "short",
  }).format(d);
};

// WIB (Asia/Jakarta) date-time format helpers (used for 1d rolling range labeling)
const fmtWibDate = (d) =>
  new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);

const fmtWibTime = (d) =>
  new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);

const fmtWibDateTime = (d) => `${fmtWibDate(d)} ${fmtWibTime(d)}`;

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

// params API dari URL
const buildApiParams = (sp) => {
  const area = sp.get("area_id");
  const utility = sp.get("utility_id");
  const span = normalizeSpan(sp.get("time_span") || "1d");
  const params = { time_span: span };
  if (!isAll(area)) params.area_id = area;
  if (!isAll(utility)) params.utility_id = utility;
  return params;
};

// state -> URL (linkable)
const toQueryString = ({ area_id, utility_id, time_span, selected_date, selected_hour, compare_enabled, compare_mode }) => {
  const p = new URLSearchParams();
  if (!isAll(area_id)) p.set("area_id", String(area_id));
  if (!isAll(utility_id)) p.set("utility_id", String(utility_id));
  p.set("time_span", normalizeSpan(time_span));
  if (selected_date) p.set("selected_date", selected_date);
  if (selected_hour) p.set("selected_hour", selected_hour);
  if (compare_enabled) p.set("compare_enabled", String(compare_enabled));
  if (compare_mode) p.set("compare_mode", compare_mode);
  const qs = p.toString();
  return qs ? `?${qs}` : "?";
};

// Helper to calculate previous period date
const getPreviousPeriodDate = (selectedDate, selectedHour, timeSpan) => {
  if (!selectedDate) return { date: null, hour: null };
  
  const date = new Date(selectedDate);
  let prevDate = new Date(date);
  
  switch (timeSpan) {
    case "1h":
      // Go back 1 hour
      if (selectedHour) {
        const [hour] = selectedHour.split(":").map(Number);
        if (hour === 0) {
          prevDate.setDate(prevDate.getDate() - 1);
          return { 
            date: prevDate.toISOString().split("T")[0], 
            hour: "23:00" 
          };
        }
        return { 
          date: selectedDate, 
          hour: `${String(hour - 1).padStart(2, "0")}:00` 
        };
      }
      return { date: selectedDate, hour: null };
    case "1d":
      prevDate.setDate(prevDate.getDate() - 1);
      break;
    case "4d":
      prevDate.setDate(prevDate.getDate() - 4);
      break;
    case "1w":
      prevDate.setDate(prevDate.getDate() - 7);
      break;
    case "15d":
      prevDate.setDate(prevDate.getDate() - 15);
      break;
    case "1m":
      prevDate.setMonth(prevDate.getMonth() - 1);
      break;
    case "3m":
      prevDate.setMonth(prevDate.getMonth() - 3);
      break;
    case "6m":
      prevDate.setMonth(prevDate.getMonth() - 6);
      break;
    case "1y":
      prevDate.setFullYear(prevDate.getFullYear() - 1);
      break;
    default:
      prevDate.setDate(prevDate.getDate() - 1);
  }
  
  return { 
    date: prevDate.toISOString().split("T")[0], 
    hour: selectedHour 
  };
};

// helper device info
const getDeviceId = (it) => it?.device_id ?? it?.Device?.id ?? "unknown";

/* ================= Component ================= */

const AnalisysContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendRequest } = useFetchApi();

  const [raw, setRaw] = useState([]);
  const [rawCompare, setRawCompare] = useState([]); // data for comparison period
  const [hasLoaded, setHasLoaded] = useState(false);

  const [layoutMode, setLayoutMode] = useState("list"); // "list" or "grid"

  const [deviceDict, setDeviceDict] = useState({}); // reserved if needed later

  const loadDevicesByUtility = useCallback(
    async (utilityVal) => {
      const isAllUtility = isAll(utilityVal);
      const cacheKey = isAllUtility ? `devices:all` : `devices:utility:${utilityVal}`;
      const res = await getCached(cacheKey, async () => {
        return await sendRequest({ url: "/devices", params: isAllUtility ? {} : { utility_id: utilityVal } });
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      const dict = {};
      list.forEach((d) => {
        dict[String(d.id)] = { name: d.name, areaName: d?.area?.name || "" };
      });
      setDeviceDict(dict);
      return { ids: list.map((d) => String(d.id)), dict };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const loadUtilitiesByArea = useCallback(
    async (areaVal) => {
      const isAllArea = isAll(areaVal);
      const cacheKey = isAllArea ? `utilities:all` : `utilities:area:${areaVal}`;
      const res = await getCached(cacheKey, async () => {
        return await sendRequest({ url: "/utilities", params: isAllArea ? {} : { area_id: areaVal } });
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      return { ids: list.map((u) => String(u.id)), list };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fetchByUtility = useCallback(
    async (apiParams) => {
      const dateKey = apiParams.selected_date || "";
      const hourKey = apiParams.selected_hour || "";
      const key = `device_datas:utility:${apiParams.utility_id || "all"}:span:${apiParams.time_span || "1d"}:date:${dateKey}:hour:${hourKey}`;
      const res = await getCached(key, async () => {
        return await sendRequest({ url: "/device/datas", method: "GET", params: apiParams });
      });
      return normalizeToArray(res);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fetchPerDeviceAll = useCallback(
    async (baseParams, deviceIds) => {
      if (!deviceIds || deviceIds.length === 0) return [];
      const dateKey = baseParams.selected_date || "";
      const hourKey = baseParams.selected_hour || "";
      const tasks = deviceIds.map((id) =>
        (async () => {
          const key = `device_datas:${id}:span:${baseParams.time_span || "1d"}:date:${dateKey}:hour:${hourKey}`;
          try {
            const res = await getCached(key, async () => {
              return await sendRequest({ url: "/device/datas", method: "GET", params: { ...baseParams, device_id: id } });
            });
            return normalizeToArray(res);
          } catch (e) {
            return [];
          }
        })()
      );
      const settled = await Promise.allSettled(tasks);
      return settled.flatMap((s) => (s.status === "fulfilled" ? s.value : []));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const reload = useCallback(
    async () => {
      setHasLoaded(false);
      setRawCompare([]); // reset comparison data

      // prefer explicit time_span in URL, default to 1d
      const span = normalizeSpan(searchParams.get("time_span") || "1d");

      // read date/hour selection from URL
      const selectedDate = searchParams.get("selected_date") || "";
      const selectedHour = searchParams.get("selected_hour") || "";

      // read comparison settings from URL
      const compareEnabled = searchParams.get("compare_enabled") === "true";
      const compareMode = searchParams.get("compare_mode") || "combined";

      // read area/utility from URL if present
      let areaParam = searchParams.get("area_id");
      let utilityParam = searchParams.get("utility_id");

      try {
        // If no area in URL, pick first area from backend
        if (!areaParam) {
          const areasRes = await getCached("areas", async () => await sendRequest({ url: "/areas" }));
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

        // if we filled any missing value, update URL so state is linkable
        if (searchParams.get("area_id") !== areaParam || searchParams.get("utility_id") !== utilityParam) {
          router.replace(
            toQueryString({ area_id: areaParam ?? "", utility_id: utilityParam ?? "", time_span: span, selected_date: selectedDate, selected_hour: selectedHour, compare_enabled: compareEnabled, compare_mode: compareMode }),
            { scroll: false }
          );
        }

        // Build API params with date/hour if provided
        const apiParams = { time_span: span, utility_id: utilityParam };
        if (selectedDate) apiParams.selected_date = selectedDate;
        if (selectedHour) apiParams.selected_hour = selectedHour;

        // If a specific utility is selected, fetch its aggregated metrics
        if (utilityParam) {
          const data = await fetchByUtility(apiParams);
          setRaw(data);

          // Fetch comparison data if enabled
          if (compareEnabled && selectedDate) {
            const prevPeriod = getPreviousPeriodDate(selectedDate, selectedHour, span);
            if (prevPeriod.date) {
              const compareParams = { ...apiParams, selected_date: prevPeriod.date };
              if (prevPeriod.hour) compareParams.selected_hour = prevPeriod.hour;
              const compareData = await fetchByUtility(compareParams);
              setRawCompare(compareData);
            }
          }
        } else {
          // fallback: fetch per-device for entire area
          const { ids } = await loadDevicesByUtility(utilityParam);
          if (ids.length === 0) setRaw([]);
          else {
            const base = { time_span: span };
            if (selectedDate) base.selected_date = selectedDate;
            if (selectedHour) base.selected_hour = selectedHour;
            const data = await fetchPerDeviceAll(base, ids);
            setRaw(data);

            // Fetch comparison data if enabled
            if (compareEnabled && selectedDate) {
              const prevPeriod = getPreviousPeriodDate(selectedDate, selectedHour, span);
              if (prevPeriod.date) {
                const compareBase = { ...base, selected_date: prevPeriod.date };
                if (prevPeriod.hour) compareBase.selected_hour = prevPeriod.hour;
                const compareData = await fetchPerDeviceAll(compareBase, ids);
                setRawCompare(compareData);
              }
            }
          }
        }
      } finally {
        setHasLoaded(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  // hanya reload data ketika query string berubah
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

  const handleApplyFilter = ({ area_id, utility_id, time_span, selected_date, selected_hour, compare_enabled, compare_mode }) => {
    const next = {
      area_id: area_id || "",
      utility_id: utility_id || "",
      time_span: time_span || "1h",
      selected_date: selected_date || "",
      selected_hour: selected_hour || "",
      compare_enabled: compare_enabled || false,
      compare_mode: compare_mode || "combined",
    };
    router.replace(toQueryString(next), { scroll: false });
  };

  // === MAPPING dari response backend (sudah aggregated) ke chart + statistik ===
  const datasets = useMemo(() => {
    const span = normalizeSpan(searchParams.get("time_span") || "1d");

    // group per (device + metric_key)
    const groups = new Map();

    for (const it of raw || []) {
      const metricKey =
        it?.metric_key ?? it?.metricType?.name ?? it?.metric_type_id ?? "unknown";

      // Extract pure metric name (remove device name prefix if present)
      // Format from backend: "Device Name - Metric Name"
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
            metric_unit: it?.metricType?.unit ?? "",
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
        .sort(
          (a, b) =>
            new Date(a.time_stamp).getTime() - new Date(b.time_stamp).getTime()
        );

      let series;
      // Backend 1d = rolling last 24 hours (24 buckets). Keep fixed 24 buckets (id 0..23)
      // but show the actual UTC date-range for each bucket on the X axis.
      if (span === "1d") {
        series = [];

        const pad = (n) => String(n).padStart(2, "0");

        for (let h = 0; h < 24; h++) {
          const found = sorted.find((it) => {
            if (it == null) return false;
            if (it.id != null) return Number(it.id) === h;
            if (it.time_stamp) {
              try {
                return new Date(it.time_stamp).getHours() === h;
              } catch (e) {
                return false;
              }
            }
            return false;
          });

          const value =
            found == null || found.value == null || Number.isNaN(Number(found.value))
              ? null
              : Number(found.value);

          // Get bucket start/end from backend bucket timestamp (preferred).
          // It is already the bucket start time for that index.
          const bucketStart = found?.time_stamp ? new Date(found.time_stamp) : null;
          const bucketEnd = bucketStart
            ? new Date(bucketStart.getTime() + 60 * 60 * 1000)
            : null;

          const nextH = (h + 1) % 24;

          const timeLabel = bucketStart && bucketEnd
            ? `${fmtWibTime(bucketStart)}-${fmtWibTime(bucketEnd)}`
            : `${pad(h)}:00-${pad(nextH)}:00`;

          series.push({
            time: timeLabel,
            value,
            unit: meta.metric_unit,
          });
        }
      } else {
        series = sorted.map((it) => ({
          time: fmtLabel(it.time_stamp, span),
          value:
            it.value == null || Number.isNaN(Number(it.value))
              ? null
              : Number(it.value),
          unit: meta.metric_unit,
        }));
      }

      const vals = series
        .map((p) => p.value)
        .filter((v) => v != null && !Number.isNaN(v));

      const min = vals.length ? Math.min(...vals) : 0;
      const max = vals.length ? Math.max(...vals) : 0;
      const avg = vals.length
        ? vals.reduce((a, b) => a + b, 0) / vals.length
        : 0;
      const range = max - min;

      const metricLabel = String(meta.metric_key).toLowerCase();

      // Subtitle for 1d: show rolling UTC range based on bucket timestamps
      let subtitleLabel = "";
      if (span === "1d") {
        const bucketDates = (sorted || [])
          .map((it) => (it?.time_stamp ? new Date(it.time_stamp) : null))
          .filter(Boolean);

        if (bucketDates.length) {
          const minT = new Date(
            Math.min(...bucketDates.map((d) => d.getTime()))
          );
          const maxT = new Date(
            Math.max(...bucketDates.map((d) => d.getTime()))
          );
          const maxEnd = new Date(maxT.getTime() + 60 * 60 * 1000);
          subtitleLabel = `Range: ${fmtWibDateTime(minT)} - ${fmtWibDateTime(maxEnd)} WIB`;
        }
      }

      out.push({
        key,
        title: metricLabel,
        metricName: meta.metric_name, // pure metric name for alarm variable matching
        unit: meta.metric_unit,
        color: colorForKey(key),
        lastValue: vals.length ? vals[vals.length - 1] : 0,
        datas: series,
        stats: { min, max, avg, range },
        device_id: meta.device_id,
        label: subtitleLabel,
      });
    }

    return out.sort((a, b) => a.title.localeCompare(b.title));
  }, [raw, searchParams]);

  // === MAPPING comparison data ===
  const datasetsCompare = useMemo(() => {
    if (!rawCompare || rawCompare.length === 0) return [];
    
    const span = normalizeSpan(searchParams.get("time_span") || "1d");
    const groups = new Map();

    for (const it of rawCompare || []) {
      const metricKey =
        it?.metric_key ?? it?.metricType?.name ?? it?.metric_type_id ?? "unknown";
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
            metric_name: metricName,
            metric_unit: it?.metricType?.unit ?? "",
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
        .sort(
          (a, b) =>
            new Date(a.time_stamp).getTime() - new Date(b.time_stamp).getTime()
        );

      let series;
      if (span === "1d") {
        series = [];
        const pad = (n) => String(n).padStart(2, "0");
        for (let h = 0; h < 24; h++) {
          const found = sorted.find((it) => {
            if (it == null) return false;
            if (it.id != null) return Number(it.id) === h;
            if (it.time_stamp) {
              try {
                return new Date(it.time_stamp).getHours() === h;
              } catch (e) {
                return false;
              }
            }
            return false;
          });
          const value =
            found == null || found.value == null || Number.isNaN(Number(found.value))
              ? null
              : Number(found.value);
          const bucketStart = found?.time_stamp ? new Date(found.time_stamp) : null;
          const bucketEnd = bucketStart
            ? new Date(bucketStart.getTime() + 60 * 60 * 1000)
            : null;
          const nextH = (h + 1) % 24;
          const timeLabel = bucketStart && bucketEnd
            ? `${fmtWibTime(bucketStart)}-${fmtWibTime(bucketEnd)}`
            : `${pad(h)}:00-${pad(nextH)}:00`;
          series.push({ time: timeLabel, value, unit: meta.metric_unit });
        }
      } else {
        series = sorted.map((it) => ({
          time: fmtLabel(it.time_stamp, span),
          value:
            it.value == null || Number.isNaN(Number(it.value))
              ? null
              : Number(it.value),
          unit: meta.metric_unit,
        }));
      }

      const vals = series
        .map((p) => p.value)
        .filter((v) => v != null && !Number.isNaN(v));

      out.push({
        key,
        title: String(meta.metric_key).toLowerCase(),
        metricName: meta.metric_name,
        unit: meta.metric_unit,
        color: colorForKey(key + "_compare"),
        lastValue: vals.length ? vals[vals.length - 1] : 0,
        datas: series,
        stats: {
          min: vals.length ? Math.min(...vals) : 0,
          max: vals.length ? Math.max(...vals) : 0,
          avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
          range: vals.length ? Math.max(...vals) - Math.min(...vals) : 0,
        },
        device_id: meta.device_id,
        label: "Previous Period",
      });
    }

    return out.sort((a, b) => a.title.localeCompare(b.title));
  }, [rawCompare, searchParams]);

  const compareEnabled = searchParams.get("compare_enabled") === "true";
  const compareMode = searchParams.get("compare_mode") || "combined";
  const areaId = searchParams.get("area_id") || "";

  const isEmpty = hasLoaded && (raw.length === 0 || datasets.length === 0);

  return (
    <Stack sx={{ gap: "32px" }}>
      <Stack sx={{ gap: "12px" }}>
        <FilterAnalysisDialog
          onApply={handleApplyFilter}
          defaultValues={{
            area_id: searchParams.get("area_id") ?? undefined,
            utility_id: searchParams.get("utility_id") ?? undefined,
            time_span: normalizeSpan(searchParams.get("time_span") || "1d"),
            selected_date: searchParams.get("selected_date") ?? undefined,
            selected_hour: searchParams.get("selected_hour") ?? undefined,
            compare_enabled: searchParams.get("compare_enabled") ?? undefined,
            compare_mode: searchParams.get("compare_mode") ?? undefined,
          }}
          timeSpanOptions={[...ALLOWED_SPAN]}
        />

        <ToggleButtonGroup
          value={layoutMode}
          exclusive
          onChange={(e, newMode) => {
            if (newMode !== null) setLayoutMode(newMode);
          }}
          sx={{
            alignSelf: "flex-start",
            "& .MuiToggleButton-root": {
              textTransform: "none",
              fontSize: "0.9rem",
            },
          }}
        >
          <ToggleButton value="list">List</ToggleButton>
          <ToggleButton value="grid">Grid</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: "16px",
          alignItems: "stretch",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, display: "flex" }}>
          <RecentAlarm areaId={areaId} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, display: "flex" }}>
          <RecentEvents areaId={areaId} />
        </Box>
      </Box>

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
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Data Is Empty
          </Typography>
        </Box>
      ) : (
        layoutMode === "list" ? (
          <Stack sx={{ gap: "8px" }}>
            {datasets.map((d) => {
              // Find matching comparison data
              const compareMatch = compareEnabled && datasetsCompare.find(
                (c) => c.title === d.title && c.device_id === d.device_id
              );
              
              return (
                <React.Fragment key={d.key}>
                  <AreaChartCard
                    chartColor={d.color}
                    title={d.title}
                    metricName={d.metricName}
                    unit={d.unit}
                    lastValue={d.lastValue}
                    datas={d.datas}
                    stats={d.stats}
                    device_id={d.device_id}
                    label={d.label}
                    compareData={compareEnabled && compareMode === "combined" && compareMatch ? compareMatch.datas : null}
                    compareColor="#FF9800"
                    compareLabel="Previous Period"
                  />
                  {/* Separate chart for comparison */}
                  {compareEnabled && compareMode === "separate" && compareMatch && (
                    <AreaChartCard
                      key={`${d.key}-compare`}
                      chartColor="#FF9800"
                      title={`${d.title} (Previous Period)`}
                      metricName={d.metricName}
                      unit={d.unit}
                      lastValue={compareMatch.lastValue}
                      datas={compareMatch.datas}
                      stats={compareMatch.stats}
                      device_id={d.device_id}
                      label={compareMatch.label}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Stack>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            {datasets.map((d, idx) => {
              const total = datasets.length;
              const isLast = idx === total - 1;
              // When separate mode is enabled, don't span full since each current chart gets paired with its comparison
              const shouldSpanFull = !(compareEnabled && compareMode === "separate") && total % 2 === 1 && isLast;

              // Find matching comparison data
              const compareMatch = compareEnabled && datasetsCompare.find(
                (c) => c.title === d.title && c.device_id === d.device_id
              );

              return (
                <React.Fragment key={d.key}>
                  <Box sx={{ minWidth: 0, gridColumn: shouldSpanFull ? { sm: "1 / -1" } : "auto" }}>
                    <AreaChartCard
                      chartColor={d.color}
                      title={d.title}
                      metricName={d.metricName}
                      unit={d.unit}
                      lastValue={d.lastValue}
                      datas={d.datas}
                      stats={d.stats}
                      device_id={d.device_id}
                      label={d.label}
                      compareData={compareEnabled && compareMode === "combined" && compareMatch ? compareMatch.datas : null}
                      compareColor="#FF9800"
                      compareLabel="Previous Period"
                    />
                  </Box>
                  {/* Separate chart for comparison - appears next to its current chart in grid */}
                  {compareEnabled && compareMode === "separate" && compareMatch && (
                    <Box sx={{ minWidth: 0, gridColumn: "auto" }}>
                      <AreaChartCard
                        chartColor="#FF9800"
                        title={`${d.title} (Previous Period)`}
                        metricName={d.metricName}
                        unit={d.unit}
                        lastValue={compareMatch.lastValue}
                        datas={compareMatch.datas}
                        stats={compareMatch.stats}
                        device_id={d.device_id}
                        label={compareMatch.label}
                      />
                    </Box>
                  )}
                </React.Fragment>
              );
            })}
          </Box>
        )
      )}
    </Stack>
  );
};

export default AnalisysContainer;
