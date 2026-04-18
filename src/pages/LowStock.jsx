import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, Package, Edit, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { useProductStore } from '../stores/useProductStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorView } from '../components/ui/ErrorView';
import { EmptyState } from '../components/ui/EmptyState';
import { useEffect, useState } from 'react';

export default function LowStock() {
  const { products, updateStock } = useProductStore();
  const { dispatchNotification } = useNotificationStore();
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
          title="Inventory Protocol Error" 
          message="Sensors detected a problem while analyzing stock thresholds. System restart may be required."
          onRetry={() => { setIsError(false); setIsLoading(true); }}
        />
      </div>
    );
  }

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
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="glass p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-xl" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-xl" />
                  <Skeleton className="h-9 w-12 rounded-xl" />
                </div>
              </div>
            </Card>
          ))
        ) : lowStockProducts.length === 0 ? (
          <div className="col-span-full py-20">
            <EmptyState 
              icon={CheckCircle2}
              title="Inventory Optimized"
              description="System status nominal. All units in the catalog are currently above critical reorder levels."
              actionLabel="Return to Dashboard"
              actionLink="/dashboard"
            />
          </div>
        ) : (
          <AnimatePresence>
            {lowStockProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ duration: 0.2 }}
                key={product.id}
                className="h-full"
              >
                <Card className="glass relative group hover:border-amber-500/50 transition-colors border-l-4 border-l-amber-500 h-full flex flex-col">
                  <div className="p-5 flex-1 flex flex-col">
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
        )}
      </div>
    </div>
  );
}
