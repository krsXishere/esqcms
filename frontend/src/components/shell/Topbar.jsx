"use client";
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  useMediaQuery,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import { useUiStore } from "@/store/useUiStore";
import { useAuthStore } from "@/store/useAuthStore";

// Breadcrumb mapping
const pathNameMap = {
  admin: "Admin",
  dashboard: "Dashboard",
  checksheet: "Checksheet",
  monitoring: "Monitoring",
  revisions: "Revision Queue",
  analytics: "Analytics",
  templates: "Templates",
  master: "Master Data",
  models: "Models",
  parts: "Parts",
  customers: "Customers",
  materials: "Materials",
  shifts: "Shifts",
  sections: "Sections",
  "reject-reasons": "Reject Reasons",
  drawings: "Drawings",
  users: "User Management",
  dir: "DIR",
  fi: "FI",
  revise: "Revise",
};

const Topbar = () => {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { openSidebar } = useUiStore();
  const { user, logout } = useAuthStore();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notifAnchor, setNotifAnchor] = React.useState(null);

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];
    let currentPath = "";

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip if it's a dynamic segment (UUID or number)
      const isDynamic = /^[0-9a-f-]{36}$|^\d+$/.test(segment);

      if (!isDynamic) {
        breadcrumbs.push({
          label: pathNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
          path: currentPath,
          isLast: index === pathSegments.length - 1,
        });
      } else {
        // For dynamic segments, show a generic label
        breadcrumbs.push({
          label: "Detail",
          path: currentPath,
          isLast: index === pathSegments.length - 1,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotifOpen = (event) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    router.push("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        color: "#1E293B",
      }}
    >
      <Toolbar sx={{ minHeight: 72, gap: 2 }}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            onClick={openSidebar}
            sx={{
              color: "#64748B",
              "&:hover": { bgcolor: "#F1F5F9" },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Breadcrumbs */}
        <Box sx={{ flex: 1 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" sx={{ color: "#94A3B8" }} />}
            sx={{ "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap" } }}
          >
            {breadcrumbs.map((crumb, index) => {
              if (crumb.isLast) {
                return (
                  <Typography
                    key={crumb.path}
                    variant="body2"
                    fontWeight={600}
                    color="#1E293B"
                    noWrap
                  >
                    {crumb.label}
                  </Typography>
                );
              }

              return (
                <Link key={crumb.path} href={crumb.path} passHref>
                  <MuiLink
                    underline="hover"
                    variant="body2"
                    sx={{
                      color: "#64748B",
                      "&:hover": { color: "#2F80ED" },
                    }}
                  >
                    {crumb.label}
                  </MuiLink>
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotifOpen}
              sx={{
                color: "#64748B",
                "&:hover": { bgcolor: "#F1F5F9" },
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile Menu */}
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{
              p: 0.5,
              "&:hover": { bgcolor: "#F1F5F9" },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "#2F80ED",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {user?.name?.charAt(0) || "SA"}
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Menu Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.name || "Super Admin"}
            </Typography>
            <Typography variant="caption" color="#64748B">
              {user?.email || "admin@seikaku.co.jp"}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleProfileMenuClose}>
            <PersonIcon sx={{ mr: 1.5, color: "#64748B", fontSize: 20 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleProfileMenuClose}>
            <SettingsIcon sx={{ mr: 1.5, color: "#64748B", fontSize: 20 }} />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: "#EF4444" }}>
            <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Dropdown */}
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleNotifClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              mt: 1,
              width: 320,
              maxHeight: 400,
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E2E8F0" }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Notifications
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="#64748B" textAlign="center">
              No new notifications
            </Typography>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
