"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material";
import InputSearch from "@/components/common/input-search";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useDebounce } from "use-debounce";

/** Mapping label → field di database/API */
const COLS = [
  { label: "whatsapp", field: "notify_on_wa" },
  { label: "email", field: "notify_on_email" },
  { label: "event", field: "notify_on_event" },
  { label: "alarm", field: "notify_on_alarm" },
];

const UserNotificationSetting = ({ refreshTrigger }) => {
  const theme = useTheme();
  const { sendRequest } = useFetchApi();

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedValue] = useDebounce(search, 500);

  const isAllEnabled = (field) =>
    data.length > 0 && data.every((row) => !!row[field]);

  const updateNotification = async (userId, fullUserData) => {
    await sendRequest({
      method: "PATCH",
      url: `/users/${userId}`,
      data: fullUserData,
    });
  };

  const toggleDynamic = async (field) => {
    const enable = !isAllEnabled(field);
    const prev = data;
    const updated = data.map((user) => ({ ...user, [field]: enable }));
    setData(updated); // optimistic

    try {
      await Promise.all(
        updated.map((user) =>
          updateNotification(user.id, {
            notify_on_wa: user.notify_on_wa,
            notify_on_email: user.notify_on_email,
            notify_on_event: user.notify_on_event,
            notify_on_alarm: user.notify_on_alarm,
          })
        )
      );
    } catch (err) {
      console.error("Gagal bulk update notifikasi:", err);
      setData(prev); // rollback
    }
  };

  const handleToggle = async (index, field) => {
    const prev = data;
    const updated = [...data];
    updated[index][field] = !updated[index][field];
    setData(updated); // optimistic

    const user = updated[index];
    try {
      await updateNotification(user.id, {
        notify_on_wa: user.notify_on_wa,
        notify_on_email: user.notify_on_email,
        notify_on_event: user.notify_on_event,
        notify_on_alarm: user.notify_on_alarm,
      });
    } catch (err) {
      console.error("Gagal update notifikasi:", err);
      setData(prev); // rollback
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await sendRequest({
          url: "/users",
          params: { search: debouncedValue },
        });
        const users = result?.data || [];

        const filtered = users.filter(
          (user) => user?.role?.name !== "Super Admin"
        );

        const formatted = filtered.map((user) => ({
          id: user.id,
          name: user.name,
          notify_on_wa: !!user.notify_on_wa,
          notify_on_email: !!user.notify_on_email,
          notify_on_event: !!user.notify_on_event,
          notify_on_alarm: !!user.notify_on_alarm,
        }));

        setData(formatted);
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
      }
    };

    fetchUsers();
  }, [debouncedValue, refreshTrigger]);

  return (
    <Box
      sx={(theme) => ({
        borderRadius: "12px",
        border: "1px solid",
        borderColor: theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000045",
        backgroundColor:
          theme.palette.mode === "dark" ? "#ffffff12" : "#ffffff",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        [theme.breakpoints.up("xs")]: { padding: "10px" },
        [theme.breakpoints.up("sm")]: { padding: "24px" },
        [theme.breakpoints.up("lg")]: {},
      })}
    >
      <Typography
        sx={(theme) => ({
          fontWeight: 500,
          [theme.breakpoints.up("xs")]: { fontSize: "16px" },
          [theme.breakpoints.up("sm")]: { fontSize: "18px" },
          [theme.breakpoints.up("lg")]: {},
        })}
      >
        User Notifications
      </Typography>

      <InputSearch value={search} setValue={setSearch} />

      <Box
        sx={{
          maxHeight: 468,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#1e1e2f",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#093FB4",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#1166E3" },
        }}
      >
        <TableContainer
          className="custom-scroll"
          component={Paper}
          sx={{
            overflow: "scroll",
            backgroundColor:
              theme.palette.mode === "dark" ? "transparent" : "#00000008",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>USER</b>
                </TableCell>
                {COLS.map(({ label, field }) => (
                  <TableCell
                    key={field}
                    sx={(theme) => ({
                      [theme.breakpoints.up("xs")]: { fontSize: "14px" },
                      [theme.breakpoints.up("sm")]: { fontSize: "16px" },
                      [theme.breakpoints.up("lg")]: {},
                    })}
                  >
                    {label.toUpperCase()}
                    <br />
                    <Button
                      onClick={() => toggleDynamic(field)}
                      sx={(theme) => ({
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "#FFFFFF50"
                            : "#00000050",
                        my: "8px",
                        textTransform: "capitalize",
                        [theme.breakpoints.up("xs")]: {
                          fontSize: "10px",
                          p: 0,
                        },
                        [theme.breakpoints.up("sm")]: {
                          fontSize: "16px",
                          px: "8px",
                        },
                        [theme.breakpoints.up("lg")]: {},
                      })}
                    >
                      {isAllEnabled(field) ? "Disable All" : "Enable All"}
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((row, index) => (
                <TableRow key={row.id ?? index}>
                  <TableCell>{row.name}</TableCell>

                  {COLS.map(({ field }) => (
                    <TableCell key={`${row.id}-${field}`}>
                      <Switch
                        checked={!!row[field]}
                        onChange={() => handleToggle(index, field)}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#fff",
                            transform: "translateX(20px)",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            { backgroundColor: "#0075FF", opacity: 1 },
                          "& .MuiSwitch-track": {
                            backgroundColor:
                              theme.palette.mode === "dark"
                                ? "#9AA6B2"
                                : "#000",
                          },
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default UserNotificationSetting;
