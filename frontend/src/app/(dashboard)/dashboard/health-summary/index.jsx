"use client";
import React, { useState } from "react";
import { Box, Typography, FormControl, Select, MenuItem, Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FleetHealthCards from "./fleet-health-cards";
import FleetTable from "./fleet-table";
import FleetAlertBanner from "./fleet-alert-banner";
import GanttWorkOrder from "../gantt-work-order";

// =============================================
// DUMMY DATA FOR DEMO
// =============================================

const DUMMY_FLEET_DATA = [
  // Critical - 1 unit
  {
    id: "gen-001",
    name: "Generator MTU P1901",
    serialNumber: "GEN-MTU-001",
    location: "Pembangkit Kereta",
    site: "Area Utama",
    status: "critical",
    healthIndex: 35,
    activeRisks: ["cooling", "electrical"],
    activeDTC: "SPN 110 FMI 18",
    dtcDescription: "Coolant Temperature Above Normal - High Temperature Warning",
    loadPercent: 85,
    lastUpdate: "2 min ago",
  },
  // At Risk - 4 units
  {
    id: "gen-002",
    name: "Generator Caterpillar P1902",
    serialNumber: "GEN-CAT-001",
    location: "Pembangkit Kereta",
    site: "Area Utama",
    status: "at-risk",
    healthIndex: 58,
    activeRisks: ["cooling"],
    activeDTC: "SPN 100 FMI 3",
    dtcDescription: "Oil Pressure Below Normal",
    loadPercent: 72,
    lastUpdate: "5 min ago",
  },
  {
    id: "gen-003",
    name: "Generator Perkins GS-201",
    serialNumber: "GEN-PRK-201",
    location: "Stasiun Yogyakarta",
    site: "Main Building",
    status: "at-risk",
    healthIndex: 62,
    activeRisks: ["lubrication"],
    activeDTC: "SPN 97 FMI 16",
    dtcDescription: "Water In Fuel Indicator",
    loadPercent: 68,
    lastUpdate: "3 min ago",
  },
  {
    id: "gen-004",
    name: "Generator Cummins C-500",
    serialNumber: "GEN-CMM-500",
    location: "Stasiun Solo Balapan",
    site: "Power House",
    status: "at-risk",
    healthIndex: 65,
    activeRisks: ["fuel"],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 55,
    lastUpdate: "8 min ago",
  },
  {
    id: "gen-005",
    name: "Generator Doosan D-300",
    serialNumber: "GEN-DOS-300",
    location: "Stasiun Tugu",
    site: "Backup Power",
    status: "at-risk",
    healthIndex: 68,
    activeRisks: ["electrical"],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 45,
    lastUpdate: "1 min ago",
  },
  // Healthy - 19 units
  {
    id: "gen-006",
    name: "Generator MTU S-100",
    serialNumber: "GEN-MTU-100",
    location: "Stasiun Lempuyangan",
    site: "Emergency Power",
    status: "healthy",
    healthIndex: 92,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 60,
    lastUpdate: "30 sec ago",
  },
  {
    id: "gen-007",
    name: "Generator Caterpillar C-800",
    serialNumber: "GEN-CAT-800",
    location: "Stasiun Maguwo",
    site: "Primary Power",
    status: "healthy",
    healthIndex: 95,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 48,
    lastUpdate: "1 min ago",
  },
  {
    id: "gen-008",
    name: "Generator Perkins P-400",
    serialNumber: "GEN-PRK-400",
    location: "Stasiun Klaten",
    site: "Main Power",
    status: "healthy",
    healthIndex: 88,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 52,
    lastUpdate: "2 min ago",
  },
  {
    id: "gen-009",
    name: "Generator Cummins QSK-60",
    serialNumber: "GEN-CMM-QSK60",
    location: "Stasiun Purwosari",
    site: "Central Power",
    status: "healthy",
    healthIndex: 91,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 70,
    lastUpdate: "45 sec ago",
  },
  {
    id: "gen-010",
    name: "Generator Doosan DP-158",
    serialNumber: "GEN-DOS-158",
    location: "Stasiun Kutoarjo",
    site: "Backup System",
    status: "healthy",
    healthIndex: 87,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 35,
    lastUpdate: "3 min ago",
  },
  {
    id: "gen-011",
    name: "Generator MTU 16V-4000",
    serialNumber: "GEN-MTU-16V",
    location: "Pembangkit Kereta",
    site: "Reserve Unit",
    status: "healthy",
    healthIndex: 94,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 0,
    lastUpdate: "5 min ago",
  },
  {
    id: "gen-012",
    name: "Generator Caterpillar 3516",
    serialNumber: "GEN-CAT-3516",
    location: "Stasiun Yogyakarta",
    site: "Secondary Unit",
    status: "healthy",
    healthIndex: 89,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 42,
    lastUpdate: "2 min ago",
  },
  {
    id: "gen-013",
    name: "Generator Perkins 4008",
    serialNumber: "GEN-PRK-4008",
    location: "Stasiun Solo Balapan",
    site: "Auxiliary",
    status: "healthy",
    healthIndex: 86,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 38,
    lastUpdate: "4 min ago",
  },
  {
    id: "gen-014",
    name: "Generator Cummins KTA-50",
    serialNumber: "GEN-CMM-KTA50",
    location: "Stasiun Tugu",
    site: "Main Unit",
    status: "healthy",
    healthIndex: 93,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 58,
    lastUpdate: "1 min ago",
  },
  {
    id: "gen-015",
    name: "Generator Doosan DP-222",
    serialNumber: "GEN-DOS-222",
    location: "Stasiun Lempuyangan",
    site: "Primary",
    status: "healthy",
    healthIndex: 90,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 65,
    lastUpdate: "30 sec ago",
  },
  {
    id: "gen-016",
    name: "Generator MTU 12V-2000",
    serialNumber: "GEN-MTU-12V",
    location: "Stasiun Maguwo",
    site: "Standby",
    status: "healthy",
    healthIndex: 96,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 0,
    lastUpdate: "10 min ago",
  },
  {
    id: "gen-017",
    name: "Generator Caterpillar 3512",
    serialNumber: "GEN-CAT-3512",
    location: "Stasiun Klaten",
    site: "Backup",
    status: "healthy",
    healthIndex: 85,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 25,
    lastUpdate: "6 min ago",
  },
  {
    id: "gen-018",
    name: "Generator Perkins 2806",
    serialNumber: "GEN-PRK-2806",
    location: "Stasiun Purwosari",
    site: "Reserve",
    status: "healthy",
    healthIndex: 88,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 0,
    lastUpdate: "15 min ago",
  },
  {
    id: "gen-019",
    name: "Generator Cummins QST-30",
    serialNumber: "GEN-CMM-QST30",
    location: "Stasiun Kutoarjo",
    site: "Primary",
    status: "healthy",
    healthIndex: 91,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 55,
    lastUpdate: "2 min ago",
  },
  {
    id: "gen-020",
    name: "Generator Doosan DP-180",
    serialNumber: "GEN-DOS-180",
    location: "Pembangkit Kereta",
    site: "Emergency",
    status: "healthy",
    healthIndex: 84,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 30,
    lastUpdate: "4 min ago",
  },
  {
    id: "gen-021",
    name: "Generator MTU 8V-1600",
    serialNumber: "GEN-MTU-8V",
    location: "Stasiun Yogyakarta",
    site: "Tertiary",
    status: "healthy",
    healthIndex: 92,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 40,
    lastUpdate: "1 min ago",
  },
  {
    id: "gen-022",
    name: "Generator Caterpillar C-15",
    serialNumber: "GEN-CAT-C15",
    location: "Stasiun Solo Balapan",
    site: "Mobile Unit",
    status: "healthy",
    healthIndex: 89,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 0,
    lastUpdate: "20 min ago",
  },
  {
    id: "gen-023",
    name: "Generator Perkins 1306",
    serialNumber: "GEN-PRK-1306",
    location: "Stasiun Tugu",
    site: "Portable",
    status: "healthy",
    healthIndex: 87,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 0,
    lastUpdate: "25 min ago",
  },
  {
    id: "gen-024",
    name: "Generator Cummins VTA-28",
    serialNumber: "GEN-CMM-VTA28",
    location: "Stasiun Lempuyangan",
    site: "Secondary",
    status: "healthy",
    healthIndex: 90,
    activeRisks: [],
    activeDTC: null,
    dtcDescription: null,
    loadPercent: 50,
    lastUpdate: "3 min ago",
  },
];

// Calculate summary from dummy data
const calculateSummary = (data) => {
  const critical = data.filter(d => d.status === "critical").length;
  const atRisk = data.filter(d => d.status === "at-risk").length;
  const healthy = data.filter(d => d.status === "healthy").length;
  const avgHealthIndex = Math.round(data.reduce((sum, d) => sum + d.healthIndex, 0) / data.length);

  return { total: data.length, critical, atRisk, healthy, avgHealthIndex };
};

// Get unique locations for filter
const getLocations = (data) => {
  return [...new Set(data.map(d => d.location))];
};

const HealthSummaryContent = () => {
  const theme = useTheme();
  const [activeFilter, setActiveFilter] = useState(null);
  const [locationFilter, setLocationFilter] = useState("all");
  const [showAlert, setShowAlert] = useState(true);

  // Filter data by location first
  const locationFilteredData = locationFilter === "all" 
    ? DUMMY_FLEET_DATA 
    : DUMMY_FLEET_DATA.filter(d => d.location === locationFilter);

  const summary = calculateSummary(locationFilteredData);
  const locations = getLocations(DUMMY_FLEET_DATA);

  // Alerts for banner
  const alerts = locationFilteredData
    .filter(d => d.status === "critical" || d.status === "at-risk")
    .map(d => ({ 
      id: d.id, 
      severity: d.status === "critical" ? "critical" : "warning",
      message: d.name 
    }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 2,
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Fleet Overview — All Generators
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <Chip 
              label={`Total Asset: ${summary.total}`} 
              size="small" 
              sx={{ bgcolor: "#3B82F620", color: "#3B82F6", fontWeight: 600 }} 
            />
            <Chip 
              label={`Critical: ${summary.critical}`} 
              size="small" 
              sx={{ bgcolor: "#EF444420", color: "#EF4444", fontWeight: 600 }} 
            />
            <Chip 
              label={`At Risk: ${summary.atRisk}`} 
              size="small" 
              sx={{ bgcolor: "#F59E0B20", color: "#F59E0B", fontWeight: 600 }} 
            />
            <Chip 
              label={`Healthy: ${summary.healthy}`} 
              size="small" 
              sx={{ bgcolor: "#10B98120", color: "#10B981", fontWeight: 600 }} 
            />
          </Box>
        </Box>
        
        {/* Location Filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setActiveFilter(null);
            }}
            sx={{
              borderRadius: "8px",
              bgcolor: theme.palette.mode === "dark" ? "#1e293b" : "#fff",
            }}
          >
            <MenuItem value="all">All Locations</MenuItem>
            {locations.map((loc) => (
              <MenuItem key={loc} value={loc}>{loc}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Alert Banner */}
      {showAlert && alerts.length > 0 && (
        <FleetAlertBanner 
          alerts={alerts}
          onDismiss={() => setShowAlert(false)}
          onFilterAtRisk={() => setActiveFilter("at-risk")}
        />
      )}

      {/* Health Summary Cards */}
      <FleetHealthCards 
        data={summary}
        onFilterChange={setActiveFilter}
        activeFilter={activeFilter}
      />

      {/* Fleet Table */}
      <FleetTable 
        data={locationFilteredData}
        filter={activeFilter}
      />

      {/* Work Order Gantt Chart */}
      <GanttWorkOrder />
    </Box>
  );
};

export default HealthSummaryContent;
