import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { reportsApi } from '../lib/api';
import { BarChart3, TrendingUp, Package, FileText, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import dayjs from 'dayjs';

export default function ReportsPage() {
  const [tab, setTab] = useState<'sales' | 'stock' | 'gstr1' | 'products'>('sales');
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [gstMonth, setGstMonth] = useState(dayjs().format('MM'));
  const [gstYear, setGstYear] = useState(dayjs().format('YYYY'));

  const { data: salesData } = useQuery({
    queryKey: ['reports-sales', startDate, endDate],
    queryFn: () => reportsApi.sales({ startDate, endDate }).then(r => r.data),
    enabled: tab === 'sales',
    placeholderData: keepPreviousData,
  });

  const { data: stockData } = useQuery({
    queryKey: ['reports-stock'],
    queryFn: () => reportsApi.stockValuation().then(r => r.data),
    enabled: tab === 'stock',
    placeholderData: keepPreviousData,
  });

  const { data: gstr1Data } = useQuery({
    queryKey: ['reports-gstr1', gstMonth, gstYear],
    queryFn: () => reportsApi.gstr1({ month: gstMonth, year: gstYear }).then(r => r.data),
    enabled: tab === 'gstr1',
    placeholderData: keepPreviousData,
  });

  const { data: topProducts } = useQuery({
    queryKey: ['reports-products', startDate, endDate],
    queryFn: () => reportsApi.topProducts({ startDate, endDate, limit: '20' }).then(r => r.data),
    enabled: tab === 'products',
  });

  const tabs = [
    { id: 'sales', label: 'Sales Report', icon: TrendingUp },
    { id: 'products', label: 'Top Products', icon: Package },
    { id: 'gstr1', label: 'GST Report', icon: FileText },
    { id: 'stock', label: 'Stock Valuation', icon: BarChart3 },
  ] as const;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Business insights and GST compliance reports</p>
        </div>
        <button className="btn-secondary"><Download size={16} /> Export</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id as typeof tab)} className={`btn ${tab === id ? 'btn-primary' : 'btn-secondary'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Date filters */}
      {(tab === 'sales' || tab === 'products') && (
        <div className="card p-4 flex gap-4 items-end">
          <div>
            <label className="label">Start Date</label>
            <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      )}

      {tab === 'gstr1' && (
        <div className="card p-4 flex gap-4 items-end">
          <div>
            <label className="label">Month</label>
            <select className="select" value={gstMonth} onChange={e => setGstMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{dayjs().month(i).format('MMMM')}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <select className="select" value={gstYear} onChange={e => setGstYear(e.target.value)}>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Sales Report */}
      {tab === 'sales' && salesData && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="stat-label">Total Sales</p>
              <p className="stat-value">₹{salesData.summary?.totalSales?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total Bills</p>
              <p className="stat-value">{salesData.summary?.totalBills}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Tax Collected</p>
              <p className="stat-value text-amber-400">₹{salesData.summary?.totalTax?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-slate-100 mb-4">Daily Sales</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesData.data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: any) => [`₹${v.toFixed(2)}`, 'Sales']} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#cbd5e1' }} />
                <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                  {(salesData.data || []).map((_: any, i: number) => <Cell key={i} fill="#0d94e8" fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Products */}
      {tab === 'products' && (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>#</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
            <tbody>
              {(topProducts || []).map((p: any, i: number) => (
                <tr key={p.productId}>
                  <td><span className={`w-6 h-6 inline-flex items-center justify-center rounded-lg text-xs font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>{i+1}</span></td>
                  <td className="font-medium">{p.productName}</td>
                  <td className="text-slate-400">{p._sum?.quantity?.toFixed(2)}</td>
                  <td className="font-bold text-brand-400">₹{p._sum?.totalAmount?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* GSTR-1 */}
      {tab === 'gstr1' && gstr1Data && (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>HSN Code</th><th>Taxable Amount</th><th>CGST</th><th>SGST</th><th>IGST</th><th>Total Tax</th></tr></thead>
            <tbody>
              {(gstr1Data.data || []).map((row: any) => (
                <tr key={row.hsnCode}>
                  <td><code className="font-mono text-brand-400">{row.hsnCode}</code></td>
                  <td>₹{row.taxableAmount?.toFixed(2)}</td>
                  <td className="text-amber-400">₹{row.cgst?.toFixed(2)}</td>
                  <td className="text-amber-400">₹{row.sgst?.toFixed(2)}</td>
                  <td className="text-amber-400">₹{row.igst?.toFixed(2)}</td>
                  <td className="font-bold">₹{(row.cgst + row.sgst + row.igst)?.toFixed(2)}</td>
                </tr>
              ))}
              {gstr1Data.data?.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-slate-500">No GST data for this period</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Valuation */}
      {tab === 'stock' && stockData && (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="stat-card"><p className="stat-label">Total Stock Value (Cost)</p><p className="stat-value">₹{stockData.totalPurchaseValue?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p></div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Product</th><th>Unit</th><th>Quantity</th><th>Cost Value</th><th>Selling Value</th></tr></thead>
              <tbody>
                {(stockData.data || []).map((row: any) => (
                  <tr key={row.product}>
                    <td>{row.product}</td>
                    <td className="text-slate-400">{row.unit}</td>
                    <td className="font-bold">{row.quantity}</td>
                    <td className="text-slate-400">₹{row.purchaseValue?.toFixed(2)}</td>
                    <td className="text-emerald-400">₹{row.sellingValue?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
