"use client";
import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Skeleton, Chip } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { TbPigMoney, TbChartBar, TbPercentage, TbClock } from "react-icons/tb";
import { MdTrendingUp, MdCheckCircle } from "react-icons/md";

const formatCurrency = (value) => {
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `Rp ${(value / 1000).toFixed(1)}K`;
  }
  return `Rp ${value.toLocaleString()}`;
};

const ROISummaryCards = ({ areaId, utilityId }) => {
  const { sendRequest, loading } = useFetchApi();
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = {};
        if (areaId) params.area_id = areaId;
        if (utilityId) params.utility_id = utilityId;
        
        const result = await sendRequest({ url: "/roi-analytics/dashboard", params });
        if (result?.success) {
          setSummaryData(result.data.summary);
        }
      } catch (error) {
        console.error("Failed to fetch ROI summary:", error);
      }
    };
    fetchSummary();
  }, [areaId, utilityId]);

  const cards = [
    {
      title: "Total Loss Avoided",
      value: summaryData?.total_loss_avoided || 0,
      format: "currency",
      icon: <TbPigMoney size={28} />,
      color: "#10B981",
      bgColor: "#10B98120",
      subtitle: "Total losses successfully avoided",
    },
    {
      title: "Net Benefit",
      value: summaryData?.total_net_benefit || 0,
      format: "currency",
      icon: <MdTrendingUp size={28} />,
      color: "#3B82F6",
      bgColor: "#3B82F620",
      subtitle: "Loss Avoided - Repair Cost",
    },
    {
      title: "Overall ROI",
      value: summaryData?.overall_roi_percentage || 0,
      format: "percentage",
      icon: <TbPercentage size={28} />,
      color: "#8B5CF6",
      bgColor: "#8B5CF620",
      subtitle: "Return on Investment",
    },
    {
      title: "SLA Compliance",
      value: summaryData?.sla_compliance_rate || 0,
      format: "percentage",
      icon: <MdCheckCircle size={28} />,
      color: "#F59E0B",
      bgColor: "#F59E0B20",
      subtitle: `${summaryData?.sla_met_count || 0} of ${summaryData?.work_orders_with_roi || 0} WO`,
    },
    {
      title: "Total Repair Cost",
      value: summaryData?.total_repair_cost || 0,
      format: "currency",
      icon: <TbChartBar size={28} />,
      color: "#EF4444",
      bgColor: "#EF444420",
      subtitle: "Repair cost + spare parts",
    },
    {
      title: "Total Downtime",
      value: summaryData?.total_downtime_hours || 0,
      format: "hours",
      icon: <TbClock size={28} />,
      color: "#6366F1",
      bgColor: "#6366F120",
      subtitle: "Total downtime hours",
    },
  ];

  const formatValue = (value, format) => {
    switch (format) {
      case "currency":
        return formatCurrency(value);
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "hours":
        return `${value.toFixed(1)} hours`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(6, 1fr)",
          },
          gap: 2,
        }}
      >
        {cards.map((card, index) => (
          <Card
            key={index}
            sx={(theme) => ({
              borderRadius: "16px",
              border: `1px solid ${theme.palette.mode === "dark" ? "#FFFFFF15" : "#00000010"}`,
              bgcolor: "transparent",
              backdropFilter: "blur(10px)",
              boxShadow: "none",
              transition: "transform 0.2s, border-color 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                borderColor: card.color,
              },
            })}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
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
              </Box>
              
              <Typography
                variant="caption"
                sx={(theme) => ({
                  color: theme.palette.mode === "dark" ? "#94A3B8" : "#64748B",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                })}
              >
                {card.title}
              </Typography>
              
              {loading ? (
                <Skeleton variant="text" width="80%" height={40} />
              ) : (
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: card.color,
                    mt: 0.5,
                  }}
                >
                  {formatValue(card.value, card.format)}
                </Typography>
              )}
              
              <Typography
                variant="caption"
                sx={(theme) => ({
                  color: theme.palette.mode === "dark" ? "#64748B" : "#94A3B8",
                  fontSize: "11px",
                })}
              >
                {card.subtitle}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ROISummaryCards;
