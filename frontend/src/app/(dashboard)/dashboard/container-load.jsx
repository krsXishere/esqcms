"use client";
import { Box, Stack, Grid } from "@mui/material";
import React, { useState, useEffect } from "react";
import CurrentLoad from "./current-load";
import AreaTotal from "./area-total";
import { PiLightningSlashFill, PiLightningFill } from "react-icons/pi";
import { HiOutlineSignalSlash } from "react-icons/hi2";
import { IoWarning } from "react-icons/io5";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";

const ContainerLoad = () => {
  const { sendRequest, loading } = useFetchApi();
  const [totalArea, setTotalArea] = useState({
    Running: 0,
    Stopped: 0,
    Faulted: 0,
    Offline: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const params = { limit: 5000 };
      const result = await sendRequest({ url: "/utilities/with-status", params });

      const statusCount = result.data.reduce((acc, utility) => {
        const statusName = utility.status?.name || "Unknown";
        acc[statusName] = (acc[statusName] || 0) + 1;
        return acc;
      }, {});

      setTotalArea(statusCount);
    };

    fetchData();
  }, []);
  const theme = useTheme();
  return (
    <Box
      sx={(theme) => ({
        // paddingInline: "31px",
        // paddingBlock: "27px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000045",
        backgroundColor: theme.palette.mode == "dark" ? "transparent" : "white",
        width: "100%",
        borderRadius: "12px",
        [theme.breakpoints.up("xs")]: {
          p: "10px",
        },
        [theme.breakpoints.up("sm")]: {
          p: "16px",
        },
        [theme.breakpoints.up("lg")]: {
          p: "24px",
        },
      })}
    >
      <AreaTotal />
      <Grid
        container
        columnSpacing={1}
        rowSpacing={2}
        sx={{
          justifyContent: "space-between",
          marginTop: "35px",
          maxWidth: "100%",
        }}
      >
        <Grid item size={{ xs: 6, sm: 3 }}>
          <CurrentLoad
            color="#01B574"
            icon={
              <PiLightningFill
                color="#01B574"
                className="mx-auto size-5 md:size-6 lg:size-8"
              />
            }
            title={"Running"}
            value={totalArea?.Running || 0}
          />
        </Grid>
        <Grid item size={{ xs: 6, sm: 3 }}>
          <CurrentLoad
            color="#F5BC1E"
            icon={
              <PiLightningSlashFill
                color="#F5BC1E"
                className="mx-auto size-5 md:size-6 lg:size-8"
              />
            }
            title="Stopped"
            value={totalArea?.Stopped || 0}
          />
        </Grid>
        <Grid item size={{ xs: 6, sm: 3 }}>
          <CurrentLoad
            title="Faulted"
            color="#FF2056"
            icon={
              <IoWarning
                color="#FF2056"
                className="mx-auto size-5 md:size-6 lg:size-8"
              />
            }
            value={totalArea?.Faulted || 0}
          />
        </Grid>
        <Grid item size={{ xs: 6, sm: 3 }}>
          <CurrentLoad
            title="Offline"
            color="#8554FD"
            icon={
              <HiOutlineSignalSlash
                color="#8554FD"
                className="mx-auto size-5 md:size-6 lg:size-8"
              />
            }
            value={totalArea?.Offline || 0}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContainerLoad;
