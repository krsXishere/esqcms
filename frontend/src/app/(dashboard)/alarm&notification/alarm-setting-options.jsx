"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  InputBase,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useSnackbar } from "notistack";

const AlarmSettingOptions = ({ selected, onSaved }) => {
  const theme = useTheme();
  const { sendRequest, loading } = useFetchApi();

  const [enabled, setEnabled] = useState(false);
  const [lowValue, setLowValue] = useState("");
  const [lowText, setLowText] = useState("");
  const [highValue, setHighValue] = useState("");
  const [highText, setHighText] = useState("");
  const [deviceId, setDeviceId] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  // Seed form ketika pilihan berubah
  useEffect(() => {
    if (!selected) {
      setEnabled(false);
      setLowValue("");
      setLowText("");
      setHighValue("");
      setHighText("");
      setDeviceId(null);
      return;
    }
    setEnabled(Boolean(selected.enabled));
    setLowValue(
      selected.low_value !== undefined && selected.low_value !== null
        ? String(selected.low_value)
        : ""
    );
    setLowText(selected.low_text ?? "");
    setHighValue(
      selected.high_value !== undefined && selected.high_value !== null
        ? String(selected.high_value)
        : ""
    );
    setHighText(selected.high_text ?? "");
    setDeviceId(selected.device_id ?? null);
  }, [selected]);

  const disabled = !selected;

  // Helper: konversi string -> number aman
  const toNumber = (s, fallback = 0) => {
    if (s === "" || s === null || s === undefined) return fallback;
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
    // Jika ingin kirim null saat kosong, gunakan: return s === "" ? null : n;
  };

  const handleSave = async () => {
    if (!selected) return;

    const payload = {
      enabled,
      low_value: toNumber(lowValue, 0),
      low_text: lowText,
      high_value: toNumber(highValue, 0),
      high_text: highText,
      device_id: deviceId ?? selected.device_id,
    };

    // Validasi sederhana (opsional)
    // if (payload.low_value > payload.high_value) {
    //   // tampilkan toast/snackbar sesuai preferensi kamu
    //   return;
    // }
    try {
      await sendRequest({
        url: `/alarm-variables/${selected.id}`,
        method: "PATCH",
        data: payload,
      });
      enqueueSnackbar("Berhasil Mengubah Data", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Gagal Mengubah Data", { variant: "error" });
    }

    onSaved?.();
  };

  return (
    <Box
      sx={(theme) => ({
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.palette.mode === "dark" ? "#FFFFFF45" : "#00000030",
        borderRadius: "12px",
        overflow: "hidden",

        [theme.breakpoints.up("xs")]: {
          p: "10px",
          maxHeight: "700px",
          width: "100%",
        },
        [theme.breakpoints.up("sm")]: {
          width: "50%",
        },
        [theme.breakpoints.up("lg")]: {
          p: "24px",
        },
      })}
    >
      <FormControlLabel
        label="ALARM"
        labelPlacement="start"
        control={
          <Switch
            checked={enabled} // selalu boolean
            onChange={(e) => setEnabled(e.target.checked)}
            sx={{
              mb: "32px",
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#fff",
                transform: "translateX(20px)",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#0075FF",
                opacity: 1,
              },
              "& .MuiSwitch-track": {
                backgroundColor:
                  theme.palette.mode === "dark" ? "#9AA6B2" : "#000",
              },
            }}
          />
        }
        sx={{
          ".MuiFormControlLabel-label": {
            fontSize: "14px",
            fontWeight: "600",
            mb: "32px",
          },
        }}
        disabled={disabled}
      />

      <Typography sx={{ mb: 1.5, opacity: 0.8, fontSize: 13 }}>
        {selected
          ? `${selected?.alarmTemplate?.variable_name ?? "Variable"} • ${
              selected?.device?.name ?? ""
            }`
          : "Pilih satu variable di panel kiri"}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Low Value */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Typography>Alarm Low Value</Typography>
          <InputBase
            type="number"
            inputMode="decimal"
            placeholder="0"
            disabled={disabled}
            value={lowValue} // selalu string
            onChange={(e) => setLowValue(e.target.value)}
            sx={{
              width: "100%",
              backgroundColor:
                theme.palette.mode === "dark" ? "#FFFFFF25" : "#00000010",
              p: "16px",
              borderRadius: "12px",
            }}
          />
        </Box>

        {/* Low Text */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Typography>Alarm Low Text</Typography>
          <InputBase
            disabled={disabled}
            multiline
            placeholder="Deskripsi alarm rendah"
            value={lowText} // selalu string
            onChange={(e) => setLowText(e.target.value)}
            sx={{
              width: "100%",
              minHeight: "80px",
              backgroundColor:
                theme.palette.mode === "dark" ? "#FFFFFF25" : "#00000010",
              p: "16px",
              borderRadius: "12px",
              "& textarea": { resize: "vertical", boxSizing: "border-box" },
            }}
          />
        </Box>

        {/* High Value */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Typography>Alarm High Value</Typography>
          <InputBase
            type="number"
            inputMode="decimal"
            placeholder="0"
            disabled={disabled}
            value={highValue} // selalu string
            onChange={(e) => setHighValue(e.target.value)}
            sx={{
              width: "100%",
              backgroundColor:
                theme.palette.mode === "dark" ? "#FFFFFF25" : "#00000010",
              p: "16px",
              borderRadius: "12px",
            }}
          />
        </Box>

        {/* High Text */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Typography>Alarm High Text</Typography>
          <InputBase
            disabled={disabled}
            multiline
            placeholder="Deskripsi alarm tinggi"
            value={highText} // selalu string
            onChange={(e) => setHighText(e.target.value)}
            sx={{
              width: "100%",
              minHeight: "80px",
              backgroundColor:
                theme.palette.mode === "dark" ? "#FFFFFF25" : "#00000010",
              p: "16px",
              borderRadius: "12px",
              "& textarea": { resize: "vertical", boxSizing: "border-box" },
            }}
          />
        </Box>

        <Button variant="contained" onClick={handleSave}>
          save
        </Button>
      </Box>
    </Box>
  );
};

export default AlarmSettingOptions;
