import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

const statusStyles = {
  'In Stock': 'success',
  'Low Stock': 'warning',
  'Out of Stock': 'danger'
};

export default function ProductTable({ products, onDeleteClick }) {
  if (products.length === 0) {
    return <div className="p-12 text-center text-textMuted font-medium">No products found matching your criteria.</div>;
  }

  return (
    <Card className="glass overflow-hidden shadow-lg border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left hidden md:table">
          <thead className="text-[11px] text-textMuted uppercase tracking-widest bg-black/5 dark:bg-white/5 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-bold">Product</th>
              <th className="px-6 py-4 font-bold">SKU</th>
              <th className="px-6 py-4 font-bold">Price</th>
              <th className="px-6 py-4 font-bold">Stock</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {products.map((product) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={product.id}
                  className="border-b border-border hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-textMain">{product.name}</div>
                        <div className="text-[10px] text-textMuted uppercase tracking-tighter">{product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-textMuted font-medium">{product.sku}</td>
                  <td className="px-6 py-4 text-textMain font-bold">
                    {typeof product.price === 'number' ? `₹${product.price.toLocaleString('en-IN')}` : product.price}
                  </td>
                  <td className="px-6 py-4 text-textMain">{product.stock}</td>
                  <td className="px-6 py-4">
                    <Badge variant={statusStyles[product.status]}>{product.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/products/${product.id}/edit`}>
                        <button className="p-2 text-textMuted hover:text-primary rounded-lg hover:bg-primary/10 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => onDeleteClick(product.id)}
                        className="p-2 text-textMuted hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-border">
          {products.map((product) => (
            <div key={product.id} className="p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-textMain leading-tight">{product.name}</h4>
                    <p className="text-xs text-textMuted">{product.sku}</p>
                  </div>
                </div>
                <Badge variant={statusStyles[product.status]}>{product.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded-lg border border-border/50">
                  <p className="text-[10px] uppercase font-bold text-textMuted mb-1">Price</p>
                  <p className="text-sm font-bold text-textMain">
                    {typeof product.price === 'number' ? `₹${product.price.toLocaleString('en-IN')}` : product.price}
                  </p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded-lg border border-border/50">
                  <p className="text-[10px] uppercase font-bold text-textMuted mb-1">In Stock</p>
                  <p className="text-sm font-bold text-textMain">{product.stock} units</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={`/products/${product.id}/edit`} className="flex-1">
                  <button className="w-full h-9 bg-secondary text-textMain rounded-lg text-xs font-bold hover:bg-secondary/80 transition-all flex items-center justify-center">
                    <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                  </button>
                </Link>
                <button
                  onClick={() => onDeleteClick(product.id)}
                  className="h-9 px-3 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
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
