import { useEffect, useState } from "react";
import { getApiUrl } from "../config";
import { subscribe } from "../ws";
import type { Tick } from "../types";

export default function MarketBar() {
  const [data, setData] = useState<Tick | null>(null);
  useEffect(() => {
    let active = true;
    const loadInitial = async () => {
      try {
        const response = await fetch(getApiUrl("/api/quote/2330"));
        if (active && response.ok)
          setData(await response.json());
      } catch (error) {
        console.error("Failed to load initial market data:", error);
      }
    };
    loadInitial();
    const unsubscribe = subscribe("tick", setData);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  return (
    <div style={{
      padding: 16,
      borderTop: "1px solid #222"
    }}>
      <div>📊 即時行情</div>
      {data && (
        <div>
          <div>價格：{data.price}</div>
          <div>成交量：{data.volume}</div>
        </div>
      )}
    </div>
  );
}
