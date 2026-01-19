"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { MdTrendingUp, MdOpenInNew } from "react-icons/md";
import { useRouter } from "next/navigation";

const formatCurrency = (value) => {
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `Rp ${(value / 1000).toFixed(1)}K`;
  }
  return `Rp ${value.toLocaleString()}`;
};

const TopSavingsTable = ({ areaId, utilityId }) => {
  const { sendRequest, loading } = useFetchApi();
  const [topSavings, setTopSavings] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTopSavings = async () => {
      try {
        const params = {};
        if (areaId) params.area_id = areaId;
        if (utilityId) params.utility_id = utilityId;
        
        const result = await sendRequest({ url: "/roi-analytics/dashboard", params });
        if (result?.success) {
          setTopSavings(result.data.top_savings || []);
        }
      } catch (error) {
        console.error("Failed to fetch top savings:", error);
      }
    };
    fetchTopSavings();
  }, [areaId, utilityId]);

  const handleRowClick = (woId) => {
    router.push(`/work-orders?highlight=${woId}`);
  };

  return (
    <Card
      sx={(theme) => ({
        borderRadius: "16px",
        border: `1px solid ${theme.palette.mode === "dark" ? "#FFFFFF15" : "#00000010"}`,
        bgcolor: "transparent",
        backdropFilter: "blur(10px)",
        boxShadow: "none",
      })}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <MdTrendingUp size={24} color="#10B981" />
          <Typography variant="h6" fontWeight={600}>
            🏆 Top 10 Work Orders - Biggest Savers
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
            ))}
          </Box>
        ) : topSavings.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Work Order</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Area</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Device</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Loss Avoided</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Net Benefit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topSavings.map((row, index) => (
                  <TableRow
                    key={row.id}
                    onClick={() => handleRowClick(row.id)}
                    sx={{
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      "&:hover": {
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark" ? "#334155" : "#F1F5F9",
                      },
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={index + 1}
                        size="small"
                        sx={{
                          bgcolor:
                            index === 0
                              ? "#FFD700"
                              : index === 1
                              ? "#C0C0C0"
                              : index === 2
                              ? "#CD7F32"
                              : "#E2E8F0",
                          color: index <= 2 ? "#000" : "#64748B",
                          fontWeight: 700,
                          minWidth: 32,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {row.title.length > 40 ? `${row.title.slice(0, 40)}...` : row.title}
                        </Typography>
                        <MdOpenInNew size={14} color="#94A3B8" />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.area}
                        size="small"
                        sx={{
                          bgcolor: "#3B82F620",
                          color: "#3B82F6",
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {row.device}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ color: "#10B981", fontWeight: 600 }}
                      >
                        {formatCurrency(row.loss_avoided)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          color: row.net_benefit >= 0 ? "#3B82F6" : "#EF4444",
                          fontWeight: 700,
                        }}
                      >
                        {row.net_benefit >= 0 ? "+" : ""}
                        {formatCurrency(row.net_benefit)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        {row.completed_at
                          ? new Date(row.completed_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box
            sx={{
              py: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: (theme) => (theme.palette.mode === "dark" ? "#64748B" : "#94A3B8"),
            }}
          >
            <Typography variant="h4" mb={1}>📊</Typography>
            <Typography>No ROI data from completed work orders</Typography>
            <Typography variant="caption">
              Complete work orders to see savings
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TopSavingsTable;
