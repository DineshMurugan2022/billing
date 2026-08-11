import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '../lib/api';
import { Plus, Search, Edit2, Trash2, Package, X, Check, Barcode } from 'lucide-react';

const GST_SLABS = ['ZERO', 'FIVE', 'TWELVE', 'EIGHTEEN', 'TWENTYEIGHT'];
const GST_LABELS: Record<string, string> = { ZERO: '0%', FIVE: '5%', TWELVE: '12%', EIGHTEEN: '18%', TWENTYEIGHT: '28%' };

const UNITS = ['PCS', 'KG', 'GRM', 'LTR', 'ML', 'MTR', 'BOX', 'PKT', 'BTL', 'SET'];

function ProductModal({ product, categories, onClose, onSave }: any) {
  const [form, setForm] = useState(product || {
    name: '', barcode: '', sku: '', hsnCode: '', categoryId: '', mrp: '', sellingPrice: '', purchasePrice: '',
    gstSlab: 'ZERO', taxType: 'INCLUSIVE', unit: 'PCS', trackInventory: true, hasBatch: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, mrp: +form.mrp, sellingPrice: +form.sellingPrice, purchasePrice: form.purchasePrice ? +form.purchasePrice : undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="card w-full max-w-2xl mx-4 shadow-2xl max-h-screen overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <h2 className="font-bold text-lg">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="btn-icon btn-ghost"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Product Name *</label>
              <input className="input" value={form.name} onChange={e => setForm((f: any) => ({...f, name: e.target.value}))} required placeholder="e.g., Tata Salt 1kg" />
            </div>
            <div>
              <label className="label"><Barcode size={13} className="inline mr-1" />Barcode</label>
              <input className="input font-mono" value={form.barcode} onChange={e => setForm((f: any) => ({...f, barcode: e.target.value}))} placeholder="8901234567890" />
            </div>
            <div>
              <label className="label">SKU Code</label>
              <input className="input" value={form.sku} onChange={e => setForm((f: any) => ({...f, sku: e.target.value}))} placeholder="Optional internal code" />
            </div>
            <div>
              <label className="label">MRP (₹) *</label>
              <input type="number" step="0.01" className="input" value={form.mrp} onChange={e => setForm((f: any) => ({...f, mrp: e.target.value}))} required min="0" />
            </div>
            <div>
              <label className="label">Selling Price (₹) *</label>
              <input type="number" step="0.01" className="input" value={form.sellingPrice} onChange={e => setForm((f: any) => ({...f, sellingPrice: e.target.value}))} required min="0" />
            </div>
            <div>
              <label className="label">Purchase/Cost Price (₹)</label>
              <input type="number" step="0.01" className="input" value={form.purchasePrice} onChange={e => setForm((f: any) => ({...f, purchasePrice: e.target.value}))} min="0" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="select" value={form.categoryId} onChange={e => setForm((f: any) => ({...f, categoryId: e.target.value}))}>
                <option value="">-- Select Category --</option>
                {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">GST Slab</label>
              <select className="select" value={form.gstSlab} onChange={e => setForm((f: any) => ({...f, gstSlab: e.target.value}))}>
                {GST_SLABS.map(s => <option key={s} value={s}>GST {GST_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tax Type</label>
              <select className="select" value={form.taxType} onChange={e => setForm((f: any) => ({...f, taxType: e.target.value}))}>
                <option value="INCLUSIVE">Inclusive (MRP includes GST)</option>
                <option value="EXCLUSIVE">Exclusive (GST on top of price)</option>
              </select>
            </div>
            <div>
              <label className="label">Unit</label>
              <select className="select" value={form.unit} onChange={e => setForm((f: any) => ({...f, unit: e.target.value}))}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="label">HSN Code</label>
              <input className="input font-mono" value={form.hsnCode} onChange={e => setForm((f: any) => ({...f, hsnCode: e.target.value}))} placeholder="e.g., 2501" />
            </div>
            <div className="sm:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-brand-500" checked={form.trackInventory} onChange={e => setForm((f: any) => ({...f, trackInventory: e.target.checked}))} />
                <span className="text-sm text-slate-300">Track Inventory</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-brand-500" checked={form.hasBatch} onChange={e => setForm((f: any) => ({...f, hasBatch: e.target.checked}))} />
                <span className="text-sm text-slate-300">Batch / Expiry Tracking</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700/50">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1"><Check size={16} /> Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<any>(null);
  const qc = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () => productsApi.list({ search, limit: '50' }).then(r => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then(r => r.data),
  });

  const createProduct = useMutation({
    mutationFn: (data: any) => productsApi.create(data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setModal(null); },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: any) => productsApi.update(id, data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setModal(null); },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  const handleSave = (form: any) => {
    if (modal?.id) { updateProduct.mutate({ id: modal.id, data: form }); }
    else { createProduct.mutate(form); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{productsData?.total || 0} products in catalog</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary"><Plus size={16} /> Add Product</button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or barcode..." />
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="spinner w-8 h-8" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>MRP</th>
                <th>Price</th>
                <th>GST</th>
                <th>Unit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(productsData?.data || []).map((p: any) => (
                <tr key={p.id}>
                  <td>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      {p.sku && <p className="text-xs text-slate-500">{p.sku}</p>}
                    </div>
                  </td>
                  <td><code className="text-xs text-slate-400 font-mono">{p.barcode || '—'}</code></td>
                  <td><span className="badge badge-info">{p.category?.name || '—'}</span></td>
                  <td className="text-slate-400 line-through">₹{p.mrp}</td>
                  <td className="font-bold text-brand-400">₹{p.sellingPrice}</td>
                  <td><span className="badge badge-muted">GST {GST_LABELS[p.gstSlab]}</span></td>
                  <td className="text-slate-400">{p.unit}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setModal(p)} className="btn-icon btn-ghost text-slate-400 hover:text-blue-400"><Edit2 size={14} /></button>
                      <button onClick={() => { if (confirm('Deactivate product?')) deleteProduct.mutate(p.id); }} className="btn-icon btn-ghost text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {productsData?.data?.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-slate-500"><Package size={32} className="mx-auto mb-2 opacity-30" /><p>No products found</p></td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && (
        <ProductModal product={modal?.id ? modal : null} categories={categories} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  );
}
