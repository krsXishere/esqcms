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
  useLocalTz = true,
  groupBy = "none", // "none" | "hour"
  hideTicks = false,
  useIndexAxis = false,
  metricColorMap = { X: "#e53935", Y: "#43a047", Z: "#1e88e5" },

  // status di header
  status = "",

  // === NEW: kontrol padding Y ===
  yPadPct = 0.05, // 5%
  yPadMin = 1, // minimal 1 unit
}) => {
  const theme = useTheme();

  const { data, metricKeys } = useMemo(() => {
    if (useIndexAxis) return buildSeriesIndexBased(rows);
    return buildSeriesTimeBased(rows, { useLocalTz, groupBy });
  }, [rows, useLocalTz, groupBy, useIndexAxis]);

  const axisColor = theme.palette.mode === "dark" ? "#BDBDBD" : "#333";
  const gridColor = theme.palette.mode === "dark" ? "#FFFFFF" : "#000000";

  const colorForMetricKey = (metricKey) => {
    const base = getBaseMetric(metricKey);
    return metricColorMap?.[base] || stringToColorHsl(base);
  };

  // === NEW: domain Y dengan padding aman ===
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

        <Chip
          label={status || "—"}
          size="small"
          color={chipColorForStatus(status)}
          sx={{ fontWeight: 600, textTransform: "capitalize" }}
        />
      </Box>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
          margin={{ top: 16, right: 8, bottom: 16, left: 8 }} // NEW: lebih longgar
        >
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: axisColor, dy: 10 }}
            tickMargin={6} // NEW
            minTickGap={8}
            tickFormatter={useIndexAxis ? (v) => v : formatXAxisLabel}
            hide={hideTicks}
          />
          <YAxis
            domain={yDomain}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: axisColor, dx: -20 }}
            tickMargin={6}
            hide={hideTicks}
            tickFormatter={(val) => val.toFixed(1)} // ⬅️ tampilkan 1 angka di belakang koma
          />
          <CartesianGrid
            vertical={false}
            stroke={gridColor}
            strokeOpacity={0.15}
          />
          <Tooltip cursor={false} content={<CustomTooltipChart />} />
          <Legend
            wrapperStyle={{ marginTop: 12 }}
            iconType="circle"
            formatter={(value) => (
              <span
                style={{
                  color: theme.palette.mode === "dark" ? "#FFFFFF" : "#000000",
                }}
                className="text-xs md:text-base"
              >
                {value}
              </span>
            )}
            payload={metricKeys.map((k) => ({
              id: k,
              type: "line",
              value: k,
              color: colorForMetricKey(k),
            }))}
          />
          {metricKeys.map((k) => (
            <Line
              key={k}
              type="monotone" // NEW: anti-overshoot
              dataKey={k}
              name={k}
              stroke={colorForMetricKey(k)}
              strokeWidth={3}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              connectNulls
              strokeLinecap="round" // NEW: lebih halus
              strokeLinejoin="round" // NEW: lebih halus
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChartComponent;
