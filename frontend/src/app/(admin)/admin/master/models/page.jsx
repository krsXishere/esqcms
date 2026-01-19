"use client";
import React, { useState, useEffect } from "react";
import { Box, Button, Drawer, TextField, Stack, Typography, Chip } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useSnackbar } from "notistack";
import AddIcon from "@mui/icons-material/Add";

// Components
import FilterBar from "@/components/common/FilterBar";
import QCTable from "@/components/common/QCTable";
import ConfirmDialog from "@/components/common/ConfirmDialog";

import { useFetchApi } from "@/app/hook/useFetchApi";
import { useDebounce } from "use-debounce";
import { formatDateTime } from "@/lib/utils/formatDate";
import { ENDPOINTS } from "@/lib/api/endpoints";

const ModelsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendRequest, loading } = useFetchApi();
  const { enqueueSnackbar } = useSnackbar();

  // Filters
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
  const [drawerMode, setDrawerMode] = useState("add"); // 'add' or 'edit'
  const [selectedModel, setSelectedModel] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
  });

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchModels();
    updateUrl();
  }, [page, debouncedSearch]);

  const fetchModels = async () => {
    try {
      const params = {
        page,
        limit,
        search: debouncedSearch,
      };

      const response = await sendRequest({
        url: ENDPOINTS.MODELS.LIST,
        params,
      });

      if (response) {
        setRows(response.data || []);
        setTotal(response.total || 0);
        setTotalPages(response.total_pages || 1);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (search) params.set("search", search);

    const queryString = params.toString();
    router.push(`/admin/master/models${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  const handleAdd = () => {
    setDrawerMode("add");
    setFormData({ code: "", name: "", description: "" });
    setDrawerOpen(true);
  };

  const handleEdit = (row) => {
    setDrawerMode("edit");
    setSelectedModel(row);
    setFormData({
      code: row.code || "",
      name: row.name || "",
      description: row.description || "",
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
          ? ENDPOINTS.MODELS.CREATE
          : ENDPOINTS.MODELS.UPDATE(selectedModel.id);

      const method = drawerMode === "add" ? "post" : "put";

      await sendRequest({
        method,
        url,
        data: formData,
      });

      enqueueSnackbar(
        `Model ${drawerMode === "add" ? "created" : "updated"} successfully`,
        { variant: "success" }
      );

      setDrawerOpen(false);
      fetchModels();
    } catch (error) {
      enqueueSnackbar(error?.message || "Failed to save model", {
        variant: "error",
      });
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await sendRequest({
        method: "delete",
        url: ENDPOINTS.MODELS.DELETE(deleteId),
      });

      enqueueSnackbar("Model deleted successfully", { variant: "success" });
      setDeleteDialogOpen(false);
      fetchModels();
    } catch (error) {
      enqueueSnackbar(error?.message || "Failed to delete model", {
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Table columns
  const columns = [
    {
      field: "code",
      headerName: "Model Code",
      highlight: true,
    },
    {
      field: "name",
      headerName: "Model Name",
    },
    {
      field: "description",
      headerName: "Description",
    },
    {
      field: "created_at",
      headerName: "Created Date",
      render: (row) => formatDateTime(row.created_at),
    },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#111827",
                mb: 0.5,
              }}
            >
              Product Models
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#64748B",
                fontSize: "0.875rem",
              }}
            >
              Manage and configure product model master data
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              bgcolor: "#3B82F6",
              "&:hover": { bgcolor: "#2563EB" },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Add Model
          </Button>
        </Stack>
      </Box>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search models..."
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
        onEdit={handleEdit}
        onDelete={handleDelete}
        showActions={true}
        emptyMessage="No models found"
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
              {drawerMode === "add" ? "Add Model" : "Edit Model"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              {drawerMode === "add"
                ? "Fill in the details to create a new model"
                : "Update the model information"}
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, p: 3, overflowY: "auto" }}>
            <Stack spacing={3}>
              <TextField
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={4}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFFFFF",
                    "& textarea": {
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
                disabled={loading || !formData.code || !formData.name}
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
                {drawerMode === "add" ? "Create Model" : "Update Model"}
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
        title="Delete Model"
        message="Are you sure you want to delete this model? This action cannot be undone."
        severity="error"
        confirmText="Delete"
        loading={deleting}
      />
    </Box>
  );
};

export default ModelsPage;
