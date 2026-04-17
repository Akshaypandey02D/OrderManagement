import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAppContext } from '../core/AppContext';

export default function ProductForm() {
  const { products, setProducts, dispatchNotification } = useAppContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    minQuantity: '',
    description: '',
    status: 'In Stock'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      const found = products.find(p => p.id === id);
      if (found) {
        setFormData({
          name: found.name || '',
          sku: found.sku || '',
          price: found.price ? found.price.toString().replace(/[^0-9.]/g, '') : '',
          stock: found.stock || '',
          minQuantity: found.minQuantity || '',
          description: found.description || '',
          status: found.status || 'In Stock'
        });
      }
    }
  }, [id, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) newErrors.price = 'Enter a valid price greater than or equal to 0';
    if (formData.stock === '' || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) newErrors.stock = 'Enter a valid stock quantity (0 or more)';
    if (formData.minQuantity === '' || isNaN(Number(formData.minQuantity)) || Number(formData.minQuantity) < 0) newErrors.minQuantity = 'Enter a valid minimum quantity (0 or more)';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    let updated;

    const formattedPrice = `₹${Number(formData.price).toLocaleString('en-IN')}`;

    if (isEditing) {
      updated = products.map(p => {
        if (p.id === id) {
          return {
            ...p,
            name: formData.name,
            sku: formData.sku,
            price: formattedPrice,
            stock: Number(formData.stock),
            minQuantity: Number(formData.minQuantity),
            description: formData.description,
            status: formData.status
          };
        }
        return p;
      });
      dispatchNotification(`Product ${id} updated successfully.`, 'success');
    } else {
      const id = `PRD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      const newProduct = {
        id,
        name: formData.name,
        sku: formData.sku,
        price: formattedPrice,
        stock: Number(formData.stock),
        minQuantity: Number(formData.minQuantity),
        description: formData.description,
        status: formData.status
      };
      updated = [newProduct, ...products];
      dispatchNotification(`Product ${newProduct.id} created successfully.`, 'success');
    }

    setProducts(updated);
    navigate('/products');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 pb-10 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 text-textMuted hover:text-textMain hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all border border-border sm:border-transparent"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-textMain">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>
        <div className="sm:hidden -mt-2">
            <p className="text-sm text-textMuted">
              {isEditing ? 'Update the details for this product.' : 'Fill out the details to add a new product.'}
            </p>
        </div>
        <div className="hidden sm:block">
          <p className="text-textMuted text-sm ml-2 border-l border-border pl-4">
            {isEditing ? 'Update product record' : 'Create a new catalog entry'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="glass p-4 md:p-8 space-y-6 shadow-xl border-white/5">
          <div className="flex items-center space-x-3 mb-2 pb-4 border-b border-border">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-textMain tracking-tight">Product Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Product Name</label>
              <Input
                type="text"
                placeholder="e.g. MacBook Pro 16&quot;"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                className="h-11 md:h-10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-textMuted">SKU / Serial</label>
              <Input
                type="text"
                placeholder="e.g. MBP-16-M3"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                error={errors.sku}
                className="h-11 md:h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Price (₹)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="2499.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                error={errors.price}
                className="h-11 md:h-10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Inventory</label>
              <Input
                type="number"
                placeholder="45"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                error={errors.stock}
                className="h-11 md:h-10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Min. Stock</label>
              <Input
                type="number"
                placeholder="10"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                error={errors.minQuantity}
                className="h-11 md:h-10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Status</label>
              <select
                className="w-full h-11 md:h-10 px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-textMain appearance-none cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-textMuted">Description</label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-textMain placeholder:text-textMuted resize-none transition-all"
              placeholder="Provide a detailed description of the product..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => navigate('/products')} className="w-full sm:w-auto h-11 md:h-10">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto h-11 md:h-10 shadow-lg">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
