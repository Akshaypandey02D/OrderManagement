import { User, Calendar, Star } from 'lucide-react';
import { Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { Input } from '../../ui/Input';

export default function StepCustomerDetails({ register, errors, control, setValue, watch }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2 border-b border-border pb-4">
        <User className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-medium text-textMain">Customer Details</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-textMuted">Customer Name *</label>
          <Input 
            placeholder="e.g. Acme Tech Solutions" 
            {...register('customer')}
            error={errors.customer?.message}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-textMuted">Email Address *</label>
          <Input 
            type="email" 
            placeholder="billing@acmetech.com"
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
            placeholder="e.g. +91 98765 43210" 
            {...register('phone')}
            error={errors.phone?.message}
          />
        </div>
      </div>
    </div>
  );
}
