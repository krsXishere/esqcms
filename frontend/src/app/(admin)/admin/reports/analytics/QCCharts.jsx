import React from "react";
import { Paper, Typography, Grid, Box, Chip } from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

const QCCharts = ({ histogramData, trendData }) => {
  // Custom tooltip for histogram
  const CustomHistogramTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            p: 1.5,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>
            Count: {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Custom tooltip for trend
  const CustomTrendTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            p: 1.5,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", mb: 0.5 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              sx={{ fontSize: "0.8rem", color: entry.color, fontWeight: 500 }}
            >
              {entry.name}: {entry.value.toFixed(2)}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Grid container spacing={3}>
      {/* Histogram vs Specification */}
      <Grid item xs={12} lg={6}>
        <Paper
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "16px",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            p: 3,
            height: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Histogram vs Specification
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#64748B",
              }}
            >
              Out-of-spec: <span style={{ color: "#DC2626", fontWeight: 600 }}>18.4%</span>
            </Typography>
          </Box>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={histogramData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 10, fill: "#6B7280" }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomHistogramTooltip />} />
              <ReferenceLine x="49.95-50.05" stroke="#94A3B8" strokeDasharray="3 3" label={{ value: "LSL", position: "top", fontSize: 10, fill: "#6B7280" }} />
              <ReferenceLine x="50.05-50.15" stroke="#CBD5E1" strokeDasharray="3 3" label={{ value: "USL", position: "top", fontSize: 10, fill: "#6B7280" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {histogramData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index < 2 ? "#94A3B8" : index > 4 ? "#E5E7EB" : "#64748B"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Trend Over Time */}
      <Grid item xs={12} lg={6}>
        <Paper
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "16px",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            p: 3,
            height: "100%",
          }}
        >
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#111827",
              mb: 3,
            }}
          >
            Trend Over Time (Weekly)
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <YAxis
                domain={[24.9, 25.1]}
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip content={<CustomTrendTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                iconType="line"
              />
              <ReferenceLine
                y={25.05}
                stroke="#94A3B8"
                strokeDasharray="5 5"
                label={{ value: "USL", position: "right", fontSize: 10, fill: "#94A3B8" }}
              />
              <ReferenceLine
                y={25}
                stroke="#10B981"
                strokeDasharray="5 5"
                label={{ value: "Target", position: "right", fontSize: 10, fill: "#10B981" }}
              />
              <ReferenceLine
                y={24.95}
                stroke="#94A3B8"
                strokeDasharray="5 5"
                label={{ value: "LSL", position: "right", fontSize: 10, fill: "#94A3B8" }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#64748B"
                strokeWidth={2}
                dot={{ fill: "#64748B", r: 4, strokeWidth: 2, stroke: "#FFFFFF" }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#FFFFFF" }}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default QCCharts;
