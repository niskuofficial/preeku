import { useState } from "react";
import { useListOrders, useCancelOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { formatINR, pnlClass } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, X } from "lucide-react";

type StatusFilter = "ALL" | "EXECUTED" | "PENDING" | "CANCELLED";

interface Order {
  id: number; symbol: string; side: string; orderType: string; productType: string;
  quantity: number; price: number; totalValue: number; pnl: number | null;
  status: string; placedAt: string;
}

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const params = statusFilter !== "ALL" ? { status: statusFilter as "EXECUTED" | "CANCELLED" | "PENDING" } : undefined;
  const { data: orders } = useListOrders(params, {
    query: { queryKey: getListOrdersQueryKey(params) }
  });
  const cancelOrder = useCancelOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const orderList: Order[] = Array.isArray(orders) ? orders : [];

  const handleCancel = (id: number) => {
    cancelOrder.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        toast({ title: "Order Cancelled", description: `Order #${id} cancelled` });
      },
      onError: () => {
        toast({ title: "Error", description: "Could not cancel order", variant: "destructive" });
      }
    });
  };

  const filters: StatusFilter[] = ["ALL", "EXECUTED", "PENDING", "CANCELLED"];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Order History</h1>
        </div>
        <span className="text-muted-foreground text-sm">{orderList.length} orders</span>
      </div>

      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            data-testid={`filter-${f.toLowerCase()}`}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >{f}</button>
        ))}
      </div>

      {orderList.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No orders found</p>
          <p className="text-sm mt-1">Place trades from the Markets or Watchlist page</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {["#", "Symbol", "Side", "Type", "Product", "Qty", "Price", "Total", "P&L", "Status", "Date", ""].map((h, i) => (
                    <th key={`${h}-${i}`} className={`py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider ${i <= 1 ? "text-left" : i === 11 ? "text-center" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orderList.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors" data-testid={`order-row-${order.id}`}>
                    <td className="py-3 px-3 text-muted-foreground font-mono text-xs">#{order.id}</td>
                    <td className="py-3 px-3 font-bold text-foreground">{order.symbol}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${order.side === "BUY" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>{order.side}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground text-xs">{order.orderType}</td>
                    <td className="py-3 px-3 text-right text-muted-foreground text-xs">{order.productType}</td>
                    <td className="py-3 px-3 text-right font-mono text-foreground">{order.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono text-foreground">{formatINR(order.price)}</td>
                    <td className="py-3 px-3 text-right font-mono text-foreground">{formatINR(order.totalValue)}</td>
                    <td className={`py-3 px-3 text-right font-mono text-sm ${order.pnl !== null ? pnlClass(order.pnl) : "text-muted-foreground"}`}>
                      {order.pnl !== null ? `${order.pnl >= 0 ? "+" : ""}${formatINR(order.pnl)}` : "—"}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded ${order.status === "EXECUTED" ? "bg-green-500/15 text-green-400" : order.status === "PENDING" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>{order.status}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground text-xs font-mono">
                      {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {order.status === "PENDING" && (
                        <button onClick={() => handleCancel(order.id)} data-testid={`btn-cancel-order-${order.id}`} className="text-muted-foreground hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
