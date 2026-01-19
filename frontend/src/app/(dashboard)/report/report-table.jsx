// ReportTable.jsx
"use client";
import {
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Stack,
  MenuItem,
  TextField,
} from "@mui/material";
import { useState, useEffect, useMemo, useCallback } from "react";
import SelectOption from "@/components/common/select-option";
import TableComponents from "@/components/common/table-component";
import { useTheme } from "@mui/material";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useRouter, useSearchParams } from "next/navigation";
import { downloadReportPdf } from "@/app/hook/report/handleDownloadPdf";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

/* === tambahan untuk DatePicker seperti di ModalAddArea === */
import { styled } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

/* === StyledTextField disamakan dengan ModalAddArea === */
const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 16,
    color: theme.palette.mode === "dark" ? "#fff" : "#000",
    "& fieldset": {
      borderColor: theme.palette.mode === "dark" ? "#ffffff35" : "#00000025",
    },
    "&:hover fieldset": {
      borderColor: theme.palette.mode === "dark" ? "#eaeaea" : "#000000",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#38bdf8",
      boxShadow: "0 0 14px rgba(56,189,248,0.5)",
      "&.Mui-error": { color: "#fff" },
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.mode === "dark" ? "#ffffff90" : "#00000070",
  },
}));

const ReportTable = () => {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendRequest } = useFetchApi();

  const [value, setValue] = useState("hourly"); // monthly | daily | hourly | yearly
  const page = parseInt(searchParams.get("page") || "1");
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [area, setArea] = useState(searchParams.get("area_id") || "All");
  const [utility, setUtility] = useState(searchParams.get("utility_id") || "All");

  const [areaSelect, setAreaSelect] = useState([]);
  const [utilitySelect, setUtilitySelect] = useState([]);
  const [rows, setRows] = useState([]);

  // ====== State pemilih waktu sesuai mode ======
  const [hourlyDate, setHourlyDate] = useState(() => dayjs()); // tanggal: 24 jam
  const [dailyMonth, setDailyMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [monthlyYear, setMonthlyYear] = useState(() =>
    new Date().getFullYear()
  );
  // ====== State untuk Weekly Report ======
  const [weeklyMonth, setWeeklyMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [weeklyWeek, setWeeklyWeek] = useState(() => {
    // Hitung minggu ke berapa di bulan ini
    const d = new Date();
    return Math.ceil(d.getDate() / 7);
  });

  // ====== State untuk Shift Report (12 jam: Shift 1 = 7AM-8PM, Shift 2 = 8PM-7AM) ======
  const [shiftDate, setShiftDate] = useState(() => dayjs()); // tanggal untuk shift
  const [shiftType, setShiftType] = useState("shift1"); // shift1 atau shift2

  // state untuk kontrol open/close popper di Hourly DatePicker (aman utk Rules of Hooks)
  const [openHourlyPicker, setOpenHourlyPicker] = useState(false);

  const columns = useMemo(
    () => [
      { title: "DEVICE NAME", field: "name" },
      { title: "SERIAL NUMBER", field: "serial_number" },
      { title: "AREA", field: "area.name" },
    ],
    []
  );

  const handleChange = (_, newValue) => {
    if (newValue !== null) setValue(newValue);
  };

  const updateQueryParam = useCallback(
    (key, val) => {
      const params = new URLSearchParams(searchParams.toString());
      const valueStr = val == null ? "" : String(val);
      if (valueStr && valueStr !== "All") params.set(key, valueStr);
      else params.delete(key);
      if (["area_id", "device_id"].includes(key)) params.set("page", "1");
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // ===== Helpers normalisasi response =====
  const normalizeListResponse = (result) => {
    const list = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result?.data?.data)
      ? result.data.data
      : Array.isArray(result)
      ? result
      : [];
    const metaTotal = result?.meta?.total ?? list.length ?? 0;
    const metaTotalPages = result?.meta?.totalPages ?? 1;
    const lim = result?.limit ?? limit ?? 10;
    return { list, metaTotal, metaTotalPages, lim };
  };

  const normalizeDetailResponse = (res) => {
    const one =
      res && typeof res === "object" && !Array.isArray(res) && res.id
        ? res
        : res?.data && typeof res.data === "object" && res.data.id
        ? res.data
        : res?.data?.data && res.data.data.id
        ? res.data.data
        : null;
    return one ? [one] : [];
  };

  // ===== Dropdowns (mount once) =====
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const areaResult = await sendRequest({ url: "/areas" });
        if (!mounted) return;

        const formattedArea = [
          { title: "All", value: "All" },
          ...(areaResult?.data?.map((a) => ({
            title: a.name,
            value: String(a.id),
          })) || []),
        ];
        setAreaSelect(formattedArea);
      } catch (e) {
        setAreaSelect([{ title: "All", value: "All" }]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ===== Fetch utilities when area changes =====
  useEffect(() => {
    let mounted = true;
    if (area === "All") {
      setUtilitySelect([{ title: "All", value: "All" }]);
      setUtility("All");
      return;
    }
    (async () => {
      try {
        const utilityResult = await sendRequest({ 
          url: "/utilities", 
          params: { area_id: area, limit: 1000 } 
        });
        if (!mounted) return;

        const list = Array.isArray(utilityResult?.data)
          ? utilityResult.data
          : Array.isArray(utilityResult?.data?.data)
          ? utilityResult.data.data
          : Array.isArray(utilityResult)
          ? utilityResult
          : [];
        const formattedUtilities = [
          { title: "All", value: "All" },
          ...list.map((u) => ({ title: u.name, value: String(u.id) })),
        ];
        setUtilitySelect(formattedUtilities);
      } catch (e) {
        setUtilitySelect([{ title: "All", value: "All" }]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [area]);

  // ===== Fetch List =====
  const fetchUtilitiesList = useCallback(async () => {
    const params = { page, limit };
    const areaParam = searchParams.get("area_id");
    const sortParam = searchParams.get("sort");
    const searchParam = searchParams.get("search");

    if (areaParam) params.area_id = areaParam;
    if (sortParam) params.sort = sortParam;
    if (searchParam) params.search = searchParam;

    const result = await sendRequest({ url: "/utilities", params });
    const { list, metaTotal, metaTotalPages, lim } =
      normalizeListResponse(result);

    setRows(list);
    setTotal(metaTotal);
    setTotalPages(metaTotalPages);
    setLimit(lim);
  }, [limit, page, searchParams]);

  // ===== Fetch Detail =====
  const fetchSingleUtility = useCallback(
    async (id) => {
      const numericId = Number.isNaN(Number(id)) ? id : Number(id);
      const res = await sendRequest({ url: `/utilities/${numericId}` });
      const list = normalizeDetailResponse(res);
      setRows(list);
      setTotal(list.length);
      setTotalPages(1);
      setLimit(10);
    },
    [sendRequest]
  );

  // ===== Switch endpoint by utility_id =====
  useEffect(() => {
    let mounted = true;
    (async () => {
      const utilityId = searchParams.get("utility_id");
      try {
        if (utilityId && utilityId !== "All") {
          await fetchSingleUtility(utilityId);
        } else {
          await fetchUtilitiesList();
        }
      } catch (e) {
        if (!mounted) return;
        setRows([]);
        setTotal(0);
        setTotalPages(1);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const years = useMemo(() => {
    const nowY = new Date().getFullYear();
    const ys = [];
    for (let y = nowY; y >= nowY - 10; y--) ys.push(y);
    return ys;
  }, []);

  const months = useMemo(
    () => [
      { v: 0, label: "January" },
      { v: 1, label: "February" },
      { v: 2, label: "March" },
      { v: 3, label: "April" },
      { v: 4, label: "May" },
      { v: 5, label: "June" },
      { v: 6, label: "July" },
      { v: 7, label: "August" },
      { v: 8, label: "September" },
      { v: 9, label: "October" },
      { v: 10, label: "November" },
      { v: 11, label: "December" },
    ],
    []
  );

  // Helper: Hitung jumlah minggu dalam bulan tertentu
  const getWeeksInMonth = useCallback((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Minggu dihitung dari 1-7 hari = minggu 1, 8-14 = minggu 2, dst
    return Math.ceil(daysInMonth / 7);
  }, []);

  // Helper: Hitung start dan end date dari minggu ke-N dalam bulan
  const getWeekRange = useCallback((date, weekNumber) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDate = (weekNumber - 1) * 7 + 1;
    const endDate = Math.min(weekNumber * 7, new Date(year, month + 1, 0).getDate());
    
    const start = new Date(year, month, startDate);
    const end = new Date(year, month, endDate);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }, []);

  // Range kalkulasi dari pilihan
  const computeSelectedRange = useCallback(() => {
    if (value === "hourly") {
      const dateObj = hourlyDate?.toDate ? hourlyDate.toDate() : new Date(hourlyDate);
      return { start: startOfDay(dateObj), end: endOfDay(dateObj) };
    }
    if (value === "daily") {
      return { start: startOfMonth(dailyMonth), end: endOfMonth(dailyMonth) };
    }
    if (value === "weekly") {
      return getWeekRange(weeklyMonth, weeklyWeek);
    }
    if (value === "monthly") {
      const base = new Date(monthlyYear, 0, 1);
      return { start: startOfYear(base), end: endOfYear(base) };
    }
    if (value === "yearly") {
      const now = new Date();
      return { start: startOfYear(now), end: endOfYear(now) };
    }
    const now = new Date();
    return { start: startOfDay(now), end: now };
  }, [value, hourlyDate, dailyMonth, weeklyMonth, weeklyWeek, monthlyYear, getWeekRange]);

  // UI Panel Pemilih Waktu
  const TimePickerInline = () => {
    if (value === "hourly") {
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Pick Date"
            value={hourlyDate ? dayjs(hourlyDate) : dayjs()}
            open={openHourlyPicker}
            onChange={(newValue) => {
              if (newValue && newValue.isValid && newValue.isValid()) {
                setHourlyDate(newValue);
              }
              setOpenHourlyPicker(false);
            }}
            onOpen={() => setOpenHourlyPicker(true)}
            onClose={() => setOpenHourlyPicker(false)}
            slots={{ textField: StyledTextField }}
            enableAccessibleFieldDOMStructure={false}
            slotProps={{
              textField: {
                onClick: () => setOpenHourlyPicker(true),
                // fullWidth: true,
                sx: {
                  width: 220, // agar tombol kalender tidak terlalu panjang
                },
              },
              popper: {
                sx: {
                  "& .MuiPaper-root": {
                    bgcolor:
                      theme.palette.mode === "dark" ? "#1e293b" : "#cad5e2",
                    color: theme.palette.mode === "dark" ? "#fff" : "#000",
                    borderRadius: "12px",
                    mt: 1,
                  },
                  "& .MuiPickersDay-root": {
                    color: theme.palette.mode === "dark" ? "#fff" : "#000",
                    "&.Mui-selected": {
                      bgcolor:
                        theme.palette.mode === "dark" ? "#2563eb" : "#77cdff",
                    },
                    "&:hover": {
                      bgcolor:
                        theme.palette.mode === "dark" ? "#334155" : "#00000020",
                    },
                  },
                  "& .MuiPickersCalendarHeader-label": {
                    color:
                      theme.palette.mode === "dark" ? "#77cdff" : "#2563eb",
                    fontWeight: 600,
                  },
                  "& .MuiPickersArrowSwitcher-button": {
                    color:
                      theme.palette.mode === "dark" ? "#77cdff" : "#2563eb",
                  },
                },
              },
            }}
          />
        </LocalizationProvider>
      );
    }

    if (value === "daily") {
      const y = dailyMonth.getFullYear();
      const m = dailyMonth.getMonth();
      return (
        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Month"
            value={m}
            onChange={(e) => {
              const nm = Number(e.target.value);
              const d = new Date(dailyMonth);
              d.setMonth(nm);
              d.setDate(1);
              setDailyMonth(d);
            }}
            sx={{
              width: 180,
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
              },
            }}
          >
            {months.map((mo) => (
              <MenuItem key={mo.v} value={mo.v}>
                {mo.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Year"
            value={y}
            onChange={(e) => {
              const ny = Number(e.target.value);
              const d = new Date(dailyMonth);
              d.setFullYear(ny);
              d.setDate(1);
              setDailyMonth(d);
            }}
            sx={{
              width: 180,
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
              },
            }}
          >
            {years.map((yr) => (
              <MenuItem key={yr} value={yr}>
                {yr}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      );
    }

    if (value === "weekly") {
      const y = weeklyMonth.getFullYear();
      const m = weeklyMonth.getMonth();
      const weeksInMonth = getWeeksInMonth(weeklyMonth);
      const weekOptions = Array.from({ length: weeksInMonth }, (_, i) => i + 1);

      return (
        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Week"
            value={weeklyWeek}
            onChange={(e) => {
              setWeeklyWeek(Number(e.target.value));
            }}
            sx={{
              width: 120,
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
              },
            }}
          >
            {weekOptions.map((week) => (
              <MenuItem key={week} value={week}>
                Week {week}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Month"
            value={m}
            onChange={(e) => {
              const nm = Number(e.target.value);
              const d = new Date(weeklyMonth);
              d.setMonth(nm);
              d.setDate(1);
              setWeeklyMonth(d);
              // Reset week to 1 jika perlu
              const newWeeksInMonth = getWeeksInMonth(d);
              if (weeklyWeek > newWeeksInMonth) {
                setWeeklyWeek(newWeeksInMonth);
              }
            }}
            sx={{
              width: 180,
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
              },
            }}
          >
            {months.map((mo) => (
              <MenuItem key={mo.v} value={mo.v}>
                {mo.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Year"
            value={y}
            onChange={(e) => {
              const ny = Number(e.target.value);
              const d = new Date(weeklyMonth);
              d.setFullYear(ny);
              d.setDate(1);
              setWeeklyMonth(d);
              // Reset week to 1 jika perlu
              const newWeeksInMonth = getWeeksInMonth(d);
              if (weeklyWeek > newWeeksInMonth) {
                setWeeklyWeek(newWeeksInMonth);
              }
            }}
            sx={{
              width: 180,
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
              },
            }}
          >
            {years.map((yr) => (
              <MenuItem key={yr} value={yr}>
                {yr}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      );
    }

    if (value === "shiftly") {
      return (
        <Stack direction="row" spacing={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Shift Date"
              value={shiftDate ? dayjs(shiftDate) : dayjs()}
              onChange={(newValue) => setShiftDate(newValue || dayjs())}
              slotProps={{
                textField: {
                  fullWidth: false,
                  sx: {
                    width: 220,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                    },
                  },
                },
                popper: {
                  sx: {
                    "& .MuiPaper-root": {
                      bgcolor:
                        theme.palette.mode === "dark" ? "#1e293b" : "#cad5e2",
                      color: theme.palette.mode === "dark" ? "#fff" : "#000",
                      borderRadius: "12px",
                      mt: 1,
                    },
                    "& .MuiPickersDay-root": {
                      color: theme.palette.mode === "dark" ? "#fff" : "#000",
                      "&.Mui-selected": {
                        bgcolor:
                          theme.palette.mode === "dark" ? "#2563eb" : "#77cdff",
                      },
                      "&:hover": {
                        bgcolor:
                          theme.palette.mode === "dark" ? "#334155" : "#00000020",
                      },
                    },
                    "& .MuiPickersCalendarHeader-label": {
                      color:
                        theme.palette.mode === "dark" ? "#77cdff" : "#2563eb",
                      fontWeight: 600,
                    },
                    "& .MuiPickersArrowSwitcher-button": {
                      color:
                        theme.palette.mode === "dark" ? "#77cdff" : "#2563eb",
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
          <TextField
            select
            label="Shift"
            value={shiftType}
            onChange={(e) => setShiftType(e.target.value)}
            sx={{
              width: 180,
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
              },
            }}
          >
            <MenuItem value="shift1">Shift 1 (7 AM - 8 PM)</MenuItem>
            <MenuItem value="shift2">Shift 2 (8 PM - 7 AM)</MenuItem>
          </TextField>
        </Stack>
      );
    }

    if (value === "monthly") {
      return (
        <TextField
          select
          label="Year"
          value={monthlyYear}
          onChange={(e) => setMonthlyYear(Number(e.target.value))}
          sx={{
            width: 180,
            "& .MuiOutlinedInput-root": {
              borderRadius: "16px",
            },
          }}
        >
          {years.map((yr) => (
            <MenuItem key={yr} value={yr}>
              {yr}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    if (value === "yearly") {
      // Tidak ada input. (opsional: tampilkan info tahun berjalan)
      return null;
    }

    return null;
  };

  // Download handler
  const onDownload = async (device_id) => {
    try {
      const range = computeSelectedRange();
      const periodParams = {};
      
      // Add period-specific params
      if (value === "weekly") {
        periodParams.week = weeklyWeek;
        periodParams.month = weeklyMonth.getMonth() + 1;
        periodParams.year = weeklyMonth.getFullYear();
      }
      
      if (value === "shiftly") {
        periodParams.shiftType = shiftType;
        const dateObj = shiftDate?.toDate ? shiftDate.toDate() : new Date(shiftDate);
        periodParams.shiftDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
      }
      
      await downloadReportPdf({
        utilityId: utility_id,
        period: value,
        rows,
        range,
        periodParams,
      });
    } catch (e) {
      console.error("Download report gagal:", e);
    }
  };

  return (
    <Box>
      {/* Filter Area/Device */}
      <Box
        sx={(theme) => ({
          display: "flex",
          mb: "16px",
          width: "100%",
          [theme.breakpoints.up("xs")]: {
            gap: "10px",
            flexDirection: "column-reverse",
          },
          [theme.breakpoints.up("sm")]: { gap: 2, flexDirection: "row" },
        })}
      >
        <SelectOption
          selectMenus={areaSelect}
          setValue={(val) => {
            const v = String(val ?? "All");
            setArea(v);
            updateQueryParam("area_id", v);
          }}
          title={"Area"}
          value={area}
          width={"30%"}
        />
        <SelectOption
          selectMenus={utilitySelect}
          setValue={(val) => {
            const v = String(val ?? "All");
            setUtility(v);
            updateQueryParam("utility_id", v);
          }}
          title={"Utility Name"}
          value={utility}
          width={"30%"}
        />
        <Box
          sx={(theme) => ({
            display: "flex",
            mb: "16px",
            width: "100%",
            [theme.breakpoints.up("xs")]: {
              flexDirection: "column",
            },
            [theme.breakpoints.up("sm")]: {
              gap: "8px",
              alignItems: "start",
              flexDirection: "row",
            },
          })}
        >
          <ToggleButtonGroup
            value={value}
            exclusive
            onChange={handleChange}
            sx={{
              backgroundColor:
                theme.palette.mode === "dark" ? "#FFFFFF07" : "#fff",
              borderRadius: "12px",
              p: "8px",
              gap: "5px",
              mb: "10px",
            }}
          >
            {["yearly", "monthly", "weekly", "shiftly", "daily", "hourly"].map((item) => (
              <ToggleButton
                key={item}
                value={item}
                sx={{
                  textTransform: "capitalize",
                  px: "12px",
                  py: "4px",
                  fontSize: "14px",
                  borderRadius: "8px !important",
                  "&.Mui-selected": {
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#2563eb" : "#08c2ff",
                    color: "#fff",
                  },
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#1e3a8a" : "#8CCDEB",
                  },
                }}
              >
                {item}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Box
            ssx={(theme) => ({
              [theme.breakpoints.up("xs")]: {
                mt: "0px",
              },
              [theme.breakpoints.up("sm")]: {
                mt: "0px",
              },
            })}
          >
            <TimePickerInline />
          </Box>
        </Box>
      </Box>

      <TableComponents
        columns={[
          { title: "DEVICE NAME", field: "name" },
          { title: "SERIAL NUMBER", field: "serial_number" },
          { title: "AREA", field: "area.name" },
        ]}
        page={page}
        setPage={(val) => updateQueryParam("page", String(val))}
        rows={rows}
        hasDownloadPdf={true}
        onDownload={onDownload}
        totalPages={totalPages}
        totalRows={total}
      />
    </Box>
  );
};

export default ReportTable;
