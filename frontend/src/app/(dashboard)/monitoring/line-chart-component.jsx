"use client";
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { Box, Typography, useTheme, Chip } from "@mui/material";
import CustomTooltipChart from "@/components/common/custom-tooltip-chart";

/* ================= Helpers ================= */
const pad2 = (n) => String(n).padStart(2, "0");
function timeKey(iso, useLocalTz, groupBy) {
  const d = new Date(iso);
  const get = (local, utc) => (useLocalTz ? local.call(d) : utc.call(d));
  const Y = get(Date.prototype.getFullYear, Date.prototype.getUTCFullYear);
  const M = pad2(get(Date.prototype.getMonth, Date.prototype.getUTCMonth) + 1);
  const D = pad2(get(Date.prototype.getDate, Date.prototype.getUTCDate));
  const H = pad2(get(Date.prototype.getHours, Date.prototype.getUTCHours));
  const m = pad2(get(Date.prototype.getMinutes, Date.prototype.getUTCMinutes));
  const s = pad2(get(Date.prototype.getSeconds, Date.prototype.getUTCSeconds));
  if (groupBy === "hour") return `${Y}-${M}-${D} ${H}:00`;
  return `${Y}-${M}-${D} ${H}:${m}:${s}`;
}

function formatXAxisLabel(label) {
  if (!label) return "";
  const raw = String(label);
  const base = raw.split("~")[0];
  const parts = base.split(" ");
  return parts[parts.length - 1];
}

function stringToColorHsl(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 50%)`;
}

const getBaseMetric = (metricKey) => String(metricKey).split(" - ")[0];

function resolveMetricName(row) {
  return (
    row?.metricType?.name ||
    row?.series ||
    (row?.metric_type_id != null ? `MT-${row.metric_type_id}` : "MT")
  );
}

/* 10-terakhir index-based */
function buildSeriesIndexBased(rows) {
  const deviceIds = new Set(
    rows?.map((r) => r?.Device?.id ?? r?.device_id ?? null)
  );
  const singleDevice = deviceIds.size <= 1;

  const perMetric = new Map();
  rows?.forEach((r) => {
    const metricName = resolveMetricName(r);
    if (!metricName) return;
    const deviceName = r?.Device?.name || `Device-${r?.device_id}`;
    const metricKey = singleDevice
      ? metricName
      : `${metricName} - ${deviceName}`;
    const val = Number(r?.value);
    if (Number.isNaN(val)) return;
    if (!perMetric.has(metricKey)) perMetric.set(metricKey, []);
    perMetric.get(metricKey).push(val);
  });

  const metricKeys = Array.from(perMetric.keys()).sort();
  const maxLen = Math.max(0, ...metricKeys.map((k) => perMetric.get(k).length));
  const len = Math.min(10, maxLen);

  const data = Array.from({ length: len }, (_, i) => {
    const row = { time: i + 1 };
    metricKeys.forEach((k) => {
      const arr = perMetric.get(k).slice(-10);
      row[k] = arr[i] ?? null;
    });
    return row;
  });

  return { data, metricKeys };
}

/* 10-terakhir time-based */
function buildSeriesTimeBased(rows, { useLocalTz, groupBy }) {
  const deviceIds = new Set(
    rows?.map((r) => r?.Device?.id ?? r?.device_id ?? null)
  );
  const singleDevice = deviceIds.size <= 1;

  const perMetric = new Map();
  rows?.forEach((r) => {
    const metricName = resolveMetricName(r);
    if (!metricName) return;
    const deviceName = r?.Device?.name || `Device-${r?.device_id}`;
    const metricKey = singleDevice
      ? metricName
      : `${metricName} - ${deviceName}`;
    const baseKey = timeKey(r?.time_stamp, useLocalTz, groupBy);
    const val = Number(r?.value);
    if (Number.isNaN(val)) return;
    if (!perMetric.has(metricKey)) perMetric.set(metricKey, []);
    perMetric.get(metricKey).push({ baseKey, ts: r?.time_stamp, val });
  });

  const metricKeys = Array.from(perMetric.keys()).sort();
  const selected = new Map();
  const allTimes = new Set();

  metricKeys.forEach((k) => {
    const last10Asc = perMetric
      .get(k)
      .sort((a, b) => new Date(b.ts) - new Date(a.ts))
      .slice(0, 10)
      .reverse();

    const dupCount = new Map();
    const m = new Map();
    last10Asc.forEach((p) => {
      const c = (dupCount.get(p.baseKey) || 0) + 1;
      dupCount.set(p.baseKey, c);
      const uniqueKey =
        c > 1 ? `${p.baseKey}~${String(c).padStart(2, "0")}` : p.baseKey;
      m.set(uniqueKey, p.val);
      allTimes.add(uniqueKey);
    });

    selected.set(k, m);
  });

  const timeList = Array.from(allTimes).sort((a, b) => a.localeCompare(b));
  const data = timeList.map((t) => {
    const row = { time: t };
    metricKeys.forEach((k) => {
      const mk = selected.get(k);
      if (mk && mk.has(t)) row[k] = mk.get(t);
    });
    return row;
  });

  return { data, metricKeys };
}

/* ===== Helper warna Chip status ===== */
const chipColorForStatus = (status) => {
  const s = (status || "").toLowerCase();
  if (/running|online|active/.test(s)) return "success";
  if (/down|offline|error|failed|fault/.test(s)) return "error";
  if (/partial|degrad|warning/.test(s)) return "warning";
  return "default";
};

/* =================== Component =================== */
const LineChartComponent = ({
  rows = [],
  title = "KWH Meter",
  areaName = "",
  useLocalTz = false,
  groupBy = "none", // "none" | "hour"
  hideTicks = false,
  useIndexAxis = false,
  metricColorMap = {
    X: "#e53935",
    Y: "#43a047",
    Z: "#1e88e5",
    Ptotal: "#e53935", // Red
    F: "#1e88e5",      // Blue
    E: "#FFA500",      // Orange
  },

  // status di header
  status = "",

  // === NEW: kontrol padding Y ===
  yPadPct = 0.05, // 5%
  yPadMin = 1, // minimal 1 unit
}) => {
  const theme = useTheme();

  // Helper: deteksi power meter
  const isPowerMeter = useMemo(() => {
    const t = (title || "").toLowerCase();
    return t.includes("kwh") || t.includes("power meter");
  }, [title]);

  // === 2. FILTER LOGIC (PERBAIKAN UTAMA DISINI) ===
  const filteredRows = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const t = (title || "").toLowerCase();

    // CASE A: Power Meter / KWh -> Filter Ptotal, F, E
    if (isPowerMeter) {
      const ALLOWED = ["ptotal", "f", "e"];
      return rows.filter((row) => {
        const mName = resolveMetricName(row);
        return ALLOWED.includes(String(mName).toLowerCase());
      });
    }

    // CASE B: Temperature Logic
    // [FIX]: Cukup cek jika judul mengandung "temperature" (tanpa syarat humidity)
    // Maka filter metric yang mengandung kata "temp" saja (humidity otomatis hilang)
    if (t.includes("temperature")) {
      return rows.filter((row) => {
        const mName = resolveMetricName(row).toLowerCase();
        // Hanya loloskan jika nama metric mengandung "temp"
        return mName.includes("temp"); 
      });
    }

    // CASE C: Default -> Tampilkan semua
    return rows;
  }, [rows, title, isPowerMeter]);

  // === 3. Build Series ===
  const { data, metricKeys } = useMemo(() => {
    if (useIndexAxis) return buildSeriesIndexBased(filteredRows);
    return buildSeriesTimeBased(filteredRows, { useLocalTz, groupBy });
  }, [filteredRows, useLocalTz, groupBy, useIndexAxis]);

  // === 4. HELPER: Custom Label Mapping ===
  const getMetricLabel = (originalKey) => {
    const lowerKey = originalKey.toLowerCase();

    // A. KWh / Power Meter Specific
    if (isPowerMeter) {
      if (lowerKey === "e") return "Energy Consumption (kWh)";
      if (lowerKey === "f") return "Frequency (Hz)";
      if (lowerKey === "ptotal") return "Power Total (kW)";
    }

    // B. Vibration Logic
    if (
      lowerKey === "x" ||
      lowerKey === "y" ||
      lowerKey === "z" ||
      lowerKey.includes("vibration") ||
      lowerKey.includes("vib")
    ) {
      if (originalKey.includes("(mm/s2)")) return originalKey;
      return `${originalKey} (mm/s2)`;
    }

    // C. Temperature Logic
    if (lowerKey.includes("temp")) {
      if (originalKey.includes("°C") || originalKey.includes("°c")) return originalKey;
      return `${originalKey} (°C)`;
    }
    
    return originalKey;
  };

  // === 5. Compute Last Values ===
  const lastValueInfo = useMemo(() => {
    const lastForKey = new Map();
    const getLast = (key) => {
      for (let i = data.length - 1; i >= 0; i--) {
        const v = data[i]?.[key];
        if (v != null && !Number.isNaN(Number(v))) return Number(v);
      }
      return null;
    };

    metricKeys.forEach((k) => {
      lastForKey.set(k, getLast(k));
    });

    const groups = new Map();
    metricKeys.forEach((k) => {
      const base = getBaseMetric(k).toLowerCase();
      if (!groups.has(base)) groups.set(base, []);
      groups.get(base).push({ key: k, last: lastForKey.get(k) });
    });

    const priority = ["ptotal", "e", "f", "current", "temperature", "temp", "vibration", "vib"];
    let chosenBase = null;
    for (const p of priority) {
      for (const g of groups.keys()) {
        if (g.includes(p)) {
          chosenBase = g;
          break;
        }
      }
      if (chosenBase) break;
    }
    if (!chosenBase) {
      const it = groups.keys().next();
      chosenBase = it.done ? null : it.value;
    }

    let display = null;
    let label = null;

    if (chosenBase) {
      const items = groups.get(chosenBase) || [];
      let best = null;
      let bestMag = -Infinity;
      items.forEach((it) => {
        const v = it.last;
        if (v == null || Number.isNaN(Number(v))) return;
        const mag = Math.abs(Number(v));
        if (mag > bestMag) {
          bestMag = mag;
          best = it;
        }
      });
      if (best) {
        display = best.last;
        label = getMetricLabel(best.key); 
      }
    }

    return { value: display, label };
  }, [data, metricKeys, isPowerMeter]);

  const axisColor = theme.palette.mode === "dark" ? "#ccc" : "#000";
  const gridColor = theme.palette.mode === "dark" ? "#fff" : "#ccc";

  const colorForMetricKey = (metricKey) => {
    const base = getBaseMetric(metricKey);
    return metricColorMap?.[base] || stringToColorHsl(base);
  };

  const yDomain = [
    (dataMin) => dataMin - Math.max(yPadMin, Math.abs(dataMin) * yPadPct),
    (dataMax) => dataMax + Math.max(yPadMin, Math.abs(dataMax) * yPadPct),
  ];

  return (
    <Box
      sx={(theme) => ({
        border: "1px solid",
        borderColor: theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000045",
        borderRadius: 2,
        bgcolor: theme.palette.mode === "dark" ? "transparent" : "#fff",
        [theme.breakpoints.up("xs")]: { p: 1 },
        [theme.breakpoints.up("sm")]: { p: 3 },
        [theme.breakpoints.up("md")]: { p: 3 },
      })}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={(theme) => ({
              fontWeight: 600,
              [theme.breakpoints.up("xs")]: { fontSize: 14 },
              [theme.breakpoints.up("sm")]: { fontSize: 16 },
              [theme.breakpoints.up("lg")]: { fontSize: 18 },
            })}
          >
            {title}
          </Typography>
          {!!areaName && (
            <Typography
              sx={(theme) => ({
                opacity: 0.8,
                mt: "6px",
                [theme.breakpoints.up("xs")]: { fontSize: 12 },
                [theme.breakpoints.up("lg")]: { fontSize: 13 },
              })}
            >
              {areaName}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label={status || "—"}
            size="small"
            color={chipColorForStatus(status)}
            sx={{ fontWeight: 600, textTransform: "capitalize" }}
          />
          {lastValueInfo.value != null && (
            <Typography sx={{ fontWeight: 700 }}>
              {Number.isFinite(lastValueInfo.value) ? (
                lastValueInfo.label
                  ? `${String(lastValueInfo.label)}: ${Number(lastValueInfo.value).toFixed(2)}`.trim()
                  : `${Number(lastValueInfo.value).toFixed(2)}`.trim()
              ) : (
                "—"
              )}
            </Typography>
          )}
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, bottom: 5, left: 10 }}
        >
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: axisColor }}
            tickMargin={10}
            minTickGap={8}
            tickFormatter={useIndexAxis ? (v) => v : formatXAxisLabel}
            hide={hideTicks}
          />
          <YAxis
            domain={yDomain}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: axisColor }}
            tickMargin={15}
            hide={hideTicks}
            tickFormatter={(val) => val.toFixed(1)}
          />
          <CartesianGrid
            vertical={false}
            stroke={gridColor}
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <Tooltip cursor={false} content={<CustomTooltipChart />} />
          {metricKeys.map((k) => (
            <Line
              key={k}
              type="monotone"
              dataKey={k}
              name={getMetricLabel(k)} 
              stroke={colorForMetricKey(k)}
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              connectNulls
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChartComponent;