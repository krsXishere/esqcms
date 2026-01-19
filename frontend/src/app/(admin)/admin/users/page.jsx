"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Drawer,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useSnackbar } from "notistack";
import AddIcon from "@mui/icons-material/Add";

// Components
import FilterBar from "@/components/common/FilterBar";
import QCTable from "@/components/common/QCTable";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { useFetchApi } from "@/app/hook/useFetchApi";
import { useDebounce } from "use-debounce";
import { formatDateTime } from "@/lib/utils/formatDate";
import { ENDPOINTS } from "@/lib/api/endpoints";

const UsersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendRequest, loading } = useFetchApi();
  const { enqueueSnackbar } = useSnackbar();

  // Filters
  const [role, setRole] = useState(searchParams.get("role") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch] = useDebounce(search, 500);

  // Pagination
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [limit] = useState(10);

  // Data
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "inspector",
    section_id: "",
    shift_id: "",
    is_active: true,
  });

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchUsers();
    updateUrl();
  }, [page, debouncedSearch, role, status]);

  const fetchUsers = async () => {
    try {
      const params = {
        page,
        limit,
        search: debouncedSearch,
        role,
        status,
      };

      const response = await sendRequest({
        url: ENDPOINTS.USERS.LIST,
        params,
      });

      if (response) {
        setRows(response.data || []);
        setTotal(response.total || 0);
        setTotalPages(response.total_pages || 1);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    if (status) params.set("status", status);

    const queryString = params.toString();
    router.push(`/admin/users${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  const handleClearFilters = () => {
    setRole("");
    setStatus("");
    setSearch("");
    setPage(1);
  };

  const handleAdd = () => {
    setDrawerMode("add");
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      role: "inspector",
      section_id: "",
      shift_id: "",
      is_active: true,
    });
    setDrawerOpen(true);
  };

  const handleEdit = (row) => {
    setDrawerMode("edit");
    setSelectedUser(row);
    setFormData({
      name: row.name || "",
      email: row.email || "",
      username: row.username || "",
      password: "",
      role: row.role || "inspector",
      section_id: row.section_id || "",
      shift_id: row.shift_id || "",
      is_active: row.is_active ?? true,
    });
    setDrawerOpen(true);
  };

  const handleDelete = (row) => {
    setDeleteId(row.id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const url =
        drawerMode === "add"
          ? ENDPOINTS.USERS.CREATE
          : ENDPOINTS.USERS.UPDATE(selectedUser.id);

      const method = drawerMode === "add" ? "post" : "put";

      const submitData = { ...formData };
      if (drawerMode === "edit" && !submitData.password) {
        delete submitData.password;
      }

      await sendRequest({
        method,
        url,
        data: submitData,
      });

      enqueueSnackbar(
        `User ${drawerMode === "add" ? "created" : "updated"} successfully`,
        { variant: "success" }
      );

      setDrawerOpen(false);
      fetchUsers();
    } catch (error) {
      enqueueSnackbar(error?.message || "Failed to save user", {
        variant: "error",
      });
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await sendRequest({
        method: "delete",
        url: ENDPOINTS.USERS.DELETE(deleteId),
      });

      enqueueSnackbar("User deleted successfully", { variant: "success" });
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      enqueueSnackbar(error?.message || "Failed to delete user", {
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await sendRequest({
        method: "patch",
        url: ENDPOINTS.USERS.TOGGLE_STATUS(userId),
      });

      enqueueSnackbar("User status updated", { variant: "success" });
      fetchUsers();
    } catch (error) {
      enqueueSnackbar("Failed to update status", { variant: "error" });
    }
  };

  // Table columns
  const columns = [
    {
      field: "name",
      headerName: "Name",
      highlight: true,
    },
    {
      field: "email",
      headerName: "Email",
    },
    {
      field: "username",
      headerName: "Username",
    },
    {
      field: "role",
      headerName: "Role",
      render: (row) => (
        <StatusBadge
          status={row.role}
          label={row.role?.toUpperCase()}
          customConfig={{
            bgcolor: "#EAF4FF",
            color: "#2F80ED",
          }}
        />
      ),
    },
    {
      field: "section",
      headerName: "Section",
      render: (row) => row.section_name || "-",
    },
    {
      field: "shift",
      headerName: "Shift",
      render: (row) => row.shift_name || "-",
    },
    {
      field: "is_active",
      headerName: "Status",
      render: (row) => (
        <StatusBadge status={row.is_active ? "active" : "inactive"} />
      ),
    },
    {
      field: "created_at",
      headerName: "Created At",
      render: (row) => formatDateTime(row.created_at),
    },
  ];

  const filters = [
    {
      name: "role",
      label: "Role",
      value: role,
      onChange: setRole,
      options: [
        { value: "super_admin", label: "Super Admin" },
        { value: "inspector", label: "Inspector" },
        { value: "checker", label: "Checker" },
        { value: "approver", label: "Approver" },
      ],
      width: 150,
    },
    {
      name: "status",
      label: "Status",
      value: status,
      onChange: setStatus,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      width: 130,
    },
  ];

  const activeFiltersCount = [role, status, search].filter(Boolean).length;

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: "#111827" }}>
          User Management
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#6B7280" }}>
            Manage system users, roles, and permissions
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleAdd}
            sx={{ 
              bgcolor: "#3B82F6", 
              "&:hover": { bgcolor: "#2563EB" }, 
              textTransform: "none", 
              fontWeight: 600,
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
            }}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users..."
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
        showActions={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add/Edit Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { 
            width: { xs: "100%", sm: 480 }, 
            bgcolor: "#FFFFFF",
            boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.12)"
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box sx={{ 
            p: 3, 
            borderBottom: "1px solid #E5E7EB",
            bgcolor: "#F9FAFB"
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>
              {drawerMode === "add" ? "Add User" : "Edit User"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              {drawerMode === "add"
                ? "Fill in the details to create a new user"
                : "Update the user information"}
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, p: 3, overflowY: "auto" }}>
            <Stack spacing={3}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF",
                    "& input": {
                      color: "#111827",
                      fontWeight: 500
                    },
                    "& fieldset": {
                      borderColor: "#E5E7EB"
                    },
                    "&:hover fieldset": {
                      borderColor: "#3B82F6"
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3B82F6"
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: "#6B7280",
                    "&.Mui-focused": {
                      color: "#3B82F6"
                    }
                  }
                }}
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF",
                    "& input": {
                      color: "#111827",
                      fontWeight: 500
                    },
                    "& fieldset": {
                      borderColor: "#E5E7EB"
                    },
                    "&:hover fieldset": {
                      borderColor: "#3B82F6"
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3B82F6"
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: "#6B7280",
                    "&.Mui-focused": {
                      color: "#3B82F6"
                    }
                  }
                }}
              />
              <TextField
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF",
                    "& input": {
                      color: "#111827",
                      fontWeight: 500
                    },
                    "& fieldset": {
                      borderColor: "#E5E7EB"
                    },
                    "&:hover fieldset": {
                      borderColor: "#3B82F6"
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3B82F6"
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: "#6B7280",
                    "&.Mui-focused": {
                      color: "#3B82F6"
                    }
                  }
                }}
              />
              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={drawerMode === "add"}
                helperText={drawerMode === "edit" ? "Leave blank to keep current password" : ""}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF",
                    "& input": {
                      color: "#111827",
                      fontWeight: 500
                    },
                    "& fieldset": {
                      borderColor: "#E5E7EB"
                    },
                    "&:hover fieldset": {
                      borderColor: "#3B82F6"
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3B82F6"
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: "#6B7280",
                    "&.Mui-focused": {
                      color: "#3B82F6"
                    }
                  },
                  "& .MuiFormHelperText-root": {
                    color: "#6B7280"
                  }
                }}
              />
              <FormControl fullWidth>
                <InputLabel sx={{ color: "#6B7280", "&.Mui-focused": { color: "#3B82F6" } }}>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  sx={{
                    bgcolor: "#FFFFFF",
                    color: "#111827",
                    fontWeight: 500,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#E5E7EB"
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#3B82F6"
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#3B82F6"
                    }
                  }}
                >
                  <MenuItem value="inspector">Inspector</MenuItem>
                  <MenuItem value="checker">Checker</MenuItem>
                  <MenuItem value="approver">Approver</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#3B82F6"
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#3B82F6"
                      }
                    }}
                  />
                }
                label={<Typography sx={{ color: "#111827", fontWeight: 500 }}>Active</Typography>}
              />
            </Stack>
          </Box>

          {/* Footer */}
          <Box sx={{ 
            p: 3, 
            borderTop: "1px solid #E5E7EB",
            bgcolor: "#F9FAFB"
          }}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !formData.name || !formData.email}
                fullWidth
                sx={{
                  bgcolor: "#3B82F6",
                  "&:hover": { bgcolor: "#2563EB" },
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.2,
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                }}
              >
                {drawerMode === "add" ? "Create User" : "Update User"}
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => setDrawerOpen(false)} 
                fullWidth
                sx={{
                  borderColor: "#E5E7EB",
                  color: "#6B7280",
                  "&:hover": {
                    borderColor: "#3B82F6",
                    bgcolor: "#F9FAFB"
                  },
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.2
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        severity="error"
        confirmText="Delete"
        loading={deleting}
      />
    </Box>
  );
};

export default UsersPage;
