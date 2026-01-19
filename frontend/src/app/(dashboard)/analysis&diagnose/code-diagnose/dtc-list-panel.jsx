"use client";
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { TbAlertTriangle, TbClock } from "react-icons/tb";

const severityConfig = {
  critical: {
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.1)",
    label: "CRITICAL",
  },
  high: {
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.1)",
    label: "HIGH",
  },
  medium: {
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.1)",
    label: "MEDIUM",
  },
  low: {
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.1)",
    label: "LOW",
  },
};

const DTCListItem = ({ dtc, isSelected, onClick }) => {
  const theme = useTheme();
  const severity = severityConfig[dtc.severity] || severityConfig.medium;

  return (
    <Paper
      elevation={isSelected ? 3 : 0}
      onClick={onClick}
      sx={{
        p: 2,
        cursor: "pointer",
        borderRadius: 2,
        border: isSelected 
          ? `2px solid ${severity.color}` 
          : `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        bgcolor: isSelected 
          ? severity.bgColor 
          : theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: severity.bgColor,
          borderColor: severity.color,
        },
      }}
    >
      {/* Severity Badge */}
      <Chip
        label={severity.label}
        size="small"
        sx={{
          bgcolor: severity.color,
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.65rem",
          height: 20,
          mb: 1,
        }}
      />

      {/* SPN / FMI */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: theme.palette.mode === "dark" ? "#fff" : "#1a1a2e",
            fontFamily: "monospace",
          }}
        >
          SPN {dtc.spn}
        </Typography>
        <Divider orientation="vertical" flexItem />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: theme.palette.mode === "dark" ? "#fff" : "#1a1a2e",
            fontFamily: "monospace",
          }}
        >
          FMI {dtc.fmi}
        </Typography>
      </Stack>

      {/* Description */}
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
          mb: 1,
          lineHeight: 1.4,
        }}
      >
        {dtc.shortDescription}
      </Typography>

      {/* Timestamp */}
      <Stack direction="row" spacing={0.5} alignItems="center">
        <TbClock size={14} color={theme.palette.mode === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} />
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
          }}
        >
          Detected: {dtc.detectedTime}
        </Typography>
      </Stack>
    </Paper>
  );
};

const DTCListPanel = ({ dtcList, selectedDtc, onSelectDtc }) => {
  const theme = useTheme();

  const criticalCount = dtcList.filter((d) => d.severity === "critical").length;
  const highCount = dtcList.filter((d) => d.severity === "high").length;
  const mediumCount = dtcList.filter((d) => d.severity === "medium").length;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: theme.palette.mode === "dark" ? "#fff" : "#1a1a2e",
            mb: 1,
          }}
        >
          Active DTC List
        </Typography>
        
        {/* Summary */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {criticalCount > 0 && (
            <Chip
              icon={<TbAlertTriangle size={14} />}
              label={`${criticalCount} Critical`}
              size="small"
              sx={{
                bgcolor: "rgba(239, 68, 68, 0.1)",
                color: "#EF4444",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          )}
          {highCount > 0 && (
            <Chip
              label={`${highCount} High`}
              size="small"
              sx={{
                bgcolor: "rgba(245, 158, 11, 0.1)",
                color: "#F59E0B",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          )}
          {mediumCount > 0 && (
            <Chip
              label={`${mediumCount} Medium`}
              size="small"
              sx={{
                bgcolor: "rgba(59, 130, 246, 0.1)",
                color: "#3B82F6",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          )}
        </Stack>
      </Box>

      {/* DTC List */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {dtcList.map((dtc) => (
          <DTCListItem
            key={dtc.id}
            dtc={dtc}
            isSelected={selectedDtc?.id === dtc.id}
            onClick={() => onSelectDtc(dtc)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default DTCListPanel;
