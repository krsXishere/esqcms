"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import TemplateMetaFI from "./TemplateMetaFI";
import FiItemsList from "./FiItemsList";

/**
 * FI Template Form Component
 * Contains all sections for creating FI template
 */

const FiTemplateForm = ({ onDataChange, isSubmitting, initialData = null }) => {
  const { control, watch, getValues } = useForm({
    defaultValues: initialData || {
      templateCode: "",
      templateName: "",
      model: null,
      desainTrailer: "",
      customer: "",
      description: "",
      items: [],
    },
  });

  const [items, setItems] = useState(initialData?.items || []);

  // Store onDataChange in ref to prevent it from being a dependency
  const onDataChangeRef = useRef(onDataChange);
  onDataChangeRef.current = onDataChange;

  // Store items in ref to access latest value in subscription
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Subscribe to form changes using watch callback (doesn't cause re-render)
  useEffect(() => {
    const subscription = watch((formValues) => {
      const data = {
        ...formValues,
        items: itemsRef.current,
      };
      onDataChangeRef.current?.(data);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Also update when items change
  useEffect(() => {
    const formValues = getValues();
    const data = {
      ...formValues,
      items,
    };
    onDataChangeRef.current?.(data);
  }, [items, getValues]);

  const handleItemsChange = (newItems) => {
    setItems(newItems);
  };

  return (
    <Box>
      {/* Section A: Template Metadata */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid #E2E8F0",
          borderRadius: 2,
          bgcolor: "#FFFFFF",
        }}
      >
        <Typography variant="h6" fontWeight={600} color="#1E293B" gutterBottom>
          Template Metadata
        </Typography>
        <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
          Basic information about the FI template
        </Typography>

        <TemplateMetaFI control={control} disabled={isSubmitting} />
      </Paper>

      {/* Section B: Inspection Items */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid #E2E8F0",
          borderRadius: 2,
          bgcolor: "#FFFFFF",
        }}
      >
        <Typography variant="h6" fontWeight={600} color="#1E293B" gutterBottom>
          Final Inspection Items
        </Typography>
        <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
          Define visual and final inspection checkpoints
        </Typography>

        <FiItemsList
          items={items}
          onItemsChange={handleItemsChange}
          disabled={isSubmitting}
        />
      </Paper>
    </Box>
  );
};

export default FiTemplateForm;
