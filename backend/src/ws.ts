import { SocketStream } from "@fastify/websocket";
import { WebSocket } from "ws";
import { WSMessage } from "./types";

const clients = new Set<WebSocket>();

export function registerWS(connection: SocketStream) {
  const socket = connection.socket;
  clients.add(socket);
  console.log("[WS] client connected, total:", clients.size);
  socket.on("close", () => {
    clients.delete(socket);
    console.log("[WS] client disconnected, total:", clients.size);
  });
}

export function broadcast(data: WSMessage) {
  const msg = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN)
      client.send(msg);
  });
}
