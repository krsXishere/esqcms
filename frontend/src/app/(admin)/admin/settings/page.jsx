"use client";
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  TextField,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    companyName: "Seikaku Ebara Indonesia",
    timezone: "Asia/Jakarta",
    siteIcon: "/logo.png", // Default icon path
  });
  const [iconPreview, setIconPreview] = useState("/logo.png");

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleIconChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
        alert("Only PNG and JPG files are accepted");
        return;
      }
      
      // Validate file size (512x512 minimum)
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width < 512 || img.height < 512) {
            alert("Icon should be at least 512 by 512 pixels");
            return;
          }
          setIconPreview(e.target.result);
          handleSettingChange("siteIcon", e.target.result);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveIcon = () => {
    setIconPreview("");
    handleSettingChange("siteIcon", "");
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: "#111827" }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
          Configure system preferences and application settings
        </Typography>
      </Box>

      {/* General Settings */}
      <Paper sx={{ bgcolor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 3, p: 3 }}>
          <Typography variant="h6" fontWeight={600} color="#111827" sx={{ mb: 3 }}>
            General Settings
          </Typography>
          
          {/* Site Icon Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} color="#111827" sx={{ mb: 2 }}>
              Site Icon
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              {/* Icon Preview */}
              <Box
                sx={{
                  width: 160,
                  height: 160,
                  borderRadius: 2,
                  border: "2px solid #E5E7EB",
                  bgcolor: "#1E293B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {iconPreview ? (
                  <Box
                    component="img"
                    src={iconPreview}
                    alt="Site Icon"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <ImageIcon sx={{ fontSize: 60, color: "#64748B" }} />
                )}
              </Box>

              {/* Buttons */}
              <Stack spacing={2}>
                <Button
                  component="label"
                  variant="contained"
                  sx={{
                    bgcolor: "#8B5CF6",
                    "&:hover": { bgcolor: "#7C3AED" },
                    textTransform: "none",
                    fontWeight: 600,
                    minWidth: 180,
                  }}
                >
                  Change site icon
                  <input
                    type="file"
                    hidden
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleIconChange}
                  />
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={handleRemoveIcon}
                  sx={{
                    bgcolor: "#EF4444",
                    "&:hover": { bgcolor: "#DC2626" },
                    textTransform: "none",
                    fontWeight: 600,
                    minWidth: 180,
                  }}
                >
                  Remove site icon
                </Button>
              </Stack>
            </Box>
            <Typography variant="body2" color="#6B7280" sx={{ mt: 2 }}>
              The Site Icon is what you see in sidebar. It should be square and at least 512 by 512 pixels. Only accept PNG and JPG
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Company Name"
                value={settings.companyName}
                onChange={(e) => handleSettingChange("companyName", e.target.value)}
                fullWidth
                sx={{ 
                  "& .MuiOutlinedInput-root": { 
                    bgcolor: "#FFFFFF",
                    "& input": {
                      color: "#111827",
                      fontWeight: 500
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: "#6B7280",
                    "&.Mui-focused": {
                      color: "#3B82F6"
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#6B7280", "&.Mui-focused": { color: "#3B82F6" } }}>Timezone</InputLabel>
                <Select
                  value={settings.timezone}
                  label="Timezone"
                  onChange={(e) => handleSettingChange("timezone", e.target.value)}
                  sx={{ 
                    bgcolor: "#FFFFFF",
                    color: "#111827",
                    fontWeight: 500,
                    "& .MuiSelect-select": {
                      color: "#111827"
                    }
                  }}
                >
                  <MenuItem value="Asia/Jakarta">Asia/Jakarta (WIB)</MenuItem>
                  <MenuItem value="Asia/Makassar">Asia/Makassar (WITA)</MenuItem>
                  <MenuItem value="Asia/Jayapura">Asia/Jayapura (WIT)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Stack direction="row" justifyContent="flex-end">
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />} 
              sx={{ 
                bgcolor: "#3B82F6", 
                "&:hover": { bgcolor: "#2563EB" },
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
              }}
            >
              Save Changes
            </Button>
          </Stack>
        </Paper>
    </Box>
  );
};

export default SettingsPage;
    