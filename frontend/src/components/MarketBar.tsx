import { useEffect, useState } from "react";
import { getApiUrl } from "../config";
import { subscribe } from "../ws";
import type { Quote, Tick } from "../types";

export default function MarketBar() {
  const [data, setData] = useState<Tick | null>(null);
  useEffect(() => {
    let active = true;
    const handleQuote = (quote: Quote) => {
      if (!active) return;
      setData((prev) => ({
        ...(prev ?? { symbol: quote.symbol, timestamp: quote.time }),
        price: quote.price,
        volume: quote.volume,
        timestamp: quote.time,
      }));
    };
    const loadSnapshot = async () => {
      try {
        const response = await fetch(getApiUrl("/api/quote/2330"));
        if (active && response.ok)
          handleQuote(await response.json());
      } catch (error) {
        console.error("Failed to load initial market data:", error);
      }
    };
    loadSnapshot();
    const refreshTimer = window.setInterval(loadSnapshot, 1000);
    const handleTick = (nextTick: Tick) => {
      if (!active) return;
      setData((prev) => ({
        ...nextTick,
        volume: prev?.volume ?? nextTick.volume,
      }));
    };
    const unsubscribe = subscribe("tick", handleTick);
    const unsubscribeQuote = subscribe("quote", handleQuote);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      unsubscribe();
      unsubscribeQuote();
    };
  }, []);
  return (
    <div style={{
      padding: 16,
      borderTop: "1px solid #222"
    }}>
      <div>即時行情</div>
      {data && (
        <div>
          <div>價格：{data.price}</div>
          <div>成交量：{data.volume}</div>
        </div>
      )}
    </div>
  );
}
