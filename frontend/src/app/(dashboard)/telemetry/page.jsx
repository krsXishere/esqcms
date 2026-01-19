"use client";
import React from "react";
import { Suspense } from "react";
import { CircularProgress, Box } from "@mui/material";
import dynamic from "next/dynamic";

const TelemetryContainer = dynamic(
  () => import("./telemetry-container"),
  { 
    loading: () => <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}><CircularProgress /></Box>,
    ssr: false,
  }
);

const TelemetryPage = () => {
  return (
    <Box sx={{ width: "100%" }}>
      <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}><CircularProgress /></Box>}>
        <TelemetryContainer />
      </Suspense>
    </Box>
  );
};

export default TelemetryPage;
