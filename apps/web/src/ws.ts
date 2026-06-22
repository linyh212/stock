type TickData = {
  symbol: string;
  price: number;
  volume: number;
  ts: number;
};

const watchlist = ["2330", "2317", "2454"];
const store = new Map<string, TickData>();
const prevPrice = new Map<string, number>();
const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
let ws: WebSocket;

function connectWS() {
  ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws`);
  ws.onopen = () => {
    console.log("WS connected");
  };
  ws.onclose = () => {
    console.log("WS disconnected, retrying...");
    setTimeout(connectWS, 1000);
  };
  ws.onmessage = (event) => {
    const data: TickData = JSON.parse(event.data);
    if (!watchlist.includes(data.symbol)) return;
    store.set(data.symbol, data);
    renderTable();
  };
}

connectWS();

const container = document.createElement("div");
container.style.fontFamily = "monospace";
document.body.appendChild(container);

function renderTable() {
  let html = `
    <table border="1" cellspacing="0" cellpadding="6">
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Price</th>
          <th>Change</th>
          <th>Volume</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
  `;
  for (const symbol of watchlist) {
    const data = store.get(symbol);
    if (!data) {
      html += `
        <tr>
          <td>${symbol}</td>
          <td colspan="4">waiting...</td>
        </tr>
      `;
      continue;
    }
    const prev = prevPrice.get(symbol);
    const diff = prev ? data.price - prev : 0;
    prevPrice.set(symbol, data.price);
    const color =
      diff > 0 ? "red" : diff < 0 ? "green" : "black";
    html += `
      <tr>
        <td>${data.symbol}</td>
        <td>${data.price.toFixed(2)}</td>
        <td style="color:${color}">
          ${diff.toFixed(2)}
        </td>
        <td>${data.volume}</td>
        <td>${new Date(data.ts).toLocaleTimeString()}</td>
      </tr>
    `;
  }
  html += `
      </tbody>
    </table>
  `;
  container.innerHTML = html;
}