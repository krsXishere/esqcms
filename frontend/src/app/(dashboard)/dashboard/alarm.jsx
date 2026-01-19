"use client";
import { Box, Stack, Typography, Button } from "@mui/material";
import React from "react";
import { SlExclamation } from "react-icons/sl";
import { MdLocationOn, MdOutlineSensors } from "react-icons/md";
import { FaCog } from "react-icons/fa";
import { useTheme } from "@mui/material";
import { formatDateTime } from "@/utils/utils";

const Alarm = ({
  description,
  activation_time,
  area_name,
  device_name,
  utility_name,
  onDetail,
  id,
}) => {
  const theme = useTheme();
  return (
    <Stack
      sx={(theme) => ({
        flexDirection: "row",
        justifyContent: "space-between",
        [theme.breakpoints.down("md")]: {
          width: "800px",
        },
        [theme.breakpoints.up("md")]: {
          width: "100%",
        },
        [theme.breakpoints.up("lg")]: {},
      })}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <SlExclamation size={26} color={"#FF2056"} />
        <Box>
          <Typography sx={{ fontWeight: "500", fontSize: "12px" }}>
            {description}
          </Typography>
          <Typography sx={{ color: "#A0AEC0", fontSize: "12px" }}>
            {formatDateTime(activation_time)}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MdLocationOn size={16} />
          <Typography sx={{ color: "#A0AEC0" }}>{area_name}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FaCog size={14} />
          <Typography sx={{ color: "#A0AEC0", fontSize: "14px" }}>
            {utility_name}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MdOutlineSensors size={16} />
          <Typography sx={{ color: "#A0AEC0", fontSize: "14px" }}>
            {device_name}
          </Typography>
        </Box>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#15264b",
            color: "#fff",
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: "500",
            fontSize: "12px",
            paddingX: 2,
            paddingY: 1,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#243250",
              boxShadow: "none",
            },
          }}
          onClick={() => onDetail(id)}
        >
          Details
        </Button>
      </Box>
    </Stack>
  );
};

export default Alarm;
