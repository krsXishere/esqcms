import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/**
 * Format date to display format
 * @param {string|Date} date - Date to format
 * @param {string} format - Format pattern (default: DD MMM YYYY)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = "DD MMM YYYY") => {
  if (!date) return "-";
  return dayjs(date).format(format);
};

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @param {string} format - Format pattern (default: DD MMM YYYY HH:mm)
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date, format = "DD MMM YYYY HH:mm") => {
  if (!date) return "-";
  return dayjs(date).format(format);
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return "-";
  return dayjs(date).fromNow();
};

/**
 * Format date for input fields
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date for input
 */
export const formatDateForInput = (date) => {
  if (!date) return "";
  return dayjs(date).format("YYYY-MM-DD");
};

/**
 * Format date range
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "-";
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (start.isSame(end, "day")) {
    return start.format("DD MMM YYYY");
  }

  if (start.isSame(end, "month")) {
    return `${start.format("DD")} - ${end.format("DD MMM YYYY")}`;
  }

  if (start.isSame(end, "year")) {
    return `${start.format("DD MMM")} - ${end.format("DD MMM YYYY")}`;
  }

  return `${start.format("DD MMM YYYY")} - ${end.format("DD MMM YYYY")}`;
};

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean}
 */
export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), "day");
};

/**
 * Get start and end of period
 * @param {string} period - Period type (today|week|month)
 * @returns {object} Object with start and end dates
 */
export const getPeriodRange = (period) => {
  const now = dayjs();

  switch (period) {
    case "today":
      return {
        start: now.startOf("day").toISOString(),
        end: now.endOf("day").toISOString(),
      };
    case "week":
      return {
        start: now.startOf("week").toISOString(),
        end: now.endOf("week").toISOString(),
      };
    case "month":
      return {
        start: now.startOf("month").toISOString(),
        end: now.endOf("month").toISOString(),
      };
    default:
      return {
        start: now.startOf("day").toISOString(),
        end: now.endOf("day").toISOString(),
      };
  }
};
