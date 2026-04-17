import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, Edit, Trash2, LayoutGrid, List, Package, Upload } from 'lucide-react';
import { useProductStore } from '../stores/useProductStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { AlertModal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { BulkImportModal } from '../components/Inventory/BulkImportModal';

const statusStyles = {
  'In Stock': 'success',
  'Low Stock': 'warning',
  'Out of Stock': 'danger'
};

export default function ProductListing() {
  const { products, deleteProduct, setProducts } = useProductStore();
  const { dispatchNotification } = useNotificationStore();
  
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [deleteId, setDeleteId] = useState(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  const handleBulkImport = (newProducts) => {
    const currentProducts = [...products];
    let addedCount = 0;
    let updatedCount = 0;

    newProducts.forEach(newP => {
      const index = currentProducts.findIndex(p => p.sku === newP.sku);
      if (index > -1) {
        currentProducts[index] = { ...currentProducts[index], ...newP };
        updatedCount++;
      } else {
        currentProducts.push(newP);
        addedCount++;
      }
    });

    setProducts(currentProducts);
    dispatchNotification(`Bulk Import Successful: ${addedCount} added, ${updatedCount} updated.`, 'success');
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteProduct(deleteId);
    dispatchNotification(`Product ${deleteId} has been deleted.`, 'danger');
    setDeleteId(null);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All Statuses' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-textMain">Products</h2>
          <p className="text-sm text-textMuted mt-0.5">Manage your product catalog and inventory.</p>
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
          <Button
            variant="secondary"
            onClick={() => setIsBulkImportOpen(true)}
            className="flex-1 sm:flex-none h-10 px-3 md:px-4 border-primary/20 hover:bg-primary/10 text-primary"
          >
            <Upload className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Bulk Import</span>
          </Button>
          <Link to="/products/new" className="flex-1 sm:flex-none">
            <Button className="w-full h-10 px-3 md:px-4">
              <Package className="w-4 h-4 mr-2 hidden sm:inline" />
              Add <span className="hidden sm:inline">Product</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 md:h-10 pl-10 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-textMain placeholder:text-textMuted transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <select
              className="w-full h-11 md:h-10 bg-card border border-border text-textMain rounded-xl pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Statuses</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted pointer-events-none" />
          </div>
        </div>
      </div>

      {view === 'table' ? (
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
                {filteredProducts.length === 0 && (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-textMuted font-medium">No products found matching your criteria.</td></tr>
                )}
                <AnimatePresence>
                  {filteredProducts.map((product) => (
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
                      <td className="px-6 py-4 text-textMain font-bold">{typeof product.price === 'number' ? `₹${product.price.toLocaleString('en-IN')}` : product.price}</td>
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
                            onClick={() => setDeleteId(product.id)}
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

            <div className="block md:hidden divide-y divide-border">
              {filteredProducts.map((product) => (
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
                      <p className="text-sm font-bold text-textMain">{typeof product.price === 'number' ? `₹${product.price.toLocaleString('en-IN')}` : product.price}</p>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded-lg border border-border/50">
                      <p className="text-[10px] uppercase font-bold text-textMuted mb-1">In Stock</p>
                      <p className="text-sm font-bold text-textMain">{product.stock} units</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/products/${product.id}/edit`} className="flex-1">
                      <Button variant="secondary" className="w-full h-9 text-xs">
                        <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      className="h-9 px-3"
                      onClick={() => setDeleteId(product.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={product.id}
              >
                <Card className="glass relative group hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="p-5 md:p-6">
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
                        <span className="text-lg font-bold">{typeof product.price === 'number' ? `₹${product.price.toLocaleString('en-IN')}` : product.price}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-black/5 dark:bg-white/5">
                        <span className="text-textMuted text-xs font-bold uppercase">Stock Level</span>
                        <span className={product.stock < (product.minQuantity || 10) ? 'text-rose-500' : ''}>{product.stock} units</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                      <span className="text-[10px] font-bold text-textMuted tracking-wider uppercase">ID: {product.id}</span>
                      <div className="flex space-x-1">
                        <Link to={`/products/${product.id}/edit`}>
                          <button className="p-2 text-textMuted hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={(e) => { e.preventDefault(); setDeleteId(product.id); }}
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
      )}
      
      <AlertModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete product ${deleteId}? This will permanently remove it from your catalog.`}
        confirmText="Remove Product"
        variant="danger"
      />
      
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleBulkImport}
      />
    </div>
  );
}
