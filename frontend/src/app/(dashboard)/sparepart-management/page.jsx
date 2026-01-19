"use client";
import React from "react";
import SparepartManagementTable from "./sparepart-management-table";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";

const SparepartManagementPage = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <SparepartManagementTable />
    </Suspense>
  );
};

export default SparepartManagementPage;
