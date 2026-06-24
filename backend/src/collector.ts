import { createFugleWS, FugleTickData } from "./fugleClient";
import { updateKline } from "./klineBuilder";
import { Tick } from "./types";
import { broadcast } from "./ws";

const latestTicks = new Map<string, Tick>();

function normalizeTime(t: number): number {
  if (t > 1e17) return Math.floor(t / 1_000_000);
  if (t > 1e14) return Math.floor(t / 1_000);
  if (t > 1e11) return Math.floor(t);
  return Math.floor(t * 1000);
}

export function startCollector() {
  createFugleWS("2330", (tick: FugleTickData) => {
    console.log("[FUGLE TICK]", tick);
    const normalized: Tick = {
      symbol: tick.symbol,
      price: tick.price,
      volume: tick.volume,
      timestamp: normalizeTime(tick.time),
    };
    handleTick(normalized);
  });
}

export function handleTick(tick: Tick) {
  latestTicks.set(tick.symbol, tick);
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

export function getLatestTick(symbol: string) {
  return latestTicks.get(symbol) || null;
}
