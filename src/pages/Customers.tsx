import { useState } from 'react';
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../lib/api';
import { Users, Plus, Search, Star, CheckCircle, AlertCircle } from 'lucide-react';
import CustomerModal from '../components/CustomerModal';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<any>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const qc = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => customersApi.list({ search }).then(r => r.data),
    placeholderData: keepPreviousData,
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const create = useMutation({
    mutationFn: (d: any) => customersApi.create(d).then(r => r.data),
    onSuccess: (newCust) => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      setModal(null);
      showToast('success', `Customer "${newCust.name}" created successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || 'Failed to create customer.';
      showToast('error', msg);
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: any) => customersApi.update(id, data).then(r => r.data),
    onSuccess: (updatedCust) => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      setModal(null);
      showToast('success', `Customer "${updatedCust.name}" updated successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || 'Failed to update customer.';
      showToast('error', msg);
    },
  });

  const handleSave = (form: any) => {
    if (modal?.id) {
      update.mutate({ id: modal.id, data: form });
    } else {
      create.mutate(form);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{data?.total || 0} registered customers</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {notification && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl shadow-lg animate-slide-up text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
              : 'bg-red-500/10 border border-red-500/30 text-red-500'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="card p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
          />
        </div>
      </div>

      <div className="table-container">
        {isPending && !data ? (
          <div className="flex justify-center py-12"><div className="spinner w-8 h-8" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Gender / Age</th>
                <th>Phone</th>
                <th>City</th>
                <th>Loyalty Points</th>
                <th>Outstanding</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((c: any) => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-400 flex-shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        {c.email && <p className="text-xs text-slate-500">{c.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-300 text-sm">
                    {c.gender || '—'}{c.age ? ` (${c.age} Yrs)` : ''}
                  </td>
                  <td className="text-slate-300 font-mono">{c.phone || '—'}</td>
                  <td className="text-slate-400">{c.city || '—'}</td>
                  <td>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star size={12} />{c.loyaltyPoints}
                    </span>
                  </td>
                  <td>
                    {c.currentCredit > 0 ? (
                      <span className="text-red-400 font-medium">₹{c.currentCredit.toFixed(2)}</span>
                    ) : (
                      <span className="text-emerald-400">—</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => setModal(c)} className="btn-secondary btn-sm">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {data?.data?.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    <p>No customers found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && (
        <CustomerModal
          customer={modal?.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
          error={create.isError || update.isError ? 'Failed to save customer details. Check inputs.' : null}
        />
      )}
    </div>
  );
}
