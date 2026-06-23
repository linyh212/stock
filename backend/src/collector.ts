import { createFugleWS } from "./fugleClient";

type PublishFn = (data: {
  symbol: string;
  price: number;
  volume: number;
  time: number;
}) => void;

export function startCollector(publish: PublishFn) {
  createFugleWS("2330", (tick: any) => {
    console.log("[FUGLE TICK]", tick);
    publish({
      symbol: tick.symbol,
      price: tick.price,
      volume: tick.volume,
      time: Date.now(),
    });
  });
}