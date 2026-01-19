"use client";
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
  Divider,
} from "@mui/material";
import {
  Error as HighRiskIcon,
  Warning as MediumRiskIcon,
  CheckCircle as LowRiskIcon,
  TrendingUp as TrendIcon,
  Build as ActionIcon,
  Analytics as InsightIcon,
} from "@mui/icons-material";

const PredictiveInsights = ({ data, checksheetType }) => {
  const { riskLevel, drivers, recommendations, insights } = data;

  const getRiskConfig = (level) => {
    switch (level) {
      case "HIGH":
        return {
          color: "#DC2626",
          bg: "#FEE2E2",
          icon: HighRiskIcon,
          label: "HIGH RISK",
          severity: "error",
        };
      case "MEDIUM":
        return {
          color: "#F59E0B",
          bg: "#FEF3C7",
          icon: MediumRiskIcon,
          label: "MEDIUM RISK",
          severity: "warning",
        };
      case "LOW":
        return {
          color: "#10B981",
          bg: "#D1FAE5",
          icon: LowRiskIcon,
          label: "LOW RISK",
          severity: "success",
        };
      default:
        return {
          color: "#6B7280",
          bg: "#F3F4F6",
          icon: LowRiskIcon,
          label: "NORMAL",
          severity: "info",
        };
    }
  };

  const riskConfig = getRiskConfig(riskLevel);
  const RiskIcon = riskConfig.icon;

  return (
    <Box>
      {/* Quality Risk Indicator */}
      <Paper
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "16px",
          border: `2px solid ${riskConfig.color}`,
          p: 3,
          mb: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <RiskIcon sx={{ fontSize: 36, color: riskConfig.color }} />
          <Box>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#64748B",
                mb: 0.5,
              }}
            >
              Quality Risk Indicator (QRI)
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography
                sx={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Risk Level:
              </Typography>
              <Chip
                label={riskConfig.label}
                sx={{
                  bgcolor: riskConfig.bg,
                  color: riskConfig.color,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  height: 32,
                  px: 1,
                  borderRadius: "8px",
                }}
              />
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        {/* Risk Drivers */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <TrendIcon sx={{ fontSize: 20, color: "#3B82F6" }} />
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Risk Drivers
            </Typography>
          </Stack>
          <List dense>
            {drivers?.map((driver, index) => (
              <ListItem
                key={index}
                sx={{
                  bgcolor: "#F9FAFB",
                  borderRadius: "8px",
                  mb: 1,
                  border: "1px solid #E5E7EB",
                }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: riskConfig.color,
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={driver}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#374151",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* Recommended Actions */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <ActionIcon sx={{ fontSize: 20, color: "#10B981" }} />
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Recommended Actions
            </Typography>
          </Stack>
          <List>
            {recommendations?.map((action, index) => (
              <ListItem
                key={index}
                sx={{
                  bgcolor: "#ECFDF5",
                  borderRadius: "8px",
                  mb: 1.5,
                  border: "1px solid #A7F3D0",
                  py: 1.5,
                }}
              >
                <ListItemIcon>
                  <Chip
                    label={index + 1}
                    size="small"
                    sx={{
                      bgcolor: "#10B981",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      minWidth: 28,
                      height: 28,
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={action.title}
                  secondary={action.description}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#065F46",
                  }}
                  secondaryTypographyProps={{
                    fontSize: "0.8rem",
                    color: "#047857",
                    mt: 0.5,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>

      {/* AI-Generated Insights */}
      <Paper
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "16px",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          p: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
          <InsightIcon sx={{ fontSize: 22, color: "#8B5CF6" }} />
          <Typography
            sx={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            Insight Panel
          </Typography>
          <Chip
            label="AI-Powered"
            size="small"
            sx={{
              bgcolor: "#F3E8FF",
              color: "#7C3AED",
              fontWeight: 600,
              fontSize: "0.7rem",
              height: 22,
            }}
          />
        </Stack>

        <Stack spacing={2}>
          {insights?.map((insight, index) => {
            // Custom color mapping for better readability
            const severityConfig = {
              error: {
                bg: "#FEF2F2",
                border: "#FCA5A5",
                titleColor: "#991B1B",
                textColor: "#7F1D1D",
                iconBg: "#FEE2E2",
                iconColor: "#DC2626",
              },
              warning: {
                bg: "#FFFBEB",
                border: "#FCD34D",
                titleColor: "#92400E",
                textColor: "#78350F",
                iconBg: "#FEF3C7",
                iconColor: "#F59E0B",
              },
              success: {
                bg: "#F0FDF4",
                border: "#86EFAC",
                titleColor: "#14532D",
                textColor: "#15803D",
                iconBg: "#D1FAE5",
                iconColor: "#10B981",
              },
              info: {
                bg: "#EFF6FF",
                border: "#93C5FD",
                titleColor: "#1E3A8A",
                textColor: "#1E40AF",
                iconBg: "#DBEAFE",
                iconColor: "#3B82F6",
              },
            };

            const config = severityConfig[insight.severity || "info"];

            return (
              <Box
                key={index}
                sx={{
                  bgcolor: config.bg,
                  border: `1.5px solid ${config.border}`,
                  borderRadius: "12px",
                  p: 2.5,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "8px",
                      bgcolor: config.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <InsightIcon sx={{ fontSize: 20, color: config.iconColor }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        mb: 0.75,
                        color: config.titleColor,
                        lineHeight: 1.4,
                      }}
                    >
                      {insight.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        lineHeight: 1.6,
                        color: config.textColor,
                      }}
                    >
                      {insight.message}
                    </Typography>
                    {insight.recommendation && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: "rgba(255, 255, 255, 0.7)",
                          borderRadius: "8px",
                          border: "1px solid rgba(0, 0, 0, 0.08)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "#374151",
                            mb: 0.75,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          💡 Recommendation:
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.8rem",
                            color: "#4B5563",
                            lineHeight: 1.6,
                          }}
                        >
                          {insight.recommendation}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>

        {/* Example insights based on checksheet type */}
        {insights?.length === 0 && (
          <Box
            sx={{
              bgcolor: "#EFF6FF",
              border: "1.5px solid #93C5FD",
              borderRadius: "12px",
              p: 2.5,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  bgcolor: "#DBEAFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <InsightIcon sx={{ fontSize: 20, color: "#3B82F6" }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    mb: 0.75,
                    color: "#1E3A8A",
                  }}
                >
                  No significant patterns detected
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    lineHeight: 1.6,
                    color: "#1E40AF",
                  }}
                >
                  Current quality metrics are within normal operating parameters. Continue monitoring
                  for emerging trends.
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PredictiveInsights;
