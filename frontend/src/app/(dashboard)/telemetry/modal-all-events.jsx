"use client";
import React, { useState, useEffect } from "react";
import { Fade, Modal, Box, Button, Typography, Stack } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { AiFillExclamationCircle } from "react-icons/ai";
import { FaRegClock } from "react-icons/fa";
import { getHourFromISO } from "@/utils/utils";

const ModalAllEvents = ({ open, setOpen }) => {
  const [eventsData, setEventsData] = useState([]);

  const { sendRequest } = useFetchApi();
  const handleClose = () => setOpen(false);
  useEffect(() => {
    const fetchAllEvents = async () => {
      const res = await sendRequest({ url: "/events", params: { sort: "activation_time:desc" } });

      setEventsData(res?.data);
    };
    fetchAllEvents();
  }, []);
  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition aria-labelledby="modal-title" aria-describedby="modal-description">
      <Fade in={open}>
        <Box className={"custom-scroll"} sx={(theme) => ({ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "background.paper", border: "2px solid #000", boxShadow: 24, bgcolor: "#ffffff15", backdropFilter: "blur(10px)", borderRadius: "12px", display: "flex", gap: "20px", flexDirection: "column", border: "1px solid #fff", maxHeight: "500px", overflowY: "scroll", [theme.breakpoints.up("xs")]: { p: 2, width: 370 }, [theme.breakpoints.up("sm")]: { p: 3, width: 500 }, [theme.breakpoints.up("lg")]: { p: 4, width: 900 } })}>
          <Stack flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
            <Typography variant="h5" id="modal-title" sx={{ fontWeight: "700", color: "#fff" }}>All Events</Typography>
            <Button variant="contained" onClick={handleClose} sx={{ mt: 2 }}>Close</Button>
          </Stack>

          <Stack sx={{ mt: 2 }}>
            {eventsData.length > 0 ? (
              eventsData.map((data, i) => (
                <Stack key={data?.id ?? i} sx={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBlock: "18px", borderBottom: "1px solid #FFFFFF25" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <AiFillExclamationCircle color="#1166E3" size={20} />
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: "white" }}>{data?.description ?? "-"}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: "8px", alignItems: "center", color: "white" }}>
                    <FaRegClock size={18} />
                    <Typography sx={{ fontSize: "14px" }}>{data?.activation_time ? getHourFromISO(data.activation_time) : "-"}</Typography>
                  </Box>
                </Stack>
              ))
            ) : (
              <Typography sx={{ textAlign: "center", py: 3, fontSize: "14px", fontWeight: 500, color: "#FFFFFF80" }}>No Events Available</Typography>
            )}
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalAllEvents;
