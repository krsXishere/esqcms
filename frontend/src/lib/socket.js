// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

// Use explicit fallback so developer doesn't need to set env during quick dev
const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(URL, {
      transports: ["websocket"], // prioritaskan WS biar low-latency
      withCredentials: true,
      autoConnect: false, // biar kita kontrol connect/disconnect
      // auth: { token: "..." }, // kalau perlu JWT
    });

    // helpful debug logs for dev
    try {
      socket.on("connect", () => {
        // eslint-disable-next-line no-console
        console.info("getSocket: connected", socket.id, "to", URL);
      });
      socket.on("connect_error", (err) => {
        // eslint-disable-next-line no-console
        console.error("getSocket: connect_error", err);
      });
      socket.on("disconnect", (reason) => {
        // eslint-disable-next-line no-console
        console.info("getSocket: disconnected", reason);
      });
    } catch (e) {
      // ignore if socket isn't fully available yet
    }
  }
  return socket;
}
