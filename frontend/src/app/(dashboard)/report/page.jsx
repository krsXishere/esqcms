import React from "react";
import ReportTable from "./report-table";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";

const Page = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <ReportTable />
    </Suspense>
  );
};

export default Page;
