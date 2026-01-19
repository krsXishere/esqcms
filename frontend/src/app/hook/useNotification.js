"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

/* ========== Utils umum ========== */
const asArray = (p) => (Array.isArray(p) ? p : p ? [p] : []);
const withType = (arr, type) =>
  Array.isArray(arr) ? arr.map((it) => ({ ...it, _type: type })) : [];

const dedupeByTypeId = (arr) => {
  const m = new Map();
  for (const it of arr) {
    if (!it || it.id == null) continue;
    const t = (it._type || it.type || it.source || "alarm").toLowerCase();
    m.set(`${t}:${it.id}`, { ...it, _type: t });
  }
  return Array.from(m.values());
};

// fetch semua device id user (paging)
async function fetchAllDeviceIds(apiBase) {
  const ids = [];
  let page = 1;
  const limit = 100;
  while (true) {
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const res = await fetch(`${apiBase}/devices?${qs.toString()}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch devices");
    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data : json;
    for (const d of data) if (d?.id != null) ids.push(d.id);
    const totalPages = json?.meta?.totalPages ?? page;
    if (page >= totalPages) break;
    page += 1;
  }
  return ids;
}

/* ========== localStorage helpers ========== */
const LS_PREFIX = "tns_notif";
const lsKeyAlarm = (adminId) =>
  `${LS_PREFIX}:${adminId ?? "anon"}:alarm_unread`;
const lsKeyEvent = (adminId) =>
  `${LS_PREFIX}:${adminId ?? "anon"}:event_unread`;

function loadSet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch (e) {
    console.error("Failed to load from localStorage:", key, e);
    return new Set();
  }
}

function saveSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error("Failed to save to localStorage:", key, e);
  }
}

/**
 * useNotifications – gabungan Alarm + Event (FE only) + persistence unread
 * - pageSize: tampilan awal
 * - apiBase: base URL BE
 * - areaId: filter alarms via REST (opsional)
 * - adminId: untuk join room event-{adminId} & namespace localStorage
 * - withEvents: aktifkan event (default true)
 */
export default function useNotifications({
  pageSize = 10,
  apiBase = process.env.NEXT_PUBLIC_API_URL,
  areaId = null,
  adminId = null,
  withEvents = true,
}) {
  /* ===== State alarm & event ===== */
  const [deviceIds, setDeviceIds] = useState([]);
  const [alarmItems, setAlarmItems] = useState([]);
  const [eventItems, setEventItems] = useState([]);

  const [alarmUnread, setAlarmUnread] = useState(new Set());
  const [eventUnread, setEventUnread] = useState(new Set());

  const [alarmLoading, setAlarmLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(withEvents);

  const [alarmHasMore, setAlarmHasMore] = useState(true);
  const [eventHasMore, setEventHasMore] = useState(true);

  // LIMIT dinamis untuk efek "Read more"
  const [alarmLimit, setAlarmLimit] = useState(pageSize);
  const [eventLimit, setEventLimit] = useState(pageSize);

  const connectedRef = useRef(false);
  const joinedRoomsRef = useRef(new Set());

  /* ===== STEP-0: muat unread dari localStorage (namespace adminId) ===== */
  useEffect(() => {
    // Muat ulang setiap kali adminId berubah (misal user ganti akun)
    const a = loadSet(lsKeyAlarm(adminId));
    const e = loadSet(lsKeyEvent(adminId));
    setAlarmUnread(a);
    setEventUnread(e);
  }, [adminId]);

  // Persist setiap ada perubahan set
  useEffect(() => {
    saveSet(lsKeyAlarm(adminId), alarmUnread);
  }, [alarmUnread, adminId]);

  useEffect(() => {
    saveSet(lsKeyEvent(adminId), eventUnread);
  }, [eventUnread, adminId]);

  /* ===== STEP-1: ambil semua device ids user ===== */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ids = await fetchAllDeviceIds(apiBase);
        if (!mounted) return;
        setDeviceIds(ids);
      } catch (e) {
        console.error(e);
        setDeviceIds([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [apiBase]);

  /* ===== REST fetchers (selalu sort terbaru) ===== */
  const fetchAlarmsPage1 = useCallback(
    async (limit) => {
      const qs = new URLSearchParams();
      qs.set("limit", String(limit));
      qs.set("page", "1");
      qs.set("sort", "activation_time:desc");
      if (areaId && areaId !== "All") qs.set("areaId", String(areaId));
      const res = await fetch(`${apiBase}/alarms?${qs.toString()}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch alarms");
      return res.json(); // { data, meta }
    },
    [apiBase, areaId]
  );

  const fetchEventsPage1 = useCallback(
    async (limit) => {
      if (!withEvents)
        return { data: [], meta: { total: 0, totalPages: 1, page: 1 } };
      const qs = new URLSearchParams();
      qs.set("limit", String(limit));
      qs.set("page", "1");
      qs.set("sort", "activation_time:desc");
      const res = await fetch(`${apiBase}/events?${qs.toString()}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json(); // { data, meta }
    },
    [apiBase, withEvents]
  );

  /* ===== STEP-2: initial fetch (page=1, limit=pageSize) ===== */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setAlarmLoading(true);
        const ja = await fetchAlarmsPage1(alarmLimit);
        if (!mounted) return;
        const list = withType(ja.data || [], "alarm");
        setAlarmItems(list);

        // Tentatif: prune unread agar hanya hitung ID yang ada di list saat ini
        const validIds = new Set(list.map((x) => x.id));
        setAlarmUnread(
          (prev) => new Set([...prev].filter((id) => validIds.has(id)))
        );

        const total = ja?.meta?.total ?? (ja.data?.length || 0);
        setAlarmHasMore(alarmLimit < total);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setAlarmLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // pertama kali saja (limit awal = pageSize)

  useEffect(() => {
    if (!withEvents) return;
    let mounted = true;
    (async () => {
      try {
        setEventLoading(true);
        const je = await fetchEventsPage1(eventLimit);
        if (!mounted) return;
        const list = withType(je.data || [], "event");
        setEventItems(list);

        const validIds = new Set(list.map((x) => x.id));
        setEventUnread(
          (prev) => new Set([...prev].filter((id) => validIds.has(id)))
        );

        const total = je?.meta?.total ?? (je.data?.length || 0);
        setEventHasMore(eventLimit < total);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setEventLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withEvents]); // pertama kali saja (limit awal = pageSize)

  /* ===== STEP-3: socket connect + join rooms + listeners ===== */
  useEffect(() => {
    if (!deviceIds || deviceIds.length === 0) return;
    const socket = getSocket();

    if (!connectedRef.current) {
      socket.connect();
      connectedRef.current = true;
    }

    // join alarm rooms
    deviceIds.forEach((id) => {
      const room = `alarm-${id}`;
      if (!joinedRoomsRef.current.has(room)) {
        socket.emit("join-room", room);
        joinedRoomsRef.current.add(room);
      }
    });

    // join event room
    if (withEvents && adminId != null) {
      const eventRoom = `event-${adminId}`;
      if (!joinedRoomsRef.current.has(eventRoom)) {
        socket.emit("join-room", eventRoom);
        joinedRoomsRef.current.add(eventRoom);
      }
    }

    const onNewAlarm = (payload) => {
      const arr = withType(
        asArray(payload).filter(
          (a) => a?.device_id && deviceIds.includes(a.device_id)
        ),
        "alarm"
      );
      if (!arr.length) return;

      setAlarmItems((prev) =>
        dedupeByTypeId([...arr, ...prev]).slice(
          0,
          Math.max(alarmLimit, pageSize)
        )
      );
      setAlarmUnread((prev) => {
        const s = new Set(prev);
        for (const a of arr) if (a?.id != null) s.add(a.id);
        return s;
      });
    };

    const onNewEvent = (payload) => {
      if (!withEvents) return;
      const arr = withType(asArray(payload), "event");
      if (!arr.length) return;

      setEventItems((prev) =>
        dedupeByTypeId([...arr, ...prev]).slice(
          0,
          Math.max(eventLimit, pageSize)
        )
      );
      setEventUnread((prev) => {
        const s = new Set(prev);
        for (const e of arr) if (e?.id != null) s.add(e.id);
        return s;
      });
    };

    socket.on("new-alarm", onNewAlarm);
    socket.on("new-event", onNewEvent);

    return () => {
      socket.off("new-alarm", onNewAlarm);
      socket.off("new-event", onNewEvent);
    };
  }, [deviceIds, withEvents, adminId, alarmLimit, eventLimit, pageSize]);

  /* ===== READ MORE (limit dinamis + refetch page=1) ===== */
  const loadMore = useCallback(async () => {
    // tambah 10 untuk masing-masing sumber, lalu refetch page=1
    const nextAlarmLimit = alarmLimit + 10;
    const nextEventLimit = withEvents ? eventLimit + 10 : eventLimit;

    setAlarmLimit(nextAlarmLimit);
    if (withEvents) setEventLimit(nextEventLimit);

    const [ja, je] = await Promise.all([
      fetchAlarmsPage1(nextAlarmLimit),
      withEvents
        ? fetchEventsPage1(nextEventLimit)
        : Promise.resolve({ data: [], meta: { total: 0 } }),
    ]);

    const newAlarms = withType(ja.data || [], "alarm");
    setAlarmItems(newAlarms);
    const totalA = ja?.meta?.total ?? (ja.data?.length || 0);
    setAlarmHasMore(nextAlarmLimit < totalA);

    // Prune unread agar hanya menghitung yang tampil setelah loadMore
    const validA = new Set(newAlarms.map((x) => x.id));
    setAlarmUnread((prev) => new Set([...prev].filter((id) => validA.has(id))));

    if (withEvents) {
      const newEvents = withType(je.data || [], "event");
      setEventItems(newEvents);
      const totalE = je?.meta?.total ?? (je.data?.length || 0);
      setEventHasMore(nextEventLimit < totalE);

      const validE = new Set(newEvents.map((x) => x.id));
      setEventUnread(
        (prev) => new Set([...prev].filter((id) => validE.has(id)))
      );
    }
  }, [alarmLimit, eventLimit, withEvents, fetchAlarmsPage1, fetchEventsPage1]);

  /* ===== READ controls ===== */
  const markAllAsRead = useCallback(() => {
    setAlarmUnread(new Set());
    setEventUnread(new Set());
  }, []);

  const markRead = useCallback((id) => {
    setAlarmUnread((prev) => {
      if (!prev.has(id)) return prev;
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
    setEventUnread((prev) => {
      if (!prev.has(id)) return prev;
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
  }, []);

  /* ===== Gabungan final untuk Navbar ===== */
  const items = useMemo(() => {
    const merged = dedupeByTypeId([...alarmItems, ...eventItems])
      .map((it) => ({
        ...it,
        _unread:
          (it._type === "alarm" ? alarmUnread.has(it.id) : false) ||
          (it._type === "event" ? eventUnread.has(it.id) : false),
      }))
      .sort((a, b) => {
        const ta = a.activation_time
          ? new Date(a.activation_time).getTime()
          : 0;
        const tb = b.activation_time
          ? new Date(b.activation_time).getTime()
          : 0;
        return tb - ta; // terbaru dulu
      });
    // Tampilan maksimal mengikuti max(current limits) tapi minimal pageSize
    const maxShow = Math.max(alarmLimit, eventLimit, pageSize);
    return merged.slice(0, maxShow);
  }, [
    alarmItems,
    eventItems,
    alarmUnread,
    eventUnread,
    alarmLimit,
    eventLimit,
    pageSize,
  ]);

  // Hitung unread hanya dari item yang sedang ditampilkan (lebih akurat)
  const unreadCount = useMemo(
    () => items.reduce((acc, it) => acc + (it._unread ? 1 : 0), 0),
    [items]
  );

  const loading = alarmLoading || (withEvents && eventLoading);
  const hasMore = alarmHasMore || (withEvents && eventHasMore);

  return {
    items,
    loading,
    unreadCount,
    hasMore,
    loadMore,
    markAllAsRead,
    markRead,
  };
}
