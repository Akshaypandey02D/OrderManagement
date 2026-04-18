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

export default function ProductGrid({ products, onDeleteClick }) {
  if (products.length === 0) {
    return (
      <div className="p-12 text-center text-textMuted font-medium bg-card/50 rounded-2xl border border-dashed border-border mt-8">
        No products found matching your search criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <AnimatePresence>
        {products.map((product) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            key={product.id}
            className="h-full"
          >
            <Card className="glass relative group hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
              <div className="p-5 md:p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-textMain text-lg leading-tight">{product.name}</h3>
                      <p className="text-xs text-textMuted tracking-tight uppercase font-medium">{product.sku}</p>
                    </div>
                  </div>
                  <Badge variant={statusStyles[product.status]}>{product.status}</Badge>
                </div>

                <div className="space-y-2.5 text-sm text-textMain mt-6 font-medium">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-black/5 dark:bg-white/5">
                    <span className="text-textMuted text-xs font-bold uppercase">Price</span>
                    <span className="text-lg font-bold">
                      {typeof product.price === 'number' ? `₹${product.price.toLocaleString('en-IN')}` : product.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-black/5 dark:bg-white/5">
                    <span className="text-textMuted text-xs font-bold uppercase">Stock Level</span>
                    <span className={product.stock < (product.minQuantity || 10) ? 'text-rose-500' : ''}>{product.stock} units</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-[10px] font-bold text-textMuted tracking-wider uppercase">ID: {product.id}</span>
                  <div className="flex space-x-1">
                    <Link to={`/products/${product.id}/edit`}>
                      <button className="p-2 text-textMuted hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                        <Edit className="w-4 h-4" />
                      </button>
                    </Link>
                    <button
                      onClick={() => onDeleteClick(product.id)}
                      className="p-2 text-textMuted hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
