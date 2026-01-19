"use client";
import { IconButton } from "@mui/material";
import React from "react";
import { useContext } from "react";
import ColorModeContext from "@/lib/colorModeContext";
import { useTheme } from "@mui/material/styles";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = () => {
  const { toggleColorMode } = useContext(ColorModeContext);
  const theme = useTheme();
  return (
    <>
      <IconButton
        onClick={toggleColorMode}
        color="inherit"
        sx={{ padding: "8px" }}
      >
        {theme.palette.mode === "dark" ? (
          <FaSun className="size-6 lg:size-8" />
        ) : (
          <FaMoon className="size-6 lg:size-8" />
        )}
      </IconButton>
    </>
  );
};

export default ThemeToggle;
