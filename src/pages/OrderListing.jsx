import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2, LayoutGrid, List, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const initialMockOrders = [
  { id: 'ORD-001', customer: 'Acme Corp', date: '2026-04-15', amount: '$1,200.00', status: 'Pending', priority: 'High' },
  { id: 'ORD-002', customer: 'Nexus Systems', date: '2026-04-14', amount: '$3,450.00', status: 'In Progress', priority: 'Medium' },
  { id: 'ORD-003', customer: 'Global Ind.', date: '2026-04-12', amount: '$890.00', status: 'Completed', priority: 'Low' },
  { id: 'ORD-004', customer: 'TechStart', date: '2026-04-10', amount: '$12,400.00', status: 'Cancelled', priority: 'High' },
  { id: 'ORD-005', customer: 'Omega LLC', date: '2026-04-09', amount: '$450.00', status: 'Completed', priority: 'Medium' },
];

const statusStyles = {
  'Pending': 'warning',
  'In Progress': 'primary',
  'Completed': 'success',
  'Cancelled': 'danger'
};

export default function OrderListing() {
  const [view, setView] = useState('table'); // 'table' or 'grid'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [orders, setOrders] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    const savedOrders = localStorage.getItem('mockOrders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      setOrders(initialMockOrders);
      localStorage.setItem('mockOrders', JSON.stringify(initialMockOrders));
    }
  }, []);

  const handleStatusChange = (id, newStatus) => {
    const order = orders.find(o => o.id === id);
    if (order && order.status !== newStatus && (newStatus === 'Completed' || newStatus === 'Cancelled')) {
      const notifs = JSON.parse(localStorage.getItem('mockNotifications') || '[]');
      notifs.unshift({
        id: Date.now().toString() + Math.random(),
        message: `Order ${id} has been marked as ${newStatus}`,
        type: newStatus === 'Completed' ? 'success' : 'danger',
        read: false,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      });
      localStorage.setItem('mockNotifications', JSON.stringify(notifs));
      window.dispatchEvent(new Event('dashboard-notifications-update'));
    }

    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem('mockOrders', JSON.stringify(updated));
    setActiveMenuId(null);
  };

  const handleDelete = (id) => {
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    localStorage.setItem('mockOrders', JSON.stringify(updated));
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                          o.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Orders</h2>
          <p className="text-zinc-400 mt-1">Manage and track your order fulfillments.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => setView(view === 'table' ? 'grid' : 'table')}>
            {view === 'table' ? <LayoutGrid className="w-4 h-4 mr-2" /> : <List className="w-4 h-4 mr-2" />}
            {view === 'table' ? 'Grid View' : 'List View'}
          </Button>
          <Link to="/orders/new">
            <Button>Create Order</Button>
          </Link>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
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
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Cancelled</option>
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
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-zinc-500">No orders found.</td>
                  </tr>
                )}
                {filteredOrders.map((order, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={order.id} 
                    className="border-b border-border hover:bg-zinc-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-white">{order.id}</td>
                    <td className="px-6 py-4">{order.customer}</td>
                    <td className="px-6 py-4 text-zinc-400">{order.date}</td>
                    <td className="px-6 py-4">{order.amount}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusStyles[order.status]}>{order.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/orders/${order.id}`}>
                          <button className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-700 transition">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(order.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-md hover:bg-zinc-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}
                            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-700 transition"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          
                          <AnimatePresence>
                            {activeMenuId === order.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-8 top-0 mt-1 w-36 bg-zinc-900 border border-border rounded-lg shadow-xl overflow-hidden z-20 text-left"
                              >
                                <div className="p-1">
                                  <div className="px-2 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Set Status</div>
                                  {Object.keys(statusStyles).map(status => (
                                    <button 
                                      key={status}
                                      onClick={() => handleStatusChange(order.id, status)}
                                      className="w-full text-left px-2 py-1.5 text-sm rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors flex justify-between items-center"
                                    >
                                      {status}
                                      {order.status === status && <Check className="w-3 h-3 text-primary" />}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
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
          {filteredOrders.length === 0 && (
             <div className="col-span-full py-10 text-center text-zinc-500">No orders found.</div>
          )}
          {filteredOrders.map((order, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={order.id}
            >
              <Card className="glass relative group hover:border-primary/50 transition-colors cursor-pointer">
                <Link to={`/orders/${order.id}`} className="absolute inset-0 z-10" />
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{order.id}</h3>
                      <p className="text-xs text-zinc-400">{order.customer}</p>
                    </div>
                    <Badge variant={statusStyles[order.status]}>{order.status}</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Amount</span>
                      <span>{order.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Date</span>
                      <span>{order.date}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center z-20 relative">
                    <span className="text-xs text-zinc-500">Priority: {order.priority}</span>
                    <div className="flex space-x-1">
                      <Link to={`/orders/${order.id}/edit`} className="z-20">
                         <button className="p-1 text-zinc-500 hover:text-white transition"><Edit className="w-4 h-4"/></button>
                      </Link>
                      <button 
                        onClick={(e) => { e.preventDefault(); handleDelete(order.id); }}
                        className="p-1 text-rose-500 hover:text-rose-400 transition z-20"
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
