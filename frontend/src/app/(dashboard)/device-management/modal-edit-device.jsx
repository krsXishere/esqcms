"use client";
import React, { useState, useEffect } from "react";
import {
  Fade,
  Modal,
  Box,
  Button,
  Typography,
  Stack,
  Autocomplete,
  TextField as MuiTextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useSnackbar } from "notistack";

// Styled TextField yang digunakan di semua komponen
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
    "&.Mui-error": {
      color: "#fff",
    },
  },
}));

const statusOption = [
  { label: "Active", value: 1 },
  { label: "Inactive", value: 2 },
];

const ModalEditDevice = ({ open, setOpen, onSuccessEdit, id }) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      serial_number: "",
      name: "",
      area_id: null,
      category_id: null,
    },
  });
  const { sendRequest } = useFetchApi();

  const [assignedAreaOption, setAssignedAreaOption] = useState([]);
  const [categoryOption, setCategoryOption] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const result = await sendRequest({
        url: `/devices/${id}`,
        method: "patch",
        data: data,
      });
      if (result) {
        enqueueSnackbar("Berhasil Mengedit Devices", { variant: "success" });
        onSuccessEdit();
      } else {
        enqueueSnackbar("Gagal Mengedit Devices", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Gagal Mengedit Devices", { variant: "error" });
      console.log(error);
    } finally {
      reset();
      setOpen(false);
    }
  };

  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areaRes, categoryRes] = await Promise.all([
          sendRequest({ url: "/areas" }),
          sendRequest({ url: "/device-categories" }),
        ]);

        const formattedAreas = areaRes?.data?.map((area) => ({
          label: area.name,
          value: area.id,
        }));

        const formattedCategories = categoryRes?.map((category) => ({
          label: category.name,
          value: category.id,
        }));

        setAssignedAreaOption(formattedAreas);
        setCategoryOption(formattedCategories);
      } catch (error) {
        console.error("Gagal fetch data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (open && id) {
        const result = await sendRequest({
          url: `/devices/${id}`,
          method: "get",
        });

        console.log(result);

        if (result) {
          reset({
            name: result.name || "",
            serial_number: result.serial_number || "",
            area_id: result.area_id || null,
            category_id: result.category_id || null,
          });
        }
      }
    };

    fetchUser();
  }, [open, id]);

  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition>
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
          component="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Typography
            sx={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}
          >
            Edit Device
          </Typography>

          <Stack sx={{ gap: "16px" }}>
            <StyledTextField
              label="Serial Number"
              variant="outlined"
              {...register("serial_number", {
                required: "Serial number wajib diisi",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Hanya boleh angka",
                },
              })}
              error={!!errors.serial_number}
              helperText={errors.serial_number?.message}
              fullWidth
            />

            <StyledTextField
              label="Device Name"
              variant="outlined"
              {...register("name", { required: "Nama wajib diisi" })}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />

            <Controller
              name="area_id"
              control={control}
              rules={{ required: "Area wajib dipilih" }}
              render={({ field }) => (
                <Autocomplete
                  options={assignedAreaOption}
                  getOptionLabel={(option) => option.label}
                  value={
                    assignedAreaOption.find(
                      (opt) => opt.value === field.value
                    ) || null
                  }
                  onChange={(_, newValue) =>
                    field.onChange(newValue ? newValue.value : null)
                  }
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Assigned Area"
                      error={!!errors.area_id}
                      helperText={errors.area_id?.message}
                      fullWidth
                    />
                  )}
                  slotProps={{
                    paper: {
                      sx: {
                        bgcolor:
                          theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                        color: theme.palette.mode === "dark" ? "#fff" : "#000",
                        borderRadius: "8px",
                      },
                    },
                  }}
                  sx={{
                    width: "100%",
                    "& .MuiAutocomplete-option": {
                      color: "#fff",
                      "&[aria-selected='true']": { bgcolor: "#2563eb" },
                      "&:hover": { bgcolor: "#334155" },
                    },
                  }}
                />
              )}
            />

            <Controller
              name="category_id"
              control={control}
              rules={{ required: "Kategori wajib dipilih" }}
              render={({ field }) => (
                <Autocomplete
                  options={categoryOption}
                  getOptionLabel={(option) => option.label}
                  value={
                    categoryOption.find((opt) => opt.value === field.value) ||
                    null
                  }
                  onChange={(_, newValue) =>
                    field.onChange(newValue ? newValue.value : null)
                  }
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Category"
                      error={!!errors.category_id}
                      helperText={errors.category_id?.message}
                      fullWidth
                    />
                  )}
                  slotProps={{
                    paper: {
                      sx: {
                        bgcolor:
                          theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                        color: theme.palette.mode === "dark" ? "#fff" : "#000",
                        borderRadius: "8px",
                      },
                    },
                  }}
                  sx={{
                    width: "100%",
                    "& .MuiAutocomplete-option": {
                      color: "#fff",
                      "&[aria-selected='true']": { bgcolor: "#2563eb" },
                      "&:hover": { bgcolor: "#334155" },
                    },
                  }}
                />
              )}
            />
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

export default ModalEditDevice;
