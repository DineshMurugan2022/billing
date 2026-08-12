import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { billingApi } from '../lib/api';
import { Receipt, Search, Eye, Printer } from 'lucide-react';
import dayjs from 'dayjs';
import ReceiptModal from '../components/ReceiptModal';

export default function BillsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

  const { data, isPending } = useQuery({
    queryKey: ['bills', search, page],
    queryFn: () => billingApi.list({ search, page: page.toString() }).then(r => r.data),
    placeholderData: keepPreviousData,
  });

  const { data: fullBill } = useQuery({
    queryKey: ['bill', selectedBillId],
    queryFn: () => (selectedBillId ? billingApi.getById(selectedBillId).then(r => r.data) : null),
    enabled: !!selectedBillId,
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bills & Invoices</h1>
          <p className="page-subtitle">{data?.total || 0} total invoices</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by invoice number or customer..." />
        </div>
      </div>

      <div className="table-container">
        {isPending && !data ? <div className="flex justify-center py-12"><div className="spinner w-8 h-8" /></div> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((bill: any) => (
                <tr key={bill.id}>
                  <td><code className="text-brand-400 font-mono text-sm">{bill.invoiceNumber}</code></td>
                  <td className="text-slate-400 text-sm">{dayjs(bill.createdAt).format('DD MMM YYYY HH:mm')}</td>
                  <td>{bill.customer?.name || <span className="text-slate-500">Walk-in</span>}</td>
                  <td className="text-slate-400">{bill._count?.items} items</td>
                  <td><span className="badge badge-info">{bill.paymentMode}</span></td>
                  <td className="font-bold text-brand-400">₹{bill.totalAmount.toFixed(2)}</td>
                  <td>
                    {bill.status === 'COMPLETED' && <span className="badge badge-success">Paid</span>}
                    {bill.status === 'CANCELLED' && <span className="badge badge-danger">Cancelled</span>}
                    {bill.status === 'RETURN' && <span className="badge badge-warning">Return</span>}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedBillId(bill.id)}
                      title="View & Print Receipt"
                      className="btn-icon btn-ghost text-slate-400 hover:text-brand-400"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {data?.data?.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-slate-500">
                  <Receipt size={32} className="mx-auto mb-2 opacity-30" /><p>No bills found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.pages }, (_, i) => (
            <button key={i+1} onClick={() => setPage(i+1)} className={`w-9 h-9 rounded-lg text-sm font-medium ${page === i+1 ? 'bg-brand-600 text-white' : 'btn-secondary'}`}>{i+1}</button>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      {fullBill && (
        <ReceiptModal
          bill={fullBill}
          onClose={() => setSelectedBillId(null)}
        />
      )}
    </div>
  );
}
