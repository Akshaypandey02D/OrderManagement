import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Package, 
  User, 
  CreditCard, 
  ArrowLeft
} from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useOrderStore } from '../stores/useOrderStore';
import { useProductStore } from '../stores/useProductStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { orderService } from '../services/orderService';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorView } from '../components/ui/ErrorView';
import { EmptyState } from '../components/ui/EmptyState';
import { ShoppingBag } from 'lucide-react';

// Extracted Components
import OrderStepper from '../components/Orders/Form/OrderStepper';
import StepCustomerDetails from '../components/Orders/Form/StepCustomerDetails';
import StepOrderItems from '../components/Orders/Form/StepOrderItems';
import StepShippingReview from '../components/Orders/Form/StepShippingReview';

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
  shippingMethod: z.string().min(1, 'Please select a shipping method'),
  shippingAddress: z.string().min(5, 'Shipping address is required'),
  notes: z.string().optional(),
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
  const { dispatchNotification } = useNotificationStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

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
      shippingMethod: 'Standard Shipping (3-5 days)',
      shippingAddress: '',
      notes: '',
      items: []
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'items'
  });

  const formItems = watch('items');

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!isEditing) {
      const savedDraft = localStorage.getItem('order-form-draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          Object.keys(draft).forEach(key => {
            if (key === 'date' && draft[key]) {
              setValue(key, new Date(draft[key]));
            } else {
              setValue(key, draft[key]);
            }
          });
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
    }
  }, [isEditing, setValue]);

  // Save draft to localStorage on change
  useEffect(() => {
    if (!isEditing) {
      const subscription = watch((value) => {
        localStorage.setItem('order-form-draft', JSON.stringify(value));
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, isEditing]);

  // Load existing order for editing
  useEffect(() => {
    if (isEditing) {
      const order = getOrderById(id);
      if (order) {
        setValue('customer', order.customer);
        setValue('email', order.email);
        setValue('phone', order.phone);
        setValue('date', new Date(order.date));
        setValue('priority', order.priority || 'Normal');
        setValue('shippingMethod', order.shippingMethod || 'Standard Shipping (3-5 days)');
        setValue('shippingAddress', order.shippingAddress || '');
        setValue('notes', order.notes || '');
        setValue('items', order.items || []);
      }
    }
  }, [id, isEditing, getOrderById, setValue]);

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    // Inventory Check
    const existingItem = formItems.find(item => item.id === selectedProductId);
    const existingQuantity = existingItem ? existingItem.quantity : 0;
    const totalNewQuantity = existingQuantity + quantity;

    if (totalNewQuantity > product.stock) {
      dispatchNotification(
        `Insufficient Stock: Only ${product.stock} units of ${product.name} available.`, 
        'danger'
      );
      return;
    }

    let productPrice = product.price;
    if (typeof productPrice === 'string') {
       productPrice = Number(productPrice.replace(/[^0-9.-]+/g, ""));
    }

    if (existingItem) {
      const updatedItems = formItems.map(item => 
        item.id === selectedProductId 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      setValue('items', updatedItems);
    } else {
      append({
        id: product.id,
        name: product.name,
        price: productPrice,
        quantity: quantity
      });
    }
    
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
      localStorage.removeItem('order-form-draft');
      navigate('/orders');
    }
  };

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) fieldsToValidate = ['customer', 'email', 'phone', 'date', 'priority'];
    if (currentStep === 2) fieldsToValidate = ['items'];
    if (currentStep === 3) fieldsToValidate = ['shippingMethod', 'shippingAddress'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(s => Math.min(s + 1, 3));
    }
  };

  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ErrorView 
          title="Wizard Boot Failure" 
          message="The order creation wizard failed to initialize the multi-step state engine."
          onRetry={() => { setIsError(false); setIsLoading(true); }}
        />
      </div>
    );
  }

  const order = isEditing ? getOrderById(id) : null;
  if (!isLoading && isEditing && !order) {
    return (
      <div className="py-20 max-w-2xl mx-auto">
        <EmptyState 
          icon={ShoppingBag}
          title="Ghost Order"
          description={`The order identifier "${id}" has vanished from our tracking matrix.`}
          actionLabel="View All Orders"
          actionLink="/orders"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-10 px-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex justify-between gap-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-10 flex-1 rounded-xl" />)}
        </div>
        <Card className="glass p-10 space-y-8">
           <div className="space-y-6">
             {Array(4).fill(0).map((_, i) => (
               <div key={i} className="space-y-2">
                 <Skeleton className="h-4 w-32" />
                 <Skeleton className="h-12 w-full rounded-xl" />
               </div>
             ))}
           </div>
           <div className="flex justify-between pt-6 border-t border-border">
             <Skeleton className="h-10 w-24 rounded-lg" />
             <Skeleton className="h-10 w-32 rounded-lg" />
           </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 px-4">
      <div className="flex flex-col space-y-6">
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={() => navigate('/orders')}
          className="rounded-xl shadow-sm hover:border-primary/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
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

      <OrderStepper steps={steps} currentStep={currentStep} />

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
                  <StepCustomerDetails 
                    register={register} 
                    errors={errors} 
                    control={control} 
                    setValue={setValue} 
                    watch={watch} 
                  />
                )}

                {currentStep === 2 && (
                  <StepOrderItems 
                    fields={fields}
                    onDragEnd={onDragEnd}
                    remove={remove}
                    isAddingItem={isAddingItem}
                    setIsAddingItem={setIsAddingItem}
                    selectedProductId={selectedProductId}
                    setSelectedProductId={setSelectedProductId}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    handleAddItem={handleAddItem}
                    products={products}
                    errors={errors}
                  />
                )}

                {currentStep === 3 && (
                  <StepShippingReview 
                    register={register} 
                    errors={errors} 
                    formItems={formItems} 
                  />
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
