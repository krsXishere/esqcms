import { Box, InputBase } from "@mui/material";
import React from "react";
import { CiSearch } from "react-icons/ci";
import { useTheme } from "@mui/material/styles";

const InputSearch = ({ value, setValue, width = "100%" }) => {
  const theme = useTheme();
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        px: 2,
        py: "13px",
        display: "flex",
        alignItems: "center",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#E2E8F0",
        "&:hover": {
          borderColor: "#CBD5E1",
        },
        [theme.breakpoints.up("xs")]: {
          width: "100%",
        },
        [theme.breakpoints.up("sm")]: {
          width: width,
        },
        [theme.breakpoints.up("lg")]: {},
      })}
    >
      <InputBase
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search"
        sx={{
          fontSize: 14,
          width: "100%",
        }}
      />
      <CiSearch size={16} />
    </Box>
  );
};

export default InputSearch;
