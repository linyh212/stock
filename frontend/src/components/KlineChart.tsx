import { createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";
import { subscribe } from "../ws";

export default function KlineChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current,
      {
        height: 600,
        layout: {
          background: { color: "#0b0f14" },
          textColor: "#ffffff"
        },
        grid: {
          vertLines: { color: "#1f2937" },
          horzLines: { color: "#1f2937" }
        }
      }
    );
    const candleSeries = chart.addCandlestickSeries();
    async function loadHistory() {
      const data = await fetch("http://localhost:3000/api/kline/2330").then((r) => r.json());
      candleSeries.setData(data);
    }
    loadHistory();
    subscribe((msg) => {
      if (msg.type !== "kline")
        return;
      candleSeries.update({
        time: msg.data.time / 1000,
        open: msg.data.open,
        high: msg.data.high,
        low: msg.data.low,
        close: msg.data.close
      });
    });
    return () => { chart.remove(); };
  }, []);
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "600px"
      }}
    />
  );
}