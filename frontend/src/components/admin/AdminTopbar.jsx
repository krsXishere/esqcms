"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Stack,
  Button,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";

// Page titles mapping
const pageTitles = {
  "/admin/dashboard": { title: "Dashboard", subtitle: "Overview of your QC system performance" },
  "/admin/checksheet/monitoring": { title: "Checksheet Monitoring", subtitle: "Monitor all checksheets in real-time" },
  "/admin/checksheet/revisions": { title: "Revision Queue", subtitle: "Review and manage pending revisions" },
  "/admin/checksheet/templates": { title: "Templates", subtitle: "Manage checksheet templates" },
  "/admin/master/models": { title: "Master Models", subtitle: "Manage pump models data" },
  "/admin/master/parts": { title: "Master Parts", subtitle: "Manage parts inventory" },
  "/admin/master/customers": { title: "Master Customers", subtitle: "Manage customer information" },
  "/admin/master/materials": { title: "Master Materials", subtitle: "Manage material specifications" },
  "/admin/master/reject-reasons": { title: "Reject Reasons", subtitle: "Configure rejection reason codes" },
  "/admin/reports/analytics": { title: "QC Analytics", subtitle: "Analyze quality control metrics" },
  "/admin/reports/ng-trend": { title: "NG Trend Analysis", subtitle: "Track defect trends over time" },
  "/admin/reports/export": { title: "Export Data", subtitle: "Export reports and data" },
  "/admin/users": { title: "User Management", subtitle: "Manage user accounts and permissions" },
  "/admin/settings": { title: "Settings", subtitle: "Configure system preferences" },
};

const AdminTopbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("Super Admin");
  const [anchorEl, setAnchorEl] = useState(null);

  const pageInfo = pageTitles[pathname] || { title: "Dashboard", subtitle: "Welcome to Seikaku QC System" };

  useEffect(() => {
    const role = Cookies.get("role") || localStorage.getItem("role") || "super_admin";
    const roleLabels = {
      super_admin: "Super Admin",
      admin: "Admin",
      inspector: "Inspector",
      checker: "Checker",
      approver: "Approver",
    };
    setUserRole(roleLabels[role] || "Admin");
    setUserName(roleLabels[role] || "Admin");
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    localStorage.removeItem("role");
    localStorage.removeItem("themeMode");
    router.push("/login");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        px: 3,
        py: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        bgcolor: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Right Section */}
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Notifications */}
        <IconButton
          sx={{
            bgcolor: "#F3F4F6",
            "&:hover": { bgcolor: "#E5E7EB" },
          }}
        >
          <Badge badgeContent={3} color="error">
            <NotificationsIcon sx={{ color: "#6B7280" }} />
          </Badge>
        </IconButton>

        {/* User Profile */}
        <Button
          onClick={handleMenuOpen}
          sx={{
            textTransform: "none",
            bgcolor: "#F3F4F6",
            px: 2,
            py: 1,
            borderRadius: 2,
            "&:hover": { bgcolor: "#E5E7EB" },
          }}
          endIcon={<KeyboardArrowDownIcon sx={{ color: "#6B7280" }} />}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#2F80ED",
              mr: 1.5,
              fontSize: "0.875rem",
            }}
          >
            {userName.charAt(0)}
          </Avatar>
          <Box sx={{ textAlign: "left" }}>
            <Typography variant="body2" fontWeight={600} color="#111827">
              {userName}
            </Typography>
            <Typography variant="caption" color="#6B7280">
              {userRole}
            </Typography>
          </Box>
        </Button>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              border: "1px solid #E5E7EB",
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1.5, bgcolor: "#F9FAFB" }}>
            <Typography variant="body2" fontWeight={600} color="#111827">
              {userName}
            </Typography>
            <Typography variant="caption" color="#6B7280">
              {userRole}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.25 }}>
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" sx={{ color: "#6B7280" }} />
            </ListItemIcon>
            <Typography variant="body2" color="#374151">
              My Profile
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.25 }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" sx={{ color: "#6B7280" }} />
            </ListItemIcon>
            <Typography variant="body2" color="#374151">
              Settings
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ py: 1.25 }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: "#DC2626" }} />
            </ListItemIcon>
            <Typography variant="body2" color="#DC2626" fontWeight={500}>
              Logout
            </Typography>
          </MenuItem>
        </Menu>
      </Stack>
    </Paper>
  );
};

export default AdminTopbar;
