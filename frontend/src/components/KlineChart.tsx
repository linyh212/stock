import {
  createChart,
  CandlestickSeries,
  type CandlestickData,
  type Time,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import { getApiUrl } from "../config";
import { subscribe } from "../ws";
import type { Candle } from "../types";

const normalizeCandle = (candle: Candle): CandlestickData<Time> => ({
  time: Math.floor(candle.time / 1000) as Time,
  open: Number(candle.open),
  high: Number(candle.high),
  low: Number(candle.low),
  close: Number(candle.close),
});

export default function KlineChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const container = ref.current;
    const chart: IChartApi = createChart(container, {
      width: container.clientWidth,
      height: 700,
      layout: {
        background: { color: "#0b0f14" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "#111827" },
        horzLines: { color: "#111827" },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
      crosshair: {
        mode: 1,
      },
    });
    const candleSeries: ISeriesApi<"Candlestick"> = chart.addSeries(CandlestickSeries);
    const loadHistory = async () => {
      try {
        const response = await fetch(getApiUrl("/api/kline/2330"));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: Candle[] = await response.json();
        if (Array.isArray(data)) {
          const normalized = data
            .filter((d) => d && d.time)
            .map(normalizeCandle);
          candleSeries.setData(normalized);
        }
      } catch (err) {
        console.error("loadHistory error:", err);
      }
    };
    loadHistory();
    const unsubscribe = subscribe("candle", (candle: Candle) => {
      if (!candle?.time) return;
      candleSeries.update(normalizeCandle(candle));
    });
    const resize = () => {
      if (!ref.current) return;
      chart.applyOptions({
        width: ref.current.clientWidth,
      });
    };
    window.addEventListener("resize", resize);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  }, []);
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "700px",
      }}
    />
  );
}