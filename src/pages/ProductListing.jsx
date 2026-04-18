import { useState } from 'react';
import { Search, Filter, LayoutGrid, List, Package, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProductStore } from '../stores/useProductStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { Button } from '../components/ui/Button';
import { AlertModal } from '../components/ui/Modal';
import { BulkImportModal } from '../components/Inventory/BulkImportModal';
import ProductTable from '../components/Inventory/ProductTable';
import ProductGrid from '../components/Inventory/ProductGrid';

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
        <ProductTable products={filteredProducts} onDeleteClick={setDeleteId} />
      ) : (
        <ProductGrid products={filteredProducts} onDeleteClick={setDeleteId} />
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
