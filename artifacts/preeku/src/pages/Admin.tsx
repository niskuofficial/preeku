import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Users, Wallet, Ban, CheckCircle, Crown, Search, KeyRound, Eye, EyeOff, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBaseUrl } from "@/lib/api";

interface AdminUser {
  id: number;
  clerkId: string;
  email: string;
  name: string;
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

export default function Admin() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingWallet, setEditingWallet] = useState<{ clerkId: string; balance: number } | null>(null);
  const [walletInput, setWalletInput] = useState("");
  const [passwordModal, setPasswordModal] = useState<{ clerkId: string; name: string; email: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
                  <tr key={user.clerkId} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {(user.name || user.email)[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-foreground flex items-center gap-1.5">
                            {user.name || "—"}
                            {user.isAdmin && <Crown className="w-3 h-3 text-amber-400" />}
                          </div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
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

                    <td className="px-4 py-3">
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
                        <button
                          onClick={() => { setPasswordModal({ clerkId: user.clerkId, name: user.name || user.email, email: user.email }); setNewPassword(""); setShowPassword(false); }}
                          title="Change password"
                          className="p-1.5 rounded-lg transition-colors bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
