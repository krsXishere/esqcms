"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Grid, Box, CircularProgress, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import SelectOption from "@/components/common/select-option";
import MultiSelectOption from "@/components/common/multiselect-option";
import { useFetchApi } from "@/app/hook/useFetchApi";
import LineChartComponent from "./line-chart-component";
import { getSocket } from "@/lib/socket";
import { getCached } from "@/lib/apiCache";

const POLL_MS = 30000;

// Limits
const AREAS_LIMIT = 5;
const DEVICES_LIMIT = 10;
const DATA_LIMIT_INITIAL = 200; // first load (riwayat)
const DATA_LIMIT_REFRESH = 10; // refresh ringan

/* ================= Helpers ================= */
function flattenDeviceDatas(apiRes, metaDict) {
  if (!apiRes) return [];

  if (Array.isArray(apiRes)) {
    const out = apiRes.map((row) => ({
      ...row,
      series: row.series || "default",
      Device: row.Device || {
        id: row.device_id,
        name:
          metaDict?.[String(row.device_id)]?.name || `Device-${row.device_id}`,
        area: { name: metaDict?.[String(row.device_id)]?.areaName || "" },
        status: { name: metaDict?.[String(row.device_id)]?.statusName || "" },
      },
    }));
    out.sort(
      (a, b) =>
        new Date(b.time_stamp).getTime() - new Date(a.time_stamp).getTime() ||
        (b.id || 0) - (a.id || 0)
    );
    return out;
  }

  const buckets =
    apiRes?.data && typeof apiRes.data === "object" ? apiRes.data : {};
  const out = [];

  Object.entries(buckets).forEach(([key, arr]) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((it) => {
      const meta = metaDict?.[String(it.device_id)] || {};
      out.push({
        ...it,
        series: key,
        Device: it.Device || {
          id: it.device_id,
          name: meta.name || `Device-${it.device_id}`,
          area: { name: meta.areaName || "" },
          status: { name: meta.statusName || "" },
        },
      });
    });
  });

  out.sort(
    (a, b) =>
      new Date(b.time_stamp).getTime() - new Date(a.time_stamp).getTime() ||
      (b.id || 0) - (a.id || 0)
  );
  return out;
}

/* ================= Component ================= */
const MonitoringContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendRequest } = useFetchApi();

  /* ===== State ===== */
  const [areaSelect, setAreaSelect] = useState([]);
  const [deviceSelect, setDeviceSelect] = useState([]);

  const [area, setArea] = useState(searchParams.get("area_id") || "All");

  // ⛔️ TIDAK lagi ambil dari URL; devices hanya di state
  const [devices, setDevices] = useState([]); // [] = ALL

  const [deviceDict, setDeviceDict] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== Refs ===== */
  const sendRequestRef = useRef(sendRequest);
  useEffect(() => {
    sendRequestRef.current = sendRequest;
  }, [sendRequest]);

  const areaRef = useRef(area);
  useEffect(() => {
    areaRef.current = area;
  }, [area]);

  const devicesRef = useRef(devices);
  useEffect(() => {
    devicesRef.current = devices;
  }, [devices]);

  const deviceDictRef = useRef(deviceDict);
  useEffect(() => {
    deviceDictRef.current = deviceDict;
  }, [deviceDict]);

  const firstLoadDoneRef = useRef(false);
  const pollRef = useRef(null);
  const debounceRef = useRef(null);

  /* ===== URL updater (khusus area saja) ===== */
  const updateQuery = (patch) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(patch).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        const csv = v.filter(Boolean).join(",");
        if (csv) params.set(k, csv);
        else params.delete(k);
      } else {
        if (v && v !== "All") params.set(k, v);
        else params.delete(k);
      }
    });
    const qs = params.toString();
    const href = qs ? `?${qs}` : window.location.pathname;
    router.replace(href, { scroll: false });
  };

  /* ===== Utils ===== */
  const currentDataLimit = () =>
    firstLoadDoneRef.current ? DATA_LIMIT_REFRESH : DATA_LIMIT_INITIAL;

  // [] → artikan ALL devices => semua id di deviceSelect
  const listActiveDeviceIds = () => {
    if (!devicesRef.current || devicesRef.current.length === 0) {
      return deviceSelect.map((o) => String(o.value));
    }
    return devicesRef.current.map(String);
  };

  /* ===== Core fetchers ===== */
  const fetchPerDeviceAll = async (
    withSpinner = true,
    idsOverride = null,
    dictOverride = null
  ) => {
    const ids = Array.isArray(idsOverride)
      ? idsOverride
      : listActiveDeviceIds();
    const metaDict = dictOverride || deviceDictRef.current;

    if (ids.length === 0) {
      if (withSpinner) setLoading(false);
      setRows([]);
      return;
    }

    if (withSpinner) setLoading(true);
    try {
      const baseParams = { sort: "time_stamp:desc", limit: currentDataLimit() };
      const ttl = 15 * 1000; // short TTL for monitoring device data (15s)
      const tasks = ids.map((id) =>
        (async () => {
          const key = `monitor:device_datas:${id}:limit:${baseParams.limit}`;
          try {
            const res = await getCached(
              key,
              async () =>
                await sendRequestRef.current({
                  url: "/device/datas",
                  params: { ...baseParams, device_id: id },
                }),
              ttl
            );
            return flattenDeviceDatas(res, metaDict);
          } catch (e) {
            return [];
          }
        })()
      );
      const settled = await Promise.allSettled(tasks);
      const merged = settled.flatMap((s) =>
        s.status === "fulfilled" ? s.value : []
      );
      merged.sort(
        (a, b) =>
          new Date(b.time_stamp).getTime() - new Date(a.time_stamp).getTime() ||
          (b.id || 0) - (a.id || 0)
      );
      setRows(merged);
    } finally {
      if (withSpinner) setLoading(false);
      firstLoadDoneRef.current = true;
    }
  };

  const fetchSingleDevice = async (
    withSpinner = true,
    idsOverride = null,
    dictOverride = null
  ) => {
    const metaDict = dictOverride || deviceDictRef.current;
    const params = { sort: "time_stamp:desc", limit: currentDataLimit() };

    const oneId =
      Array.isArray(idsOverride) && idsOverride.length > 0
        ? idsOverride[0]
        : devicesRef.current?.[0];
    if (oneId) params.device_id = oneId;
    if (areaRef.current && areaRef.current !== "All")
      params.area_id = areaRef.current;

    if (withSpinner) setLoading(true);
    try {
      const ttl = 15 * 1000; // 15s cache for single device data
      const oneId = params.device_id || "all";
      const key = `monitor:device_datas:${oneId}:limit:${params.limit}`;
      const res = await getCached(
        key,
        async () => await sendRequestRef.current({ url: "/device/datas", params }),
        ttl
      );
      const flat = flattenDeviceDatas(res, metaDict);
      setRows(flat);
    } finally {
      if (withSpinner) setLoading(false);
      firstLoadDoneRef.current = true;
    }
  };

  const refetchRef = useRef(null);
  refetchRef.current = async (
    withSpinner = true,
    idsOverride = null,
    dictOverride = null
  ) => {
    const ids = idsOverride ?? listActiveDeviceIds();
    if (ids.length === 0) {
      await fetchPerDeviceAll(withSpinner, null, dictOverride);
      return;
    }
    if (ids.length === 1) {
      await fetchSingleDevice(withSpinner, ids, dictOverride);
      return;
    }
    await fetchPerDeviceAll(withSpinner, ids, dictOverride);
  };

  /* ===== Loader Devices per Area (tanpa opsi "All") ===== */
  const loadDevicesByArea = async (areaVal) => {
    const isAll = !areaVal || areaVal === "All";
    const cacheKey = isAll
      ? `monitor:devices:all:limit:${DEVICES_LIMIT}`
      : `monitor:devices:area:${areaVal}:limit:${DEVICES_LIMIT}`;
    const devRes = await getCached(cacheKey, async () =>
      await sendRequestRef.current({
        url: "/devices",
        params: isAll
          ? { limit: DEVICES_LIMIT }
          : { area_id: areaVal, limit: DEVICES_LIMIT },
      })
    );

    const list = Array.isArray(devRes?.data) ? devRes.data : [];
    const opts = list.map((d) => ({ title: d.name, value: String(d.id) }));
    setDeviceSelect(opts);

    const dict = {};
    list.forEach((d) => {
      dict[String(d.id)] = {
        name: d.name,
        areaName: d?.area?.name || "",
        statusName: d?.status?.name || "",
        // [UPDATED] Simpan category name untuk filtering nanti
        categoryName: d?.device_category?.name || d?.category?.name || "",
      };
    });
    setDeviceDict(dict);
    deviceDictRef.current = dict;

    // Validasi selection vs opsi (⛔️ jangan update URL)
    const validSet = new Set(list.map((d) => String(d.id)));
    const filteredSelected = devicesRef.current.filter((id) =>
      validSet.has(String(id))
    );
    if (filteredSelected.length !== devicesRef.current.length) {
      setDevices(filteredSelected);
      devicesRef.current = filteredSelected;
    }

    return { ids: list.map((d) => String(d.id)), dict };
  };

  /* ===== INIT ===== */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      firstLoadDoneRef.current = false;
      try {
        const areaRes = await sendRequestRef.current({
          url: "/areas",
          params: { limit: AREAS_LIMIT },
        });
        if (cancelled) return;

        const areas = Array.isArray(areaRes?.data) ? areaRes.data : [];
        setAreaSelect([
          { title: "All", value: "All" },
          ...areas.map((a) => ({ title: a.name, value: String(a.id) })),
        ]);

        const { ids, dict } = await loadDevicesByArea(areaRef.current);
        if (cancelled) return;

        await refetchRef.current(true, ids, dict); // first time → 5000
      } finally {
        // spinner handled inside refetch
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []); // ⛔️ tanpa deps

  /* ===== SOCKET realtime ===== */
  useEffect(() => {
    const socket = getSocket();

    const onNew = () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const allIdsInArea = deviceSelect.map((o) => String(o.value));
        refetchRef.current(false, allIdsInArea);
      }, 200);
    };

    socket.on("new-device-data", onNew);
    return () => {
      socket.off("new-device-data", onNew);
      clearTimeout(debounceRef.current);
    };
  }, []);

  /* ===== POLLING fallback ===== */
  useEffect(() => {
    const startPolling = () => {
      clearInterval(pollRef.current);
      pollRef.current = setInterval(() => refetchRef.current(false), POLL_MS);
    };
    const stopPolling = () => clearInterval(pollRef.current);

    const onVis = () => {
      if (document.hidden) stopPolling();
      else {
        refetchRef.current(false);
        startPolling();
      }
    };
    const onOnline = () => refetchRef.current(false);

    startPolling();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("online", onOnline);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("online", onOnline);
    };
  }, []); // ⛔️ tanpa deps

  /* ===== Cards (group by device) ===== */
  const cards = useMemo(() => {
    const byDevice = new Map();
    rows.forEach((r) => {
      const idStr = String(r?.device_id ?? "");
      const nameFromDict = deviceDict?.[idStr]?.name;
      const name =
        nameFromDict ||
        r?.Device?.name ||
        (r?.device_id ? `Device-${r.device_id}` : "Unknown");
      if (!byDevice.has(name)) byDevice.set(name, []);
      byDevice.get(name).push(r);
    });
    return Array.from(byDevice.entries())
      .map(([deviceName, drows]) => ({ deviceName, rows: drows }))
      .sort((a, b) => a.deviceName.localeCompare(b.deviceName));
  }, [rows, deviceDict]);

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <SelectOption
          value={area}
          title="Area"
          width="25%"
          selectMenus={areaSelect}
          setValue={async (val) => {
            setArea(val);
            areaRef.current = val;

            // Reset devices ke ALL saat ganti area (tanpa URL)
            setDevices([]);
            devicesRef.current = [];

            // Area tetap update URL (boleh dipertahankan)
            updateQuery({ area_id: val });

            const { ids, dict } = await loadDevicesByArea(val);
            await refetchRef.current(true, ids, dict);
          }}
        />

        <MultiSelectOption
          title="Device"
          value={devices}
          setValue={async (vals) => {
            // ⛔️ Tidak update URL — state saja
            setDevices(vals);
            devicesRef.current = vals;

            // Hindari race: selalu pass idsOverride = vals
            await refetchRef.current(true, vals);
          }}
          selectMenus={deviceSelect} // TANPA opsi "All" — hanya device nyata
          width="25%"
          showSelectAll
          searchable
        />
      </Box>

      {/* Content */}
      {loading ? (
        <Box
          sx={{
            height: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {cards.length === 0 ? (
            <Grid item size={{ xs: 12 }} sx={{ mt: 5 }}>
              <Typography sx={{ textAlign: "center" }}>
                No Device Data
              </Typography>
            </Grid>
          ) : (
            cards.map(({ deviceName, rows: drows }) => {
              const devId = String(drows?.[0]?.device_id ?? "");
              const info = deviceDict?.[devId] || {};
              
              const statusName =
                info.statusName ||
                drows?.[0]?.Device?.status?.name ||
                "";
              const areaName =
                drows?.[0]?.Device?.area?.name ||
                info.areaName ||
                "";
              
              // [UPDATED] Ambil Category
              const categoryName = info.categoryName || "";

              // [UPDATED] Filter rows jika category adalah KWh Meter
              let displayRows = drows;
              if (categoryName === "KWh Meter") {
                const allowedMetrics = ["PTotal", "F", "E"];
                displayRows = drows.filter(row => {
                    // Logic: jika data bucket (series != default), filter by series
                    if (row.series && row.series !== 'default') {
                        return allowedMetrics.includes(row.series);
                    }
                    // Jika data flat (series == default), tampilkan semua (atau mapping key object jika diperlukan)
                    return true;
                });
              }

              return (
                <Grid item size={{ xs: 12, md: 6 }} key={deviceName}>
                  <LineChartComponent
                    rows={displayRows}
                    title={deviceName}
                    areaName={areaName}
                    status={statusName}
                  />
                </Grid>
              );
            })
          )}
        </Grid>
      )}
    </Box>
  );
};

export default MonitoringContainer;