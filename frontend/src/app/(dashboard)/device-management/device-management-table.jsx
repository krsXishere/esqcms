"use client";
import { Button, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import InputSearch from "@/components/common/input-search";
import SelectOption from "@/components/common/select-option";
import TableComponents from "@/components/common/table-component";
import ModalDeleteData from "@/components/common/modal-delete-data";
import ModalAddDevice from "./modal-add-device";
import ModalEditDevice from "./modal-edit-device";
import { useRouter, useSearchParams } from "next/navigation";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useDebounce } from "use-debounce";

const DeviceManagementTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const { sendRequest, loading } = useFetchApi();

  const [status, setStatus] = useState(searchParams.get("status") || "All");
  const [area, setArea] = useState(searchParams.get("area") || "All");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedValue] = useDebounce(search, 500);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAddDeviceOpen, setModalAddDeviceOpen] = useState(false);
  const [modalEditDeviceOpen, setModalEditDeviceOpen] = useState(false);
  const [id, setId] = useState("");

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [statusSelect, setStatusSelect] = useState([]);
  const [areaSelect, setAreaSelect] = useState([]);

  const handleOpenDeleteModal = (id) => {
    setModalOpen(true);
    setId(id);
  };

  const handleOpenEditModal = (id) => {
    setModalEditDeviceOpen(true);
    setId(id);
  };
  const columns = [
    { title: "DEVICE NAME", field: "name" },
    { title: "CATEGORY", field: "category.name" },
    { title: "SERIAL NUMBER", field: "serial_number" },
    { title: "DATE ACTIVATION", field: "area.date_activation" },
    { title: "STATUS", field: "status.name" },
    { title: "ASSIGNED AREA", field: "area.name" },
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

  const fetchDevices = async () => {
    const params = { page, limit };
    const areaParam = searchParams.get("area_id");
    const sortParam = searchParams.get("sort");
    const statusParam = searchParams.get("status_id");
    const searchParam = searchParams.get("search");

    if (areaParam) params.area_id = areaParam;
    if (sortParam) params.sort = sortParam;
    if (searchParam) params.search = searchParam;
    if (statusParam) params.status_id = statusParam;

    const result = await sendRequest({ url: "/devices", params });

    setRows(result?.data);
    setTotal(result?.meta?.total);
    setTotalPages(result?.meta?.totalPages);
    setLimit(result?.limit || 10);
  };
  useEffect(() => {
    updateQueryParam("search", debouncedValue);
  }, [debouncedValue]);
  useEffect(() => {
    fetchDevices();
  }, [searchParams]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [areaResult, statusResult] = await Promise.all([
          sendRequest({ url: "/areas" }),
          sendRequest({ url: "/status" }),
        ]);

        const areaFormatted = [
          { title: "All", value: "All" },
          ...areaResult?.data?.map((area) => ({
            title: area.name,
            value: area.id,
          })),
        ];
        setAreaSelect(areaFormatted);

        const statusFormatted = [
          { title: "All", value: "All" },
          ...statusResult?.map((status) => ({
            title: status.name,
            value: status.id,
          })),
        ];
        setStatusSelect(statusFormatted);
      } catch (error) {
        console.error("Gagal mengambil filter area/status:", error);
      }
    };

    fetchFilters();
  }, []);
  return (
    <Box>
      <ModalAddDevice
        open={modalAddDeviceOpen}
        setOpen={setModalAddDeviceOpen}
        onSuccessAdd={fetchDevices}
      />
      <ModalDeleteData
        open={modalOpen}
        id={id}
        setOpen={setModalOpen}
        endpoint={"devices"}
        onSuccessDelete={fetchDevices}
      />
      <ModalEditDevice
        onSuccessEdit={fetchDevices}
        endpoint={"devices"}
        open={modalEditDeviceOpen}
        id={id}
        setOpen={setModalEditDeviceOpen}
      />
      {/* filter */}
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
            selectMenus={statusSelect}
            setValue={(val) => {
              setStatus(val);
              updateQueryParam("status_id", val);
            }}
            title={"Status"}
            value={status}
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
            onClick={() => setModalAddDeviceOpen(true)}
          >
            Device
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
        loading={loading}
      />
    </Box>
  );
};

export default DeviceManagementTable;
