"use client";
import { Box, Typography, CircularProgress } from "@mui/material";
import React from "react";
import { FaRegMap } from "react-icons/fa6";
import { useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { useFetchApi } from "@/app/hook/useFetchApi";
import ModalMapBox from "./modal-map-box";

const AreaTotal = () => {
  const theme = useTheme();
  const { sendRequest, loading } = useFetchApi();
  const [totalArea, setTotalArea] = useState();
  const [openModalMapBox, setOpenModalMapBox] = useState(false);
  const [areaCoordinate, setAreaCoordinate] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const result = await sendRequest({ url: "/areas" });
      setTotalArea(result?.meta?.total);
      setAreaCoordinate({
        lat: result?.data[0]?.latitude,
        long: result?.data[0]?.longitude,
      });
    };

    fetchData();
  }, []);

  return (
    <Box
      sx={{
        with: "100%",
        maxWidth: "278px",
        padding: "18px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000045",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor:
          theme.palette.mode === "dark" ? "transparent" : "#00000012",
      }}
    >
      <ModalMapBox
        open={openModalMapBox}
        setOpen={setOpenModalMapBox}
        title="Lokasi"
        lat={areaCoordinate.lat}
        lng={areaCoordinate.long}
        areaName="Stasiun Maguwo"
      />
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "start" }}
      >
        <Typography
          sx={{
            color: theme.palette.mode === "dark" ? "#A0AEC0" : "#000",
            fontSize: "12px",
          }}
        >
          Area Total
        </Typography>
        {loading && <CircularProgress />}
        <Typography sx={{ fontWeight: "700", fontSize: "18px" }}>
          {totalArea}
        </Typography>
      </Box>
      <Box
        sx={{
          padding: "16px",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor:
            theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000045",
          borderRadius: "12px",
          cursor: "pointer",
        }}
        component={"div"}
        onClick={() => setOpenModalMapBox(true)}
      >
        <FaRegMap size={16} />
      </Box>
    </Box>
  );
};

export default AreaTotal;
