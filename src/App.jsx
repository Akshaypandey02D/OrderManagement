import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './core/AppContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ProductListing from './pages/ProductListing';
import ProductForm from './pages/ProductForm';
import OrderListing from './pages/OrderListing';
import OrderDetail from './pages/OrderDetail';
import OrderForm from './pages/OrderForm';
import LowStock from './pages/LowStock';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductListing />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="low-stock" element={<LowStock />} />
          <Route path="orders" element={<OrderListing />} />
          <Route path="orders/new" element={<OrderForm />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="orders/:id/edit" element={<OrderForm />} />
        </Route>
      </Routes>
    </Router>
    </AppProvider>
  );
}

export default App;
