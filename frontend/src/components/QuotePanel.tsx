import { useEffect, useState } from "react";
import { getApiUrl } from "../config";
import { subscribe } from "../ws";
import type { Tick, Candle } from "../types";

export default function QuotePanel() {
  const [tick, setTick] = useState<Tick | null>(null);
  const [candle, setCandle] = useState<Candle | null>(null);
  useEffect(() => {
    let active = true;
    const loadInitial = async () => {
      try {
        const [quoteResponse, klineResponse] = await Promise.all([
          fetch(getApiUrl("/api/quote/2330")),
          fetch(getApiUrl("/api/kline/2330")),
        ]);
        if (active && quoteResponse.ok)
          setTick(await quoteResponse.json());
        if (active && klineResponse.ok) {
          const candles = await klineResponse.json();
          if (Array.isArray(candles) && candles.length > 0)
            setCandle(candles[candles.length - 1]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadInitial();
    const unsubscribeTick = subscribe("tick", setTick);
    const unsubscribeCandle = subscribe("candle", setCandle);
    return () => {
      active = false;
      unsubscribeTick();
      unsubscribeCandle();
    };
  }, []);
  if (!tick)
    return <div>Loading...</div>;
  const change = candle && candle.open ? Number((tick.price - candle.open).toFixed(2)) : 0;
  const changePercent = candle && candle.open ? Number(((change / candle.open) * 100).toFixed(2)) : 0;
  const positive = change >= 0;
  return (
    <div className="quote-panel">
      <div className="symbol">TSMC</div>
      <div className="ticker">2330</div>
      <div className="price">{tick.price}</div>
      <div
        className="change"
        style={{
          color: positive ? "#22c55e" : "#ef4444",
        }}
      >
        {positive ? "▲" : "▼"} {Math.abs(change)}
        {" ("}
        {Math.abs(changePercent)}%
        {")"}
      </div>
      <div className="time">
        {new Date(tick.timestamp).toLocaleTimeString()}
      </div>
      {candle && (
        <div className="stats">
          <div>
            <span>Open</span>
            <strong>{candle.open}</strong>
          </div>

          <div>
            <span>High</span>
            <strong>{candle.high}</strong>
          </div>

          <div>
            <span>Low</span>
            <strong>{candle.low}</strong>
          </div>

          <div>
            <span>Close</span>
            <strong>{candle.close}</strong>
          </div>

          <div>
            <span>Volume</span>
            <strong>
              {Number(candle.volume).toLocaleString()}
            </strong>
          </div>
        </div>
      )}

      <style jsx>{`
        .quote-panel {
          color: white;
          padding: 24px;
        }

        .symbol {
          font-size: 13px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .ticker {
          font-size: 22px;
          font-weight: 600;
          margin-top: 4px;
        }

        .price {
          font-size: 84px;
          line-height: 1;
          font-weight: 700;
          margin-top: 16px;
        }

        .change {
          margin-top: 12px;
          font-size: 18px;
          font-weight: 600;
        }

        .time {
          margin-top: 8px;
          color: #6b7280;
          font-size: 14px;
        }

        .stats {
          margin-top: 32px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .stats div {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #1f2937;
        }

        .stats span {
          color: #9ca3af;
        }

        .stats strong {
          color: white;
        }
      `}</style>
    </div>
  );
}