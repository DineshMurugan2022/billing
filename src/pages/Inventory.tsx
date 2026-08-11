import { useState } from 'react';
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../lib/api';
import { Archive, AlertTriangle, TrendingDown, TrendingUp, Package, Search } from 'lucide-react';

export default function InventoryPage() {
  const [lowStock, setLowStock] = useState(false);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ['inventory', lowStock, search],
    queryFn: () => inventoryApi.list({ lowStock: lowStock ? 'true' : 'false', search }).then(r => r.data),
    placeholderData: keepPreviousData,
  });

  const adjust = useMutation({
    mutationFn: (d: any) => inventoryApi.adjust(d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });

  const handleAdjust = (productId: string, type: string) => {
    const qty = prompt(`Enter quantity to ${type === 'ADJUSTMENT' ? 'add (+) or remove (-)' : 'adjust'}:`);
    if (!qty) return;
    const notes = prompt('Notes (optional):');
    adjust.mutate({ productId, quantity: parseFloat(qty), type: 'ADJUSTMENT', notes });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Real-time stock levels across all products</p>
        </div>
        <button onClick={() => setLowStock(!lowStock)} className={`btn ${lowStock ? 'btn-danger' : 'btn-secondary'}`}>
          <AlertTriangle size={16} />{lowStock ? 'Show All' : 'Low Stock Only'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Products', value: data?.data?.length || 0, icon: Package, color: 'text-brand-400 bg-brand-500/10' },
          { label: 'Low Stock', value: data?.data?.filter((i: any) => i.isLowStock).length || 0, icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'Out of Stock', value: data?.data?.filter((i: any) => i.quantity <= 0).length || 0, icon: TrendingDown, color: 'text-red-400 bg-red-500/10' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon size={20} /></div>
              <div><p className="stat-label">{label}</p><p className="stat-value">{value}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..." />
        </div>
      </div>

      <div className="table-container">
        {isPending && !data ? <div className="flex justify-center py-12"><div className="spinner w-8 h-8" /></div> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>In Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((inv: any) => (
                <tr key={inv.id}>
                  <td>
                    <div>
                      <p className="font-medium">{inv.product.name}</p>
                      <p className="text-xs text-slate-500">{inv.product.barcode}</p>
                    </div>
                  </td>
                  <td><span className="badge badge-info">{inv.product.category?.name || '—'}</span></td>
                  <td>
                    <span className={`font-bold text-base ${inv.quantity <= 0 ? 'text-red-400' : inv.isLowStock ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {inv.quantity} <span className="text-xs font-normal text-slate-500">{inv.product.unit}</span>
                    </span>
                  </td>
                  <td className="text-slate-400">{inv.reorderLevel} {inv.product.unit}</td>
                  <td>
                    {inv.quantity <= 0 ? (
                      <span className="badge badge-danger">Out of Stock</span>
                    ) : inv.isLowStock ? (
                      <span className="badge badge-warning">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">In Stock</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleAdjust(inv.productId, 'ADJUSTMENT')} className="btn-secondary btn-sm">
                      <TrendingUp size={12} /> Adjust
                    </button>
                  </td>
                </tr>
              ))}
              {data?.data?.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-slate-500"><Archive size={32} className="mx-auto mb-2 opacity-30" /><p>No inventory records</p></td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
