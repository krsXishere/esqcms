import { CircularProgress } from "@mui/material";
import MonitoringContainer from "./monitoring-container";
import { Suspense } from "react";

const MonitoringPage = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <MonitoringContainer />
    </Suspense>
  );
};

export default MonitoringPage;
