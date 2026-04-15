import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Package, User, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const steps = [
  { id: 1, title: 'Customer Details', icon: User },
  { id: 2, title: 'Order Items', icon: Package },
  { id: 3, title: 'Shipping & Payment', icon: CreditCard },
];

export default function OrderForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Mock form state
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
  });

  const handleNext = () => {
    // Simple validation example for step 1
    if (currentStep === 1) {
      const newErrors = {};
      if (!formData.customerName) newErrors.customerName = 'Customer name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
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
    // Finish logic
    navigate('/orders');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">Create New Order</h2>
        <p className="text-zinc-400 mt-1">Fill out the details below to generate a new order record.</p>
      </div>

      {/* Stepper */}
      <div className="relative mb-12">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -translate-y-1/2 z-0" />
        <div className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500" 
             style={{ width: `${((currentStep - 1) / 2) * 100}%` }} />
        
        <div className="relative z-10 flex justify-between">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-primary border-primary text-white' 
                    : isCurrent 
                      ? 'bg-zinc-900 border-primary text-primary glow' 
                      : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`mt-3 text-sm font-medium ${isCurrent ? 'text-white' : 'text-zinc-500'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Area */}
      <Card className="glass overflow-hidden">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-white mb-4">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-zinc-300">Customer Name *</label>
                       <Input 
                         placeholder="e.g. Acme Corp" 
                         value={formData.customerName}
                         onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                         error={errors.customerName}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-zinc-300">Email Address *</label>
                       <Input 
                         type="email" 
                         placeholder="contact@acme.com"
                         value={formData.email}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         error={errors.email}
                       />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                       <label className="text-sm font-medium text-zinc-300">Phone Number</label>
                       <Input placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-white mb-4">Order Items</h3>
                  {/* Mock empty state or simple list */}
                  <div className="border border-dashed border-zinc-700 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                     <Package className="w-12 h-12 text-zinc-600 mb-3" />
                     <h4 className="text-white font-medium">No items added yet</h4>
                     <p className="text-zinc-500 text-sm mt-1 mb-4">Search and select products from your inventory.</p>
                     <Button variant="secondary" size="sm">Add Product</Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-white mb-4">Finalize Order</h3>
                  <div className="space-y-4">
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-zinc-300">Shipping Method</label>
                       <select className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:ring-primary focus:border-primary">
                         <option>Standard Shipping (3-5 days)</option>
                         <option>Express Shipping (1-2 days)</option>
                         <option>Overnight Delivery</option>
                       </select>
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-zinc-300">Order Notes</label>
                       <textarea 
                         rows={4}
                         className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:ring-primary focus:border-primary placeholder:text-zinc-500"
                         placeholder="Any special instructions?"
                       ></textarea>
                     </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="p-6 bg-zinc-900/50 border-t border-border flex justify-between">
            <Button 
               variant="ghost" 
               onClick={handleBack}
               disabled={currentStep === 1}
               className={currentStep === 1 ? 'invisible' : ''}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            
            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Continue to Step {currentStep + 1} <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Check className="w-4 h-4 mr-2" /> Create Order
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
