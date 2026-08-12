import { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

interface CustomerModalProps {
  customer?: any;
  onClose: () => void;
  onSave: (form: any) => void;
  isPOS?: boolean;
  error?: string | null;
}

export default function CustomerModal({ customer, onClose, onSave, isPOS = false, error: propError }: CustomerModalProps) {
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    city: customer?.city || '',
    gstNumber: customer?.gstNumber || '',
    creditLimit: customer?.creditLimit ?? 0,
    gender: customer?.gender || 'Male',
    age: customer?.age !== undefined && customer?.age !== null ? String(customer.age) : '',
  });

  const [error, setError] = useState<string | null>(propError || null);

  useEffect(() => {
    if (propError) setError(propError);
  }, [propError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError('Customer name is required.');
      return;
    }
    const parsedAge = form.age.trim() !== '' ? parseInt(form.age.trim(), 10) : null;
    if (parsedAge !== null && (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 150)) {
      setError('Please enter a valid age (0 - 150).');
      return;
    }
    onSave({
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      gstNumber: form.gstNumber.trim() || undefined,
      age: parsedAge,
    });
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in ${isPOS ? 'z-[60]' : 'z-50'}`}>
      <div className="card w-full max-w-md mx-4 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">
            {customer?.id ? 'Edit Customer' : 'Add Customer'}
          </h2>
          <button onClick={onClose} className="btn-icon btn-ghost"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
              placeholder="e.g. Mrs LAKSHMI"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                className="input"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 9876543210"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. lakshmi@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Gender</label>
              <select
                className="select"
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Age (Yrs)</label>
              <input
                type="number"
                min="0"
                max="150"
                className="input"
                value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })}
                placeholder="e.g. 53"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <input
                type="text"
                className="input"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Chennai"
              />
            </div>
            <div>
              <label className="label">GST Number</label>
              <input
                type="text"
                className="input"
                value={form.gstNumber}
                onChange={e => setForm({ ...form, gstNumber: e.target.value })}
                placeholder="GSTIN"
              />
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <input
              type="text"
              className="input"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="Street address"
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-700/30">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 glow-brand flex items-center justify-center gap-1.5">
              <Check size={16} /> {isPOS ? 'Save & Select' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
