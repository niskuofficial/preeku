import React, { createContext, useContext, useState } from "react";

export interface SelectedStock {
  symbol: string;
  name: string;
  currentPrice: number;
}

interface TradingContextType {
  isOrderModalOpen: boolean;
  selectedStock: SelectedStock | null;
  orderSide: "BUY" | "SELL";
  openOrderModal: (stock: SelectedStock, side?: "BUY" | "SELL") => void;
  closeOrderModal: () => void;
}

const TradingContext = createContext<TradingContextType>({
  isOrderModalOpen: false,
  selectedStock: null,
  orderSide: "BUY",
  openOrderModal: () => {},
  closeOrderModal: () => {},
});

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<SelectedStock | null>(null);
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY");

  const openOrderModal = (stock: SelectedStock, side: "BUY" | "SELL" = "BUY") => {
    setSelectedStock(stock);
    setOrderSide(side);
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
  };

  return (
    <TradingContext.Provider value={{ isOrderModalOpen, selectedStock, orderSide, openOrderModal, closeOrderModal }}>
      {children}
    </TradingContext.Provider>
  );
}

export const useTradingContext = () => useContext(TradingContext);
