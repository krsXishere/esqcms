"use client";
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Menu,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { useState } from "react";
import { FaBell } from "react-icons/fa6";

export default function NotificationsMenu({
  unreadCount,
  items,
  loading,
  hasMore,
  onLoadMore,
  onMarkAll,
  onItemClick,
}) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        sx={{ padding: "8px" }}
        onClick={handleOpen}
        aria-label="Open notifications"
        aria-controls={open ? "notif-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <Badge
          color="error"
          overlap="circular"
          variant={unreadCount ? "standard" : ""}
          badgeContent={unreadCount || null}
        >
          <FaBell className="size-6 lg:size-8" />
        </Badge>
      </IconButton>

      <Menu
        id="notif-menu"
        className="custom-scroll"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 360,
            maxWidth: "90vw",
            bgcolor: "#FFFFFF",
            color: "#1E293B",
            boxShadow:
              "0px 10px 20px rgba(0,0,0,0.15), 0px 2px 6px rgba(0,0,0,0.1)",
            borderRadius: 2,
            border: "1px solid #E2E8F0",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>Notifications</Typography>
          <Button size="small" onClick={onMarkAll} disabled={!unreadCount}>
            Mark all as read
          </Button>
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={20} />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Belum ada notifikasi
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 360, overflowY: "auto" }}>
            {items.map((n, idx) => {
              const type = (n._type || "alarm").toLowerCase();
              const isAlarm = type === "alarm";
              const isEvent = type === "event";

              return (
                <Box key={idx}>
                  <ListItem
                    alignItems="flex-start"
                    onClick={() => {
                      onItemClick?.(n);
                      handleClose();
                    }}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "#F1F5F9",
                      },
                      py: 1.25,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography component="div" sx={{ fontWeight: 600 }}>
                            {n.device?.name || `Device #${n.device_id || "-"}`}
                          </Typography>
                          <Chip
                            size="small"
                            label={
                              isAlarm ? "ALARM" : isEvent ? "EVENT" : "NOTIF"
                            }
                            sx={{
                              height: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              borderRadius: "999px",
                              color: "#fff",
                              bgcolor: isAlarm
                                ? "#ef4444"
                                : isEvent
                                ? "#2563eb"
                                : "#6b7280",
                            }}
                          />
                          {n._unread && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "error.main",
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{ opacity: 0.85, display: "block", mt: 0.5 }}
                        >
                          {n.description || "-"}
                        </Typography>
                      }
                      primaryTypographyProps={{ component: "div" }}
                      secondaryTypographyProps={{ component: "div" }}
                    />
                  </ListItem>
                  {idx !== items.length - 1 && <Divider component="li" />}
                </Box>
              );
            })}
          </List>
        )}

        <Divider />
        <Box sx={{ p: 1.25, textAlign: "center" }}>
          <Button size="small" onClick={onLoadMore} disabled={!hasMore}>
            {hasMore ? "Read more" : "Sudah semua"}
          </Button>
        </Box>
      </Menu>
    </>
  );
}
