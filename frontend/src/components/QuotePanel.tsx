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

        if (active && quoteResponse.ok) {
          setTick(await quoteResponse.json());
        }

        if (active && klineResponse.ok) {
          const candles = await klineResponse.json();
          if (Array.isArray(candles) && candles.length > 0) {
            setCandle(candles[candles.length - 1]);
          }
        }
      } catch (error) {
        console.error("Failed to load initial quote:", error);
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
  if (!tick) return <div>Loading...</div>;
  return (
    <div className="quote-card">
      <div className="symbol">TSMC</div>
      <div className="ticker">2330</div>
      <div className="price">{tick.price}</div>
      <div className="time">
        {new Date(tick.timestamp).toLocaleTimeString()}
      </div>
      {candle && (
        <div className="stats">
          <div>
            <span>Open</span>
            <span>{candle.open}</span>
          </div>
          <div>
            <span>High</span>
            <span>{candle.high}</span>
          </div>
          <div>
            <span>Low</span>
            <span>{candle.low}</span>
          </div>
          <div>
            <span>Close</span>
            <span>{candle.close}</span>
          </div>
          <div>
            <span>Volume</span>
            <span>{candle.volume}</span>
          </div>
        </div>
      )}
      <style jsx>{`
        .quote-card {
          padding: 32px;
          background: #111827;
          border-radius: 16px;
          color: white;
        }
        .symbol {
          font-size: 14px;
          color: #9ca3af;
        }
        .ticker {
          font-size: 18px;
          margin-bottom: 8px;
        }
        .price {
          font-size: 64px;
          font-weight: 700;
        }
        .time {
          color: #9ca3af;
          margin-top: 8px;
        }
        .stats {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .stats div {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
}
