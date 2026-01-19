"use client";
import React, { useState, useEffect } from "react";
import { FaRegClock } from "react-icons/fa";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { getHourFromISO } from "@/utils/utils";
import { SlExclamation } from "react-icons/sl";

import { Box, Button, Stack, Typography } from "@mui/material";
import ModalAllAlarms from "./modal-all-alarm";

const RecentAlarm = ({ areaId }) => {
  const theme = useTheme();
  const [isOpenAllAlarmsModal, setIsOpenAllAlarmsModal] = useState(false);
  const [alarmsData, setAlarmsData] = useState([]);

  const { sendRequest } = useFetchApi();

  useEffect(() => {
    const fetchAlarms = async () => {
      const params = { limit: 3, sort: "activation_time:desc" };
      
      // Add area_id filter if provided and not "all"
      if (areaId && areaId !== "all") {
        params.area_id = areaId;
      }
      
      const res = await sendRequest({
        url: "/alarms",
        params,
      });

      setAlarmsData(res.data);
    };
    fetchAlarms();
  }, [areaId]);
  return (
    <Box
      sx={(theme) => ({
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000045",
        backgroundColor: theme.palette.mode == "dark" ? "transparent" : "white",
        borderRadius: "12px",
        [theme.breakpoints.up("xs")]: {
          padding: "10px",
        },
        [theme.breakpoints.up("sm")]: {
          padding: "16px",
        },
        [theme.breakpoints.up("lg")]: {
          padding: "24px",
        },
      })}
    >
      <ModalAllAlarms
        open={isOpenAllAlarmsModal}
        setOpen={setIsOpenAllAlarmsModal}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontWeight: "700", fontSize: "18px" }}>
          Recent Alarms
        </Typography>
      </Box>

      <Box sx={{ mt: "18px", flex: 1 }}>
        {alarmsData.length === 0 ? (
          <Typography
            sx={{
              textAlign: "center",
              color: theme.palette.text.secondary,
              fontSize: "14px",
              padding: "20px 0",
            }}
          >
            No Alarms Available
          </Typography>
        ) : (
          alarmsData.map((data, i) => (
            <Stack
              key={i}
              sx={(theme) => ({
                justifyContent: "space-between",
                paddingBlock: "18px",
                borderBottom: "1px solid #FFFFFF25",
                [theme.breakpoints.up("xs")]: {
                  flexDirection: "column",
                  alignItems: "start",
                  gap: "5px",
                },
                [theme.breakpoints.up("sm")]: {
                  flexDirection: "row",
                  alignItems: "center",
                },
              })}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                }}
              >
                <SlExclamation color="#ff2056" size={20} />
                <Typography sx={{ fontSize: "14px", fontWeight: "500" }}>
                  {data.description} - "{data?.device?.name}"
                </Typography>
              </Box>
              <Box
                sx={(theme) => ({
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  fontSize: "14px",
                  [theme.breakpoints.up("xs")]: {
                    justifyContent: "flex-end",
                    width: "100%",
                  },
                })}
              >
                <FaRegClock size={18} />
                <Typography>{getHourFromISO(data?.activation_time)}</Typography>
              </Box>
            </Stack>
          ))
        )}
      </Box>
      <Button
        variant="contained"
        sx={{
          width: "100%",
          mt: "auto",
          pt: "16px",
          color: theme.palette.mode === "dark" ? "#fff" : "#000",
          backgroundColor:
            theme.palette.mode === "dark" ? "#FFFFFF12" : "#eaeaeaea",
          "&:hover": {
            backgroundColor: "#ffffff20",
          },
        }}
        onClick={() => setIsOpenAllAlarmsModal(true)}
      >
        Show All
      </Button>
    </Box>
  );
};

export default RecentAlarm;
