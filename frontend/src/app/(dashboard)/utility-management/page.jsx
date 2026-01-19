import React from "react";
import UtilityManagementTable from "./utility-management-table";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";

const UtilityManagementPage = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <UtilityManagementTable />
    </Suspense>
  );
};

export default UtilityManagementPage;
