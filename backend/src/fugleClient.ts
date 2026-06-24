import WebSocket from "ws";

export interface FugleTickData {
  symbol: string;
  price: number;
  volume: number;
  time: number;
}

export function createFugleWS(
  symbol: string,
  onTick: (tick: FugleTickData) => void
) {
  const token = process.env.FUGLE_API_TOKEN;
  if (!token)
    throw new Error("FUGLE_API_TOKEN missing");
  const url = "wss://api.fugle.tw/marketdata/v1.0/stock/streaming";
  console.log(`[FUGLE] Connecting: ${url}`);
  const ws = new WebSocket(url);
  let authed = false;
  ws.on("open", () => {
    console.log("[FUGLE] connected");
    ws.send(
      JSON.stringify({
        event: "auth",
        data: {
          apikey: token,
        },
      })
    );
  });
  ws.on("message", (raw: any) => {
    const msg = JSON.parse(raw.toString());
    console.log("[FUGLE RAW]", msg);
    if (msg.event === "authenticated") {
      authed = true;
      ws.send(
        JSON.stringify({
          event: "subscribe",
          data: {
            channel: "trades",
            symbol,
          },
        })
      );
    }
    if ((msg.event === "data" || msg.event === "snapshot") && msg.data) {
      const tick: FugleTickData = {
        symbol: msg.data.symbol,
        price: msg.data.price,
        volume: msg.data.size ?? msg.data.volume ?? 0,
        time: msg.data.time,
      };
      onTick(tick);
    }
    if (msg.event === "error")
      console.error("[FUGLE API ERROR]", msg);
  });
  ws.on("error", (err) => {
    console.error("[FUGLE WS ERROR]", err.message);
  });
  ws.on("close", () => {
    console.log("[FUGLE] disconnected, retrying...");
    setTimeout(() => createFugleWS(symbol, onTick), 3000);
  });
  return ws;
}
