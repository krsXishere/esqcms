"use client";
import React, { useState, useEffect } from "react";
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
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useSnackbar } from "notistack";

const ModalDeleteWorkOrder = ({ open, id, setOpen, onSuccessDelete, workOrderData }) => {
  const { sendRequest, loading } = useFetchApi();
  const { enqueueSnackbar } = useSnackbar();
  const [modalConfig, setModalConfig] = useState({
    title: "Delete Work Order",
    description: "Are you sure you want to delete this work order?",
    actionText: "Delete",
    actionColor: "#ff2056",
  });

  useEffect(() => {
    if (workOrderData?.status) {
      const status = workOrderData.status;
      
      if (status === "cancelled" || status === "closed") {
        setModalConfig({
          title: "Permanently Delete Work Order",
          description: "This work order will be permanently deleted from the database. This action cannot be undone.",
          actionText: "Delete Permanently",
          actionColor: "#ff2056",
        });
      } else if (status === "open" || status === "in_progress") {
        setModalConfig({
          title: "Cancel Work Order",
          description: "This work order will be cancelled and marked as inactive.",
          actionText: "Cancel Work Order",
          actionColor: "#ff9800",
        });
      } else if (status === "completed") {
        setModalConfig({
          title: "Close Work Order",
          description: "This completed work order will be closed and archived.",
          actionText: "Close Work Order",
          actionColor: "#2196f3",
        });
      }
    }
  }, [workOrderData]);

  const handleClose = () => setOpen(false);

  const handleDelete = async () => {
    try {
      const result = await sendRequest({
        url: `/work-orders/${id}`,
        method: "DELETE",
      });

      if (result?.success) {
        enqueueSnackbar(result.message || "Success", { variant: "success" });
        onSuccessDelete?.();
        handleClose();
      } else {
        enqueueSnackbar(result?.message || "Failed", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(error?.message || "Failed to delete work order", {
        variant: "error",
      });
    }
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
            boxShadow: 24,
            p: 4,
            bgcolor: "#ffffff15",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            display: "flex",
            gap: "20px",
            flexDirection: "column",
            border: "1px solid #fff",
            [theme.breakpoints.up("xs")]: { width: 370 },
            [theme.breakpoints.up("sm")]: { width: 500 },
          })}
        >
          <Stack
            sx={{ flexDirection: "row", alignItems: "center", gap: "8px" }}
          >
            <PiWarningOctagonFill size={60} color={modalConfig.actionColor} />
            <Box sx={{ color: "#fff" }}>
              <Typography
                variant="h5"
                id="modal-title"
                sx={{ fontWeight: 700 }}
              >
                {modalConfig.title}
              </Typography>
              <Typography variant="body2" id="modal-description">
                {modalConfig.description}
              </Typography>
            </Box>
          </Stack>

          <Stack
            sx={{ flexDirection: "row", justifyContent: "end", gap: "8px" }}
          >
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
              sx={{
                mt: 2,
                borderColor: "#fff",
                color: "#fff",
                "&:hover": { 
                  borderColor: "#ddd",
                  bgcolor: "rgba(255, 255, 255, 0.1)"
                },
                minWidth: 120,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleDelete}
              disabled={loading}
              sx={{
                mt: 2,
                bgcolor: modalConfig.actionColor,
                "&:hover": { 
                  bgcolor: modalConfig.actionColor,
                  filter: "brightness(0.85)"
                },
                minWidth: 120,
              }}
              startIcon={
                loading ? (
                  <CircularProgress size={18} thickness={5} color="inherit" />
                ) : null
              }
            >
              {loading ? "Processing..." : modalConfig.actionText}
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalDeleteWorkOrder;
