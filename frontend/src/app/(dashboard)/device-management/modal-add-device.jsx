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

const ModalAddDevice = ({ open, setOpen, onSuccessAdd }) => {
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
      // status_id: null,
      area_id: null,
      category_id: null,
      // activation_date: null,
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
        url: "/devices",
        method: "post",
        data: data,
      });
      if (result) {
        enqueueSnackbar("Berhasil Menambah Devices", { variant: "success" });
        onSuccessAdd();
      } else {
        enqueueSnackbar("Gagal Menambah Devices", { variant: "error" });
      }
    } catch (error) {
      console.log(error.message);
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
            Add Device
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
                minLength: {
                  value: 4,
                  message: "Minimal 4 digit",
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

            {/* <Controller
              name="status_id"
              control={control}
              rules={{ required: "Status wajib dipilih" }}
              render={({ field }) => (
                <Autocomplete
                  options={statusOption}
                  getOptionLabel={(option) => option.label}
                  value={
                    statusOption.find((opt) => opt.value === field.value) ||
                    null
                  }
                  onChange={(_, newValue) =>
                    field.onChange(newValue ? newValue.value : null)
                  }
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Status"
                      error={!!errors.status}
                      helperText={errors.status?.message}
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
            /> */}

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

            {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                name="activation_date"
                control={control}
                rules={{ required: "Tanggal wajib dipilih" }}
                render={({ field }) => {
                  const [openPicker, setOpenPicker] = useState(false);

                  return (
                    <DatePicker
                      label="Activation Date"
                      value={field.value ?? null}
                      open={openPicker}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                        setOpenPicker(false);
                      }}
                      onOpen={() => setOpenPicker(true)}
                      onClose={() => setOpenPicker(false)}
                      slots={{ textField: StyledTextField }}
                      enableAccessibleFieldDOMStructure={false}
                      slotProps={{
                        textField: {
                          onClick: () => setOpenPicker(true),
                          error: !!errors.activation_date,
                          helperText: errors.activation_date?.message,
                          fullWidth: true,
                        },
                        popper: {
                          sx: {
                            "& .MuiPaper-root": {
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "#1e293b"
                                  : "#fff",
                              color:
                                theme.palette.mode === "dark" ? "#fff" : "#000",
                              borderRadius: "8px",
                              mt: 1,
                            },
                            "& .MuiPickersDay-root": {
                              color:
                                theme.palette.mode === "dark" ? "#fff" : "#000",
                              "&.Mui-selected": {
                                bgcolor:
                                  theme.palette.mode === "dark"
                                    ? "#2563eb"
                                    : "#77cdff",
                              },
                              "&:hover": {
                                bgcolor:
                                  theme.palette.mode === "dark"
                                    ? "#334155"
                                    : "#00000020",
                              },
                            },
                            "& .MuiPickersCalendarHeader-label": {
                              color:
                                theme.palette.mode === "dark"
                                  ? "#77cdff"
                                  : "#2563eb",
                              fontWeight: 600,
                            },
                            "& .MuiPickersArrowSwitcher-button": {
                              color: "#38bdf8",
                            },
                          },
                        },
                      }}
                    />
                  );
                }}
              />
            </LocalizationProvider> */}
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

export default ModalAddDevice;
