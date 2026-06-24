export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        height: "100vh",
        background: "#0b0f14",
        color: "white",
      }}
    >
      {/* 左側 */}
      <div style={{ borderRight: "1px solid #222" }}>{children}</div>
    </div>
  );
}
