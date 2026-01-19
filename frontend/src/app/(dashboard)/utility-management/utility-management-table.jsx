"use client";
import React, { useState, useEffect } from "react";
import { Box, Button, Chip, IconButton, Tooltip } from "@mui/material";
import { AiFillPlusCircle } from "react-icons/ai";
import { AccessTime } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { useFetchApi } from "@/app/hook/useFetchApi";
import InputSearch from "@/components/common/input-search";
import SelectOption from "@/components/common/select-option";
import TableComponents from "@/components/common/table-component";
import ModalDeleteData from "@/components/common/modal-delete-data";
import ModalAddUtility from "./modal-add-utility";
import ModalEditUtility from "./modal-edit-utility";
import ModalViewUtility from "./modal-view-utility";
import ModalEditRunningHours from "./modal-edit-running-hours";
import { useDebounce } from "use-debounce";

const UtilityManagementTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const { sendRequest, loading } = useFetchApi();

  const [area, setArea] = useState(searchParams.get("area") || "All");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [debouncedValue] = useDebounce(search, 500);

  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalViewOpen, setModalViewOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [modalRunningHoursOpen, setModalRunningHoursOpen] = useState(false);
  const [selectedUtility, setSelectedUtility] = useState(null);
  const [deleteId, setDeleteId] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [areaSelect, setAreaSelect] = useState([]);
  const [loggedAreaId, setLoggedAreaId] = useState(null);

  // Check if user is Super Admin
  useEffect(() => {
    const loginRole = localStorage.getItem("role");
    setIsSuperAdmin(loginRole === "Super Admin");
  }, []);

  // Custom render for Running Hours column with edit button for Super Admin
  const RunningHoursCell = ({ row }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Chip
        icon={<AccessTime sx={{ fontSize: 16 }} />}
        label={`${(row.running_hours || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} hrs`}
        size="small"
        sx={{
          bgcolor: row.is_running ? "rgba(34, 197, 94, 0.15)" : "rgba(148, 163, 184, 0.15)",
          color: row.is_running ? "#22c55e" : "#94a3b8",
          fontWeight: 600,
          "& .MuiChip-icon": {
            color: row.is_running ? "#22c55e" : "#94a3b8",
          },
        }}
      />
      {row.is_running && (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "#22c55e",
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": { opacity: 1 },
              "50%": { opacity: 0.4 },
              "100%": { opacity: 1 },
            },
          }}
        />
      )}
      {isSuperAdmin && (
        <Tooltip title="Edit Running Hours">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenRunningHoursModal(row.id);
            }}
            sx={{
              color: "#38bdf8",
              "&:hover": {
                bgcolor: "rgba(56, 189, 248, 0.15)",
              },
            }}
          >
            <AccessTime sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  const columns = [
    { title: "UTILITY NAME", field: "name" },
    { title: "AREA", field: "area.name" },
    { title: "RUNNING HOURS", field: "running_hours", render: (row) => <RunningHoursCell row={row} /> },
    { title: "DEVICES MAPPED", field: "deviceMappings.length" },
  ];

  const sortSelect = [
    { title: "Name A to Z", value: "name:asc" },
    { title: "Name Z to A", value: "name:desc" },
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

  const fetchUtilities = async () => {
    const params = { page, limit };
    const areaParam = searchParams.get("area_id");
    const sortParam = searchParams.get("sort");
    const searchParam = searchParams.get("search");

    // If explicit area filter in URL use it, otherwise if user has an assigned area use that
    if (areaParam) params.area_id = areaParam;
    else if (!areaParam && loggedAreaId) params.area_id = loggedAreaId;
    if (sortParam) params.sort = sortParam;
    if (searchParam) params.search = searchParam;

    try {
      const result = await sendRequest({ url: "/utilities", params });

      setRows(result?.data || []);
      setTotal(result?.total || 0);
      setTotalPages(Math.ceil((result?.total || 0) / limit));
      setLimit(result?.limit || 10);
    } catch (error) {
      console.error("Error fetching utilities:", error);
      setRows([]);
    }
  };

  const handleOpenDeleteModal = (id) => {
    setDeleteId(id);
    setModalDeleteOpen(true);
  };

  const handleOpenEditModal = async (id) => {
    try {
      const result = await sendRequest({ url: `/utilities/${id}` });
      setSelectedUtility(result?.data);
      setModalEditOpen(true);
    } catch (error) {
      console.error("Error fetching utility:", error);
    }
  };

  const handleOpenViewModal = async (id) => {
    try {
      const result = await sendRequest({ url: `/utilities/${id}` });
      setSelectedUtility(result?.data);
      setModalViewOpen(true);
    } catch (error) {
      console.error("Error fetching utility:", error);
    }
  };

  const handleOpenRunningHoursModal = async (id) => {
    try {
      const result = await sendRequest({ url: `/utilities/${id}/running-hours` });
      setSelectedUtility(result?.data);
      setModalRunningHoursOpen(true);
    } catch (error) {
      console.error("Error fetching running hours:", error);
    }
  };

  useEffect(() => {
    updateQueryParam("search", debouncedValue);
  }, [debouncedValue]);

  useEffect(() => {
    fetchUtilities();
  }, [searchParams]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const areaResult = await sendRequest({ url: "/areas" });
        const storedAreaId = localStorage.getItem("area_id");
        const loginRole = localStorage.getItem("role");

        // If user has an assigned area and is not Super Admin, limit to that area
        if (storedAreaId && loginRole !== "Super Admin") {
          const found = areaResult?.data?.find(
            (a) => String(a.id) === String(storedAreaId)
          );
          if (found) {
            setAreaSelect([{ title: found.name, value: found.id }]);
            setArea(String(found.id));
            setLoggedAreaId(String(found.id));
          } else {
            setAreaSelect([]);
          }
        } else {
          const areaFormatted = [
            { title: "All", value: "All" },
            ...areaResult?.data?.map((area) => ({
              title: area.name,
              value: area.id,
            })),
          ];
          setAreaSelect(areaFormatted);
        }
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, []);

  return (
    <Box>
      <ModalAddUtility
        open={modalAddOpen}
        setOpen={setModalAddOpen}
        onSuccessAdd={fetchUtilities}
        areas={areaSelect.filter((a) => a.value !== "All")}
      />
      <ModalDeleteData
        open={modalDeleteOpen}
        id={deleteId}
        setOpen={setModalDeleteOpen}
        endpoint={"utilities"}
        onSuccessDelete={fetchUtilities}
      />
      {selectedUtility && (
        <>
          <ModalEditUtility
            open={modalEditOpen}
            setOpen={setModalEditOpen}
            onSuccessEdit={fetchUtilities}
            utility={selectedUtility}
            areas={areaSelect.filter((a) => a.value !== "All")}
          />
          <ModalViewUtility
            open={modalViewOpen}
            onClose={() => {
              setModalViewOpen(false);
              setSelectedUtility(null);
            }}
            utility={selectedUtility}
          />
          {isSuperAdmin && (
            <ModalEditRunningHours
              open={modalRunningHoursOpen}
              setOpen={setModalRunningHoursOpen}
              utility={selectedUtility}
              onSuccessEdit={fetchUtilities}
            />
          )}
        </>
      )}

      {/* Filter */}
      <Box
        sx={(theme) => ({
          display: "flex",
          gap: "8px",
          mb: "16px",
          alignItems: "start",
          justifyContent: "space-between",
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
          width="25%"
        />
        <Box
          sx={(theme) => ({
            display: "flex",
            width: "100%",
            [theme.breakpoints.up("xs")]: {
              gap: "10px",
            },
            [theme.breakpoints.up("sm")]: {
              gap: 1,
            },
            [theme.breakpoints.up("lg")]: {},
          })}
        >
          <SelectOption
            selectMenus={areaSelect}
            setValue={(val) => {
              setArea(val);
              updateQueryParam("area_id", val);
            }}
            title={"Area"}
            value={area}
            width={"30%"}
          />
          <SelectOption
            selectMenus={sortSelect}
            setValue={(val) => {
              setSort(val);
              updateQueryParam("sort", val);
            }}
            title={"Sort"}
            value={sort}
            width={"30%"}
          />

          <Button
            variant="contained"
            startIcon={<AiFillPlusCircle className="size-5 md:size-6" />}
            sx={(theme) => ({
              px: "16px",
              py: "14px",
              width: "114px",
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
            onClick={() => setModalAddOpen(true)}
          >
            Utility
          </Button>
        </Box>
      </Box>

      <TableComponents
        columns={columns}
        rows={rows}
        page={page}
        rowsPerPage={limit}
        totalRows={total}
        totalPages={totalPages}
        hasActions={true}
        setPage={(val) => updateQueryParam("page", val)}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        onView={handleOpenViewModal}
        loading={loading}
      />
    </Box>
  );
};

export default UtilityManagementTable;
