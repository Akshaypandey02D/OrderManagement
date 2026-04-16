import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Package, User, CreditCard, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAppContext } from '../core/AppContext';

const steps = [
  { id: 1, title: 'Customer Details', icon: User },
  { id: 2, title: 'Order Items', icon: Package },
  { id: 3, title: 'Shipping & Payment', icon: CreditCard },
];

export default function OrderForm() {
  const { products, setProducts, orders, setOrders, dispatchNotification } = useAppContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Mock form state
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    orderItems: [],
  });

  useEffect(() => {
    if (isEditing) {
      const found = orders.find(o => o.id === id);
      if (found) {
        setFormData({
          customerName: found.customer || '',
          email: found.email || '',
          phone: found.phone || '',
          orderItems: found.items || []
        });
      }
    }
  }, [id, isEditing]);

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    let productPrice = product.price;
    if (typeof productPrice === 'string') {
       productPrice = Number(productPrice.replace(/[^0-9.-]+/g, ""));
    }

    setFormData({
      ...formData,
      orderItems: [...(formData.orderItems || []), { ...product, price: productPrice, quantity }]
    });
    setIsAddingItem(false);
    setSelectedProductId('');
    setQuantity(1);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...(formData.orderItems || [])];
    newItems.splice(index, 1);
    setFormData({ ...formData, orderItems: newItems });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const newErrors = {};
      if (!formData.customerName) newErrors.customerName = 'Customer name is required';
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (formData.phone) {
        const digitsOnly = formData.phone.replace(/\D/g, '');
        if (digitsOnly.length !== 10) {
          newErrors.phone = 'Phone number must be exactly 10 digits';
        }
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    if (currentStep === 2) {
      if (!formData.orderItems || formData.orderItems.length === 0) {
         setErrors({ items: 'Please add at least one product to the order' });
         return;
      }
    }
    
    setErrors({});
    if (currentStep < 3) setCurrentStep(c => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate total amount
    const totalAmount = formData.orderItems?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
    const date = new Date().toISOString().split('T')[0];
    
    let updatedOrders;
    let newProducts = [...products];
    let stockAlerts = [];

    if (isEditing) {
      const oldOrder = orders.find(o => o.id === id);
      const oldItems = oldOrder?.items || [];
      const newItems = formData.orderItems || [];

      // Create a map of changes per product ID
      const productChanges = {}; // productId -> quantity change

      // Restore old quantities (add them back to product stock effectively)
      oldItems.forEach(item => {
        productChanges[item.id] = (productChanges[item.id] || 0) + item.quantity;
      });

      // Deduct new quantities
      newItems.forEach(item => {
        productChanges[item.id] = (productChanges[item.id] || 0) - item.quantity;
      });

      // Apply changes to products
      newProducts = products.map(p => {
        if (productChanges[p.id]) {
          const newStock = Math.max(0, p.stock + productChanges[p.id]);
          // Notify if stock specifically dropped below minimum during this edit
          if (newStock < (p.minQuantity || 0) && productChanges[p.id] < 0) {
            stockAlerts.push(`${p.name} (Now ${newStock} left)`);
          }
          return { 
            ...p, 
            stock: newStock, 
            status: newStock === 0 ? 'Out of Stock' : newStock < (p.minQuantity || 0) ? 'Low Stock' : 'In Stock' 
          };
        }
        return p;
      });

      updatedOrders = orders.map(o => {
        if (o.id === id) {
          return {
            ...o,
            customer: formData.customerName,
            email: formData.email,
            phone: formData.phone,
            amount: `$${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
            items: formData.orderItems
          };
        }
        return o;
      });
      dispatchNotification(`Order ${id} updated successfully.`, 'success');
    } else {
      const newOrder = {
        id: `ORD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        customer: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        date: date,
        amount: `$${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
        status: 'Pending',
        priority: 'Normal',
        items: formData.orderItems
      };
      updatedOrders = [newOrder, ...orders];
      dispatchNotification(`Order ${newOrder.id} created successfully.`, 'success');
      
      // Reduce product stock and check for low stock
      newProducts = products.map(p => {
        const orderedItem = formData.orderItems.find(item => item.id === p.id);
        if (orderedItem) {
          const newStock = Math.max(0, p.stock - orderedItem.quantity);
          if (newStock < (p.minQuantity || 0)) {
            stockAlerts.push(`${p.name} (Now ${newStock} left)`);
          }
          return { ...p, stock: newStock, status: newStock === 0 ? 'Out of Stock' : newStock < (p.minQuantity || 0) ? 'Low Stock' : 'In Stock' };
        }
        return p;
      });
    }

    setProducts(newProducts);
    if (stockAlerts.length > 0) {
      dispatchNotification(`Low Stock Alert: ${stockAlerts.join(', ')} dropped below minimum.`, 'warning');
    }

    setOrders(updatedOrders);

    // Finish logic
    navigate('/orders');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-textMain">{isEditing ? `Edit Order ${id}` : 'Create New Order'}</h2>
        <p className="text-textMuted mt-1">{isEditing ? 'Update the details for this order.' : 'Fill out the details below to generate a new order record.'}</p>
      </div>

      {/* Stepper */}
      <div className="relative mb-8 md:mb-16 max-w-2xl mx-auto px-2">
        {/* Background Track */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-border rounded-full z-0" />
        
        {/* Animated Progress Fill */}
        <div className="absolute top-6 left-6 h-1 bg-primary rounded-full z-0 transition-all duration-700 ease-out" 
             style={{ width: `calc(${((currentStep - 1) / 2) * 100}% - ${currentStep === 1 ? '0px' : '24px'})` }} />
        
        <div className="relative z-10 flex justify-between">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 md:border-4 transition-all duration-500 ease-in-out ${
                  isCompleted 
                    ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                    : isCurrent 
                      ? 'bg-background border-primary text-primary shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                      : 'bg-background border-border text-textMuted'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <Icon className="w-4 h-4 md:w-5 md:h-5" />}
                </div>
                <span className={`mt-3 md:mt-5 text-[10px] md:text-sm font-bold transition-all duration-300 ${
                  isCurrent ? 'text-primary' : isCompleted ? 'text-textMain' : 'text-textMuted'
                } ${isCurrent ? 'block' : 'hidden md:block'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Area */}
      <Card className="glass overflow-hidden shadow-xl border-white/5">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4 md:p-8"
            >
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-medium text-textMain">Customer Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-textMuted">Customer Name *</label>
                       <Input 
                         placeholder="e.g. Acme Corp" 
                         value={formData.customerName}
                         onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                         error={errors.customerName}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-textMuted">Email Address *</label>
                       <Input 
                         type="email" 
                         placeholder="contact@acme.com"
                         value={formData.email}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         error={errors.email}
                       />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-sm font-medium text-textMuted">Phone Number</label>
                       <Input 
                         placeholder="+1 (555) 000-0000" 
                         value={formData.phone}
                         onChange={(e) => setFormData({...formData, phone: e.target.value})}
                         error={errors.phone}
                       />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-medium text-textMain">Order Items</h3>
                    </div>
                    {errors.items && <span className="text-rose-500 text-sm font-medium">{errors.items}</span>}
                    {formData.orderItems?.length > 0 && !isAddingItem && (
                      <Button variant="secondary" size="sm" onClick={() => setIsAddingItem(true)} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" /> Add Item
                      </Button>
                    )}
                  </div>

                  {(!formData.orderItems || formData.orderItems.length === 0) && !isAddingItem ? (
                    <div className="border border-dashed border-border rounded-xl p-8 md:p-12 flex flex-col items-center justify-center text-center bg-black/5 dark:bg-white/5">
                       <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <Package className="w-8 h-8 text-primary" />
                       </div>
                       <h4 className="text-textMain font-medium text-lg">No items added yet</h4>
                       <p className="text-textMuted text-sm mt-1 mb-6 max-w-xs">Search and select products from your inventory to build this order.</p>
                       <Button variant="primary" onClick={() => setIsAddingItem(true)}>Add First Product</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.orderItems?.length > 0 && (
                        <div className=" rounded-lg overflow-hidden">
                          {/* Mobile View: Cards */}
                          <div className="block md:hidden space-y-3">
                            {formData.orderItems.map((item, idx) => (
                              <div key={idx} className="p-4 bg-card border border-border rounded-xl relative">
                                <button 
                                  onClick={() => handleRemoveItem(idx)} 
                                  className="absolute top-2 right-2 p-2 text-textMuted hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="space-y-1">
                                  <h4 className="font-bold text-textMain pr-8">{item.name}</h4>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-textMuted">Price: ${item.price.toFixed(2)}</span>
                                    <span className="text-textMuted">Qty: {item.quantity}</span>
                                  </div>
                                  <div className="pt-2 flex justify-between items-center border-t border-border mt-2">
                                    <span className="text-xs font-bold text-primary uppercase">Total</span>
                                    <span className="font-bold text-textMain text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Desktop View: Table */}
                          <div className="hidden md:block border border-border rounded-lg">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-black/5 dark:bg-white/5 border-b border-border text-textMuted">
                                <tr>
                                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Product</th>
                                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Price</th>
                                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-center">Qty</th>
                                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Total</th>
                                  <th className="px-4 py-3 text-right"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {formData.orderItems.map((item, idx) => (
                                  <tr key={idx} className="border-b border-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 text-textMain font-medium">{item.name}</td>
                                    <td className="px-4 py-3 text-textMuted">${item.price.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-textMuted text-center">{item.quantity}</td>
                                    <td className="px-4 py-3 text-textMain font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">
                                      <button onClick={() => handleRemoveItem(idx)} className="p-1.5 text-textMuted hover:text-rose-500 transition-colors rounded-md hover:bg-rose-500/10">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {isAddingItem && (
                        <div className="p-4 md:p-6 border border-primary/20 bg-primary/5 rounded-xl space-y-4">
                          <h4 className="text-sm font-bold text-textMain flex items-center">
                            <Plus className="w-4 h-4 mr-2 text-primary" />
                            Select Product to Add
                          </h4>
                          <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                              <div className="sm:col-span-3">
                                <label className="text-[10px] font-bold text-textMuted uppercase mb-1 block">Product</label>
                                <select 
                                  className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-textMain focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                  value={selectedProductId}
                                  onChange={(e) => setSelectedProductId(e.target.value)}
                                >
                                  <option value="" disabled>Choose a product from inventory...</option>
                                  {products.map(p => {
                                    const priceStr = typeof p.price === 'string' ? p.price : `$${p.price.toFixed(2)}`;
                                    return (
                                      <option key={p.id} value={p.id}>{p.name} ({priceStr})</option>
                                    )
                                  })}
                                </select>
                              </div>
                              <div className="">
                                <label className="text-[10px] font-bold text-textMuted uppercase mb-1 block">Quantity</label>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  value={quantity} 
                                  onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                                  placeholder="Qty"
                                  className="h-[42px]"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                              <Button onClick={handleAddItem} disabled={!selectedProductId} className="flex-1">
                                Add to Order
                              </Button>
                              <Button variant="secondary" onClick={() => setIsAddingItem(false)} className="flex-1">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-medium text-textMain">Finalize Order</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-textMuted">Shipping Method</label>
                       <select className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-textMain focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                         <option>Standard Shipping (3-5 days)</option>
                         <option>Express Shipping (1-2 days)</option>
                         <option>Overnight Delivery</option>
                       </select>
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-textMuted">Order Notes</label>
                       <textarea 
                         rows={4}
                         className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-textMain focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-textMuted outline-none resize-none"
                         placeholder="Any special instructions for picking, packing, or delivery?"
                       ></textarea>
                     </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="p-4 md:p-6 bg-black/5 dark:bg-white/5 border-t border-border flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button 
               variant="ghost" 
               onClick={handleBack}
               disabled={currentStep === 1}
               className={`${currentStep === 1 ? 'hidden' : 'flex'} w-full sm:w-auto h-11 md:h-10`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            <div className="flex-1 hidden sm:block" />

            {currentStep < 3 ? (
              <Button onClick={handleNext} className="w-full sm:w-auto h-11 md:h-10">
                Continue to Step {currentStep + 1} <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg w-full sm:w-auto h-11 md:h-10">
                <Check className="w-4 h-4 mr-2" /> {isEditing ? 'Save Changes' : 'Create Order'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
