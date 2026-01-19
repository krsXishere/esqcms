"use client";
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AddIcon from "@mui/icons-material/Add";

/**
 * EmptyState Component
 * Placeholder for empty data states
 */

// Variant configurations
const VARIANT_CONFIG = {
  default: {
    icon: <InboxIcon sx={{ fontSize: 64 }} />,
    color: "#94A3B8",
    bgcolor: "#F1F5F9",
  },
  search: {
    icon: <SearchOffIcon sx={{ fontSize: 64 }} />,
    color: "#94A3B8",
    bgcolor: "#F1F5F9",
  },
  error: {
    icon: <ErrorOutlineIcon sx={{ fontSize: 64 }} />,
    color: "#EF4444",
    bgcolor: "#FEE2E2",
  },
};

const EmptyState = ({
  variant = "default",
  icon,
  message = "No data found",
  subMessage = "Try adjusting your filters or search criteria",
  actionLabel,
  onAction,
  showAction = false,
  height = 300,
}) => {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 6,
        px: 3,
        minHeight: height,
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          bgcolor: config.bgcolor,
          color: config.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        {icon || config.icon}
      </Box>

      {/* Message */}
      <Typography
        variant="h6"
        fontWeight={600}
        color="#1E293B"
        sx={{ mb: 1 }}
      >
        {message}
      </Typography>

      {/* Sub Message */}
      {subMessage && (
        <Typography
          variant="body2"
          color="#64748B"
          sx={{ mb: 3, maxWidth: 400 }}
        >
          {subMessage}
        </Typography>
      )}

      {/* Action Button */}
      {showAction && actionLabel && onAction && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAction}
          sx={{
            bgcolor: "#2F80ED",
            "&:hover": { bgcolor: "#1D6FD3" },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
