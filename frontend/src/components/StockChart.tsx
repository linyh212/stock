import { useEffect, useRef } from "react";
import {
  createChart,
  type CandlestickData,
  type Time,
} from "lightweight-charts";
import { subscribe } from "../ws";
import type { Tick } from "../types";

export default function StockChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#0b0f19" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
    });
    const candleSeries = chart.addCandlestickSeries();
    const candles: CandlestickData<Time>[] = [];
    let currentCandle: CandlestickData<Time> | null = null;
    const unsubscribe = subscribe("tick", (tick: Tick) => {
      const price = tick.price;
      const time = Math.floor(tick.timestamp / 1000) as Time;
      if (!currentCandle) {
        currentCandle = {
          time,
          open: price,
          high: price,
          low: price,
          close: price,
        };
        candles.push(currentCandle);
        candleSeries.setData(candles);
        return;
      }
      if (currentCandle.time === time) {
        currentCandle.high = Math.max(currentCandle.high, price);
        currentCandle.low = Math.min(currentCandle.low, price);
        currentCandle.close = price;
        candleSeries.update(currentCandle);
      } else {
        currentCandle = {
          time,
          open: price,
          high: price,
          low: price,
          close: price,
        };
        candles.push(currentCandle);
        if (candles.length > 200)
          candles.shift();
        candleSeries.setData(candles);
      }
    });
    const resize = () => {
      chart.applyOptions({
        width: ref.current?.clientWidth,
      });
    };
    window.addEventListener("resize", resize);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  }, []);
  return <div ref={ref} style={{ width: "100%", height: "400px" }} />;
}
