import WebSocket from "ws";
const URL = "wss://api.fugle.tw/marketdata/v1.0/stock/streaming";

export function createFugleWS(
  symbol: string,
  onTick: (data: any) => void
) {
  const ws = new WebSocket(URL);
  ws.on("open", () => {
    ws.send(
      JSON.stringify({
        event: "auth",
        data: {
          apikey: process.env.FUGLE_API_KEY,
        },
      })
    );
  });
  ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());
    console.log("[FUGLE RAW]", msg);
    if (msg.event === "authenticated") {
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
    if ( msg.event === "snapshot" || msg.event === "data" ) {
      onTick({
        symbol: msg.data.symbol,
        price: msg.data.price,
        volume: msg.data.volume,
        timestamp: msg.data.time,
      });
    }
  });
  ws.on("error", console.error);
  return ws;
}