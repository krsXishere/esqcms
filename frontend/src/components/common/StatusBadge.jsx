"use client";
import React from "react";
import { Chip } from "@mui/material";

/**
 * StatusBadge Component
 * Reusable status indicator with predefined color mappings
 */

// Status color configurations
const STATUS_CONFIGS = {
  // Checksheet statuses
  pending: {
    label: "Pending",
    bgcolor: "#F1F5F9",
    color: "#64748B",
  },
  revision: {
    label: "Revision",
    bgcolor: "#FEF3C7",
    color: "#D97706",
  },
  checked: {
    label: "Checked",
    bgcolor: "#DBEAFE",
    color: "#2563EB",
  },
  approved: {
    label: "Approved",
    bgcolor: "#D1FAE5",
    color: "#059669",
  },
  rejected: {
    label: "Rejected",
    bgcolor: "#FEE2E2",
    color: "#DC2626",
  },

  // QC Result statuses
  ok: {
    label: "OK",
    bgcolor: "#D1FAE5",
    color: "#059669",
  },
  ng: {
    label: "NG",
    bgcolor: "#FEE2E2",
    color: "#DC2626",
  },

  // User statuses
  active: {
    label: "Active",
    bgcolor: "#D1FAE5",
    color: "#059669",
  },
  inactive: {
    label: "Inactive",
    bgcolor: "#F1F5F9",
    color: "#64748B",
  },

  // Checksheet types
  dir: {
    label: "DIR",
    bgcolor: "#E0E7FF",
    color: "#4F46E5",
  },
  fi: {
    label: "FI",
    bgcolor: "#FCE7F3",
    color: "#DB2777",
  },

  // Template statuses
  draft: {
    label: "Draft",
    bgcolor: "#FEF3C7",
    color: "#D97706",
  },
  published: {
    label: "Published",
    bgcolor: "#D1FAE5",
    color: "#059669",
  },

  // Priority levels
  low: {
    label: "Low",
    bgcolor: "#F1F5F9",
    color: "#64748B",
  },
  medium: {
    label: "Medium",
    bgcolor: "#FEF3C7",
    color: "#D97706",
  },
  high: {
    label: "High",
    bgcolor: "#FED7AA",
    color: "#EA580C",
  },
  critical: {
    label: "Critical",
    bgcolor: "#FEE2E2",
    color: "#DC2626",
  },

  // Default
  default: {
    label: "Unknown",
    bgcolor: "#F1F5F9",
    color: "#64748B",
  },
};

const StatusBadge = ({
  status,
  label,
  size = "small",
  variant = "filled",
  customConfig,
  sx = {},
}) => {
  // Get config from predefined or custom
  const statusKey = status?.toLowerCase().replace(/\s+/g, "-");
  const config = customConfig || STATUS_CONFIGS[statusKey] || STATUS_CONFIGS.default;

  return (
    <Chip
      label={label || config.label}
      size={size}
      variant={variant}
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        fontWeight: 600,
        fontSize: size === "small" ? 11 : 12,
        height: size === "small" ? 24 : 28,
        borderRadius: 1,
        "& .MuiChip-label": {
          px: 1,
        },
        ...sx,
      }}
    />
  );
};

// Export status configs for external use
export { STATUS_CONFIGS };
export default StatusBadge;
