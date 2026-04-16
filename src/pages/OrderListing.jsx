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
  const { orders, setOrders, products, setProducts, dispatchNotification } = useAppContext();
  const [view, setView] = useState('table'); // 'table' or 'grid'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const handleStatusChange = (id, newStatus) => {
    const order = orders.find(o => o.id === id);
    if (!order || order.status === newStatus) {
      setActiveMenuId(null);
      return;
    }

    let updatedProducts = [...products];

    // Handle inventory changes based on status transition
    if (newStatus === 'Cancelled') {
      // Order is being cancelled: Restore stock
      updatedProducts = products.map(p => {
        const itemInOrder = order.items?.find(item => item.id === p.id);
        if (itemInOrder) {
          const newStock = p.stock + itemInOrder.quantity;
          return {
            ...p,
            stock: newStock,
            status: newStock === 0 ? 'Out of Stock' : newStock < (p.minQuantity || 10) ? 'Low Stock' : 'In Stock'
          };
        }
        return p;
      });
      dispatchNotification(`Order ${id} cancelled. Items returned to stock.`, 'warning');
    } else if (order.status === 'Cancelled') {
      // Order is being re-activated from Cancelled: Deduct stock again
      updatedProducts = products.map(p => {
        const itemInOrder = order.items?.find(item => item.id === p.id);
        if (itemInOrder) {
          const newStock = Math.max(0, p.stock - itemInOrder.quantity);
          return {
            ...p,
            stock: newStock,
            status: newStock === 0 ? 'Out of Stock' : newStock < (p.minQuantity || 10) ? 'Low Stock' : 'In Stock'
          };
        }
        return p;
      });
      dispatchNotification(`Order ${id} re-activated. Items deducted from stock.`, 'info');
    } else if (newStatus === 'Completed') {
      dispatchNotification(`Order ${id} marked as completed.`, 'success');
    }

    setProducts(updatedProducts);
    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    setOrders(updated);
    setActiveMenuId(null);
  };

  const handleDelete = (orderId) => {
    const orderToDelete = orders.find(o => o.id === orderId);
    if (!orderToDelete) return;

    // Restore stock to products
    const restoredProducts = products.map(p => {
      const itemInOrder = orderToDelete.items?.find(item => item.id === p.id);
      if (itemInOrder) {
        const newStock = p.stock + itemInOrder.quantity;
        return {
          ...p,
          stock: newStock,
          status: newStock === 0 ? 'Out of Stock' : newStock < (p.minQuantity || 10) ? 'Low Stock' : 'In Stock'
        };
      }
      return p;
    });

    setProducts(restoredProducts);
    const updatedOrders = orders.filter(o => o.id !== orderId);
    setOrders(updatedOrders);
    dispatchNotification(`Order ${orderId} deleted and inventory restored.`, 'success');
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                          o.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 md:space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-textMain">Orders</h2>
          <p className="text-sm text-textMuted mt-0.5">Manage and track your order fulfillments.</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setView(view === 'table' ? 'grid' : 'table')}
            className="flex-1 sm:flex-none h-10 px-3 md:px-4"
          >
            {view === 'table' ? <LayoutGrid className="w-4 h-4 md:mr-2" /> : <List className="w-4 h-4 md:mr-2" />}
            <span className="hidden md:inline">{view === 'table' ? 'Grid View' : 'List View'}</span>
          </Button>
          <Link to="/orders/new" className="flex-1 sm:flex-none">
            <Button className="w-full h-10 px-3 md:px-4">
              Create <span className="hidden sm:inline">Order</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
          <input
            type="text"
            placeholder="Search by ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 md:h-10 pl-10 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-textMain placeholder:text-textMuted transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <select 
              className="w-full h-11 md:h-10 bg-card text-textMain border border-border rounded-xl pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Statuses</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted pointer-events-none" />
          </div>
          <Button variant="secondary" className="h-11 md:h-10 px-3 border-border rounded-xl">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Data Display */}
      {view === 'table' ? (
        <Card className="glass overflow-hidden shadow-lg border-white/5">
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="w-full text-sm text-left hidden md:table">
              <thead className="text-[11px] text-textMuted uppercase tracking-widest bg-black/5 dark:bg-white/5 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-bold">Order Details</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-textMuted font-medium italic">No orders found matching your search.</td>
                  </tr>
                )}
                <AnimatePresence>
                  {filteredOrders.map((order) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={order.id} 
                      className="border-b border-border hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-textMain tracking-tight">{order.id}</span>
                          <span className="text-xs text-textMuted uppercase tracking-tighter">{order.customer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-textMuted font-medium">{order.date}</td>
                      <td className="px-6 py-4 text-textMain font-bold">{order.amount}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusStyles[order.status]}>{order.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/orders/${order.id}`}>
                            <button className="p-2 text-textMuted hover:text-primary rounded-lg hover:bg-primary/10 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDelete(order.id)}
                            className="p-2 text-textMuted hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button 
                              onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}
                              className={`p-2 rounded-lg transition-colors ${activeMenuId === order.id ? 'bg-primary/20 text-primary' : 'text-textMuted hover:text-textMain hover:bg-black/10'}`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            
                            <AnimatePresence>
                              {activeMenuId === order.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-20"
                                >
                                  <div className="p-1.5 space-y-0.5">
                                    <div className="px-3 py-2 text-[10px] font-bold text-textMuted uppercase tracking-widest border-b border-border/50 mb-1">Update Status</div>
                                    {Object.keys(statusStyles).map(status => (
                                      <button 
                                        key={status}
                                        onClick={() => handleStatusChange(order.id, status)}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex justify-between items-center ${order.status === status ? 'bg-primary/10 text-primary font-bold' : 'text-textMain hover:bg-black/5 dark:hover:bg-white/5'}`}
                                      >
                                        {status}
                                        {order.status === status && <Check className="w-3.5 h-3.5" />}
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

            {/* Mobile Card Table Replacement */}
            <div className="block md:hidden divide-y divide-border">
              {filteredOrders.length === 0 && (
                <div className="p-12 text-center text-textMuted font-medium">No orders found.</div>
              )}
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-textMain tracking-tight">{order.id}</h4>
                      <p className="text-xs text-textMuted uppercase font-medium">{order.customer}</p>
                    </div>
                    <Badge variant={statusStyles[order.status]}>{order.status}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4 bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-border/50">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-textMuted mb-0.5">Amount</p>
                      <p className="text-sm font-bold text-textMain">{order.amount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-textMuted mb-0.5">Date</p>
                      <p className="text-xs text-textMuted">{order.date}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/orders/${order.id}`} className="flex-1">
                      <Button variant="secondary" className="w-full h-9 text-xs">
                        <Eye className="w-3.5 h-3.5 mr-2" /> Details
                      </Button>
                    </Link>
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}
                      className={`h-9 px-3 rounded-lg border border-border flex items-center justify-center transition-colors ${activeMenuId === order.id ? 'bg-primary text-white border-primary' : 'bg-card text-textMuted'}`}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <Button 
                      variant="danger" 
                      className="h-9 px-3"
                      onClick={() => handleDelete(order.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  
                  {/* Inline Status Menu for Mobile */}
                  <AnimatePresence>
                    {activeMenuId === order.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 bg-black/5 dark:bg-white/5 rounded-xl border border-border/50 overflow-hidden"
                      >
                         <div className="p-2 space-y-1">
                            <p className="px-3 py-1 text-[10px] font-bold text-textMuted uppercase tracking-widest">Update Status</p>
                            <div className="grid grid-cols-2 gap-1">
                              {Object.keys(statusStyles).map(status => (
                                <button 
                                  key={status}
                                  onClick={() => handleStatusChange(order.id, status)}
                                  className={`text-left px-3 py-2 text-xs rounded-lg transition-colors flex justify-between items-center ${order.status === status ? 'bg-primary text-white font-bold' : 'text-textMain hover:bg-black/10'}`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredOrders.length === 0 && (
             <div className="col-span-full py-12 text-center text-textMuted font-medium">No orders found.</div>
          )}
          <AnimatePresence>
            {filteredOrders.map((order) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={order.id}
              >
              <Card className="glass relative group hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <h3 className="font-bold text-textMain tracking-tight leading-none">{order.id}</h3>
                      </div>
                      <p className="text-xs text-textMuted font-medium uppercase tracking-tighter">{order.customer}</p>
                    </div>
                    <Badge variant={statusStyles[order.status]}>{order.status}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-border/50">
                      <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Amount</p>
                      <p className="text-lg font-bold text-textMain">{order.amount}</p>
                    </div>
                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-border/50">
                      <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">Placed On</p>
                      <p className="text-xs font-medium text-textMain">{order.date}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex justify-between items-center relative z-20">
                    <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Priority: {order.priority}</span>
                    <div className="flex space-x-1">
                      <Link to={`/orders/${order.id}`} className="p-2 text-textMuted hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link to={`/orders/${order.id}/edit`} className="p-2 text-textMuted hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={(e) => { e.preventDefault(); handleDelete(order.id); }}
                        className="p-2 text-textMuted hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/10"
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
