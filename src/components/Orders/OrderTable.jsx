import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Trash2, MoreHorizontal, Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/format';

const statusStyles = {
  'Pending': 'warning',
  'In Progress': 'primary',
  'Completed': 'success',
  'Cancelled': 'danger'
};

export default function OrderTable({ 
  orders, 
  selectedIds, 
  toggleSelect, 
  toggleSelectAll, 
  onDeleteClick, 
  activeMenuId, 
  setActiveMenuId, 
  onStatusChange 
}) {
  if (orders.length === 0) {
    return <div className="px-6 py-12 text-center text-textMuted font-medium italic">No orders found matching your search.</div>;
  }

  const allSelected = selectedIds.length === orders.length && orders.length > 0;

  return (
    <Card className="glass overflow-hidden shadow-lg border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left hidden md:table">
          <thead className="text-[11px] text-textMuted uppercase tracking-widest bg-black/5 dark:bg-white/5 border-b border-border">
            <tr>
              <th className="px-6 py-4 w-10">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary"
                  checked={allSelected}
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
            <AnimatePresence>
              {orders.map((order) => (
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
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-textMain tracking-tight">{order.id}</span>
                         {order.priority === 'High' && <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />}
                      </div>
                      <span className="text-xs text-textMuted uppercase tracking-tighter">{order.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-textMuted font-medium">{order.date}</td>
                  <td className="px-6 py-4 text-textMain font-bold">{formatCurrency(order.amount)}</td>
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
                        onClick={() => onDeleteClick(order.id)}
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
                                    onClick={() => onStatusChange(order.id, status)}
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

        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-border">
          {orders.map((order) => (
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
                  <p className="text-sm font-bold text-textMain">{formatCurrency(order.amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-textMuted mb-0.5">Date</p>
                  <p className="text-xs text-textMuted">{order.date}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={`/orders/${order.id}`} className="flex-1">
                  <button className="w-full h-9 bg-secondary text-textMain rounded-lg text-xs font-bold hover:bg-secondary/80 transition-all flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5 mr-2" /> Details
                  </button>
                </Link>
                <button
                  onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}
                  className={`h-9 px-3 rounded-lg border border-border flex items-center justify-center transition-colors ${activeMenuId === order.id ? 'bg-primary text-white border-primary' : 'bg-card text-textMuted'}`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteClick(order.id)}
                  className="h-9 px-3 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
