export type Symbol = string;

export interface Quote {
  symbol: Symbol;
  price: number;
  volume: number;
  change?: number;
  changePercent?: number;
  time: number;
}

export type Tick = {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  isBuy?: boolean;
};

export type BidAsk = {
  price: number;
  size: number;
};

export type Candle = {
  symbol: string;
  interval: "1m";
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export interface OrderBook {
  symbol: Symbol;
  bids: BidAsk[];
  asks: BidAsk[];
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
      type: "tick";
      data: Tick;
    }
  | {
      type: "candle";
      data: Candle;
    }
  | {
      type: "orderbook";
      data: OrderBook;
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
