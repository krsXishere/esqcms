// lib/colorModeContext.js
"use client";
import { createContext } from "react";

const ColorModeContext = createContext({
  mode: "light",
  toggleColorMode: () => {},
});

export default ColorModeContext;
