import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TradingProvider } from "@/context/TradingContext";
import { LivePricesProvider } from "@/context/LivePricesContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import OrderWindow from "@/components/OrderWindow";
import Dashboard from "@/pages/Dashboard";
import Markets from "@/pages/Markets";
import Watchlist from "@/pages/Watchlist";
import Orders from "@/pages/Orders";
import Portfolio from "@/pages/Portfolio";
import Admin from "@/pages/Admin";
import Landing from "@/pages/Landing";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function FetchInterceptor() {
  const { token } = useAuth();
  useEffect(() => {
    const origFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
      if (url.startsWith("/api") || url.includes("/api/")) {
        const t = localStorage.getItem("preeku_token");
        if (t) {
          init = { ...init, headers: { Authorization: `Bearer ${t}`, ...init.headers } };
        }
      }
      return origFetch(input, init);
    };
    return () => { window.fetch = origFetch; };
  }, [token]);
  return null;
}

function HomeRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect to="/dashboard" />;
  return <Landing />;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!isSignedIn) return <Redirect to="/sign-in" />;

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LivePricesProvider>
      <TradingProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <main className="flex-1 overflow-hidden flex flex-col">
            {children}
          </main>
          <OrderWindow />
        </div>
      </TradingProvider>
    </LivePricesProvider>
  );
}

function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FetchInterceptor />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in" component={SignIn} />
          <Route path="/sign-up" component={SignUp} />
          <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
          <Route path="/markets" component={() => <ProtectedRoute component={Markets} />} />
          <Route path="/watchlist" component={() => <ProtectedRoute component={Watchlist} />} />
          <Route path="/orders" component={() => <ProtectedRoute component={Orders} />} />
          <Route path="/portfolio" component={() => <ProtectedRoute component={Portfolio} />} />
          <Route path="/admin" component={() => <ProtectedRoute component={Admin} />} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </WouterRouter>
  );
}

export default App;
