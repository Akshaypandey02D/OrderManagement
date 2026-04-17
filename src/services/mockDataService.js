import { useProductStore } from '../stores/useProductStore';
import { useOrderStore } from '../stores/useOrderStore';

export const mockDataService = {
  generateMockData: () => {
    const { setProducts } = useProductStore.getState();
    const { setOrders } = useOrderStore.getState();

    const products = [
      { id: 'PRD-001', name: 'MacBook Pro M3 Max', sku: 'APPLE-MBP-M3MX', price: 299900, stock: 12, minQuantity: 5, status: 'In Stock', description: 'Ultimate power for professionals.' },
      { id: 'PRD-002', name: 'Dell UltraSharp 32" 4K', sku: 'DELL-U32-4K', price: 85000, stock: 4, minQuantity: 5, status: 'Low Stock', description: 'Color-accurate display for designers.' },
      { id: 'PRD-003', name: 'Logitech MX Master 3S', sku: 'LOGI-MXM3S', price: 9500, stock: 45, minQuantity: 10, status: 'In Stock', description: 'The legendary master mouse.' },
      { id: 'PRD-004', name: 'Herman Miller Aeron', sku: 'HM-AERON-B', price: 145000, stock: 2, minQuantity: 3, status: 'Low Stock', description: 'Ergonomic excellence.' },
      { id: 'PRD-005', name: 'Keychron Q1 Pro', sku: 'KEY-Q1PRO', price: 18000, stock: 0, minQuantity: 5, status: 'Out of Stock', description: 'Custom mechanical keyboard perfection.' }
    ];

    const orders = [
      {
        id: 'ORD-742',
        customer: 'Global Tech Corp',
        email: 'procurement@globaltech.com',
        phone: '+91 98765 00001',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
           { id: 'PRD-001', name: 'MacBook Pro M3 Max', price: 299900, quantity: 2 }
        ],
        amount: 600000,
        status: 'Completed',
        priority: 'High',
        shippingMethod: 'Express Logistics',
        shippingAddress: '12th Floor, Tower B, Cyber City, Gurgaon',
        history: [{ date: new Date().toISOString(), event: 'Delivered', note: 'Package signed by receptionist.' }]
      },
      {
        id: 'ORD-321',
        customer: 'Creative Studio Indigo',
        email: 'ops@indigo.studio',
        phone: '+91 99887 76655',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
           { id: 'PRD-002', name: 'Dell UltraSharp 32" 4K', price: 85000, quantity: 1 },
           { id: 'PRD-003', name: 'Logitech MX Master 3S', price: 9500, quantity: 1 }
        ],
        amount: 94500,
        status: 'In Progress',
        priority: 'Normal',
        shippingMethod: 'Courier Service',
        shippingAddress: 'Studio 4, Arts District, Mumbai',
        history: [{ date: new Date().toISOString(), event: 'Processing', note: 'Items picked from warehouse.' }]
      }
    ];

    setProducts(products);
    setOrders(orders);
  }
};
