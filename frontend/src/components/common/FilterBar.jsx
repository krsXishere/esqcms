"use client";
import React from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Button,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import dayjs from "dayjs";

/**
 * FilterBar Component
 * Reusable filter bar with search, select filters, and date range
 */
const FilterBar = ({
  filters = [],
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  dateRange,
  onDateRangeChange,
  showDateRange = false,
  onClearFilters,
  activeFiltersCount = 0,
  sticky = false,
  children,
}) => {
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        borderRadius: 2,
        p: 2,
        mb: 3,
        border: "1px solid #E2E8F0",
        ...(sticky && {
          position: "sticky",
          top: 72,
          zIndex: 100,
        }),
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        {/* Search Input */}
        {onSearchChange && (
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              minWidth: 250,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#F5F7FA",
                borderRadius: 2,
                "& fieldset": {
                  borderColor: "#E2E8F0",
                },
                "&:hover fieldset": {
                  borderColor: "#CBD5E1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#2F80ED",
                },
              },
              "& .MuiInputBase-input": {
                color: "#1F2937",
                fontWeight: 500,
                "&::placeholder": {
                  color: "#6B7280",
                  opacity: 1,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#6B7280" }} />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => onSearchChange("")}>
                    <ClearIcon sx={{ fontSize: 18, color: "#6B7280" }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}

        {/* Dynamic Filters */}
        {filters.map((filter) => (
          <FormControl
            key={filter.name}
            size="small"
            sx={{
              minWidth: filter.width || 150,
            }}
          >
            <InputLabel
              sx={{
                color: "#374151",
                fontWeight: 500,
                "&.Mui-focused": { color: "#2F80ED" },
              }}
            >
              {filter.label}
            </InputLabel>
            <Select
              value={filter.value || ""}
              onChange={(e) => filter.onChange(e.target.value)}
              label={filter.label}
              sx={{
                bgcolor: "#F5F7FA",
                borderRadius: 2,
                color: "#1F2937",
                fontWeight: 500,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E2E8F0",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#CBD5E1",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2F80ED",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: "#FFFFFF",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    "& .MuiMenuItem-root": {
                      color: "#1F2937",
                      fontWeight: 500,
                      "&:hover": {
                        backgroundColor: "rgba(243, 244, 246, 0.6)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "rgba(47, 128, 237, 0.08)",
                        color: "#1F2937",
                        "&:hover": {
                          backgroundColor: "rgba(47, 128, 237, 0.12)",
                        },
                      },
                    },
                  },
                },
              }}
            >
              {filter.showAll !== false && (
                <MenuItem value="">All</MenuItem>
              )}
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}

        {/* Date Range Picker */}
        {showDateRange && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="From Date"
              value={dateRange?.from ? dayjs(dateRange.from) : null}
              onChange={(newValue) =>
                onDateRangeChange({
                  ...dateRange,
                  from: newValue?.toISOString() || null,
                })
              }
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    minWidth: 150,
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#F5F7FA",
                      borderRadius: 2,
                    },
                  },
                },
              }}
            />
            <DatePicker
              label="To Date"
              value={dateRange?.to ? dayjs(dateRange.to) : null}
              onChange={(newValue) =>
                onDateRangeChange({
                  ...dateRange,
                  to: newValue?.toISOString() || null,
                })
              }
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    minWidth: 150,
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#F5F7FA",
                      borderRadius: 2,
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        )}

        {/* Additional Children */}
        {children}

        {/* Clear Filters */}
        {hasActiveFilters && onClearFilters && (
          <Button
            variant="text"
            size="small"
            onClick={onClearFilters}
            startIcon={<ClearIcon />}
            sx={{
              color: "#64748B",
              "&:hover": {
                bgcolor: "#F1F5F9",
              },
            }}
          >
            Clear ({activeFiltersCount})
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default FilterBar;
