"use client";
import { Box, Typography } from "@mui/material";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { useTheme } from "@mui/material";

const CurrentLoad = ({ icon, title, value, color }) => {
  const theme = useTheme();
  return (
    <Box
      sx={(theme) => ({
        position: "relative",
        borderRadius: "50%",
        backgroundColor:
          theme.palette.mode === "dark" ? "#0f172a" : "#00000020",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: color,
        mx: "auto",

        [theme.breakpoints.up("xs")]: {
          width: 130,
          height: 130,
        },
        // [theme.breakpoints.up("sm")]: {
        //   width: 130,
        //   height: 130,
        // },
        [theme.breakpoints.up("lg")]: {
          width: 280,
          height: 280,
        },
      })}
    >
      <Box
        sx={(theme) => ({
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          justifyContent: "center",
          gap: "4px",
          [theme.breakpoints.up("xs")]: {},
          [theme.breakpoints.up("sm")]: {},
          [theme.breakpoints.up("md")]: {
            fontSize: "24px",
          },
        })}
      >
        {icon}
        <Typography
          variant="h5"
          sx={(theme) => ({
            fontWeight: 600,
            [theme.breakpoints.down("md")]: { fontSize: "20px" },
            [theme.breakpoints.up("md")]: {},
            [theme.breakpoints.up("lg")]: {
              fontSize: "50px",
              my: "10px",
            },
          })}
        >
          {value}
        </Typography>
        <Typography
          variant="caption"
          sx={(theme) => ({
            color: theme.palette.mode === "dark" ? "#64748b" : "#94a3b8",
            fontSize: "0.75rem",
            fontWeight: 500,
            display: "block",
            [theme.breakpoints.up("lg")]: {
              fontSize: "1rem",
              mb: "4px",
            },
          })}
        >
          Utility
        </Typography>
        <Typography
          variant="body2"
          sx={(theme) => ({
            color: theme.palette.mode === "dark" ? "#A0AEC0" : "#000",
            [theme.breakpoints.up("xs")]: {},
            [theme.breakpoints.up("sm")]: {},
            [theme.breakpoints.up("md")]: {
              fontSize: "24px",
            },
          })}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

export default CurrentLoad;
