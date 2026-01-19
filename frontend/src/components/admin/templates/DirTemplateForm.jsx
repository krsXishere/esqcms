"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Autocomplete,
  Paper,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import TemplateMetaDIR from "./TemplateMetaDIR";
import DrawingPanel from "./DrawingPanel";
import DirItemsGrid from "./DirItemsGrid";

/**
 * DIR Template Form Component
 * Contains all sections for creating DIR template
 */

const DirTemplateForm = ({ onDataChange, isSubmitting, initialData = null }) => {
  const { control, watch, setValue, getValues } = useForm({
    defaultValues: initialData || {
      templateCode: "",
      templateName: "",
      model: null,
      partName: null,
      drawingNo: "",
      process: "",
      material: null,
      description: "",
      drawing: null,
      items: [],
    },
  });

  const [items, setItems] = useState(initialData?.items || []);
  const [drawing, setDrawing] = useState(initialData?.drawing || null);

  // Store onDataChange in ref to prevent it from being a dependency
  const onDataChangeRef = useRef(onDataChange);
  onDataChangeRef.current = onDataChange;

  // Store items and drawing in refs to access latest values in subscription
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const drawingRef = useRef(drawing);
  drawingRef.current = drawing;

  // Subscribe to form changes using watch callback (doesn't cause re-render)
  useEffect(() => {
    const subscription = watch((formValues) => {
      const data = {
        ...formValues,
        items: itemsRef.current,
        drawing: drawingRef.current,
      };
      onDataChangeRef.current?.(data);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Also update when items or drawing change
  useEffect(() => {
    const formValues = getValues();
    const data = {
      ...formValues,
      items,
      drawing,
    };
    onDataChangeRef.current?.(data);
  }, [items, drawing, getValues]);

  const handleItemsChange = (newItems) => {
    setItems(newItems);
  };

  const handleDrawingChange = (newDrawing) => {
    setDrawing(newDrawing);
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
          Basic information about the DIR template
        </Typography>

        <TemplateMetaDIR control={control} disabled={isSubmitting} />
      </Paper>

      {/* Section B & C: Drawing and Measurement Items - Side by Side */}
      <Grid container spacing={3}>
        {/* Section B: Drawing Upload */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              border: "1px solid #E2E8F0",
              borderRadius: 2,
              bgcolor: "#FFFFFF",
            }}
          >
            <Typography variant="h6" fontWeight={600} color="#1E293B" gutterBottom>
              Drawing
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
              Upload technical drawing for this template
            </Typography>

            <DrawingPanel
              drawing={drawing}
              onDrawingChange={handleDrawingChange}
              disabled={isSubmitting}
              modelInfo={{
                model: getValues("model"),
                partName: getValues("partName"),
              }}
            />
          </Paper>
        </Grid>

        {/* Section C: Measurement Items */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              border: "1px solid #E2E8F0",
              borderRadius: 2,
              bgcolor: "#FFFFFF",
            }}
          >
            <Typography variant="h6" fontWeight={600} color="#1E293B" gutterBottom>
              Measurement Items
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
              Define measurement points with nominal values and tolerances
            </Typography>

            <DirItemsGrid
              items={items}
              onItemsChange={handleItemsChange}
              disabled={isSubmitting}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DirTemplateForm;
