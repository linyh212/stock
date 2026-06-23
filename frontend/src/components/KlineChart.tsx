import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import { subscribe } from "../ws";

export default function KlineChart() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chart = createChart(ref.current!, {
      layout: {
        background: { color: "#0b0f14" },
        textColor: "white",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      height: 600,
    });

    const candleSeries = chart.addCandlestickSeries();

    const klines: any[] = [];

    subscribe((msg) => {
      if (msg.type === "kline") {
        klines.push(msg.data);

        candleSeries.setData(klines);
      }
    });
  }, []);

  return <div ref={ref} />;
}