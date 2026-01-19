"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  useTheme,
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
} from "recharts";
import CustomTooltipChart from "@/components/common/custom-tooltip-chart";
import { FaGear } from "react-icons/fa6";
import { FaEnvelope } from "react-icons/fa";
import { LuChevronsUpDown, LuChevronUp, LuChevronDown } from "react-icons/lu";
import { HiDotsHorizontal } from "react-icons/hi";
import { useRouter } from "next/navigation";
import ModalDetailEvents from "./modal-detail-events";
import { useFetchApi } from "@/app/hook/useFetchApi";

/* ===== Helper: Determine chart color based on gauge status (same as telemetry) ===== */
const getChartColorByGaugeStatus = (value, gaugeMin, gaugeMax) => {
  const safeMin = Number.isFinite(gaugeMin) ? Number(gaugeMin) : 0;
  const safeMax =
    Number.isFinite(gaugeMax) && Number(gaugeMax) > safeMin
      ? Number(gaugeMax)
      : safeMin + 1;

  const rawVal = Number(value ?? 0);
  const clamped = Math.min(Math.max(rawVal, safeMin), safeMax);
  const ratio = rawVal <= safeMin ? 0 : (clamped - safeMin) / (safeMax - safeMin);

  const GREEN = "#00C853";
  const YELLOW = "#FFC400";
  const RED = "#FF1744";

  if (ratio > 0.8) return RED;
  if (ratio > 0.5) return YELLOW;
  if (ratio > 0) return GREEN;
  return GREEN;
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

  const rawVal = Number(value ?? 0);     // nilai asli (untuk display)
  const clamped = Math.min(Math.max(rawVal, safeMin), safeMax); // nilai untuk gauge saja

  // Jika masih di bawah min → gauge kosong total
  const ratio =
    rawVal <= safeMin ? 0 : (clamped - safeMin) / (safeMax - safeMin);

  const trackColor =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "#3A3F4A";

  const textColor =
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.9)" : "#333";

  const mid = (safeMin + safeMax) / 2;

  // Posisi dot ujung arc — TIDAK tampil kalau ratio = 0 (gauge kosong)
  const cx = 100;
  const cy = 100;
  const radius = 90;
  const angle = Math.PI - ratio * Math.PI;
  const dotX = cx + radius * Math.cos(angle);
  const dotY = cy - radius * Math.sin(angle);

  // Zona warna (hanya dipakai kalau ratio > 0)
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

        {/* Track semicircle */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke={trackColor}
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Filled gauge - hanya tampil jika ratio > 0 */}
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

        {/* Dot indicator – hanya tampil jika ratio > 0 */}
        {ratio > 0 && <circle cx={dotX} cy={dotY} r="6" fill={dotColor} />}

        {/* Labels bawah */}
        <text x="50" y="112" fontSize="10" fill={textColor} textAnchor="middle">
          {safeMin}
        </text>
        <text x="100" y="112" fontSize="10" fill={textColor} textAnchor="middle">
          {mid}
        </text>
        <text x="150" y="112" fontSize="10" fill={textColor} textAnchor="middle">
          {safeMax}
        </text>

        {/* Nilai asli, TIDAK CLAMP - tanpa unit dan label */}
        <text
          x="100"
          y="86"
          fontSize="14"
          fill={textColor}
          textAnchor="middle"
        >
          {rawVal.toFixed(2)}
        </text>
      </svg>
    </Box>
  );
};


/* ======================= AREA CHART CARD ======================= */

const AreaChartCard = ({
  title = "voltage",          // contoh: "device name - x" atau "Vibration - X"
  metricName,                 // pure metric name untuk matching alarm variable (e.g. "x", "y", "z")
  chartColor = "#1166E3",
  lastValue = 0,
  datas = [],
  unit = "volt",
  stats = { min: 0, max: 0, range: 0, avg: 0 },
  device_id,
  label,
  // Comparison props
  compareData = null,         // data from previous period
  compareColor = "#FF9800",   // color for comparison line
  compareLabel = "Previous",  // label for comparison
}) => {
  const theme = useTheme();
  const router = useRouter();
  const [isOpenDetailEvents, setIsOpenDetailEvents] = useState(false);

  const { sendRequest } = useFetchApi();
  const [gaugeMin, setGaugeMin] = useState(0);
  const [gaugeMax, setGaugeMax] = useState(2000);

  // Use metricName if provided, otherwise extract from title or use title as-is
  const metricNameForMatching = metricName || title;

  // Ambil min/max gauge dari /alarm-variables/device/:id
  useEffect(() => {
    const fetchAlarmVars = async () => {
      if (!device_id) return;
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

        // Cari alarm-variable yang cocok dengan metric ini
        const matched = list.find((item) => {
          const vname =
            (item?.alarmTemplate?.variable_name || "").trim().toUpperCase();
          if (!vname) return false;

          // Contoh: "Vibration X" match dengan "X" atau "VIBRATION X"
          return (
            vname === upperKey ||
            vname.endsWith(` ${upperKey}`) ||
            vname.includes(`${upperKey} `)
          );
        });

        if (matched) {
          const low = Number(matched.low_value);
          const high = Number(matched.high_value);
          setGaugeMin(Number.isFinite(low) ? low : 0);
          setGaugeMax(
            Number.isFinite(high) && high !== low ? high : low + 1 || 2000
          );
        } else {
          // fallback kalau tidak ketemu
          setGaugeMin(0);
          setGaugeMax(2000);
        }
      } catch (err) {
        console.error("Failed to fetch alarm variables", err);
        setGaugeMin(0);
        setGaugeMax(2000);
      }
    };

    fetchAlarmVars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device_id, metricNameForMatching]);

  const fmt2 = (n) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    }).format(Number(n ?? 0));

  const effectiveLast = Number(lastValue ?? 0);
  const dynamicChartColor = useMemo(
    () => getChartColorByGaugeStatus(effectiveLast, gaugeMin, gaugeMax),
    [effectiveLast, gaugeMin, gaugeMax]
  );

  const gradientId = `gradient-${dynamicChartColor.replace("#", "")}`;
  const gradientIdCompare = `gradient-compare-${compareColor.replace("#", "")}`;

  const minVal = Number(stats?.min ?? 0);
  const maxVal = Number(stats?.max ?? 0);
  const rangeVal = Number(stats?.range ?? 0);
  const avgVal = Number(stats?.avg ?? 0);

  // Merge data with comparison data for combined chart
  const combinedData = useMemo(() => {
    if (!compareData || !Array.isArray(compareData) || compareData.length === 0) {
      return datas;
    }
    // Merge by index (assuming same time points)
    return datas.map((item, idx) => ({
      ...item,
      compareValue: compareData[idx]?.value ?? null,
    }));
  }, [datas, compareData]);

  // Y-axis domain padding: 10% above high and 10% below low.
  // Prefer alarm-variables (gaugeMin/gaugeMax) when valid; otherwise fall back to data stats.
  const hasValidGaugeBounds =
    Number.isFinite(gaugeMin) &&
    Number.isFinite(gaugeMax) &&
    Number(gaugeMax) > Number(gaugeMin);

  const baseLow = hasValidGaugeBounds ? Number(gaugeMin) : minVal;
  const baseHigh = hasValidGaugeBounds ? Number(gaugeMax) : maxVal;
  const baseRange = baseHigh - baseLow;
  const pad = baseRange > 0 ? baseRange * 0.1 : Math.max(Math.abs(baseHigh) * 0.1, 1);
  const yAxisDomain = [baseLow - pad, baseHigh + pad];

  return (
    <Box
      sx={(theme) => ({
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000045",
        backgroundColor:
          theme.palette.mode === "dark" ? "transparent" : "white",
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
      <ModalDetailEvents
        open={isOpenDetailEvents}
        setOpen={setIsOpenDetailEvents}
        device_id={device_id}
      />

      {/* HEADER */}
      <Stack
        sx={(theme) => ({
          flexDirection: "row",
          alignItems: "start",
          justifyContent: "space-between",
          [theme.breakpoints.up("xs")]: {
            paddingInlineEnd: "0px ",
          },
          [theme.breakpoints.up("sm")]: {
            paddingInlineEnd: "16px ",
          },
          [theme.breakpoints.up("lg")]: {
            paddingInlineEnd: "24px ",
          },
        })}
      >
        {/* Left: title + stats */}
        <Box
          sx={(theme) => ({
            display: "flex",
            [theme.breakpoints.up("xs")]: {
              flexDirection: "column",
            },
            [theme.breakpoints.up("sm")]: {
              alignItems: "center",
              flexDirection: "row",
            },
          })}
        >
          <Box
            sx={(theme) => ({
              [theme.breakpoints.up("sm")]: {
                paddingRight: "24px",
                borderRight: "1px solid #FFFFFF25",
              },
            })}
          >
            <Typography
              sx={(theme) => ({
                fontWeight: 700,
                textTransform: "capitalize",
                [theme.breakpoints.up("xs")]: {
                  fontSize: "12px",
                },
              })}
            >
              {title}
            </Typography>
            {label ? (
              <Typography
                sx={(theme) => ({
                  marginTop: "2px",
                  color: theme.palette.text.secondary,
                  fontSize: "11px",
                  lineHeight: 1.2,
                })}
              >
                {label}
              </Typography>
            ) : null}
            <Typography sx={{ fontSize: "32px", fontWeight: "700" }}>
              {fmt2(lastValue)}
              <Typography
                component={"span"}
                sx={{ fontWeight: "400", fontSize: "16px", marginLeft: "8px" }}
              >
                {unit}
              </Typography>
            </Typography>
          </Box>

          <Box
            sx={(theme) => ({
              [theme.breakpoints.up("xs")]: {
                paddingRight: "0px",
              },
              [theme.breakpoints.up("sm")]: {
                paddingRight: "16px",
                paddingLeft: "10px",
              },
              [theme.breakpoints.up("lg")]: {
                paddingLeft: "24px",
              },
            })}
          >
            <Box sx={{ display: "flex", marginTop: "12px", gap: "8px" }}>
              <Box
                sx={{
                  color: "#fff",
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                  borderRadius: "8px",
                  paddingBlock: "4px",
                  paddingInline: "8px",
                  backgroundColor: "#FF2056",
                }}
              >
                <LuChevronUp />
                <Typography sx={{ fontSize: { xs: "12px", sm: "14px" } }}>
                  High : {maxVal.toFixed(2)}
                </Typography>
              </Box>

              <Box
                sx={{
                  color: "#fff",
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                  borderRadius: "8px",
                  paddingBlock: "4px",
                  paddingInline: "8px",
                  backgroundColor: "#1166E3",
                }}
              >
                <HiDotsHorizontal />
                <Typography sx={{ fontSize: { xs: "12px", sm: "14px" } }}>
                  Average: {avgVal.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right: icon buttons */}
        <Stack
          sx={(theme) => ({
            gap: "8px",
            pr: "8px",
            [theme.breakpoints.up("xs")]: {
              flexDirection: "column",
            },
            [theme.breakpoints.up("sm")]: {
              flexDirection: "row",
            },
          })}
        >
          <IconButton
            sx={{
              width: { xs: 25, sm: 30, lg: 34 },
              height: { xs: 25, sm: 30, lg: 34 },
            }}
            onClick={() =>
              router.push(`/alarm&notification?device_id=${device_id}`)
            }
          >
            <FaGear color="white" />
          </IconButton>
          <IconButton
            sx={{
              width: { xs: 25, sm: 30, lg: 34 },
              height: { xs: 25, sm: 30, lg: 34 },
            }}
            onClick={() => setIsOpenDetailEvents(true)}
          >
            <FaEnvelope color="white" />
          </IconButton>
        </Stack>
      </Stack>

      {/* CONTENT: Line chart + radial gauge */}
      <Box
        sx={{
          marginTop: "16px",
          display: "flex",
          gap: 2,
          alignItems: "stretch",
        }}
      >
        {/* Left: Line chart */}
        <Box sx={{ flex: 3, height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={combinedData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={dynamicChartColor} stopOpacity={0.8} />
                  <stop
                    offset="95%"
                    stopColor={dynamicChartColor}
                    stopOpacity={0.05}
                  />
                </linearGradient>
                <linearGradient id={gradientIdCompare} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={compareColor} stopOpacity={0.5} />
                  <stop
                    offset="95%"
                    stopColor={compareColor}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#ccc"
                strokeDasharray="4 4"
                vertical={false}
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="time"
                stroke={theme.palette.mode === "dark" ? "#ccc" : "#000"}
                axisLine={false}
                tickMargin={10}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: theme.palette.mode === "dark" ? "#ccc" : "#000",
                }}
              />
              <YAxis
                stroke={theme.palette.mode === "dark" ? "#ccc" : "#000"}
                domain={yAxisDomain}
                axisLine={false}
                tickMargin={15}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: theme.palette.mode === "dark" ? "#ccc" : "#000",
                }}
              />
              <Tooltip 
                content={<CustomTooltipChart />} 
                cursor={{ 
                  stroke: theme.palette.mode === "dark" ? "#fff" : "#616161", 
                  strokeWidth: 1, 
                  strokeDasharray: "4 4" 
                }} 
              />

              {/* High/Low limit lines (from /alarm-variables) */}
              <ReferenceLine
                y={gaugeMax}
                stroke="#FF1744"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `High: ${fmt2(gaugeMax)}`,
                  position: "insideTopLeft",
                  fill: "#FF1744",
                  fontSize: 12,
                  fontWeight: "bold",
                  offset: 10,
                  dx: -10,
                }}
              />
              <ReferenceLine
                y={gaugeMin}
                stroke="#FF1744"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Low: ${fmt2(gaugeMin)}`,
                  position: "insideTopLeft",
                  fill: "#FF1744",
                  fontSize: 12,
                  fontWeight: "bold",
                  offset: -15,
                  dx: 15,
                }}
              />

              {/* Comparison Area (rendered first so it's behind) */}
              {compareData && compareData.length > 0 && (
                <Area
                  type="monotone"
                  dataKey="compareValue"
                  stroke={compareColor}
                  fillOpacity={1}
                  fill={`url(#${gradientIdCompare})`}
                  strokeWidth={2}
                  name={compareLabel}
                  dot={false}
                  activeDot={{ r: 4, fill: compareColor, stroke: "#fff", strokeWidth: 2 }}
                />
              )}

              <Area
                type="monotone"
                dataKey="value"
                stroke={dynamicChartColor}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                strokeWidth={2.5}
                name="Current"
                dot={false}
                activeDot={{ r: 5, fill: dynamicChartColor, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        {/* Right: Radial gauge dengan min/max dari alarm-variables */}
        <Box
          sx={{
            flex: 1,
            minWidth: 140,
            height: 200,
            pr: 1,
          }}
        >
          <RadialGauge
            value={Number(lastValue) || 0}
            min={gaugeMin}
            max={gaugeMax}
            unit={unit}
            label={title}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AreaChartCard;
