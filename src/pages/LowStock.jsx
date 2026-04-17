import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, Package, Edit, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { useProductStore } from '../stores/useProductStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function LowStock() {
  const { products, updateStock } = useProductStore();
  const { dispatchNotification } = useNotificationStore();

  const lowStockProducts = products.filter(p => Number(p.stock) < (p.minQuantity || 1));

  const handleRestock = (id) => {
    updateStock(id, 50);
    dispatchNotification(`Supplies incoming: Added 50 units for Product ${id}.`, 'success');
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-textMain flex items-center">
          <AlertTriangle className="w-6 h-6 mr-3 text-amber-500" /> 
          Action Required: Low Inventory
        </h2>
        <p className="text-textMuted mt-1">Monitor products that have mathematically breached their minimum stock thresholds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lowStockProducts.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-6 border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-medium text-textMain mb-2">All Inventory Healthy</h3>
            <p className="text-textMuted">Every product in your catalog is currently above its minimum limit.</p>
          </div>
        )}
        <AnimatePresence>
          {lowStockProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.2 }}
              key={product.id}
            >
              <Card className="glass relative group hover:border-amber-500/50 transition-colors border-l-4 border-l-amber-500">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-md bg-black/5 dark:bg-white/5 border border-border flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-textMuted" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-textMain leading-tight">{product.name}</h3>
                        <p className="text-xs text-textMuted mt-0.5">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-rose-500 border-rose-500 bg-rose-500/10 gap-1 px-2">
                       <AlertTriangle className="w-3 h-3" /> Critical
                    </Badge>
                  </div>
                  
                  <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 mb-5 border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-textMuted">Current Stock</span>
                      <span className="text-sm font-bold text-rose-500">{product.stock} left</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-1.5 -mx-1.5 rounded">
                      <span className="text-xs text-textMuted">Required Min.</span>
                      <span className="text-sm font-medium text-textMain">{product.minQuantity || 0} units</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-auto">
                    <Button onClick={() => handleRestock(product.id)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white dark:text-zinc-900 font-semibold border-0" size="sm">
                      <RefreshCcw className="w-4 h-4 mr-2" /> Quick Restock
                    </Button>
                    <Link to={`/products/${product.id}/edit`}>
                      <Button variant="secondary" size="sm" className="px-3">
                        <Edit className="w-4 h-4 text-textMain" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
