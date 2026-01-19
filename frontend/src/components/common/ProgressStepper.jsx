"use client";
import React from "react";
import { Box, Typography, Stepper, Step, StepLabel, StepConnector } from "@mui/material";
import { styled } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ErrorIcon from "@mui/icons-material/Error";

/**
 * ProgressStepper Component
 * Visual indicator for checksheet workflow progress
 */

// Custom connector style
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  "& .MuiStepConnector-line": {
    borderColor: "#E2E8F0",
    borderTopWidth: 2,
  },
  "&.Mui-active": {
    "& .MuiStepConnector-line": {
      borderColor: "#2F80ED",
    },
  },
  "&.Mui-completed": {
    "& .MuiStepConnector-line": {
      borderColor: "#059669",
    },
  },
}));

// Default workflow steps
const DEFAULT_STEPS = [
  { key: "submitted", label: "Submitted" },
  { key: "checked", label: "Checked" },
  { key: "approved", label: "Approved" },
];

// Status to step mapping
const STATUS_TO_STEP = {
  pending: 0,
  submitted: 0,
  checking: 1,
  checked: 1,
  approving: 2,
  approved: 2,
  revision: -1, // Special case
  rejected: -2, // Special case
};

const ProgressStepper = ({
  currentStatus,
  steps = DEFAULT_STEPS,
  compact = false,
  showLabels = true,
  orientation = "horizontal",
}) => {
  const currentStep = STATUS_TO_STEP[currentStatus?.toLowerCase()] ?? 0;
  const isRevision = currentStep === -1;
  const isRejected = currentStep === -2;

  // Custom step icon
  const CustomStepIcon = ({ active, completed, error, icon }) => {
    if (error || isRejected) {
      return <ErrorIcon sx={{ color: "#DC2626", fontSize: compact ? 18 : 22 }} />;
    }
    if (isRevision) {
      return <ErrorIcon sx={{ color: "#D97706", fontSize: compact ? 18 : 22 }} />;
    }
    if (completed) {
      return <CheckCircleIcon sx={{ color: "#059669", fontSize: compact ? 18 : 22 }} />;
    }
    if (active) {
      return (
        <Box
          sx={{
            width: compact ? 18 : 22,
            height: compact ? 18 : 22,
            borderRadius: "50%",
            bgcolor: "#2F80ED",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: compact ? 8 : 10,
              height: compact ? 8 : 10,
              borderRadius: "50%",
              bgcolor: "#FFFFFF",
            }}
          />
        </Box>
      );
    }
    return (
      <RadioButtonUncheckedIcon sx={{ color: "#CBD5E1", fontSize: compact ? 18 : 22 }} />
    );
  };

  // For compact view, just show status icons
  if (compact) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <React.Fragment key={step.key}>
              <CustomStepIcon
                active={isActive}
                completed={isCompleted}
                error={isRejected}
              />
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    width: 16,
                    height: 2,
                    bgcolor: isCompleted ? "#059669" : "#E2E8F0",
                    borderRadius: 1,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    );
  }

  // Full stepper view
  return (
    <Stepper
      activeStep={isRevision || isRejected ? -1 : currentStep}
      orientation={orientation}
      connector={<CustomConnector />}
      sx={{
        "& .MuiStepLabel-label": {
          fontSize: 12,
          fontWeight: 500,
          color: "#64748B",
          "&.Mui-active": {
            color: "#2F80ED",
            fontWeight: 600,
          },
          "&.Mui-completed": {
            color: "#059669",
            fontWeight: 600,
          },
        },
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep && !isRevision && !isRejected;
        const isActive = index === currentStep && !isRevision && !isRejected;

        return (
          <Step key={step.key} completed={isCompleted}>
            <StepLabel
              StepIconComponent={() => (
                <CustomStepIcon
                  active={isActive}
                  completed={isCompleted}
                  error={isRejected && index === currentStep}
                />
              )}
            >
              {showLabels && step.label}
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};

export default ProgressStepper;
