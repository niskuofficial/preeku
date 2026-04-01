import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTradingContext } from "@/context/TradingContext";
import { usePlaceOrder, useGetWallet, getGetWalletQueryKey, getGetPositionsQueryKey, getGetHoldingsQueryKey, getGetPortfolioSummaryQueryKey, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/format";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

type OrderType = "MARKET" | "LIMIT";
type ProductType = "INTRADAY" | "DELIVERY";

export default function OrderWindow() {
  const { isOrderWindowOpen, closeOrderWindow, selectedStock, orderSide, openOrderWindow } = useTradingContext();
  const [side, setSide] = useState<"BUY" | "SELL">(orderSide);
  const [orderType, setOrderType] = useState<OrderType>("MARKET");
  const [productType, setProductType] = useState<ProductType>("INTRADAY");
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: wallet } = useGetWallet();
  const placeOrder = usePlaceOrder();

  const currentPrice = selectedStock?.currentPrice ?? 0;
  const execPrice = orderType === "MARKET" ? currentPrice : (parseFloat(limitPrice) || currentPrice);
  const estimatedTotal = execPrice * quantity;

  const handlePlaceOrder = () => {
    if (!selectedStock) return;
    placeOrder.mutate({
      data: {
        symbol: selectedStock.symbol,
        orderType,
        side,
        productType,
        quantity,
        limitPrice: orderType === "LIMIT" ? parseFloat(limitPrice) : undefined,
      }
    }, {
      onSuccess: () => {
        toast({
          title: `Order Placed`,
          description: `${side} ${quantity} shares of ${selectedStock.symbol} at ${formatINR(execPrice)}`,
        });
        queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPositionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetHoldingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPortfolioSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        closeOrderWindow();
        setQuantity(1);
        setLimitPrice("");
      },
      onError: (err: unknown) => {
        const message = err instanceof Error ? err.message : "Order failed";
        toast({ title: "Order Failed", description: message, variant: "destructive" });
      }
    });
  };

  return (
    <Sheet open={isOrderWindowOpen} onOpenChange={(open) => !open && closeOrderWindow()}>
      <SheetContent side="right" className="w-[400px] bg-card border-border p-0 flex flex-col">
        <SheetHeader className="p-5 border-b border-border">
          <SheetTitle className="text-foreground flex items-center gap-2">
            {selectedStock?.symbol && (
              <span className="text-lg font-bold">{selectedStock.symbol}</span>
            )}
            <span className="text-muted-foreground text-sm font-normal">{selectedStock?.name}</span>
          </SheetTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-xl font-semibold text-foreground">{formatINR(currentPrice)}</span>
          </div>
        </SheetHeader>

        <div className="flex-1 p-5 space-y-5 overflow-y-auto">
          {/* Buy/Sell Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-border" data-testid="order-side-toggle">
            <button
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                side === "BUY" ? "bg-green-500 text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
              onClick={() => setSide("BUY")}
              data-testid="btn-buy"
            >
              <TrendingUp className="w-4 h-4" />
              BUY
            </button>
            <button
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                side === "SELL" ? "bg-red-500 text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
              onClick={() => setSide("SELL")}
              data-testid="btn-sell"
            >
              <TrendingDown className="w-4 h-4" />
              SELL
            </button>
          </div>

          {/* Order Type */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Order Type</Label>
            <div className="flex gap-2">
              {(["MARKET", "LIMIT"] as OrderType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  data-testid={`order-type-${t.toLowerCase()}`}
                  className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                    orderType === t
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-secondary border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Product Type */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Product</Label>
            <div className="flex gap-2">
              {(["INTRADAY", "DELIVERY"] as ProductType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setProductType(t)}
                  data-testid={`product-type-${t.toLowerCase()}`}
                  className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                    productType === t
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-secondary border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-muted-foreground text-xs uppercase tracking-wider">Quantity</Label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-9 rounded-md bg-secondary border border-border text-foreground hover:bg-accent transition-colors text-lg"
                data-testid="btn-decrease-qty"
              >-</button>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-center font-mono bg-secondary border-border text-foreground"
                data-testid="input-quantity"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-9 rounded-md bg-secondary border border-border text-foreground hover:bg-accent transition-colors text-lg"
                data-testid="btn-increase-qty"
              >+</button>
            </div>
          </div>

          {/* Limit Price */}
          {orderType === "LIMIT" && (
            <div className="space-y-2">
              <Label htmlFor="limitPrice" className="text-muted-foreground text-xs uppercase tracking-wider">Limit Price</Label>
              <Input
                id="limitPrice"
                type="number"
                step="0.05"
                placeholder={currentPrice.toString()}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="font-mono bg-secondary border-border text-foreground"
                data-testid="input-limit-price"
              />
            </div>
          )}

          {/* Summary */}
          <div className="bg-background rounded-lg p-4 space-y-2 border border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-mono text-foreground">{quantity} shares</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price</span>
              <span className="font-mono text-foreground">{formatINR(execPrice)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-sm font-medium text-foreground">Estimated Total</span>
              <span className="font-mono font-semibold text-foreground">{formatINR(estimatedTotal)}</span>
            </div>
          </div>

          {/* Available Balance */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>Available: <span className="font-mono text-foreground">{formatINR(typeof wallet === 'object' && wallet && 'balance' in wallet ? (wallet as {balance: number}).balance : 0)}</span></span>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-5 border-t border-border">
          <Button
            onClick={handlePlaceOrder}
            disabled={placeOrder.isPending || !selectedStock}
            data-testid="btn-place-order"
            className={`w-full py-3 text-base font-semibold transition-colors ${
              side === "BUY"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {placeOrder.isPending ? "Placing..." : `Place ${side} Order`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
