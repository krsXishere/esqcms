"use client";
import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { 
  TbAlertTriangle, 
  TbAlertCircle, 
  TbCircleCheck, 
  TbHeartRateMonitor 
} from "react-icons/tb";

const FleetHealthCards = ({ data, onFilterChange, activeFilter }) => {
  const theme = useTheme();

  const cards = [
    {
      id: "critical",
      title: "Critical",
      value: data.critical,
      icon: <TbAlertTriangle size={32} />,
      color: "#EF4444",
      bgColor: "#EF444420",
      description: "Immediate attention required",
    },
    {
      id: "at-risk",
      title: "At Risk",
      value: data.atRisk,
      icon: <TbAlertCircle size={32} />,
      color: "#F59E0B",
      bgColor: "#F59E0B20",
      description: "Predicted to fail within 7 days",
    },
    {
      id: "healthy",
      title: "Healthy",
      value: data.healthy,
      icon: <TbCircleCheck size={32} />,
      color: "#10B981",
      bgColor: "#10B98120",
      description: "Operating normally",
    },
    {
      id: "avg-health",
      title: "Avg Health Index",
      value: data.avgHealthIndex,
      icon: <TbHeartRateMonitor size={32} />,
      color: "#3B82F6",
      bgColor: "#3B82F620",
      description: "Fleet average score",
      suffix: "/ 100",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
        gap: 2,
      }}
    >
      {cards.map((card) => (
        <Card
          key={card.id}
          onClick={() => card.id !== "avg-health" && onFilterChange(activeFilter === card.id ? null : card.id)}
          sx={{
            borderRadius: "16px",
            border: `2px solid ${activeFilter === card.id ? card.color : theme.palette.mode === "dark" ? "#FFFFFF15" : "#00000010"}`,
            bgcolor: activeFilter === card.id 
              ? (theme.palette.mode === "dark" ? "#1e293b" : "#f8fafc")
              : "transparent",
            backdropFilter: "blur(10px)",
            boxShadow: activeFilter === card.id ? `0 0 20px ${card.color}30` : "none",
            transition: "all 0.3s ease",
            cursor: card.id !== "avg-health" ? "pointer" : "default",
            "&:hover": card.id !== "avg-health" ? {
              transform: "translateY(-4px)",
              borderColor: card.color,
              boxShadow: `0 8px 30px ${card.color}20`,
            } : {},
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "12px",
                  bgcolor: card.bgColor,
                  color: card.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {card.icon}
              </Box>
              {activeFilter === card.id && (
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "20px",
                    bgcolor: card.color,
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  FILTERED
                </Box>
              )}
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: card.color,
                fontSize: "36px",
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              {card.value}
              {card.suffix && (
                <Typography component="span" sx={{ fontSize: "16px", fontWeight: 500, color: theme.palette.text.secondary, ml: 0.5 }}>
                  {card.suffix}
                </Typography>
              )}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {card.title}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {card.description}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default FleetHealthCards;
