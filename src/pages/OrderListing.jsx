import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2, LayoutGrid, List, Check, Star, ChevronDown, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useAppContext } from '../core/AppContext';
import { AlertModal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';

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
  const [deleteId, setDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

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

  const confirmDelete = () => {
    if (!deleteId) return;
    const orderToDelete = orders.find(o => o.id === deleteId);
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
    const updatedOrders = orders.filter(o => o.id !== deleteId);
    setOrders(updatedOrders);
    dispatchNotification(`Order ${deleteId} deleted and inventory restored.`, 'success');
    setDeleteId(null);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    const updatedOrders = orders.filter(o => !selectedIds.includes(o.id));
    setOrders(updatedOrders);
    setSelectedIds([]);
    dispatchNotification(`${selectedIds.length} orders deleted successfully`, 'success');
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
                  <th className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-border text-primary focus:ring-primary"
                      checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
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
                      className={`border-b border-border hover:bg-black/5 dark:hover:bg-white/5 transition-all group ${selectedIds.includes(order.id) ? 'bg-primary/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-border text-primary focus:ring-primary"
                          checked={selectedIds.includes(order.id)}
                          onChange={() => toggleSelect(order.id)}
                        />
                      </td>
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
                            onClick={() => setDeleteId(order.id)}
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
            <div className="col-span-full">
              <EmptyState
                title="No Orders Found"
                description="We couldn't find any orders matching your criteria. Try adjusting your filters or search terms."
                actionLabel="Create New Order"
                actionLink="/orders/new"
              />
            </div>
          )}
          <AnimatePresence>
            {filteredOrders.map((order) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={order.id}
                className="h-full"
              >
                <Card className="glass relative group hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 h-full flex flex-col overflow-visible">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${order.status === 'Completed' ? 'bg-emerald-500' : order.status === 'Cancelled' ? 'bg-rose-500' : 'bg-primary'} animate-pulse`} />
                          <h3 className="font-bold text-textMain tracking-tight leading-none">{order.id}</h3>
                          {order.priority && order.priority !== 'Normal' && (
                            <Star className={`w-3 h-3 fill-current ${order.priority === 'Urgent' ? 'text-amber-500' : 'text-blue-400'}`} />
                          )}
                        </div>
                        <p className="text-xs text-textMuted font-medium uppercase tracking-tighter">{order.customer}</p>
                      </div>
                      <Badge variant={statusStyles[order.status]}>{order.status}</Badge>
                    </div>

                    <div className="space-y-3 mt-5">
                      <div className="p-3.5 bg-black/5 dark:bg-white/5 rounded-2xl border border-border/50 flex justify-between items-center group/item hover:bg-primary/5 transition-colors">
                        <div>
                          <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-0.5">Total Amount</p>
                          <p className="text-xl font-black text-textMain tracking-tight">{order.amount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform">
                          <span className="text-lg font-bold">₹</span>
                        </div>
                      </div>

                      <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-border/50 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Placed On</p>
                          <p className="text-sm font-bold text-textMain">{order.date}</p>
                        </div>
                        <Clock className="w-4 h-4 text-textMuted" />
                      </div>
                    </div>

                    <div className="mt-auto pt-6 flex justify-between items-center relative z-20">
                      <div className="flex space-x-1">
                        <Link to={`/orders/${order.id}`} className="p-2 text-textMuted hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 text-textMuted hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}
                          className={`px-3 h-8 flex items-center gap-2 rounded-lg text-[10px] font-bold transition-all ${activeMenuId === order.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-black/5 dark:bg-white/5 text-textMain hover:bg-primary/10 hover:text-primary'
                            }`}
                        >
                          Actions
                          <ChevronDown className={`w-3 h-3 transition-transform ${activeMenuId === order.id ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {activeMenuId === order.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute right-0 bottom-full mb-2 w-48 bg-card border border-border rounded-2xl shadow-2xl z-20 overflow-hidden"
                              >
                                <div className="p-2 space-y-1">
                                  <div className="px-3 py-1.5 text-[10px] font-black text-textMuted uppercase tracking-widest border-b border-border/50 mb-1">Set Status</div>
                                  {Object.keys(statusStyles).map(status => (
                                    <button
                                      key={status}
                                      onClick={() => {
                                        handleStatusChange(order.id, status);
                                        setActiveMenuId(null);
                                      }}
                                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex justify-between items-center ${order.status === status ? 'bg-primary/10 text-primary font-black' : 'text-textMain hover:bg-black/5 dark:hover:bg-white/5'}`}
                                    >
                                      {status}
                                      {order.status === status && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      {/* Delete Confirmation */}
      <AlertModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Order"
        message={`Are you sure you want to permanently delete order ${deleteId}? This action will restore the items back to inventory and cannot be undone.`}
        confirmText="Confirm Delete"
        variant="danger"
      />
      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[150] bg-textMain text-card px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-8 border border-white/20 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-r border-card/20 pr-8">
              <span className="text-xl font-black">{selectedIds.length}</span>
              <span className="text-sm font-bold opacity-70 uppercase tracking-widest">Selected</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete All
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs font-black uppercase tracking-tighter opacity-50 hover:opacity-100 transition-opacity"
              >
                Deselect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
