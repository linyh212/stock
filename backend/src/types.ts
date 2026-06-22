export type Symbol = string;

export interface Quote {
  symbol: Symbol;
  price: number;
  volume: number;
  change?: number;
  changePercent?: number;
  time: number;
}

export interface Candle {
  symbol: Symbol;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
}

export interface QuoteResponse {
  symbol: Symbol;
  price: number;
  change: number;
  volume: number;
}

export type WSMessage =
  | {
      type: "quote";
      data: Quote;
    }
  | {
      type: "candle";
      data: Candle;
    }
  | {
      type: "ping";
    };

export interface Indicator {
  ma5?: number;
  ma10?: number;
  ma20?: number;
  rsi?: number;
  macd?: number;
}

export interface StockInfo {
  symbol: Symbol;
  name: string;
  market: "TW" | "US";
}