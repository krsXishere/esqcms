"use client";
import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  ListItemText,
  Checkbox,
  TextField,
  InputAdornment,
  ListSubheader,
  OutlinedInput,
} from "@mui/material";
import { CiSearch } from "react-icons/ci";
import { useTheme } from "@mui/material/styles";

const ALL_MARKER = "__all__";

export default function MultiSelectOption({
  value = [],
  setValue,
  selectMenus = [],
  title = "Device",
  width = "25%",
  placeholder = "Cari...",
  showSelectAll = true,
  searchable = true,
  maxMenuHeight = 360,
  chipLimit = 3,
}) {
  const theme = useTheme();
  const [search, setSearch] = useState("");

  const normValue = useMemo(
    () => (Array.isArray(value) ? value.map(String) : []),
    [value]
  );

  const allValues = useMemo(
    () => selectMenus.map((o) => String(o.value)),
    [selectMenus]
  );

  const titleMap = useMemo(
    () => new Map(selectMenus.map((o) => [String(o.value), o.title])),
    [selectMenus]
  );

  const filtered = useMemo(() => {
    if (!searchable || !search.trim()) return selectMenus;
    const q = search.toLowerCase();
    return selectMenus.filter(
      (o) =>
        String(o.title).toLowerCase().includes(q) ||
        String(o.value).toLowerCase().includes(q)
    );
  }, [search, searchable, selectMenus]);

  useEffect(() => {
    const validSet = new Set(allValues);
    const valid = normValue.filter((v) => validSet.has(v));
    if (valid.length !== normValue.length) setValue(valid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allValues.join("|")]);

  const isAllSelected =
    normValue.length > 0 && normValue.length === allValues.length;

  const handleSelectChange = (e) => {
    const incoming = (e.target.value || []).map(String);
    const last = incoming[incoming.length - 1];

    if (last === ALL_MARKER) {
      setValue(isAllSelected ? [] : allValues);
      return;
    }

    const validSet = new Set(allValues);
    const next = Array.from(new Set(incoming)).filter((v) => validSet.has(v));
    setValue(next);
  };

  const renderValue = () => {
    if (!normValue.length) {
      return (
        <span style={{ color: theme.palette.text.secondary }}>
          Pilih {title}
        </span>
      );
    }

    const chipBg = "#2F80ED";
    const chipText = "#FFFFFF";

    const shown = normValue.slice(0, chipLimit);
    const extra = normValue.length - chipLimit;

    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, py: 0.25 }}>
        {shown.map((v) => (
          <span
            key={v}
            style={{
              color: chipText,
              backgroundColor: chipBg,
              padding: "4px 8px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.2,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {titleMap.get(v) ?? v}
          </span>
        ))}

        {extra > 0 && (
          <span
            style={{
              color: chipText,
              backgroundColor: chipBg,
              padding: "4px 8px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.2,
              opacity: 0.9,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            +{extra}
          </span>
        )}
      </Box>
    );
  };

  const inputBg = "#FFFFFF";
  const borderClr = "#E2E8F0";

  return (
    <FormControl sx={{ width }}>
      <Select
        multiple
        value={normValue}
        onChange={handleSelectChange}
        renderValue={renderValue}
        displayEmpty
        input={
          <OutlinedInput
            notched={false}
            sx={{
              borderRadius: "12px",
              backgroundColor: inputBg,
              "& .MuiOutlinedInput-notchedOutline": {
                borderRadius: "12px",
                borderColor: borderClr,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: borderClr,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: borderClr,
              },
            }}
          />
        }
        MenuProps={{
          disableAutoFocusItem: true,
          PaperProps: { style: { maxHeight: maxMenuHeight, paddingTop: 0 } },
          MenuListProps: { autoFocusItem: false },
        }}
        sx={{
          borderRadius: "12px",

          // 🔑 INI KUNCI UTAMA (sering root cause “hilang” di light/dark)
          "& .MuiSelect-select": {
            color: theme.palette.text.primary,
            WebkitTextFillColor: theme.palette.text.primary,
            opacity: 1,
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 4,
            minHeight: 40,
          },

          "& .MuiSvgIcon-root": {
            color: theme.palette.text.primary,
          },
        }}
      >
        {searchable && (
          <ListSubheader
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              px: 1.5,
              pt: 1,
              pb: 1,
              backgroundColor: "#FFFFFF",
            }}
            onKeyDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <TextField
              size="small"
              autoFocus
              fullWidth
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CiSearch fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </ListSubheader>
        )}

        {showSelectAll && (
          <MenuItem value={ALL_MARKER} dense sx={{ py: 0.5, fontWeight: 600 }}>
            <Checkbox
              checked={isAllSelected}
              indeterminate={!isAllSelected && normValue.length > 0}
            />
            <ListItemText primary={isAllSelected ? "Clear All" : "Select All"} />
          </MenuItem>
        )}

        {filtered.length === 0 ? (
          <MenuItem disabled sx={{ opacity: 0.7 }}>
            Tidak ada hasil
          </MenuItem>
        ) : (
          filtered.map((o) => {
            const val = String(o.value);
            const checked = normValue.includes(val);
            return (
              <MenuItem key={val} value={val}>
                <Checkbox checked={checked} />
                <ListItemText primary={o.title} />
              </MenuItem>
            );
          })
        )}
      </Select>
    </FormControl>
  );
}
