"use client";
import React from "react";
import { Suspense } from "react";
import { CircularProgress, Box } from "@mui/material";
import PredictiveMaintenanceContainer from "./predictive-maintenance-container";

const PredictiveMaintenancePage = () => {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      }
    >
      <PredictiveMaintenanceContainer />
    </Suspense>
  );
};

export default PredictiveMaintenancePage;
