import { Link, useLocation } from "wouter";
import { LayoutDashboard, TrendingUp, BookMarked, ClipboardList, BarChart3, Shield, LogOut, ChevronDown } from "lucide-react";
import { useClerk, useUser } from "@clerk/react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/markets", icon: TrendingUp, label: "Markets" },
  { href: "/watchlist", icon: BookMarked, label: "Watchlist" },
  { href: "/orders", icon: ClipboardList, label: "Orders" },
  { href: "/portfolio", icon: BarChart3, label: "Portfolio" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAdmin = (user?.publicMetadata as any)?.isAdmin;

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

        {/* Admin link - shown if user has admin role via API */}
        <AdminLink location={location} />
      </nav>

      {/* User + Paper Trading */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-3">
        <div className="hidden lg:flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-400 text-xs font-medium">Paper Trading</span>
        </div>
        <div className="lg:hidden flex justify-center">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {(user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "U")[0].toUpperCase()}
            </div>
            <div className="hidden lg:flex flex-1 items-center justify-between min-w-0">
              <div className="min-w-0">
                <div className="text-xs font-medium text-foreground truncate">
                  {user?.firstName || "User"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.emailAddresses?.[0]?.emailAddress}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
            </div>
          </button>

          {showUserMenu && (
            <div className="hidden lg:block absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile sign out */}
        <button
          onClick={() => signOut()}
          className="lg:hidden flex justify-center w-full py-1"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 text-muted-foreground hover:text-red-400 transition-colors" />
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
