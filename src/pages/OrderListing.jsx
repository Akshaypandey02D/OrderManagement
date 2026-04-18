import { Search, Filter, Trash2, LayoutGrid, List, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useOrderStore } from '../stores/useOrderStore';
import { orderService } from '../services/orderService';
import { AlertModal } from '../components/ui/Modal';
import OrderTable from '../components/Orders/OrderTable';
import OrderGrid from '../components/Orders/OrderGrid';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorView } from '../components/ui/ErrorView';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';
import { useState, useEffect } from 'react';

export default function OrderListing() {
  const { orders } = useOrderStore();
  
  const [view, setView] = useState('table'); 
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ErrorView 
          title="Order Sync Failure" 
          message="We could not synchronize with the order database. This usually happens during high network congestion."
          onRetry={() => { setIsError(false); setIsLoading(true); }}
        />
      </div>
    );
  }

  const handleStatusChange = (id, newStatus) => {
    orderService.updateOrderStatus(id, newStatus);
    setActiveMenuId(null);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    orderService.deleteOrder(deleteId);
    setDeleteId(null);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    selectedIds.forEach(id => orderService.deleteOrder(id));
    setSelectedIds([]);
  };

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
              {['Pending', 'In Progress', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Card className="glass p-6">
             <div className="space-y-4">
               {Array(5).fill(0).map((_, i) => (
                 <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                   <div className="flex items-center gap-4">
                     <Skeleton className="w-5 h-5 rounded" />
                     <div className="space-y-2">
                       <Skeleton className="h-4 w-32" />
                       <Skeleton className="h-3 w-48" />
                     </div>
                   </div>
                   <div className="flex gap-4 items-center">
                     <Skeleton className="h-4 w-20" />
                     <Skeleton className="h-6 w-16 rounded-full" />
                     <Skeleton className="h-8 w-8 rounded-lg" />
                   </div>
                 </div>
               ))}
             </div>
          </Card>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20">
          <EmptyState 
            icon={ShoppingCart}
            title="No Orders Found"
            description="Start building your business footprint by creating your first customer order."
            actionLabel="Create Order"
            actionLink="/orders/new"
          />
        </div>
      ) : view === 'table' ? (
        <OrderTable 
          orders={filteredOrders} 
          selectedIds={selectedIds}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
          onDeleteClick={setDeleteId}
          activeMenuId={activeMenuId}
          setActiveMenuId={setActiveMenuId}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <OrderGrid 
          orders={filteredOrders} 
          onDeleteClick={setDeleteId}
          activeMenuId={activeMenuId}
          setActiveMenuId={setActiveMenuId}
          onStatusChange={handleStatusChange}
        />
      )}

      <AlertModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Order"
        message={`Are you sure you want to permanently delete order ${deleteId}? This action will restore the items back to inventory and cannot be undone.`}
        confirmText="Confirm Delete"
        variant="danger"
      />

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
