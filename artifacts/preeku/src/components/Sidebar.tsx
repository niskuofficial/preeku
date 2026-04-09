import { Link, useLocation } from "wouter";
import { LayoutDashboard, TrendingUp, BookMarked, ClipboardList, BarChart3, Shield, LogOut, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/markets", icon: TrendingUp, label: "Markets" },
  { href: "/watchlist", icon: BookMarked, label: "Watchlist" },
  { href: "/orders", icon: ClipboardList, label: "Orders" },
  { href: "/portfolio", icon: BarChart3, label: "Portfolio" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const displayName = user?.name || user?.email || "User";
  const email = user?.email;
  const initials = (displayName)[0].toUpperCase();

  return (
    <aside className="flex flex-col w-16 lg:w-56 h-full bg-sidebar border-r border-sidebar-border shrink-0">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <img src="/logo.png" alt="Preeku" className="w-8 h-8 rounded-md object-contain shrink-0" />
        <span className="hidden lg:block font-bold text-foreground text-lg tracking-tight">Preeku</span>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = location === href || location.startsWith(href);
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

        <AdminLink location={location} />
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
        <div className="hidden lg:flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span className="text-amber-500 dark:text-amber-400 text-xs font-medium">Paper Trading</span>
        </div>
        <div className="lg:hidden flex justify-center py-1">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        </div>

        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {initials}
          </div>
          <div className="hidden lg:block min-w-0 flex-1">
            <div className="text-xs font-semibold text-foreground truncate">{displayName}</div>
            {email && <div className="text-xs text-muted-foreground truncate">{email}</div>}
          </div>
        </div>

        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
        >
          {isDark
            ? <Sun className="w-4 h-4 shrink-0 text-amber-400" />
            : <Moon className="w-4 h-4 shrink-0 text-indigo-500" />
          }
          <span className="hidden lg:block">
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
          <div className="hidden lg:flex ml-auto items-center">
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isDark ? "bg-indigo-500/30" : "bg-amber-400/30"}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${isDark ? "right-0.5 bg-indigo-400" : "left-0.5 bg-amber-500"}`} />
            </div>
          </div>
        </button>

        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden lg:block">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

function AdminLink({ location }: { location: string }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  if (isAdmin === null) {
    fetch("/api/admin/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => setIsAdmin(d?.isAdmin === true))
      .catch(() => setIsAdmin(false));
    return null;
  }

  if (!isAdmin) return null;

  const active = location === "/admin";
  return (
    <Link
      href="/admin"
      data-testid="nav-admin"
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-primary/15 text-primary"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
      }`}
    >
      <Shield className="w-4 h-4 shrink-0" />
      <span className="hidden lg:block">Admin</span>
    </Link>
  );
}
