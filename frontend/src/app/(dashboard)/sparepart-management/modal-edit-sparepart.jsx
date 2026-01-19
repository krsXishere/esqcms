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
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useSnackbar } from "notistack";

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

const CATEGORIES = [
  { label: "Mechanical", value: "Mechanical" },
  { label: "Electrical", value: "Electrical" },
  { label: "Sensor", value: "Sensor" },
  { label: "Pneumatic", value: "Pneumatic" },
  { label: "Automation", value: "Automation" },
  { label: "Consumable", value: "Consumable" },
  { label: "Safety", value: "Safety" },
];

const UNITS = [
  { label: "pcs", value: "pcs" },
  { label: "unit", value: "unit" },
  { label: "set", value: "set" },
  { label: "kg", value: "kg" },
  { label: "g", value: "g" },
  { label: "liter", value: "liter" },
  { label: "meter", value: "meter" },
  { label: "roll", value: "roll" },
  { label: "box", value: "box" },
];

const ModalEditSparepart = ({ open, setOpen, onSuccessEdit, id }) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      material_number: "",
      name: "",
      category: null,
      stock_value: 0,
      unit: null,
      unit_price: 0,
      supplier: "",
      safety_stock: 0,
      status: true,
      area_id: null,
    },
  });
  
  const { sendRequest, loading } = useFetchApi();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [areaOptions, setAreaOptions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const submitData = {
        material_number: data.material_number,
        name: data.name,
        category: data.category?.value || data.category,
        unit: data.unit?.value || data.unit,
        area_id: data.area_id?.value || data.area_id,
        stock_value: parseInt(data.stock_value) || 0,
        unit_price: parseFloat(data.unit_price) || 0,
        safety_stock: parseInt(data.safety_stock) || 0,
        supplier: data.supplier,
        status: data.status,
      };

      const result = await sendRequest({
        url: `/spareparts/${id}`,
        method: "PATCH",
        data: submitData,
      });

      if (result?.success) {
        enqueueSnackbar("Successfully updated sparepart", { variant: "success" });
        onSuccessEdit();
        handleClose();
      } else {
        enqueueSnackbar("Failed to update sparepart", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(error.message || "Failed to update sparepart", { variant: "error" });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!open || !id) return;
      
      setLoadingData(true);
      try {
        const [sparepartResult, areaResult] = await Promise.all([
          sendRequest({ url: `/spareparts/${id}` }),
          sendRequest({ url: "/areas" }),
        ]);

        // Set area options
        if (areaResult?.data) {
          const formatted = areaResult.data.map((area) => ({
            label: area.name,
            value: area.id,
          }));
          setAreaOptions(formatted);
        }

        // Set form values
        if (sparepartResult?.success && sparepartResult?.data) {
          const sparepart = sparepartResult.data;
          setValue("material_number", sparepart.material_number || "");
          setValue("name", sparepart.name || "");
          setValue("stock_value", sparepart.stock_value || 0);
          setValue("unit_price", sparepart.unit_price || 0);
          setValue("supplier", sparepart.supplier || "");
          setValue("safety_stock", sparepart.safety_stock || 0);
          setValue("status", sparepart.status ?? true);
          
          // Set category
          const categoryOption = CATEGORIES.find(c => c.value === sparepart.category);
          setValue("category", categoryOption || null);
          
          // Set unit
          const unitOption = UNITS.find(u => u.value === sparepart.unit);
          setValue("unit", unitOption || null);
          
          // Set area
          if (sparepart.area) {
            setValue("area_id", { label: sparepart.area.name, value: sparepart.area.id });
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
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
            [theme.breakpoints.up("md")]: {
              width: 600,
            },
          })}
        >
          <Typography
            variant="h5"
            sx={{
              color: "#fff",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            Edit Sparepart
          </Typography>

          {loadingData ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                {/* Sparepart Number */}
                <StyledTextField
                  {...register("material_number", { required: "Sparepart number is required" })}
                  label="Sparepart Number *"
                  error={!!errors.material_number}
                  helperText={errors.material_number?.message}
                  fullWidth
                />

                {/* Name */}
                <StyledTextField
                  {...register("name", { required: "Sparepart name is required" })}
                  label="Sparepart Name *"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                />

                {/* Category */}
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={CATEGORIES}
                      getOptionLabel={(option) => option.label || option}
                      isOptionEqualToValue={(option, value) => option.value === value?.value}
                      onChange={(_, newValue) => field.onChange(newValue)}
                      renderInput={(params) => (
                        <StyledTextField
                          {...params}
                          label="Category *"
                          error={!!errors.category}
                          helperText={errors.category?.message}
                        />
                      )}
                    />
                  )}
                />

                {/* Stock Value & Unit */}
                <Stack direction="row" spacing={2}>
                  <StyledTextField
                    {...register("stock_value")}
                    label="Stock Value"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                  <Controller
                    name="unit"
                    control={control}
                    rules={{ required: "Unit is required" }}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        options={UNITS}
                        getOptionLabel={(option) => option.label || option}
                        isOptionEqualToValue={(option, value) => option.value === value?.value}
                        onChange={(_, newValue) => field.onChange(newValue)}
                        sx={{ width: "50%" }}
                        renderInput={(params) => (
                          <StyledTextField
                            {...params}
                            label="Unit *"
                            error={!!errors.unit}
                            helperText={errors.unit?.message}
                          />
                        )}
                      />
                    )}
                  />
                </Stack>

                {/* Unit Price */}
                <StyledTextField
                  {...register("unit_price")}
                  label="Unit Price (Rp)"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0 }}
                />

                {/* Supplier */}
                <StyledTextField
                  {...register("supplier")}
                  label="Supplier"
                  fullWidth
                />

                {/* Safety Stock */}
                <StyledTextField
                  {...register("safety_stock")}
                  label="Safety Stock"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0 }}
                />

                {/* Area */}
                <Controller
                  name="area_id"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={areaOptions}
                      getOptionLabel={(option) => option.label || ""}
                      isOptionEqualToValue={(option, value) => option.value === value?.value}
                      onChange={(_, newValue) => field.onChange(newValue)}
                      renderInput={(params) => (
                        <StyledTextField
                          {...params}
                          label="Area"
                        />
                      )}
                    />
                  )}
                />

                {/* Status */}
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={field.value}
                          color="success"
                        />
                      }
                      label="Active"
                      sx={{ color: "#fff" }}
                    />
                  )}
                />

                {/* Buttons */}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleClose}
                    fullWidth
                    sx={{
                      color: "#fff",
                      borderColor: "#fff",
                      borderRadius: "12px",
                      py: 1.5,
                      "&:hover": {
                        borderColor: "#38bdf8",
                        backgroundColor: "rgba(56, 189, 248, 0.1)",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                      borderRadius: "12px",
                      py: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Update Sparepart"}
                  </Button>
                </Stack>
              </Stack>
            </form>
          )}
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalEditSparepart;
