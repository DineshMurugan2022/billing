import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { settingsApi } from '../lib/api';
import { Settings, Store, Printer, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const { data: settings, isLoading } = useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.get().then(r => r.data) });
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const save = useMutation({
    mutationFn: (data: Record<string, string>) => settingsApi.save(data),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  const handleChange = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));
  const getValue = (key: string) => (form[key] !== undefined ? form[key] : settings?.[key] || '');
  const handleSave = () => { if (Object.keys(form).length) save.mutate(form); };

  const sections = [
    {
      title: 'Store Information',
      icon: Store,
      fields: [
        { key: 'store.name', label: 'Store Name', placeholder: 'My Retail Store' },
        { key: 'store.gstin', label: 'GSTIN', placeholder: '33AAAAA0000A1Z5' },
        { key: 'store.address', label: 'Address', placeholder: '123 Main Street, Chennai - 600001' },
        { key: 'store.phone', label: 'Phone', placeholder: '+91 9876543210' },
      ],
    },
    {
      title: 'Invoice Settings',
      icon: Settings,
      fields: [
        { key: 'invoice.prefix', label: 'Invoice Prefix', placeholder: 'INV' },
        { key: 'receipt.footer', label: 'Receipt Footer Message', placeholder: 'Thank you for shopping!' },
        { key: 'currency.symbol', label: 'Currency Symbol', placeholder: '₹' },
      ],
    },
    {
      title: 'Printer Configuration',
      icon: Printer,
      fields: [
        { key: 'printer.type', label: 'Printer Type', placeholder: 'none / usb / network' },
        { key: 'printer.ip', label: 'Printer IP (for network printer)', placeholder: '192.168.1.100' },
        { key: 'printer.port', label: 'Printer Port', placeholder: '9100' },
      ],
    },
  ];

  if (isLoading) return <div className="flex justify-center py-20"><div className="spinner w-10 h-10" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your store, invoices, and hardware</p>
        </div>
        <button onClick={handleSave} disabled={save.isPending} className={saved ? 'btn-success' : 'btn-primary'}>
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>
      </div>

      {sections.map(({ title, icon: Icon, fields }) => (
        <div key={title} className="card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
              <Icon size={16} className="text-brand-400" />
            </div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input" value={getValue(key)} onChange={e => handleChange(key, e.target.value)} placeholder={placeholder} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* POS Hardware Status */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
            <Printer size={16} className="text-brand-400" />
          </div>
          <h3 className="font-semibold text-slate-900">POS Hardware Status</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Thermal Printer', status: 'Not Configured', color: 'text-amber-400' },
            { label: 'Barcode Scanner', status: 'Ready (USB HID)', color: 'text-emerald-400' },
            { label: 'Cash Drawer', status: 'Via Printer', color: 'text-slate-400' },
          ].map(({ label, status, color }) => (
            <div key={label} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 mb-1">{label}</p>
              <p className={`text-sm font-medium ${color}`}>{status}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          💡 When you get a thermal printer, enter its IP address above and set type to "network". The barcode scanner works immediately — just plug in via USB!
        </p>
      </div>
    </div>
  );
}
