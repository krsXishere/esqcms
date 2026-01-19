import React, { Suspense } from "react";
import WorkOrdersContainer from "./work-orders-container";
import { CircularProgress } from "@mui/material";

const WorkOrdersPage = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <WorkOrdersContainer />
    </Suspense>
  );
};

export default WorkOrdersPage;
