"use client";
import React from "react";
import AreaManagementTable from "./area-management-table";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";

const AreaManagementPage = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <AreaManagementTable />
    </Suspense>
  );
};

export default AreaManagementPage;
