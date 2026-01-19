"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  LinearProgress,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  ReferenceLine,
} from "recharts";
import { FaWrench, FaCheckCircle, FaExclamationTriangle, FaCog, FaChartLine, FaClipboardList, FaLightbulb, FaRobot, FaBrain } from "react-icons/fa";
import { IoWarning, IoAlertCircle, IoCheckmarkCircle, IoTime, IoSpeedometer } from "react-icons/io5";
import { MdOutlineEngineering, MdTimeline, MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { HiLightningBolt } from "react-icons/hi";
import { BiTargetLock } from "react-icons/bi";

// =============================================
// DUMMY DATA
// =============================================

const GENSET_OPTIONS = [
  { id: 1, name: "Generator P1901 - MTU", status: "warning" },
  { id: 2, name: "Generator P1902 - Caterpillar", status: "healthy" },
];

const HEALTH_INDEX_DATA = {
  1: { score: 72, status: "Warning", trend: "declining", lastUpdate: "2 min ago" },
  2: { score: 91, status: "Healthy", trend: "stable", lastUpdate: "1 min ago" },
};

const PREDICTIVE_ALERTS = {
  1: [
    {
      id: 1,
      title: "Cooling System Degradation Detected",
      confidence: 92,
      estimatedTimeToFailure: "5-7 days",
      severity: "high",
      detectedAt: "2026-01-12 08:30:00",
      metric: "Coolant Temperature",
      trend: "+15% dari baseline",
    },
    {
      id: 2,
      title: "Oil Pressure Anomaly Pattern",
      confidence: 78,
      estimatedTimeToFailure: "10-14 days",
      severity: "medium",
      detectedAt: "2026-01-11 14:20:00",
      metric: "Oil Pressure Sensor",
      trend: "-8% dari baseline",
    },
  ],
  2: [
    {
      id: 1,
      title: "Minor Fuel Consumption Variance",
      confidence: 65,
      estimatedTimeToFailure: "21+ days",
      severity: "low",
      detectedAt: "2026-01-10 10:15:00",
      metric: "Average Fuel Consumption",
      trend: "+5% dari baseline",
    },
  ],
};

const ACTIVE_DTC = {
  1: [
    { spn: 110, fmi: 18, description: "Coolant Temperature Above Normal", severity: "high", timestamp: "2026-01-12 09:15:00" },
    { spn: 100, fmi: 3, description: "Oil Pressure Signal Range", severity: "medium", timestamp: "2026-01-11 16:45:00" },
  ],
  2: [],
};

// Generate trend data for charts
const generateTrendData = (baseValue, variance, days = 12, degrading = false) => {
  const data = [];
  const now = new Date("2026-01-12");
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const degradationFactor = degrading ? (days - i) * 0.8 : 0;
    const value = baseValue + degradationFactor + (Math.random() - 0.5) * variance;
    data.push({
      date: date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      value: Math.round(value * 10) / 10,
      baseline: baseValue,
      upperLimit: baseValue + variance * 1.5,
      lowerLimit: baseValue - variance * 1.5,
    });
  }
  return data;
};

const COOLANT_TEMP_DATA = {
  1: generateTrendData(85, 5, 12, true),
  2: generateTrendData(82, 3, 12, false),
};

const OIL_PRESSURE_DATA = {
  1: generateTrendData(4.5, 0.3, 12, false),
  2: generateTrendData(4.6, 0.2, 12, false),
};

const RPM_DATA = {
  1: generateTrendData(1500, 30, 12, false),
  2: generateTrendData(1500, 25, 12, false),
};

const ELECTRICAL_DATA = {
  1: [
    { phase: "L1", current: 152, voltage: 231, pf: 0.85 },
    { phase: "L2", current: 148, voltage: 229, pf: 0.86 },
    { phase: "L3", current: 155, voltage: 232, pf: 0.84 },
  ],
  2: [
    { phase: "L1", current: 145, voltage: 230, pf: 0.87 },
    { phase: "L2", current: 144, voltage: 231, pf: 0.88 },
    { phase: "L3", current: 146, voltage: 230, pf: 0.87 },
  ],
};

const DIAGNOSIS_DATA = {
  1: {
    probableFailure: "Thermostat Stuck Closed",
    confidence: 92,
    evidence: [
      "Coolant temperature ↑ 15% dari baseline",
      "RPM stabil di 1500 RPM",
      "Load dalam range normal (75%)",
      "DTC SPN 110 FMI 18 aktif",
      "Trend suhu naik konsisten 3 hari terakhir",
    ],
    possibleCauses: [
      { cause: "Thermostat malfunction", probability: 85 },
      { cause: "Coolant pump degradation", probability: 45 },
      { cause: "Radiator blockage", probability: 30 },
    ],
  },
  2: {
    probableFailure: "No Critical Issue Detected",
    confidence: 95,
    evidence: [
      "Semua parameter dalam range normal",
      "Tidak ada DTC aktif",
      "Trend stabil 7 hari terakhir",
    ],
    possibleCauses: [],
  },
};

const RECOMMENDED_ACTIONS = {
  1: {
    actions: [
      { action: "Inspeksi thermostat", priority: "high", checked: false },
      { action: "Periksa sirkulasi coolant", priority: "high", checked: false },
      { action: "Cek kondisi radiator", priority: "medium", checked: false },
      { action: "Siapkan spare part: TH-404 Thermostat", priority: "high", checked: false },
    ],
    recommendedTime: "Dalam 48 jam",
    estimatedDuration: "2-3 jam",
    estimatedCost: "Rp 2.500.000",
  },
  2: {
    actions: [
      { action: "Lanjutkan monitoring rutin", priority: "low", checked: true },
      { action: "Schedule preventive maintenance", priority: "low", checked: false },
    ],
    recommendedTime: "Sesuai jadwal PM",
    estimatedDuration: "1 jam",
    estimatedCost: "Rp 500.000",
  },
};

const TIMELINE_DATA = {
  1: [
    { step: "Detection", timestamp: "12 Jan 08:30", status: "completed", detail: "Anomaly detected" },
    { step: "Analysis", timestamp: "12 Jan 08:35", status: "completed", detail: "Pattern analyzed" },
    { step: "Diagnosis", timestamp: "12 Jan 08:40", status: "completed", detail: "92% confidence" },
    { step: "Recommendation", timestamp: "12 Jan 08:45", status: "completed", detail: "Actions generated" },
    { step: "Work Order", timestamp: "-", status: "pending", detail: "Awaiting creation" },
  ],
  2: [
    { step: "Detection", timestamp: "12 Jan 09:00", status: "completed", detail: "Routine scan" },
    { step: "Analysis", timestamp: "12 Jan 09:05", status: "completed", detail: "All normal" },
    { step: "Diagnosis", timestamp: "-", status: "skipped", detail: "No issue" },
    { step: "Recommendation", timestamp: "-", status: "skipped", detail: "N/A" },
    { step: "Work Order", timestamp: "-", status: "skipped", detail: "N/A" },
  ],
};

const HISTORICAL_EVENTS = [
  { date: "2026-01-05", issue: "High Vibration Motor", action: "Bearing replacement", outcome: "Prevented", savings: "Rp 15.000.000" },
  { date: "2025-12-28", issue: "Oil Pressure Low", action: "Oil pump repair", outcome: "Prevented", savings: "Rp 8.500.000" },
  { date: "2025-12-15", issue: "Fuel Filter Clogged", action: "Filter replacement", outcome: "Prevented", savings: "Rp 3.200.000" },
  { date: "2025-12-01", issue: "Coolant Leak", action: "Hose replacement", outcome: "Prevented", savings: "Rp 5.800.000" },
];

// =============================================
// COMPONENTS
// =============================================

// Health Index Gauge Component
const HealthIndexGauge = ({ score, status, trend }) => {
  const getColor = (score) => {
    if (score >= 80) return "#00C853";
    if (score >= 60) return "#FFC400";
    return "#FF1744";
  };

  const getStatusColor = (status) => {
    if (status === "Healthy") return "success";
    if (status === "Warning") return "warning";
    return "error";
  };

  const color = getColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
      <Box sx={{ position: "relative", width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" fontWeight="bold" color={color}>
            {score}
          </Typography>
        </Box>
      </Box>
      <Box>
        <Chip
          label={status}
          color={getStatusColor(status)}
          size="medium"
          sx={{ fontWeight: "bold", mb: 1 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {trend === "declining" ? <MdTrendingDown color="#FF1744" /> : <MdTrendingUp color="#00C853" />}
          Trend: {trend}
        </Typography>
      </Box>
    </Box>
  );
};

// Predictive Alert Card Component
const PredictiveAlertCard = ({ alert }) => {
  const getSeverityColor = (severity) => {
    if (severity === "high") return { bg: "rgba(255,23,68,0.1)", border: "#FF1744", text: "#FF1744" };
    if (severity === "medium") return { bg: "rgba(255,196,0,0.1)", border: "#FFC400", text: "#FFC400" };
    return { bg: "rgba(0,200,83,0.1)", border: "#00C853", text: "#00C853" };
  };

  const colors = getSeverityColor(alert.severity);

  return (
    <Card
      sx={{
        mb: 2,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <IoWarning size={24} color={colors.text} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" color={colors.text}>
              {alert.title}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
              <Chip
                size="small"
                label={`Confidence: ${alert.confidence}%`}
                sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              />
              <Chip
                size="small"
                icon={<IoTime />}
                label={`TTF: ${alert.estimatedTimeToFailure}`}
                sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {alert.metric}: {alert.trend}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// DTC Card Component
const DTCCard = ({ dtc }) => {
  const getSeverityIcon = (severity) => {
    if (severity === "high") return <IoAlertCircle color="#FF1744" />;
    if (severity === "medium") return <IoWarning color="#FFC400" />;
    return <IoCheckmarkCircle color="#00C853" />;
  };

  return (
    <Card sx={{ mb: 1.5, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 2 }}>
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {getSeverityIcon(dtc.severity)}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              SPN {dtc.spn} FMI {dtc.fmi}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {dtc.description}
            </Typography>
          </Box>
          <Chip size="small" label={dtc.severity} color={dtc.severity === "high" ? "error" : "warning"} />
        </Box>
      </CardContent>
    </Card>
  );
};

// Diagnosis Panel Component
const DiagnosisPanel = ({ diagnosis }) => {
  return (
    <Card sx={{ backgroundColor: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar sx={{ backgroundColor: "#8B5CF6" }}>
            <FaBrain />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            AI Diagnosis
          </Typography>
          <Chip label={`${diagnosis.confidence}% Confidence`} color="secondary" size="small" />
        </Box>

        <Typography variant="subtitle1" fontWeight="bold" color="warning.main" sx={{ mb: 2 }}>
          Probable Failure: {diagnosis.probableFailure}
        </Typography>

        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          Evidence:
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {diagnosis.evidence.map((item, idx) => (
            <Typography component="li" variant="body2" key={idx} color="text.secondary" sx={{ mb: 0.5 }}>
              {item}
            </Typography>
          ))}
        </Box>

        {diagnosis.possibleCauses.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
              Possible Causes:
            </Typography>
            {diagnosis.possibleCauses.map((cause, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2">{cause.cause}</Typography>
                  <Typography variant="body2" fontWeight="bold">{cause.probability}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={cause.probability}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: cause.probability > 70 ? "#FF1744" : cause.probability > 50 ? "#FFC400" : "#00C853",
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Recommended Actions Component
const RecommendedActionsPanel = ({ recommendations }) => {
  const getPriorityColor = (priority) => {
    if (priority === "high") return "error";
    if (priority === "medium") return "warning";
    return "success";
  };

  return (
    <Card sx={{ backgroundColor: "rgba(0,200,83,0.1)", border: "1px solid rgba(0,200,83,0.3)", borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar sx={{ backgroundColor: "#00C853" }}>
            <FaClipboardList />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            Recommended Actions
          </Typography>
        </Box>

        {recommendations.actions.map((item, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              mb: 1,
              backgroundColor: "rgba(255,255,255,0.03)",
              borderRadius: 1,
            }}
          >
            {item.checked ? (
              <FaCheckCircle color="#00C853" />
            ) : (
              <Box sx={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderRadius: "4px" }} />
            )}
            <Typography variant="body2" sx={{ flex: 1, textDecoration: item.checked ? "line-through" : "none" }}>
              {item.action}
            </Typography>
            <Chip size="small" label={item.priority} color={getPriorityColor(item.priority)} />
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">Recommended Time</Typography>
            <Typography variant="body2" fontWeight="bold">{recommendations.recommendedTime}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">Est. Duration</Typography>
            <Typography variant="body2" fontWeight="bold">{recommendations.estimatedDuration}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">Est. Cost</Typography>
            <Typography variant="body2" fontWeight="bold">{recommendations.estimatedCost}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Timeline Component
const InsightTimeline = ({ timeline }) => {
  const getStatusStyle = (status) => {
    if (status === "completed") return { bg: "#00C853", border: "#00C853" };
    if (status === "pending") return { bg: "transparent", border: "#FFC400" };
    return { bg: "transparent", border: "rgba(255,255,255,0.3)" };
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2, px: 1 }}>
      {timeline.map((step, idx) => (
        <React.Fragment key={idx}>
          <Box sx={{ textAlign: "center", minWidth: 100 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: getStatusStyle(step.status).bg,
                border: `3px solid ${getStatusStyle(step.status).border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1,
              }}
            >
              {step.status === "completed" && <FaCheckCircle color="#fff" />}
              {step.status === "pending" && <IoTime color="#FFC400" />}
            </Box>
            <Typography variant="caption" fontWeight="bold" display="block">
              {step.step}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {step.timestamp}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {step.detail}
            </Typography>
          </Box>
          {idx < timeline.length - 1 && (
            <Box
              sx={{
                flex: 1,
                height: 3,
                backgroundColor: step.status === "completed" ? "#00C853" : "rgba(255,255,255,0.1)",
                mx: 1,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

// Chart Tooltip Component
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: "rgba(0,0,0,0.9)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 1,
          p: 1.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {payload.map((entry, idx) => (
          <Typography key={idx} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

// =============================================
// MAIN CONTAINER
// =============================================

const PredictiveMaintenanceContainer = () => {
  const theme = useTheme();
  const [selectedGenset, setSelectedGenset] = useState(1);
  const [showCreateWO, setShowCreateWO] = useState(false);

  const healthData = HEALTH_INDEX_DATA[selectedGenset];
  const alerts = PREDICTIVE_ALERTS[selectedGenset];
  const dtcList = ACTIVE_DTC[selectedGenset];
  const diagnosis = DIAGNOSIS_DATA[selectedGenset];
  const recommendations = RECOMMENDED_ACTIONS[selectedGenset];
  const timeline = TIMELINE_DATA[selectedGenset];
  const coolantData = COOLANT_TEMP_DATA[selectedGenset];
  const oilPressureData = OIL_PRESSURE_DATA[selectedGenset];
  const rpmData = RPM_DATA[selectedGenset];
  const electricalData = ELECTRICAL_DATA[selectedGenset];

  return (
    <Box sx={{ p: 3 }}>
      {/* ===== HEADER SECTION ===== */}
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(139,92,246,0.2) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ py: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, backgroundColor: "#2563eb" }}>
                  <MdOutlineEngineering size={32} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    Predictive Maintenance
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 250, mt: 1 }}>
                    <Select
                      value={selectedGenset}
                      onChange={(e) => setSelectedGenset(e.target.value)}
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        "& .MuiSelect-select": { py: 1 },
                      }}
                    >
                      {GENSET_OPTIONS.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HealthIndexGauge
                  score={healthData.score}
                  status={healthData.status}
                  trend={healthData.trend}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" color="text.secondary">
                  Last Update
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {healthData.lastUpdate}
                </Typography>
                <Chip
                  icon={<FaRobot />}
                  label="AI-Powered Analysis"
                  size="small"
                  sx={{ mt: 1, backgroundColor: "rgba(139,92,246,0.2)" }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ===== MAIN CONTENT ===== */}
      <Grid container spacing={3}>
        {/* LEFT PANEL - Insights */}
        <Grid item xs={12} md={4}>
          {/* Active Predictive Alerts */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <IoWarning color="#FFC400" /> Active Predictive Alerts
          </Typography>
          {alerts.length > 0 ? (
            alerts.map((alert) => <PredictiveAlertCard key={alert.id} alert={alert} />)
          ) : (
            <Card sx={{ mb: 2, backgroundColor: "rgba(0,200,83,0.1)", border: "1px solid rgba(0,200,83,0.3)" }}>
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <IoCheckmarkCircle size={40} color="#00C853" />
                <Typography variant="body1" sx={{ mt: 1 }}>No Active Alerts</Typography>
                <Typography variant="body2" color="text.secondary">All systems operating normally</Typography>
              </CardContent>
            </Card>
          )}

          {/* Active DTC */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3, display: "flex", alignItems: "center", gap: 1 }}>
            <FaCog /> Active DTC Codes
          </Typography>
          {dtcList.length > 0 ? (
            dtcList.map((dtc, idx) => <DTCCard key={idx} dtc={dtc} />)
          ) : (
            <Card sx={{ backgroundColor: "rgba(0,200,83,0.1)", border: "1px solid rgba(0,200,83,0.3)" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <IoCheckmarkCircle size={24} color="#00C853" />
                <Typography variant="body2" sx={{ mt: 1 }}>No Active DTC</Typography>
              </CardContent>
            </Card>
          )}

          {/* Diagnosis Panel */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3, display: "flex", alignItems: "center", gap: 1 }}>
            <FaBrain /> AI Diagnosis
          </Typography>
          <DiagnosisPanel diagnosis={diagnosis} />
        </Grid>

        {/* RIGHT PANEL - Charts & Actions */}
        <Grid item xs={12} md={8}>
          {/* Trend Charts */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <FaChartLine /> Trend Degradation Analysis
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Coolant Temperature Chart */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    Coolant Temperature (°C)
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={coolantData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.5)" />
                      <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.5)" />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <ReferenceLine y={95} stroke="#FF1744" strokeDasharray="5 5" label={{ value: "High", fill: "#FF1744", fontSize: 10 }} />
                      <ReferenceLine y={85} stroke="#00C853" strokeDasharray="5 5" label={{ value: "Baseline", fill: "#00C853", fontSize: 10 }} />
                      <Area type="monotone" dataKey="value" stroke="#FFC400" fill="rgba(255,196,0,0.3)" name="Temperature" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Oil Pressure Chart */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    Oil Pressure (Bar)
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={oilPressureData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.5)" />
                      <YAxis domain={[3, 6]} tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.5)" />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <ReferenceLine y={5.5} stroke="#FF1744" strokeDasharray="5 5" />
                      <ReferenceLine y={3.5} stroke="#FF1744" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="value" stroke="#00C853" strokeWidth={2} dot={false} name="Pressure" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* RPM Chart */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    Engine RPM
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={rpmData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.5)" />
                      <YAxis domain={[1400, 1600]} tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.5)" />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <ReferenceLine y={1500} stroke="#2563eb" strokeDasharray="5 5" label={{ value: "Rated", fill: "#2563eb", fontSize: 10 }} />
                      <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} dot={false} name="RPM" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Electrical Data */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    Electrical Parameters (3-Phase)
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Phase</TableCell>
                          <TableCell align="right" sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Current (A)</TableCell>
                          <TableCell align="right" sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Voltage (V)</TableCell>
                          <TableCell align="right" sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>PF</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {electricalData.map((row) => (
                          <TableRow key={row.phase}>
                            <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{row.phase}</TableCell>
                            <TableCell align="right" sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{row.current}</TableCell>
                            <TableCell align="right" sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{row.voltage}</TableCell>
                            <TableCell align="right" sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{row.pf}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ mt: 2, display: "flex", justifyContent: "space-around" }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">Frequency</Typography>
                      <Typography variant="body1" fontWeight="bold">50.1 Hz</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">kVA Total</Typography>
                      <Typography variant="body1" fontWeight="bold">105.2 kVA</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">Load</Typography>
                      <Typography variant="body1" fontWeight="bold">75%</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recommended Actions */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <FaLightbulb color="#FFC400" /> Recommended Actions
          </Typography>
          <RecommendedActionsPanel recommendations={recommendations} />
        </Grid>
      </Grid>

      {/* ===== TIMELINE SECTION ===== */}
      <Card sx={{ mt: 3, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <MdTimeline /> Insight → Action Timeline
          </Typography>
          <InsightTimeline timeline={timeline} />
        </CardContent>
      </Card>

      {/* ===== WORK ORDER SECTION ===== */}
      <Card sx={{ mt: 3, backgroundColor: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 48, height: 48, backgroundColor: "#2563eb" }}>
                  <FaWrench />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Work Order Integration</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {alerts.length > 0
                      ? "Create a predictive maintenance work order based on AI analysis"
                      : "No active issues requiring work order"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
              {alerts.length > 0 ? (
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FaWrench />}
                    onClick={() => setShowCreateWO(true)}
                  >
                    Create Work Order
                  </Button>
                </Stack>
              ) : (
                <Chip label="No Action Required" color="success" />
              )}
            </Grid>
          </Grid>

          {showCreateWO && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary">WO Number</Typography>
                  <Typography variant="body1" fontWeight="bold">WO-PM-2026-0112-001</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography variant="body1" fontWeight="bold">Predictive Maintenance</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary">Priority</Typography>
                  <Chip label="High" color="error" size="small" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip label="Draft" color="warning" size="small" />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                <Button variant="outlined" color="inherit" onClick={() => setShowCreateWO(false)}>
                  Cancel
                </Button>
                <Button variant="contained" color="success">
                  Confirm & Submit
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ===== HISTORICAL EVENTS SECTION ===== */}
      <Card sx={{ mt: 3, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <BiTargetLock /> Historical Predictive Events
          </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: "transparent" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)", fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)", fontWeight: "bold" }}>Issue Detected</TableCell>
                  <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)", fontWeight: "bold" }}>Action Taken</TableCell>
                  <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)", fontWeight: "bold" }}>Outcome</TableCell>
                  <TableCell align="right" sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)", fontWeight: "bold" }}>Est. Savings</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {HISTORICAL_EVENTS.map((event, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{event.date}</TableCell>
                    <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{event.issue}</TableCell>
                    <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{event.action}</TableCell>
                    <TableCell sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <Chip label={event.outcome} color="success" size="small" icon={<FaCheckCircle />} />
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#00C853", fontWeight: "bold" }}>
                      {event.savings}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, p: 2, backgroundColor: "rgba(0,200,83,0.1)", borderRadius: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">Total Estimated Savings from Predictive Maintenance</Typography>
            <Typography variant="h4" fontWeight="bold" color="#00C853">Rp 32.500.000</Typography>
            <Typography variant="caption" color="text.secondary">Last 30 days</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PredictiveMaintenanceContainer;
