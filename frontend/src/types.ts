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
      type: "ping";
    };
