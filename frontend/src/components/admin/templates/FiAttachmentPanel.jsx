"use client";
import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";

/**
 * FI Attachment Panel Component
 * Optional file upload for reference documents
 */

const FiAttachmentPanel = ({ attachment, onAttachmentChange, disabled }) => {
  const [dragActive, setDragActive] = useState(false);

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
    const attachmentData = {
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      preview: URL.createObjectURL(file),
    };

    onAttachmentChange(attachmentData);
  };

  const handleRemove = () => {
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    onAttachmentChange(null);
  };

  const handleDownload = () => {
    if (attachment?.preview) {
      const link = document.createElement("a");
      link.href = attachment.preview;
      link.download = attachment.name;
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
    if (!attachment) {
      return <InsertDriveFileIcon sx={{ fontSize: 40, color: "#94A3B8" }} />;
    }
    
    if (attachment.type === "application/pdf") {
      return <PictureAsPdfIcon sx={{ fontSize: 40, color: "#EF4444" }} />;
    }
    if (attachment.type.startsWith("image/")) {
      return <ImageIcon sx={{ fontSize: 40, color: "#8B5CF6" }} />;
    }
    return <InsertDriveFileIcon sx={{ fontSize: 40, color: "#64748B" }} />;
  };

  return (
    <Grid container spacing={3}>
      {/* Upload Area */}
      <Grid item xs={12} md={6}>
        <Paper
          variant="outlined"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{
            p: 4,
            textAlign: "center",
            border: dragActive ? "2px dashed #2F80ED" : "2px dashed #E2E8F0",
            bgcolor: dragActive ? "#EAF4FF" : "#FFFFFF",
            borderRadius: 2,
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            "&:hover": disabled ? {} : {
              borderColor: "#2F80ED",
              bgcolor: "#F8FAFC",
            },
          }}
        >
          <CloudUploadIcon
            sx={{
              fontSize: 48,
              color: dragActive ? "#2F80ED" : "#94A3B8",
              mb: 2,
            }}
          />
          <Typography variant="body1" fontWeight={600} color="#1E293B" gutterBottom>
            {dragActive ? "Drop file here" : "Drag & drop reference file"}
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
        </Paper>
      </Grid>

      {/* Preview Panel */}
      <Grid item xs={12} md={6}>
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            height: "100%",
            minHeight: 280,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#FFFFFF",
            borderColor: "#E2E8F0",
          }}
        >
          {attachment ? (
            <Box sx={{ width: "100%", textAlign: "center" }}>
              {/* Preview */}
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: "#FFF",
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 120,
                }}
              >
                {attachment.type === "application/pdf" ? (
                  <PictureAsPdfIcon sx={{ fontSize: 60, color: "#EF4444" }} />
                ) : attachment.type.startsWith("image/") ? (
                  <img
                    src={attachment.preview}
                    alt="Attachment preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 150,
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <InsertDriveFileIcon sx={{ fontSize: 60, color: "#64748B" }} />
                )}
              </Box>

              {/* File Info */}
              <Typography variant="body2" fontWeight={600} color="#1E293B" noWrap>
                {attachment.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                {formatFileSize(attachment.size)}
              </Typography>
              {attachment.uploadedAt && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Uploaded: {new Date(attachment.uploadedAt).toLocaleDateString()}
                </Typography>
              )}

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
          ) : (
            <Box sx={{ textAlign: "center" }}>
              {getFileIcon()}
              <Typography variant="body2" color="#94A3B8" sx={{ mt: 1 }}>
                No attachment uploaded
              </Typography>
              <Typography variant="caption" color="#94A3B8" display="block">
                This is optional
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default FiAttachmentPanel;
