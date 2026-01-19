"use client";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
const data = [
  { name: "AREA A", total: 4, running: 4, stopped: 0, faulted: 0, offline: 0 },
  { name: "AREA B", total: 1, running: 1, stopped: 0, faulted: 0, offline: 0 },
  { name: "AREA C", total: 3, running: 1, stopped: 2, faulted: 0, offline: 0 },
  { name: "AREA D", total: 6, running: 5, stopped: 1, faulted: 0, offline: 0 },
  { name: "AREA E", total: 1, running: 1, stopped: 0, faulted: 0, offline: 0 },
  { name: "AREA F", total: 10, running: 9, stopped: 0, faulted: 0, offline: 1 },
  { name: "AREA G", total: 1, running: 4, stopped: 0, faulted: 0, offline: 1 },
  { name: "AREA H", total: 1, running: 1, stopped: 0, faulted: 0, offline: 0 },
  {
    name: "AREA I",
    total: 40,
    running: 25,
    stopped: 0,
    faulted: 0,
    offline: 15,
  },
];
const TableOverview = () => {
  const [overviewData, setOverviewData] = useState();
  const { sendRequest } = useFetchApi();

  useEffect(() => {
    const fetchUtilities = async () => {
      const params = { limit: 5000 };
      const result = await sendRequest({ url: "/utilities/with-status", params });

      const groupedByArea = {};

      result.data.forEach((utility) => {
        const areaName = utility.area?.name || "Unknown Area";
        const statusName = utility.status?.name || "Unknown";

        if (!groupedByArea[areaName]) {
          groupedByArea[areaName] = {
            name: areaName,
            total: 0,
            Running: 0,
            Stopped: 0,
            Faulted: 0,
            Offline: 0,
          };
        }

        groupedByArea[areaName].total += 1;
        groupedByArea[areaName][statusName] =
          (groupedByArea[areaName][statusName] || 0) + 1;
      });

      const formatted = Object.values(groupedByArea);

      setOverviewData(formatted);
    };
    fetchUtilities();
  }, []);

  const theme = useTheme();
  return (
    <Box
      sx={(theme) => ({
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000045",
        borderRadius: "12px",
        [theme.breakpoints.up("xs")]: {
          padding: "8px",
        },
        [theme.breakpoints.up("sm")]: {
          padding: "24px",
        },
        [theme.breakpoints.up("lg")]: {
          padding: "24px",
        },
      })}
    >
      <Typography sx={{ fontSize: "18px", mb: "16px", fontWeight: 600 }}>
        Overview
      </Typography>
      <TableContainer
        className="custom-scroll"
        component={Paper}
        sx={{
          backgroundColor: "inherit",
          boxShadow: "none",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  borderBottom: "1px solid #334155",
                  width: "500px",
                  paddingBlock: "16px",
                }}
              >
                NAME
              </TableCell>
              {["TOTAL", "RUNNING", "STOPPED", "FAULTED", "OFFLINE"].map(
                (header) => (
                  <TableCell
                    key={header}
                    sx={{
                      borderBottom: "1px solid #334155",
                      paddingBlock: "16px",
                    }}
                  >
                    {header}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {overviewData?.length > 0 ? (
              overviewData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ py: 2 }}>{row.name}</TableCell>
                  <TableCell sx={{ py: 2 }}>{row.total}</TableCell>
                  <TableCell sx={{ py: 2 }}>{row.Running}</TableCell>
                  <TableCell sx={{ py: 2 }}>{row.Stopped}</TableCell>
                  <TableCell sx={{ py: 2 }}>{row.Faulted}</TableCell>
                  <TableCell sx={{ py: 2 }}>{row.Offline}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  Data Kosong
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableOverview;
