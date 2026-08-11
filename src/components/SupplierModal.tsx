import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function SupplierModal({ supplier, onClose, onSave }: any) {
  const [form, setForm] = useState(
    supplier || { name: '', phone: '', email: '', address: '', gstNumber: '', bankAccount: '', bankIFSC: '' }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md mx-4 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="font-bold text-lg">{supplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button onClick={onClose} className="btn-icon btn-ghost"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="label">Supplier Name *</label>
            <input type="text" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone Number</label>
              <input type="tel" className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">GST Number</label>
            <input type="text" className="input" value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Bank Account</label>
              <input type="text" className="input" value={form.bankAccount} onChange={e => setForm({ ...form, bankAccount: e.target.value })} />
            </div>
            <div>
              <label className="label">Bank IFSC</label>
              <input type="text" className="input" value={form.bankIFSC} onChange={e => setForm({ ...form, bankIFSC: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input type="text" className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1"><Check size={16} /> Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
