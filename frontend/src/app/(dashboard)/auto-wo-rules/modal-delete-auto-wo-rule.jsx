"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { MdDelete, MdWarning } from "react-icons/md";

const ModalDeleteAutoWORule = ({ open, setOpen, rule, onSuccess }) => {
  const { sendRequest, loading } = useFetchApi();
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setError("");

    try {
      await sendRequest({
        url: `/roi-analytics/auto-wo-rules/${rule.id}`,
        method: "DELETE",
      });
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err?.message || "Failed to delete rule");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "16px" },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <MdWarning size={28} color="#EF4444" />
        <Typography variant="h6" fontWeight={600}>
          Delete Auto WO Rule
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="body1" mb={2}>
            Are you sure you want to delete this rule?
          </Typography>
          <Box
            sx={{
              bgcolor: "#EF444410",
              border: "1px solid #EF444440",
              borderRadius: "12px",
              p: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} color="#EF4444">
              {rule?.name}
            </Typography>
            {rule?.description && (
              <Typography variant="body2" color="textSecondary" mt={0.5}>
                {rule.description}
              </Typography>
            )}
          </Box>
          <Typography variant="body2" color="textSecondary" mt={2}>
            Alarm yang sesuai dengan rule ini tidak akan lagi auto-generate Work Order.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={() => setOpen(false)} sx={{ borderRadius: "8px" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleDelete}
          disabled={loading}
          startIcon={<MdDelete />}
          sx={{
            bgcolor: "#EF4444",
            "&:hover": { bgcolor: "#DC2626" },
            borderRadius: "8px",
            textTransform: "none",
          }}
        >
          {loading ? "Deleting..." : "Delete Rule"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalDeleteAutoWORule;
