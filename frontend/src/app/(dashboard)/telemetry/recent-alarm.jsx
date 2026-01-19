"use client";
import React, { useState, useEffect } from "react";
import { FaRegClock } from "react-icons/fa";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { getHourFromISO } from "@/utils/utils";
import { SlExclamation } from "react-icons/sl";

import { Box, Button, Stack, Typography } from "@mui/material";
import ModalAllAlarms from "./modal-all-alarm";

const RecentAlarm = () => {
  const theme = useTheme();
  const [isOpenAllAlarmsModal, setIsOpenAllAlarmsModal] = useState(false);
  const [alarmsData, setAlarmsData] = useState([]);

  const { sendRequest } = useFetchApi();

  useEffect(() => {
    const fetchAlarms = async () => {
      const res = await sendRequest({
        url: "/alarms",
        params: { limit: 20, sort: "activation_time:desc" },
      });

      setAlarmsData(res.data);
    };
    fetchAlarms();
  }, []);
  return (
    <Box sx={(theme) => ({ borderWidth: "1px", borderStyle: "solid", borderColor: theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000045", backgroundColor: theme.palette.mode == "dark" ? "transparent" : "white", borderRadius: "12px", [theme.breakpoints.up("xs")]: { padding: "6px" }, [theme.breakpoints.up("sm")]: { padding: "8px" }, [theme.breakpoints.up("lg")]: { padding: "10px" } })}>
      <ModalAllAlarms open={isOpenAllAlarmsModal} setOpen={setIsOpenAllAlarmsModal} />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontWeight: "700", fontSize: "12px" }}>Recent Alarms</Typography>
      </Box>

      <Box sx={{ mt: "12px" }}>
        {alarmsData.length === 0 ? (
          <Typography sx={{ textAlign: "center", color: theme.palette.text.secondary, fontSize: "11px", padding: "12px 0" }}>No Alarms Available</Typography>
        ) : (
          alarmsData.map((data, i) => (
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
                <SlExclamation color="#ff2056" size={14} />
                <Typography sx={{ fontSize: "11px", fontWeight: "500", wordBreak: "break-word" }}>{data.description} - "{data?.device?.name}"</Typography>
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
      <Button variant="contained" sx={{ width: "100%", mt: "4px", py: "3px", fontSize: "6px", color: theme.palette.mode === "dark" ? "#fff" : "#000", backgroundColor: theme.palette.mode === "dark" ? "#FFFFFF12" : "#eaeaeaea", "&:hover": { backgroundColor: "#ffffff20" } }} onClick={() => setIsOpenAllAlarmsModal(true)}>
        Show All
      </Button>
    </Box>
  );
};

export default RecentAlarm;
