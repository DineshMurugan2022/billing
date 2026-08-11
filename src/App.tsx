import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import Layout from './components/layout/Layout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import POSPage from './pages/POS';
import ProductsPage from './pages/Products';
import InventoryPage from './pages/Inventory';
import CustomersPage from './pages/Customers';
import SuppliersPage from './pages/Suppliers';
import ReportsPage from './pages/Reports';
import BillsPage from './pages/Bills';
import SettingsPage from './pages/Settings';
import StoresPage from './pages/Stores';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="bills" element={<BillsPage />} />
            <Route path="stores" element={<StoresPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
