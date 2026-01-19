// hooks/useSelectFilterHandlers.js
"use client";
import { useCallback } from "react";

/**
 * Generic Select Filter Handlers (contoh Area & Device).
 * Bisa dipakai ulang di halaman lain yang butuh filter 2 level.
 */
export default function useSelectFilterHandlers({
  router,
  searchParams,
  sendRef,
  device,
  setDevice,
  setArea,
  setAreaSelect,
  setDeviceSelect,
}) {
  const updateQueryParam = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "All") params.set(key, value);
      else params.delete(key);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const loadDevicesByArea = useCallback(
    async (areaVal) => {
      const isAll = !areaVal || areaVal === "All";
      const devRes = await sendRef.current({
        url: "/devices",
        params: isAll ? {} : { area_id: areaVal },
      });

      const opts = [
        { title: "All", value: "All" },
        ...(devRes?.data?.map((d) => ({
          title: d.name,
          value: String(d.id),
        })) || []),
      ];
      setDeviceSelect(opts);

      // validasi device
      if (!opts.some((o) => o.value === device)) {
        setDevice("All");
        updateQueryParam("device_id", "All");
      }
    },
    [device, sendRef, setDeviceSelect, setDevice, updateQueryParam]
  );

  const handleAreaChange = useCallback(
    async (val) => {
      setArea(val);
      updateQueryParam("area_id", val);

      // reset device
      setDevice("All");
      updateQueryParam("device_id", "All");

      await loadDevicesByArea(val);
    },
    [setArea, setDevice, updateQueryParam, loadDevicesByArea]
  );

  const handleDeviceChange = useCallback(
    (val) => {
      setDevice(val);
      updateQueryParam("device_id", val);
    },
    [setDevice, updateQueryParam]
  );

  const initAreas = useCallback(
    async (areaDefault) => {
      const areaRes = await sendRef.current({ url: "/areas" });
      setAreaSelect([
        { title: "All", value: "All" },
        ...(areaRes?.data?.map((a) => ({
          title: a.name,
          value: String(a.id),
        })) || []),
      ]);
      await loadDevicesByArea(areaDefault);
    },
    [sendRef, setAreaSelect, loadDevicesByArea]
  );

  return {
    updateQueryParam,
    loadDevicesByArea,
    handleAreaChange,
    handleDeviceChange,
    initAreas,
  };
}
