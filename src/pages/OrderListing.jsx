import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2, LayoutGrid, List, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useAppContext } from '../core/AppContext';

const statusStyles = {
  'Pending': 'warning',
  'In Progress': 'primary',
  'Completed': 'success',
  'Cancelled': 'danger'
};

export default function OrderListing() {
  const { orders, setOrders, dispatchNotification } = useAppContext();
  const [view, setView] = useState('table'); // 'table' or 'grid'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const handleStatusChange = (id, newStatus) => {
    const order = orders.find(o => o.id === id);
    if (order && order.status !== newStatus && (newStatus === 'Completed' || newStatus === 'Cancelled')) {
      dispatchNotification(`Order ${id} has been marked as ${newStatus}`, newStatus === 'Completed' ? 'success' : 'danger');
    }

    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    setOrders(updated);
    setActiveMenuId(null);
  };

  const handleDelete = (id) => {
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    dispatchNotification(`Order ${id} deleted successfully.`, 'danger');
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
          <h2 className="text-2xl font-bold tracking-tight text-textMain">Orders</h2>
          <p className="text-textMuted mt-1">Manage and track your order fulfillments.</p>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-textMain placeholder:text-textMuted"
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="bg-card text-textMain border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
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
              <thead className="text-xs text-textMuted uppercase bg-black/5 dark:bg-white/5 border-b border-border">
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
                    <td colSpan="6" className="px-6 py-8 text-center text-textMuted">No orders found.</td>
                  </tr>
                )}
                <AnimatePresence>
                  {filteredOrders.map((order, i) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, backgroundColor: 'rgba(244, 63, 94, 0.1)' }}
                      transition={{ duration: 0.2 }}
                      key={order.id} 
                      className="border-b border-border hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
                    >
                    <td className="px-6 py-4 font-medium text-textMain">{order.id}</td>
                    <td className="px-6 py-4 text-textMain font-medium">{order.customer}</td>
                    <td className="px-6 py-4 text-textMuted">{order.date}</td>
                    <td className="px-6 py-4 text-textMain">{order.amount}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusStyles[order.status]}>{order.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/orders/${order.id}`}>
                          <button className="p-1.5 text-textMuted hover:text-textMain rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(order.id)}
                          className="p-1.5 text-textMuted hover:text-rose-500 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}
                            className="p-1.5 text-textMuted hover:text-textMain rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition"
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
                                className="absolute right-8 top-0 mt-1 w-36 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-20 text-left"
                              >
                                <div className="p-1">
                                  <div className="px-2 py-1.5 text-[10px] font-semibold text-textMuted uppercase tracking-wider">Set Status</div>
                                  {Object.keys(statusStyles).map(status => (
                                    <button 
                                      key={status}
                                      onClick={() => handleStatusChange(order.id, status)}
                                      className="w-full text-left px-2 py-1.5 text-sm rounded-md text-textMain hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex justify-between items-center"
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
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.length === 0 && (
             <div className="col-span-full py-10 text-center text-textMuted">No orders found.</div>
          )}
          <AnimatePresence>
            {filteredOrders.map((order, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={order.id}
              >
              <Card className="glass relative group hover:border-primary/50 transition-colors cursor-pointer">
                <Link to={`/orders/${order.id}`} className="absolute inset-0 z-10" />
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-textMain">{order.id}</h3>
                      <p className="text-xs text-textMuted">{order.customer}</p>
                    </div>
                    <Badge variant={statusStyles[order.status]}>{order.status}</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-textMain font-medium">
                    <div className="flex justify-between">
                      <span className="text-textMuted">Amount</span>
                      <span>{order.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-textMuted">Date</span>
                      <span>{order.date}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center z-20 relative">
                    <span className="text-xs text-textMuted">Priority: {order.priority}</span>
                    <div className="flex space-x-1">
                      <Link to={`/orders/${order.id}/edit`} className="z-20">
                         <button className="p-1 text-textMuted hover:text-textMain transition"><Edit className="w-4 h-4"/></button>
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
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
