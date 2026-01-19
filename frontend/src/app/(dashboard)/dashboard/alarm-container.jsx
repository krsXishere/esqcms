"use client";
import React, { useEffect, useState } from "react";
import Alarm from "./alarm";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import ModalDetailAlarm from "./modal-detail-alarm";

const AlarmContainer = () => {
  const { sendRequest } = useFetchApi();
  const [alarmData, setAlarmData] = useState([]);

  const [modalOpenDetailAlarm, setModalOpenDetailAlarm] = useState(false);
  const [id, setId] = useState();

  const theme = useTheme();

  const handleOpenDetailAlarmModal = (id) => {
    setModalOpenDetailAlarm(true);
    setId(id);
  };

  useEffect(() => {
    const fetchApi = async () => {
      const result = await sendRequest({
        url: "/alarms",
        params: { limit: 3, sort: "activation_time:desc" },
      });

      const mappedAlarms = result?.data?.map((item) => ({
        id: item.id,
        description: item.description,
        activation_time: item.activation_time,
        termination_time: item.termination_time,
        device_name: item.device?.name || "-",
        serial_number: item.device?.serial_number || "-",
        area_name: item.device?.area?.name || "-",
        utility_name: item.device?.utilityMappings?.[0]?.utility?.name || "-",
      }));
      setAlarmData(mappedAlarms);
    };
    fetchApi();
  }, []);
  return (
    <Box
      component={"div"}
      className="custom-scroll"
      sx={(theme) => ({
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000045",
        backgroundColor: theme.palette.mode == "dark" ? "transparent" : "white",
        borderRadius: "12px",
        height: "300px",

        [theme.breakpoints.down("md")]: {
          padding: "14px",
          width: "100%",
          overflow: "scroll",
        },
        [theme.breakpoints.up("md")]: {
          width: "70%",
        },
        [theme.breakpoints.up("lg")]: {
          padding: "24px",
          width: "70%",
        },
      })}
    >
      <ModalDetailAlarm
        id={id}
        setOpen={setModalOpenDetailAlarm}
        open={modalOpenDetailAlarm}
      />
      <Typography
        sx={{
          fontSize: "18px",
          fontWeight: "700",
          marginBottom: "20px",
        }}
      >
        Alarm
      </Typography>
      <Stack sx={{ flexDirection: "column", gap: "20px", width: "100%" }}>
        {alarmData.length ? (
          alarmData.map((data) => (
            <Alarm
              key={data.id}
              description={data.description}
              activation_time={data.activation_time}
              area_name={data.area_name}
              device_name={data.device_name}
              utility_name={data.utility_name}
              onDetail={handleOpenDetailAlarmModal}
              id={data.id}
            />
          ))
        ) : (
          <Box
            severity="info"
            variant="outlined"
            aria-live="polite"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography>No Alarms Available</Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default AlarmContainer;
