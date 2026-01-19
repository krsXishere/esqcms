"use client";
import React, { useState, useEffect } from "react";
import {
  Fade,
  Modal,
  Box,
  Button,
  Typography,
  Stack,
  TextField as MuiTextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Pagination,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useSnackbar } from "notistack";
import { MdAdd, MdClose, MdFileDownload } from "react-icons/md";

const StyledTextField = styled(MuiTextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 16,
    color: "#fff",
    "& fieldset": {
      borderColor: "#fff",
    },
    "&:hover fieldset": {
      borderColor: "#eaeaea",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#38bdf8",
      boxShadow: "0 0 14px rgba(56,189,248,0.5)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#fff",
  },
}));

const ModalDetailSparepart = ({ open, setOpen, sparepartId, onUpdate }) => {
  const { sendRequest, loading } = useFetchApi();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [sparepart, setSparepart] = useState(null);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Inbound form
  const [showInboundForm, setShowInboundForm] = useState(false);
  const [inboundAmount, setInboundAmount] = useState(1);
  const [inboundDescription, setInboundDescription] = useState("");
  const [inboundDate, setInboundDate] = useState(dayjs());

  // Outbound form
  const [showOutboundForm, setShowOutboundForm] = useState(false);
  const [outboundAmount, setOutboundAmount] = useState(1);
  const [outboundDescription, setOutboundDescription] = useState("");
  const [outboundDate, setOutboundDate] = useState(dayjs());

  const fetchLogs = async () => {
    if (!sparepartId) return;
    
    setLoadingLogs(true);
    try {
      const result = await sendRequest({
        url: `/spareparts/${sparepartId}/logs`,
        params: {
          page,
          limit: 10,
          type: filterType === "all" ? undefined : filterType,
          sort: sortOrder,
        },
      });

      if (result?.success) {
        setSparepart(result.sparepart);
        setLogs(result.data || []);
        setTotalPages(result.meta?.totalPages || 1);
        setTotal(result.meta?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (open && sparepartId) {
      fetchLogs();
    }
  }, [open, sparepartId, page, filterType, sortOrder]);

  useEffect(() => {
    if (open) {
      setPage(1);
      setShowInboundForm(false);
      setShowOutboundForm(false);
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setSparepart(null);
    setLogs([]);
  };

  const handleFilterChange = (_, newFilter) => {
    if (newFilter !== null) {
      setFilterType(newFilter);
      setPage(1);
    }
  };

  const handleAddInbound = async () => {
    if (inboundAmount < 1) {
      enqueueSnackbar("Amount must be at least 1", { variant: "error" });
      return;
    }

    try {
      const result = await sendRequest({
        url: `/spareparts/${sparepartId}/inbound`,
        method: "POST",
        data: {
          amount: parseInt(inboundAmount),
          description: inboundDescription || "Manual stock inbound",
          transaction_at: inboundDate.toISOString(),
        },
      });

      if (result?.success) {
        enqueueSnackbar("Inbound stock added successfully", { variant: "success" });
        setShowInboundForm(false);
        setInboundAmount(1);
        setInboundDescription("");
        setInboundDate(dayjs());
        fetchLogs();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      enqueueSnackbar("Failed to add inbound stock", { variant: "error" });
    }
  };

  const handleAddOutbound = async () => {
    if (outboundAmount < 1) {
      enqueueSnackbar("Amount must be at least 1", { variant: "error" });
      return;
    }

    if (!outboundDescription.trim()) {
      enqueueSnackbar("Description is required for outbound", { variant: "error" });
      return;
    }

    try {
      const result = await sendRequest({
        url: `/spareparts/${sparepartId}/outbound`,
        method: "POST",
        data: {
          amount: parseInt(outboundAmount),
          description: outboundDescription,
          transaction_at: outboundDate.toISOString(),
        },
      });

      if (result?.success) {
        enqueueSnackbar("Outbound stock recorded successfully", { variant: "success" });
        setShowOutboundForm(false);
        setOutboundAmount(1);
        setOutboundDescription("");
        setOutboundDate(dayjs());
        fetchLogs();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      enqueueSnackbar(error?.message || "Failed to record outbound stock", { variant: "error" });
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/spareparts/${sparepartId}/logs/export?type=${filterType}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sparepart_logs_${sparepartId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      enqueueSnackbar("Failed to export logs", { variant: "error" });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate stock in days
  const stockInDays = sparepart?.safety_stock > 0 
    ? (sparepart.stock_value / sparepart.safety_stock).toFixed(1) 
    : 0;

  return (
    <Modal open={open} onClose={handleClose}>
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: "90%", md: "800px" },
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: theme.palette.mode === "dark" ? "#0f172a" : "#ffffff",
            borderRadius: 3,
            boxShadow: 24,
            p: 3,
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5" fontWeight={700}>
              {sparepart?.name || "Loading..."}
            </Typography>
            <IconButton onClick={handleClose}>
              <MdClose size={24} />
            </IconButton>
          </Box>

          {/* Stock Info */}
          {sparepart && (
            <Box sx={{ mb: 3 }}>
              <Typography>Current Stock: <strong>{sparepart.stock_value} {sparepart.unit}</strong></Typography>
              <Typography>Safety Stock: <strong>{sparepart.safety_stock}</strong></Typography>
              <Typography>Stock: <strong>{stockInDays} day(s)</strong></Typography>
            </Box>
          )}

          {/* Filter & Sort */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="newest">Newest to Latest</MenuItem>
                <MenuItem value="oldest">Oldest to Latest</MenuItem>
              </Select>
            </FormControl>

            <ToggleButtonGroup
              value={filterType}
              exclusive
              onChange={handleFilterChange}
              size="small"
            >
              <ToggleButton value="all" sx={{ px: 3 }}>All</ToggleButton>
              <ToggleButton value="inbound" sx={{ px: 3 }}>Inbound</ToggleButton>
              <ToggleButton value="outbound" sx={{ px: 3 }}>Outbound</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<MdAdd />}
              onClick={() => {
                setShowInboundForm(true);
                setShowOutboundForm(false);
              }}
              sx={{ borderRadius: 2 }}
            >
              Add Inbound
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<MdAdd />}
              onClick={() => {
                setShowOutboundForm(true);
                setShowInboundForm(false);
              }}
              sx={{ borderRadius: 2 }}
            >
              Add Outbound
            </Button>
            <Button
              variant="outlined"
              startIcon={<MdFileDownload />}
              onClick={handleExport}
              sx={{ borderRadius: 2, ml: "auto" }}
            >
              Export to xlsx
            </Button>
          </Box>

          {/* Inbound Form */}
          {showInboundForm && (
            <Box sx={{ 
              mb: 2, 
              p: 2, 
              borderRadius: 2, 
              bgcolor: theme.palette.mode === "dark" ? "#1e3a5f" : "#e0f2fe",
              border: "1px solid #0ea5e9"
            }}>
              <Typography fontWeight={600} sx={{ mb: 2 }}>Add Inbound Stock</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack spacing={2}>
                  <StyledTextField
                    label="Amount"
                    type="number"
                    value={inboundAmount}
                    onChange={(e) => setInboundAmount(e.target.value)}
                    inputProps={{ min: 1 }}
                    fullWidth
                    size="small"
                  />
                  <StyledTextField
                    label="Description"
                    value={inboundDescription}
                    onChange={(e) => setInboundDescription(e.target.value)}
                    placeholder="e.g., Purchased from supplier"
                    fullWidth
                    size="small"
                  />
                  <DateTimePicker
                    label="Transaction Date"
                    value={inboundDate}
                    onChange={(newValue) => setInboundDate(newValue)}
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="contained" onClick={handleAddInbound} disabled={loading}>
                      {loading ? <CircularProgress size={20} /> : "Save"}
                    </Button>
                    <Button variant="outlined" onClick={() => setShowInboundForm(false)}>
                      Cancel
                    </Button>
                  </Box>
                </Stack>
              </LocalizationProvider>
            </Box>
          )}

          {/* Outbound Form */}
          {showOutboundForm && (
            <Box sx={{ 
              mb: 2, 
              p: 2, 
              borderRadius: 2, 
              bgcolor: theme.palette.mode === "dark" ? "#3f1e1e" : "#fee2e2",
              border: "1px solid #ef4444"
            }}>
              <Typography fontWeight={600} sx={{ mb: 2 }}>Add Outbound Stock</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack spacing={2}>
                  <StyledTextField
                    label="Amount"
                    type="number"
                    value={outboundAmount}
                    onChange={(e) => setOutboundAmount(e.target.value)}
                    inputProps={{ min: 1 }}
                    fullWidth
                    size="small"
                  />
                  <StyledTextField
                    label="Description *"
                    value={outboundDescription}
                    onChange={(e) => setOutboundDescription(e.target.value)}
                    placeholder="e.g., Used for maintenance"
                    fullWidth
                    size="small"
                    required
                  />
                  <DateTimePicker
                    label="Transaction Date"
                    value={outboundDate}
                    onChange={(newValue) => setOutboundDate(newValue)}
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="contained" color="error" onClick={handleAddOutbound} disabled={loading}>
                      {loading ? <CircularProgress size={20} /> : "Save"}
                    </Button>
                    <Button variant="outlined" onClick={() => setShowOutboundForm(false)}>
                      Cancel
                    </Button>
                  </Box>
                </Stack>
              </LocalizationProvider>
            </Box>
          )}

          {/* Logs Table */}
          <TableContainer sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>DATE</TableCell>
                  <TableCell>AMOUNT</TableCell>
                  <TableCell>DESCRIPTION</TableCell>
                  <TableCell align="center">TYPE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingLogs ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, index) => (
                    <TableRow key={log.id}>
                      <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
                      <TableCell>{formatDate(log.transaction_at)}</TableCell>
                      <TableCell>{log.amount} {sparepart?.unit}</TableCell>
                      <TableCell>{log.description || "-"}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={log.type === "inbound" ? "Inbound" : "Outbound"}
                          size="small"
                          sx={{
                            backgroundColor: log.type === "inbound" ? "#22c55e" : "#ef4444",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              variant="outlined"
              shape="rounded"
            />
          </Box>

          {/* Close Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" onClick={handleClose} sx={{ borderRadius: 2 }}>
              Close
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalDetailSparepart;
