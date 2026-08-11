import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Archive,
  Users, Truck, BarChart3, Receipt, Settings, LogOut,
  Store, Bell, ChevronRight, Wifi, WifiOff
} from 'lucide-react';
import { useAuthStore } from '../../store';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pos',       icon: ShoppingCart,   label: 'POS / Billing', highlight: true },
  { to: '/bills',     icon: Receipt,        label: 'Bills & Invoices' },
  { to: '/products',  icon: Package,        label: 'Products' },
  { to: '/inventory', icon: Archive,        label: 'Inventory' },
  { to: '/customers', icon: Users,          label: 'Customers' },
  { to: '/suppliers', icon: Truck,          label: 'Suppliers' },
  { to: '/reports',   icon: BarChart3,      label: 'Reports' },
  { to: '/stores',    icon: Store,          label: 'Stores & Branches' },
  { to: '/settings',  icon: Settings,       label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Store size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.branch?.store?.name || 'BillPro'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.branch?.name}</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ChevronRight size={14} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label, highlight }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${highlight ? 'border border-brand-200 bg-brand-50' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && highlight && (
                <span className="ml-auto text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-md">POS</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-slate-200 p-3">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              <button onClick={handleLogout} title="Logout" className="btn-icon btn-ghost text-slate-500 hover:text-red-500">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="btn-icon btn-ghost w-full text-slate-500 hover:text-red-500">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Wifi size={12} className="text-emerald-500" />
            <span>Online</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-icon btn-ghost relative">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500"></span>
            </button>
            <div className="text-xs text-slate-500">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
