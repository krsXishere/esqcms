"use client";
import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import Link from "next/link";

const Notfound = () => {
  return (
    <Stack
      sx={{
        height: "100vh",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        backgroundColor: "#F5F7FA",
      }}
    >
      <Typography sx={{ fontSize: "30px", fontWeight: "700", color: "#1E293B" }}>
        Not Found
      </Typography>
      <Typography sx={{ color: "#64748B" }}>
        Could not find requested resource
      </Typography>
      <Typography
        component={Link}
        href={"/dashboard"}
        sx={{ color: "#2F80ED", fontWeight: "600" }}
      >
        Return Home
      </Typography>
    </Stack>
  );
};

export default Notfound;
