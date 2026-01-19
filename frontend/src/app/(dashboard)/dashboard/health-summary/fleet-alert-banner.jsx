"use client";
import React from "react";
import { Box, Typography, Alert, AlertTitle, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { TbAlertTriangle, TbX } from "react-icons/tb";

const FleetAlertBanner = ({ alerts, onDismiss, onFilterAtRisk }) => {
  const theme = useTheme();

  if (!alerts || alerts.length === 0) return null;

  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const atRiskCount = alerts.filter(a => a.severity === "warning").length;

  return (
    <Alert
      severity="warning"
      icon={<TbAlertTriangle size={24} />}
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          onClick={onDismiss}
        >
          <TbX size={18} />
        </IconButton>
      }
      sx={{
        borderRadius: "12px",
        bgcolor: theme.palette.mode === "dark" ? "#F59E0B15" : "#FEF3C7",
        border: `1px solid ${theme.palette.mode === "dark" ? "#F59E0B40" : "#F59E0B"}`,
        "& .MuiAlert-icon": {
          color: "#F59E0B",
        },
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: theme.palette.mode === "dark" ? "#F59E0B25" : "#FDE68A",
        },
      }}
      onClick={onFilterAtRisk}
    >
      <AlertTitle sx={{ fontWeight: 700, color: "#D97706" }}>
        Fleet Alert - Action Required
      </AlertTitle>
      <Box sx={{ display: "flex", gap: 3 }}>
        {criticalCount > 0 && (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            🔴 <strong>{criticalCount}</strong> genset{criticalCount > 1 ? "s" : ""} in critical condition
          </Typography>
        )}
        {atRiskCount > 0 && (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            🟠 <strong>{atRiskCount}</strong> genset{atRiskCount > 1 ? "s" : ""} predicted to fail within 7 days
          </Typography>
        )}
      </Box>
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.5, display: "block" }}>
        Click to filter and view affected generators
      </Typography>
    </Alert>
  );
};

export default FleetAlertBanner;
