import { SocketStream } from "@fastify/websocket";
import { WebSocket } from "ws";
import { WSMessage } from "./types";

let clients: WebSocket[] = [];

export function registerWS(connection: SocketStream) {
  const socket = connection.socket;
  clients.push(socket);
  console.log("[WS] client connected, total:", clients.length);
  socket.on("close", () => {
    clients = clients.filter((c) => c !== socket);
    console.log("[WS] client disconnected, total:", clients.length);
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

export function addClient(ws: any) {
  clients.push(ws);
  console.log("[WS] client connected, total =", clients.length);
}