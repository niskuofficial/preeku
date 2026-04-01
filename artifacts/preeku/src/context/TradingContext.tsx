import { createContext, useContext, useState } from "react";

interface StockBasic {
  symbol: string;
  name: string;
  currentPrice: number;
}

interface TradingContextType {
  selectedStock: StockBasic | null;
  isOrderWindowOpen: boolean;
  orderSide: "BUY" | "SELL";
  openOrderWindow: (stock: StockBasic, side?: "BUY" | "SELL") => void;
  closeOrderWindow: () => void;
}

const TradingContext = createContext<TradingContextType | null>(null);

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const [selectedStock, setSelectedStock] = useState<StockBasic | null>(null);
  const [isOrderWindowOpen, setIsOrderWindowOpen] = useState(false);
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY");

  const openOrderWindow = (stock: StockBasic, side: "BUY" | "SELL" = "BUY") => {
    setSelectedStock(stock);
    setOrderSide(side);
    setIsOrderWindowOpen(true);
  };

  const closeOrderWindow = () => {
    setIsOrderWindowOpen(false);
  };

  return (
    <TradingContext.Provider value={{ selectedStock, isOrderWindowOpen, orderSide, openOrderWindow, closeOrderWindow }}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTradingContext() {
  const ctx = useContext(TradingContext);
  if (!ctx) throw new Error("useTradingContext must be used within TradingProvider");
  return ctx;
}
