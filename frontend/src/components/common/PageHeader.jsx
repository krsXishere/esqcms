"use client";
import React from "react";
import { Box, Typography, Button, IconButton, Tooltip, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

/**
 * PageHeader Component
 * Reusable header for all pages with title, subtitle, back button, and actions
 */
const PageHeader = ({
  title,
  subtitle,
  backUrl,
  onBack,
  showBack = false,
  actions,
  badge,
  children,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
      }}
    >
      {/* Left Section - Title & Back */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {showBack && (
          <Tooltip title="Go back">
            <IconButton
              onClick={handleBack}
              sx={{
                bgcolor: "#EAF4FF",
                color: "#2F80ED",
                "&:hover": {
                  bgcolor: "#D6E9FF",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        )}

        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant="h5"
              component="h1"
              fontWeight={700}
              color="#1E293B"
            >
              {title}
            </Typography>
            {badge && (
              <Chip
                label={badge.label}
                size="small"
                sx={{
                  bgcolor: badge.bgcolor || "#EAF4FF",
                  color: badge.color || "#2F80ED",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              />
            )}
          </Box>
          {subtitle && (
            <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right Section - Actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        {actions}
        {children}
      </Box>
    </Box>
  );
};

export default PageHeader;
