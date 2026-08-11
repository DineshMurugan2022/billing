import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('billing_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('billing_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// API helpers
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const productsApi = {
  list: (params?: Record<string, string>) => api.get('/products', { params }),
  getByBarcode: (barcode: string) => api.get(`/products/barcode/${barcode}`),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: unknown) => api.post('/products', data),
  update: (id: string, data: unknown) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const billingApi = {
  list: (params?: Record<string, string>) => api.get('/billing', { params }),
  getById: (id: string) => api.get(`/billing/${id}`),
  create: (data: unknown) => api.post('/billing', data),
  return: (id: string) => api.post(`/billing/${id}/return`),
};

export const customersApi = {
  list: (params?: Record<string, string>) => api.get('/customers', { params }),
  getByPhone: (phone: string) => api.get(`/customers/phone/${phone}`),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: unknown) => api.post('/customers', data),
  update: (id: string, data: unknown) => api.put(`/customers/${id}`, data),
};

export const inventoryApi = {
  list: (params?: Record<string, string>) => api.get('/inventory', { params }),
  adjust: (data: unknown) => api.post('/inventory/adjust', data),
  movements: (productId: string) => api.get(`/inventory/movements/${productId}`),
};

export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (data: unknown) => api.post('/categories', data),
  update: (id: string, data: unknown) => api.put(`/categories/${id}`, data),
};

export const suppliersApi = {
  list: () => api.get('/suppliers'),
  create: (data: unknown) => api.post('/suppliers', data),
  update: (id: string, data: unknown) => api.put(`/suppliers/${id}`, data),
  purchaseOrders: () => api.get('/suppliers/purchase-orders'),
  createPO: (data: unknown) => api.post('/suppliers/purchase-orders', data),
  receivePO: (id: string, data: unknown) => api.post(`/suppliers/purchase-orders/${id}/receive`, data),
};

export const reportsApi = {
  sales: (params?: Record<string, string>) => api.get('/reports/sales', { params }),
  gstr1: (params?: Record<string, string>) => api.get('/reports/gstr1', { params }),
  stockValuation: () => api.get('/reports/stock-valuation'),
  topProducts: (params?: Record<string, string>) => api.get('/reports/top-products', { params }),
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  save: (data: Record<string, string>) => api.post('/settings', data),
};

export const storesApi = {
  list: () => api.get('/stores'),
  create: (data: unknown) => api.post('/stores', data),
  update: (id: string, data: unknown) => api.put(`/stores/${id}`, data),
};

export const branchesApi = {
  list: (params?: { storeId?: string }) => api.get('/branches', { params }),
  create: (data: unknown) => api.post('/branches', data),
  update: (id: string, data: unknown) => api.put(`/branches/${id}`, data),
};
