"use client";
import React from "react";
import DeviceManagementTable from "./device-management-table";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";

const DeviceManagementPage = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <DeviceManagementTable />
    </Suspense>
  );
};

export default DeviceManagementPage;
