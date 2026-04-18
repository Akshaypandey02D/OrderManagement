import { CreditCard, CheckCircle2 } from 'lucide-react';

export default function StepShippingReview({ register, errors, formItems }) {
  const subtotal = formItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 50;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2 border-b border-border pb-4">
        <CreditCard className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-medium text-textMain">Shipping & Review</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-textMuted">Shipping Method *</label>
            <select 
              {...register('shippingMethod')}
              className={`w-full h-10 bg-card border border-border rounded-lg px-3 text-sm text-textMain focus:ring-2 focus:ring-primary outline-none ${errors.shippingMethod ? 'border-rose-500' : ''}`}
            >
              <option>Standard Shipping (3-5 days)</option>
              <option>Express Shipping (1-2 days)</option>
              <option>Next Day Delivery (24-48h)</option>
            </select>
            {errors.shippingMethod && <p className="text-xs text-rose-500">{errors.shippingMethod.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-textMuted">Shipping Address *</label>
            <textarea 
              {...register('shippingAddress')}
              rows={3}
              className={`w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-textMain focus:ring-2 focus:ring-primary placeholder:text-textMuted outline-none resize-none ${errors.shippingAddress ? 'border-rose-500' : ''}`}
              placeholder="e.g. 45th Main St, Suite 500, Bangalore, KA, 560001"
            ></textarea>
            {errors.shippingAddress && <p className="text-xs text-rose-500">{errors.shippingAddress.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-textMuted">Order Notes (Optional)</label>
            <textarea 
              {...register('notes')}
              rows={3}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-textMain focus:ring-2 focus:ring-primary placeholder:text-textMuted outline-none resize-none"
              placeholder="e.g. Please leave at front desk and handle with care."
            ></textarea>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 border border-border border-dashed">
            <h4 className="text-xs font-black uppercase tracking-widest text-textMuted mb-4">Order Summary</h4>
            <div className="space-y-3">
              {formItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-textMuted">{item.name} x{item.quantity}</span>
                  <span className="font-bold text-textMain">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-border mt-4 space-y-2">
                <div className="flex justify-between text-xs font-bold text-textMuted uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-textMuted uppercase tracking-widest">
                  <span>Shipping</span>
                  <span>₹{shipping}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-primary pt-2">
                  <span>Total Amount</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div className="items-start flex gap-3 text-primary">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium leading-relaxed">
                By creating this order, inventory levels will be adjusted automatically. You can modify this order later from the listing page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
