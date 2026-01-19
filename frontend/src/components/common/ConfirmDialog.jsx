"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

/**
 * ConfirmDialog Component
 * Reusable confirmation dialog for destructive and important actions
 */

// Severity configurations
const SEVERITY_CONFIG = {
  warning: {
    icon: <WarningAmberIcon sx={{ fontSize: 48 }} />,
    color: "#F59E0B",
    bgcolor: "#FEF3C7",
  },
  error: {
    icon: <ErrorOutlineIcon sx={{ fontSize: 48 }} />,
    color: "#EF4444",
    bgcolor: "#FEE2E2",
  },
  info: {
    icon: <InfoOutlinedIcon sx={{ fontSize: 48 }} />,
    color: "#2F80ED",
    bgcolor: "#EAF4FF",
  },
  success: {
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 48 }} />,
    color: "#059669",
    bgcolor: "#D1FAE5",
  },
};

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  severity = "warning",
  loading = false,
  confirmColor,
  children,
}) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.warning;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  const getConfirmButtonColor = () => {
    if (confirmColor) return confirmColor;
    if (severity === "error") return "#EF4444";
    if (severity === "warning") return "#F59E0B";
    if (severity === "success") return "#059669";
    return "#2F80ED";
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          backgroundColor: "#FFFFFF",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 0,
          backgroundColor: "#FFFFFF",
        }}
      >
        <Typography variant="h6" fontWeight={600} color="#1E293B">
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{
            color: "#94A3B8",
            "&:hover": { bgcolor: "#F1F5F9" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: "#FFFFFF" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            py: 2,
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: config.bgcolor,
              color: config.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            {config.icon}
          </Box>

          {/* Message */}
          <Typography variant="body1" color="#64748B" sx={{ mb: 2 }}>
            {message}
          </Typography>

          {/* Additional content */}
          {children}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0, backgroundColor: "#FFFFFF" }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            flex: 1,
            borderColor: "#E2E8F0",
            color: "#64748B",
            "&:hover": {
              borderColor: "#CBD5E1",
              bgcolor: "#F8FAFC",
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          sx={{
            flex: 1,
            bgcolor: getConfirmButtonColor(),
            "&:hover": {
              bgcolor: getConfirmButtonColor(),
              filter: "brightness(0.9)",
            },
          }}
          startIcon={
            loading && <CircularProgress size={18} color="inherit" />
          }
        >
          {loading ? "Processing..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
