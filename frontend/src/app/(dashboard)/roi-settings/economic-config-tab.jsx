"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Skeleton,
  Chip,
} from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { MdAdd, MdEdit, MdDelete, MdAttachMoney } from "react-icons/md";
import { TbSettings, TbCurrencyDollar } from "react-icons/tb";
import ModalEditEconomicConfig from "./modal-edit-economic-config";

const formatCurrency = (value) => {
  if (!value) return "-";
  return `Rp ${value.toLocaleString()}`;
};

const EconomicConfigTab = () => {
  const { sendRequest, loading } = useFetchApi();
  const [configs, setConfigs] = useState([]);
  const [areas, setAreas] = useState([]);
  const [modalEdit, setModalEdit] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedAreaId, setSelectedAreaId] = useState(null);

  const fetchData = async () => {
    try {
      const [configsRes, areasRes] = await Promise.all([
        sendRequest({ url: "/roi-analytics/economic-configs" }),
        sendRequest({ url: "/areas" }),
      ]);
      setConfigs(configsRes?.data || []);
      setAreas(areasRes?.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (config) => {
    setSelectedConfig(config);
    setSelectedAreaId(config.area_id);
    setModalEdit(true);
  };

  const handleAddNew = (areaId) => {
    setSelectedConfig(null);
    setSelectedAreaId(areaId);
    setModalEdit(true);
  };

  const handleDelete = async (areaId) => {
    if (!confirm("Delete economic configuration for this area?")) return;
    
    try {
      await sendRequest({
        url: `/roi-analytics/economic-configs/${areaId}`,
        method: "DELETE",
      });
      fetchData();
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  // Get areas that don't have config yet
  const areasWithoutConfig = areas.filter(
    (area) => !configs.some((c) => c.area_id === area.id)
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TbCurrencyDollar size={28} color="#10B981" />
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Economic Configuration
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Configure economic parameters per area for ROI calculation
          </Typography>
        </Box>
      </Box>

      {/* Info Card */}
      <Card
        sx={(theme) => ({
          borderRadius: "16px",
          border: `1px solid #10B98140`,
          bgcolor: theme.palette.mode === "dark" ? "#10B98110" : "#10B98108",
        })}
      >
        <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
          <MdAttachMoney size={24} color="#10B981" />
          <Box>
            <Typography variant="body2" fontWeight={600} color="#10B981">
              How ROI Calculation Works
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Each area has its own economic parameters. When a Work Order is completed, 
              the system calculates: (1) Loss Avoided = Avoided Downtime × Loss/hour,
              (2) Repair Cost = Labor + Sparepart, (3) Net Benefit = Loss Avoided - Repair Cost,
              (4) ROI = (Net Benefit / Repair Cost) × 100%.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Config Table */}
      <Card
        sx={(theme) => ({
          borderRadius: "16px",
          border: `1px solid ${theme.palette.mode === "dark" ? "#FFFFFF15" : "#00000010"}`,
          bgcolor: "transparent",
          backdropFilter: "blur(10px)",
          boxShadow: "none",
        })}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #E2E8F020" }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Configuration Per Area
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ p: 3 }}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 1, mb: 1 }} />
              ))}
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Area</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Revenue/kWh</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Cost/kWh</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Downtime Loss/hour</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Technician/hour</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Critical Multiplier</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Areas with config */}
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <Chip
                          label={config.area?.name || `Area #${config.area_id}`}
                          size="small"
                          sx={{ bgcolor: "#3B82F620", color: "#3B82F6", fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(config.revenue_per_kwh)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(config.cost_per_kwh)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ color: "#EF4444", fontWeight: 600 }}>
                          {formatCurrency(config.downtime_loss_per_hour)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(config.technician_cost_per_hour)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${config.critical_multiplier}x`}
                          size="small"
                          sx={{ bgcolor: "#F59E0B20", color: "#F59E0B", fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(config)}>
                            <MdEdit size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(config.area_id)}
                            sx={{ color: "#EF4444" }}
                          >
                            <MdDelete size={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Areas without config */}
                  {areasWithoutConfig.map((area) => (
                    <TableRow key={`no-config-${area.id}`} sx={{ bgcolor: "#F1F5F908" }}>
                      <TableCell>
                        <Chip
                          label={area.name}
                          size="small"
                          variant="outlined"
                          sx={{ color: "#94A3B8", borderColor: "#94A3B8" }}
                        />
                      </TableCell>
                      <TableCell align="center" colSpan={5}>
                        <Typography variant="body2" color="textSecondary" fontStyle="italic">
                          Not configured (will use default values)
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<MdAdd />}
                          onClick={() => handleAddNew(area.id)}
                          sx={{ textTransform: "none" }}
                        >
                          Configure
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {configs.length === 0 && areasWithoutConfig.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <TbSettings size={48} color="#94A3B8" />
                        <Typography variant="body1" color="textSecondary" mt={2}>
                          No areas available to configure
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Default Values Info */}
      <Card
        sx={(theme) => ({
          borderRadius: "16px",
          border: `1px solid ${theme.palette.mode === "dark" ? "#FFFFFF10" : "#00000010"}`,
          bgcolor: "transparent",
        })}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
            📌 Default Values (if area is not configured)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Chip label="Revenue: Rp 1,500/kWh" size="small" variant="outlined" />
            <Chip label="Cost: Rp 1,200/kWh" size="small" variant="outlined" />
            <Chip label="Downtime Loss: Rp 150,000/hour" size="small" variant="outlined" />
            <Chip label="Technician: Rp 50,000/hour" size="small" variant="outlined" />
            <Chip label="Critical Multiplier: 2x" size="small" variant="outlined" />
          </Box>
        </CardContent>
      </Card>

      {/* Modal */}
      <ModalEditEconomicConfig
        open={modalEdit}
        setOpen={setModalEdit}
        config={selectedConfig}
        areaId={selectedAreaId}
        areas={areas}
        onSuccess={fetchData}
      />
    </Box>
  );
};

export default EconomicConfigTab;
