"use client";
import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import {
  DescriptionOutlined as ChecksheetIcon,
  ErrorOutline as NGIcon,
  BuildCircleOutlined as RepairIcon,
  TrendingDown as WorstIcon,
  WarningAmber as TopIssueIcon,
} from "@mui/icons-material";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const KPICards = ({ data, checksheetType }) => {
  const {
    totalChecksheets,
    ngRate,
    afterRepairRate,
    worstCpk, // for DIR
    topDefect, // for FI
    avgCpk, // for DIR
  } = data;

  // Mini trend data
  const miniTrendData = [
    { value: 5 },
    { value: 8 },
    { value: 6 },
    { value: 9 },
    { value: 7 },
    { value: 10 },
    { value: 8 },
  ];

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.critical) return { bg: "#FEE2E2", text: "#DC2626", label: "CRITICAL" };
    if (value >= thresholds.warning) return { bg: "#FEF3C7", text: "#F59E0B", label: "WARNING" };
    return { bg: "#D1FAE5", text: "#10B981", label: "GOOD" };
  };

  const getCpkStatusColor = (cpk) => {
    if (cpk < 1.0) return { bg: "#FEE2E2", text: "#DC2626", label: "CRITICAL" };
    if (cpk < 1.33) return { bg: "#FEF3C7", text: "#F59E0B", label: "WARNING" };
    return { bg: "#D1FAE5", text: "#10B981", label: "GOOD" };
  };

  const ngStatus = getStatusColor(ngRate, { critical: 5, warning: 3 });
  const cpkStatus = worstCpk ? getCpkStatusColor(worstCpk) : null;

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    badge,
    showTrend,
    trendDirection,
    description,
  }) => (
    <Paper
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: "16px",
        border: "1px solid rgba(0, 0, 0, 0.06)",
        p: 2.5,
        height: "100%",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        height="100%"
      >
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Icon sx={{ fontSize: 20, color: "#64748B" }} />
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#64748B",
              }}
            >
              {label}
            </Typography>
          </Stack>
          <Typography
            sx={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#111827",
              lineHeight: 1.2,
              mb: badge ? 1 : 0.5,
            }}
          >
            {value}
          </Typography>
          {badge && (
            <Chip
              label={badge.label}
              size="small"
              sx={{
                bgcolor: badge.bg,
                color: badge.text,
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 22,
                borderRadius: "6px",
              }}
            />
          )}
          {description && (
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#9CA3AF",
                mt: 0.5,
              }}
            >
              {description}
            </Typography>
          )}
          {trendDirection && (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: trendDirection === "up" ? "#EF4444" : "#10B981",
                }}
              >
                {trendDirection === "up" ? "↑" : "↓"} {trendDirection === "up" ? "+0.8%" : "-0.5%"}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF" }}>
                vs prev period
              </Typography>
            </Stack>
          )}
        </Box>
        {showTrend && (
          <Box sx={{ width: 80, height: 50, ml: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={miniTrendData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={trendDirection === "up" ? "#EF4444" : "#10B981"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Stack>
    </Paper>
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2.5}>
        {/* Total Checksheets */}
        <Grid item xs={12} sm={6} lg={2.4}>
          <MetricCard
            icon={ChecksheetIcon}
            label="Total Checksheets"
            value={totalChecksheets || "0"}
            description="This period"
          />
        </Grid>

        {/* NG Rate */}
        <Grid item xs={12} sm={6} lg={2.4}>
          <MetricCard
            icon={NGIcon}
            label="NG Rate"
            value={`${ngRate || 0}%`}
            badge={ngStatus}
            trendDirection={ngRate > 3 ? "up" : "down"}
            showTrend
          />
        </Grid>

        {/* After Repair Rate */}
        <Grid item xs={12} sm={6} lg={2.4}>
          <MetricCard
            icon={RepairIcon}
            label="After Repair Rate"
            value={`${afterRepairRate || 0}%`}
            description="Of total NG items"
          />
        </Grid>

        {/* Conditional Card for DIR/FI */}
        {checksheetType === "DIR" ? (
          <>
            {/* Worst Cpk */}
            <Grid item xs={12} sm={6} lg={2.4}>
              <MetricCard
                icon={WorstIcon}
                label="Worst Cpk"
                value={worstCpk || "N/A"}
                badge={cpkStatus}
                description="Shaft Diameter"
              />
            </Grid>

            {/* Avg Cpk */}
            <Grid item xs={12} sm={6} lg={2.4}>
              <MetricCard
                icon={TopIssueIcon}
                label="Avg Cpk"
                value={avgCpk || "N/A"}
                description="All parameters"
                showTrend
                trendDirection="down"
              />
            </Grid>
          </>
        ) : (
          <>
            {/* Top Defect (FI) */}
            <Grid item xs={12} sm={6} lg={2.4}>
              <MetricCard
                icon={TopIssueIcon}
                label="Top Defect"
                value={topDefect?.item || "N/A"}
                description={topDefect?.percentage ? `${topDefect.percentage}% of all NG` : ""}
              />
            </Grid>

            {/* After Repair Success Rate (FI) */}
            <Grid item xs={12} sm={6} lg={2.4}>
              <MetricCard
                icon={TopIssueIcon}
                label="Repair Success"
                value={`${data.repairSuccessRate || 0}%`}
                description="After repair approved"
                showTrend
                trendDirection="up"
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default KPICards;
