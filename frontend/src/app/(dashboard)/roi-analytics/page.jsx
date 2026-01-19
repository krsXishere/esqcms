"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Box, FormControl, Select, MenuItem, Typography, InputLabel, Button, ListSubheader } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { TbFilter } from "react-icons/tb";
import { useFetchApi } from "@/app/hook/useFetchApi";
import ROISummaryCards from "./roi-summary-cards";
import ROITrendChart from "./roi-trend-chart";
import ROIByAreaChart from "./roi-by-area-chart";
import TopSavingsTable from "./top-savings-table";

const ROIAnalyticsPage = () => {
  const theme = useTheme();
  const { sendRequest } = useFetchApi();

  // Filter states
  const [areas, setAreas] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [selectedUtilityId, setSelectedUtilityId] = useState("");

  // Fetch areas and utilities
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [areasResult, utilitiesResult] = await Promise.all([
          sendRequest({ url: "/areas" }),
          sendRequest({ url: "/utilities" }),
        ]);
        
        // Handle response - could be { data: [...] } or { success: true, data: [...] }
        if (areasResult) {
          const areaData = areasResult.data || areasResult || [];
          setAreas(Array.isArray(areaData) ? areaData : []);
        }
        if (utilitiesResult) {
          const utilityData = utilitiesResult.data || utilitiesResult || [];
          setUtilities(Array.isArray(utilityData) ? utilityData : []);
        }
      } catch (error) {
        console.error("Failed to fetch filters:", error);
      }
    };
    fetchFilters();
  }, []);

  // Filter utilities based on selected area
  const filteredUtilities = selectedAreaId
    ? utilities.filter((u) => String(u.area_id) === selectedAreaId)
    : utilities;

  // Group utilities by area for display when no area is selected
  const groupedUtilities = useMemo(() => {
    if (selectedAreaId) {
      // If area is selected, just return flat list
      return filteredUtilities.map((utility) => ({
        type: 'utility',
        utility,
      }));
    }
    
    // Group by area
    const grouped = [];
    const areaMap = new Map();
    
    utilities.forEach((utility) => {
      const areaId = utility.area_id;
      if (!areaMap.has(areaId)) {
        const area = areas.find((a) => a.id === areaId);
        areaMap.set(areaId, {
          areaName: area?.name || `Area ${areaId}`,
          utilities: [],
        });
      }
      areaMap.get(areaId).utilities.push(utility);
    });
    
    // Convert to array with headers
    areaMap.forEach((value, areaId) => {
      grouped.push({ type: 'header', areaName: value.areaName, areaId });
      value.utilities.forEach((utility) => {
        grouped.push({ type: 'utility', utility });
      });
    });
    
    return grouped;
  }, [utilities, areas, selectedAreaId, filteredUtilities]);

  // Reset utility when area changes
  const handleAreaChange = (e) => {
    setSelectedAreaId(e.target.value);
    setSelectedUtilityId(""); // Reset utility when area changes
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Filter Row */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          p: 2,
          borderRadius: "12px",
          border: `1px solid ${theme.palette.mode === "dark" ? "#FFFFFF15" : "#00000010"}`,
          bgcolor: theme.palette.mode === "dark" ? "#162750" : "#fff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TbFilter size={20} color={theme.palette.primary.main} />
          <Typography variant="body2" fontWeight={600}>
            Filter:
          </Typography>
        </Box>

        {/* Area Filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel shrink>Area</InputLabel>
          <Select
            value={selectedAreaId}
            onChange={handleAreaChange}
            label="Area"
            displayEmpty
            renderValue={(selected) => {
              if (!selected) return "All Areas";
              const area = areas.find((a) => String(a.id) === selected);
              return area?.name || "All Areas";
            }}
            sx={{
              borderRadius: "8px",
              bgcolor: theme.palette.mode === "dark" ? "#1E293B" : "#F8FAFC",
            }}
          >
            <MenuItem value="">
              <em>All Areas</em>
            </MenuItem>
            {areas.map((area) => (
              <MenuItem key={area.id} value={String(area.id)}>
                {area.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Utility Filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel shrink>Utility</InputLabel>
          <Select
            value={selectedUtilityId}
            onChange={(e) => setSelectedUtilityId(e.target.value)}
            label="Utility"
            displayEmpty
            renderValue={(selected) => {
              if (!selected) return "All Utilities";
              const utility = utilities.find((u) => String(u.id) === selected);
              return utility?.name || "All Utilities";
            }}
            sx={{
              borderRadius: "8px",
              bgcolor: theme.palette.mode === "dark" ? "#1E293B" : "#F8FAFC",
            }}
          >
            <MenuItem value="">
              <em>All Utilities</em>
            </MenuItem>
            {groupedUtilities.map((item, index) => 
              item.type === 'header' ? (
                <ListSubheader 
                  key={`header-${item.areaId}`}
                  sx={{ 
                    bgcolor: theme.palette.mode === "dark" ? "#1E293B" : "#F1F5F9",
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    lineHeight: "32px",
                  }}
                >
                  📍 {item.areaName}
                </ListSubheader>
              ) : (
                <MenuItem 
                  key={item.utility.id} 
                  value={String(item.utility.id)}
                  sx={{ pl: selectedAreaId ? 2 : 4 }}
                >
                  {item.utility.name}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>

        {/* Reset Button */}
        {(selectedAreaId || selectedUtilityId) && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setSelectedAreaId("");
              setSelectedUtilityId("");
            }}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
            }}
          >
            Reset Filter
          </Button>
        )}
      </Box>

      {/* Summary Cards - Total Loss Avoided, Net Benefit, ROI % */}
      <ROISummaryCards areaId={selectedAreaId} utilityId={selectedUtilityId} />
      
      {/* Charts Row */}
      <Box
        sx={(theme) => ({
          display: "flex",
          flexDirection: "row",
          gap: "24px",
          [theme.breakpoints.down("md")]: {
            flexDirection: "column",
          },
        })}
      >
        <ROITrendChart areaId={selectedAreaId} utilityId={selectedUtilityId} />
        <ROIByAreaChart areaId={selectedAreaId} utilityId={selectedUtilityId} />
      </Box>
      
      {/* Top Savings Table */}
      <TopSavingsTable areaId={selectedAreaId} utilityId={selectedUtilityId} />
    </Box>
  );
};

export default ROIAnalyticsPage;
