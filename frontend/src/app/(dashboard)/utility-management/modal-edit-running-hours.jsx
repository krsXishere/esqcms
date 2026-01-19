"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Fade,
  Button,
  Box,
  Typography,
  Alert,
  Stack,
  TextField as MuiTextField,
  styled,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { AccessTime, Refresh, Edit } from "@mui/icons-material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useTheme } from "@mui/material/styles";

const StyledTextField = styled(MuiTextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    "& fieldset": {
      borderColor: theme.palette.mode === "dark" ? "#fff" : "#00000050",
    },
    "&:hover fieldset": {
      borderColor: theme.palette.mode === "dark" ? "#38bdf8" : "#00000090",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#38bdf8",
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 0 0 3px rgba(56, 189, 248, 0.2)"
          : "0 0 0 3px rgba(56, 189, 248, 0.1)",
    },
    "& input": {
      color: theme.palette.mode === "dark" ? "#fff" : "#000",
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
    "&.Mui-focused": {
      color: "#38bdf8",
    },
  },
  "& .MuiFormHelperText-root": {
    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
  },
}));

const ModalEditRunningHours = ({ open, setOpen, utility, onSuccessEdit }) => {
  const { sendRequest } = useFetchApi();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState(null);
  const [runningHours, setRunningHours] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Initialize form when utility changes
  useEffect(() => {
    if (utility && open) {
      setRunningHours(utility.running_hours?.toString() || "0");
      setError(null);
    }
  }, [utility, open]);

  const handleSubmit = async () => {
    const hours = parseFloat(runningHours);
    if (isNaN(hours) || hours < 0) {
      setError("Running hours must be a valid positive number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await sendRequest({
        url: `/utilities/${utility.id}/running-hours`,
        method: "PUT",
        data: { running_hours: hours },
      });

      if (response?.success) {
        setSnackbar({ open: true, message: "Running hours updated successfully", severity: "success" });
        setOpen(false);
        if (onSuccessEdit) onSuccessEdit();
      } else {
        setError(response?.message || "Failed to update running hours");
      }
    } catch (err) {
      console.error("Error updating running hours:", err);
      setError(err.response?.data?.message || "Failed to update running hours");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset running hours to 0?")) return;

    setResetting(true);
    setError(null);

    try {
      const response = await sendRequest({
        url: `/utilities/${utility.id}/running-hours/reset`,
        method: "POST",
      });

      if (response?.success) {
        setRunningHours("0");
        setSnackbar({ open: true, message: "Running hours reset to 0", severity: "success" });
        if (onSuccessEdit) onSuccessEdit();
      } else {
        setError(response?.message || "Failed to reset running hours");
      }
    } catch (err) {
      console.error("Error resetting running hours:", err);
      setError(err.response?.data?.message || "Failed to reset running hours");
    } finally {
      setResetting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setOpen(false);
  };

  const formatLastUpdated = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!utility) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: 370, sm: 450 },
              bgcolor: theme.palette.mode === "dark" ? "#ffffff15" : "#fff",
              backdropFilter: "blur(10px)",
              borderRadius: "24px",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "12px",
                  bgcolor: "rgba(56, 189, 248, 0.15)",
                }}
              >
                <AccessTime sx={{ color: "#38bdf8", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.mode === "dark" ? "#fff" : "#000",
                  }}
                >
                  Edit Running Hours
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b",
                  }}
                >
                  {utility.name}
                </Typography>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Stack spacing={3}>
              {/* Current Info */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.mode === "dark" ? "#ffffff10" : "#f1f5f9",
                  borderRadius: "12px",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b" }}
                  >
                    Area:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.mode === "dark" ? "#fff" : "#000", fontWeight: 600 }}
                  >
                    {utility.area?.name}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b" }}
                  >
                    Status:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: utility.is_running ? "#22c55e" : "#94a3b8",
                      fontWeight: 600,
                    }}
                  >
                    {utility.is_running ? "🟢 Running" : "⚪ Stopped"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b" }}
                  >
                    Last Updated:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.mode === "dark" ? "#fff" : "#000" }}
                  >
                    {formatLastUpdated(utility.running_hours_last_updated)}
                  </Typography>
                </Box>
              </Box>

              {/* Running Hours Input */}
              <StyledTextField
                label="Running Hours"
                type="number"
                value={runningHours}
                onChange={(e) => setRunningHours(e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <Typography sx={{ color: theme.palette.mode === "dark" ? "#94a3b8" : "#64748b", mr: 1 }}>
                      hours
                    </Typography>
                  ),
                }}
                helperText="Enter total running hours for this utility"
              />
            </Stack>

            <Stack
              sx={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: "8px",
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={resetting || loading}
                startIcon={resetting ? <CircularProgress size={16} /> : <Refresh />}
                sx={{
                  borderRadius: "12px",
                  borderColor: "#f59e0b",
                  color: "#f59e0b",
                  "&:hover": {
                    borderColor: "#d97706",
                    bgcolor: "rgba(245, 158, 11, 0.1)",
                  },
                }}
              >
                {resetting ? "Resetting..." : "Reset to 0"}
              </Button>
              
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  disabled={loading || resetting}
                  sx={{ borderRadius: "12px" }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || resetting}
                  startIcon={loading ? <CircularProgress size={16} /> : <Edit />}
                  sx={{
                    bgcolor: "#01b574",
                    borderRadius: "12px",
                    "&:hover": {
                      bgcolor: "#019961",
                    },
                  }}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Fade>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ModalEditRunningHours;
