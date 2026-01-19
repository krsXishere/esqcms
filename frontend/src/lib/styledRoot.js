"use client";
import { useMemo, useEffect, useState, createContext } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import getTheme from "./theme";
import ColorModeContext from "./colorModeContext";
import { SnackbarProvider } from "notistack";

export function StyledRoot({ children }) {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("themeMode");
    if (stored === "dark" || stored === "light") {
      setMode(stored);
    }
  }, []);

  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", next);
      return next;
    });
  };

  useEffect(() => {
    document.body.classList.remove("light-mode", "dark-mode");
    document.body.classList.add(`${mode}-mode`);
  }, [mode]);

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          autoHideDuration={3000}
        >
          {children}
        </SnackbarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
