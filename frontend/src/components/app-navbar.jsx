"use client";
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Button,
} from "@mui/material";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa6";
import { usePathname } from "next/navigation";
import { TbLayoutSidebar } from "react-icons/tb";
import { useRouter } from "next/navigation";

import { useLogout } from "@/app/hook/auth/useLogout";
import ThemeToggle from "./common/theme-toggle";
import { initialName, capitalizeWords } from "@/utils/utils";
import { useSidebarStore } from "@/app/store/sidebarStore";
import NotificationsMenu from "./common/notificationsMenu";
import useNotifications from "@/app/hook/useNotification";

function formatPathToTitle(path) {
  const slug = path.split("/").filter(Boolean).pop() || "";
  return slug
    .replace(/-/g, " ")
    .replace(/&/g, " & ")
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const AppNavbar = () => {
  // Profile menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  // Notif popup (kosong dulu)
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const notifOpen = Boolean(notifAnchorEl);

  const [username, setUsername] = useState("");
  const [adminId, setAdminId] = useState(null);

  const theme = useTheme();
  const pathname = usePathname();
  const title = formatPathToTitle(pathname);
  const logout = useLogout();
  const { openSidebar } = useSidebarStore();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);

    // Pastikan diset saat login Anda (id admin yg terkait)
    const storedAdminId = localStorage.getItem("admin_id");
    if (storedAdminId) setAdminId(Number(storedAdminId));
  }, []);

  const {
    items,
    loading,
    unreadCount,
    hasMore,
    loadMore,
    markAllAsRead,
    markRead,
  } = useNotifications({
    pageSize: 10,
    apiBase: process.env.NEXT_PUBLIC_API_URL,
    // areaId: "All", // opsional
    adminId, // penting agar join ke event-{adminId}
    withEvents: true, // aktifkan events
  });

  // Profile handlers
  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBlock: "30px",
      }}
    >
      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          gap: "12px",
          [theme.breakpoints.down("sm")]: {},
          [theme.breakpoints.up("sm")]: {},
          [theme.breakpoints.up("md")]: {},
        })}
      >
        <TbLayoutSidebar className="size-6 lg:hidden" onClick={openSidebar} />
        <Typography
          sx={(theme) => ({
            fontWeight: 600,
            textTransform: "capitalize",
            [theme.breakpoints.down("sm")]: { fontSize: "14px" },
            [theme.breakpoints.up("sm")]: { fontSize: "16px" },
            [theme.breakpoints.up("md")]: { fontSize: "24px" },
          })}
        >
          {title}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <ThemeToggle />

        <NotificationsMenu
          unreadCount={unreadCount}
          items={items}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onMarkAll={markAllAsRead}
          onItemClick={(n) => {
            markRead(n.id);
            router.push("/analysis&diagnose");
          }}
        />

        <Box
          onClick={handleOpen}
          sx={(theme) => ({
            backgroundColor: "#F1F5F9",
            display: "flex",
            alignItems: "center",
            px: 1,
            py: 0.5,
            borderRadius: "999px",
            cursor: "pointer",
            border: "1px solid #E2E8F0",
            [theme.breakpoints.down("sm")]: { display: "none" },
          })}
        >
          <Avatar
            sx={{
              color: "#fff",
              width: 40,
              height: 40,
              bgcolor: "#2F80ED",
              mr: 1,
            }}
          >
            {initialName(username)}
          </Avatar>
          <Typography variant="body1" sx={{ fontWeight: 600, color: "#1E293B" }}>
            {capitalizeWords(username)}
          </Typography>
          <MdKeyboardArrowDown color="#64748B" style={{ marginLeft: 4 }} />
        </Box>

        {/* PROFILE MENU */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              backgroundColor: "#FFFFFF",
              color: "#1E293B",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              display: { sm: "none", lg: "block" },
            },
          }}
        >
          <MenuItem onClick={logout} sx={{ color: "#1E293B", "&:hover": { bgcolor: "#F1F5F9" } }}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default AppNavbar;
