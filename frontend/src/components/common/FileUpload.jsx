"use client";
import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

/**
 * FileUpload Component
 * Drag & drop file upload with progress and preview
 */

// File type icon mapping
const getFileIcon = (fileType) => {
  if (fileType?.startsWith("image/")) {
    return <ImageIcon sx={{ color: "#8B5CF6" }} />;
  }
  if (fileType === "application/pdf") {
    return <PictureAsPdfIcon sx={{ color: "#EF4444" }} />;
  }
  return <InsertDriveFileIcon sx={{ color: "#64748B" }} />;
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const FileUpload = ({
  accept = "*",
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  files = [],
  onFilesChange,
  onUpload,
  uploading = false,
  uploadProgress = {},
  disabled = false,
  helperText,
}) => {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

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

  const validateFiles = (newFiles) => {
    const validFiles = [];
    let errorMsg = null;

    for (const file of newFiles) {
      // Check file size
      if (file.size > maxSize) {
        errorMsg = `File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`;
        continue;
      }

      // Check max files
      if (files.length + validFiles.length >= maxFiles) {
        errorMsg = `Maximum ${maxFiles} files allowed`;
        break;
      }

      // Check duplicate
      const isDuplicate = files.some(
        (f) => f.name === file.name && f.size === file.size
      );
      if (isDuplicate) {
        continue;
      }

      validFiles.push(file);
    }

    setError(errorMsg);
    return validFiles;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  };

  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = validateFiles(selectedFiles);

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemove = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <Box>
      {/* Drop Zone */}
      <Paper
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        sx={{
          p: 4,
          border: "2px dashed",
          borderColor: error
            ? "#EF4444"
            : dragActive
            ? "#2F80ED"
            : "#E2E8F0",
          borderRadius: 2,
          bgcolor: dragActive ? "#EAF4FF" : "#F8FAFC",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          opacity: disabled ? 0.6 : 1,
          "&:hover": !disabled && {
            borderColor: "#2F80ED",
            bgcolor: "#EAF4FF",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <CloudUploadIcon
            sx={{
              fontSize: 48,
              color: dragActive ? "#2F80ED" : "#94A3B8",
              mb: 2,
            }}
          />
          <Typography variant="body1" fontWeight={500} color="#1E293B" mb={0.5}>
            {dragActive ? "Drop files here" : "Drag & drop files here"}
          </Typography>
          <Typography variant="body2" color="#64748B">
            or click to browse
          </Typography>
          {helperText && (
            <Typography variant="caption" color="#94A3B8" sx={{ mt: 1 }}>
              {helperText}
            </Typography>
          )}
        </Box>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          style={{ display: "none" }}
        />
      </Paper>

      {/* Error Message */}
      {error && (
        <Typography variant="caption" color="#EF4444" sx={{ mt: 1, display: "block" }}>
          {error}
        </Typography>
      )}

      {/* File List */}
      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file, index) => {
            const progress = uploadProgress[file.name];
            const isUploaded = progress === 100;
            const isError = progress === -1;

            return (
              <ListItem
                key={index}
                sx={{
                  bgcolor: "#F8FAFC",
                  borderRadius: 2,
                  mb: 1,
                  border: "1px solid #E2E8F0",
                }}
              >
                <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {file.name}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="#64748B">
                        {formatFileSize(file.size)}
                      </Typography>
                      {uploading && progress !== undefined && !isUploaded && !isError && (
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{ mt: 0.5, borderRadius: 1 }}
                        />
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  {isUploaded ? (
                    <CheckCircleIcon sx={{ color: "#059669" }} />
                  ) : isError ? (
                    <ErrorIcon sx={{ color: "#EF4444" }} />
                  ) : (
                    <Tooltip title="Remove">
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(index)}
                        disabled={uploading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default FileUpload;
