import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Trash2, Check, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useProductStore } from '../stores/useProductStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useState } from 'react';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorView } from '../components/ui/ErrorView';
import { EmptyState } from '../components/ui/EmptyState';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  stock: z.coerce.number().int().min(0, 'Stock must be 0 or greater'),
  minQuantity: z.coerce.number().int().min(0, 'Minimum quantity must be 0 or greater'),
  description: z.string().optional()
});

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { products, addProduct, updateProduct, deleteProduct, getProductById } = useProductStore();
  const { dispatchNotification } = useNotificationStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      price: '',
      stock: '',
      minQuantity: 10,
      description: ''
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isEditing) {
      const product = getProductById(id);
      if (product) {
        let price = product.price;
        if (typeof price === 'string') {
          price = Number(price.replace(/[^0-9.-]+/g, ""));
        }
        
        setValue('name', product.name);
        setValue('sku', product.sku);
        setValue('price', price);
        setValue('stock', product.stock);
        setValue('minQuantity', product.minQuantity || 10);
        setValue('description', product.description || '');
      }
    }
  }, [id, isEditing, getProductById, setValue]);

  const onSubmit = (data) => {
    const status = data.stock === 0 ? 'Out of Stock' : data.stock < data.minQuantity ? 'Low Stock' : 'In Stock';
    const productData = {
      ...data,
      status
    };

    if (isEditing) {
      updateProduct(id, productData);
      dispatchNotification(`Product ${id} updated successfully`, 'success');
    } else {
      const newProduct = {
        ...productData,
        id: `PRD-${Math.floor(Math.random() * 10000)}`
      };
      addProduct(newProduct);
      dispatchNotification(`Product ${newProduct.name} added to catalog`, 'success');
    }
    navigate('/products');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      dispatchNotification('Product deleted', 'danger');
      navigate('/products');
    }
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ErrorView 
          title="Configuration Failure" 
          message="The validation engine failed to initialize the form buffers."
          onRetry={() => { setIsError(false); setIsLoading(true); }}
        />
      </div>
    );
  }

  const product = isEditing ? getProductById(id) : null;
  if (!isLoading && isEditing && !product) {
    return (
      <div className="py-20 max-w-2xl mx-auto">
        <EmptyState 
          icon={Package}
          title="Unknown Product"
          description={`The product with SKU/ID "${id}" does not exist in the active catalog.`}
          actionLabel="View Catalog"
          actionLink="/products"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-10 px-4">
        <div className="flex justify-between items-center h-10">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-24 h-10 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Card className="glass p-8 space-y-8">
           <Skeleton className="h-6 w-48" />
           <div className="grid grid-cols-2 gap-6">
             <div className="col-span-2 space-y-2">
               <Skeleton className="h-4 w-32" />
               <Skeleton className="h-12 w-full rounded-xl" />
             </div>
             {Array(4).fill(0).map((_, i) => (
               <div key={i} className="space-y-2">
                 <Skeleton className="h-4 w-20" />
                 <Skeleton className="h-12 w-full rounded-xl" />
               </div>
             ))}
             <div className="col-span-2 space-y-2">
               <Skeleton className="h-4 w-32" />
               <Skeleton className="h-32 w-full rounded-xl" />
             </div>
           </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-start">
          <Button 
            variant="secondary" 
            size="icon" 
            onClick={() => navigate('/products')}
            className="rounded-xl shadow-sm hover:border-primary/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {isEditing && (
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          )}
        </div>
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-textMain">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-sm text-textMuted mt-1 uppercase tracking-widest font-black opacity-50">
            {isEditing ? `Stock Module Configuration` : 'Initialize New Inventory Asset'}
          </p>
        </div>
      </div>

      <Card className="glass shadow-xl border-white/5">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b border-border mb-6">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium text-textMain">General Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-textMuted">Product Name *</label>
                <Input 
                  placeholder="e.g. Ultra-Wide 4K Monitor" 
                  {...register('name')}
                  error={errors.name?.message}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-textMuted">SKU *</label>
                <Input 
                  placeholder="e.g. MON-4K-2026" 
                  {...register('sku')}
                  error={errors.sku?.message}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-textMuted">Price (INR) *</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="e.g. 24999.00" 
                  {...register('price')}
                  error={errors.price?.message}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-textMuted">Initial Stock *</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 100" 
                  {...register('stock')}
                  error={errors.stock?.message}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-textMuted">Low Stock Alert Level</label>
                <Input 
                  type="number" 
                  placeholder="Default is 10" 
                  {...register('minQuantity')}
                  error={errors.minQuantity?.message}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-textMuted">Description</label>
                <textarea 
                  rows={4}
                  className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-textMain focus:ring-2 focus:ring-primary placeholder:text-textMuted outline-none resize-none"
                  placeholder="e.g. Describe product specifications, warranty details, and key features..."
                  {...register('description')}
                ></textarea>
                {errors.description && <p className="text-xs text-rose-500">{errors.description.message}</p>}
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-border">
              <Button type="button" variant="secondary" onClick={() => navigate('/products')}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary-hover text-primary-foreground min-w-[120px]">
                <Check className="w-4 h-4 mr-2" /> {isEditing ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
