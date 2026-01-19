"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import SelectOption from "@/components/common/select-option";
import { useFetchApi } from "@/app/hook/useFetchApi";
import AlarmSettingMenus from "./alarm-setting-menus";
import AlarmSettingOptions from "./alarm-setting-options";

export default function AlarmSetting({ initialDeviceId }) {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { sendRequest } = useFetchApi();
  const sendRef = useRef(sendRequest);
  useEffect(() => {
    // pastikan ref selalu pakai instance terbaru
    sendRef.current = sendRequest;
  }, [sendRequest]);

  // ======= State Area & Device =======
  const [area, setArea] = useState(""); // "" = All
  const [areaSelect, setAreaSelect] = useState([{ title: "All", value: "" }]);

  const [device, setDevice] = useState(""); // "" = none
  const [deviceSelect, setDevicesSelect] = useState([]);

  // ======= Alarm variables & selection =======
  const [alarmVar, setAlarmVar] = useState([]);
  const [selectedVarId, setSelectedVarId] = useState(null);

  // ======= Utils =======
  const updateUrl = (kv = {}) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(kv).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") params.delete(k);
      else params.set(k, String(v));
    });
    params.set("tab", "alarm");
    router.replace(`/alarm&notification?${params.toString()}`);
  };

  const fetchDevices = async (areaId) => {
    const res = await sendRef.current({
      url: "/devices",
      params: areaId ? { area_id: areaId, limit: 5000 } : { limit: 5000 },
    });
    const list = res?.data ?? res ?? [];
    const opts = list.map((d) => ({ title: d.name, value: d.id }));
    setDevicesSelect(opts);
    return opts;
  };

  const fetchAlarmByDevice = async (deviceId) => {
    const r = await sendRef.current({
      url: `/alarm-variables/device/${deviceId}`,
    });
    const arr = r?.data ?? r ?? [];
    return Array.isArray(arr) ? arr : [];
  };

  // ======= Load Areas (with "All") on mount =======
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const areas = await sendRef.current({
          url: "/areas",
          params: { limit: 5000 },
        });
        if (!alive) return;
        const areaOpts =
          (areas?.data ?? areas ?? []).map((a) => ({
            title: a?.name ?? a?.title ?? `Area ${a?.id}`,
            value: a?.id,
          })) ?? [];
        setAreaSelect([{ title: "All", value: "" }, ...areaOpts]);
      } catch (e) {
        console.error("Gagal mengambil areas:", e);
        setAreaSelect([{ title: "All", value: "" }]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ======= Sync from URL (area_id & device_id) =======
  useEffect(() => {
    const qArea = searchParams.get("area_id");
    const qDevice = searchParams.get("device_id");

    // area: "" | number | string
    const areaVal =
      qArea !== null ? (qArea === "" ? "" : Number(qArea) || qArea) : "";
    setArea(areaVal);

    // device: jika ada di URL → set; jika tidak & tidak ada initialDeviceId → kosong
    if (qDevice && qDevice !== "") setDevice(Number(qDevice) || qDevice);
    else if (!initialDeviceId) setDevice("");
  }, [searchParams, initialDeviceId]);

  // ======= initial device dari props (prioritas) =======
  useEffect(() => {
    if (initialDeviceId && initialDeviceId !== "") {
      const n = Number(initialDeviceId);
      const v = Number.isFinite(n) ? n : initialDeviceId;
      setDevice(v);
      // URL ikut sinkron
      updateUrl({ device_id: v });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDeviceId]);

  // ======= Saat AREA berubah → auto-select device pertama =======
  useEffect(() => {
    let alive = true;
    (async () => {
      // refresh opsi device sesuai area
      const opts = await fetchDevices(area);
      if (!alive) return;

      if (area) {
        // pilih device teratas jika ada
        const firstId = opts[0]?.value ?? "";
        setDevice(firstId);
        // Kosongkan data sementara (UX halus), data akan diisi oleh efek [device]
        setAlarmVar([]);
        setSelectedVarId(null);
        // URL sinkron
        updateUrl({ area_id: area || "", device_id: firstId || "" });
      } else {
        // Area = All → kosongkan device & data
        setDevice("");
        setAlarmVar([]);
        setSelectedVarId(null);
        updateUrl({ area_id: "", device_id: "" });
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area]);

  // ======= Saat DEVICE berubah → fetch alarm vars device itu =======
  useEffect(() => {
    let alive = true;
    (async () => {
      if (device === "" || device === null || device === undefined) return;
      try {
        const list = await fetchAlarmByDevice(device);
        if (!alive) return;
        setAlarmVar(list);
        setSelectedVarId((prev) =>
          list.some((x) => x.id === prev) ? prev : list[0]?.id ?? null
        );
      } catch (e) {
        if (!alive) return;
        console.error("Gagal mengambil alarm variables by device:", e);
        setAlarmVar([]);
        setSelectedVarId(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [device]);

  // ======= Handlers =======
  const handleChangeArea = async (val) => {
    const nextVal =
      val && typeof val === "object" && "target" in val
        ? val.target.value
        : val;

    // setArea memicu efek [area] yang akan:
    // - fetch devices by area
    // - auto set device pertama
    // - sinkron URL
    setArea(nextVal);
  };

  const handleChangeDevice = (val) => {
    const nextVal =
      val && typeof val === "object" && "target" in val
        ? val.target.value
        : val;
    setDevice(nextVal);
    updateUrl({ device_id: nextVal || "" });
  };

  const refetchCurrentDevice = async () => {
    if (!device) return;
    try {
      const list = await fetchAlarmByDevice(device);
      setAlarmVar(list);
      setSelectedVarId((prev) =>
        list.some((x) => x.id === prev) ? prev : list[0]?.id ?? null
      );
    } catch (e) {
      console.error("Gagal refresh alarm variables:", e);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", gap: 2, mb: "16px" }}>
        <SelectOption
          selectMenus={areaSelect}
          setValue={handleChangeArea}
          title="Area"
          value={area}
          width="338px"
          placeholder="Pilih Area"
        />
        <SelectOption
          selectMenus={deviceSelect}
          setValue={handleChangeDevice}
          title="Device"
          value={device}
          width="338px"
          placeholder="Pilih Device"
        />
      </Box>

      <Box
        sx={(theme) => ({
          borderWidth: 1,
          borderStyle: "solid",
          borderColor:
            theme.palette.mode === "dark" ? "#FFFFFF40" : "#00000045",
          backgroundColor:
            theme.palette.mode === "dark" ? "transparent" : "white",
          borderRadius: "12px",
          [theme.breakpoints.up("xs")]: { p: "10px" },
          [theme.breakpoints.up("sm")]: { p: "16px" },
          [theme.breakpoints.up("lg")]: {},
        })}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 20, mb: "20px" }}>
          Alarm Setting
        </Typography>

        <Box
          sx={(theme) => ({
            display: "flex",
            [theme.breakpoints.up("xs")]: {
              gap: "10px",
              flexDirection: "column",
            },
            [theme.breakpoints.up("sm")]: { flexDirection: "row", gap: "16px" },
            [theme.breakpoints.up("lg")]: {},
          })}
        >
          <AlarmSettingMenus
            data={alarmVar}
            selectedId={selectedVarId}
            onSelect={setSelectedVarId}
          />
          <AlarmSettingOptions
            selected={alarmVar.find((x) => x.id === selectedVarId) || null}
            onSaved={refetchCurrentDevice}
          />
        </Box>
      </Box>
    </>
  );
}
