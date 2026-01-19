"use client";
import React, { useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import UserManagementTable from "./user-management-table";
import UserNotificationSetting from "./user-notification-setting";
import { Suspense } from "react";

const UserManagementPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  return (
    <Suspense fallback={<CircularProgress />}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <UserNotificationSetting refreshTrigger={refreshTrigger} />
        <UserManagementTable setRefreshTrigger={setRefreshTrigger} />
      </Box>
    </Suspense>
  );
};

export default UserManagementPage;
