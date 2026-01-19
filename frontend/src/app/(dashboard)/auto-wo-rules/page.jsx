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
  Chip,
  IconButton,
  Switch,
  Tooltip,
  Skeleton,
} from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { MdAdd, MdEdit, MdDelete, MdAutoAwesome } from "react-icons/md";
import { TbRobot, TbBolt } from "react-icons/tb";
import ModalAddAutoWORule from "./modal-add-auto-wo-rule";
import ModalEditAutoWORule from "./modal-edit-auto-wo-rule";
import ModalDeleteAutoWORule from "./modal-delete-auto-wo-rule";

const formatCurrency = (value) => {
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}M/jam`;
  } else if (value >= 1000) {
    return `Rp ${(value / 1000).toFixed(0)}K/jam`;
  }
  return `Rp ${value.toLocaleString()}/jam`;
};

const severityColors = {
  warning: { bg: "#F59E0B20", color: "#F59E0B" },
  critical: { bg: "#EF444420", color: "#EF4444" },
  emergency: { bg: "#DC262620", color: "#DC2626" },
};

const priorityColors = {
  low: { bg: "#6B728020", color: "#6B7280" },
  medium: { bg: "#3B82F620", color: "#3B82F6" },
  high: { bg: "#F59E0B20", color: "#F59E0B" },
  critical: { bg: "#EF444420", color: "#EF4444" },
};

const AutoWORulesPage = () => {
  const { sendRequest, loading } = useFetchApi();
  const [rules, setRules] = useState([]);
  const [modalAdd, setModalAdd] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  const fetchRules = async () => {
    try {
      const result = await sendRequest({ url: "/roi-analytics/auto-wo-rules" });
      if (result?.success) {
        setRules(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch rules:", error);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleActive = async (rule) => {
    try {
      await sendRequest({
        url: `/roi-analytics/auto-wo-rules/${rule.id}`,
        method: "PATCH",
        data: { is_active: !rule.is_active },
      });
      fetchRules();
    } catch (error) {
      console.error("Failed to toggle rule:", error);
    }
  };

  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setModalEdit(true);
  };

  const handleDelete = (rule) => {
    setSelectedRule(rule);
    setModalDelete(true);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TbRobot size={32} color="#8B5CF6" />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Auto Work Order Rules
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Set up rules to auto-generate WO from alarms
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<MdAdd />}
          onClick={() => setModalAdd(true)}
          sx={{
            bgcolor: "#8B5CF6",
            "&:hover": { bgcolor: "#7C3AED" },
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Add Rule
        </Button>
      </Box>

      {/* Info Card */}
      <Card
        sx={(theme) => ({
          borderRadius: "16px",
          border: `1px solid #8B5CF640`,
          bgcolor: theme.palette.mode === "dark" ? "#8B5CF610" : "#8B5CF608",
        })}
      >
        <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
          <MdAutoAwesome size={24} color="#8B5CF6" />
          <Box>
            <Typography variant="body2" fontWeight={600} color="#8B5CF6">
              How Auto WO Works
            </Typography>
            <Typography variant="caption" color="textSecondary">
              When a new alarm appears, the system will match it with active rules. 
              If a rule matches (based on keyword, metric, or severity), 
              a Work Order will be automatically created with the specified priority and SLA.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card
        sx={(theme) => ({
          borderRadius: "16px",
          border: `1px solid ${theme.palette.mode === "dark" ? "#FFFFFF20" : "#00000015"}`,
          bgcolor: theme.palette.mode === "dark" ? "#1E293B" : "#FFFFFF",
        })}
      >
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 1, mb: 1 }} />
              ))}
            </Box>
          ) : rules.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Nama Rule</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trigger</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>WO Priority</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>SLA</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Est. Loss</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Scope</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <Switch
                          checked={rule.is_active}
                          onChange={() => handleToggleActive(rule)}
                          size="small"
                          color="success"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {rule.name}
                          </Typography>
                          {rule.description && (
                            <Typography variant="caption" color="textSecondary">
                              {rule.description.slice(0, 50)}...
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          {rule.alarm_keyword && (
                            <Chip
                              label={`Keyword: ${rule.alarm_keyword}`}
                              size="small"
                              sx={{ bgcolor: "#10B98120", color: "#10B981", fontSize: "10px" }}
                            />
                          )}
                          {rule.metric_name && (
                            <Chip
                              label={`Metric: ${rule.metric_name}`}
                              size="small"
                              sx={{ bgcolor: "#3B82F620", color: "#3B82F6", fontSize: "10px" }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<TbBolt size={12} />}
                          label={rule.severity}
                          size="small"
                          sx={{
                            bgcolor: severityColors[rule.severity]?.bg || "#E2E8F0",
                            color: severityColors[rule.severity]?.color || "#64748B",
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rule.wo_priority}
                          size="small"
                          sx={{
                            bgcolor: priorityColors[rule.wo_priority]?.bg || "#E2E8F0",
                            color: priorityColors[rule.wo_priority]?.color || "#64748B",
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{rule.sla_hours} jam</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#EF4444", fontWeight: 500 }}>
                          {rule.estimated_loss_per_hour > 0
                            ? formatCurrency(rule.estimated_loss_per_hour)
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          {rule.area ? (
                            <Chip
                              label={rule.area.name}
                              size="small"
                              sx={{ fontSize: "10px" }}
                            />
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              All Areas
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(rule)}>
                            <MdEdit size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(rule)}
                            sx={{ color: "#EF4444" }}
                          >
                            <MdDelete size={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                py: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TbRobot size={64} color="#94A3B8" />
              <Typography variant="h6" color="textSecondary" mt={2}>
                No Auto WO Rules yet
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Create your first rule to start auto-generating Work Orders
              </Typography>
              <Button
                variant="outlined"
                startIcon={<MdAdd />}
                onClick={() => setModalAdd(true)}
                sx={{ borderRadius: "12px", textTransform: "none" }}
              >
                Add First Rule
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ModalAddAutoWORule
        open={modalAdd}
        setOpen={setModalAdd}
        onSuccess={fetchRules}
      />
      <ModalEditAutoWORule
        open={modalEdit}
        setOpen={setModalEdit}
        rule={selectedRule}
        onSuccess={fetchRules}
      />
      <ModalDeleteAutoWORule
        open={modalDelete}
        setOpen={setModalDelete}
        rule={selectedRule}
        onSuccess={fetchRules}
      />
    </Box>
  );
};

export default AutoWORulesPage;
