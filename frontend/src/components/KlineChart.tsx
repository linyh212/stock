import { createChart, CandlestickSeries, type CandlestickData, type Time, type IChartApi, type ISeriesApi, } from "lightweight-charts";
import { useEffect, useRef } from "react";
import { getApiUrl } from "../config";
import { subscribe } from "../ws";
import type { Candle } from "../types";

const toChartTime = (time: number): Time => Math.floor(time > 1_000_000_000_000 ? time / 1000 : time) as Time;

const normalizeCandle = (candle: Candle): CandlestickData<Time> => ({
  time: toChartTime(candle.time),
  open: Number(candle.open),
  high: Number(candle.high),
  low: Number(candle.low),
  close: Number(candle.close),
});

export default function KlineChart() {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
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
    chartRef.current = chart;
    const candleSeries: ISeriesApi<"Candlestick"> =
      chart.addSeries(CandlestickSeries);
    const loadHistory = async () => {
      try {
        const response = await fetch(getApiUrl("/api/kline"));
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
    const refreshTimer = window.setInterval(loadHistory, 1000);
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
      window.clearInterval(refreshTimer);
      unsubscribe();
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  }, []);
  const handleGoToRealtime = () => {
    chartRef.current?.timeScale().scrollToRealTime();
  };
  return (
    <>
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "700px",
        }}
      />
      <div className="buttons-container">
        <button onClick={handleGoToRealtime}>Go to realtime</button>
      </div>
      <style jsx>{`
        .buttons-container {
          display: flex;
          flex-direction: row;
          gap: 8px;
          padding: 8px 24px;
        }
        .buttons-container button {
          all: initial;
          font-family:
            -apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu,
            sans-serif;
          font-size: 16px;
          font-style: normal;
          font-weight: 510;
          line-height: 24px; /* 150% */
          letter-spacing: -0.32px;
          padding: 8px 24px;
          color: #e5e7eb;
          background-color: #374151;
          border-radius: 8px;
          cursor: pointer;
        }
        .buttons-container button:hover {
          background-color: #4b5563;
        }
        .buttons-container button:active {
          background-color: #1f2937;
        }
      `}</style>
    </>
  );
}
