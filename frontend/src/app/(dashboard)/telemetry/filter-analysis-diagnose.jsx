"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import SelectOption from "@/components/common/select-option";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { getCached } from "@/lib/apiCache";

const FilterAnalysisDialog = ({
  onApply,
  defaultValues = {},
  loading,
}) => {
  const theme = useTheme();
  const { sendRequest } = useFetchApi();

  const [area, setArea] = useState(defaultValues.area_id ?? undefined);
  const [utility, setUtility] = useState(defaultValues.utility_id ?? undefined);

  const [areaSelect, setAreaSelect] = useState([]);
  const [utilitiesSelect, setUtilitiesSelect] = useState([]);
  const [utilitiesLoading, setUtilitiesLoading] = useState(false);

  useEffect(() => {
    setArea(defaultValues.area_id ?? "All");
    setUtility(defaultValues.utility_id ?? "All");
  }, [defaultValues.area_id, defaultValues.utility_id]);

  const mapOptions = (items, label = "name", value = "id") => 
    (items ?? []).map((x) => ({ title: x[label], value: String(x[value]) }));

  useEffect(() => {
    const init = async () => {
      try {
        const areaRes = await getCached("areas", async () => 
          await sendRequest({ url: "/areas" })
        );
        const areas = mapOptions(areaRes?.data);
        setAreaSelect(areas);

        const initialArea = defaultValues.area_id ?? (areas.length ? areas[0].value : undefined);
        setArea(initialArea);

        const utilities = await loadUtilities(initialArea);
        const initialUtility = defaultValues.utility_id ?? (utilities.length ? utilities[0].value : undefined);
        setUtility(initialUtility);

        applyNow({ area_id: initialArea, utility_id: initialUtility });
      } catch (e) {
        console.error("Init filter error:", e);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUtilities = async (areaId) => {
    try {
      setUtilitiesLoading(true);
      const cacheKey = areaId ? `utilities:area:${areaId}` : `utilities:all`;
      const utilitiesRes = await getCached(cacheKey, async () =>
        await sendRequest({ url: "/utilities", params: areaId ? { area_id: areaId } : {} })
      );

      const mapped = mapOptions(utilitiesRes?.data);
      setUtilitiesSelect(mapped);
      return mapped;
    } catch (e) {
      console.error("Gagal load utilities:", e);
      const fallback = [];
      setUtilitiesSelect(fallback);
      return fallback;
    } finally {
      setUtilitiesLoading(false);
    }
  };

  const applyNow = ({ area_id, utility_id }) => {
    onApply?.({ area_id, utility_id });
  };

  const onChangeArea = async (v) => {
    setArea(v);
    const utilities = await loadUtilities(v);
    const picked = utilities.length ? utilities[0].value : undefined;
    setUtility(picked);
    applyNow({ area_id: v, utility_id: picked });
  };

  const onChangeUtility = (v) => {
    setUtility(v);
    applyNow({ area_id: area, utility_id: v });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <SelectOption 
          selectMenus={areaSelect} 
          title={"Area"} 
          value={area} 
          setValue={onChangeArea} 
          width={"400px"} 
        />

        <SelectOption 
          selectMenus={utilitiesSelect} 
          setValue={onChangeUtility} 
          value={utility} 
          title={utilitiesLoading ? "Utility (Loading...)" : "Utility"} 
          width={"400px"} 
          disabled={utilitiesLoading} 
        />
      </Box>

      <Box sx={{ borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
        <Typography sx={{ fontSize: 14, whiteSpace: "nowrap" }}>Most Recent</Typography>
      </Box>
    </Box>
  );
};

export default FilterAnalysisDialog;
