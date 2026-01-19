"use client";
import { Box, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import InputSearch from "@/components/common/input-search";
import SelectOption from "@/components/common/select-option";
import TableComponents from "@/components/common/table-component";
import ModalDeleteData from "@/components/common/modal-delete-data";
import ModalAddArea from "./modal-add-area";
import { useRouter, useSearchParams } from "next/navigation";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useDebounce } from "use-debounce";
import ModalEditArea from "./modal-edit-area";

const AreaManagementTable = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [roleLogin, setRoleLogin] = useState();

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const [statusArea, setStatusArea] = useState(
    searchParams.get("status_id") || ""
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "Name A to Z");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusSelect, setStatusSelect] = useState([]);

  const [debouncedValue] = useDebounce(search, 500);

  const { sendRequest, loading } = useFetchApi();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenAddArea, setModalOpenAddArea] = useState(false);
  const [modalOpenEditArea, setModalOpenEditArea] = useState(false);

  const [id, setId] = useState("");

  const handleOpenDeleteModal = (id) => {
    setModalOpen(true);
    setId(id);
  };

  const handleOpenEditModal = (id) => {
    setModalOpenEditArea(true);
    setId(id);
  };

  const columns = [
    { title: "AREA NAME", field: "name" },
    {
      title: "AREA LOCATION",
      field: (row) =>
        row.latitude && row.longitude
          ? `${row.latitude}, ${row.longitude}`
          : "-",
    },
    { title: "STATUS", field: "status.name" },
    { title: "DATE ACTIVATION", field: "date_activation" },
    { title: "ADMIN", field: "user.name" },
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

  const sortSelect = [
    { title: "Name A to Z", value: "name:asc" },
    { title: "Name Z to A", value: "name:desc" },
  ];

  const fetchArea = async () => {
    const params = { page, limit };
    const statusParam = searchParams.get("status_id");
    const sortParam = searchParams.get("sort");
    const searchParam = searchParams.get("search");

    if (statusParam) params.status_id = statusParam;
    if (sortParam) params.sort = sortParam;
    if (searchParam) params.search = searchParam;

    const result = await sendRequest({ url: "/areas", params });
    setRows(result?.data);
    setTotal(result?.meta?.total || 0);
    setTotalPages(result?.meta?.totalPages || 1);
    setLimit(result?.meta?.limit || 10);
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await sendRequest({ url: "/area-status" });
      const formatted = [
        { title: "All", value: "All" },
        ...result?.map((areaStatus) => ({
          title: areaStatus?.name,
          value: areaStatus?.id,
        })),
      ];
      setStatusSelect(formatted);
    };

    fetchData();
  }, []);

  // Trigger update query param saat debounce selesai
  useEffect(() => {
    updateQueryParam("search", debouncedValue);
  }, [debouncedValue]);

  // Fetch data setiap kali query param berubah
  useEffect(() => {
    fetchArea();
  }, [searchParams, page]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setRoleLogin(role);
  }, []);

  return (
    <Box>
      <ModalDeleteData
        open={modalOpen}
        id={id}
        endpoint={"areas"}
        setOpen={setModalOpen}
        onSuccessDelete={fetchArea}
      />
      <ModalAddArea
        open={modalOpenAddArea}
        setOpen={setModalOpenAddArea}
        onSuccessAdd={fetchArea}
      />
      <ModalEditArea
        open={modalOpenEditArea}
        setOpen={setModalOpenEditArea}
        onSuccessEdit={fetchArea}
        id={id}
      />

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
              setStatusArea(val);
              updateQueryParam("status_id", val);
            }}
            value={statusArea}
            title={"Status"}
            width={"45%"}
          />
          <SelectOption
            selectMenus={sortSelect}
            setValue={(val) => {
              setSort(val);
              updateQueryParam("sort", val);
            }}
            value={sort}
            title={"Sort"}
            width={"45%"}
          />
          {roleLogin == "Super Admin" && (
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
              onClick={() => setModalOpenAddArea(true)}
            >
              Area
            </Button>
          )}
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
        hasActions={roleLogin === "Super Admin"}
        loading={loading}
      />
    </Box>
  );
};

export default AreaManagementTable;
