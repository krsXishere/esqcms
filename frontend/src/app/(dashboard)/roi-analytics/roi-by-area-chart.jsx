"use client";
import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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

const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"];

const ROIByAreaChart = ({ areaId, utilityId }) => {
  const { sendRequest, loading } = useFetchApi();
  const [areaData, setAreaData] = useState([]);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    const fetchByArea = async () => {
      try {
        const params = {};
        if (areaId) params.area_id = areaId;
        if (utilityId) params.utility_id = utilityId;
        
        const result = await sendRequest({ url: "/roi-analytics/by-area", params });
        if (result?.success) {
          // Sort by net_benefit and take top 6
          const sorted = result.data
            .sort((a, b) => b.net_benefit - a.net_benefit)
            .slice(0, 6);
          setAreaData(sorted);
        }
      } catch (error) {
        console.error("Failed to fetch ROI by area:", error);
      }
    };
    fetchByArea();
  }, [areaId, utilityId]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
            {data.area_name}
          </Typography>
          <Typography variant="body2" sx={{ color: "#10B981" }}>
            Net Benefit: Rp {formatCurrency(data.net_benefit)}
          </Typography>
          <Typography variant="body2" sx={{ color: "#3B82F6" }}>
            Loss Avoided: Rp {formatCurrency(data.loss_avoided)}
          </Typography>
          <Typography variant="body2" sx={{ color: "#EF4444" }}>
            Repair Cost: Rp {formatCurrency(data.repair_cost)}
          </Typography>
          <Typography variant="body2" sx={{ color: "#8B5CF6" }}>
            ROI: {data.roi_percentage.toFixed(1)}%
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? "#94A3B8" : "#64748B" }}>
            WO Count: {data.wo_count}
          </Typography>
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
          🏢 Net Benefit per Area
        </Typography>

        {loading ? (
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        ) : areaData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={areaData} layout="vertical">
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDark ? "#334155" : "#E2E8F0"} 
              />
              <XAxis 
                type="number"
                stroke={isDark ? "#94A3B8" : "#64748B"}
                fontSize={12}
                tickFormatter={(value) => `Rp ${formatCurrency(value)}`}
              />
              <YAxis 
                type="category"
                dataKey="area_name" 
                stroke={isDark ? "#94A3B8" : "#64748B"}
                fontSize={12}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="net_benefit" radius={[0, 8, 8, 0]}>
                {areaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
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
            <Typography>No data available by area</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ROIByAreaChart;
