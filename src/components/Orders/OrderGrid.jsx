import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Trash2, Check, Star, ChevronDown, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency } from '../../utils/format';

const statusStyles = {
  'Pending': 'warning',
  'In Progress': 'primary',
  'Completed': 'success',
  'Cancelled': 'danger'
};

export default function OrderGrid({ 
  orders, 
  onDeleteClick, 
  activeMenuId, 
  setActiveMenuId, 
  onStatusChange 
}) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="No Orders Found"
        description="We couldn't find any orders matching your criteria. Try adjusting your filters or search terms."
        actionLabel="Create New Order"
        actionLink="/orders/new"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <AnimatePresence>
        {orders.map((order) => (
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
                      <p className="text-xl font-black text-textMain tracking-tight">{formatCurrency(order.amount)}</p>
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
                      onClick={() => onDeleteClick(order.id)}
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
                                    onStatusChange(order.id, status);
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
  );
}
