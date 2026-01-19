"use client";
import { Box, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { MdViewList, MdViewTimeline } from "react-icons/md";
import WorkOrdersTable from "./work-orders-table";
import WorkOrdersGantt from "./work-orders-gantt";

const WorkOrdersContainer = () => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState("table"); // "table" or "gantt"

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  return (
    <Box>
      {viewMode === "table" ? (
        <Box>
          {/* View Toggle for Table Mode */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<MdViewList size={18} />}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Table
            </Button>
            <Button
              variant="outlined"
              startIcon={<MdViewTimeline size={18} />}
              onClick={() => handleViewChange("gantt")}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                backgroundColor: theme.palette.mode === "dark" ? "#162750" : "#fff",
                borderColor: theme.palette.mode === "dark" ? "#334155" : "#e2e8f0",
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9",
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              Gantt
            </Button>
          </Box>
          <WorkOrdersTable />
        </Box>
      ) : (
        <WorkOrdersGantt onViewChange={handleViewChange} />
      )}
    </Box>
  );
};

export default WorkOrdersContainer;
