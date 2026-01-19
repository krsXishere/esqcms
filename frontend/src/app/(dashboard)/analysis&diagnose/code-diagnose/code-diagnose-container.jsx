"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { TbAlertTriangle, TbCpu, TbClock, TbRefresh } from "react-icons/tb";
import DTCListPanel from "./dtc-list-panel";
import DTCDetailPanel from "./dtc-detail-panel";

// Dummy Data for DTC List
const dummyDTCList = [
  {
    id: 1,
    spn: 110,
    fmi: 18,
    severity: "critical",
    shortDescription: "Coolant Temperature Sensor",
    detectedTime: "15 min ago",
    source: "Engine ECU (J1939)",
    plainLanguage: "Coolant temperature is above normal operating range. The engine cooling system is not effectively dissipating heat, which can lead to engine overheating and potential damage if not addressed promptly.",
    riskContext: "Engine Overheating",
    healthImpact: "-15 points",
    evidence: [
      { type: "temperature", label: "Coolant temp", value: "+18% vs baseline", isAnomaly: true },
      { type: "rpm", label: "RPM", value: "Stable", isAnomaly: false },
      { type: "load", label: "Load", value: "78%", isAnomaly: false },
      { type: "pressure", label: "Oil pressure", value: "Normal", isAnomaly: false },
    ],
    rootCause: {
      cause: "Thermostat Stuck Closed",
      description: "The thermostat valve is not opening properly, preventing coolant from flowing through the radiator for cooling. This typically occurs due to age, corrosion, or debris accumulation.",
      confidence: 92,
    },
    actions: [
      "Inspect thermostat valve operation",
      "Check coolant circulation and flow rate",
      "Verify radiator fan operation",
      "Replace thermostat if required (recommended)",
    ],
    sparePart: {
      code: "TH-404",
      name: "Thermostat Assembly",
      availability: "In Stock",
    },
    suggestedSla: "48 hours",
  },
  {
    id: 2,
    spn: 100,
    fmi: 3,
    severity: "high",
    shortDescription: "Oil Pressure Sensor Circuit",
    detectedTime: "2 hours ago",
    source: "Engine ECU (J1939)",
    plainLanguage: "Oil pressure sensor is reading voltage above normal range. This could indicate a sensor malfunction, wiring issue, or actual high oil pressure condition that needs investigation.",
    riskContext: "Lubrication System Alert",
    healthImpact: "-10 points",
    evidence: [
      { type: "pressure", label: "Oil pressure", value: "+25% above normal", isAnomaly: true },
      { type: "temperature", label: "Oil temp", value: "Normal", isAnomaly: false },
      { type: "rpm", label: "RPM", value: "Stable", isAnomaly: false },
      { type: "load", label: "Engine load", value: "65%", isAnomaly: false },
    ],
    rootCause: {
      cause: "Oil Pressure Sensor Fault",
      description: "The oil pressure sensor or its wiring circuit is showing abnormal voltage readings. This could be due to sensor degradation, loose connections, or damaged wiring.",
      confidence: 78,
    },
    actions: [
      "Inspect oil pressure sensor wiring and connections",
      "Check sensor resistance with multimeter",
      "Verify actual oil pressure with manual gauge",
      "Replace sensor if faulty",
    ],
    sparePart: {
      code: "OPS-201",
      name: "Oil Pressure Sensor",
      availability: "In Stock",
    },
    suggestedSla: "72 hours",
  },
  {
    id: 3,
    spn: 190,
    fmi: 0,
    severity: "medium",
    shortDescription: "Engine Speed Sensor",
    detectedTime: "1 day ago",
    source: "Engine ECU (J1939)",
    plainLanguage: "Engine speed data is showing intermittent readings above maximum valid range. This may indicate sensor signal interference or early sensor degradation.",
    riskContext: "Speed Control Monitoring",
    healthImpact: "-5 points",
    evidence: [
      { type: "rpm", label: "RPM reading", value: "Intermittent spikes", isAnomaly: true },
      { type: "load", label: "Load", value: "Normal", isAnomaly: false },
      { type: "temperature", label: "Engine temp", value: "Normal", isAnomaly: false },
      { type: "pressure", label: "Fuel pressure", value: "Normal", isAnomaly: false },
    ],
    rootCause: {
      cause: "Speed Sensor Signal Interference",
      description: "Electromagnetic interference or sensor gap misalignment is causing occasional erroneous readings. The sensor may be approaching end of service life.",
      confidence: 65,
    },
    actions: [
      "Check speed sensor gap and alignment",
      "Inspect sensor wiring for damage or interference",
      "Clean sensor tip and target wheel",
      "Monitor closely and plan replacement",
    ],
    sparePart: {
      code: "ESS-150",
      name: "Engine Speed Sensor",
      availability: "Order Required",
    },
    suggestedSla: "1 week",
  },
  {
    id: 4,
    spn: 91,
    fmi: 2,
    severity: "high",
    shortDescription: "Throttle Position Sensor",
    detectedTime: "4 hours ago",
    source: "Engine ECU (J1939)",
    plainLanguage: "Throttle position sensor is showing erratic data. This can cause inconsistent engine response and poor fuel economy. Immediate attention recommended.",
    riskContext: "Engine Performance Issue",
    healthImpact: "-12 points",
    evidence: [
      { type: "load", label: "Throttle position", value: "Erratic ±15%", isAnomaly: true },
      { type: "rpm", label: "RPM stability", value: "Fluctuating", isAnomaly: true },
      { type: "default", label: "Fuel consumption", value: "+8% above normal", isAnomaly: true },
      { type: "temperature", label: "Engine temp", value: "Normal", isAnomaly: false },
    ],
    rootCause: {
      cause: "Throttle Position Sensor Wear",
      description: "The potentiometer inside the throttle position sensor is worn, causing inconsistent voltage output. This is common in high-hour generators.",
      confidence: 85,
    },
    actions: [
      "Verify throttle mechanical linkage",
      "Check TPS wiring and connector",
      "Calibrate or replace TPS assembly",
      "Perform engine idle calibration after replacement",
    ],
    sparePart: {
      code: "TPS-330",
      name: "Throttle Position Sensor",
      availability: "In Stock",
    },
    suggestedSla: "48 hours",
  },
  {
    id: 5,
    spn: 94,
    fmi: 17,
    severity: "medium",
    shortDescription: "Fuel Pressure Sensor",
    detectedTime: "6 hours ago",
    source: "Engine ECU (J1939)",
    plainLanguage: "Fuel delivery pressure is reading slightly below optimal range. This may affect engine performance at high loads. Monitor and schedule maintenance.",
    riskContext: "Fuel System Monitoring",
    healthImpact: "-7 points",
    evidence: [
      { type: "pressure", label: "Fuel pressure", value: "-12% below normal", isAnomaly: true },
      { type: "load", label: "Engine load capacity", value: "Limited to 85%", isAnomaly: true },
      { type: "default", label: "Fuel filter status", value: "Due for change", isAnomaly: true },
      { type: "rpm", label: "RPM", value: "Stable", isAnomaly: false },
    ],
    rootCause: {
      cause: "Fuel Filter Restriction",
      description: "The fuel filter is partially clogged, restricting fuel flow to the injection system. This is a normal maintenance item but should be addressed.",
      confidence: 88,
    },
    actions: [
      "Replace primary and secondary fuel filters",
      "Check fuel lines for leaks or restrictions",
      "Inspect fuel pump operation",
      "Verify fuel quality and water separator",
    ],
    sparePart: {
      code: "FF-225",
      name: "Fuel Filter Kit",
      availability: "In Stock",
    },
    suggestedSla: "72 hours",
  },
];

// Dummy Generator List
const dummyGenerators = [
  { id: 1, name: "Generator MTU P1901" },
  { id: 2, name: "Generator Caterpillar P1902" },
  { id: 3, name: "Generator Cummins P1903" },
];

const CodeDiagnoseContainer = () => {
  const theme = useTheme();
  const [selectedGenerator, setSelectedGenerator] = useState(dummyGenerators[0].id);
  const [selectedDtc, setSelectedDtc] = useState(dummyDTCList[0]);
  const [lastUpdate] = useState(new Date());

  const criticalCount = dummyDTCList.filter((d) => d.severity === "critical").length;
  const highCount = dummyDTCList.filter((d) => d.severity === "high").length;

  const handleGenerateWO = (dtc) => {
    console.log("Generate WO for DTC:", dtc);
    alert(`Work Order would be generated for:\nSPN ${dtc.spn} FMI ${dtc.fmi}\n${dtc.shortDescription}`);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          background: theme.palette.mode === "dark" 
            ? "linear-gradient(135deg, rgba(0, 117, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)"
            : "linear-gradient(135deg, rgba(0, 117, 255, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
          border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <TbCpu size={24} color="#0075FF" />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.mode === "dark" ? "#fff" : "#1a1a2e",
                }}
              >
                DTC–FMI Interpreter
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
              }}
            >
              Translate error codes into diagnosis and actionable insights
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
            {/* Generator Selector */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Generator</InputLabel>
              <Select
                value={selectedGenerator}
                label="Generator"
                onChange={(e) => setSelectedGenerator(e.target.value)}
                sx={{
                  bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                }}
              >
                {dummyGenerators.map((gen) => (
                  <MenuItem key={gen.id} value={gen.id}>
                    {gen.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* DTC Summary */}
            <Stack direction="row" spacing={1}>
              <Chip
                icon={<TbAlertTriangle size={14} />}
                label={`${criticalCount} Critical`}
                sx={{
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                  color: "#EF4444",
                  fontWeight: 600,
                }}
              />
              <Chip
                label={`${highCount} High`}
                sx={{
                  bgcolor: "rgba(245, 158, 11, 0.1)",
                  color: "#F59E0B",
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<TbClock size={14} />}
                label={`Updated ${lastUpdate.toLocaleTimeString()}`}
                sx={{
                  bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                }}
              />
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* Alert Banner */}
      <Alert
        severity="warning"
        icon={<TbAlertTriangle size={20} />}
        sx={{
          mb: 2,
          borderRadius: 2,
          "& .MuiAlert-message": { width: "100%" },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {criticalCount} critical DTC requires immediate attention • Estimated {criticalCount > 0 ? "48 hours" : "N/A"} to address
          </Typography>
        </Stack>
      </Alert>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          gap: 2,
          overflow: "hidden",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Left Panel - DTC List */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: "100%", md: 320 },
            minWidth: { md: 320 },
            borderRadius: 2,
            border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: { xs: 400, md: "100%" },
          }}
        >
          <DTCListPanel
            dtcList={dummyDTCList}
            selectedDtc={selectedDtc}
            onSelectDtc={setSelectedDtc}
          />
        </Paper>

        {/* Main Panel - DTC Detail */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            borderRadius: 2,
            border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
            overflow: "hidden",
          }}
        >
          <DTCDetailPanel
            dtc={selectedDtc}
            onGenerateWO={handleGenerateWO}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default CodeDiagnoseContainer;
