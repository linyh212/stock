import { useEffect, useState } from "react";
import { subscribe } from "../ws";

export default function MarketBar() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    subscribe(setData);
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