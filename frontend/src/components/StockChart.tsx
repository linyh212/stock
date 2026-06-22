import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import { ws } from "../ws";

export default function StockChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const chart = createChart(ref.current!, {
      height: 400,
    });
    const series = chart.addLineSeries();
    const data: any[] = [];
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      data.push({
        time: msg.time / 1000,
        value: msg.price,
      });
      series.setData(data);
    };
  }, []);

  return <div ref={ref}></div>;
}