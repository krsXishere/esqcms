"use client";
import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Divider,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import DescriptionIcon from "@mui/icons-material/Description";
import StorageIcon from "@mui/icons-material/Storage";
import PeopleIcon from "@mui/icons-material/People";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MonitorIcon from "@mui/icons-material/Monitor";
import HistoryIcon from "@mui/icons-material/History";
import CategoryIcon from "@mui/icons-material/Category";
import BuildIcon from "@mui/icons-material/Build";
import BusinessIcon from "@mui/icons-material/Business";
import InventoryIcon from "@mui/icons-material/Inventory";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import BlockIcon from "@mui/icons-material/Block";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { useUiStore } from "@/store/useUiStore";

// Sidebar width constants
const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 72;

// Menu configuration for Super Admin
const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon />,
    path: "/admin/dashboard",
  },
  {
    id: "checksheet",
    label: "Checksheet",
    icon: <AssignmentIcon />,
    children: [
      {
        id: "monitoring",
        label: "Monitoring",
        icon: <MonitorIcon />,
        path: "/admin/checksheet/monitoring",
      },
      {
        id: "revisions",
        label: "Revision Queue",
        icon: <HistoryIcon />,
        path: "/admin/checksheet/revisions",
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <AnalyticsIcon />,
    path: "/admin/analytics",
  },
  {
    id: "templates",
    label: "Templates",
    icon: <DescriptionIcon />,
    path: "/admin/templates",
  },
  {
    id: "master",
    label: "Master Data",
    icon: <StorageIcon />,
    children: [
      { id: "models", label: "Models", icon: <CategoryIcon />, path: "/admin/master/models" },
      { id: "parts", label: "Parts", icon: <BuildIcon />, path: "/admin/master/parts" },
      { id: "customers", label: "Customers", icon: <BusinessIcon />, path: "/admin/master/customers" },
      { id: "materials", label: "Materials", icon: <InventoryIcon />, path: "/admin/master/materials" },
      { id: "shifts", label: "Shifts", icon: <AccessTimeIcon />, path: "/admin/master/shifts" },
      { id: "sections", label: "Sections", icon: <AccountTreeIcon />, path: "/admin/master/sections" },
      { id: "reject-reasons", label: "Reject Reasons", icon: <BlockIcon />, path: "/admin/master/reject-reasons" },
      { id: "drawings", label: "Drawings", icon: <ImageIcon />, path: "/admin/master/drawings" },
    ],
  },
  {
    id: "users",
    label: "User Management",
    icon: <PeopleIcon />,
    path: "/admin/users",
  },
];

const Sidebar = () => {
  const theme = useTheme();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { sidebarOpen, sidebarCollapsed, closeSidebar, toggleSidebarCollapse } = useUiStore();

  const [openMenus, setOpenMenus] = React.useState({});

  // Auto-expand parent menu if child is active
  React.useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => pathname.startsWith(child.path));
        if (isChildActive) {
          setOpenMenus((prev) => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [pathname]);

  const handleToggleMenu = (menuId) => {
    setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const isActiveRoute = (path) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const renderMenuItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.path ? isActiveRoute(item.path) : false;
    const isOpen = openMenus[item.id];

    if (hasChildren) {
      return (
        <React.Fragment key={item.id}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleToggleMenu(item.id)}
              sx={{
                py: 1.5,
                px: 2,
                pl: level > 0 ? 4 : 2,
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                color: "#64748B",
                "&:hover": {
                  bgcolor: "#EAF4FF",
                  color: "#2F80ED",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!sidebarCollapsed && (
                <>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  />
                  {isOpen ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>
          </ListItem>
          {!sidebarCollapsed && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List disablePadding>
                {item.children.map((child) => renderMenuItem(child, level + 1))}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    }

    return (
      <ListItem key={item.id} disablePadding>
        <Link href={item.path} style={{ width: "100%", textDecoration: "none" }}>
          <ListItemButton
            selected={isActive}
            onClick={() => isMobile && closeSidebar()}
            sx={{
              py: 1.5,
              px: 2,
              pl: level > 0 ? 4 : 2,
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              color: isActive ? "#2F80ED" : "#64748B",
              bgcolor: isActive ? "#EAF4FF" : "transparent",
              "&:hover": {
                bgcolor: "#EAF4FF",
                color: "#2F80ED",
              },
              "&.Mui-selected": {
                bgcolor: "#EAF4FF",
                color: "#2F80ED",
                "&:hover": {
                  bgcolor: "#D6E9FF",
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: "inherit",
              }}
            >
              {item.icon}
            </ListItemIcon>
            {!sidebarCollapsed && (
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                }}
              />
            )}
          </ListItemButton>
        </Link>
      </ListItem>
    );
  };

  return (
    <Box
      sx={{
        width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        minHeight: "100vh",
        bgcolor: "#FFFFFF",
        borderRight: "1px solid #E2E8F0",
        display: "flex",
        flexDirection: "column",
        position: isMobile ? "fixed" : "relative",
        left: isMobile ? (sidebarOpen ? 0 : -SIDEBAR_WIDTH) : 0,
        top: 0,
        zIndex: 1200,
        transition: "all 0.3s ease",
        boxShadow: isMobile && sidebarOpen ? "4px 0 16px rgba(0,0,0,0.1)" : "none",
      }}
    >
      {/* Logo Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarCollapsed ? "center" : "space-between",
          borderBottom: "1px solid #E2E8F0",
          minHeight: 72,
        }}
      >
        {!sidebarCollapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img
              src="/logo-seikaku.png"
              alt="Seikaku Ebara"
              style={{ height: 40, objectFit: "contain" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="#1E293B">
                Seikaku Ebara
              </Typography>
              <Typography variant="caption" color="#64748B">
                QC Monitoring
              </Typography>
            </Box>
          </Box>
        )}

        {isMobile ? (
          <IconButton onClick={closeSidebar} size="small">
            <CloseIcon />
          </IconButton>
        ) : (
          <IconButton onClick={toggleSidebarCollapse} size="small">
            <ChevronLeftIcon
              sx={{
                transform: sidebarCollapsed ? "rotate(180deg)" : "none",
                transition: "transform 0.3s",
              }}
            />
          </IconButton>
        )}
      </Box>

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
        {!sidebarCollapsed && (
          <Typography
            variant="caption"
            sx={{
              px: 3,
              py: 1,
              display: "block",
              color: "#94A3B8",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Menu
          </Typography>
        )}
        <List disablePadding>{menuItems.map((item) => renderMenuItem(item))}</List>
      </Box>

      {/* Footer */}
      {!sidebarCollapsed && (
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #E2E8F0",
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="#94A3B8">
            Super Admin Panel
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
