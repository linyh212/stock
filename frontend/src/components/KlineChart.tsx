import { createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";
import { getApiUrl } from "../config";
import { subscribe } from "../ws";

export default function KlineChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 600,
      layout: {
        background: {
          color: "#0b0f14",
        },
        textColor: "#ffffff",
      },
      grid: {
        vertLines: {
          color: "#1f2937",
        },
        horzLines: {
          color: "#1f2937",
        },
      },
    });
    const candleSeries = chart.addCandlestickSeries();
    const loadHistory = async () => {
      try {
        const response = await fetch(getApiUrl("/api/kline/2330"));
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          candleSeries.setData(data);
        }
      } catch (error) {
        console.error("Failed to load kline history:", error);
      }
    };
    loadHistory();
    const unsubscribe = subscribe("candle", (candle) => {
      candleSeries.update({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      });
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
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "600px",
      }}
    />
  );
}
