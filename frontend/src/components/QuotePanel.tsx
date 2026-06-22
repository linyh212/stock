import { useEffect, useState } from "react";
import { ws } from "../ws";

export default function QuotePanel() {
  const [quote, setQuote] = useState<any>(null);
  useEffect(() => {
    ws.onmessage = (event) => {
      setQuote(JSON.parse(event.data));
    };
  }, []);
  if (!quote) return <div>loading...</div>;
  return (
    <div>
      <h2>{quote.symbol}</h2>
      <p>價格：{quote.price}</p>
      <p>成交量：{quote.volume}</p>
    </div>
  );
}