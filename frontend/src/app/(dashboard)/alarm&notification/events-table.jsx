// app/(routes)/alarm&notification/events-table.jsx
"use client";
import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import TableComponents from "@/components/common/table-component";
import { useFetchApi } from "@/app/hook/useFetchApi";
import useUrlFilters from "./useUrlFilters";

const EventsTable = () => {
  const { area, device } = useUrlFilters();
  const { sendRequest } = useFetchApi();

  // Stabilkan sendRequest agar tidak memicu efek berulang
  const sendRef = useRef(sendRequest);
  useEffect(() => {
    sendRef.current = sendRequest;
  }, [sendRequest]);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [rows, setRows] = useState([]);

  const columns = [
    { title: "DESCRIPTION", field: "description" },
    { title: "ACTIVATION TIME", field: "activation_time" },
  ];

  // Reset ke halaman 1 ketika filter URL berubah
  useEffect(() => {
    setPage(1);
  }, [area, device]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const params = { page, limit };
      if (area !== "") params.area_id = area;
      if (device !== "") params.device_id = device;

      try {
        const result = await sendRef.current({ url: "/events", params });
        if (!alive) return;

        const list = result?.data ?? result ?? [];
        setRows(list);

        const metaTotal = result?.meta?.total ?? 0;
        const metaPages = result?.meta?.totalPages ?? 1;
        const metaLimit = result?.meta?.limit ?? limit;

        // Hindari setState bila tidak berubah (mengurangi rerender)
        if (metaTotal !== total) setTotal(metaTotal);
        if (metaPages !== totalPages) setTotalPages(metaPages);
        if (metaLimit !== limit) setLimit(metaLimit);
      } catch (e) {
        if (!alive) return;
        console.error("fetch /events gagal:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [page, limit, area, device]); // <- tidak pakai [fetchEvents]

  return (
    <Box>
      <TableComponents
        columns={columns}
        rows={rows}
        page={page}
        setPage={setPage}
        hasActions={false}
        rowsPerPage={10}
        title={"Events"}
        totalPages={totalPages}
        totalRows={total}
      />
    </Box>
  );
};

export default EventsTable;
