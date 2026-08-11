import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../lib/api';
import { TrendingUp, ShoppingBag, Users, AlertTriangle, ArrowUpRight, Receipt, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '../store';

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string; icon: React.ElementType; color: string; sub?: string }) {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-center gap-1 text-emerald-400 text-xs">
        <ArrowUpRight size={12} />
        <span>Live data</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="card p-3 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="font-bold text-brand-400">₹{payload[0]?.value?.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isPending } = useQuery({ queryKey: ['dashboard'], queryFn: () => dashboardApi.get().then(r => r.data) });

  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  if (isPending && !data) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner w-10 h-10" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's what's happening at your store today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Sales"
          value={formatCurrency(data?.today?.sales || 0)}
          icon={TrendingUp}
          color="bg-brand-500/15 text-brand-400"
          sub={`${data?.today?.bills || 0} transactions`}
        />
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(data?.month?.sales || 0)}
          icon={Receipt}
          color="bg-emerald-500/15 text-emerald-400"
          sub={`${data?.month?.bills || 0} invoices`}
        />
        <StatCard
          label="Total Customers"
          value={data?.totalCustomers?.toLocaleString() || '0'}
          icon={Users}
          color="bg-purple-500/15 text-purple-400"
        />
        <StatCard
          label="Low Stock Items"
          value={data?.lowStockCount?.toString() || '0'}
          icon={AlertTriangle}
          color="bg-amber-500/15 text-amber-400"
          sub="Need restocking"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-100">Sales Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 7 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.last7Days || []}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d94e8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d94e8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#0d94e8" fill="url(#salesGrad)" strokeWidth={2} dot={{ fill: '#0d94e8', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-100 mb-4">Top Products Today</h3>
          <div className="space-y-3">
            {(data?.topProducts || []).slice(0, 5).map((p: any, i: number) => (
              <div key={p.productId} className="flex items-center gap-3">
                <span className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{p.productName}</p>
                  <p className="text-xs text-slate-500">{p._sum?.quantity || 0} units</p>
                </div>
                <span className="text-sm font-semibold text-brand-400">₹{p._sum?.totalAmount?.toFixed(0)}</span>
              </div>
            ))}
            {(!data?.topProducts || data.topProducts.length === 0) && (
              <div className="text-center py-6 text-slate-500">
                <Package size={28} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sales today yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'New Sale', href: '/pos', icon: ShoppingBag, color: 'text-brand-400', bg: 'bg-brand-500/10 hover:bg-brand-500/20 border-brand-500/20' },
            { label: 'Add Product', href: '/products', icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20' },
            { label: 'View Reports', href: '/reports', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20' },
            { label: 'Customers', href: '/customers', icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20' },
          ].map(({ label, href, icon: Icon, color, bg }) => (
            <a key={label} href={href} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${bg}`}>
              <Icon size={22} className={color} />
              <span className="text-sm font-medium text-slate-300">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
