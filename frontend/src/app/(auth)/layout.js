import React from "react";
import { Box } from "@mui/material";
import ParticlesBackground from "@/components/particle-background";
import DynamicTitle from "@/components/common/dynamic-title";

const AuthLayout = ({ children }) => {
  return (
    <Box sx={{ height: "100vh", overflow: "hidden", width: "100%" }}>
      <DynamicTitle />
      <ParticlesBackground />
      {children}
    </Box>
  );
};

export default AuthLayout;
