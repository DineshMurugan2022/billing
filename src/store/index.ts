import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId?: string;
  branch?: { name: string; store: { name: string; gstNumber?: string } };
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => {
        localStorage.setItem('billing_token', token);
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem('billing_token');
        set({ token: null, user: null });
      },
    }),
    { name: 'billing-auth' }
  )
);

// ─── POS Cart Store ───────────────────────────────────
export interface CartItem {
  productId: string;
  name: string;
  barcode?: string;
  unit: string;
  mrp: number;
  sellingPrice: number;
  quantity: number;
  discountPercent: number;
  gstSlab: string;
  taxType: string;
  hsnCode?: string;
}

interface CartState {
  items: CartItem[];
  customerId: string | null;
  customerName: string | null;
  discountAmount: number;
  discountPercent: number;
  isIGST: boolean;
  
  addItem: (product: Omit<CartItem, 'quantity' | 'discountPercent'>) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  updateDiscount: (productId: string, discount: number) => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setBillDiscount: (amount: number, percent: number) => void;
  setIGST: (val: boolean) => void;
  clearCart: () => void;
  
  // Computed
  subtotal: () => number;
  totalDiscount: () => number;
  totalTax: () => number;
  grandTotal: () => number;
}

const GST_RATES: Record<string, number> = { ZERO: 0, FIVE: 5, TWELVE: 12, EIGHTEEN: 18, TWENTYEIGHT: 28 };

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerId: null,
  customerName: null,
  discountAmount: 0,
  discountPercent: 0,
  isIGST: false,

  addItem: (product) => {
    const { items } = get();
    const existing = items.find(i => i.productId === product.productId);
    if (existing) {
      set({ items: items.map(i => i.productId === product.productId ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      set({ items: [...items, { ...product, quantity: 1, discountPercent: 0 }] });
    }
  },

  removeItem: (productId) => set({ items: get().items.filter(i => i.productId !== productId) }),

  updateQty: (productId, qty) => {
    if (qty <= 0) { get().removeItem(productId); return; }
    set({ items: get().items.map(i => i.productId === productId ? { ...i, quantity: qty } : i) });
  },

  updateDiscount: (productId, discount) =>
    set({ items: get().items.map(i => i.productId === productId ? { ...i, discountPercent: discount } : i) }),

  setCustomer: (id, name) => set({ customerId: id, customerName: name }),
  setBillDiscount: (amount, percent) => set({ discountAmount: amount, discountPercent: percent }),
  setIGST: (val) => set({ isIGST: val }),

  clearCart: () => set({ items: [], customerId: null, customerName: null, discountAmount: 0, discountPercent: 0 }),

  subtotal: () => get().items.reduce((sum, i) => sum + i.sellingPrice * i.quantity, 0),

  totalDiscount: () => {
    const itemDiscount = get().items.reduce((sum, i) => sum + (i.sellingPrice * i.quantity * i.discountPercent) / 100, 0);
    return itemDiscount + get().discountAmount;
  },

  totalTax: () => {
    const { isIGST } = get();
    return get().items.reduce((sum, i) => {
      const rate = GST_RATES[i.gstSlab] || 0;
      const lineTotal = i.sellingPrice * i.quantity;
      const discounted = lineTotal - (lineTotal * i.discountPercent) / 100;
      if (i.taxType === 'INCLUSIVE') {
        return sum + discounted - discounted / (1 + rate / 100);
      }
      return sum + (discounted * rate) / 100;
    }, 0);
  },

  grandTotal: () => {
    const sub = get().subtotal();
    const disc = get().totalDiscount();
    return Math.round(sub - disc);
  },
}));
