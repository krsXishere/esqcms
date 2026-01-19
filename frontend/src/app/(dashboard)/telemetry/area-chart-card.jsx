"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  useTheme,
  Chip,
} from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";
import CustomTooltipChart from "@/components/common/custom-tooltip-chart";
import { FaGear } from "react-icons/fa6";
import { FaEnvelope } from "react-icons/fa";
import { LuChevronsUpDown, LuChevronUp, LuChevronDown } from "react-icons/lu";
import { HiDotsHorizontal } from "react-icons/hi";
import { useRouter } from "next/navigation";
import ModalDetailAlarm from "./modal-detail-alarm";
import { useFetchApi } from "@/app/hook/useFetchApi";

// Simple cache for alarm variables
const alarmVarsCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/* ===== Helper: Chip color for status ===== */
const chipColorForStatus = (status) => {
  const s = (status || "").toLowerCase();
  if (/running|online|active/.test(s)) return "success";
  if (/down|offline|error|failed|fault/.test(s)) return "error";
  if (/partial|degrad|warning/.test(s)) return "warning";
  return "default";
};

/* ===== Helper: Determine chart color based on gauge status ===== */
const getChartColorByGaugeStatus = (value, gaugeMin, gaugeMax) => {
  const safeMin = Number.isFinite(gaugeMin) ? Number(gaugeMin) : 0;
  const safeMax = Number.isFinite(gaugeMax) && Number(gaugeMax) > safeMin ? Number(gaugeMax) : safeMin + 1;
  const rawVal = Number(value ?? 0);
  const clamped = Math.min(Math.max(rawVal, safeMin), safeMax);
  const ratio = rawVal <= safeMin ? 0 : (clamped - safeMin) / (safeMax - safeMin);

  const GREEN = "#00C853";
  const YELLOW = "#FFC400";
  const RED = "#FF1744";

  if (ratio > 0.8) return RED;
  if (ratio > 0.5) return YELLOW;
  if (ratio > 0) return GREEN;
  return GREEN; // Default to green when at or below minimum
};

const RadialGauge = ({
  value = 0,
  min = 0,
  max = 2000,
  unit = "",
  label,
}) => {
  const theme = useTheme();

  const safeMin = Number.isFinite(min) ? Number(min) : 0;
  const safeMax =
    Number.isFinite(max) && Number(max) > safeMin ? Number(max) : safeMin + 1;

  const rawVal = Number(value ?? 0);
  const clamped = Math.min(Math.max(rawVal, safeMin), safeMax);

  const ratio =
    rawVal <= safeMin ? 0 : (clamped - safeMin) / (safeMax - safeMin);

  const trackColor =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "#3A3F4A";

  const textColor =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.9)" : "#333";

  const mid = (safeMin + safeMax) / 2;

  const cx = 100;
  const cy = 100;
  const radius = 90;
  const angle = Math.PI - ratio * Math.PI;
  const dotX = cx + radius * Math.cos(angle);
  const dotY = cy - radius * Math.sin(angle);

  const GREEN = "#00C853";
  const YELLOW = "#FFC400";
  const RED = "#FF1744";

  let dotColor = null;
  if (ratio > 0.8) dotColor = RED;
  else if (ratio > 0.5) dotColor = YELLOW;
  else if (ratio > 0) dotColor = GREEN;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg viewBox="0 0 200 120" style={{ width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={GREEN} />
            <stop offset="50%" stopColor={GREEN} />
            <stop offset="52%" stopColor={YELLOW} />
            <stop offset="80%" stopColor={YELLOW} />
            <stop offset="82%" stopColor={RED} />
            <stop offset="100%" stopColor={RED} />
          </linearGradient>
        </defs>

        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke={trackColor}
          strokeWidth="12"
          strokeLinecap="round"
        />

        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${ratio * 283} 283`}
          strokeDashoffset="0"
          style={{ opacity: ratio > 0 ? 1 : 0 }}
        />

        {ratio > 0 && <circle cx={dotX} cy={dotY} r="6" fill={dotColor} />}

        <text x="50" y="112" fontSize="10" fill={textColor} textAnchor="middle">
          {safeMin}
        </text>
        <text x="100" y="112" fontSize="10" fill={textColor} textAnchor="middle">
          {mid}
        </text>
        <text x="150" y="112" fontSize="10" fill={textColor} textAnchor="middle">
          {safeMax}
        </text>

        {/* Nilai asli, tanpa unit dan label */}
        <text x="100" y="86" fontSize="14" fill={textColor} textAnchor="middle">
          {rawVal.toFixed(2)}
        </text>
      </svg>
    </Box>
  );
};

const AreaChartCard = ({
  title = "voltage",
  metricName,                 // pure metric name untuk matching alarm variable
  chartColor = "#1166E3",
  lastValue = 0,
  datas = [],
  unit = "volt",
  stats = { min: 0, max: 0, range: 0, avg: 0 },
  device_id,
  area_id,
  status = "",
}) => {
  const theme = useTheme();
  const router = useRouter();
  const [isOpenDetailEvents, setIsOpenDetailEvents] = useState(false);

  const { sendRequest } = useFetchApi();
  const [gaugeMin, setGaugeMin] = useState(0);
  const [gaugeMax, setGaugeMax] = useState(2000);
  const fetchRef = useRef(null);

  // Use metricName if provided, otherwise use title
  const metricNameForMatching = metricName || title;

  useEffect(() => {
    const fetchAlarmVars = async () => {
      if (!device_id) return;

      // Check cache first - use device_id + metricName as cache key
      const cacheKey = `alarm_vars_${device_id}_${metricNameForMatching}`;
      const cached = alarmVarsCache.get(cacheKey);
      if (cached && cached.expireAt > Date.now()) {
        const { min, max } = cached.value;
        setGaugeMin(min);
        setGaugeMax(max);
        return;
      }

      try {
        const res = await sendRequest({
          method: "get",
          url: `/alarm-variables/device/${device_id}`,
        });

        const list = Array.isArray(res?.data) ? res.data : res;
        if (!Array.isArray(list)) {
          setGaugeMin(0);
          setGaugeMax(2000);
          return;
        }

        const keyRaw = (metricNameForMatching || "").trim();
        const upperKey = keyRaw.toUpperCase();

        const matched = list.find((item) => {
          const vname =
            (item?.alarmTemplate?.variable_name || "").trim().toUpperCase();
          if (!vname) return false;
          return (
            vname === upperKey || vname.endsWith(` ${upperKey}`) || vname.includes(`${upperKey} `)
          );
        });

        let min = 0, max = 2000;
        if (matched) {
          const low = Number(matched.low_value);
          const high = Number(matched.high_value);
          min = Number.isFinite(low) ? low : 0;
          max = Number.isFinite(high) && high !== low ? high : low + 1 || 2000;
        }

        // Cache the result
        alarmVarsCache.set(cacheKey, {
          value: { min, max },
          expireAt: Date.now() + CACHE_TTL,
        });

        setGaugeMin(min);
        setGaugeMax(max);
      } catch (err) {
        console.error("Failed to fetch alarm variables", err);
        setGaugeMin(0);
        setGaugeMax(2000);
      }
    };

    // Fetch when device_id or metricNameForMatching changes
    const fetchKey = `${device_id}_${metricNameForMatching}`;
    if (fetchRef.current !== fetchKey) {
      fetchRef.current = fetchKey;
      fetchAlarmVars();
    }
  }, [device_id, metricNameForMatching, sendRequest]);

  const fmt2 = (n) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    }).format(Number(n ?? 0));

  // Use props data directly (from container) instead of remote fetch
  const minVal = Number(stats?.min ?? 0);
  const maxVal = Number(stats?.max ?? 0);
  const rangeVal = Number(stats?.range ?? 0);
  const avgVal = Number(stats?.avg ?? 0);
  const effectiveLast = Number(lastValue ?? 0);

  // Calculate dynamic chart color based on effective last value and gauge min/max
  const dynamicChartColor = useMemo(
    () => getChartColorByGaugeStatus(effectiveLast, gaugeMin, gaugeMax),
    [effectiveLast, gaugeMin, gaugeMax]
  );

  const gradientId = `gradient-${dynamicChartColor.replace("#", "")}`;

  // Display only last 10 data points in chart
  const chartData = Array.isArray(datas) ? datas.slice(-10) : [];

  // Calculate Y-axis domain with 10% padding from gauge min/max
  const gaugeRange = gaugeMax - gaugeMin;
  const padding = gaugeRange * 0.1;
  const yAxisDomain = [gaugeMin - padding, gaugeMax + padding];

  return (
    <Box
      sx={(theme) => ({
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000045",
        backgroundColor: theme.palette.mode === "dark" ? "transparent" : "white",
        borderRadius: "12px",
        [theme.breakpoints.up("xs")]: {
          paddingBlock: "10px",
          paddingLeft: "10px",
        },
        [theme.breakpoints.up("sm")]: {
          paddingBlock: "16px",
          paddingLeft: "16px",
        },
        [theme.breakpoints.up("lg")]: {
          paddingBlock: "24px",
          paddingLeft: "24px",
        },
      })}
    >
      <ModalDetailAlarm open={isOpenDetailEvents} setOpen={setIsOpenDetailEvents} device_id={device_id} />

      <Stack sx={(theme) => ({ flexDirection: "row", alignItems: "start", justifyContent: "space-between" })}>
        <Box sx={(theme) => ({ display: "flex", [theme.breakpoints.up("xs")]: { flexDirection: "column" }, [theme.breakpoints.up("sm")]: { alignItems: "center", flexDirection: "row" } })}>
          <Box sx={(theme) => ({ [theme.breakpoints.up("sm")]: { paddingRight: "24px", borderRight: "1px solid #FFFFFF25" } })}>
            <Typography sx={(theme) => ({ fontWeight: 700, textTransform: "capitalize", [theme.breakpoints.up("xs")]: { fontSize: "12px" } })}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: "32px", fontWeight: "700" }}>
              {fmt2(effectiveLast)}
              <Typography component={"span"} sx={{ fontWeight: "400", fontSize: "16px", marginLeft: "8px" }}>{unit}</Typography>
            </Typography>
            {status && (
              <Chip
                label={status}
                size="small"
                color={chipColorForStatus(status)}
                sx={{ fontWeight: 600, textTransform: "capitalize", mt: 1 }}
              />
            )}
          </Box>

          <Box sx={(theme) => ({ [theme.breakpoints.up("xs")]: { paddingRight: "0px" }, [theme.breakpoints.up("sm")]: { paddingRight: "16px", paddingLeft: "10px" }, [theme.breakpoints.up("lg")]: { paddingLeft: "24px" } })}>
            <Box sx={{ display: "flex", marginTop: "12px", gap: "8px" }}>
              <Box sx={{ color: "#fff", display: "flex", gap: "6px", alignItems: "center", borderRadius: "8px", paddingBlock: "4px", paddingInline: "8px", backgroundColor: "#FF2056" }}>
                <LuChevronUp />
                <Typography sx={{ fontSize: { xs: "12px", sm: "14px" } }}>High: {maxVal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ color: "#fff", display: "flex", gap: "6px", alignItems: "center", borderRadius: "8px", paddingBlock: "4px", paddingInline: "8px", backgroundColor: "#1166E3" }}>
                <HiDotsHorizontal />
                <Typography sx={{ fontSize: { xs: "12px", sm: "14px" } }}>Average: {avgVal.toFixed(2)}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Stack sx={(theme) => ({ gap: "8px", pr: "8px", [theme.breakpoints.up("xs")]: { flexDirection: "column" }, [theme.breakpoints.up("sm")]: { flexDirection: "row" } })}>
          <IconButton
            sx={{ width: { xs: 25, sm: 30, lg: 34 }, height: { xs: 25, sm: 30, lg: 34 } }}
            onClick={() => {
              const q = new URLSearchParams();
              if (area_id) q.set("area_id", String(area_id));
              if (device_id) q.set("device_id", String(device_id));
              const qs = q.toString();
              router.push(`/alarm&notification${qs ? `?${qs}` : ""}`);
            }}
          >
            <FaGear color="white" />
          </IconButton>
          <IconButton sx={{ width: { xs: 25, sm: 30, lg: 34 }, height: { xs: 25, sm: 30, lg: 34 } }} onClick={() => setIsOpenDetailEvents(true)}>
            <FaEnvelope color="white" />
          </IconButton>
        </Stack>
      </Stack>

      <Box sx={{ marginTop: "16px", display: "flex", gap: 2, alignItems: "stretch" }}>
        <Box sx={{ flex: 3, height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={dynamicChartColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={dynamicChartColor} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ccc" strokeDasharray="4 4" vertical={false} strokeOpacity={0.5} />
              <XAxis dataKey="time" stroke={theme.palette.mode === "dark" ? "#ccc" : "#000"} axisLine={false} tickMargin={10} tickLine={false} tick={{ fontSize: 10, fill: theme.palette.mode === "dark" ? "#ccc" : "#000" }} />
              <YAxis stroke={theme.palette.mode === "dark" ? "#ccc" : "#000"} domain={yAxisDomain} axisLine={false} tickMargin={15} tickLine={false} tick={{ fontSize: 10, fill: theme.palette.mode === "dark" ? "#ccc" : "#000" }} />
              <Tooltip content={<CustomTooltipChart />} cursor={false} />
              {/* High value reference line */}
              <ReferenceLine 
                y={gaugeMax} 
                stroke="#FF1744" 
                strokeDasharray="5 5" 
                strokeWidth={2}
                label={{
                  value: `High: ${fmt2(gaugeMax)}`,
                  position: 'insideTopLeft',
                  fill: '#FF1744',
                  fontSize: 12,
                  fontWeight: 'bold',
                  offset: 10,
                  dx: -10
                }}
              />
              {/* Low value reference line */}
              <ReferenceLine 
                y={gaugeMin} 
                stroke="#FF1744" 
                strokeDasharray="5 5" 
                strokeWidth={2}
                label={{
                  value: `Low: ${fmt2(gaugeMin)}`,
                  position: 'insideTopLeft',
                  fill: '#FF1744',
                  fontSize: 12,
                  fontWeight: 'bold',
                  offset: -15,
                  dx: 15
                }}
              />
              <Area type="monotone" dataKey="value" stroke={dynamicChartColor} fillOpacity={1} fill={`url(#${gradientId})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ flex: 1, minWidth: 140, height: 200, pr: 1 }}>
          <RadialGauge value={Number(effectiveLast) || 0} min={gaugeMin} max={gaugeMax} unit={unit} label={title} />
        </Box>
      </Box>
    </Box>
  );
};

export default AreaChartCard;
