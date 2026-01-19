// app/(routes)/alarm&notification/useUrlFilters.js
"use client";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function useUrlFilters() {
  const searchParams = useSearchParams();

  // "" artinya All (tidak difilter)
  const area = searchParams.get("area_id") ?? "";
  const device = searchParams.get("device_id") ?? "";

  // Jika ingin cast number bila angka:
  const toNumIfPossible = (v) => {
    if (v === "") return "";
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  };

  return useMemo(
    () => ({
      area: toNumIfPossible(area),
      device: toNumIfPossible(device),
    }),
    [area, device]
  );
}
