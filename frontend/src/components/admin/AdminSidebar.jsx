"use client";
import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Avatar,
  Paper,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import StorageIcon from "@mui/icons-material/Storage";
import PeopleIcon from "@mui/icons-material/People";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SettingsIcon from "@mui/icons-material/Settings";
import CategoryIcon from "@mui/icons-material/Category";
import BuildIcon from "@mui/icons-material/Build";
import BusinessIcon from "@mui/icons-material/Business";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import MonitorIcon from "@mui/icons-material/Monitor";
import HistoryIcon from "@mui/icons-material/History";
import ArticleIcon from "@mui/icons-material/Article";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

export const DRAWER_WIDTH = 280;

// Sidebar Menu Items
const menuItems = [
  {
    title: "Dashboard",
    icon: DashboardIcon,
    path: "/admin/dashboard",
  },
  {
    title: "Checksheet",
    icon: FactCheckIcon,
    children: [
      { title: "Monitoring", path: "/admin/checksheet/monitoring", icon: MonitorIcon },
      { title: "Revision Queue", path: "/admin/checksheet/revisions", icon: HistoryIcon },
      { title: "Templates", path: "/admin/checksheet/templates", icon: ArticleIcon },
    ],
  },
  {
    title: "Reports",
    icon: AnalyticsIcon,
    children: [
      { title: "QC Analytics", path: "/admin/reports/analytics", icon: TrendingUpIcon },
      { title: "NG Trend", path: "/admin/reports/ng-trend", icon: TrendingDownIcon },
      { title: "Export Data", path: "/admin/reports/export", icon: FileDownloadIcon },
    ],
  },
  {
    title: "MANAGEMENT",
    divider: true,
  },
  {
    title: "Master Data",
    icon: StorageIcon,
    children: [
      { title: "Models", path: "/admin/master/models", icon: CategoryIcon },
      { title: "Parts", path: "/admin/master/parts", icon: BuildIcon },
      { title: "Customers", path: "/admin/master/customers", icon: BusinessIcon },
      { title: "Materials", path: "/admin/master/materials", icon: InventoryIcon },
      { title: "Reject Reasons", path: "/admin/master/reject-reasons", icon: ReportProblemIcon },
    ],
  },
  {
    title: "User Management",
    icon: PeopleIcon,
    path: "/admin/users",
  },
  {
    title: "Settings",
    icon: SettingsIcon,
    path: "/admin/settings",
  },
];

const AdminSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState({
    Checksheet: true,
    Reports: true,
    "Master Data": true,
  });

  const handleMenuClick = (item) => {
    if (item.children) {
      setExpandedMenus((prev) => ({
        ...prev,
        [item.title]: !prev[item.title],
      }));
    } else if (item.path) {
      router.push(item.path);
    }
  };

  const isActive = (path) => pathname === path;
  const isParentActive = (children) => children?.some((child) => pathname === child.path);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          bgcolor: "#FFFFFF",
          borderRight: "1px solid #E5E7EB",
          boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
        },
      }}
    >
      {/* Logo Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: "2px solid #E5E7EB",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: "#2F80ED",
              width: 44,
              height: 44,
              boxShadow: "0 2px 8px rgba(47, 128, 237, 0.2)",
            }}
          >
            <FactCheckIcon sx={{ color: "#FFFFFF", fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#2F80ED">
              Seikaku Ebara
            </Typography>
            <Typography variant="caption" sx={{ color: "#6B7280" }}>
              Quality Control System
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1.5 }}>
        <List sx={{ px: 1.5 }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.title}>
              {item.divider ? (
                <Box sx={{ py: 1.5, px: 1 }}>
                  <Typography 
                    variant="caption" 
                    fontWeight={700} 
                    color="#9CA3AF"
                    sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem" }}
                  >
                    {item.title}
                  </Typography>
                </Box>
              ) : (
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleMenuClick(item)}
                  sx={{
                    borderRadius: 2,
                    py: 1.25,
                    bgcolor: isActive(item.path) || isParentActive(item.children) 
                      ? "#EBF5FF" 
                      : "transparent",
                    border: isActive(item.path) || isParentActive(item.children)
                      ? "1px solid #BFDBFE"
                      : "1px solid transparent",
                    "&:hover": {
                      bgcolor: isActive(item.path) || isParentActive(item.children) 
                        ? "#EBF5FF" 
                        : "#F3F4F6",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive(item.path) || isParentActive(item.children) 
                        ? "#2F80ED" 
                        : "#6B7280",
                    }}
                  >
                    <item.icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: isActive(item.path) || isParentActive(item.children) ? 600 : 500,
                      color: isActive(item.path) || isParentActive(item.children) 
                        ? "#1E40AF" 
                        : "#374151",
                    }}
                  />
                  {item.children && (
                    <Box sx={{ color: "#9CA3AF" }}>
                      {expandedMenus[item.title] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
              )}

              {/* Submenu */}
              {item.children && (
                <Collapse in={expandedMenus[item.title]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 1.5, pr: 0.5 }}>
                    {item.children.map((child) => (
                      <ListItem key={child.path} disablePadding sx={{ mb: 0.25 }}>
                        <ListItemButton
                          onClick={() => router.push(child.path)}
                          sx={{
                            borderRadius: 1.5,
                            py: 0.875,
                            pl: 2,
                            bgcolor: isActive(child.path) ? "#EBF5FF" : "transparent",
                            borderLeft: isActive(child.path) 
                              ? "3px solid #2F80ED" 
                              : "3px solid transparent",
                            "&:hover": {
                              bgcolor: isActive(child.path) ? "#EBF5FF" : "#F9FAFB",
                            },
                          }}
                        >
                          {child.icon && (
                            <ListItemIcon
                              sx={{
                                minWidth: 32,
                                color: isActive(child.path) ? "#2F80ED" : "#9CA3AF",
                              }}
                            >
                              <child.icon sx={{ fontSize: 18 }} />
                            </ListItemIcon>
                          )}
                          <ListItemText
                            primary={child.title}
                            primaryTypographyProps={{
                              fontSize: "0.8125rem",
                              fontWeight: isActive(child.path) ? 600 : 400,
                              color: isActive(child.path) ? "#1E40AF" : "#6B7280",
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2, borderTop: "1px solid #E5E7EB" }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: "#F0FDF4",
            borderRadius: 2,
            border: "1px solid #BBF7D0",
            textAlign: "center",
          }}
        >
          <Typography variant="caption" fontWeight={600} color="#166534" display="block">
            🎯 Demo Mode Active
          </Typography>
          <Typography variant="caption" color="#15803D">
            Using Mock Data
          </Typography>
        </Paper>
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;
