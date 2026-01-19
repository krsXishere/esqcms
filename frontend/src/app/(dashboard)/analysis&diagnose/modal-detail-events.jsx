"use client";
import React, { useEffect, useState } from "react";
import { Fade, Modal, Box, Button, Typography, Stack } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { AiFillExclamationCircle } from "react-icons/ai";
import { getHourFromISO } from "@/utils/utils";
import { FaRegClock } from "react-icons/fa";

const ModalDetailEvents = ({ open, setOpen, device_id }) => {
  const handleClose = () => setOpen(false);
  const { sendRequest } = useFetchApi();
  const [detailEvents, setDetailEvents] = useState([]);

  const getDeteilEvent = async () => {
    const res = await sendRequest({ url: `/events`, params: { device_id } });
    setDetailEvents(res.data);
    console.log(res);
  };
  useEffect(() => {
    getDeteilEvent();
  }, [open]);
  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Fade in={open}>
        <Box
          className={"custom-scroll"}
          sx={(theme) => ({
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            bgcolor: "#ffffff15",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            display: "flex",
            gap: "20px",
            flexDirection: "column",
            border: "1px solid #fff",
            maxHeight: "500px",
            overflowY: "scroll",

            [theme.breakpoints.up("xs")]: {
              p: 2,
              width: 370,
            },
            [theme.breakpoints.up("sm")]: {
              p: 3,
              width: 500,
            },
            [theme.breakpoints.up("lg")]: {
              p: 4,
              width: 800,
            },
          })}
        >
          <Box>
            <Typography
              variant="h5"
              id="modal-title"
              sx={{ fontWeight: "700", color: "#fff" }}
            >
              Events
            </Typography>
          </Box>

          <Stack>
            {detailEvents.length === 0 ? (
              <Typography
                sx={{
                  textAlign: "center",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "500",
                  paddingBlock: "18px",
                }}
              >
                Event is empty
              </Typography>
            ) : (
              detailEvents.map((data, i) => (
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
                    sx={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <AiFillExclamationCircle color="#1166E3" size={20} />
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#fff",
                      }}
                    >
                      {data.description}
                    </Typography>
                  </Box>
                  <Box
                    sx={(theme) => ({
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      fontSize: "14px",
                      color: "#fff",
                      [theme.breakpoints.up("xs")]: {
                        justifyContent: "flex-end",
                        width: "100%",
                      },
                    })}
                  >
                    <FaRegClock size={18} />
                    <Typography>
                      {data?.activation_time
                        ? getHourFromISO(data?.activation_time)
                        : "-"}
                    </Typography>
                  </Box>
                </Stack>
              ))
            )}
          </Stack>

          <Stack
            sx={{ flexDirection: "row", justifyContent: "end", gap: "8px" }}
          >
            <Button variant="contained" onClick={handleClose} sx={{ mt: 2 }}>
              Close
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalDetailEvents;
