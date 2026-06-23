import { useEffect, useState } from "react";
import { subscribe } from "../ws";

export default function QuotePanel() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    subscribe(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>2330 台積電</h2>

      <div style={{ fontSize: 28 }}>
        {data.price}
      </div>

      <div>
        成交量：{data.volume}
      </div>

      <div>
        時間：{new Date(data.time || Date.now()).toLocaleTimeString()}
      </div>
    </div>
  );
}