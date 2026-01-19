"use client";
import React, { useState, useEffect } from "react";
import { Fade, Modal, Box, Button, Typography, Stack } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { AiFillExclamationCircle } from "react-icons/ai";
import { FaRegClock } from "react-icons/fa";
import { getHourFromISO } from "@/utils/utils";
import { SlExclamation } from "react-icons/sl";

const ModalAllAlarms = ({ open, setOpen }) => {
  const [alarmsData, setAlarmsData] = useState([]);

  const { sendRequest } = useFetchApi();
  const handleClose = () => setOpen(false);
  useEffect(() => {
    const fetchAllAlarms = async () => {
      const res = await sendRequest({ url: "/alarms", params: { sort: "activation_time:desc" } });

      setAlarmsData(res?.data);
    };
    fetchAllAlarms();
  }, []);
  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition aria-labelledby="modal-title" aria-describedby="modal-description">
      <Fade in={open}>
        <Box className={"custom-scroll"} sx={(theme) => ({ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "background.paper", border: "2px solid #000", boxShadow: 24, bgcolor: "#ffffff15", backdropFilter: "blur(10px)", borderRadius: "12px", display: "flex", gap: "20px", flexDirection: "column", border: "1px solid #fff", maxHeight: "500px", overflowY: "scroll", [theme.breakpoints.up("xs")]: { p: 2, width: 370 }, [theme.breakpoints.up("sm")]: { p: 3, width: 500 }, [theme.breakpoints.up("lg")]: { p: 4, width: 800 } })}>
          <Stack flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
            <Typography variant="h5" id="modal-title" sx={{ fontWeight: "700", color: "#fff" }}>All Events</Typography>
            <Button variant="contained" onClick={handleClose} sx={{ mt: 2 }}>Close</Button>
          </Stack>

          <Stack sx={{ mt: 2 }}>
            {alarmsData.length === 0 ? (
              <Typography sx={{ textAlign: "center", padding: "18px", fontSize: "14px", fontWeight: 500, color: "#FFFFFF80" }}>No Alarms Available</Typography>
            ) : (
              alarmsData.map((data, i) => (
                <Stack key={i} sx={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBlock: "18px", borderBottom: "1px solid #FFFFFF25" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <SlExclamation color="#ff2056" size={20} />
                    <Typography sx={{ fontSize: "14px", fontWeight: "500", color: "white" }}>{data.description} - "{data?.device?.name}"</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "14px", color: "white" }}>
                    <FaRegClock size={18} />
                    <Typography>{data?.activation_time ? getHourFromISO(data?.activation_time) : "-"}</Typography>
                  </Box>
                </Stack>
              ))
            )}
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalAllAlarms;
