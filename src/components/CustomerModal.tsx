import { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function CustomerModal({ customer, onClose, onSave, isPOS = false }: any) {
  const [form, setForm] = useState(customer || { name: '', phone: '', email: '', address: '', city: '', gstNumber: '', creditLimit: 0, gender: 'Male', age: '' });
  
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    onSave(form); 
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in ${isPOS ? 'z-[60]' : 'z-50'}`}>
      <div className="card w-full max-w-md mx-4 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <h2 className="font-bold text-lg">{customer ? 'Edit Customer' : 'Add Customer'}</h2>
          <button onClick={onClose} className="btn-icon btn-ghost"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="label">Full Name *</label>
            <input type="text" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus />
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender || 'Male'} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Age (Yrs)</label>
              <input type="number" className="input" value={form.age || ''} onChange={e => setForm({ ...form, age: e.target.value ? parseInt(e.target.value) : undefined })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <input type="text" className="input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="label">GST Number</label>
              <input type="text" className="input" value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input type="text" className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 glow-brand"><Check size={16} /> {isPOS ? 'Save & Select' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
