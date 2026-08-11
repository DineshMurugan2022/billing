import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '../lib/api';
import { Truck, Plus } from 'lucide-react';
import { useState } from 'react';
import SupplierModal from '../components/SupplierModal';

export default function SuppliersPage() {
  const [tab, setTab] = useState<'suppliers' | 'pos'>('suppliers');
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const qc = useQueryClient();
  const { data: suppliers } = useQuery({ queryKey: ['suppliers'], queryFn: () => suppliersApi.list().then(r => r.data) });
  const { data: pos } = useQuery({ queryKey: ['purchase-orders'], queryFn: () => suppliersApi.purchaseOrders().then(r => r.data), enabled: tab === 'pos' });
  const createSupplier = useMutation({
    mutationFn: (data: any) => suppliersApi.create(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      setShowModal(false);
      setSelectedSupplier(null);
    }
  });

  const updateSupplier = useMutation({
    mutationFn: (data: any) => suppliersApi.update(selectedSupplier.id, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      setShowModal(false);
      setSelectedSupplier(null);
    }
  });

  const handleSave = (form: any) => {
    if (selectedSupplier) {
      updateSupplier.mutate(form);
    } else {
      createSupplier.mutate(form);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers & Purchase Orders</h1>
          <p className="page-subtitle">Manage vendors and stock procurement</p>
        </div>
        <button onClick={() => { setSelectedSupplier(null); setShowModal(true); }} className="btn-primary">
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      <div className="flex gap-2">
        {(['suppliers', 'pos'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`}>
            {t === 'suppliers' ? 'Suppliers' : 'Purchase Orders'}
          </button>
        ))}
      </div>

      {tab === 'suppliers' && (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>Supplier</th><th>Phone</th><th>Email</th><th>GST Number</th><th>Actions</th></tr></thead>
            <tbody>
              {(suppliers || []).map((s: any) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.name}</td>
                  <td className="text-slate-400">{s.phone || '—'}</td>
                  <td className="text-slate-400">{s.email || '—'}</td>
                  <td><code className="text-xs text-slate-400">{s.gstNumber || '—'}</code></td>
                  <td><button onClick={() => { setSelectedSupplier(s); setShowModal(true); }} className="btn-secondary btn-sm">Edit</button></td>
                </tr>
              ))}
              {(!suppliers || suppliers.length === 0) && (
                <tr><td colSpan={5} className="text-center py-10 text-slate-500"><Truck size={32} className="mx-auto mb-2 opacity-30" /><p>No suppliers yet</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'pos' && (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>PO Number</th><th>Supplier</th><th>Status</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {(pos || []).map((po: any) => (
                <tr key={po.id}>
                  <td><code className="text-brand-400 font-mono text-sm">{po.poNumber}</code></td>
                  <td>{po.supplier?.name}</td>
                  <td>
                    <span className={`badge ${po.status === 'RECEIVED' ? 'badge-success' : po.status === 'ORDERED' ? 'badge-info' : 'badge-muted'}`}>{po.status}</span>
                  </td>
                  <td className="font-bold">₹{po.totalAmount.toFixed(2)}</td>
                  <td className="text-slate-400 text-sm">{new Date(po.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><button className="btn-secondary btn-sm">View</button></td>
                </tr>
              ))}
              {(!pos || pos.length === 0) && (
                <tr><td colSpan={6} className="text-center py-10 text-slate-500"><p>No purchase orders</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <SupplierModal
          supplier={selectedSupplier}
          onClose={() => { setShowModal(false); setSelectedSupplier(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
