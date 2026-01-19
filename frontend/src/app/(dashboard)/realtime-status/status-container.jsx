"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Grid,
  Box,
  CircularProgress,
  Typography,
  Divider,
  Button,
  Fade,
  Modal,
  Stack,
  Autocomplete,
  Snackbar,
  Alert,
  Tooltip,
  TextField as MuiTextField,
  MenuItem,
  Badge,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useTheme, styled } from "@mui/material/styles";
import { useRouter, useSearchParams } from "next/navigation";
import BuildIcon from "@mui/icons-material/Build";
import SelectOption from "@/components/common/select-option";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { getSocket } from "@/lib/socket";
import { getCached } from "@/lib/apiCache";
import Image from "next/image";

import iconMachine from "./icon1.png";
import iconMachineFault1 from "./icon2.png";
import iconMachineFault2 from "./icon3.png";
import iconMachineLight from "./icon4.png";

// Styled TextField for consistent styling
const StyledTextField = styled(MuiTextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 16,
    color: "#fff",
    "& fieldset": {
      borderColor: "#fff",
    },
    "&:hover fieldset": {
      borderColor: "#eaeaea",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#38bdf8",
      boxShadow: "0 0 14px rgba(56,189,248,0.5)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#fff",
  },
}));

// --- KONFIGURASI ---
const POLL_MS = 30000;
const AREAS_LIMIT = 15;
const DEVICES_LIMIT = 10;
const DATA_LIMIT_INITIAL = 200;
const DATA_LIMIT_REFRESH = 10;
const USE_DUMMY = false;

// --- DUMMY DATA (kalau perlu) ---
const DUMMY_AREAS = [
  { id: 1, name: "BE AREA" },
  { id: 2, name: "OC AREA" },
];
const DUMMY_DEVICES = [
  { id: 101, name: "Device A1", areaName: "BE AREA", statusName: "Normal" },
];

/* ================= ICON MANUAL (SVG) ================= */

const IconThermostat = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-2V5c0-.55.45-1 1-1s1 .45 1 1v1h-1v1h1v1h-1v1h1v1h-2z" />
  </svg>
);

const IconBolt = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M7 2v11h3v9l7-12h-4l4-8z" />
  </svg>
);

const IconWater = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
  </svg>
);

const IconVibration = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M22 10v4c0 1.1-.9 2-2 2h-1.5l-4-4 4-4H20c1.1 0 2 .9 2 2zM3 11l4 4-4 4V7l4 4zm8-4h2v10h-2z" />
    <path
      d="M16.5 3h-9C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM12 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-11H9V5h6v2z"
      opacity="0.3"
    />
  </svg>
);

const IconCircle = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const FiChevronDown = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const FiChevronUp = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

/**
 * IconMachine:
 * - Normal: pakai icon1.png (dark mode) atau icon4.png (light mode)
 * - Alert (fault/offline): berkedip tiap 1 detik bergantian antara icon2.png dan icon3.png
 */
const IconMachine = ({ size = 80, isFault = false, isDark = true, ...props }) => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!isFault) {
      setBlink(false);
      return;
    }

    const id = setInterval(() => {
      setBlink((prev) => !prev);
    }, 1000); // 1 detik

    return () => clearInterval(id);
  }, [isFault]);

  const normalIcon = isDark ? iconMachine : iconMachineLight;
  const src = isFault ? (blink ? iconMachineFault1 : iconMachineFault2) : normalIcon;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: "relative",
        display: "block",
        flexShrink: 0,
      }}
    >
      <Image
        src={src}
        alt="Machine Icon"
        fill
        style={{ objectFit: "contain" }}
        priority
        {...props}
      />
    </Box>
  );
};

function groupDevicesIntoMotors(devices, utilities = []) {
  if (!Array.isArray(devices) || devices.length === 0) return [];

  // Jika ada utilities dari API, gunakan itu
  if (utilities && utilities.length > 0) {
    return utilities.map((utility) => {
      const metrics = [];
      const statuses = [];
      let deviceId = null;

      // Kumpulkan metrics dari semua device yang di-map ke utility ini
      utility.deviceMappings?.forEach((mapping) => {
        const device = devices.find((d) => {
          const dId = d?.device_id ?? d?.id;
          return dId === mapping.device_id;
        });

        if (!device) return;

        const deviceStatus = device.status || device.Device?.status?.name || "";

        if (Array.isArray(device.metrics)) {
          device.metrics.forEach((m) => {
            metrics.push({
              ...m,
              source_status: deviceStatus,
              source_device_id: mapping.device_id,
            });
          });
        }

        if (deviceStatus) statuses.push(deviceStatus);
        if (!deviceId) deviceId = mapping.device_id;
      });

      // Resolve final status
      // Priority: Faulted > Offline (all) > Offline (partial = fault) > Normal
      const lower = statuses.map((s) => (s || "").toLowerCase());
      let finalStatus = "normal";
      
      const hasFault = lower.includes("fault");
      const allOffline = lower.length > 0 && lower.every((s) => s === "offline");
      const hasOffline = lower.includes("offline");
      
      if (hasFault) {
        finalStatus = "fault";
      } else if (allOffline) {
        finalStatus = "offline";
      } else if (hasOffline) {
        // Sebagian offline = fault
        finalStatus = "fault";
      } else {
        finalStatus = "normal";
      }

      return {
        id: `utility-${utility.id}`,
        utility_id: utility.id,
        device_id: deviceId,
        area_id: utility.area_id,
        Device: {
          name: utility.name,
        },
        status: { name: finalStatus },
        metrics,
        running_hours: utility.running_hours || 0,
        running_hours_last_updated: utility.running_hours_last_updated,
        is_running: utility.is_running,
      };
    });
  }

  // FALLBACK: Logic lama jika tidak ada utility data
  const vibrationList = [];
  const tempList = [];
  const currentList = [];
  const others = [];

  const getId = (item) => item?.device_id ?? item?.id ?? null;

  devices.forEach((d) => {
    const name = (d.device_name || d.Device?.name || "").toLowerCase();
    if (
      name.includes("vibration") ||
      name.includes("accel") ||
      name === "y" ||
      name === "x"
    ) {
      vibrationList.push(d);
    } else if (name.includes("temp")) {
      tempList.push(d);
    } else if (name.includes("current") || name.includes("ampere") || name.includes("power")) {
      currentList.push(d);
    } else {
      others.push(d);
    }
  });

  const sortById = (a, b) => (getId(a) || 0) - (getId(b) || 0);
  vibrationList.sort(sortById);
  tempList.sort(sortById);
  currentList.sort(sortById);
  others.sort(sortById);

  const areaName =
    devices[0]?.area_name || devices[0]?.Device?.area?.name || "Area";
  const isSandTankArea = areaName.toLowerCase().includes("sand tank");
  const isPressureArea = areaName.toLowerCase().includes("pressure area");
  const isOcArea = areaName.toLowerCase().includes("oc area");
  const isMmArea = areaName.toLowerCase().includes("mm area");

  const groups = [];

  const resolveStatus = (statuses) => {
    const lower = statuses.map((s) => (s || "").toLowerCase());
    if (lower.includes("offline")) return "offline";
    if (lower.includes("fault")) return "fault";
    return "normal";
  };

  /* ====== PRESSURE AREA ====== */
  if (isPressureArea) {
    devices.forEach((d, idx) => {
      const deviceStatus = d.status || d.Device?.status?.name || "";
      const finalStatus = resolveStatus(deviceStatus ? [deviceStatus] : []);

      const metricsRaw = Array.isArray(d.metrics) ? d.metrics : [];
      const metrics = metricsRaw.map((m) => ({
        ...m,
        source_status: deviceStatus,
        source_device_id: getId(d),
      }));

      const deviceId = getId(d);

      groups.push({
        id: `pressure-device-${deviceId ?? idx}`,
        device_id: deviceId,
        area_id: d.area_id,
        Device: {
          name: d.device_name || d.Device?.name || `Device ${idx + 1}`,
        },
        status: { name: finalStatus },
        metrics,
      });
    });

    return groups;
  }

  /* ====== SAND TANK AREA ====== */
  if (isSandTankArea) {
    const motorCount = Math.max(currentList.length, tempList.length);

    const addFrom = (item, metricFilters, metrics, statuses) => {
      if (!item) return;
      const deviceStatus = item.status || item.Device?.status?.name || "";
      if (Array.isArray(item.metrics)) {
        item.metrics.forEach((m) => {
          const mn = (m.metric_name || "").toLowerCase();
          if (metricFilters.some((f) => mn.includes(f))) {
            metrics.push({
              ...m,
              source_status: deviceStatus,
              source_device_id: getId(item),
            });
          }
        });
      }
      if (deviceStatus) statuses.push(deviceStatus);
    };

    for (let i = 0; i < motorCount; i++) {
      const metrics = [];
      const statuses = [];

      addFrom(currentList[i], ["current", "ampere", "power"], metrics, statuses);
      addFrom(tempList[i], ["temp", "temperature"], metrics, statuses);

      if (metrics.length === 0 && statuses.length === 0) continue;

      const finalStatus = resolveStatus(statuses);

      let deviceId =
        getId(currentList[i]) ??
        getId(tempList[i]) ??
        getId(vibrationList[i]) ??
        getId(others[i]) ??
        null;

      groups.push({
        id: `motor-sandtank-${i}`,
        device_id: deviceId,
        Device: {
          name: `Motor Sandtank ${i + 1}`,
        },
        status: { name: finalStatus },
        metrics,
      });
    }

    // Bearing 1, 2, ...
    vibrationList.forEach((item, idx) => {
      const deviceStatus = item.status || item.Device?.status?.name || "";

      const metricsRaw = Array.isArray(item.metrics)
        ? item.metrics.filter((m) => {
            const mn = (m.metric_name || "").toLowerCase();
            return (
              mn.includes("vibration") ||
              mn === "x" ||
              mn === "y" ||
              mn === "z"
            );
          })
        : [];

      const metrics = metricsRaw.map((m) => ({
        ...m,
        source_status: deviceStatus,
        source_device_id: getId(item),
      }));

      const statuses = deviceStatus ? [deviceStatus] : [];
      if (metrics.length === 0 && statuses.length === 0) return;

      const finalStatus = resolveStatus(statuses);
      const deviceId = getId(item);

      groups.push({
        id: `bearing-sandtank-${idx}`,
        device_id: deviceId,
        Device: {
          name: `Tap Bearing ${idx + 1}`,
        },
        status: { name: finalStatus },
        metrics,
      });
    });

    return groups;
  }

  /* ====== OC AREA: 1.1, 1.2, 2, 3, ... (current[0] dipakai dua kali) ====== */
  if (isOcArea && currentList.length > 0) {
    // Sumber index untuk setiap motor:
    // gIndex 0 -> srcIndex 0  (Motor OC 1.1) -> vibration[0]
    // gIndex 1 -> srcIndex 0  (Motor OC 1.2) -> vibration[0]
    // gIndex 2 -> srcIndex 1  (Motor OC 2)   -> vibration[1]
    // gIndex 3 -> srcIndex 2  (Motor OC 3)   -> vibration[2] dst.
    const sources = [];
    sources.push(0); // 1.1
    sources.push(0); // 1.2
    for (let ci = 1; ci < currentList.length; ci++) {
      sources.push(ci); // 2, 3, 4, ...
    }

    const makeDisplayName = (gIndex) => {
      if (gIndex === 0) return "Motor OC 1.1";
      if (gIndex === 1) return "Motor OC 1.2";
      return `Motor OC ${gIndex}`; // gIndex = 2 -> "2", dst
    };

    const collectFromIndex = (srcIndex, gIndex) => {
      const metrics = [];
      const statuses = [];
      let deviceId = null;

      const extract = (list, forceIndex = null) => {
        const idx = forceIndex !== null ? forceIndex : srcIndex;
        const item = list[idx];
        if (!item) return;

        const deviceStatus = item.status || item.Device?.status?.name || "";

        if (Array.isArray(item.metrics)) {
          item.metrics.forEach((m) => {
            metrics.push({
              ...m,
              source_status: deviceStatus,
              source_device_id: getId(item),
            });
          });
        }

        if (deviceStatus) statuses.push(deviceStatus);
        if (!deviceId) deviceId = getId(item);
      };

      // Vibration mapping untuk OC Area:
      // 1.1 ambil vibration[0]
      // 1.2 ambil vibration[1]
      // 2 ambil vibration[2]
      // 3 ambil vibration[3], dst
      let vibrationIndex = gIndex;

      extract(vibrationList, vibrationIndex);
      extract(tempList, srcIndex);
      extract(currentList, srcIndex);
      extract(others, srcIndex);

      const finalStatus = resolveStatus(statuses);
      return { metrics, statuses, deviceId, finalStatus };
    };

    sources.forEach((srcIdx, gIdx) => {
      const { metrics, statuses, deviceId, finalStatus } = collectFromIndex(
        srcIdx,
        gIdx
      );

      if (metrics.length === 0 && statuses.length === 0) return;

      groups.push({
        id: `oc-motor-${gIdx}`,
        device_id: deviceId,
        Device: {
          name: makeDisplayName(gIdx),
        },
        status: { name: finalStatus },
        metrics,
      });
    });

    return groups;
  }

  /* ====== DEFAULT (BUKAN SAND TANK / PRESSURE / OC) ====== */
  const maxCount = Math.max(
    vibrationList.length,
    tempList.length,
    currentList.length,
    others.length
  );

  for (let i = 0; i < maxCount; i++) {
    const metrics = [];
    const statuses = [];
    let deviceId = null;

    const extract = (list) => {
      const item = list[i];
      if (!item) return;

      const deviceStatus = item.status || item.Device?.status?.name || "";

      if (Array.isArray(item.metrics)) {
        item.metrics.forEach((m) => {
          metrics.push({
            ...m,
            source_status: deviceStatus,
            source_device_id: getId(item),
          });
        });
      }

      if (deviceStatus) statuses.push(deviceStatus);
      if (!deviceId) deviceId = getId(item);
    };

    extract(vibrationList);
    extract(tempList);
    extract(currentList);
    extract(others);

    if (metrics.length === 0 && statuses.length === 0) continue;

    const finalStatus = resolveStatus(statuses);

    let displayName;
    if (isMmArea) {
      // MM Area: A, 1, 2, 3, ...
      if (i === 0) {
        displayName = "Motor MA";
      } else {
        const label = String(i); // i=1 => "1", dst
        displayName = `Motor MM ${label}`;
      }
    } else {
      // hapus kata "area" dari nama area (case-insensitive)
      const cleanedAreaName = (areaName || "")
        .replace(/area/gi, "")
        .trim();
      const labelName = cleanedAreaName || areaName || "Area";
      displayName = `Motor ${labelName} ${i + 1}`;
    }

    groups.push({
      id: `virtual-motor-${i}`,
      device_id: deviceId,
      Device: {
        name: displayName,
      },
      status: { name: finalStatus },
      metrics,
    });
  }

  return groups;
}


/* ================= Device Card Component ================= */

const DeviceCard = ({ data, areaId }) => {
  const router = useRouter();
  const theme = useTheme();
  const { sendRequest } = useFetchApi();

  // data.status bisa { name: "fault" } atau "fault"
  const rawStatus = data?.status;
  const statusRaw =
    typeof rawStatus === "string"
      ? rawStatus.toLowerCase()
      : (rawStatus?.name || "").toLowerCase();

  const isFault = statusRaw === "fault";
  const isOffline = statusRaw === "offline";
  const isAlert = isFault || isOffline; // dipakai untuk frame & icon

  const [blink, setBlink] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [workOrderDialogOpen, setWorkOrderDialogOpen] = useState(false);
  const [workOrderForm, setWorkOrderForm] = useState({
    title: "",
    description: "",
    priority: "high",
    notes: "",
    assigned_to: null,
    area_id: null,
    utility_id: null,
    area_name: "",
    utility_name: "",
    deadline: null,
  });
  const [creatingWO, setCreatingWO] = useState(false);
  const [woSnackbar, setWoSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [usersOption, setUsersOption] = useState([]);

  // Fetch users for assigned_to dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await sendRequest({ url: "/users", params: { limit: 100 } });
        const formattedUsers = response?.data?.map((user) => ({
          label: user.name,
          value: user.id,
        })) || [];
        setUsersOption(formattedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!isAlert) {
      setBlink(false);
      return;
    }
    const id = setInterval(() => {
      setBlink((prev) => !prev);
    }, 1000);
    return () => clearInterval(id);
  }, [isAlert]);

  const borderColor = isAlert ? (blink ? "#ffffff" : "#ff5c5c") : "#1e7e4f";
  const statusText = isOffline ? "OFFLINE" : isFault ? "FAULT" : "NORMAL";

  const glowColor = isAlert
    ? blink
      ? "rgba(255,255,255,0.25)"
      : "rgba(255, 92, 92, 0.15)"
    : "rgba(30, 126, 79, 0.15)";

  const isDark = theme.palette.mode === "dark";
  const cardBg = isDark ? "#0b1221" : "#ffffff";
  const cardText = isDark ? "#fff" : "#000";
  const subText = isDark ? "#8ca3a3" : "#4b5563";

  const getMetricIcon = (name) => {
    const n = (name || "").toLowerCase();
    if (n.includes("temp")) return <IconThermostat size={18} color={subText} />;
    if (n.includes("current") || n.includes("ampere"))
      return <IconBolt size={18} color={subText} />;
    if (n.includes("vibration") || n === "y" || n === "x" || n === "z")
      return <IconVibration size={18} color={subText} />;
    if (n.includes("humidity")) return <IconWater size={18} color={subText} />;
    return <IconCircle size={10} color={subText} />;
  };

  // 👉 Sekarang pakai metric asal untuk menentukan device_id
  const handleGotoAnalysis = (metric) => {
    const targetDeviceId = metric?.source_device_id ?? data?.device_id;
    if (!areaId || !targetDeviceId) return;

    const areaParam = encodeURIComponent(String(areaId));
    const deviceParam = encodeURIComponent(String(targetDeviceId));

    router.push(
      `/analysis&diagnose?area_id=${areaParam}&device_id=${deviceParam}&time_span=1d`
    );
  };

  // Metric dianggap "fault/offline" dari source_status device asal metric
  const isMetricFault = (metric) => {
    const s = (metric?.source_status || "").toLowerCase();
    return s === "fault" || s === "offline";
  };

  const baseMetricColor = subText;

  // Handle create work order
  const handleOpenWorkOrderDialog = () => {
    const deviceName = data.Device?.name || "Unknown Device";
    const statusDesc = isOffline ? "Offline" : isFault ? "Fault" : "Issue";
    
    // Extract utility_id from data if available (for utility-based cards)
    const utilityId = data.id?.toString().startsWith('utility-') 
      ? parseInt(data.id.replace('utility-', ''))
      : null;
    
    setWorkOrderForm({
      title: `${statusDesc} - ${deviceName}`,
      description: `Corrective action required for ${deviceName}\nStatus: ${statusText}\nArea: ${areaId}`,
      priority: isFault || isOffline ? "high" : "medium",
      notes: "",
      assigned_to: null,
      area_id: parseInt(areaId),
      utility_id: utilityId,
      area_name: "", // Will be populated from API
      utility_name: deviceName,
      deadline: null,
    });
    setWorkOrderDialogOpen(true);
  };

  const handleCreateWorkOrder = async () => {
    if (!workOrderForm.title || !workOrderForm.description) {
      setWoSnackbar({ open: true, message: "Title and description are required", severity: "error" });
      return;
    }

    try {
      setCreatingWO(true);
      const response = await sendRequest({
        url: "/work-orders",
        method: "POST",
        data: {
          title: workOrderForm.title,
          description: workOrderForm.description,
          type: "corrective",
          priority: workOrderForm.priority,
          area_id: workOrderForm.area_id,
          utility_id: workOrderForm.utility_id,
          device_id: data.device_id ? parseInt(data.device_id) : null,
          notes: workOrderForm.notes,
          assigned_to: workOrderForm.assigned_to,
          deadline: workOrderForm.deadline,
        },
      });

      if (response?.success) {
        setWoSnackbar({ open: true, message: "Work order created successfully", severity: "success" });
        setWorkOrderDialogOpen(false);
      } else {
        setWoSnackbar({ open: true, message: "Failed to create work order", severity: "error" });
      }
    } catch (error) {
      console.error("Failed to create work order:", error);
      setWoSnackbar({ open: true, message: "Failed to create work order", severity: "error" });
    } finally {
      setCreatingWO(false);
    }
  };

  return (
    <Box
      sx={{
        border: `3px solid ${borderColor}`,
        borderRadius: 3,
        bgcolor: cardBg,
        boxShadow: `0 0 15px ${glowColor}`,
        overflow: "hidden",
        height: "100%",
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition:
          "border-color 0.2s linear, box-shadow 0.2s linear, transform 0.15s ease",
      }}
    >
      <Box sx={{ position: "absolute", top: 12, right: 12 }}>
        <Box sx={{ filter: `drop-shadow(0 0 4px ${borderColor})` }}>
          <IconCircle size={12} color={borderColor} />
        </Box>
      </Box>

      {/* Header with Title and Icon */}
      <Box
        sx={{
          bgcolor: isDark ? "rgba(30, 126, 79, 0.1)" : "rgba(30, 126, 79, 0.05)",
          borderBottom: `2px solid ${borderColor}`,
          py: 2,
          px: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Typography
          sx={{
            color: cardText,
            fontSize: 18,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            textAlign: "center",
          }}
        >
          {data.Device.name}
        </Typography>
        
        <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
          <IconMachine size={60} isFault={isAlert} isDark={isDark} />
        </Box>
      </Box>

      {/* Body: Metrics */}
      <Box sx={{ flex: 1, px: 3, py: 3 }}>
        {data.metrics &&
          (expanded ? data.metrics : data.metrics.slice(0, 6)).map((m, idx) => {
            const metricFault = isMetricFault(m);
            const metricColor =
              metricFault && blink ? "#ff5c5c" : baseMetricColor;

            return (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {getMetricIcon(m.metric_name)}
                  <Typography
                    onClick={() => handleGotoAnalysis(m)}
                    sx={{
                      color: metricColor,
                      fontSize: 14,
                      cursor: "pointer",
                      textUnderlineOffset: "3px",
                      transition: "color 0.2s linear",
                      "&:hover": {
                        color: metricFault
                          ? "#ff8a80"
                          : isDark
                            ? "#c5cae9"
                            : "#1d4ed8",
                      },
                    }}
                  >
                    {m.metric_name}
                  </Typography>
                </Box>
                <Typography
                  sx={{ color: cardText, fontSize: 16, fontWeight: 600 }}
                >
                  {typeof m.value === "number" ? m.value.toFixed(2) : m.value}
                  <span
                    style={{
                      fontSize: 12,
                      marginLeft: 4,
                      color: subText,
                    }}
                  >
                    {m.unit}
                  </span>
                </Typography>
              </Box>
            );
          })}

        {/* Show More/Less Button */}
        {data.metrics && data.metrics.length > 6 && (
          <Box sx={{ textAlign: "center", mt: 1 }}>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{
                textTransform: "none",
                color: isDark ? "#90caf9" : "#1976d2",
                fontSize: "0.8rem",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: isDark
                    ? "rgba(144, 202, 249, 0.08)"
                    : "rgba(25, 118, 210, 0.08)",
                },
              }}
              endIcon={
                expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />
              }
            >
              {expanded ? "Show Less" : `Show More (${data.metrics.length - 6} more)`}
            </Button>
          </Box>
        )}

        {(!data.metrics || data.metrics.length === 0) && (
          <Typography
            sx={{
              color: subText,
              fontSize: 14,
              textAlign: "center",
              fontStyle: "italic",
              py: 4,
            }}
          >
            No metrics available
          </Typography>
        )}
      </Box>

      {/* Footer */}
      <Box>
        {/* Running Hours Display */}
        {data.running_hours !== undefined && (
          <>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />
            <Box
              sx={{
                px: 3,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: isDark ? "rgba(56, 189, 248, 0.05)" : "rgba(56, 189, 248, 0.08)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill={isDark ? "#38bdf8" : "#0284c7"}>
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
                <Typography
                  sx={{
                    color: isDark ? "#38bdf8" : "#0284c7",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  RUNNING HOURS
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  sx={{
                    color: isDark ? "#fff" : "#000",
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {typeof data.running_hours === "number" 
                    ? data.running_hours.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                    : "0.0"
                  }
                </Typography>
                <Typography
                  sx={{
                    color: subText,
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  hrs
                </Typography>
                {data.is_running && (
                  <Tooltip title="Currently Running">
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#22c55e",
                        animation: "pulse 2s infinite",
                        "@keyframes pulse": {
                          "0%": { opacity: 1 },
                          "50%": { opacity: 0.4 },
                          "100%": { opacity: 1 },
                        },
                      }}
                    />
                  </Tooltip>
                )}
              </Box>
            </Box>
          </>
        )}
        
        <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{
                color: isDark ? "#5c6bc0" : "#1d4ed8",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              STATUS
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconCircle size={10} color={borderColor} />
            <Typography
              sx={{
                color: borderColor,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              {statusText}
            </Typography>
          </Box>
        </Box>
        
        {/* Work Order Button - only show if fault/offline */}
        {isAlert && (
          <>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />
            <Box sx={{ px: 3, py: 2 }}>
              <Tooltip title="Create corrective work order">
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<BuildIcon />}
                  onClick={handleOpenWorkOrderDialog}
                  sx={{
                    textTransform: "none",
                    borderColor: borderColor,
                    color: borderColor,
                    "&:hover": {
                      borderColor: borderColor,
                      bgcolor: isAlert
                        ? "rgba(255, 92, 92, 0.1)"
                        : "rgba(30, 126, 79, 0.1)",
                    },
                  }}
                >
                  Create Work Order
                </Button>
              </Tooltip>
            </Box>
          </>
        )}
      </Box>

      {/* Work Order Creation Modal */}
      <Modal
        open={workOrderDialogOpen}
        onClose={() => setWorkOrderDialogOpen(false)}
        closeAfterTransition
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Fade in={workOrderDialogOpen}>
          <Box
            sx={{
              bgcolor: theme.palette.mode === "dark" ? "#0f172a" : "#fff",
              p: 4,
              borderRadius: 4,
              maxWidth: "600px",
              width: "90%",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 700,
                color: theme.palette.mode === "dark" ? "#fff" : "#000",
              }}
            >
              Create Work Order
            </Typography>

            {/* Area and Utility Info (Read-only) */}
            {(workOrderForm.area_id || workOrderForm.utility_name) && (
              <Box sx={{ mb: 3, p: 2, bgcolor: "rgba(56, 189, 248, 0.1)", borderRadius: 2 }}>
                {workOrderForm.utility_name && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                      Utility
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#38bdf8", fontWeight: 600 }}>
                      {workOrderForm.utility_name}
                    </Typography>
                  </Box>
                )}
                {workOrderForm.area_id && (
                  <Box>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                      Area ID
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#fff" }}>
                      {workOrderForm.area_id}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            <Stack spacing={2.5}>
              <StyledTextField
                label="Title"
                fullWidth
                value={workOrderForm.title}
                onChange={(e) =>
                  setWorkOrderForm({ ...workOrderForm, title: e.target.value })
                }
              />
              <StyledTextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={workOrderForm.description}
                onChange={(e) =>
                  setWorkOrderForm({ ...workOrderForm, description: e.target.value })
                }
              />
              <Autocomplete
                options={[
                  { label: "Low", value: "low" },
                  { label: "Medium", value: "medium" },
                  { label: "High", value: "high" },
                  { label: "Critical", value: "critical" },
                ]}
                getOptionLabel={(option) => option.label}
                value={
                  [
                    { label: "Low", value: "low" },
                    { label: "Medium", value: "medium" },
                    { label: "High", value: "high" },
                    { label: "Critical", value: "critical" },
                  ].find((opt) => opt.value === workOrderForm.priority) || null
                }
                onChange={(_, newValue) =>
                  setWorkOrderForm({
                    ...workOrderForm,
                    priority: newValue ? newValue.value : "medium",
                  })
                }
                renderInput={(params) => (
                  <StyledTextField {...params} label="Priority" fullWidth />
                )}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                      color: theme.palette.mode === "dark" ? "#fff" : "#000",
                      borderRadius: "8px",
                    },
                  },
                }}
              />
              <Autocomplete
                options={usersOption}
                getOptionLabel={(option) => option.label}
                value={usersOption.find((opt) => opt.value === workOrderForm.assigned_to) || null}
                onChange={(_, newValue) =>
                  setWorkOrderForm({
                    ...workOrderForm,
                    assigned_to: newValue ? newValue.value : null,
                  })
                }
                renderInput={(params) => (
                  <StyledTextField {...params} label="Assign To" fullWidth />
                )}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: theme.palette.mode === "dark" ? "#1e293b" : "#fff",
                      color: theme.palette.mode === "dark" ? "#fff" : "#000",
                      borderRadius: "8px",
                    },
                  },
                }}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Deadline (Optional)"
                  value={workOrderForm.deadline ? dayjs(workOrderForm.deadline) : null}
                  onChange={(newValue) => {
                    setWorkOrderForm({
                      ...workOrderForm,
                      deadline: newValue ? newValue.toISOString() : null,
                    });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 4,
                          color: "#fff",
                          "& fieldset": {
                            borderColor: "#fff",
                          },
                          "&:hover fieldset": {
                            borderColor: "#eaeaea",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#38bdf8",
                            boxShadow: "0 0 14px rgba(56,189,248,0.5)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#fff",
                        },
                        "& .MuiSvgIcon-root": {
                          color: "#fff",
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
              <StyledTextField
                label="Additional Notes"
                fullWidth
                multiline
                rows={2}
                value={workOrderForm.notes}
                onChange={(e) =>
                  setWorkOrderForm({ ...workOrderForm, notes: e.target.value })
                }
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                onClick={() => setWorkOrderDialogOpen(false)}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 600,
                  color: theme.palette.mode === "dark" ? "#fff" : "#000",
                  border: "2px solid",
                  borderColor: theme.palette.mode === "dark" ? "#475569" : "#e5e7eb",
                  "&:hover": {
                    bgcolor: theme.palette.mode === "dark" ? "#1e293b" : "#f3f4f6",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateWorkOrder}
                variant="contained"
                disabled={creatingWO}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 600,
                  bgcolor: "#2563eb",
                  "&:hover": { bgcolor: "#1d4ed8" },
                }}
              >
                {creatingWO ? <CircularProgress size={20} /> : "Create"}
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Modal>

      {/* Snackbar for WO actions */}
      <Snackbar
        open={woSnackbar.open}
        autoHideDuration={4000}
        onClose={() => setWoSnackbar({ ...woSnackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={woSnackbar.severity} variant="filled">
          {woSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

/* ================= Area Summary Card ================= */

const AreaCard = ({
  areaName,
  total,
  normalCount,
  faultCount,
  offlineCount,
  status,
  onClick,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const statusLower = (status || "").toLowerCase();
  const isFault = statusLower === "fault";
  const isOffline = statusLower === "offline";
  const isAlert = isFault || isOffline;

  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!isAlert) {
      setBlink(false);
      return;
    }
    const id = setInterval(() => {
      setBlink((prev) => !prev);
    }, 1000);
    return () => clearInterval(id);
  }, [isAlert]);

  const borderColor = isAlert ? (blink ? "#ffffff" : "#ff5c5c") : "#1e7e4f";

  const labelText = isOffline
    ? "Offline"
    : isFault
      ? "Fault Detected"
      : "All Normal";

  const statsText = isOffline
    ? `${offlineCount}/${total} Utility Offline`
    : isFault
      ? `${faultCount} Fault / ${total} Utility`
      : `${normalCount}/${total} Utility Normal`;

  return (
    <Box
      onClick={onClick}
      sx={{
        border: `3px solid ${borderColor}`,
        borderRadius: 4,
        p: 4,
        height: 280,
        display: "flex",
        alignItems: "center",
        background: isDark
          ? "linear-gradient(180deg, rgba(6,18,33,0.95), rgba(8,20,40,0.95))"
          : "#ffffff",
        boxShadow: isDark
          ? "0 10px 30px rgba(0,0,0,0.5)"
          : "0 10px 30px rgba(0,0,0,0.12)",
        cursor: "pointer",
        transition:
          "transform 0.2s, border-color 0.2s linear, box-shadow 0.2s linear",
        "&:hover": { transform: "translateY(-5px)" },
      }}
    >
      <Box sx={{ mr: 3 }}>
        <IconMachine size={80} isFault={isAlert} isDark={isDark} />
      </Box>
      <Box>
        <Typography
          sx={{
            color: isDark ? "#fff" : "#000",
            fontSize: 20,
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          {areaName}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <IconCircle size={14} color={borderColor} />
          <Typography
            sx={{
              color: isDark ? "#cfe8d8" : "#111827",
              fontWeight: 700,
            }}
          >
            {labelText}
          </Typography>
        </Box>
        <Typography
          sx={{
            color: isDark ? "#9fb0b0" : "#111827",
            fontSize: 18,
            mt: 1,
          }}
        >
          {statsText}
        </Typography>
      </Box>
    </Box>
  );
};

/* ================= Main Component ================= */

const StatusContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendRequest } = useFetchApi();

  const [areaSelect, setAreaSelect] = useState([]);
  const [deviceSelect, setDeviceSelect] = useState([]);
  const [area, setArea] = useState(searchParams.get("area_id") || "All");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realtimeAreas, setRealtimeAreas] = useState([]);
  const [utilities, setUtilities] = useState([]);

  // Reset alarm feature removed: UI and handlers intentionally disabled

  // 1. STATE UNTUK USER ID
  const [userId, setUserId] = useState(null);

  const sendRequestRef = useRef(sendRequest);
  const areaRef = useRef(area);
  useEffect(() => {
    areaRef.current = area;
  }, [area]);

  const refetchRef = useRef(null);

  /* ===== Helpers ===== */
  const updateQuery = (patch) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(patch).forEach(([k, v]) => {
      if (v && v !== "All") params.set(k, v);
      else params.delete(k);
    });
    const qs = params.toString();
    const href = qs ? `?${qs}` : window.location.pathname;
    router.replace(href, { scroll: false });
  };

  /* ===== 2. INIT USER ID FROM LOCALSTORAGE ===== */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("admin_id");
      if (storedId) {
        setUserId(Number(storedId));
        console.log("[Init] userId from localStorage:", storedId);
      } else {
        console.warn("No admin_id found in localStorage, using fallback userId: 1");
        setUserId(1); // Fallback untuk testing
      }
    }
  }, []);

  const loadDevicesByArea = async (areaVal) => {
    if (USE_DUMMY) return { ids: [], dict: {} };
    const isAll = !areaVal || areaVal === "All";

    // Fetch utilities untuk area ini
    let areaUtilities = [];
    if (!isAll) {
      try {
        const utilRes = await sendRequestRef.current({
          url: `/utilities/area/${areaVal}/with-devices`,
        });
        if (utilRes?.data) {
          areaUtilities = utilRes.data;
          setUtilities(areaUtilities);
        }
      } catch (err) {
        console.error("Error fetching utilities:", err);
      }
    }

    const devRes = await getCached(
      `devices-list:${areaVal}`,
      async () =>
        await sendRequestRef.current({
          url: "/devices",
          params: isAll ? { limit: 100 } : { area_id: areaVal, limit: 100 },
        })
    );

    const list = Array.isArray(devRes?.data) ? devRes.data : [];
    const opts = list.map((d) => ({ title: d.name, value: String(d.id) }));
    setDeviceSelect(opts);

    if (isAll === false) {
      const snapshotFormat = list.map((d) => ({
        device_id: d.id,
        device_name: d.name,
        area_id: d.area_id,
        area_name: d.area?.name,
        status: d.status?.name,
        metrics: [],
      }));
      const grouped = groupDevicesIntoMotors(snapshotFormat, areaUtilities);
      setRows(grouped);
    }

    return { ids: list.map((d) => String(d.id)), dict: {} };
  };

  /* ===== HANDLERS & SOCKETS ===== */
  const handleAreaChange = async (val) => {
    setArea(val);
    areaRef.current = val;
    setRows([]);
    setLoading(true);
    updateQuery({ area_id: val });

    if (val !== "All" && !USE_DUMMY && userId) {
      const socket = getSocket();
      socket.emit("subscribe-area-devices", {
        userId: userId,
        areaId: parseInt(val),
      });
      await loadDevicesByArea(val);
    } else {
      await loadDevicesByArea(val);
      setLoading(false);
    }
  };

  /* Reset alarm feature removed (handlers omitted) */

  // SOCKET LISTENER: AREA DEVICE SNAPSHOT
  useEffect(() => {
    if (USE_DUMMY) return;
    const socket = getSocket();

    const handleSnapshot = (payload) => {
      if (!Array.isArray(payload)) return;
      const groupedMotors = groupDevicesIntoMotors(payload, utilities);
      setRows(groupedMotors);
      setLoading(false);
    };

    socket.on("area-devices", handleSnapshot);
    return () => {
      socket.off("area-devices", handleSnapshot);
    };
  }, [utilities]);

  // POLLING: request area-devices every 1s while a specific area is selected
  const pollIntervalRef = useRef(null);
  // POLLING: request area-status every 1s while userId present
  const summaryPollRef = useRef(null);
  useEffect(() => {
    if (USE_DUMMY) return;
    const socket = getSocket();

    // clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (area && area !== "All" && userId) {
      // ensure socket connected
      if (!socket.connected) socket.connect();

      // emit immediately once
      socket.emit("subscribe-area-devices", {
        userId: userId,
        areaId: parseInt(area),
      });

      // then poll every 1 second
      pollIntervalRef.current = setInterval(() => {
        try {
          socket.emit("subscribe-area-devices", {
            userId: userId,
            areaId: parseInt(area),
          });
        } catch (e) {
          // ignore emit errors
        }
      }, 1000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [area, userId]);

  // SOCKET LISTENER: AREA SUMMARY
  useEffect(() => {
    if (USE_DUMMY || !userId) return;
    const socket = getSocket();
    const handleSummary = (payload) => {
      console.log("[Socket] Received area-status:", payload);
      setRealtimeAreas(Array.isArray(payload) ? payload : []);
    }

    // ensure socket connected
    if (!socket.connected) socket.connect();

    // clear any existing summary poll
    if (summaryPollRef.current) {
      clearInterval(summaryPollRef.current);
      summaryPollRef.current = null;
    }

    // emit immediately and set listener
    console.log("[Socket] Subscribing to area-status with userId:", userId);
    socket.emit("subscribe-area-status", userId);
    socket.on("area-status", handleSummary);

    // poll every 1 second to request latest summary
    summaryPollRef.current = setInterval(() => {
      try {
        socket.emit("subscribe-area-status", userId);
      } catch (e) {
        // ignore emit errors
      }
    }, 1000);

    return () => {
      if (summaryPollRef.current) {
        clearInterval(summaryPollRef.current);
        summaryPollRef.current = null;
      }
      socket.emit("unsubscribe-area-status", userId);
      socket.off("area-status", handleSummary);
    };
  }, [userId]);

  // INIT DATA
  useEffect(() => {
    const init = async () => {
      try {
        const areaRes = await sendRequestRef.current({
          url: "/areas",
          params: { limit: AREAS_LIMIT },
        });
        const areas = Array.isArray(areaRes?.data) ? areaRes.data : [];
        setAreaSelect([
          { title: "All", value: "All" },
          ...areas.map((a) => ({ title: a.name, value: String(a.id) })),
        ]);
        if (areaRef.current && areaRef.current !== "All") {
          handleAreaChange(areaRef.current);
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    };
    init();
  }, []);

  /* ===== RENDER CONTENT ===== */
  const areaCards = useMemo(() => {
    if (!realtimeAreas || realtimeAreas.length === 0) return [];
    return realtimeAreas
      .map((a) => ({
        areaName: a.area_name,
        total: a.totalUtilities,
        normalCount: a.normalCount,
        faultCount: a.faultCount,
        offlineCount: a.offlineCount,
        status: a.status,
      }))
      .sort((a, b) => a.areaName.localeCompare(b.areaName));
  }, [realtimeAreas]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          sx={{
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    // --- VIEW 1: SPECIFIC AREA (MOTOR CARDS - GROUPED) ---
    if (area !== "All") {
      if (rows.length === 0) {
        return (
          <Box sx={{ mt: 5, textAlign: "center", color: "#888" }}>
            <Typography>Waiting for device data...</Typography>
            <CircularProgress size={20} sx={{ mt: 2 }} />
          </Box>
        );
      }
      return (
        <Box sx={{ width: "100%", flexGrow: 1 }}>
          <Grid container spacing={4} sx={{ mt: 1, mb: 1 }}>
            {rows.map((motor) => (
              <Grid item xs={12} sm={6} md={4} key={motor.id} sx={{ p: 2, minWidth: 280 }}>
                <DeviceCard data={motor} areaId={area} />
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }

    // --- VIEW 2: ALL AREAS (SUMMARY CARDS) ---
    if (areaCards.length === 0) {
      return (
        <Typography sx={{ textAlign: "center", mt: 5 }}>
          No Area Data
        </Typography>
      );
    }

    return (
      <Box sx={{ width: "100%", flexGrow: 1 }}>
        <Grid container spacing={4} sx={{ mt: 1, mb: 1 }}>
          {areaCards.map(
            ({ areaName, total, normalCount, faultCount, offlineCount, status }) => {
              const handleClick = () => {
                const target = areaSelect.find((opt) => opt.title === areaName);
                if (target) handleAreaChange(target.value);
              };
              return (
                <Grid item xs={12} sm={6} md={4} key={areaName} sx={{ p: 2, minWidth: 280 }}>
                  <AreaCard
                    areaName={areaName}
                    total={total}
                    normalCount={normalCount}
                    faultCount={faultCount}
                    offlineCount={offlineCount}
                    status={status}
                    onClick={handleClick}
                  />
                </Grid>
              );
            }
          )}
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <SelectOption
          value={area}
          title="Area"
          width="250px"
          selectMenus={areaSelect}
          setValue={handleAreaChange}
        />
        {/* Reset Alarm button removed intentionally */}
        {area !== "All" && (
          <Typography sx={{ color: "#888", fontSize: 14 }}>
            Viewing grouped utility in{" "}
            {areaSelect.find((a) => a.value === area)?.title}
          </Typography>
        )}
      </Box>

      {/* Reset dialog and snackbar removed */}

      {renderContent()}
    </Box>
  );
};

export default StatusContainer;
