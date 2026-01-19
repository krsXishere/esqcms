"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  IconButton,
  Stack,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { GoArrowRight, GoArrowLeft } from "react-icons/go";
import SelectOption from "@/components/common/select-option";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { getCached } from "@/lib/apiCache";

// Helper to format date to YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to format time to HH:00
const formatHour = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const hour = String(d.getHours()).padStart(2, "0");
  return `${hour}:00`;
};

const FilterAnalysisDialog = ({
  onApply,
  // defaultValues can provide area_id/utility_id/time_span but if absent we'll
  // pick the first area and first utility returned by the backend
  defaultValues = {},
  loading,
  timeSpanOptions = ["1h", "1d", "4d", "1w", "15d", "1m", "3m", "6m", "1y"],
}) => {
  const theme = useTheme();
  const { sendRequest } = useFetchApi();

  const [area, setArea] = useState(defaultValues.area_id ?? undefined);
  const [utility, setUtility] = useState(defaultValues.utility_id ?? undefined);
  const [span, setSpan] = useState(
    (defaultValues.time_span ?? "1d").toLowerCase()
  );

  // Date and time selection states
  const [selectedDate, setSelectedDate] = useState(defaultValues.selected_date ?? formatDate(new Date()));
  const [selectedHour, setSelectedHour] = useState(defaultValues.selected_hour ?? formatHour(new Date()));

  // Comparison states
  const [compareEnabled, setCompareEnabled] = useState(defaultValues.compare_enabled === "true" || defaultValues.compare_enabled === true);
  const [compareMode, setCompareMode] = useState(defaultValues.compare_mode ?? "combined"); // "combined" or "separate"

  const [areaSelect, setAreaSelect] = useState([]);
  const [utilitiesSelect, setUtilitiesSelect] = useState([]);
  const [utilitiesLoading, setUtilitiesLoading] = useState(false);

  // Sinkronkan state kalau defaultValues berubah
  useEffect(() => {
    setArea(defaultValues.area_id ?? "All");
    setUtility(defaultValues.utility_id ?? "All");
    setSpan((defaultValues.time_span ?? "1d").toLowerCase());
    if (defaultValues.selected_date) setSelectedDate(defaultValues.selected_date);
    if (defaultValues.selected_hour) setSelectedHour(defaultValues.selected_hour);
    if (defaultValues.compare_enabled !== undefined) setCompareEnabled(defaultValues.compare_enabled === "true" || defaultValues.compare_enabled === true);
    if (defaultValues.compare_mode) setCompareMode(defaultValues.compare_mode);
  }, [defaultValues.area_id, defaultValues.utility_id, defaultValues.time_span, defaultValues.selected_date, defaultValues.selected_hour, defaultValues.compare_enabled, defaultValues.compare_mode]);

  // Helper: mapping option
  // No "All" option — return list as-is (mapped). Caller will pick default if needed.
  const mapOptions = (items, label = "name", value = "id") =>
    (items ?? []).map((x) => ({ title: x[label], value: String(x[value]) }));

  // Fetch area list & initial utility list (mengikuti area awal)
  useEffect(() => {
    const init = async () => {
      try {
        // try cached areas first
        const areaRes = await getCached("areas", async () => await sendRequest({ url: "/areas" }));
        const areas = mapOptions(areaRes?.data);
        setAreaSelect(areas);

        // pick initial area: prefer provided defaultValues.area_id, otherwise first area
        const initialArea =
          defaultValues.area_id ?? (areas.length ? areas[0].value : undefined);
        setArea(initialArea);

        // load utilities for the chosen area and pick initial utility
        const utilities = await loadUtilities(initialArea);
        const initialUtility =
          defaultValues.utility_id ?? (utilities.length ? utilities[0].value : undefined);
        setUtility(initialUtility);

        // apply the chosen initial filter so parent can load data
        applyNow({ area_id: initialArea, utility_id: initialUtility, time_span: (defaultValues.time_span ?? "1d").toLowerCase(), selected_date: selectedDate, selected_hour: selectedHour });
      } catch (e) {
        console.error("Init filter error:", e);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fungsi fetch utility berdasarkan area
  // Return mapped utility options so callers can pick the first utility when needed.
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

  // === instant apply ===
  const applyNow = (
    next = { area_id: area, utility_id: utility, time_span: span, selected_date: selectedDate, selected_hour: selectedHour, compare_enabled: compareEnabled, compare_mode: compareMode }
  ) => {
    onApply?.({
      area_id: next.area_id,
      utility_id: next.utility_id,
      time_span: (next.time_span || "1d").toLowerCase(),
      selected_date: next.selected_date,
      selected_hour: next.selected_hour,
      compare_enabled: next.compare_enabled,
      compare_mode: next.compare_mode,
    });
  };

  const handleChangeSpan = (_e, newValue) => {
    if (!newValue) return;
    setSpan(newValue);
    applyNow({ area_id: area, utility_id: utility, time_span: newValue, selected_date: selectedDate, selected_hour: selectedHour, compare_enabled: compareEnabled, compare_mode: compareMode });
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    applyNow({ area_id: area, utility_id: utility, time_span: span, selected_date: newDate, selected_hour: selectedHour, compare_enabled: compareEnabled, compare_mode: compareMode });
  };

  const handleHourChange = (e) => {
    const newHour = e.target.value;
    setSelectedHour(newHour);
    applyNow({ area_id: area, utility_id: utility, time_span: span, selected_date: selectedDate, selected_hour: newHour, compare_enabled: compareEnabled, compare_mode: compareMode });
  };

  const handleCompareEnabledChange = (e) => {
    const enabled = e.target.checked;
    setCompareEnabled(enabled);
    applyNow({ area_id: area, utility_id: utility, time_span: span, selected_date: selectedDate, selected_hour: selectedHour, compare_enabled: enabled, compare_mode: compareMode });
  };

  const handleCompareModeChange = (_e, newMode) => {
    if (!newMode) return;
    setCompareMode(newMode);
    applyNow({ area_id: area, utility_id: utility, time_span: span, selected_date: selectedDate, selected_hour: selectedHour, compare_enabled: compareEnabled, compare_mode: newMode });
  };

  const handleNext = () => {
    const currentIndex = timeSpanOptions.indexOf(span);
    if (currentIndex < timeSpanOptions.length - 1) {
      const nxt = timeSpanOptions[currentIndex + 1];
      setSpan(nxt);
      applyNow({ area_id: area, utility_id: utility, time_span: nxt, selected_date: selectedDate, selected_hour: selectedHour, compare_enabled: compareEnabled, compare_mode: compareMode });
    }
  };

  const handlePrev = () => {
    const currentIndex = timeSpanOptions.indexOf(span);
    if (currentIndex > 0) {
      const prv = timeSpanOptions[currentIndex - 1];
      setSpan(prv);
      applyNow({ area_id: area, utility_id: utility, time_span: prv, selected_date: selectedDate, selected_hour: selectedHour, compare_enabled: compareEnabled, compare_mode: compareMode });
    }
  };

  // Saat area berubah:
  // - reset utility ke "All"
  // - fetch ulang utility list sesuai area
  // - instant apply (area baru + utility "All")
  const onChangeArea = async (v) => {
    setArea(v);
    // load utilities for the new area and pick the first utility
    const utilities = await loadUtilities(v);
    const picked = utilities.length ? utilities[0].value : undefined;
    setUtility(picked);
    applyNow({ area_id: v, utility_id: picked, time_span: span, selected_date: selectedDate, selected_hour: selectedHour, compare_enabled: compareEnabled, compare_mode: compareMode });
  };

  const onChangeUtility = (v) => {
    setUtility(v);
    applyNow({ area_id: area, utility_id: v, time_span: span, selected_date: selectedDate, selected_hour: selectedHour, compare_enabled: compareEnabled, compare_mode: compareMode });
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

      <Box
        sx={{
          borderRadius: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            gap: "8px",
            [theme.breakpoints.up("xs")]: {
              flexDirection: "column",
              alignItems: "start",
            },
            [theme.breakpoints.up("sm")]: {
              flexDirection: "row",
              alignItems: "center",
            },
          })}
        >
          <Typography sx={{ fontSize: 14, whiteSpace: "nowrap" }}>
            Most Recent
          </Typography>

          <ToggleButtonGroup
            value={span}
            exclusive
            onChange={handleChangeSpan}
            sx={(theme) => ({
              backgroundColor:
                theme.palette.mode === "dark" ? "#FFFFFF07" : "#00000010",
              borderRadius: "10px",
              ".Mui-selected": {
                color: "#fff !important",
                backgroundColor: `${
                  theme.palette.mode === "dark" ? "#1166e3" : "#08c2ff"
                } !important`,
              },
              [theme.breakpoints.up("xs")]: {
                "& .MuiToggleButton-root": {
                  border: "none",
                  px: 1,
                },
              },
              [theme.breakpoints.up("sm")]: {
                flexDirection: "row",
                "& .MuiToggleButton-root": {
                  border: "none",
                  px: 2,
                },
              },
            })}
          >
            {timeSpanOptions.map((option) => (
              <ToggleButton
                key={option}
                value={option}
                sx={{ textTransform: "uppercase" }}
              >
                {option}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* Date picker - shown for 1d, 4d, 1w, etc. */}
          {["1d", "4d", "1w", "15d", "1m", "3m", "6m", "1y"].includes(span) && (
            <TextField
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              size="small"
              sx={{
                width: "160px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: theme.palette.mode === "dark" ? "#FFFFFF07" : "#00000010",
                  "& fieldset": { border: "none" },
                },
                "& .MuiInputBase-input": {
                  color: theme.palette.mode === "dark" ? "#fff" : "#000",
                  fontSize: "14px",
                  "&::-webkit-calendar-picker-indicator": {
                    filter: theme.palette.mode === "dark" ? "invert(1)" : "none",
                  },
                },
              }}
              InputLabelProps={{ shrink: true }}
            />
          )}

          {/* Hour picker - shown only for 1h */}
          {span === "1h" && (
            <>
              <TextField
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                size="small"
                sx={{
                  width: "160px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: theme.palette.mode === "dark" ? "#FFFFFF07" : "#00000010",
                    "& fieldset": { border: "none" },
                  },
                  "& .MuiInputBase-input": {
                    color: theme.palette.mode === "dark" ? "#fff" : "#000",
                    fontSize: "14px",
                    "&::-webkit-calendar-picker-indicator": {
                      filter: theme.palette.mode === "dark" ? "invert(1)" : "none",
                    },
                  },
                }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="time"
                value={selectedHour}
                onChange={handleHourChange}
                size="small"
                inputProps={{ step: 3600 }} // 1 hour steps
                sx={{
                  width: "120px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    backgroundColor: theme.palette.mode === "dark" ? "#FFFFFF07" : "#00000010",
                    "& fieldset": { border: "none" },
                  },
                  "& .MuiInputBase-input": {
                    color: theme.palette.mode === "dark" ? "#fff" : "#000",
                    fontSize: "14px",
                    "&::-webkit-calendar-picker-indicator": {
                      filter: theme.palette.mode === "dark" ? "invert(1)" : "none",
                    },
                  },
                }}
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
        </Box>

        <Stack
          sx={(theme) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
            [theme.breakpoints.up("xs")]: { display: "none" },
            [theme.breakpoints.up("sm")]: { display: "flex" },
          })}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconButton
              onClick={handlePrev}
              disabled={span === timeSpanOptions[0]}
              sx={{
                color: theme.palette.mode === "dark" ? "#fff" : "#000",
                backgroundColor: "transparent",
                display: "flex",
                gap: "8px",
                "&:hover": { backgroundColor: "transparent" },
              }}
            >
              <Typography>Previous</Typography>
              <GoArrowLeft size={20} />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconButton
              onClick={handleNext}
              disabled={span === timeSpanOptions[timeSpanOptions.length - 1]}
              sx={{
                color: theme.palette.mode === "dark" ? "#fff" : "#000",
                backgroundColor: "transparent",
                display: "flex",
                gap: "8px",
                "&:hover": { backgroundColor: "transparent" },
              }}
            >
              <GoArrowRight size={20} />
              <Typography>Next</Typography>
            </IconButton>
          </Box>
        </Stack>
      </Box>

      {/* Comparison Controls */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={compareEnabled}
              onChange={handleCompareEnabledChange}
              sx={{
                color: theme.palette.mode === "dark" ? "#fff" : "#000",
                "&.Mui-checked": {
                  color: theme.palette.mode === "dark" ? "#1166e3" : "#08c2ff",
                },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: 14 }}>
              Compare with Previous Period
            </Typography>
          }
        />

        {compareEnabled && (
          <ToggleButtonGroup
            value={compareMode}
            exclusive
            onChange={handleCompareModeChange}
            size="small"
            sx={(theme) => ({
              backgroundColor:
                theme.palette.mode === "dark" ? "#FFFFFF07" : "#00000010",
              borderRadius: "10px",
              ".Mui-selected": {
                color: "#fff !important",
                backgroundColor: `${
                  theme.palette.mode === "dark" ? "#1166e3" : "#08c2ff"
                } !important`,
              },
              "& .MuiToggleButton-root": {
                border: "none",
                px: 2,
                textTransform: "none",
              },
            })}
          >
            <ToggleButton value="combined">Combined Chart</ToggleButton>
            <ToggleButton value="separate">Separate Charts</ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>
    </Box>
  );
};

export default FilterAnalysisDialog;
