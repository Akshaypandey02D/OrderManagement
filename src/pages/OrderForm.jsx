import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Package, 
  User, 
  CreditCard, 
  Plus, 
  Trash2, 
  Calendar, 
  GripVertical,
  Star,
  ArrowLeft
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useOrderStore } from '../stores/useOrderStore';
import { useProductStore } from '../stores/useProductStore';
import { orderService } from '../services/orderService';

const orderSchema = z.object({
  customer: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().refine(val => !val || /^\d{10}$/.test(val.replace(/\D/g, '')), {
    message: 'Phone number must be 10 digits'
  }),
  date: z.date({
    required_error: "Order date is required",
    invalid_type_error: "Invalid date format",
  }),
  priority: z.enum(['Normal', 'High']),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().min(1)
  })).min(1, 'Please add at least one product to the order')
});

const steps = [
  { id: 1, title: 'Customer Details', icon: User },
  { id: 2, title: 'Order Items', icon: Package },
  { id: 3, title: 'Shipping & Payment', icon: CreditCard },
];

export default function OrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const { getOrderById, updateOrder } = useOrderStore();
  const { products } = useProductStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer: '',
      email: '',
      phone: '',
      date: new Date(),
      priority: 'Normal',
      items: []
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'items'
  });

  const formItems = watch('items');

  useEffect(() => {
    if (isEditing) {
      const order = getOrderById(id);
      if (order) {
        setValue('customer', order.customer);
        setValue('email', order.email);
        setValue('phone', order.phone);
        setValue('date', new Date(order.date));
        setValue('priority', order.priority || 'Normal');
        setValue('items', order.items || []);
      }
    }
  }, [id, isEditing, getOrderById, setValue]);

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    let productPrice = product.price;
    if (typeof productPrice === 'string') {
       productPrice = Number(productPrice.replace(/[^0-9.-]+/g, ""));
    }

    append({
      id: product.id,
      name: product.name,
      price: productPrice,
      quantity: quantity
    });
    
    setIsAddingItem(false);
    setSelectedProductId('');
    setQuantity(1);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
  };

  const onSubmit = (data) => {
    const submissionData = {
      ...data,
      date: data.date.toISOString().split('T')[0]
    };

    if (isEditing) {
      updateOrder(id, submissionData);
      navigate('/orders');
    } else {
      orderService.createOrder(submissionData);
      navigate('/orders');
    }
  };

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) fieldsToValidate = ['customer', 'email', 'phone', 'date', 'priority'];
    if (currentStep === 2) fieldsToValidate = ['items'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(s => Math.min(s + 1, 3));
    }
  };

  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-textMain">
              {isEditing ? `Edit Order #${id}` : 'Create New Order'}
            </h2>
            <p className="text-sm text-textMuted mt-1">
              {isEditing ? 'Update the details for this order.' : 'Fill out the details below to manage your order.'}
            </p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="relative mb-12 max-w-2xl mx-auto px-4">
        <div className="absolute top-6 left-6 right-6 h-1 bg-border rounded-full z-0" />
        <div className="absolute top-6 left-6 h-1 bg-primary rounded-full z-0 transition-all duration-700 ease-out" 
             style={{ width: `calc(${((currentStep - 1) / 2) * 100}% - ${currentStep === 1 ? '0px' : '24px'})` }} />
        
        <div className="relative z-10 flex justify-between">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ease-in-out ${
                  isCompleted 
                    ? 'bg-primary border-primary text-white shadow-lg' 
                    : isCurrent 
                      ? 'bg-card border-primary text-primary shadow-xl shadow-primary/10' 
                      : 'bg-card border-border text-textMuted'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`mt-4 text-xs font-bold transition-all duration-300 ${
                  isCurrent ? 'text-primary' : isCompleted ? 'text-textMain' : 'text-textMuted'
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="glass shadow-xl border-white/5">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6 md:p-8 lg:p-10"
              >
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-2 border-b border-border pb-4">
                      <User className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-medium text-textMain">Customer Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-textMuted">Customer Name *</label>
                        <Input 
                          placeholder="e.g. John Doe" 
                          {...register('customer')}
                          error={errors.customer?.message}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-textMuted">Email Address *</label>
                        <Input 
                          type="email" 
                          placeholder="john@example.com"
                          {...register('email')}
                          error={errors.email?.message}
                        />
                      </div>
                      
                      {/* Priority Toggle */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-textMuted">Order Priority</label>
                        <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-border">
                          {['Normal', 'High'].map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setValue('priority', p)}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                watch('priority') === p 
                                  ? 'bg-card text-primary shadow-md border border-primary/20' 
                                  : 'text-textMuted hover:text-textMain'
                              }`}
                            >
                              {p === 'High' && <Star className={`w-3 h-3 ${watch('priority') === 'High' ? 'fill-primary' : ''}`} />}
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Date Picker */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-textMuted block">Order Date *</label>
                        <Controller
                          control={control}
                          name="date"
                          render={({ field }) => (
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted z-10 pointer-events-none" />
                              <DatePicker
                                selected={field.value}
                                onChange={(date) => field.onChange(date)}
                                className={`w-full h-10 bg-card border border-border rounded-lg pl-10 pr-4 text-sm text-textMain focus:ring-2 focus:ring-primary outline-none transition-all ${errors.date ? 'border-rose-500' : ''}`}
                                dateFormat="MMMM d, yyyy"
                              />
                            </div>
                          )}
                        />
                        {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date.message}</p>}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-textMuted">Phone Number</label>
                        <Input 
                          placeholder="e.g. 9876543210" 
                          {...register('phone')}
                          error={errors.phone?.message}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-medium text-textMain">Order Items</h3>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        {errors.items && <span className="text-rose-500 text-xs font-medium">{errors.items.message}</span>}
                        {fields.length > 0 && !isAddingItem && (
                          <Button type="button" variant="secondary" size="sm" onClick={() => setIsAddingItem(true)} className="w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" /> Add Item
                          </Button>
                        )}
                      </div>
                    </div>

                    {fields.length === 0 && !isAddingItem ? (
                      <div className="border border-dashed border-border rounded-xl p-8 md:p-12 flex flex-col items-center justify-center text-center bg-black/5 dark:bg-white/5">
                         <div className="p-4 bg-primary/10 rounded-full mb-4">
                          <Package className="w-8 h-8 text-primary" />
                         </div>
                         <h4 className="text-textMain font-medium text-lg">No items added yet</h4>
                         <p className="text-textMuted text-sm mt-1 mb-6 max-w-xs">Search and select products from your inventory to build this order.</p>
                         <Button type="button" variant="primary" onClick={() => setIsAddingItem(true)}>Add Product</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {fields.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                              <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Order Manifest ({fields.length} modules)</p>
                              <p className="text-[10px] font-medium text-primary animate-pulse flex items-center gap-1.5">
                                <GripVertical className="w-3 h-3" /> Drag handle to reorder manifest
                              </p>
                            </div>
                            <DragDropContext onDragEnd={onDragEnd}>
                              <Droppable droppableId="order-items">
                                {(provided, snapshot) => (
                                  <div 
                                    {...provided.droppableProps} 
                                    ref={provided.innerRef}
                                    className={`space-y-3 p-1 rounded-2xl transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}
                                  >
                                    {fields.map((item, idx) => (
                                      <Draggable key={item.id} draggableId={item.id} index={idx}>
                                        {(provided, snapshot) => {
                                          const child = (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`p-4 bg-card border rounded-xl flex items-center gap-4 transition-shadow duration-200 select-none ${
                                                snapshot.isDragging 
                                                  ? 'shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-primary/60 scale-[1.05] bg-card/95 backdrop-blur-xl z-[9999]' 
                                                  : 'border-border hover:border-primary/20'
                                              }`}
                                              style={{
                                                ...provided.draggableProps.style,
                                                cursor: snapshot.isDragging ? 'grabbing' : 'grab'
                                              }}
                                            >
                                              <div 
                                                {...provided.dragHandleProps} 
                                                className={`p-2 rounded-lg transition-colors ${snapshot.isDragging ? 'text-primary bg-primary/20' : 'text-textMuted hover:text-primary hover:bg-primary/5'}`}
                                              >
                                                <GripVertical className="w-5 h-5" />
                                              </div>
                                              
                                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black uppercase text-xs shrink-0 transition-all ${
                                                snapshot.isDragging ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-primary/10 text-primary'
                                              }`}>
                                                 {item.name.charAt(0)}
                                              </div>
    
                                              <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold truncate text-sm transition-colors ${snapshot.isDragging ? 'text-primary' : 'text-textMain'}`}>
                                                  {item.name}
                                                </h4>
                                                <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-0.5 opacity-60">
                                                  ID: {item.id.split('-')[0]}... | Unit: ₹{item.price.toLocaleString('en-IN')}
                                                </p>
                                              </div>
    
                                              <div className="flex items-center gap-6">
                                                <div className="text-center px-2">
                                                  <p className="text-[8px] font-black text-textMuted uppercase tracking-widest mb-1">QTY</p>
                                                  <div className={`text-sm font-black transition-all ${snapshot.isDragging ? 'scale-110 text-primary' : 'text-textMain'}`}>
                                                    {item.quantity}
                                                  </div>
                                                </div>
                                                <div className="text-right min-w-[80px]">
                                                  <p className="text-[8px] font-black text-textMuted uppercase tracking-widest mb-1">Total</p>
                                                  <p className={`text-sm font-black italic transition-all ${snapshot.isDragging ? 'scale-110 text-primary' : 'text-textMain'}`}>
                                                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                                  </p>
                                                </div>
                                                {!snapshot.isDragging && (
                                                  <button 
                                                    type="button"
                                                    onClick={() => remove(idx)} 
                                                    className="p-1.5 text-textMuted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          );

                                          // Use portal when dragging to avoid clipping by parents
                                          if (snapshot.isDragging) {
                                            return createPortal(child, document.body);
                                          }
                                          return child;
                                        }}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </DragDropContext>
                          </div>
                        )}

                        {isAddingItem && (
                          <div className="p-6 border border-primary/20 bg-primary/5 rounded-xl space-y-6">
                            <h4 className="text-sm font-bold text-textMain flex items-center">
                              <Plus className="w-4 h-4 mr-2 text-primary" />
                              Select Product
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="md:col-span-3">
                                <label className="text-xs font-medium text-textMuted mb-1 block">Product Search</label>
                                <select 
                                  className="w-full h-10 bg-card border border-border rounded-lg px-3 text-sm text-textMain focus:ring-2 focus:ring-primary outline-none"
                                  value={selectedProductId}
                                  onChange={(e) => setSelectedProductId(e.target.value)}
                                >
                                  <option value="" disabled>Search mission-critical module...</option>
                                  {products.map(p => {
                                    const priceStr = typeof p.price === 'string' ? p.price : `₹${p.price.toLocaleString('en-IN')}`;
                                    return <option key={p.id} value={p.id}>{p.name} ({priceStr})</option>
                                  })}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-textMuted mb-1 block">Quantity</label>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  value={quantity} 
                                  onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                                  className="h-10 text-center"
                                />
                              </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                              <Button type="button" onClick={handleAddItem} disabled={!selectedProductId} className="flex-1">
                                Add to List
                              </Button>
                              <Button type="button" variant="secondary" onClick={() => setIsAddingItem(false)} className="flex-1">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-2 border-b border-border pb-4">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-medium text-textMain">Shipping & Payment</h3>
                    </div>
                    <div className="space-y-6">
                       <div className="space-y-2">
                         <label className="text-sm font-medium text-textMuted">Shipping Method</label>
                         <select className="w-full h-10 bg-card border border-border rounded-lg px-3 text-sm text-textMain focus:ring-2 focus:ring-primary outline-none">
                           <option>Standard Shipping (3-5 days)</option>
                           <option>Express Shipping (1-2 days)</option>
                           <option>Next Day Delivery (24-48h)</option>
                         </select>
                       </div>
                       <div className="space-y-2">
                         <label className="text-sm font-medium text-textMuted">Special Instructions / Notes</label>
                         <textarea 
                           rows={5}
                           className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-textMain focus:ring-2 focus:ring-primary placeholder:text-textMuted outline-none resize-none"
                           placeholder="Enter any additional details about the order..."
                         ></textarea>
                       </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="p-6 bg-black/5 dark:bg-white/5 border-t border-border flex flex-col-reverse sm:flex-row justify-between gap-4">
              <Button 
                 type="button"
                 variant="secondary" 
                 onClick={prevStep}
                 disabled={currentStep === 1}
                 className={`${currentStep === 1 ? 'hidden' : 'flex'} w-full sm:w-auto`}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              
              <div className="flex-1 hidden sm:block" />

              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep} className="w-full sm:w-auto min-w-[140px]">
                  Next Step <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white min-w-[160px]">
                  <Check className="w-4 h-4 mr-2" /> {isEditing ? 'Update Order' : 'Create Order'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
