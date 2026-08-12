import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, billingApi, customersApi } from '../lib/api';
import { useCartStore, useAuthStore } from '../store';
import {
  Search, Barcode, ShoppingCart, Trash2, Plus, Minus,
  User, CreditCard, Smartphone, Banknote, Check, X,
  Receipt, Printer, Tag, Keyboard
} from 'lucide-react';
import CustomerModal from '../components/CustomerModal';
import ReceiptModal from '../components/ReceiptModal';

// ─── Payment Modal ────────────────────────────────────
function PaymentModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (bill: any) => void }) {
  const { grandTotal, items, customerId, discountAmount, discountPercent, isIGST, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [mode, setMode] = useState<'CASH' | 'CARD' | 'UPI' | 'MIXED'>('CASH');
  const [cashInput, setCashInput] = useState('');
  const [receivedByInput, setReceivedByInput] = useState(user?.name || '');
  const [showReceivedModal, setShowReceivedModal] = useState(false);
  const qc = useQueryClient();

  const total = grandTotal();
  const cashPaid = parseFloat(cashInput) || 0;
  const change = Math.max(0, cashPaid - total);

  const createBill = useMutation({
    mutationFn: (data: any) => billingApi.create(data).then(r => r.data),
    onSuccess: (bill) => {
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['bills'] });
      clearCart();
      onSuccess(bill);
    },
  });

  const handlePay = () => {
    if (!items.length) return;
    createBill.mutate({
      customerId: customerId || undefined,
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity, sellingPrice: i.sellingPrice, discountPercent: i.discountPercent })),
      discountAmount, discountPercent,
      paymentMode: mode,
      cashAmount: mode === 'CASH' || mode === 'MIXED' ? cashPaid : 0,
      cardAmount: mode === 'CARD' ? total : 0,
      upiAmount: mode === 'UPI' ? total : 0,
      receivedBy: receivedByInput || user?.name || 'ADMIN',
      isIGST,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md mx-4 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="font-bold text-lg">Payment</h2>
          <button onClick={onClose} className="btn-icon btn-ghost"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between p-4 rounded-xl bg-brand-600/10 border border-brand-500/20">
            <span className="text-slate-700 font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-brand-400">₹{total.toFixed(2)}</span>
          </div>

          {/* Payment modes */}
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Payment Method</label>
              <button onClick={() => setShowReceivedModal(true)} className="btn-secondary btn-sm text-xs px-3">
                {receivedByInput ? `Receiver: ${receivedByInput}` : '+ Set Received By'}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {(['CASH', 'CARD', 'UPI', 'MIXED'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-xs font-medium ${mode === m ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'}`}
                >
                  {m === 'CASH' && <Banknote size={18} />}
                  {m === 'CARD' && <CreditCard size={18} />}
                  {m === 'UPI' && <Smartphone size={18} />}
                  {m === 'MIXED' && <Tag size={18} />}
                  {m}
                </button>
              ))}
            </div>
          </div>

          {(mode === 'CASH' || mode === 'MIXED') && (
            <div>
              <label className="label">Cash Received</label>
              <input
                type="number"
                value={cashInput}
                onChange={e => setCashInput(e.target.value)}
                className="input-lg text-xl font-bold text-center"
                placeholder="0.00"
                autoFocus
              />
              {cashPaid > 0 && (
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-sm text-slate-400">Change to return</span>
                  <span className={`text-sm font-bold ${change > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>₹{change.toFixed(2)}</span>
                </div>
              )}
              {/* Quick amounts */}
              <div className="flex gap-2 mt-2">
                {[total, Math.ceil(total / 10) * 10, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4).map(amt => (
                  <button key={amt} onClick={() => setCashInput(amt.toString())} className="btn btn-sm btn-secondary flex-1">
                    ₹{amt.toFixed(0)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={createBill.isPending || !items.length}
            className="btn-success payment-btn glow-success"
          >
            {createBill.isPending ? <span className="spinner w-5 h-5" /> : <><Check size={20} /> Confirm Payment</>}
          </button>

          {createBill.isError && (
            <p className="text-red-400 text-sm text-center">Payment failed. Please try again.</p>
          )}
        </div>
      </div>

      {showReceivedModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-sm mx-4 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="font-bold text-md">Set Received By</h2>
              <button onClick={() => setShowReceivedModal(false)} className="btn-icon btn-ghost"><X size={16} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="label">Name</label>
                <input 
                  type="text" 
                  className="input" 
                  autoFocus
                  placeholder="Enter name (e.g. PRIYALATHA)" 
                  value={receivedByInput} 
                  onChange={e => setReceivedByInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setShowReceivedModal(false)}
                />
              </div>
              <button onClick={() => setShowReceivedModal(false)} className="btn-primary w-full glow-brand">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



// ─── Main POS Page ────────────────────────────────────
export default function POSPage() {
  const [search, setSearch] = useState('');
  const [scanBuffer, setScanBuffer] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [completedBill, setCompletedBill] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const qc = useQueryClient();
  const searchRef = useRef<HTMLInputElement>(null);
  const scanTimeout = useRef<ReturnType<typeof setTimeout>>();

  const { items, addItem, removeItem, updateQty, setCustomer, customerId, customerName, clearCart, subtotal, totalDiscount, totalTax, grandTotal } = useCartStore();

  // Barcode scanner listener (USB HID keyboard wedge)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === searchRef.current) return;
      
      if (e.key === 'Enter' && scanBuffer.length > 3) {
        // Got a barcode scan
        fetchProductByBarcode(scanBuffer);
        setScanBuffer('');
        return;
      }
      if (e.key.length === 1) {
        setScanBuffer(prev => prev + e.key);
        clearTimeout(scanTimeout.current);
        scanTimeout.current = setTimeout(() => setScanBuffer(''), 300);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scanBuffer]);

  const fetchProductByBarcode = useCallback(async (barcode: string) => {
    try {
      const res = await productsApi.getByBarcode(barcode);
      const p = res.data;
      addItem({ productId: p.id, name: p.name, barcode: p.barcode, unit: p.unit, mrp: p.mrp, sellingPrice: p.sellingPrice, gstSlab: p.gstSlab, taxType: p.taxType, hsnCode: p.hsnCode });
    } catch {
      // Product not found
    }
  }, [addItem]);

  // Product search
  const { data: products, isFetching } = useQuery({
    queryKey: ['products-search', search],
    queryFn: () => productsApi.list({ search, isActive: 'true', limit: '12' }).then(r => r.data.data),
    enabled: search.length > 0,
    staleTime: 0,
  });

  // Customer search
  const { data: customers } = useQuery({
    queryKey: ['customers-search', customerSearch],
    queryFn: () => customersApi.list({ search: customerSearch }).then(r => r.data.data),
    enabled: customerSearch.length > 1,
  });

  const createCustomer = useMutation({
    mutationFn: (data: any) => customersApi.create(data).then(r => r.data),
    onSuccess: (data) => {
      setCustomer(data.id, data.name);
      setCustomerSearch('');
      setShowAddCustomer(false);
      qc.invalidateQueries({ queryKey: ['customers-search'] });
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const handleAddCustomer = (form: any) => {
    createCustomer.mutate({
      name: form.name,
      phone: form.phone,
      email: form.email,
      gender: form.gender,
      age: form.age || undefined,
      city: form.city,
      gstNumber: form.gstNumber,
      address: form.address,
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'F1') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'F2') { e.preventDefault(); setShowPayment(true); }
      if (e.key === 'Escape') { setSearch(''); searchRef.current?.blur(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const sub = subtotal();
  const disc = totalDiscount();
  const tax = totalTax();
  const total = grandTotal();

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      {/* LEFT: Product Search + Grid */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 pr-4"
              placeholder="Search product by name... (F1)"
              id="pos-search"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-xs text-slate-600">
            <Barcode size={14} />
            <span>Scanner Ready</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
          </div>
          <button onClick={clearCart} className="btn-secondary btn-sm gap-2 text-red-400 hover:text-red-300">
            <Trash2 size={14} /> Clear
          </button>
        </div>

        {/* Product Results / Keyboard hint */}
        {search.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            {isFetching && <div className="flex justify-center py-8"><div className="spinner w-8 h-8" /></div>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(products || []).map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => addItem({ productId: p.id, name: p.name, barcode: p.barcode, unit: p.unit, mrp: p.mrp, sellingPrice: p.sellingPrice, gstSlab: p.gstSlab, taxType: p.taxType, hsnCode: p.hsnCode })}
                  className="pos-product-btn"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{p.barcode || p.sku || 'No barcode'}</p>
                    </div>
                    <Plus size={16} className="text-brand-400 flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-brand-400 font-bold text-sm">₹{p.sellingPrice}</span>
                    <span className="text-xs text-slate-500 line-through">₹{p.mrp}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{p.category?.name || ''}</p>
                </button>
              ))}
              {products?.length === 0 && !isFetching && (
                <div className="col-span-3 text-center py-10 text-slate-500">No products found for "{search}"</div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600">
            <Keyboard size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium text-slate-500">POS Ready</p>
            <p className="text-sm mt-1">Scan a barcode or press <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-xs font-mono">F1</kbd> to search</p>
            <p className="text-sm mt-1">Press <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-xs font-mono">F2</kbd> to checkout</p>
          </div>
        )}
      </div>

      {/* RIGHT: Cart */}
      <div className="w-80 xl:w-96 flex flex-col gap-3 flex-shrink-0">
        {/* Customer */}
        <div className="card p-3">
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            {customerId ? (
              <div className="flex items-center gap-2 px-3 pl-8 py-2">
                <span className="text-sm text-slate-900 flex-1 truncate">{customerName}</span>
                <button onClick={() => setCustomer(null, null)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="input pl-8 text-sm flex-1"
                  placeholder="Search customer"
                />
                <button onClick={() => setShowAddCustomer(true)} className="btn-secondary btn-sm px-2 text-brand-600"><Plus size={16} /></button>
              </div>
            )}
            {customers && customers.length > 0 && customerSearch && !customerId && !showAddCustomer && (
              <div className="absolute top-full left-0 right-0 mt-1 card z-20 shadow-xl max-h-40 overflow-y-auto">
                {customers.map((c: any) => (
                  <button key={c.id} onClick={() => { setCustomer(c.id, c.name); setCustomerSearch(''); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-slate-900 font-medium">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.phone} · ⭐ {c.loyaltyPoints} pts</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="card flex-1 overflow-y-auto p-3 space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <ShoppingCart size={15} className="text-brand-600" />
            <span className="text-sm font-semibold text-slate-800">Cart</span>
            <span className="ml-auto badge badge-info">{items.length} items</span>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-600">
              <ShoppingCart size={32} className="mb-3 opacity-30" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.productId} className="pos-cart-item group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">₹{item.sellingPrice} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
                    <Plus size={12} />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">₹{(item.sellingPrice * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeItem(item.productId)} className="text-red-500/60 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary */}
        <div className="card p-4 space-y-2">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Subtotal</span><span>₹{sub.toFixed(2)}</span>
          </div>
          {disc > 0 && <div className="flex justify-between text-sm text-emerald-600">
            <span>Discount</span><span>-₹{disc.toFixed(2)}</span>
          </div>}
          <div className="flex justify-between text-sm text-slate-500">
            <span>GST</span><span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-slate-200 pt-2 mt-2">
            <span className="text-slate-900">Total</span>
            <span className="text-brand-600">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={() => setShowPayment(true)}
          disabled={items.length === 0}
          className="btn-primary btn-lg w-full glow-brand"
          id="pos-checkout"
        >
          <Receipt size={18} />
          Checkout — ₹{total.toFixed(2)}
          <span className="ml-auto text-xs opacity-60">F2</span>
        </button>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={(bill) => { setShowPayment(false); setCompletedBill(bill); }}
      />

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <CustomerModal 
          onClose={() => setShowAddCustomer(false)} 
          onSave={handleAddCustomer} 
          isPOS={true} 
        />
      )}

      {/* Receipt Modal */}
      {completedBill && (
        <ReceiptModal
          bill={completedBill}
          onClose={() => setCompletedBill(null)}
        />
      )}
    </div>
  );
}
