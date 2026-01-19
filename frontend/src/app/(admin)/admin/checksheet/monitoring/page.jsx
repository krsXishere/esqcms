"use client";
import React, { useState, useEffect } from "react";
import { Box, Button, Chip, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";

// Components
import FilterBar from "@/components/common/FilterBar";
import QCTable from "@/components/common/QCTable";
import StatusBadge from "@/components/common/StatusBadge";
import ProgressStepper from "@/components/common/ProgressStepper";

import { useFetchApi } from "@/app/hook/useFetchApi";
import { useDebounce } from "use-debounce";
import { formatDateTime } from "@/lib/utils/formatDate";
import { ENDPOINTS, buildQueryParams } from "@/lib/api/endpoints";

const ChecksheetMonitoringPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendRequest, loading } = useFetchApi();

  // Filters
  const [type, setType] = useState(searchParams.get("type") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [modelId, setModelId] = useState(searchParams.get("model_id") || "");
  const [partId, setPartId] = useState(searchParams.get("part_id") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch] = useDebounce(search, 500);

  // Pagination & Sorting
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [limit] = useState(10);
  const [sortField, setSortField] = useState(searchParams.get("sort_field") || "");
  const [sortDirection, setSortDirection] = useState(searchParams.get("sort_dir") || "desc");

  // Data
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter Options (should be fetched from API)
  const [models, setModels] = useState([]);
  const [parts, setParts] = useState([]);

  // Fetch data on filter/page change
  useEffect(() => {
    fetchChecksheets();
    updateUrl();
  }, [page, debouncedSearch, type, status, modelId, partId, sortField, sortDirection]);

  // Fetch filter options
  useEffect(() => {
    fetchModels();
    fetchParts();
  }, []);

  const fetchChecksheets = async () => {
    try {
      // Use mock data for testing
      const mockData = [
        { id: 1, checksheet_id: "CS-2026-001", serial_number: "Casing A-101", type: "dir", model_name: "Pump Model ABC-200", part_name: "Shaft B-202", inspector_name: "John Doe", foreman_name: "David Kim", approver_name: "Frank Miller", status: "pending", final_result: "OK", updated_at: "2026-01-13T08:30:00Z" },
        { id: 2, checksheet_id: "CS-2026-002", serial_number: "Casing B-205", type: "fi", model_name: "Pump Model XYZ-100", part_name: "Impeller C-303", inspector_name: "Jane Smith", foreman_name: "Bob Wilson", approver_name: "Alice Brown", status: "checked", final_result: "OK", updated_at: "2026-01-13T11:00:00Z" },
        { id: 3, checksheet_id: "CS-2026-003", serial_number: "Shaft D-310", type: "dir", model_name: "Pump Model DEF-300", part_name: "Bearing E-404", inspector_name: "Bob Wilson", foreman_name: "David Kim", approver_name: "Jane Smith", status: "approved", final_result: "OK", updated_at: "2026-01-13T10:30:00Z" },
        { id: 4, checksheet_id: "CS-2026-004", serial_number: "Impeller F-415", type: "fi", model_name: "Pump Model GHI-400", part_name: "Seal G-505", inspector_name: "Alice Brown", foreman_name: "Charlie Davis", approver_name: "David Kim", status: "revision", final_result: "NG", updated_at: "2026-01-13T08:00:00Z" },
        { id: 5, checksheet_id: "CS-2026-005", serial_number: "Bearing H-520", type: "dir", model_name: "Pump Model JKL-500", part_name: "Gasket I-606", inspector_name: "Charlie Davis", foreman_name: "Frank Miller", approver_name: "Bob Wilson", status: "approved", final_result: "NG", updated_at: "2026-01-13T09:00:00Z" },
        { id: 6, checksheet_id: "CS-2026-006", serial_number: "Seal J-625", type: "fi", model_name: "Pump Model MNO-600", part_name: "Valve K-707", inspector_name: "Jane Smith", foreman_name: "David Kim", approver_name: "Alice Brown", status: "checked", final_result: "OK", updated_at: "2026-01-13T07:00:00Z" },
        { id: 7, checksheet_id: "CS-2026-007", serial_number: "Gasket L-730", type: "dir", model_name: "Pump Model PQR-700", part_name: "Housing M-808", inspector_name: "Bob Wilson", foreman_name: "John Doe", approver_name: "Charlie Davis", status: "approved", final_result: "OK", updated_at: "2026-01-13T08:00:00Z" },
        { id: 8, checksheet_id: "CS-2026-008", serial_number: "Valve N-835", type: "fi", model_name: "Pump Model STU-800", part_name: "Rotor O-909", inspector_name: "Alice Brown", foreman_name: "Jane Smith", approver_name: "Frank Miller", status: "revision", final_result: "NG", updated_at: "2026-01-13T09:00:00Z" },
        { id: 9, checksheet_id: "CS-2026-009", serial_number: "Housing P-940", type: "dir", model_name: "Pump Model VWX-900", part_name: "Coupling Q-1010", inspector_name: "Charlie Davis", foreman_name: "David Kim", approver_name: "John Doe", status: "checked", final_result: "OK", updated_at: "2026-01-13T10:00:00Z" },
        { id: 10, checksheet_id: "CS-2026-010", serial_number: "Rotor R-1045", type: "fi", model_name: "Pump Model YZA-1000", part_name: "Flange S-1111", inspector_name: "John Doe", foreman_name: "Bob Wilson", approver_name: "Jane Smith", status: "pending", final_result: "OK", updated_at: "2026-01-13T11:00:00Z" },
      ];
      setRows(mockData);
      setTotal(50);
      setTotalPages(5);
      
      // Uncomment below for real API call
      /*
      const params = {
        page,
        limit,
        search: debouncedSearch,
        type,
        status,
        model_id: modelId,
        part_id: partId,
        sort: sortField ? `${sortField}:${sortDirection}` : "",
      };

      const response = await sendRequest({
        url: ENDPOINTS.CHECKSHEET.LIST,
        params,
      });

      if (response) {
        setRows(response.data || []);
        setTotal(response.total || 0);
        setTotalPages(response.total_pages || 1);
      }
      */
    } catch (error) {
      console.error("Error fetching checksheets:", error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await sendRequest({
        url: ENDPOINTS.MODELS.LIST,
        params: { limit: 100 },
      });
      if (response?.data) {
        setModels(response.data.map((m) => ({ value: m.id, label: m.name })));
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const fetchParts = async () => {
    try {
      const response = await sendRequest({
        url: ENDPOINTS.PARTS.LIST,
        params: { limit: 100 },
      });
      if (response?.data) {
        setParts(response.data.map((p) => ({ value: p.id, label: p.name })));
      }
    } catch (error) {
      console.error("Error fetching parts:", error);
    }
  };

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    if (modelId) params.set("model_id", modelId);
    if (partId) params.set("part_id", partId);
    if (sortField) {
      params.set("sort_field", sortField);
      params.set("sort_dir", sortDirection);
    }

    const queryString = params.toString();
    router.push(`/admin/checksheet/monitoring${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  const handleClearFilters = () => {
    setType("");
    setStatus("");
    setModelId("");
    setPartId("");
    setSearch("");
    setPage(1);
  };

  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    setPage(1);
  };

  const handleRowClick = (row) => {
    router.push(`/admin/checksheet/${row.type}/${row.id}`);
  };

  const activeFiltersCount = [type, status, modelId, partId, search].filter(Boolean).length;

  // Table columns
  const columns = [
    {
      field: "checksheet_id",
      headerName: "ID",
      sortable: true,
      width: 100,
    },
    {
      field: "serial_number",
      headerName: "Serial Number",
      sortable: true,
      minWidth: 150,
    },
    {
      field: "type",
      headerName: "Type",
      render: (row) => (
        <Chip
          label={row.type?.toUpperCase()}
          size="small"
          sx={{
            bgcolor: row.type === "dir" ? "#EBF5FF" : "#F0FDF4",
            color: row.type === "dir" ? "#1E40AF" : "#15803D",
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      ),
      width: 100,
    },
    {
      field: "model_part",
      headerName: "Model/Part",
      render: (row) => (
        <Box>
          <Box component="span" sx={{ fontWeight: 500, display: "block" }}>
            {row.model_name}
          </Box>
          <Box component="span" sx={{ color: "#64748B", fontSize: 12, display: "block" }}>
            {row.part_name}
          </Box>
        </Box>
      ),
      minWidth: 200,
    },
    {
      field: "inspector",
      headerName: "Inspector",
      render: (row) => row.inspector_name || "-",
    },
    {
      field: "foreman",
      headerName: "Foreman",
      render: (row) => row.foreman_name || "-",
    },
    {
      field: "approver",
      headerName: "Approver",
      render: (row) => row.approver_name || "-",
    },
    {
      field: "status",
      headerName: "Status",
    },
    {
      field: "progress",
      headerName: "Progress",
      render: (row) => <ProgressStepper currentStatus={row.status} compact />,
      minWidth: 200,
    },
    {
      field: "final_result",
      headerName: "Final Result",
      render: (row) => row.final_result ? (
        <Chip
          label={row.final_result}
          size="small"
          sx={{
            bgcolor: row.final_result === "OK" ? "#D1FAE5" : "#FEE2E2",
            color: row.final_result === "OK" ? "#059669" : "#DC2626",
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      ) : "-",
      width: 120,
    },
    {
      field: "updated_at",
      headerName: "Updated At",
      render: (row) => formatDateTime(row.updated_at),
      sortable: true,
      minWidth: 180,
    },
  ];

  const filters = [
    {
      name: "type",
      label: "Type",
      value: type,
      onChange: setType,
      options: [
        { value: "dir", label: "DIR" },
        { value: "fi", label: "FI" },
      ],
      width: 120,
    },
    {
      name: "status",
      label: "Status",
      value: status,
      onChange: setStatus,
      options: [
        { value: "pending", label: "Pending" },
        { value: "checked", label: "Checked" },
        { value: "approved", label: "Approved" },
        { value: "revision", label: "Revision Needed" },
      ],
      width: 150,
    },
    {
      name: "model",
      label: "Model",
      value: modelId,
      onChange: setModelId,
      options: models,
      width: 180,
    },
    {
      name: "part",
      label: "Part",
      value: partId,
      onChange: setPartId,
      options: parts,
      width: 180,
    },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: "#111827" }}>
          Checksheet Monitoring
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
            Monitor all QC checksheets and inspection records
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/admin/checksheet/create")}
            sx={{ 
              bgcolor: "#3B82F6", 
              "&:hover": { bgcolor: "#2563EB" }, 
              textTransform: "none", 
              fontWeight: 600,
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
            }}
          >
            New Inspection
          </Button>
        </Box>
      </Box>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search..."
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Data Table */}
      <QCTable
        columns={columns}
        rows={rows}
        page={page}
        setPage={setPage}
        totalRows={total}
        totalPages={totalPages}
        rowsPerPage={limit}
        loading={loading}
        showActions={false}
        emptyMessage="No checksheets found"
      />
    </Box>
  );
};

export default ChecksheetMonitoringPage;
