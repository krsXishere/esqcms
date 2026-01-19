"use client";
import { Box, Container } from "@mui/material";

export default function AppContainer(props) {
  return (
    <Box
      //   disableGutters={false}
      sx={(theme) => ({
        paddingBlock: "16px",
        width: "100%",
        ...props.sx,
        [theme.breakpoints.up("xs")]: {
          paddingInline: "12px",
        },
        [theme.breakpoints.up("sm")]: {
          paddingInline: "24px",
        },
        [theme.breakpoints.up("lg")]: {},
      })}
      {...props}
    />
  );
}
