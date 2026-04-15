import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, Edit, Trash2, LayoutGrid, List, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const initialMockProducts = [
  { id: 'PRD-001', name: 'MacBook Pro 16"', sku: 'MBP-16-M3', price: '$2,499.00', stock: 45, status: 'In Stock' },
  { id: 'PRD-002', name: 'iPhone 15 Pro', sku: 'IPHP-15-256', price: '$1,099.00', stock: 120, status: 'In Stock' },
  { id: 'PRD-003', name: 'AirPods Max', sku: 'APM-WHI', price: '$549.00', stock: 0, status: 'Out of Stock' },
  { id: 'PRD-004', name: 'iPad Pro 12.9"', sku: 'IPP-12-M2', price: '$1,099.00', stock: 15, status: 'Low Stock' },
  { id: 'PRD-005', name: 'Magic Keyboard', sku: 'MK-BLK', price: '$299.00', stock: 80, status: 'In Stock' },
];

const statusStyles = {
  'In Stock': 'success',
  'Low Stock': 'warning',
  'Out of Stock': 'danger'
};

export default function ProductListing() {
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('mockProducts');
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      setProducts(initialMockProducts);
      localStorage.setItem('mockProducts', JSON.stringify(initialMockProducts));
    }
  }, []);

  const handleDelete = (id) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem('mockProducts', JSON.stringify(updated));
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Products</h2>
          <p className="text-zinc-400 mt-1">Manage your product catalog and inventory.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => setView(view === 'table' ? 'grid' : 'table')}>
            {view === 'table' ? <LayoutGrid className="w-4 h-4 mr-2" /> : <List className="w-4 h-4 mr-2" />}
            {view === 'table' ? 'Grid View' : 'List View'}
          </Button>
          <Link to="/products/new">
            <Button>Add Product</Button>
          </Link>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="bg-zinc-900 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Statuses</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
          <Button variant="secondary" className="px-3">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Data Display */}
      {view === 'table' ? (
        <Card className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Product ID</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">SKU</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 && (
                  <tr><td colSpan="7" className="px-6 py-8 text-center text-zinc-500">No products found.</td></tr>
                )}
                {filteredProducts.map((product, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={product.id} 
                    className="border-b border-border hover:bg-zinc-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-white">{product.id}</td>
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                        <Package className="w-4 h-4 text-zinc-400" />
                      </div>
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{product.sku}</td>
                    <td className="px-6 py-4">{product.price}</td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusStyles[product.status]}>{product.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/products/${product.id}/edit`}>
                          <button className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-700 transition">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-md hover:bg-zinc-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-10 text-center text-zinc-500">No products found.</div>
          )}
          {filteredProducts.map((product, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={product.id}
            >
              <Card className="glass relative group hover:border-primary/50 transition-colors">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">{product.name}</h3>
                            <p className="text-xs text-zinc-400">{product.sku}</p>
                        </div>
                    </div>
                    <Badge variant={statusStyles[product.status]}>{product.status}</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-300 mt-6">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Price</span>
                      <span>{product.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Stock</span>
                      <span>{product.stock} units</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center z-20 relative">
                    <span className="text-xs text-zinc-500">ID: {product.id}</span>
                    <div className="flex space-x-1">
                      <Link to={`/products/${product.id}/edit`}>
                        <button className="p-1.5 text-zinc-500 hover:text-white transition z-20"><Edit className="w-4 h-4"/></button>
                      </Link>
                      <button 
                        onClick={(e) => { e.preventDefault(); handleDelete(product.id); }}
                        className="p-1.5 text-rose-500 hover:text-rose-400 transition z-20"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
