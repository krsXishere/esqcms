"use client";
import React, { useState, useEffect } from "react";
import {
  Fade,
  Modal,
  Box,
  Button,
  Typography,
  Stack,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useSnackbar } from "notistack";

const ModalAddUser = ({ open, setOpen, onSuccessAdd }) => {
  const handleClose = () => setOpen(false);
  const { sendRequest, loading } = useFetchApi();
  const { enqueueSnackbar } = useSnackbar();
  const [adminId, setAdminId] = useState();
  const [assignedRoleId, setAssignedRoleId] = useState();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const getApiErrorMessage = (e) =>
    typeof e === "string"
      ? e
      : e?.message ||
        e?.error ||
        e?.msg ||
        (Array.isArray(e?.errors) ? e.errors[0] : undefined) ||
        e?.detail ||
        "Gagal Menambah User";

  const onSubmit = async (data) => {
    const finalData = {
      ...data,
      role_id: assignedRoleId,
      created_by_admin_id: adminId,
    };

    try {
      const res = await sendRequest({
        url: "/users",
        method: "post",
        data: finalData,
      });

      enqueueSnackbar(res?.message ?? "Berhasil Menambah User", {
        variant: "success",
      });
      onSuccessAdd?.();
      reset();
      setOpen(false);
    } catch (e) {
      console.log(e);

      // 1) Tampilkan pesan error dari API
      enqueueSnackbar(getApiErrorMessage(e), { variant: "error" });

      // 2) (Opsional) Mapping error validasi server ke field form
      //    Misal BE kirim: { errors: { email: "Email sudah terdaftar", name: "Wajib diisi" } }
      if (e?.errors && typeof e.errors === "object") {
        Object.entries(e.errors).forEach(([field, message]) => {
          setError(field, { type: "server", message: String(message) });
        });
      }
      // Catatan: jangan reset/tutup modal di sini, biar user bisa perbaiki input
    }
  };

  useEffect(() => {
    const adminId = localStorage.getItem("adminId");
    const loginRole = localStorage.getItem("role");
    setAdminId(adminId);

    const getRoleID = async () => {
      try {
        const res = await sendRequest({ url: "/roles" });

        const filteredRoles = res?.filter((role) => {
          if (loginRole === "Super Admin") return role.name === "Admin";
          if (loginRole === "Admin") return role.name === "User";
          return false;
        });
        setAssignedRoleId(filteredRoles[0].id);
      } catch (err) {
        console.error("Gagal mengambil roles:", err);
      }
    };

    getRoleID();
  }, []);
  return (
    <Modal
      open={open}
      onClose={handleClose}
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
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            bgcolor: "#ffffff15",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            display: "flex",
            gap: "20px",
            flexDirection: "column",
            border: "1px solid #fff",

            [theme.breakpoints.up("xs")]: {
              p: 2,
              width: 370,
            },
            [theme.breakpoints.up("sm")]: {
              p: 4,
              width: 500,
            },
            [theme.breakpoints.up("lg")]: {},
          })}
          component={"form"}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Stack sx={{ gap: "20px" }}>
            <Typography
              sx={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}
            >
              Add User
            </Typography>
            <Stack sx={{ gap: "16px" }}>
              <TextField
                label="Email"
                variant="outlined"
                type="email"
                {...register("email", {
                  required: "Email wajib diisi",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Email tidak valid",
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
                sx={{
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                  },
                  "& .MuiInputBase-root": {
                    color: "#fff",
                  },
                  "& .MuiInputLabel-root": {
                    color: "#fff",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#fff",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#eaeaea",
                  },
                  "&:hover fieldset": {
                    borderColor: "#fff",
                  },
                }}
              />
              <TextField
                label="Name"
                variant="outlined"
                {...register("name", { required: "Nama wajib diisi" })}
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
                sx={{
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                  },
                  "& .MuiInputBase-root": {
                    color: "#fff",
                  },
                  "& .MuiInputLabel-root": {
                    color: "#fff",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#fff",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#eaeaea",
                  },
                  "&:hover fieldset": {
                    borderColor: "#fff",
                  },
                }}
              />
              <TextField
                label="Username"
                variant="outlined"
                {...register("username", { required: "Username wajib diisi" })}
                error={!!errors.username}
                helperText={errors.username?.message}
                fullWidth
                sx={{
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                  },
                  "& .MuiInputBase-root": {
                    color: "#fff",
                  },
                  "& .MuiInputLabel-root": {
                    color: "#fff",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#fff",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#eaeaea",
                  },
                  "&:hover fieldset": {
                    borderColor: "#fff",
                  },
                }}
              />
              <TextField
                label="Nomor Handphone"
                variant="outlined"
                type="tel"
                {...register("phone_number", {
                  minLength: {
                    value: 12,
                    message: "Nomor Handphone minimal 12 digit",
                  },
                  required: "Nomor Handphone wajib diisi",
                  pattern: {
                    value: /^62(8[1-9][0-9]{6,9})$/,
                    message: "Format nomor HP tidak valid (gunakan awalan 62)",
                  },
                })}
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
                error={!!errors.phone_number}
                helperText={errors.phone_number?.message}
                fullWidth
                sx={{
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                  },
                  "& .MuiInputBase-root": {
                    color: "#fff",
                  },
                  "& .MuiInputLabel-root": {
                    color: "#fff",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#fff",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#eaeaea",
                  },
                  "&:hover fieldset": {
                    borderColor: "#fff",
                  },
                }}
              />
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                {...register("password", {
                  required: "Password wajib diisi",
                  minLength: { value: 6, message: "Minimal 6 karakter" },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                fullWidth
                sx={{
                  borderRadius: "12px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                  },
                  "& .MuiInputBase-root": {
                    color: "#fff",
                  },
                  "& .MuiInputLabel-root": {
                    color: "#fff",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#fff",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#eaeaea",
                  },
                  "&:hover fieldset": {
                    borderColor: "#fff",
                  },
                }}
              />
            </Stack>
          </Stack>
          <Stack
            sx={{ flexDirection: "row", justifyContent: "end", gap: "8px" }}
          >
            <Button
              variant="contained"
              type="submit"
              sx={{
                mt: 2,
                bgcolor: "#01b574",
                borderRadius: "12px",
                "&:hover": {
                  bgcolor: "#019961",
                },
              }}
            >
              Save
            </Button>
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{ mt: 2, borderRadius: "12px" }}
            >
              Close
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalAddUser;
