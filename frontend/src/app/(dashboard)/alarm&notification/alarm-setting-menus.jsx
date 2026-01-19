"use client";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import React, { useState, useMemo } from "react";
import InputSearch from "@/components/common/input-search";
import { useTheme } from "@mui/material";

const AlarmSettingMenus = ({ data, selectedId, onSelect }) => {
  const theme = useTheme();
  // const [selectedIndex, setSelectedIndex] = useState(2);
  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? [])
      .map((it) => ({
        id: it.id,
        title: it?.alarmTemplate?.variable_name ?? "Unknown",
        subtitle: it?.device?.name
          ? `${it.device.name}${
              it?.device?.area?.name ? " • " + it.device.area.name : ""
            }`
          : undefined,
      }))
      .filter((it) =>
        !q
          ? true
          : it.title?.toLowerCase().includes(q) ||
            it.subtitle?.toLowerCase().includes(q)
      );
  }, [data, search]);

  const handleListItemClick = (index) => {
    setSelectedIndex(index);
  };

  return (
    <Box
      sx={(theme) => ({
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.palette.mode === "dark" ? "#FFFFFF45" : "#00000030",
        borderRadius: "12px",
        overflowY: "scroll",
        [theme.breakpoints.up("xs")]: {
          padding: "10px",
          width: "100%",
          height: "400px",
        },
        [theme.breakpoints.up("sm")]: {
          width: "50%",
          height: "700px",
        },
        [theme.breakpoints.up("lg")]: {
          padding: "24px",
        },
      })}
      component={"div"}
      className="custom-scroll"
    >
      <InputSearch setValue={setSearch} value={search} />

      <Box>
        <Typography
          sx={{
            display: "block",
            py: 1.5,
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor:
              theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000050",
          }}
        >
          VARIABLES
        </Typography>
        <List disablePadding>
          {items.map((it) => {
            const isSelected = selectedId === it.id;
            return (
              <ListItemButton
                key={it.id}
                disableGutters
                selected={isSelected}
                onClick={() => onSelect?.(it.id)}
                sx={{
                  px: 0,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderBottomColor:
                    theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000050",
                  backgroundColor: isSelected ? "#FFFFFF20" : "transparent",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
                }}
              >
                <ListItemText
                  primary={it.title}
                  secondary={it.subtitle}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: 12, opacity: 0.8 }}
                />
              </ListItemButton>
            );
          })}

          {items.length === 0 && (
            <Typography sx={{ py: 2, opacity: 0.7, fontSize: 14 }}>
              Data Is Empty.
            </Typography>
          )}
        </List>
      </Box>
    </Box>
  );
};

export default AlarmSettingMenus;

const items = [
  "Gateway - Modbus Connection",
  "Low Voltage",
  "High Voltage",
  "Unbalance Current",
  "Unbalance Power",
  "Unbalance Voltage",
  "Temperature",
  "Low Frequency",
];
