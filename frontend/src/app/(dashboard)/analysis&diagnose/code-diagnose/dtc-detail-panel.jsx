"use client";
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
  Button,
  Grid,
  LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  TbAlertTriangle,
  TbCheck,
  TbCpu,
  TbTool,
  TbPackage,
  TbClipboardList,
  TbArrowRight,
  TbChartBar,
  TbTemperature,
  TbEngine,
  TbGauge,
  TbDroplet,
} from "react-icons/tb";

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

// Evidence icon mapping
const evidenceIcons = {
  temperature: <TbTemperature size={16} />,
  rpm: <TbEngine size={16} />,
  load: <TbGauge size={16} />,
  pressure: <TbDroplet size={16} />,
  default: <TbChartBar size={16} />,
};

// Section Card Component
const SectionCard = ({ title, icon, children, color }) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
        height: "100%",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ color: color || (theme.palette.mode === "dark" ? "#fff" : "#1a1a2e") }}>
          {icon}
        </Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: theme.palette.mode === "dark" ? "#fff" : "#1a1a2e",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );
};

// Confidence Bar Component
const ConfidenceBar = ({ value, label }) => {
  const theme = useTheme();
  
  const getColor = () => {
    if (value >= 80) return "#10B981";
    if (value >= 60) return "#F59E0B";
    return "#EF4444";
  };
  
  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: getColor() }}>
          {value}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          "& .MuiLinearProgress-bar": {
            bgcolor: getColor(),
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
};

const DTCDetailPanel = ({ dtc, onGenerateWO }) => {
  const theme = useTheme();

  if (!dtc) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <TbCpu size={64} color={theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"} />
        <Typography
          variant="body1"
          sx={{ color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}
        >
          Select a DTC from the list to view details
        </Typography>
      </Box>
    );
  }

  const severity = severityConfig[dtc.severity] || severityConfig.medium;

  return (
    <Box
      sx={{
        height: "100%",
        overflow: "auto",
        p: 2,
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${severity.bgColor} 0%, transparent 100%)`,
          border: `1px solid ${severity.color}`,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: severity.color,
              color: "#fff",
            }}
          >
            <TbAlertTriangle size={32} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Chip
              label={severity.label}
              size="small"
              sx={{
                bgcolor: severity.color,
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.7rem",
                mb: 1,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.palette.mode === "dark" ? "#fff" : "#1a1a2e",
                fontFamily: "monospace",
                mb: 0.5,
              }}
            >
              SPN {dtc.spn} | FMI {dtc.fmi}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)",
              }}
            >
              {dtc.shortDescription}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {/* Raw Code Section */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Raw Code" icon={<TbCpu size={18} />}>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                  SPN
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                  {dtc.spn}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                  FMI
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                  {dtc.fmi}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                  Source
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {dtc.source}
                </Typography>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>

        {/* Plain Language Translation */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Plain Language Translation" icon={<TbClipboardList size={18} />} color="#3B82F6">
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: theme.palette.mode === "dark" ? "#fff" : "#1a1a2e",
                  lineHeight: 1.6,
                }}
              >
                {dtc.plainLanguage}
              </Typography>
            </Paper>
          </SectionCard>
        </Grid>

        {/* Severity & Risk Context */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Severity & Risk Context" icon={<TbAlertTriangle size={18} />} color={severity.color}>
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" sx={{ color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                  Severity
                </Typography>
                <Chip
                  label={severity.label}
                  size="small"
                  sx={{
                    bgcolor: severity.color,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" sx={{ color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                  Current Risk
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: severity.color }}>
                  {dtc.riskContext}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" sx={{ color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                  Health Index Impact
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#EF4444" }}>
                  {dtc.healthImpact}
                </Typography>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>

        {/* Evidence Panel */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Contextual Evidence" icon={<TbChartBar size={18} />} color="#10B981">
            <Stack spacing={1}>
              {dtc.evidence.map((ev, idx) => (
                <Stack
                  key={idx}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                  }}
                >
                  <Box sx={{ color: ev.isAnomaly ? "#F59E0B" : "#10B981" }}>
                    {evidenceIcons[ev.type] || evidenceIcons.default}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)",
                    }}
                  >
                    {ev.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: ev.isAnomaly ? "#F59E0B" : "#10B981",
                    }}
                  >
                    {ev.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        {/* Root Cause */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Probable Root Cause" icon={<TbTool size={18} />} color="#8B5CF6">
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "rgba(139, 92, 246, 0.1)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.mode === "dark" ? "#fff" : "#1a1a2e",
                  mb: 1,
                }}
              >
                {dtc.rootCause.cause}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                }}
              >
                {dtc.rootCause.description}
              </Typography>
            </Paper>
            <ConfidenceBar value={dtc.rootCause.confidence} label="Diagnosis Confidence" />
          </SectionCard>
        </Grid>

        {/* Recommended Actions */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Recommended Actions" icon={<TbCheck size={18} />} color="#10B981">
            <Stack spacing={1}>
              {dtc.actions.map((action, idx) => (
                <Stack
                  key={idx}
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                >
                  <Box
                    sx={{
                      p: 0.3,
                      borderRadius: "50%",
                      bgcolor: "#10B981",
                      color: "#fff",
                      mt: 0.3,
                    }}
                  >
                    <TbCheck size={12} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)",
                    }}
                  >
                    {action}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            
            {/* Spare Part Recommendation */}
            {dtc.sparePart && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  mt: 2,
                  borderRadius: 1.5,
                  bgcolor: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <TbPackage size={18} color="#F59E0B" />
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                      Recommended Spare Part
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dtc.sparePart.code} — {dtc.sparePart.name}
                    </Typography>
                    <Chip
                      label={dtc.sparePart.availability}
                      size="small"
                      sx={{
                        mt: 0.5,
                        height: 18,
                        fontSize: "0.65rem",
                        bgcolor: dtc.sparePart.availability === "In Stock" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                        color: dtc.sparePart.availability === "In Stock" ? "#10B981" : "#EF4444",
                      }}
                    />
                  </Box>
                </Stack>
              </Paper>
            )}
          </SectionCard>
        </Grid>

        {/* Work Order Integration */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
              bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Stack direction="row" spacing={3} flexWrap="wrap">
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                      WO Type
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Predictive Maintenance
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                      Priority
                    </Typography>
                    <Chip
                      label={severity.label}
                      size="small"
                      sx={{
                        ml: 1,
                        bgcolor: severity.color,
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        height: 20,
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                      Suggested SLA
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dtc.suggestedSla}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                  <Button
                    variant="contained"
                    startIcon={<TbClipboardList size={18} />}
                    endIcon={<TbArrowRight size={18} />}
                    onClick={() => onGenerateWO(dtc)}
                    sx={{
                      bgcolor: "#0075FF",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": { bgcolor: "#0060CC" },
                    }}
                  >
                    Generate Work Order
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DTCDetailPanel;
