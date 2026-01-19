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
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { 
  TbEye, 
  TbFileDescription,
  TbFlame,
  TbBolt,
  TbDroplet,
  TbDropletFilled,
} from "react-icons/tb";

// Risk Icons mapping
const RiskIcons = {
  cooling: { icon: <TbFlame size={16} />, label: "Cooling Risk", color: "#EF4444" },
  electrical: { icon: <TbBolt size={16} />, label: "Electrical Risk", color: "#F59E0B" },
  fuel: { icon: <TbDroplet size={16} />, label: "Fuel Risk", color: "#3B82F6" },
  lubrication: { icon: <TbDropletFilled size={16} />, label: "Lubrication Risk", color: "#8B5CF6" },
};

// Mini Health Gauge component
const MiniHealthGauge = ({ value }) => {
  const getColor = () => {
    if (value >= 80) return "#10B981";
    if (value >= 60) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 100 }}>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: "#334155",
            "& .MuiLinearProgress-bar": {
              bgcolor: getColor(),
              borderRadius: 4,
            },
          }}
        />
      </Box>
      <Typography
        sx={{
          fontSize: "12px",
          fontWeight: 700,
          color: getColor(),
          minWidth: 30,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

// Status Badge component
const StatusBadge = ({ status }) => {
  const config = {
    critical: { color: "#EF4444", bgColor: "#EF444420", label: "Critical" },
    "at-risk": { color: "#F59E0B", bgColor: "#F59E0B20", label: "At Risk" },
    healthy: { color: "#10B981", bgColor: "#10B98120", label: "Healthy" },
  };

  const { color, bgColor, label } = config[status] || config.healthy;

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: bgColor,
        color: color,
        fontWeight: 600,
        fontSize: "11px",
        height: "24px",
        border: `1px solid ${color}40`,
      }}
    />
  );
};

const FleetTable = ({ data, filter }) => {
  const theme = useTheme();
  const router = useRouter();

  // Filter data based on active filter
  const filteredData = filter
    ? data.filter((item) => item.status === filter)
    : data;

  // Sort by status priority (critical > at-risk > healthy) then by health index
  const sortedData = [...filteredData].sort((a, b) => {
    const statusPriority = { critical: 0, "at-risk": 1, healthy: 2 };
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    return a.healthIndex - b.healthIndex;
  });

  const handleViewPredictive = (gensetId) => {
    router.push(`/predictive-maintenance?genset=${gensetId}`);
  };

  const handleCreateWO = (gensetId) => {
    router.push(`/work-orders/create?device=${gensetId}`);
  };

  return (
    <Box
      sx={{
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.palette.mode === "dark" ? "#FFFFFF20" : "#00000015",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.mode === "dark" ? "#FFFFFF15" : "#00000010"}` }}>
        <Typography sx={{ fontSize: "18px", fontWeight: 600 }}>
          Fleet Status
          {filter && (
            <Chip
              label={`Filtered: ${filter}`}
              size="small"
              onDelete={() => {}}
              sx={{ ml: 2, textTransform: "capitalize" }}
            />
          )}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          {sortedData.length} generator{sortedData.length !== 1 ? "s" : ""} shown • Click genset name to view predictive details
        </Typography>
      </Box>

      <TableContainer
        className="custom-scroll"
        component={Paper}
        sx={{
          backgroundColor: "inherit",
          boxShadow: "none",
          maxHeight: 500,
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {["Status", "Genset Name", "Location", "Health Index", "Active Risk", "Active DTC", "Load %", "Last Update", "Action"].map(
                (header) => (
                  <TableCell
                    key={header}
                    sx={{
                      bgcolor: theme.palette.mode === "dark" ? "#1e293b" : "#f8fafc",
                      borderBottom: `1px solid ${theme.palette.mode === "dark" ? "#334155" : "#e2e8f0"}`,
                      fontWeight: 600,
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 2,
                    }}
                  >
                    {header}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "&:hover": {
                      bgcolor: theme.palette.mode === "dark" ? "#1e293b50" : "#f1f5f950",
                    },
                    bgcolor: row.status === "critical" 
                      ? (theme.palette.mode === "dark" ? "#EF444410" : "#FEE2E2")
                      : "inherit",
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                      onClick={() => handleViewPredictive(row.id)}
                    >
                      {row.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {row.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2">{row.location}</Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {row.site}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <MiniHealthGauge value={row.healthIndex} />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {row.activeRisks.slice(0, 2).map((risk, i) => (
                        <Tooltip key={i} title={RiskIcons[risk]?.label || risk} arrow>
                          <Box
                            sx={{
                              p: 0.5,
                              borderRadius: "6px",
                              bgcolor: `${RiskIcons[risk]?.color}20`,
                              color: RiskIcons[risk]?.color,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {RiskIcons[risk]?.icon}
                          </Box>
                        </Tooltip>
                      ))}
                      {row.activeRisks.length === 0 && (
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          —
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    {row.activeDTC ? (
                      <Tooltip title={row.dtcDescription} arrow>
                        <Chip
                          label={row.activeDTC}
                          size="small"
                          sx={{
                            bgcolor: "#EF444420",
                            color: "#EF4444",
                            fontFamily: "monospace",
                            fontSize: "11px",
                          }}
                        />
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "#334155",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${row.loadPercent}%`,
                            height: "100%",
                            bgcolor: row.loadPercent > 90 ? "#EF4444" : row.loadPercent > 70 ? "#F59E0B" : "#10B981",
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {row.loadPercent}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="caption">
                      {row.lastUpdate}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="View Predictive" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleViewPredictive(row.id)}
                          sx={{
                            bgcolor: "#3B82F620",
                            color: "#3B82F6",
                            "&:hover": { bgcolor: "#3B82F640" },
                          }}
                        >
                          <TbEye size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Create Work Order" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleCreateWO(row.id)}
                          sx={{
                            bgcolor: "#10B98120",
                            color: "#10B981",
                            "&:hover": { bgcolor: "#10B98140" },
                          }}
                        >
                          <TbFileDescription size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    No generators found with the selected filter
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FleetTable;
