"use client";
import React, { useState, useEffect } from "react";
import { IoWarning, IoChatboxEllipses } from "react-icons/io5";
import { IoIosRadio } from "react-icons/io";
import { AiFillExclamationCircle } from "react-icons/ai";
import { FaRegClock } from "react-icons/fa";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { getHourFromISO } from "@/utils/utils";

import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import ModalAllEvents from "./modal-all-events";

const RecentEvents = () => {
  const theme = useTheme();
  const [isOpenAllEventsModal, setIsOpenAllEventsModal] = useState(false);
  const [eventsData, setEventsData] = useState([]);

  const { sendRequest } = useFetchApi();

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await sendRequest({
        url: "/events",
        params: { limit: 3, sort: "activation_time:desc" },
      });

      setEventsData(res.data);
    };
    fetchEvents();
  }, []);
  return (
    <Box sx={(theme) => ({ borderWidth: "1px", borderStyle: "solid", borderColor: theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000045", backgroundColor: theme.palette.mode == "dark" ? "transparent" : "white", borderRadius: "12px", [theme.breakpoints.up("xs")]: { padding: "6px" }, [theme.breakpoints.up("sm")]: { padding: "8px" }, [theme.breakpoints.up("lg")]: { padding: "10px" } })}>
      <ModalAllEvents open={isOpenAllEventsModal} setOpen={setIsOpenAllEventsModal} />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontWeight: "700", fontSize: "12px" }}>Recent Events</Typography>
      </Box>

      <Box sx={{ mt: "12px" }}>
        {eventsData.length === 0 ? (
          <Typography sx={{ textAlign: "center", color: theme.palette.text.secondary, fontSize: "11px", padding: "12px 0" }}>No Events Availble</Typography>
        ) : (
          eventsData.map((data, i) => (
            <Stack
              key={i}
              sx={(theme) => ({
                justifyContent: "space-between",
                paddingBlock: "6px",
                borderBottom: "1px solid #FFFFFF25",
                [theme.breakpoints.up("xs")]: { flexDirection: "column", alignItems: "flex-start", gap: "8px" },
                [theme.breakpoints.up("sm")]: { flexDirection: "row", alignItems: "center", gap: 0 },
              })}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                <AiFillExclamationCircle color="#1166E3" size={14} />
                <Typography sx={{ fontSize: "11px", fontWeight: "500", wordBreak: "break-word" }}>{data.description}</Typography>
              </Box>
              <Box
                sx={(theme) => ({
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  fontSize: "11px",
                  [theme.breakpoints.up("xs")]: { justifyContent: "flex-end", width: "100%" },
                })}
              >
                <FaRegClock size={12} />
                <Typography sx={{ fontSize: "11px" }}>{getHourFromISO(data?.activation_time)}</Typography>
              </Box>
            </Stack>
          ))
        )}
      </Box>
      <Button variant="contained" sx={{ width: "100%", mt: "8px", py: "6px", fontSize: "12px", color: theme.palette.mode === "dark" ? "#fff" : "#000", backgroundColor: theme.palette.mode === "dark" ? "#FFFFFF12" : "#eaeaeaea", "&:hover": { backgroundColor: "#ffffff20" } }} onClick={() => setIsOpenAllEventsModal(true)}>
        Show All
      </Button>
    </Box>
  );
};

export default RecentEvents;
