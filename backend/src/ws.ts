import { SocketStream } from "@fastify/websocket";
import { WebSocket } from "ws";
import { WSMessage } from "./types";

let clients: WebSocket[] = [];

export function registerWS(connection: SocketStream) {
  const socket = connection.socket;
  clients.push(socket);
  console.log("[WS] client connected");
  socket.on("close", () => {
    clients = clients.filter((c) => c !== socket);
  });
}

export function broadcast(data: WSMessage) {
  const msg = JSON.stringify(data);
  clients.forEach((c) => {
    if (c.readyState === 1) {
      c.send(msg);
    }
  });
}