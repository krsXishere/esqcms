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

const RecentEvents = ({ areaId }) => {
  const theme = useTheme();
  const [isOpenAllEventsModal, setIsOpenAllEventsModal] = useState(false);
  const [eventsData, setEventsData] = useState([]);

  const { sendRequest } = useFetchApi();

  useEffect(() => {
    const fetchEvents = async () => {
      const params = { limit: 3, sort: "activation_time:desc" };
      
      // Add area_id filter if provided and not "all"
      if (areaId && areaId !== "all") {
        params.area_id = areaId;
      }
      
      const res = await sendRequest({
        url: "/events",
        params,
      });

      setEventsData(res.data);
    };
    fetchEvents();
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
      <ModalAllEvents
        open={isOpenAllEventsModal}
        setOpen={setIsOpenAllEventsModal}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontWeight: "700", fontSize: "18px" }}>
          Recent Events
        </Typography>
        {/* <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconButton
            sx={{ backgroundColor: "#1166E3", color: "#fff", width: "36px" }}
          >
            <AiFillExclamationCircle />
          </IconButton>
          <IconButton
            sx={{ backgroundColor: "#1166E3", color: "#fff", width: "36px" }}
          >
            <IoWarning />
          </IconButton>
          <IconButton
            sx={{ backgroundColor: "#1166E3", color: "#fff", width: "36px" }}
          >
            <IoChatboxEllipses />
          </IconButton>
          <IconButton
            sx={{ backgroundColor: "##FFFFFF07", color: "#fff", width: "36px" }}
          >
            <IoIosRadio />
          </IconButton>
        </Box> */}
      </Box>

      <Box sx={{ mt: "18px", flex: 1 }}>
        {eventsData.length === 0 ? (
          <Typography
            sx={{
              textAlign: "center",
              color: theme.palette.text.secondary,
              fontSize: "14px",
              padding: "20px 0",
            }}
          >
            No Events Availble
          </Typography>
        ) : (
          eventsData.map((data, i) => (
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
                <AiFillExclamationCircle color="#1166E3" size={20} />
                <Typography sx={{ fontSize: "14px", fontWeight: "500" }}>
                  {data.description}
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
        onClick={() => setIsOpenAllEventsModal(true)}
      >
        Show All
      </Button>
    </Box>
  );
};

export default RecentEvents;
