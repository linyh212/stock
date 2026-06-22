type BroadcastFunction = (data: unknown) => void;

export function startCollector(broadcast: BroadcastFunction) {
  let price = 1000;
  setInterval(() => {
    price += (Math.random() - 0.5) * 5;
    const data = {
      symbol: "2330",
      price: Number(price.toFixed(2)),
      volume: Math.floor(Math.random() * 1000),
      time: Date.now(),
    };
    broadcast(data);
  }, 1000);
}