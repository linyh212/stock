import { broadcastQuote } from "./ws";
import type { Quote } from "./types";

const state: Record<string, Quote> = {
  "2330": {
    symbol: "2330",
    price: 1000,
    volume: 10000,
    change: 0,
    time: Date.now(),
  },
  "2317": {
    symbol: "2317",
    price: 150,
    volume: 8000,
    change: 0,
    time: Date.now(),
  },
  "2454": {
    symbol: "2454",
    price: 1200,
    volume: 5000,
    change: 0,
    time: Date.now(),
  },
};

function randomWalk(price: number): number {
  const change = (Math.random() - 0.5) * 2; // ±1
  return Math.max(1, price + change);
}

function updateSymbol(symbol: string) {
  const stock = state[symbol];
  const oldPrice = stock.price;
  const newPrice = randomWalk(oldPrice);
  const change = newPrice - oldPrice;
  const updated: Quote = {
    ...stock,
    price: Number(newPrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    volume: stock.volume + Math.floor(Math.random() * 500),
    time: Date.now(),
  };
  state[symbol] = updated;
  broadcastQuote(updated);
}

export function startMockMarket() {
  console.log("Mock market started...");
  setInterval(() => {
    Object.keys(state).forEach((symbol) => {
      updateSymbol(symbol);
    });
  }, 1000);
}

export function getSnapshot(): Quote[] {
  return Object.values(state);
}