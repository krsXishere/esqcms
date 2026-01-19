"use client";
import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

const CustomTooltipChart = ({ active, payload, label, unit: unitProp }) => {
  const theme = useTheme();

  // Formatter 2 desimal, titik, tanpa ribuan
  const fmt2 = (n) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    }).format(Number(n ?? 0));

  if (!active || !payload || payload.length === 0) return null;

  // Unit: pakai prop jika ada; kalau tidak, coba ambil dari data point
  const inferredUnit = unitProp ?? payload?.[0]?.payload?.unit ?? "";

  // Get current value and compare value
  const currentItem = payload.find(p => p.dataKey === "value");
  const compareItem = payload.find(p => p.dataKey === "compareValue");
  
  // Calculate comparison percentage
  let comparisonText = null;
  if (currentItem && compareItem && compareItem.value != null && compareItem.value !== 0) {
    const diff = ((currentItem.value - compareItem.value) / Math.abs(compareItem.value)) * 100;
    const sign = diff >= 0 ? "+" : "";
    comparisonText = `${sign}${diff.toFixed(1)}%`;
  }

  return (
    <Box
      sx={{
        backgroundColor: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid",
        borderColor: "#E2E8F0",
        p: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        color: "#1E293B",
        fontSize: "0.85rem",
        minWidth: 140,
      }}
    >
      <Typography sx={{ fontWeight: "600", mb: 1, fontSize: "0.9rem", color: "#1E293B" }}>
        {label}
      </Typography>

      {payload.map((item, i) => (
        <Box
          key={i}
          sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.5 }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: item?.color || (item.dataKey === "value" ? "#616161" : "#9E9E9E"),
            }}
          />
          <Typography sx={{ fontSize: "0.85rem", color: "#1E293B" }}>
            {item?.dataKey === "value" ? "Value" : item?.dataKey === "compareValue" ? "Previous" : item?.name}: <strong>{fmt2(item?.value)}</strong> {inferredUnit}
          </Typography>
        </Box>
      ))}

      {comparisonText && (
        <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid", borderColor: "#E2E8F0" }}>
          <Typography sx={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 0.5, color: "#64748B" }}>
            <span style={{ color: comparisonText.startsWith("+") ? "#4CAF50" : "#F44336" }}>
              {comparisonText.startsWith("+") ? "▲" : "▼"}
            </span>
            <span>vs Previous: <strong style={{ color: comparisonText.startsWith("+") ? "#4CAF50" : "#F44336" }}>{comparisonText}</strong></span>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CustomTooltipChart;
