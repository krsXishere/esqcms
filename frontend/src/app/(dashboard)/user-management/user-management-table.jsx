"use client";
import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import InputSearch from "@/components/common/input-search";
import SelectOption from "@/components/common/select-option";
import TableComponents from "@/components/common/table-component";
import ModalDeleteData from "@/components/common/modal-delete-data";
import ModalAddUser from "./modal-add-user";
import ModalEditUser from "./modal-edit-user";
import { useFetchApi } from "@/app/hook/useFetchApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";

const UserManagementTable = ({ setRefreshTrigger }) => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const [role, setRole] = useState(searchParams.get("role_id") || "All");
  const [sort, setSort] = useState(searchParams.get("sort") || "Name A to Z");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedValue] = useDebounce(search, 500);

  const [id, setId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAddUserOpen, setModalAddUserOpen] = useState(false);
  const [modalEditUserOpen, setModalEditUserOpen] = useState(false);
  const [roleSelect, setRoleSelect] = useState([]);

  const handleOpenDeleteModal = (id) => {
    setModalOpen(true);
    setId(id);
  };
  const handleOpenEditModal = (id) => {
    setModalEditUserOpen(true);
    setId(id);
  };

  const columns = [
    { title: "Username", field: "username" },
    { title: "Name", field: "name" },
    { title: "Email", field: "email" },
    { title: "Phone", field: "phone_number" },
    { title: "Role", field: "role.name" },
  ];

  const sortSelect = [
    { title: "Name A to Z", value: "name:asc" },
    { title: "Name Z to A", value: "name:desc" },
  ];

  const { sendRequest, data, loading } = useFetchApi();

  const updateQueryParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "All") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const fetchUsers = async () => {
    const params = { page, limit };
    const roleParam = searchParams.get("role_id");
    const sortParam = searchParams.get("sort");
    const searchParam = searchParams.get("search");

    if (roleParam && roleParam !== "All") params.role_id = roleParam;
    if (sortParam) params.sort = sortParam;
    if (searchParam) params.search = searchParam;

    const result = await sendRequest({ url: "/users", params });
    const users = result.data;

    setRows(users);
    setTotal(result?.meta?.total || 0);
    setTotalPages(result?.meta?.totalPages || 1);
    setLimit(result?.meta?.limit || 10);
  };

  useEffect(() => {
    updateQueryParam("search", debouncedValue);
  }, [debouncedValue]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await sendRequest({ url: "/roles" });

      const formatted = [
        { title: "All", value: "All" },
        ...result?.map((role) => ({
          title: role.name,
          value: role.id,
        })),
      ];
      setRoleSelect(formatted);
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [searchParams, page]);
  return (
    <Box>
      <ModalDeleteData
        setOpen={setModalOpen}
        open={modalOpen}
        id={id}
        endpoint={"users"}
        onSuccessDelete={() => {
          fetchUsers();
          setRefreshTrigger((prev) => !prev);
        }}
      />
      <ModalEditUser
        setOpen={setModalEditUserOpen}
        open={modalEditUserOpen}
        id={id}
        onSuccessEdit={() => {
          fetchUsers();
          setRefreshTrigger((prev) => !prev);
        }}
      />
      <ModalAddUser
        open={modalAddUserOpen}
        setOpen={setModalAddUserOpen}
        onSuccessAdd={() => {
          fetchUsers();
          setRefreshTrigger((prev) => !prev);
        }}
      />
      {/* filter */}
      <Box
        sx={(theme) => ({
          display: "flex",
          gap: "8px",
          mb: "16px",
          alignItems: "start",
          // justifyContent: "space-between",

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
              justifyContent: "space-between",
            },
            [theme.breakpoints.up("sm")]: {
              gap: 1,
            },
            [theme.breakpoints.up("lg")]: {},
          })}
        >
          <SelectOption
            selectMenus={roleSelect}
            setValue={(val) => {
              setRole(val);
              updateQueryParam("role_id", val);
            }}
            title={"Role"}
            value={role}
            width={"45%"}
          />
          <SelectOption
            selectMenus={sortSelect}
            setValue={(val) => {
              setSort(val);
              updateQueryParam("sort", val);
            }}
            title={"Sort"}
            value={sort}
            width={"45%"}
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
            onClick={() => setModalAddUserOpen(true)}
          >
            User
          </Button>
        </Box>
      </Box>

      {/* Table */}
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
        hasActions={true}
        loading={loading}
      />
    </Box>
  );
};

export default UserManagementTable;
