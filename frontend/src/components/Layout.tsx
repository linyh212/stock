import QuotePanel from "./QuotePanel";
import KlineChart from "./KlineChart";
import MarketBar from "./MarketBar";

export default function Layout() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "300px 1fr",
      height: "100vh",
      background: "#0b0f14",
      color: "white"
    }}>
      {/* 左側資訊 */}
      <div style={{ borderRight: "1px solid #222" }}>
        <QuotePanel />
        <MarketBar />
      </div>

      {/* 主圖 */}
      <div>
        <KlineChart />
      </div>
    </div>
  );
}