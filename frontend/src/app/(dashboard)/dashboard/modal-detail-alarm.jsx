"use client";
import React, { useState, useEffect } from "react";
import { Fade, Modal, Box, Button, Typography, Stack } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { formatDateTime } from "@/utils/utils";

const ModalDetailAlarm = ({ open, setOpen, id }) => {
  const handleClose = () => setOpen(false);
  const { sendRequest, loading } = useFetchApi();
  const [alarm, setAlarm] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetailAlarm = async () => {
      const result = await sendRequest({
        url: `/alarms/${id}`,
        method: "get",
      });

      if (result) {
        console.log("Alarm data from API:", result);
        const filtered = {
          device_name: result.device?.name || "-",
          serial_number: result.device?.serial_number || "-",
          description: result.description || "-",
          area_name: result.device?.area?.name || "-",
          activation_time: result.activation_time || null,
          termination_time: result.termination_time || null,
          value: result.value !== undefined && result.value !== null ? result.value : null,
          metric_name: result.metric_name || null,
          metric_unit: result.metric_unit || null,
          high_threshold: result.high_threshold !== undefined && result.high_threshold !== null ? result.high_threshold : null,
          low_threshold: result.low_threshold !== undefined && result.low_threshold !== null ? result.low_threshold : null,
        };
        console.log("Filtered alarm data:", filtered);
        setAlarm(filtered);
      }
    };
    fetchDetailAlarm();
  }, [id, open]);
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
            [theme.breakpoints.up("xs")]: {
              width: 370,
              p: 2,
            },
            [theme.breakpoints.up("sm")]: {
              p: 4,
              width: 500,
            },
            [theme.breakpoints.up("lg")]: {},
          })}
        >
          <Stack sx={{ gap: "20px" }}>
            <Typography
              sx={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}
            >
              Detail Alarm
            </Typography>
          </Stack>

          <Stack gap={"12px"} color={"white"}>
            <Typography>
              Device Name :{" "}
              <Typography component={"span"} fontWeight={700}>
                {alarm?.device_name}
              </Typography>
            </Typography>
            <Typography>
              Serial Number :{" "}
              <Typography component={"span"} fontWeight={700}>
                {alarm?.serial_number}
              </Typography>
            </Typography>
            <Typography>
              Description :{" "}
              <Typography component={"span"} fontWeight={700}>
                {alarm?.description}
              </Typography>
            </Typography>
            <Typography>
              Area Name :{" "}
              <Typography component={"span"} fontWeight={700}>
                {alarm?.area_name}
              </Typography>
            </Typography>
            <Typography>
              Activation Time :{" "}
              <Typography component={"span"} fontWeight={700}>
                {formatDateTime(alarm?.activation_time)}
              </Typography>
            </Typography>
            
            {(alarm?.value !== null && alarm?.value !== undefined) || 
             (alarm?.metric_name) || 
             (alarm?.high_threshold !== null && alarm?.high_threshold !== undefined) || 
             (alarm?.low_threshold !== null && alarm?.low_threshold !== undefined) ? (
              <>
                <Typography sx={{ mt: 2, fontWeight: 600, fontSize: "16px" }}>
                  Alarm Details:
                </Typography>
                {alarm?.metric_name && (
                  <Typography>
                    Metric :{" "}
                    <Typography component={"span"} fontWeight={700}>
                      {alarm?.metric_name}
                    </Typography>
                  </Typography>
                )}
                {(alarm?.value !== null && alarm?.value !== undefined) && (
                  <Typography>
                    Value When Alarm Occurred :{" "}
                    <Typography component={"span"} fontWeight={700} color="#FF2056">
                      {alarm?.value} {alarm?.metric_unit || ""}
                    </Typography>
                  </Typography>
                )}
                {(alarm?.low_threshold !== null && alarm?.low_threshold !== undefined) && (
                  <Typography>
                    Low Threshold :{" "}
                    <Typography component={"span"} fontWeight={700}>
                      {alarm?.low_threshold} {alarm?.metric_unit || ""}
                    </Typography>
                  </Typography>
                )}
                {(alarm?.high_threshold !== null && alarm?.high_threshold !== undefined) && (
                  <Typography>
                    High Threshold :{" "}
                    <Typography component={"span"} fontWeight={700}>
                      {alarm?.high_threshold} {alarm?.metric_unit || ""}
                    </Typography>
                  </Typography>
                )}
              </>
            ) : (
              <Typography sx={{ mt: 2, color: "#94a3b8", fontSize: "14px", fontStyle: "italic" }}>
                No threshold details available for this alarm (created before threshold tracking was implemented)
              </Typography>
            )}
          </Stack>
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              mt: 2,
              borderRadius: "12px",
              width: "fit-content",
              ml: "auto",
            }}
          >
            Close
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ModalDetailAlarm;
