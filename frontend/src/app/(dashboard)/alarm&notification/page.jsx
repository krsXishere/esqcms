import React from "react";
import AlarmSetting from "./alarm-setting";
import { Box } from "@mui/material";
import EventsTable from "./events-table";
import AlarmTable from "./alarm-table";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";
const AlarmNotificationPage = () => {
  return (
    <Suspense fallback={<CircularProgress />}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <AlarmSetting />
        <EventsTable />
        <AlarmTable />
      </Box>
    </Suspense>
  );
};

export default AlarmNotificationPage;
