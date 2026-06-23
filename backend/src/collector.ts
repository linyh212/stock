import { createFugleWS, FugleTickData } from "./fugleClient";
import { updateKline } from "./klineBuilder";
import { Tick } from "./types";
import { broadcast } from "./ws";

export function startCollector() {
  createFugleWS("2330", (tick: FugleTickData) => {
    console.log("[FUGLE TICK]", tick);
    const normalized: Tick = {
      symbol: tick.symbol,
      price: tick.price,
      volume: tick.volume,
      timestamp: Math.floor(tick.time / 1000),
    };
    handleTick(normalized);
  });
}

export function handleTick(tick: Tick) {
  const candle = updateKline(tick);
  broadcast({
    type: "tick",
    data: tick,
  });
  broadcast({
    type: "candle",
    data: {
      ...candle,
      time: Math.floor(candle.time / 1000),
    },
  });
}