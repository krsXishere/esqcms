import { createTheme } from "@mui/material/styles";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode: "light",
      background: {
        default: "#F5F7FA",
        paper: "#FFFFFF",
      },
      primary: {
        main: "#2F80ED",
        light: "#60A5FA",
        dark: "#1D6FD3",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#64748B",
        light: "#94A3B8",
        dark: "#475569",
      },
      success: {
        main: "#059669",
        light: "#10B981",
        dark: "#047857",
      },
      warning: {
        main: "#F59E0B",
        light: "#FBBF24",
        dark: "#D97706",
      },
      error: {
        main: "#EF4444",
        light: "#F87171",
        dark: "#DC2626",
      },
      info: {
        main: "#2F80ED",
        light: "#60A5FA",
        dark: "#1D6FD3",
      },
      text: {
        primary: "#1E293B",
        secondary: "#64748B",
        disabled: "#94A3B8",
      },
      divider: "#E2E8F0",
      action: {
        active: "#1E293B",
        hover: "#F1F5F9",
        selected: "#EAF4FF",
        disabled: "#CBD5E1",
      },
    },
    typography: {
      fontFamily: plusJakarta.style.fontFamily,
      h1: {
        fontSize: "2.5rem",
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 700,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.5,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: "thin",
            scrollbarColor: "#CBD5E1 #F1F5F9",
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#F1F5F9",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#CBD5E1",
              borderRadius: "4px",
              "&:hover": {
                background: "#94A3B8",
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "8px 16px",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
          },
          contained: {
            backgroundColor: "#2F80ED",
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#1D6FD3",
            },
          },
          outlined: {
            borderColor: "#E2E8F0",
            color: "#64748B",
            "&:hover": {
              borderColor: "#CBD5E1",
              backgroundColor: "#F8FAFC",
            },
          },
          text: {
            color: "#64748B",
            "&:hover": {
              backgroundColor: "#F1F5F9",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: "#64748B",
            "&:hover": {
              backgroundColor: "#F1F5F9",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
          elevation1: {
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
              backgroundColor: "#F5F7FA",
              "& fieldset": {
                borderColor: "#E2E8F0",
              },
              "&:hover fieldset": {
                borderColor: "#CBD5E1",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#2F80ED",
                borderWidth: "2px",
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 600,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: "#E2E8F0",
          },
          head: {
            fontWeight: 600,
            color: "#64748B",
            backgroundColor: "#F8FAFC",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: "#FFFFFF",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            backgroundColor: "#FFFFFF",
          },
        },
      },
    },
  });

export default getTheme;
