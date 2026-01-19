import { useMemo } from "react";

// return "21/02/2023"
export function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);
  if (isNaN(parsed)) return "-"; // handle invalid date

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();

  return `${day}/${month}/${year}`;
}

// return "05/23/2025 12:34:59"
export function formatDateTime(date) {
  if (!date) return "-";

  const parsed = new Date(date);
  if (isNaN(parsed)) return "-"; // Jika tanggal tidak valid

  const month = String(parsed.getMonth() + 1).padStart(2, "0"); // Bulan
  const day = String(parsed.getDate()).padStart(2, "0"); // Tanggal
  const year = parsed.getFullYear(); // Tahun

  const hours = String(parsed.getHours()).padStart(2, "0"); // Jam
  const minutes = String(parsed.getMinutes()).padStart(2, "0"); // Menit
  const seconds = String(parsed.getSeconds()).padStart(2, "0"); // Detik

  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
}

// return 21:30
export const getHourFromISO = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // bulan dimulai dari 0
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

function capitalize(text) {
  if (!text || typeof text !== "string") return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export const capitalizeWords = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
};

export const initialName = (name) => {
  if (!name || typeof name !== "string") return "";
  return name.trim().charAt(0).toUpperCase();
};
