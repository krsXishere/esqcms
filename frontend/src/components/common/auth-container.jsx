"use client";
import { Box } from "@mui/material";
import React from "react";

const AuthContainer = ({ children }) => {
  return (
    <Box
      sx={(theme) => ({
        position: "relative",
        borderRadius: "12px",
        backgroundColor: "#00000035",
        padding: "24px",
        [theme.breakpoints.up("xs")]: {
          height: "calc(100vh - 50px)",
          width: "100%",
        },
        [theme.breakpoints.up("sm")]: {},
        [theme.breakpoints.up("md")]: {
          width: "720px",
          height: "calc(100vh - 50px)",
          margin: "24px",
        },
      })}
    >
      {children}
    </Box>
  );
};

export default AuthContainer;
