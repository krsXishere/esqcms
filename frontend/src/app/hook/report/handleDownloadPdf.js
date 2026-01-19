// utils/downloadReport.js
import { format, subHours, subDays, subMonths } from "date-fns";

// Ambil cookie secara aman (di browser)
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split("; ").map((c) => c.split("="));
  const found = cookies.find(([k]) => k === name);
  return found ? decodeURIComponent(found[1]) : null;
}

// Bersihkan nama file dari karakter ilegal
function safeString(str = "") {
  return String(str)
    .replace(/[\\/:*?"<>|]+/g, "_")
    .trim();
}

// Format timestamp untuk nama file -> "dd-MM-yyyy HH.mm.ss"
function fmt(d) {
  return format(d, "dd-MM-yyyy HH.mm.ss");
}

// Range default bila UI tidak mengirim
function getPeriodRange(period) {
  const end = new Date();
  let start = new Date(end);
  if (period === "hourly") start = subHours(end, 24);
  else if (period === "daily") start = subDays(end, 1);
  else if (period === "monthly") start = subMonths(end, 1);
  return { start, end };
}

const PERIOD_TO_API = { hourly: "perjam", daily: "harian", weekly: "mingguan", shiftly: "shiftly", monthly: "bulanan", yearly: "custom" };
const PERIOD_TO_FILENAME = {
  hourly: "hourly",
  daily: "daily",
  weekly: "weekly",
  shiftly: "shiftly",
  monthly: "monthly",
  yearly: "yearly",
};

/**
 * Unduh PDF report langsung sebagai file.
 * @param {Object} opts
 * @param {number|string} opts.deviceId
 * @param {"hourly"|"daily"|"weekly"|"monthly"|"yearly"} opts.period
 * @param {Array<Object>} [opts.rows]
 * @param {string} [opts.baseUrl]
 * @param {string} [opts.token]
 * @param {{start: Date|string, end: Date|string}} [opts.range]
 * @param {Object} [opts.periodParams] - Additional params like week, month, year for specific periods
 */
export async function downloadReportPdf({
  deviceId,
  period = "daily",
  rows = [],
  baseUrl = process.env.NEXT_PUBLIC_API_URL,
  token = getCookie("token"),
  range,
  periodParams = {},
} = {}) {
  if (!deviceId) throw new Error("deviceId wajib diisi");
  if (!baseUrl)
    throw new Error("Base URL tidak ditemukan (cek NEXT_PUBLIC_API_URL)");
  if (!token) throw new Error("Token tidak ditemukan di cookie 'token'");

  // 1) Ambil detail device (pakai cache rows dulu)
  let deviceObj = Array.isArray(rows)
    ? rows.find((d) => String(d.id) === String(deviceId))
    : null;
  if (!deviceObj) {
    const detailResp = await fetch(`${baseUrl}/devices/${deviceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!detailResp.ok) {
      const text = await detailResp.text().catch(() => "");
      throw new Error(
        `Gagal ambil detail device: HTTP ${detailResp.status} ${text || ""}`
      );
    }
    deviceObj = await detailResp.json();
  }
  if (!deviceObj) throw new Error("Device tidak ditemukan");

  // 2) Mapping periode & nama file
  const apiTemplate = PERIOD_TO_API[period] ?? "harian";
  const filePeriod = PERIOD_TO_FILENAME[period] ?? "daily";

  // Range dari UI (jika ada) atau default
  const fallback = getPeriodRange(period);
  const startDate = new Date(range?.start ?? fallback.start);
  const endDate = new Date(range?.end ?? fallback.end);

  const areaNameSafe = safeString(deviceObj?.area?.name || "UnknownArea");
  const deviceNameSafe = safeString(deviceObj?.name || `Device_${deviceId}`);
  const waktuPeriode = `${fmt(startDate)} - ${fmt(endDate)}`;
  const filename = `${areaNameSafe}_${deviceNameSafe}_${filePeriod}_${waktuPeriode}.pdf`;

  // 3) Hit endpoint generate - construct body based on template
  const bodyPayload = {
    device_ids: [Number(deviceObj.id)],
    format: "pdf",
    template: apiTemplate,
  };

  // Add parameters based on template type
  if (apiTemplate === "perjam") {
    // Hourly: needs date in YYYY-MM-DD format
    bodyPayload.date = format(startDate, "yyyy-MM-dd");
  } else if (apiTemplate === "harian") {
    // Daily: needs month (1-12) and year
    bodyPayload.month = startDate.getMonth() + 1;
    bodyPayload.year = startDate.getFullYear();
  } else if (apiTemplate === "mingguan") {
    // Weekly: needs week (1-5), month (1-12), and year
    bodyPayload.week = periodParams.week ?? 1;
    bodyPayload.month = periodParams.month ?? (startDate.getMonth() + 1);
    bodyPayload.year = periodParams.year ?? startDate.getFullYear();
  } else if (apiTemplate === "shiftly") {
    // Shift: needs shiftType ("shift1" or "shift2") and shiftDate (YYYY-MM-DD)
    bodyPayload.shiftType = periodParams.shiftType ?? "shift1";
    bodyPayload.shiftDate = periodParams.shiftDate ?? format(startDate, "yyyy-MM-dd");
  } else if (apiTemplate === "bulanan") {
    // Monthly: needs year only
    bodyPayload.year = startDate.getFullYear();
  } else if (apiTemplate === "custom") {
    // Custom/Yearly: needs start_date and end_date in ISO format
    bodyPayload.start_date = startDate.toISOString();
    bodyPayload.end_date = endDate.toISOString();
  }

  const resp = await fetch(`${baseUrl}/reports/generate?_t=${Date.now()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/pdf",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!resp.ok) {
    let errMsg = `HTTP ${resp.status}`;
    try {
      const ct = resp.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const j = await resp.json();
        errMsg += ` | ${j.message || JSON.stringify(j)}`;
      } else {
        const t = await resp.text();
        if (t) errMsg += ` | ${t.slice(0, 300)}`;
      }
    } catch {}
    throw new Error(`Generate report gagal: ${errMsg}`);
  }

  // 4) Unduh file
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
