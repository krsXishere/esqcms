"use client";
import { Box, Button, Chip } from "@mui/material";
import { useState, useEffect } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import InputSearch from "@/components/common/input-search";
import SelectOption from "@/components/common/select-option";
import TableComponents from "@/components/common/table-component";
import ModalDeleteWorkOrder from "./modal-delete-work-order";
import { useRouter, useSearchParams } from "next/navigation";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useDebounce } from "use-debounce";
import ModalAddWorkOrder from "./modal-add-work-order";
import ModalEditWorkOrder from "./modal-edit-work-order";
import ModalDetailWorkOrder from "./modal-detail-work-order";

const WorkOrdersTable = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [priorityFilter, setPriorityFilter] = useState(
    searchParams.get("priority") || ""
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const [debouncedValue] = useDebounce(search, 500);

  const { sendRequest, loading } = useFetchApi();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenAdd, setModalOpenAdd] = useState(false);
  const [modalOpenEdit, setModalOpenEdit] = useState(false);
  const [modalOpenDetail, setModalOpenDetail] = useState(false);

  const [id, setId] = useState("");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  const handleOpenDeleteModal = (id) => {
    const workOrder = rows.find(row => row.id === id);
    setSelectedWorkOrder(workOrder);
    setModalOpen(true);
    setId(id);
  };

  const handleOpenEditModal = (id) => {
    setModalOpenEdit(true);
    setId(id);
  };

  const handleOpenDetailModal = (id) => {
    setModalOpenDetail(true);
    setId(id);
  };

  const handleSuccessAdd = () => {
    fetchWorkOrders();
  };

  const handleSuccessEdit = () => {
    fetchWorkOrders();
  };

  const handleSuccessDelete = () => {
    fetchWorkOrders();
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "info",
      in_progress: "warning",
      completed: "success",
      closed: "default",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "success",
      medium: "info",
      high: "warning",
      critical: "error",
    };
    return colors[priority] || "default";
  };

  const columns = [
    { title: "TITLE", field: "title" },
    { 
      title: "TYPE", 
      field: (row) => (
        <span style={{ textTransform: "capitalize" }}>{row.type}</span>
      )
    },
    {
      title: "PRIORITY",
      field: (row) => (
        <Chip
          label={row.priority}
          size="small"
          color={getPriorityColor(row.priority)}
          sx={{ textTransform: "capitalize", fontWeight: 600 }}
        />
      ),
    },
    {
      title: "STATUS",
      field: (row) => (
        <Chip
          label={row.status.replace("_", " ")}
          size="small"
          color={getStatusColor(row.status)}
          sx={{ textTransform: "capitalize", fontWeight: 600 }}
        />
      ),
    },
    { title: "AREA", field: (row) => row.area?.name || "—" },
    { 
      title: "UTILITY", 
      field: (row) => row.utility?.name || "—" 
    },
    { 
      title: "ASSIGNED TO", 
      field: (row) => row.assignee?.name || "Unassigned" 
    },
    { 
      title: "START TIME", 
      field: (row) => {
        if (!row.scheduled_date) return "—";
        const date = new Date(row.scheduled_date);
        return date.toLocaleString('en-GB', { 
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    },
    { 
      title: "END TIME", 
      field: (row) => {
        if (!row.deadline) return "—";
        const date = new Date(row.deadline);
        return date.toLocaleString('en-GB', { 
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    },
    { 
      title: "CREATED", 
      field: (row) => new Date(row.created_at).toLocaleDateString() 
    },
  ];

  const updateQueryParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "All") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const statusSelect = [
    { title: "All", value: "All" },
    { title: "Open", value: "open" },
    { title: "In Progress", value: "in_progress" },
    { title: "Completed", value: "completed" },
    { title: "Closed", value: "closed" },
    { title: "Cancelled", value: "cancelled" },
  ];

  const prioritySelect = [
    { title: "All", value: "All" },
    { title: "Low", value: "low" },
    { title: "Medium", value: "medium" },
    { title: "High", value: "high" },
    { title: "Critical", value: "critical" },
  ];

  const fetchWorkOrders = async () => {
    const params = { page, limit };
    const statusParam = searchParams.get("status");
    const priorityParam = searchParams.get("priority");
    const searchParam = searchParams.get("search");

    if (statusParam) params.status = statusParam;
    if (priorityParam) params.priority = priorityParam;
    if (searchParam) params.search = searchParam;

    const result = await sendRequest({ url: "/work-orders", params });
    
    if (result?.success && result?.data) {
      const validatedData = result.data.map(wo => ({
        ...wo,
        area: wo.area || { id: null, name: "—" },
        device: wo.device || null,
        utility: wo.utility || null,
        creator: wo.creator || { id: null, name: "Unknown" },
        assignee: wo.assignee || null,
      }));
      setRows(validatedData);
    }
    
    setTotal(result?.pagination?.total || 0);
    const calculatedPages = Math.ceil((result?.pagination?.total || 0) / limit);
    setTotalPages(calculatedPages || 1);
  };

  // Trigger update query param when debounce completes
  useEffect(() => {
    updateQueryParam("search", debouncedValue);
  }, [debouncedValue]);

  // Fetch data when query param changes
  useEffect(() => {
    fetchWorkOrders();
  }, [searchParams, page]);

  return (
    <Box>
      {/* Filter Area */}
      <Box
        sx={(theme) => ({
          display: "flex",
          gap: "8px",
          mb: "16px",
          alignItems: "center",
          [theme.breakpoints.up("xs")]: {
            flexDirection: "column",
          },
          [theme.breakpoints.up("sm")]: {
            flexDirection: "row",
          },
          [theme.breakpoints.up("lg")]: {},
        })}
      >
        <InputSearch
          setValue={(val) => {
            setSearch(val);
          }}
          value={search}
          width="30%"
        />
        <Box
          sx={(theme) => ({
            display: "flex",
            width: "100%",
            [theme.breakpoints.up("xs")]: {
              gap: "10px",
              justifyContent: "start",
            },
            [theme.breakpoints.up("sm")]: {
              gap: 1,
            },
            [theme.breakpoints.up("lg")]: {},
          })}
        >
          <SelectOption
            selectMenus={statusSelect}
            setValue={(val) => {
              setStatusFilter(val);
              updateQueryParam("status", val);
            }}
            value={statusFilter}
            title={"Status"}
            width={"30%"}
          />
          <SelectOption
            selectMenus={prioritySelect}
            setValue={(val) => {
              setPriorityFilter(val);
              updateQueryParam("priority", val);
            }}
            value={priorityFilter}
            title={"Priority"}
            width={"30%"}
          />
          <Button
            variant="contained"
            startIcon={<AiFillPlusCircle className="size-5 md:size-6" />}
            sx={(theme) => ({
              px: "16px",
              py: "14px",
              minWidth: "160px",
              borderRadius: "12px",
              whiteSpace: "nowrap",
              textTransform: "capitalize",
              fontWeight: 600,
              [theme.breakpoints.up("xs")]: {
                fontSize: "14px",
              },
              [theme.breakpoints.up("sm")]: {
                fontSize: "16px",
              },
            })}
            onClick={() => setModalOpenAdd(true)}
          >
            Work Order
          </Button>
        </Box>
      </Box>

      <TableComponents
        columns={columns}
        rowsPerPage={limit}
        rows={rows}
        page={page}
        totalRows={total}
        totalPages={totalPages}
        setPage={(val) => updateQueryParam("page", val)}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        onDetail={handleOpenDetailModal}
        hasActions={true}
        loading={loading}
      />

      <ModalAddWorkOrder
        open={modalOpenAdd}
        setOpen={setModalOpenAdd}
        onSuccessAdd={handleSuccessAdd}
      />
      <ModalEditWorkOrder
        open={modalOpenEdit}
        setOpen={setModalOpenEdit}
        onSuccessEdit={handleSuccessEdit}
        id={id}
      />
      <ModalDetailWorkOrder
        open={modalOpenDetail}
        setOpen={setModalOpenDetail}
        id={id}
      />
      <ModalDeleteWorkOrder
        open={modalOpen}
        setOpen={setModalOpen}
        onSuccessDelete={handleSuccessDelete}
        id={id}
        workOrder={selectedWorkOrder}
      />
    </Box>
  );
};

export default WorkOrdersTable;
