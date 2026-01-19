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
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import Map, { Marker } from "react-map-gl";
import { useSnackbar } from "notistack";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

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
      "&.Mui-error": {
        color: "#fff",
      },
    },
  },
  "& .MuiInputLabel-root": {
    color: "#fff",
  },
}));

const ModalEditArea = ({ open, setOpen, onSuccessEdit, id }) => {
  const [viewState, setViewState] = useState({
    latitude: -6.2088,
    longitude: 106.8456,
    zoom: 12,
  });
  const [assignedAdminOption, setAssignedAdminOption] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const { sendRequest } = useFetchApi();
  const [statusOption, setStatusOption] = useState([]);
  const theme = useTheme();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      // area_id: "",
      name: "",
      assigned_to_admin_id: "",
      status_id: null,
      date_activation: null,
      // kwh_price: "",
      latitude: null,
      longitude: null,
    },
  });
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const result = await sendRequest({
        url: `/areas/${id}`,
        method: "patch",
        data: {
          ...data,
          latitude: String(data.latitude),
          longitude: String(data.longitude),
        },
      });
      if (result) {
        enqueueSnackbar("Berhasil Mengedit Area", { variant: "success" });
        onSuccessEdit();
      } else {
        enqueueSnackbar("Gagal Mengedit Area", {
          variant: "error",
        });
      }
      reset();
      setOpen(false);
    } catch (error) {
      enqueueSnackbar(error.response?.data || "Gagal Mengedit Area", {
        variant: "error",
      });
      reset();
      setOpen(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      if (!open || !id) return;

      try {
        // 1. Ambil detail area
        const areaResult = await sendRequest({ url: `/areas/${id}` });

        // 2. Ambil semua user
        const usersResult = await sendRequest({ url: "/users" });
        const adminUsers =
          usersResult?.data?.filter((user) => user?.role?.name === "Admin") ||
          [];
        const formattedAdmins = adminUsers.map((user) => ({
          label: user.name,
          value: user.id,
        }));

        // 3. Ambil semua status-area
        const statusResult = await sendRequest({ url: "/area-status" });
        const formattedStatus =
          statusResult?.map((status) => ({
            label: status.name,
            value: status.id,
          })) || [];

        // 4. Set state untuk Autocomplete
        setAssignedAdminOption(formattedAdmins);
        setStatusOption(formattedStatus);

        // 5. Reset form dengan nilai awal
        if (areaResult) {
          reset({
            name: areaResult.name || "",
            latitude: areaResult.latitude ? Number(areaResult.latitude) : null,
            longitude: areaResult.longitude
              ? Number(areaResult.longitude)
              : null,
            date_activation: areaResult.date_activation
              ? dayjs(areaResult.date_activation)
              : null,
            assigned_to_admin_id: areaResult.assigned_to_admin_id || null,
            status_id: areaResult.status_id || null,
          });

          // Update peta jika koordinat valid
          if (areaResult.latitude && areaResult.longitude) {
            setViewState((prev) => ({
              ...prev,
              latitude: Number(areaResult.latitude),
              longitude: Number(areaResult.longitude),
            }));
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      }
    };

    fetchData();
  }, [open, id]);

  useEffect(() => {
    if (
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    ) {
      setViewState((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
    }
  }, [latitude, longitude]);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const result = await sendRequest({ url: "/users" });

  //       const filtered = result?.data?.filter(
  //         (user) => user?.role?.name === "Admin"
  //       );

  //       const formatted = filtered.map((user) => ({
  //         label: user.name,
  //         value: user.id,
  //       }));

  //       setAssignedAdminOption(formatted);
  //     } catch (err) {
  //       console.error("Gagal mengambil user dengan role Admin:", err);
  //     }
  //   };

  //   fetchData();
  // }, []);
  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition>
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            borderRadius: "12px",
            bgcolor: "#ffffff15",
            backdropFilter: "blur(10px)",
            border: "1px solid #fff",
            boxShadow: 24,
          }}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Typography
            sx={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}
          >
            Edit Area
          </Typography>

          <Stack sx={{ gap: "16px" }}>
            {/* <StyledTextField
              label="Area Id"
              variant="outlined"
              {...register("area_id", {
                required: "Area Id wajib diisi",
              })}
              error={!!errors.area_id}
              helperText={errors.area_id?.message}
              fullWidth
            /> */}

            <StyledTextField
              label="Name"
              variant="outlined"
              {...register("name", { required: "Nama wajib diisi" })}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
            {/* <StyledTextField
              label="Location"
              variant="outlined"
              {...register("location", { required: "Lokasi wajib diisi" })}
              error={!!errors.location}
              helperText={errors.location?.message}
              fullWidth
            /> */}
            <Box>
              <Typography sx={{ color: "#fff", mb: 1 }}>
                Pilih Lokasi Area
              </Typography>
              <Map
                viewState={viewState}
                onMove={(evt) => setViewState(evt.viewState)}
                style={{ width: "100%", height: 200, borderRadius: 12 }}
                mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
                onClick={(e) => {
                  const { lat, lng } = e.lngLat;

                  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

                  setValue("latitude", lat);
                  setValue("longitude", lng);
                  setViewState({
                    ...viewState,
                    latitude: lat,
                    longitude: lng,
                  });
                }}
              >
                {latitude && longitude && (
                  <Marker latitude={latitude} longitude={longitude} />
                )}
              </Map>
            </Box>
            <Stack direction="row" spacing={2}>
              <Controller
                name="latitude"
                control={control}
                rules={{
                  required: "Latitude wajib diisi",
                  min: { value: -90, message: "Latitude minimal -90" },
                  max: { value: 90, message: "Latitude maksimal 90" },
                }}
                render={({ field }) => (
                  <StyledTextField
                    {...field}
                    label="Latitude"
                    type="number"
                    inputProps={{
                      min: -90,
                      max: 90,
                      step: "any",
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parsed = parseFloat(val);

                      if (val === "") {
                        field.onChange(null);
                      } else if (!isNaN(parsed)) {
                        const clamped = Math.min(Math.max(parsed, -90), 90);
                        field.onChange(clamped);
                      }
                    }}
                    value={field.value ?? ""}
                    error={!!errors.latitude}
                    helperText={errors.latitude?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="longitude"
                control={control}
                rules={{
                  required: "Longitude wajib diisi",
                  min: { value: -180, message: "Longitude minimal -180" },
                  max: { value: 180, message: "Longitude maksimal 180" },
                }}
                render={({ field }) => (
                  <StyledTextField
                    {...field}
                    label="Longitude"
                    type="number"
                    inputProps={{
                      min: -180,
                      max: 180,
                      step: "any",
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parsed = parseFloat(val);

                      if (val === "") {
                        field.onChange(null);
                      } else if (!isNaN(parsed)) {
                        const clamped = Math.min(Math.max(parsed, -180), 180);
                        field.onChange(clamped);
                      }
                    }}
                    value={field.value ?? ""}
                    error={!!errors.longitude}
                    helperText={errors.longitude?.message}
                    fullWidth
                  />
                )}
              />
            </Stack>

            <Controller
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
                      error={!!errors.status_id}
                      helperText={errors.status_id?.message}
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
              name="assigned_to_admin_id"
              control={control}
              rules={{ required: "Admin wajib dipilih" }}
              render={({ field }) => (
                <Autocomplete
                  options={assignedAdminOption}
                  getOptionLabel={(option) => option.label}
                  value={
                    assignedAdminOption.find(
                      (opt) => opt.value === field.value
                    ) || null
                  }
                  onChange={(_, newValue) =>
                    field.onChange(newValue ? newValue.value : null)
                  }
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Assigned Admin"
                      error={!!errors.assigned_to_admin_id}
                      helperText={errors.assigned_to_admin_id?.message}
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

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="date_activation"
                control={control}
                rules={{ required: "Tanggal wajib dipilih" }}
                render={({ field }) => {
                  const [openPicker, setOpenPicker] = useState(false);
                  return (
                    <DatePicker
                      label="Activation Date"
                      value={field.value ? dayjs(field.value) : null}
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
                          error: !!errors.date_activation,
                          helperText: errors.date_activation?.message,
                          fullWidth: true,
                        },
                      }}
                    />
                  );
                }}
              />
            </LocalizationProvider>

            {/* <StyledTextField
              label="KWH Price"
              variant="outlined"
              {...register("kwh_price", { required: "kwh wajib diisi" })}
              error={!!errors.kwh_price}
              helperText={errors.kwh_price?.message}
              fullWidth
            /> */}
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

export default ModalEditArea;
