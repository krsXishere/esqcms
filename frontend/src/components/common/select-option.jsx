"use client";
import { FormControl, MenuItem, Select } from "@mui/material";
import React from "react";
import { useTheme } from "@mui/material/styles";

const SelectOption = ({ value, setValue, selectMenus, title, width }) => {
  const theme = useTheme();
  // If parent didn't provide a value, default to the first menu item's value
  // so the dropdown immediately shows the top option. This improves UX for
  // selects where a top/default choice is desired (e.g. Area/Device).
  const displayValue =
    value !== undefined && value !== null && value !== ""
      ? value
      : selectMenus && selectMenus.length
      ? selectMenus[0].value
      : "";
  return (
    <FormControl
      sx={(theme) => ({
        [theme.breakpoints.up("xs")]: {
          width: "140px",
        },
        [theme.breakpoints.up("sm")]: {
          width,
        },
        [theme.breakpoints.up("lg")]: {},
      })}
    >
      <Select
        value={displayValue}
        onChange={(e) => setValue(e.target.value)}
        displayEmpty
        renderValue={(selected) => {
          const selectedItem = selectMenus.find(
            (item) => item.value === selected
          );
          // show selected item title, otherwise fallback to first option or placeholder
          const text = selectedItem
            ? `${title}: ${selectedItem.title}`
            : selectMenus && selectMenus.length
            ? `${title}: ${selectMenus[0].title}`
            : `Pilih ${title}`;
          return (
            <span style={{ color: theme.palette.text.primary }}>{text}</span>
          );
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: "#FFFFFF",
              color: "#1E293B",
              borderRadius: 2,
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              "& .MuiMenuItem-root": {
                color: "#1E293B",
                backgroundColor: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#F1F5F9",
                },
                "&.Mui-selected": {
                  backgroundColor: "#EAF4FF",
                  "&:hover": {
                    backgroundColor: "#DBEAFE",
                  },
                },
              },
            },
          },
        }}
        sx={(theme) => ({
          backgroundColor: "#FFFFFF",
          color: "#1E293B",
          borderRadius: "12px",
          // ensure inner select text and icon use theme text color (important for light theme)
          '& .MuiSelect-select': { color: "#1E293B" },
          '& .MuiSvgIcon-root': { color: "#64748B" },
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "#E2E8F0",
          "&:hover": {
            borderColor: "#CBD5E1",
          },
          [theme.breakpoints.up("xs")]: {
            fontSize: "14px",
          },
          [theme.breakpoints.up("sm")]: {
            fontSize: "16px",
          },
          [theme.breakpoints.up("lg")]: {},
        })}
      >
        {selectMenus.map((data, i) => (
          <MenuItem value={data.value} key={i}>
            {data.title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectOption;
