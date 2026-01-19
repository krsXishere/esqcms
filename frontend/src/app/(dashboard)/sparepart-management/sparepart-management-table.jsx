"use client";
import { Button, Box, Chip, Switch } from "@mui/material";
import { useState, useEffect } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import InputSearch from "@/components/common/input-search";
import SelectOption from "@/components/common/select-option";
import TableComponents from "@/components/common/table-component";
import ModalDeleteData from "@/components/common/modal-delete-data";
import ModalAddSparepart from "./modal-add-sparepart";
import ModalEditSparepart from "./modal-edit-sparepart";
import ModalDetailSparepart from "./modal-detail-sparepart";
import { useRouter, useSearchParams } from "next/navigation";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useDebounce } from "use-debounce";
import { useSnackbar } from "notistack";

const CATEGORIES = [
  { title: "All", value: "All" },
  { title: "Mechanical", value: "Mechanical" },
  { title: "Electrical", value: "Electrical" },
  { title: "Sensor", value: "Sensor" },
  { title: "Pneumatic", value: "Pneumatic" },
  { title: "Automation", value: "Automation" },
  { title: "Consumable", value: "Consumable" },
  { title: "Safety", value: "Safety" },
];

const SparepartManagementTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const { enqueueSnackbar } = useSnackbar();

  const { sendRequest, loading } = useFetchApi();

  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [area, setArea] = useState(searchParams.get("area") || "All");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedValue] = useDebounce(search, 500);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDetailOpen, setModalDetailOpen] = useState(false);
  const [id, setId] = useState("");

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [areaSelect, setAreaSelect] = useState([]);

  const handleOpenDeleteModal = (id) => {
    setModalOpen(true);
    setId(id);
  };

  const handleOpenEditModal = (id) => {
    setModalEditOpen(true);
    setId(id);
  };

  const handleOpenDetailModal = (id) => {
    setModalDetailOpen(true);
    setId(id);
  };

  const handleStatusChange = async (sparepartId, currentStatus) => {
    try {
      const result = await sendRequest({
        url: `/spareparts/${sparepartId}`,
        method: "PATCH",
        data: { status: !currentStatus },
      });
      if (result?.success) {
        enqueueSnackbar("Status updated successfully", { variant: "success" });
        fetchSpareparts();
      }
    } catch (error) {
      enqueueSnackbar("Failed to update status", { variant: "error" });
    }
  };

  // Get stock status color
  const getStockStatusColor = (stockValue, safetyStock) => {
    if (stockValue < safetyStock) return "#ef4444"; // Red
    if (stockValue === safetyStock) return "#f59e0b"; // Orange
    return "#22c55e"; // Green
  };

  const getStockStatusLabel = (stockValue, safetyStock) => {
    if (stockValue < safetyStock) return "Low";
    if (stockValue === safetyStock) return "Warning";
    return "Good";
  };

  const columns = [
    { title: "SPAREPART NUMBER", field: "material_number" },
    { title: "CATEGORY", field: "category" },
    { title: "SPAREPART NAME", field: "name" },
    { title: "STOCK VALUE", field: "stock_value" },
    { title: "UNIT", field: "unit" },
    { title: "SUPPLIER", field: "supplier" },
    { title: "SAFETY STOCK", field: "safety_stock" },
    { 
      title: "STATUS", 
      field: "status",
      render: (row) => {
        const color = getStockStatusColor(row.stock_value || 0, row.safety_stock || 0);
        const label = getStockStatusLabel(row.stock_value || 0, row.safety_stock || 0);
        return (
          <Chip
            label={label}
            size="small"
            sx={{
              backgroundColor: color,
              color: "#fff",
              fontWeight: 600,
              fontSize: "11px",
            }}
          />
        );
      }
    },
    { title: "AREA", field: "area.name" },
  ];

  const sortSelect = [
    { title: "Name A to Z", value: "name:asc" },
    { title: "Name Z to A", value: "name:desc" },
    { title: "Stock Low to High", value: "stock_value:asc" },
    { title: "Stock High to Low", value: "stock_value:desc" },
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

  const fetchSpareparts = async () => {
    const params = { page, limit };
    const areaParam = searchParams.get("area_id");
    const sortParam = searchParams.get("sort");
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");

    if (areaParam) params.area_id = areaParam;
    if (sortParam) params.sort = sortParam;
    if (searchParam) params.search = searchParam;
    if (categoryParam && categoryParam !== "All") params.category = categoryParam;

    const result = await sendRequest({ url: "/spareparts", params });

    if (result?.success) {
      setRows(result?.data || []);
      setTotal(result?.meta?.total || 0);
      setTotalPages(result?.meta?.totalPages || 1);
      setLimit(result?.meta?.limit || 10);
    } else {
      // If API doesn't exist yet, try to get from work orders history
      await fetchFromWorkOrderHistory();
    }
  };

  // Fallback: fetch spareparts from work order history
  const fetchFromWorkOrderHistory = async () => {
    try {
      const result = await sendRequest({ url: "/work-orders", params: { status: "completed", limit: 100 } });
      if (result?.success && result?.data) {
        const sparepartMap = new Map();
        let counter = 1;
        
        result.data.forEach((wo) => {
          if (wo.sparepart_details) {
            try {
              const parts = JSON.parse(wo.sparepart_details);
              if (Array.isArray(parts)) {
                parts.forEach((part) => {
                  if (part.name && !sparepartMap.has(part.name.toLowerCase())) {
                    sparepartMap.set(part.name.toLowerCase(), {
                      id: `temp-${counter}`,
                      material_number: `M-${String(counter).padStart(3, '0')}`,
                      name: part.name,
                      category: "Uncategorized",
                      stock_value: 0,
                      unit: "pcs",
                      unit_price: part.unit_price || 0,
                      supplier: "-",
                      safety_stock: 0,
                      status: true,
                      area: wo.area || null,
                    });
                    counter++;
                  }
                });
              }
            } catch (e) {
              // Not JSON format, skip
            }
          }
        });
        
        const sparepartList = Array.from(sparepartMap.values());
        
        // Apply search filter
        const searchParam = searchParams.get("search")?.toLowerCase();
        const filteredList = searchParam 
          ? sparepartList.filter(s => s.name.toLowerCase().includes(searchParam))
          : sparepartList;
        
        setRows(filteredList);
        setTotal(filteredList.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch spareparts from work orders:", error);
      setRows([]);
    }
  };

  useEffect(() => {
    updateQueryParam("search", debouncedValue);
  }, [debouncedValue]);

  useEffect(() => {
    fetchSpareparts();
  }, [searchParams]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const areaResult = await sendRequest({ url: "/areas" });

        const areaFormatted = [
          { title: "All", value: "All" },
          ...(areaResult?.data?.map((area) => ({
            title: area.name,
            value: area.id,
          })) || []),
        ];
        setAreaSelect(areaFormatted);
      } catch (error) {
        console.error("Failed to fetch area filter:", error);
      }
    };

    fetchFilters();
  }, []);

  return (
    <Box>
      <ModalAddSparepart
        open={modalAddOpen}
        setOpen={setModalAddOpen}
        onSuccessAdd={fetchSpareparts}
      />
      <ModalDeleteData
        open={modalOpen}
        id={id}
        setOpen={setModalOpen}
        endpoint={"spareparts"}
        onSuccessDelete={fetchSpareparts}
      />
      <ModalEditSparepart
        onSuccessEdit={fetchSpareparts}
        open={modalEditOpen}
        id={id}
        setOpen={setModalEditOpen}
      />
      <ModalDetailSparepart
        open={modalDetailOpen}
        setOpen={setModalDetailOpen}
        sparepartId={id}
        onUpdate={fetchSpareparts}
      />
      
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
          })}
        >
          <SelectOption
            selectMenus={CATEGORIES}
            setValue={(val) => {
              setCategory(val);
              updateQueryParam("category", val);
            }}
            title={"Category"}
            value={category}
            width={"25%"}
          />
          <SelectOption
            selectMenus={areaSelect}
            setValue={(val) => {
              setArea(val);
              updateQueryParam("area_id", val);
            }}
            title={"Area"}
            value={area}
            width={"25%"}
          />
          <SelectOption
            selectMenus={sortSelect}
            setValue={(val) => {
              setSort(val);
              updateQueryParam("sort", val);
            }}
            title={"Sort"}
            value={sort}
            width={"25%"}
          />

          <Button
            variant="contained"
            startIcon={<AiFillPlusCircle className="size-5 md:size-6" />}
            sx={(theme) => ({
              px: "16px",
              py: "14px",
              width: "150px",
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
            Sparepart
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
        onDetail={handleOpenDetailModal}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        loading={loading}
      />
    </Box>
  );
};

export default SparepartManagementTable;
