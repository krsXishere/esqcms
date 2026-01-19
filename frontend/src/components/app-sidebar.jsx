"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoMdHome, IoIosStats } from "react-icons/io";
import { IoPulseOutline } from "react-icons/io5";
import { MdMonitor } from "react-icons/md";
import { HiPresentationChartLine } from "react-icons/hi2";
import { PiSlidersBold } from "react-icons/pi";
import { FaBell } from "react-icons/fa6";
import { FaUser, FaFileAlt, FaMap, FaCog, FaWrench, FaBoxOpen, FaChartLine, FaRobot, FaDollarSign, FaBrain } from "react-icons/fa";
import { MdOutlineSensors } from "react-icons/md";
import { useSidebarStore } from "@/app/store/sidebarStore";
import { IoIosCloseCircle } from "react-icons/io";
import { useLogout } from "@/app/hook/auth/useLogout";

const AppSidebar = () => {
  const pathname = usePathname();
  const [role, setRole] = useState();
  const { open, closeSidebar } = useSidebarStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const logout = useLogout();

  useEffect(() => {
    const roleLogin = localStorage.getItem("role");
    setRole(roleLogin);
  }, []);

  useEffect(() => {
    if (isMobile && open) closeSidebar();
  }, [pathname, isMobile, closeSidebar]);

  const handleItemClick = () => {
    if (isMobile) closeSidebar();
  };
  return (
    <Box
      sx={(theme) => ({
        minHeight: "100vh",
        padding: "18px",
        backgroundColor: "#050b15",
        fontSize: "14px",
        minHeight: "100vh",
        zIndex: 5,
        maskOrigin: "left",
        transition: "all 0.3s ease",
        [theme.breakpoints.up("xs")]: {
          width: "100%",
          position: "absolute",
          top: 0,
          bottom: 0,
          left: open ? 0 : "-100%",
        },
        [theme.breakpoints.up("sm")]: {
          width: "500px",
          position: "absolute",
          top: 0,
          bottom: 0,
          left: open ? 0 : "-100%",
        },
        [theme.breakpoints.up("md")]: {
          width: "294px",
          position: "relative",
          left: 0,
        },
      })}
    >
      <Box
        sx={(theme) => ({
          paddingBlock: "30px",
          borderBottom: "1px solid #E0E1E233",
          display: "flex",
          alignItems: "center",
          [theme.breakpoints.up("xs")]: {
            justifyContent: "space-between",
          },
          [theme.breakpoints.up("sm")]: {},
          [theme.breakpoints.up("md")]: {},
        })}
      >
        <img
          src="/logo.png"
          alt="Logo"
          className="w-[180px] object-cover lg:mx-auto"
        />
        <IoIosCloseCircle
          className="lg:hidden size-6 text-white"
          onClick={closeSidebar}
        />
      </Box>

      <List disablePadding>
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path} passHref>
            <ListItemButton
              onClick={handleItemClick}
              selected={pathname === item.path}
              sx={{
                mb: 1,
                borderRadius: 2,
                gap: 1,
                color: "#fff",
                "&.Mui-selected": {
                  backgroundColor: "#2563eb",
                  "&:hover": {
                    backgroundColor: "#1d4ed8",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  fontSize: "20px",
                  minWidth: "unset",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </Link>
        ))}
      </List>

      {role !== "User" && (
        <>
          <Typography sx={{ mb: 1, color: "#94a3b8", paddingBlock: "10px" }}>
            MANAGEMENT
          </Typography>

          <List disablePadding>
            {managementItems.map((item) => (
              <Link key={item.path} href={item.path} passHref>
                <ListItemButton
                  onClick={handleItemClick}
                  selected={pathname === item.path}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    gap: 1,
                    color: "#fff",
                    "&.Mui-selected": {
                      backgroundColor: "#2563eb",
                      "&:hover": {
                        backgroundColor: "#1d4ed8",
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit", minWidth: "unset" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </Link>
            ))}
          </List>
        </>
      )}
      <Button
        onClick={() => logout()}
        sx={(theme) => ({
          textTransform: "capitalize",
          mt: 1,
          [theme.breakpoints.down("sm")]: {
            width: "100%",
          },
          [theme.breakpoints.up("sm")]: {
            width: "100px",
            display: "none",
            backgroundColor: "green",
          },
          [theme.breakpoints.up("md")]: {},
        })}
      >
        Logout
      </Button>
    </Box>
  );
};

export default AppSidebar;

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: <IoMdHome /> },
  { label: "Real-time Status", path: "/realtime-status", icon: <MdMonitor />},
  {
    label: "Analysis & Diagnose",
    path: "/analysis&diagnose",
    icon: <HiPresentationChartLine />,
  },
  {
    label: "Predictive Maintenance",
    path: "/predictive-maintenance",
    icon: <FaBrain />,
  },
  // { label: "Analytic", path: "/analytic", icon: <IoIosStats /> },
  // { label: "Control", path: "/control", icon: <PiSlidersBold /> },
  {
    label: "Alarm & Notifications",
    path: "/alarm&notification",
    icon: <FaBell />,
  },
  { label: "Work Orders", path: "/work-orders", icon: <FaWrench /> },
  { label: "ROI Analytics", path: "/roi-analytics", icon: <FaChartLine /> },
  { label: "Report", path: "/report", icon: <FaFileAlt /> },
];

const managementItems = [
  { label: "User Management", path: "/user-management", icon: <FaUser /> },
  { label: "Area", path: "/area-management", icon: <FaMap /> },
  { label: "Utility", path: "/utility-management", icon: <FaCog /> },
  { label: "Device", path: "/device-management", icon: <MdOutlineSensors /> },
  { label: "Sparepart", path: "/sparepart-management", icon: <FaBoxOpen /> },
  { label: "ROI Settings", path: "/roi-settings", icon: <FaCog /> },
];
