import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TradingProvider } from "@/context/TradingContext";
import { LivePricesProvider } from "@/context/LivePricesContext";
import Sidebar from "@/components/Sidebar";
import OrderWindow from "@/components/OrderWindow";
import Dashboard from "@/pages/Dashboard";
import Markets from "@/pages/Markets";
import Watchlist from "@/pages/Watchlist";
import Orders from "@/pages/Orders";
import Portfolio from "@/pages/Portfolio";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    }
  }
});

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/markets" component={Markets} />
          <Route path="/watchlist" component={Watchlist} />
          <Route path="/orders" component={Orders} />
          <Route path="/portfolio" component={Portfolio} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <OrderWindow />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LivePricesProvider>
          <TradingProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppLayout />
            </WouterRouter>
          </TradingProvider>
        </LivePricesProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
