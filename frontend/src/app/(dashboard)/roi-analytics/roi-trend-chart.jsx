"use client";
import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTheme } from "@mui/material/styles";

const formatCurrency = (value) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toLocaleString();
};

const ROITrendChart = ({ areaId, utilityId }) => {
  const { sendRequest, loading } = useFetchApi();
  const [trendData, setTrendData] = useState([]);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const params = { months: 6 };
        if (areaId) params.area_id = areaId;
        if (utilityId) params.utility_id = utilityId;
        
        const result = await sendRequest({ url: "/roi-analytics/trend", params });
        if (result?.success) {
          // Format month labels
          const formattedData = result.data.map((item) => ({
            ...item,
            monthLabel: new Date(item.month + "-01").toLocaleDateString("id-ID", {
              month: "short",
              year: "2-digit",
            }),
          }));
          setTrendData(formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch ROI trend:", error);
      }
    };
    fetchTrend();
  }, [areaId, utilityId]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: isDark ? "#1E293B" : "#FFFFFF",
            border: `1px solid ${isDark ? "#334155" : "#E2E8F0"}`,
            borderRadius: "8px",
            p: 1.5,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: Rp {formatCurrency(entry.value)}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card
      sx={(theme) => ({
        flex: 1,
        borderRadius: "16px",
        border: `1px solid ${theme.palette.mode === "dark" ? "#FFFFFF15" : "#00000010"}`,
        bgcolor: "transparent",
        backdropFilter: "blur(10px)",
        boxShadow: "none",
      })}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={3}>
          📈 ROI Trend (Last 6 Months)
        </Typography>

        {loading ? (
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        ) : trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDark ? "#334155" : "#E2E8F0"} 
              />
              <XAxis 
                dataKey="monthLabel" 
                stroke={isDark ? "#94A3B8" : "#64748B"}
                fontSize={12}
              />
              <YAxis 
                stroke={isDark ? "#94A3B8" : "#64748B"}
                fontSize={12}
                tickFormatter={(value) => `${formatCurrency(value)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="loss_avoided"
                name="Loss Avoided"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="net_benefit"
                name="Net Benefit"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="repair_cost"
                name="Repair Cost"
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#EF4444", strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Box
            sx={{
              height: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isDark ? "#64748B" : "#94A3B8",
            }}
          >
            <Typography>No ROI data available</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ROITrendChart;
