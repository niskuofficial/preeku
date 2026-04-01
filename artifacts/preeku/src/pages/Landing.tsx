import { Link } from "wouter";
import { TrendingUp, BarChart3, Shield, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Preeku" className="w-9 h-9 rounded-md object-contain" />
          <span className="font-bold text-foreground text-xl tracking-tight">Preeku</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </button>
          </Link>
          <Link href="/sign-up">
            <button className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Get Started
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-primary text-xs font-semibold tracking-wide">Live NSE Data · Paper Trading</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-5 leading-tight max-w-3xl">
          Master the Market<br />
          <span className="text-primary">Risk Free</span>
        </h1>

        <p className="text-lg text-muted-foreground mb-10 max-w-xl leading-relaxed">
          Practice stock trading with virtual ₹10 lakh on real NSE data. Build your strategy, track your portfolio, and learn without losing a rupee.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/sign-up">
            <button className="px-8 py-3.5 font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-base">
              Start Trading Free
            </button>
          </Link>
          <Link href="/sign-in">
            <button className="px-8 py-3.5 font-semibold bg-card border border-border text-foreground rounded-xl hover:bg-accent transition-colors text-base">
              Sign In
            </button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-20 max-w-3xl w-full">
          {[
            { icon: TrendingUp, label: "Live NSE Prices", desc: "Real-time data via Angel One SmartAPI" },
            { icon: BarChart3, label: "Portfolio Tracker", desc: "Track P&L, holdings & positions" },
            { icon: Shield, label: "Risk-Free Trading", desc: "Virtual ₹10L wallet to practice" },
            { icon: Zap, label: "Market Heatmap", desc: "Sector-wise live market overview" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 text-left">
              <Icon className="w-5 h-5 text-primary mb-3" />
              <div className="text-sm font-semibold text-foreground mb-1">{label}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-5 text-xs text-muted-foreground border-t border-border">
        Preeku — Paper trading platform. Not financial advice.
      </footer>
    </div>
  );
}
