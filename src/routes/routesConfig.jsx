import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ProductListing = lazy(() => import('../pages/ProductListing'));
const ProductForm = lazy(() => import('../pages/ProductForm'));
const OrderListing = lazy(() => import('../pages/OrderListing'));
const OrderDetail = lazy(() => import('../pages/OrderDetail'));
const OrderForm = lazy(() => import('../pages/OrderForm'));
const LowStock = lazy(() => import('../pages/LowStock'));

// Layouts
const DashboardLayout = lazy(() => import('../layouts/DashboardLayout'));

export const routesConfig = [
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: <ProductListing />
          },
          {
            path: 'new',
            element: <ProductForm />
          },
          {
            path: ':id/edit',
            element: <ProductForm />
          }
        ]
      },
      {
        path: 'low-stock',
        element: <LowStock />
      },
      {
        path: 'orders',
        children: [
          {
            index: true,
            element: <OrderListing />
          },
          {
            path: 'new',
            element: <OrderForm />
          },
          {
            path: ':id',
            element: <OrderDetail />
          },
          {
            path: ':id/edit',
            element: <OrderForm />
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
];
