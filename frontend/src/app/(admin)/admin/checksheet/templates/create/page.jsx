"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  Tab,
  Tabs,
  Typography,
  Divider,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import SaveIcon from "@mui/icons-material/Save";
import PublishIcon from "@mui/icons-material/Publish";
import CancelIcon from "@mui/icons-material/Cancel";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import DirTemplateForm from "@/components/admin/templates/DirTemplateForm";
import FiTemplateForm from "@/components/admin/templates/FiTemplateForm";

/**
 * Create Template Checksheet Page
 * Allows Super Admin to create DIR or FI templates
 */

const CreateTemplatePage = () => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState(0); // 0=DIR, 1=FI
  const [dirFormData, setDirFormData] = useState(null);
  const [fiFormData, setFiFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const validateDirTemplate = (data) => {
    const errors = [];
    
    if (!data.templateCode?.trim()) errors.push("Template Code is required");
    if (!data.templateName?.trim()) errors.push("Template Name is required");
    if (!data.model) errors.push("Model is required");
    if (!data.partName) errors.push("Part Name is required");
    if (!data.drawingNo?.trim()) errors.push("Drawing No is required");
    if (!data.process?.trim()) errors.push("Process is required");
    if (!data.material) errors.push("Material is required");
    if (!data.drawing) errors.push("Drawing is required");
    if (!data.items || data.items.length === 0) errors.push("At least one measurement item is required");
    
    // Validate items
    data.items?.forEach((item, index) => {
      if (!item.itemName?.trim()) errors.push(`Item ${index + 1}: Item Name is required`);
      if (item.nominal === "" || item.nominal === null || item.nominal === undefined) {
        errors.push(`Item ${index + 1}: Nominal is required`);
      }
      if (item.tolMin === "" || item.tolMin === null || item.tolMin === undefined) {
        errors.push(`Item ${index + 1}: Tol Min is required`);
      }
      if (item.tolMax === "" || item.tolMax === null || item.tolMax === undefined) {
        errors.push(`Item ${index + 1}: Tol Max is required`);
      }
      if (parseFloat(item.tolMin) > parseFloat(item.tolMax)) {
        errors.push(`Item ${index + 1}: Tol Min must be less than or equal to Tol Max`);
      }
    });

    return errors;
  };

  const validateFiTemplate = (data) => {
    const errors = [];
    
    if (!data.templateCode?.trim()) errors.push("Template Code is required");
    if (!data.templateName?.trim()) errors.push("Template Name is required");
    if (!data.model) errors.push("Model is required");
    if (!data.desainTrailer?.trim()) errors.push("Desain Trailer is required");
    if (!data.customer?.trim()) errors.push("Customer is required");
    if (!data.items || data.items.length === 0) errors.push("At least one inspection item is required");
    
    // Validate items
    data.items?.forEach((item, index) => {
      if (!item.itemName?.trim()) errors.push(`Item ${index + 1}: Item Name is required`);
    });

    return errors;
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const formData = activeTab === 0 ? dirFormData : fiFormData;
      const templateType = activeTab === 0 ? "DIR" : "FI";

      // TODO: API call to save draft
      // await axios.post(ENDPOINTS.TEMPLATES.CREATE, { ...formData, type: templateType, status: "draft" });

      enqueueSnackbar("Draft saved successfully", { variant: "success" });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push("/admin/checksheet/templates");
    } catch (error) {
      enqueueSnackbar(error.message || "Failed to save draft", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    const formData = activeTab === 0 ? dirFormData : fiFormData;
    const templateType = activeTab === 0 ? "DIR" : "FI";
    
    // Validate
    const errors = activeTab === 0 
      ? validateDirTemplate(formData) 
      : validateFiTemplate(formData);

    if (errors.length > 0) {
      enqueueSnackbar(
        <Box>
          <Typography variant="body2" fontWeight={600}>Validation Errors:</Typography>
          {errors.slice(0, 3).map((err, idx) => (
            <Typography key={idx} variant="caption" display="block">• {err}</Typography>
          ))}
          {errors.length > 3 && (
            <Typography variant="caption" display="block">...and {errors.length - 3} more</Typography>
          )}
        </Box>,
        { variant: "error", autoHideDuration: 5000 }
      );
      return;
    }

    setPublishDialogOpen(true);
  };

  const confirmPublish = async () => {
    setIsSubmitting(true);
    try {
      const formData = activeTab === 0 ? dirFormData : fiFormData;
      const templateType = activeTab === 0 ? "DIR" : "FI";

      // TODO: API call to publish
      // await axios.post(ENDPOINTS.TEMPLATES.CREATE, { ...formData, type: templateType, status: "published" });

      enqueueSnackbar("Template published successfully", { variant: "success" });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPublishDialogOpen(false);
      router.push("/admin/checksheet/templates");
    } catch (error) {
      enqueueSnackbar(error.message || "Failed to publish template", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    setCancelDialogOpen(false);
    router.push("/admin/checksheet/templates");
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#FFFFFF", minHeight: "100vh" }}>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#1E293B" gutterBottom>
            Create Checksheet Template
          </Typography>
          <Typography variant="body2" color="#64748B">
            Create a new template for DIR (Dimensional Inspection Report) or FI (Final Inspection)
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            disabled={isSubmitting}
            sx={{
              borderColor: "#E2E8F0",
              color: "#64748B",
              "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            sx={{
              borderColor: "#2F80ED",
              color: "#2F80ED",
              "&:hover": { borderColor: "#1E60C8", bgcolor: "#EAF4FF" },
            }}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={handlePublish}
            disabled={isSubmitting}
            sx={{
              bgcolor: "#2F80ED",
              "&:hover": { bgcolor: "#1E60C8" },
            }}
          >
            Publish
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", bgcolor: "#FFFFFF" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            px: 3,
            pt: 2,
            bgcolor: "#FFFFFF",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              minHeight: 48,
              color: "#64748B",
            },
            "& .Mui-selected": {
              color: "#2F80ED",
            },
          }}
        >
          <Tab label="DIR Template" />
          <Tab label="FI Template" />
        </Tabs>
        <Divider sx={{ borderColor: "#E2E8F0" }} />

        {/* Form Content */}
        <Box sx={{ p: 3, bgcolor: "#FFFFFF" }}>
          {activeTab === 0 && (
            <DirTemplateForm
              onDataChange={setDirFormData}
              isSubmitting={isSubmitting}
            />
          )}
          {activeTab === 1 && (
            <FiTemplateForm
              onDataChange={setFiFormData}
              isSubmitting={isSubmitting}
            />
          )}
        </Box>
      </Card>

      {/* Publish Confirmation Dialog */}
      <ConfirmDialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        onConfirm={confirmPublish}
        title="Publish Template"
        message="Publishing will make this template available for use. Once published, major changes will require versioning. Continue?"
        confirmText="Publish"
        cancelText="Cancel"
        severity="info"
        loading={isSubmitting}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={confirmCancel}
        title="Discard Changes"
        message="Are you sure you want to cancel? All unsaved changes will be lost."
        confirmText="Discard"
        cancelText="Keep Editing"
        severity="warning"
        loading={false}
      />
    </Box>
  );
};

export default CreateTemplatePage;
