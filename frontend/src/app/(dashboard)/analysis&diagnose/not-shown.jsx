"use client";
import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material";

const NotShown = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        bgcolor: theme.palette.mode === "dark" ? "#FFFFFF07" : "#00000012",
        p: "16px",
        borderRadius: "12px",
      }}
    >
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: "14px", fontWeight: "500" }}>
          Not Shown :
        </Typography>
        <Stack sx={{ flexDirection: "row", alignItems: "center", gap: "8px" }}>
          <Box sx={{ p: "8px", borderRadius: "6px", bgcolor: "#FFFFFF12" }}>
            <Typography sx={{ fontSize: "14px", fontWeight: "500" }}>
              Voltage
            </Typography>
          </Box>
          <Box sx={{ p: "8px", borderRadius: "6px", bgcolor: "#FFFFFF12" }}>
            <Typography sx={{ fontSize: "14px", fontWeight: "500" }}>
              Voltage
            </Typography>
          </Box>
          <Box sx={{ p: "8px", borderRadius: "6px", bgcolor: "#FFFFFF12" }}>
            <Typography sx={{ fontSize: "14px", fontWeight: "500" }}>
              Voltage
            </Typography>
          </Box>
          <Box sx={{ p: "8px", borderRadius: "6px", bgcolor: "#FFFFFF12" }}>
            <Typography sx={{ fontSize: "14px", fontWeight: "500" }}>
              Voltage
            </Typography>
          </Box>
          <Box sx={{ p: "8px", borderRadius: "6px", bgcolor: "#FFFFFF12" }}>
            <Typography sx={{ fontSize: "14px", fontWeight: "500" }}>
              Voltage
            </Typography>
          </Box>
        </Stack>
      </Stack>
      <Button
        variant="contained"
        sx={{ width: "100%", textTransform: "capitalize", mt: "8px" }}
      >
        Show All
      </Button>
    </Box>
  );
};

export default NotShown;
