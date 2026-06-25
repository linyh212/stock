export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0f14",
        color: "#fff",
      }}
    >
      {children}
    </main>
  );
}
