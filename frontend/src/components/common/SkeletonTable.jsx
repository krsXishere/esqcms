"use client";
import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
} from "@mui/material";

/**
 * SkeletonTable Component
 * Loading placeholder for DataTable
 */
const SkeletonTable = ({
  columns = 5,
  rows = 10,
  showHeader = true,
  showPagination = true,
}) => {
  return (
    <Paper
      sx={{
        bgcolor: "#FFFFFF",
        borderRadius: 2,
        border: "1px solid #E2E8F0",
        overflow: "hidden",
      }}
    >
      <TableContainer>
        <Table>
          {showHeader && (
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                {Array.from({ length: columns }).map((_, index) => (
                  <TableCell key={index} sx={{ py: 1.5 }}>
                    <Skeleton
                      variant="text"
                      width={index === 0 ? 30 : 80 + Math.random() * 40}
                      height={20}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex} sx={{ py: 2 }}>
                    <Skeleton
                      variant="text"
                      width={
                        colIndex === 0
                          ? 20
                          : colIndex === columns - 1
                          ? 80
                          : 60 + Math.random() * 80
                      }
                      height={24}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderTop: "1px solid #E2E8F0",
          }}
        >
          <Skeleton variant="text" width={200} height={24} />
          <Box sx={{ display: "flex", gap: 1 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                width={32}
                height={32}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default SkeletonTable;
