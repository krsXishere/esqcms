/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places (default: 0)
 * @returns {string} Formatted number string
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Format number as percentage
 * @param {number} num - Number to format (0-100 or 0-1)
 * @param {number} decimals - Decimal places (default: 1)
 * @param {boolean} isDecimal - If true, num is 0-1, else 0-100
 * @returns {string} Formatted percentage string
 */
export const formatPercent = (num, decimals = 1, isDecimal = false) => {
  if (num === null || num === undefined || isNaN(num)) return "-";
  const value = isDecimal ? num * 100 : num;
  return `${formatNumber(value, decimals)}%`;
};

/**
 * Format number as currency (IDR)
 * @param {number} num - Number to format
 * @param {boolean} showSymbol - Show Rp symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (num, showSymbol = true) => {
  if (num === null || num === undefined || isNaN(num)) return "-";
  const formatted = new Intl.NumberFormat("id-ID").format(num);
  return showSymbol ? `Rp ${formatted}` : formatted;
};

/**
 * Format large numbers with suffix (K, M, B)
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places (default: 1)
 * @returns {string} Formatted number with suffix
 */
export const formatCompact = (num, decimals = 1) => {
  if (num === null || num === undefined || isNaN(num)) return "-";

  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum >= 1e9) {
    return `${sign}${(absNum / 1e9).toFixed(decimals)}B`;
  }
  if (absNum >= 1e6) {
    return `${sign}${(absNum / 1e6).toFixed(decimals)}M`;
  }
  if (absNum >= 1e3) {
    return `${sign}${(absNum / 1e3).toFixed(decimals)}K`;
  }

  return formatNumber(num, decimals);
};

/**
 * Format decimal as Cpk value
 * @param {number} cpk - Cpk value
 * @returns {string} Formatted Cpk with color indicator
 */
export const formatCpk = (cpk) => {
  if (cpk === null || cpk === undefined || isNaN(cpk)) return "-";
  return cpk.toFixed(2);
};

/**
 * Get Cpk status based on value
 * @param {number} cpk - Cpk value
 * @returns {object} Status object with label and color
 */
export const getCpkStatus = (cpk) => {
  if (cpk === null || cpk === undefined || isNaN(cpk)) {
    return { label: "N/A", color: "default" };
  }

  if (cpk >= 1.67) {
    return { label: "Excellent", color: "success" };
  }
  if (cpk >= 1.33) {
    return { label: "Good", color: "success" };
  }
  if (cpk >= 1.0) {
    return { label: "Acceptable", color: "warning" };
  }
  return { label: "Poor", color: "error" };
};

/**
 * Calculate percentage change
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {object} Change object with value and direction
 */
export const calculateChange = (current, previous) => {
  if (!previous || previous === 0) {
    return { value: 0, direction: "neutral" };
  }

  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change),
    direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
  };
};
