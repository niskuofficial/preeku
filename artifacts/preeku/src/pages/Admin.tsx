import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Users, Wallet, Ban, CheckCircle, Crown, Search, KeyRound, Eye, EyeOff, X, Camera, Pencil, Image as ImageIcon, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBaseUrl } from "@/lib/api";
import StockLogo from "@/components/StockLogo";

interface AdminUser {
  id: number;
  clerkId: string;
  email: string;
  name: string;
  profilePhoto: string | null;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: string;
  walletBalance: number;
  totalOrders: number;
  openPositions: number;
}

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function UserAvatar({ name, email, photo, size = 8 }: { name: string; email: string; photo?: string | null; size?: number }) {
  const initials = (name || email || "?")[0]?.toUpperCase();
  if (photo) {
    return (
      <img
        src={photo}
        alt={name || email}
        className={`w-${size} h-${size} rounded-full object-cover`}
        style={{ width: size * 4, height: size * 4, borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary"
      style={{ width: size * 4, height: size * 4, fontSize: size * 1.5, flexShrink: 0 }}
    >
      {initials}
    </div>
  );
}

interface AdminStock {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  logoUrl: string | null;
}

export default function Admin() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"users" | "logos">("users");
  const [search, setSearch] = useState("");
  const [logoSearch, setLogoSearch] = useState("");
  const [editingLogo, setEditingLogo] = useState<{ symbol: string; current: string } | null>(null);
  const [editingWallet, setEditingWallet] = useState<{ clerkId: string; balance: number } | null>(null);
  const [walletInput, setWalletInput] = useState("");
  const [passwordModal, setPasswordModal] = useState<{ clerkId: string; name: string; email: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profileModal, setProfileModal] = useState<AdminUser | null>(null);
  const [addAmount, setAddAmount] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: users = [], isLoading, error } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch(`${getBaseUrl()}/api/admin/users`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    retry: 1,
  });

  const { data: adminCheck } = useQuery({
    queryKey: ["admin-me"],
    queryFn: async () => {
      const res = await fetch(`${getBaseUrl()}/api/admin/me`, { credentials: "include" });
      if (!res.ok) throw new Error("Not admin");
      return res.json();
    },
    retry: false,
  });

  const { data: adminStocks = [], isLoading: stocksLoading } = useQuery<AdminStock[]>({
    queryKey: ["admin-stocks", logoSearch],
    queryFn: async () => {
      const params = logoSearch ? `?search=${encodeURIComponent(logoSearch)}&limit=100` : "?limit=100";
      const res = await fetch(`${getBaseUrl()}/api/admin/stocks${params}`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: tab === "logos",
    staleTime: 30000,
  });

  const logoMutation = useMutation({
    mutationFn: async ({ symbol, logoUrl }: { symbol: string; logoUrl: string | null }) => {
      const res = await fetch(`${getBaseUrl()}/api/admin/stocks/${symbol}/logo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ logoUrl }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (_, { symbol }) => {
      qc.invalidateQueries({ queryKey: ["admin-stocks"] });
      setEditingLogo(null);
      toast({ title: `Logo updated for ${symbol}` });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const blockMutation = useMutation({
    mutationFn: async ({ clerkId, isBlocked }: { clerkId: string; isBlocked: boolean }) => {
      const res = await fetch(`${getBaseUrl()}/api/admin/users/${clerkId}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isBlocked }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (_, { isBlocked }) => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: isBlocked ? "User blocked" : "User unblocked" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const walletMutation = useMutation({
    mutationFn: async ({ clerkId, balance }: { clerkId: string; balance: number }) => {
      const res = await fetch(`${getBaseUrl()}/api/admin/users/${clerkId}/wallet`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ balance }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingWallet(null);
      toast({ title: "Wallet updated successfully" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const adminMutation = useMutation({
    mutationFn: async ({ clerkId, isAdmin }: { clerkId: string; isAdmin: boolean }) => {
      const res = await fetch(`${getBaseUrl()}/api/admin/users/${clerkId}/admin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isAdmin }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Admin status updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addFundsMutation = useMutation({
    mutationFn: async ({ clerkId, amount }: { clerkId: string; amount: number }) => {
      const currentUser = users.find(u => u.clerkId === clerkId);
      const newBalance = (currentUser?.walletBalance ?? 0) + amount;
      const res = await fetch(`${getBaseUrl()}/api/admin/users/${clerkId}/wallet`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ balance: newBalance }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (_, { clerkId, amount }) => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setProfileModal(prev => prev ? { ...prev, walletBalance: (prev.walletBalance ?? 0) + amount } : prev);
      setAddAmount("");
      toast({ title: `₹${amount.toLocaleString("en-IN")} added to wallet` });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const passwordMutation = useMutation({
    mutationFn: async ({ clerkId, password }: { clerkId: string; password: string }) => {
      const res = await fetch(`${getBaseUrl()}/api/admin/users/${clerkId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Password updated successfully" });
      setPasswordModal(null);
      setNewPassword("");
      setShowPassword(false);
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const profileMutation = useMutation({
    mutationFn: async ({ clerkId, name, email, profilePhoto }: { clerkId: string; name?: string; email?: string; profilePhoto?: string | null }) => {
      const res = await fetch(`${getBaseUrl()}/api/admin/users/${clerkId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, profilePhoto }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data, { name, email, profilePhoto }) => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setProfileModal(prev => prev ? {
        ...prev,
        name: data.name ?? prev.name,
        email: data.email ?? prev.email,
        profilePhoto: data.profilePhoto !== undefined ? data.profilePhoto : prev.profilePhoto,
      } : prev);
      setEditingProfile(false);
      toast({ title: "Profile updated successfully" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handlePhotoUpload = (clerkId: string) => {
    fileInputRef.current?.click();
    fileInputRef.current!.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Photo too large", description: "Max file size is 2MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        profileMutation.mutate({ clerkId, profilePhoto: dataUrl });
      };
      reader.readAsDataURL(file);
      (e.target as HTMLInputElement).value = "";
    };
  };

  const handleRemovePhoto = (clerkId: string) => {
    profileMutation.mutate({ clerkId, profilePhoto: null });
  };

  if (error || (adminCheck === undefined && !isLoading)) {
    return (
      <div className="flex-1 overflow-auto p-8 flex flex-col items-center justify-center gap-4">
        <Shield className="w-12 h-12 text-red-400" />
        <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground text-sm">You need admin privileges to view this page.</p>
      </div>
    );
  }

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => !u.isBlocked).length,
    blocked: users.filter(u => u.isBlocked).length,
    totalBalance: users.reduce((acc, u) => acc + u.walletBalance, 0),
  };

  return (
    <div className="flex-1 overflow-auto">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage users, wallets, and access</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.total, icon: Users, color: "text-blue-400" },
            { label: "Active", value: stats.active, icon: CheckCircle, color: "text-green-400" },
            { label: "Blocked", value: stats.blocked, icon: Ban, color: "text-red-400" },
            { label: "Total Virtual Capital", value: formatINR(stats.totalBalance), icon: Wallet, color: "text-amber-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <div className="text-xl font-bold text-foreground">{value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {[
            { key: "users", label: "Users", icon: Users },
            { key: "logos", label: "Stock Logos", icon: ImageIcon },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Stock Logos Tab */}
        {tab === "logos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Set custom logo URLs for stocks. Logo URL should be a direct image link (PNG/JPG).</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search stocks by symbol or name..."
                value={logoSearch}
                onChange={e => setLogoSearch(e.target.value)}
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {stocksLoading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Loading stocks…</div>
              ) : adminStocks.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No stocks found</div>
              ) : (
                <div className="divide-y divide-border">
                  {adminStocks.map((stock) => (
                    <div key={stock.symbol} className="flex items-center gap-4 px-4 py-3">
                      <StockLogo symbol={stock.symbol} logoUrl={stock.logoUrl} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">{stock.symbol}</span>
                          <span className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{stock.exchange}</span>
                          {stock.logoUrl && <span className="text-xs text-green-400 font-medium">✓ Custom logo</span>}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{stock.name}</div>
                      </div>
                      {editingLogo?.symbol === stock.symbol ? (
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                          <input
                            type="url"
                            autoFocus
                            placeholder="https://example.com/logo.png"
                            defaultValue={editingLogo.current}
                            id={`logo-input-${stock.symbol}`}
                            className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <button
                            onClick={() => {
                              const val = (document.getElementById(`logo-input-${stock.symbol}`) as HTMLInputElement)?.value?.trim();
                              logoMutation.mutate({ symbol: stock.symbol, logoUrl: val || null });
                            }}
                            disabled={logoMutation.isPending}
                            className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                            title="Save"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingLogo(null)}
                            className="p-1.5 bg-accent text-muted-foreground rounded-lg hover:text-foreground transition-colors"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {stock.logoUrl && (
                            <button
                              onClick={() => logoMutation.mutate({ symbol: stock.symbol, logoUrl: null })}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                              title="Remove logo"
                            >
                              Remove
                            </button>
                          )}
                          <button
                            onClick={() => setEditingLogo({ symbol: stock.symbol, current: stock.logoUrl ?? "" })}
                            className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors font-medium"
                          >
                            <Pencil className="w-3 h-3" />
                            {stock.logoUrl ? "Edit" : "Set Logo"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "users" && <>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">User</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium">Wallet Balance</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium">Orders</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium">Positions</th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-center px-4 py-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Loading users...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No users found</td></tr>
                ) : filtered.map(user => (
                  <tr key={user.clerkId} className="border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => { setProfileModal(user); setAddAmount(""); setEditingProfile(false); setEditName(user.name || ""); setEditEmail(user.email || ""); }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.name} email={user.email} photo={user.profilePhoto} size={8} />
                        <div>
                          <div className="font-medium text-foreground flex items-center gap-1.5">
                            {user.name || "—"}
                            {user.isAdmin && <Crown className="w-3 h-3 text-amber-400" />}
                            {user.clerkId.startsWith("mobile_") && <span className="text-xs bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full font-normal">Mobile</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{user.email || "No email"}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {editingWallet?.clerkId === user.clerkId ? (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-muted-foreground text-xs">₹</span>
                          <input
                            type="number"
                            value={walletInput}
                            onChange={e => setWalletInput(e.target.value)}
                            className="w-28 bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                          />
                          <button
                            onClick={() => walletMutation.mutate({ clerkId: user.clerkId, balance: parseFloat(walletInput) })}
                            className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                          >Save</button>
                          <button onClick={() => setEditingWallet(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingWallet({ clerkId: user.clerkId, balance: user.walletBalance }); setWalletInput(user.walletBalance.toFixed(2)); }}
                          className="font-mono text-foreground hover:text-primary transition-colors"
                          title="Click to edit"
                        >
                          {formatINR(user.walletBalance)}
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right text-muted-foreground">{user.totalOrders}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{user.openPositions}</td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: user.isBlocked ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                          color: user.isBlocked ? "#f87171" : "#4ade80",
                        }}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 justify-center">
                        <button
                          onClick={() => blockMutation.mutate({ clerkId: user.clerkId, isBlocked: !user.isBlocked })}
                          title={user.isBlocked ? "Unblock user" : "Block user"}
                          className={`p-1.5 rounded-lg transition-colors ${user.isBlocked ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}
                        >
                          {user.isBlocked ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => adminMutation.mutate({ clerkId: user.clerkId, isAdmin: !user.isAdmin })}
                          title={user.isAdmin ? "Remove admin" : "Make admin"}
                          className={`p-1.5 rounded-lg transition-colors ${user.isAdmin ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" : "bg-card border border-border text-muted-foreground hover:text-amber-400"}`}
                        >
                          <Crown className="w-3.5 h-3.5" />
                        </button>
                        {!user.clerkId.startsWith("mobile_") && (
                          <button
                            onClick={() => { setPasswordModal({ clerkId: user.clerkId, name: user.name || user.email, email: user.email }); setNewPassword(""); setShowPassword(false); }}
                            title="Change password"
                            className="p-1.5 rounded-lg transition-colors bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>}
      </div>

      {/* User Profile Modal */}
      {profileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="relative p-6 pb-4" style={{ background: "linear-gradient(135deg, var(--primary) 0%, #d44a1c 100%)" }}>
              <button
                onClick={() => setProfileModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                {/* Profile Photo with edit */}
                <div className="relative group">
                  {profileModal.profilePhoto ? (
                    <img
                      src={profileModal.profilePhoto}
                      alt={profileModal.name || profileModal.email}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-white/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
                      {(profileModal.name || profileModal.email || "?")[0]?.toUpperCase()}
                    </div>
                  )}
                  {/* Photo action buttons */}
                  <div className="absolute inset-0 rounded-xl bg-black/50 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handlePhotoUpload(profileModal.clerkId)}
                      className="text-white text-xs font-medium flex items-center gap-1 hover:text-primary transition-colors"
                      title="Upload photo"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Upload</span>
                    </button>
                    {profileModal.profilePhoto && (
                      <button
                        onClick={() => handleRemovePhoto(profileModal.clerkId)}
                        className="text-red-300 text-xs hover:text-red-400 transition-colors"
                        title="Remove photo"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white truncate">{profileModal.name || "No Name"}</h3>
                    {profileModal.isAdmin && <Crown className="w-4 h-4 text-amber-300 flex-shrink-0" />}
                    {profileModal.clerkId.startsWith("mobile_") && (
                      <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full flex-shrink-0">Mobile</span>
                    )}
                  </div>
                  <p className="text-sm text-white/70 truncate">{profileModal.email || "No email"}</p>
                  <p className="text-xs text-white/50 mt-0.5">
                    {profileModal.clerkId.startsWith("mobile_") ? "Mobile User" : "Web User"} · {profileModal.isBlocked ? "Blocked" : "Active"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Orders", value: profileModal.totalOrders },
                  { label: "Positions", value: profileModal.openPositions },
                  { label: "Status", value: profileModal.isBlocked ? "Blocked" : "Active" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-background border border-border rounded-xl p-3 text-center">
                    <div className="text-base font-bold text-foreground">{value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Edit Profile Section */}
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Edit Profile</span>
                  </div>
                  {!editingProfile && (
                    <button
                      onClick={() => { setEditingProfile(true); setEditName(profileModal.name || ""); setEditEmail(profileModal.email || ""); }}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editingProfile ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Full name"
                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="flex-1 bg-background border border-border text-foreground rounded-xl py-2 text-sm hover:bg-accent transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => profileMutation.mutate({ clerkId: profileModal.clerkId, name: editName, email: editEmail })}
                        disabled={profileMutation.isPending}
                        className="flex-1 bg-primary text-white rounded-xl py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
                      >
                        {profileMutation.isPending ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="text-foreground font-medium">{profileModal.name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-foreground font-medium text-right truncate max-w-[60%]">{profileModal.email || "—"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Upload */}
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Profile Photo</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePhotoUpload(profileModal.clerkId)}
                    disabled={profileMutation.isPending}
                    className="flex-1 bg-primary/10 border border-primary/20 text-primary text-sm font-medium rounded-xl py-2 hover:bg-primary/20 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {profileModal.profilePhoto ? "Change Photo" : "Upload Photo"}
                  </button>
                  {profileModal.profilePhoto && (
                    <button
                      onClick={() => handleRemovePhoto(profileModal.clerkId)}
                      disabled={profileMutation.isPending}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-2 hover:bg-red-500/20 transition-colors disabled:opacity-40"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Supported: JPG, PNG, WebP · Max 2MB</p>
              </div>

              {/* Wallet */}
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-foreground">Wallet Balance</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {formatINR(profileModal.walletBalance)}
                  </span>
                </div>

                {/* Quick add buttons */}
                <p className="text-xs text-muted-foreground mb-2">Quick Add Funds</p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[10000, 50000, 100000, 500000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => addFundsMutation.mutate({ clerkId: profileModal.clerkId, amount: amt })}
                      disabled={addFundsMutation.isPending}
                      className="bg-primary/10 border border-primary/20 text-primary text-xs font-semibold rounded-lg py-2 hover:bg-primary/20 transition-colors disabled:opacity-40"
                    >
                      +{amt >= 100000 ? (amt / 100000) + "L" : (amt / 1000) + "K"}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                    <input
                      type="number"
                      placeholder="Custom amount"
                      value={addAmount}
                      onChange={e => setAddAmount(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl pl-7 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      onKeyDown={e => { if (e.key === "Enter" && parseFloat(addAmount) > 0) addFundsMutation.mutate({ clerkId: profileModal.clerkId, amount: parseFloat(addAmount) }); }}
                    />
                  </div>
                  <button
                    onClick={() => { const amt = parseFloat(addAmount); if (amt > 0) addFundsMutation.mutate({ clerkId: profileModal.clerkId, amount: amt }); }}
                    disabled={!addAmount || parseFloat(addAmount) <= 0 || addFundsMutation.isPending}
                    className="bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={() => setProfileModal(null)}
                className="w-full bg-background border border-border text-foreground rounded-xl py-2.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                  <KeyRound className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Change Password</h3>
                  <p className="text-xs text-muted-foreground">{passwordModal.name} · {passwordModal.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setPasswordModal(null); setNewPassword(""); setShowPassword(false); }}
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Password Input */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-muted-foreground mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  autoFocus
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  onKeyDown={e => { if (e.key === "Enter" && newPassword.length >= 8) passwordMutation.mutate({ clerkId: passwordModal.clerkId, password: newPassword }); }}
                />
                <button
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword.length > 0 && newPassword.length < 8 && (
                <p className="text-xs text-red-400 mt-1.5">Password must be at least 8 characters</p>
              )}
            </div>

            {/* Strength indicator */}
            {newPassword.length >= 8 && (
              <div className="mb-5 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-xs text-green-400 font-medium">✓ Password length is good</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => { setPasswordModal(null); setNewPassword(""); setShowPassword(false); }}
                className="flex-1 bg-background border border-border text-foreground rounded-xl py-2.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => passwordMutation.mutate({ clerkId: passwordModal.clerkId, password: newPassword })}
                disabled={newPassword.length < 8 || passwordMutation.isPending}
                className="flex-1 bg-blue-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {passwordMutation.isPending ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
