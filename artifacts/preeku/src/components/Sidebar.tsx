import { Link, useLocation } from "wouter";
import { LayoutDashboard, TrendingUp, BookMarked, ClipboardList, BarChart3 } from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/markets", icon: TrendingUp, label: "Markets" },
  { href: "/watchlist", icon: BookMarked, label: "Watchlist" },
  { href: "/orders", icon: ClipboardList, label: "Orders" },
  { href: "/portfolio", icon: BarChart3, label: "Portfolio" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="flex flex-col w-16 lg:w-56 h-full bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <img src="/logo.png" alt="Preeku" className="w-8 h-8 rounded-md object-contain shrink-0" />
        <span className="hidden lg:block font-bold text-foreground text-lg tracking-tight">Preeku</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              data-testid={`nav-${label.toLowerCase()}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden lg:block">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Paper Trading Badge */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="hidden lg:flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-400 text-xs font-medium">Paper Trading</span>
        </div>
        <div className="lg:hidden flex justify-center">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        </div>
      </div>
    </aside>
  );
}
