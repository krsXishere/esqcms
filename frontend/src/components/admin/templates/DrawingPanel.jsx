"use client";
import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

/**
 * Drawing Panel Component
 * Handles drawing upload and preview for DIR templates
 */

const DrawingPanel = ({ drawing, onDrawingChange, disabled, modelInfo }) => {
  const [dragActive, setDragActive] = useState(false);
  const [existingDrawingFound] = useState(false); // TODO: Check from API

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (disabled) return;
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF, PNG, or JPG file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    // Create file object
    const drawingData = {
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      preview: URL.createObjectURL(file),
    };

    onDrawingChange(drawingData);
  };

  const handleRemove = () => {
    if (drawing?.preview) {
      URL.revokeObjectURL(drawing.preview);
    }
    onDrawingChange(null);
  };

  const handleDownload = () => {
    if (drawing?.preview) {
      const link = document.createElement("a");
      link.href = drawing.preview;
      link.download = drawing.name;
      link.click();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = () => {
    if (!drawing) return <ImageIcon sx={{ fontSize: 40, color: "#94A3B8" }} />;
    
    if (drawing.type === "application/pdf") {
      return <PictureAsPdfIcon sx={{ fontSize: 40, color: "#EF4444" }} />;
    }
    return <ImageIcon sx={{ fontSize: 40, color: "#8B5CF6" }} />;
  };

  return (
    <Box>
      {/* Existing Drawing Alert */}
      {existingDrawingFound && !drawing && (
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon />}
          sx={{ mb: 2 }}
          action={
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" color="inherit">
                Use Existing
              </Button>
              <Button size="small" variant="outlined" color="inherit">
                Upload New
              </Button>
            </Box>
          }
        >
          An existing drawing was found for this model and part combination
        </Alert>
      )}

      {/* Single Upload/Preview Card */}
      <Paper
        variant="outlined"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          p: 3,
          textAlign: "center",
          border: dragActive ? "2px dashed #2F80ED" : "2px dashed #E2E8F0",
          bgcolor: dragActive ? "#EAF4FF" : "#FFFFFF",
          borderRadius: 2,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          minHeight: drawing ? 320 : 280,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          "&:hover": disabled ? {} : {
            borderColor: "#2F80ED",
            bgcolor: "#F8FAFC",
          },
        }}
      >
        {drawing ? (
          // Preview Mode
          <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Preview Image - Full Card */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "#F8FAFC",
                borderRadius: 2,
                overflow: "hidden",
                minHeight: 400,
                mb: 2,
              }}
            >
              {drawing.type === "application/pdf" ? (
                <PictureAsPdfIcon sx={{ fontSize: 120, color: "#EF4444" }} />
              ) : (
                <img
                  src={drawing.preview}
                  alt="Drawing preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </Box>

            {/* File Info - Compact at bottom */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" fontWeight={600} color="#1E293B" noWrap>
                {drawing.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center", mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(drawing.size)}
                </Typography>
                {drawing.uploadedAt && (
                  <Typography variant="caption" color="text.secondary">
                    Uploaded: {new Date(drawing.uploadedAt).toLocaleDateString()}
                  </Typography>
                )}
              </Box>

              {/* Actions */}
              <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "center" }}>
                <Tooltip title="Download">
                  <IconButton
                    size="small"
                    onClick={handleDownload}
                    sx={{ bgcolor: "#EAF4FF", color: "#2F80ED" }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove">
                  <IconButton
                    size="small"
                    onClick={handleRemove}
                    disabled={disabled}
                    sx={{ bgcolor: "#FEE2E2", color: "#EF4444" }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        ) : (
          // Upload Mode
          <Box sx={{ width: "100%" }}>
            <CloudUploadIcon
              sx={{
                fontSize: 48,
                color: dragActive ? "#2F80ED" : "#94A3B8",
                mb: 2,
              }}
            />
            <Typography variant="body1" fontWeight={600} color="#1E293B" gutterBottom>
              {dragActive ? "Drop file here" : "Drag & drop drawing file"}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or
            </Typography>
            <Button
              variant="outlined"
              component="label"
              disabled={disabled}
              sx={{ mt: 1 }}
            >
              Browse Files
              <input
                type="file"
                hidden
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileInput}
              />
            </Button>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
              Supported: PDF, PNG, JPG (max 10MB)
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DrawingPanel;
