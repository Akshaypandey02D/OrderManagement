import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    description: '',
    status: 'In Stock'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      const saved = JSON.parse(localStorage.getItem('mockProducts') || '[]');
      const found = saved.find(p => p.id === id);
      if (found) {
        setFormData({
          name: found.name || '',
          sku: found.sku || '',
          price: found.price ? found.price.toString().replace(/[^0-9.]/g, '') : '',
          stock: found.stock || '',
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const existing = JSON.parse(localStorage.getItem('mockProducts') || '[]');
    let updated;

    const formattedPrice = `$${Number(formData.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    if (isEditing) {
      updated = existing.map(p => {
        if (p.id === id) {
          return {
            ...p,
            name: formData.name,
            sku: formData.sku,
            price: formattedPrice,
            stock: Number(formData.stock),
            description: formData.description,
            status: formData.status
          };
        }
        return p;
      });
    } else {
      const newProduct = {
        id: `PRD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: formData.name,
        sku: formData.sku,
        price: formattedPrice,
        stock: Number(formData.stock),
        description: formData.description,
        status: formData.status
      };
      updated = [newProduct, ...existing];
    }

    localStorage.setItem('mockProducts', JSON.stringify(updated));
    navigate('/products');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-zinc-400 mt-1">
            {isEditing ? 'Update the details for this product.' : 'Fill out the details to add a new product to your catalog.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="glass p-6 space-y-6">
          <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-border">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-white">Product Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Product Name</label>
              <Input
                type="text"
                placeholder="e.g. MacBook Pro 16&quot;"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">SKU</label>
              <Input
                type="text"
                placeholder="e.g. MBP-16-M3"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                error={errors.sku}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Price ($)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="2499.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                error={errors.price}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Initial Stock</label>
              <Input
                type="number"
                placeholder="45"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                error={errors.stock}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Status</label>
              <select
                className="w-full px-4 py-2 bg-zinc-900 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
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
            <label className="text-sm font-medium text-zinc-300">Description</label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 bg-zinc-900 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white resize-none"
              placeholder="Enter product description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => navigate('/products')}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
