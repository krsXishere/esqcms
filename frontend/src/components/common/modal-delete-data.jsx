"use client";
import React from "react";
import {
  Fade,
  Modal,
  Box,
  Button,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material";
import { PiWarningOctagonFill } from "react-icons/pi";
import { useDeleteItem } from "@/app/hook/delete-items/useDeleteItems";
import { useSnackbar } from "notistack";

const ModalDeleteData = ({ open, id, setOpen, endpoint, onSuccessDelete }) => {
  const handleClose = () => setOpen(false);
  const { deleteItem, loading } = useDeleteItem();
  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = async () => {
    const { ok, error } = await deleteItem(endpoint, id);

    if (ok) {
      enqueueSnackbar("Berhasil Menghapus Data", { variant: "success" });
      onSuccessDelete?.();
    } else {
      enqueueSnackbar(error?.message || "Gagal Menghapus data", {
        variant: "error",
      });
    }

    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : handleClose}
      closeAfterTransition
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Fade in={open}>
        <Box
          sx={(theme) => ({
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            p: 4,
            bgcolor: "#FFFFFF",
            borderRadius: "12px",
            display: "flex",
            gap: "20px",
            flexDirection: "column",
            border: "1px solid #E2E8F0",
            [theme.breakpoints.up("xs")]: { width: 370 },
            [theme.breakpoints.up("sm")]: { width: 500 },
          })}
        >
          <Stack
            sx={{ flexDirection: "row", alignItems: "center", gap: "8px" }}
          >
            <PiWarningOctagonFill size={60} color="#ff2056" />
            <Box sx={{ color: "#1E293B" }}>
              <Typography
                variant="h5"
                id="modal-title"
                sx={{ fontWeight: 700 }}
              >
                Delete Item
              </Typography>
              <Typography variant="body2" id="modal-description" sx={{ color: "#64748B" }}>
                Are you sure you want to delete this item?
              </Typography>
            </Box>
          </Stack>

          <Stack
            sx={{ flexDirection: "row", justifyContent: "end", gap: "8px" }}
          >
            <Button
              variant="contained"
              onClick={handleDelete}
              disabled={loading}
              sx={{
                mt: 2,
                bgcolor: "#ff2056",
                "&:hover": { bgcolor: "#e01b4c" },
                minWidth: 120,
              }}
              startIcon={
                loading ? (
                  <CircularProgress size={18} thickness={5} color="inherit" />
                ) : null
              }
            >
              {loading ? "Deleting…" : "Delete"}
            </Button>
            <Button
              variant="contained"
              onClick={handleClose}
              disabled={loading}
              sx={{ mt: 2, minWidth: 100 }}
            >
              Close
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalDeleteData;
