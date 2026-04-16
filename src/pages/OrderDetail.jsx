import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Edit, Package, Truck, User, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { useAppContext } from '../core/AppContext';

export default function OrderDetail() {
  const { orders, setOrders, dispatchNotification } = useAppContext();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const order = orders.find(o => o.id === id);
  const [note, setNote] = useState(order?.notes || '');

  const handleSaveNote = () => {
    const updated = orders.map(o => o.id === id ? { ...o, notes: note } : o);
    setOrders(updated);
    dispatchNotification('Internal note saved successfully', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!order) {
    return <div className="text-center py-20 text-white font-medium">Loading or Order Not Found...</div>;
  }

  const items = order.items || [];
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 50;
  const tax = subtotal * 0.1;
  const total = subtotal > 0 ? (subtotal + shipping + tax) : 0;

  const getTimelineSteps = (status) => {
    let level = 1;
    if (status === 'In Progress') level = 3;
    if (status === 'Completed') level = 5;
    
    return [
      { status: 'Order Placed', time: order.date, completed: true },
      { status: 'Processing', time: level >= 2 ? order.date : 'Pending', completed: level >= 2 && status !== 'Cancelled' },
      { status: 'Packed', time: level >= 3 ? order.date : 'Pending', completed: level >= 3 && status !== 'Cancelled' },
      { status: 'In Transit', time: level >= 4 ? order.date : 'Pending', completed: level >= 4 && status !== 'Cancelled' },
      { 
        status: status === 'Cancelled' ? 'Cancelled' : 'Delivered', 
        time: (level >= 5 || status === 'Cancelled') ? order.date : 'Pending', 
        completed: level >= 5 || status === 'Cancelled'
      },
    ];
  };

  const dynamicTimeline = getTimelineSteps(order.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Print-only Bill/Invoice Section */}
      <div className="hidden print:block p-8 bg-white text-black min-h-screen">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black text-primary mb-2">INVOICE</h1>
            <p className="text-sm font-bold text-zinc-500">#{order.id}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">Order Management System</h2>
            <p className="text-sm text-zinc-500">123 Business Avenue, Tech City</p>
            <p className="text-sm text-zinc-500">support@oms.com</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xs font-bold uppercase text-zinc-400 mb-2 tracking-widest">Bill To</h3>
            <p className="font-bold text-lg">{order.customer}</p>
            <p className="text-sm text-zinc-600">{order.email}</p>
            <p className="text-sm text-zinc-600">{order.phone}</p>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold uppercase text-zinc-400 mb-2 tracking-widest">Order Date</h3>
            <p className="font-bold">{order.date}</p>
            <h3 className="text-xs font-bold uppercase text-zinc-400 mt-4 mb-2 tracking-widest">Status</h3>
            <p className="font-bold">{order.status}</p>
          </div>
        </div>

        <table className="w-full mb-12 border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="py-4 font-bold text-sm uppercase">Item Description</th>
              <th className="py-4 font-bold text-sm uppercase text-center">Qty</th>
              <th className="py-4 font-bold text-sm uppercase text-right">Unit Price</th>
              <th className="py-4 font-bold text-sm uppercase text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item, i) => (
              <tr key={i} className="border-b border-zinc-200">
                <td className="py-4 font-medium">{item.name}</td>
                <td className="py-4 text-center">{item.quantity}</td>
                <td className="py-4 text-right">${item.price.toFixed(2)}</td>
                <td className="py-4 text-right font-bold">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-zinc-600">
              <span className="font-medium">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span className="font-medium">Shipping Fee</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span className="font-medium">Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-black pt-4">
              <span className="text-xl font-black">Grand Total</span>
              <span className="text-xl font-black">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-24 border-t border-zinc-200 pt-8 text-center text-zinc-400 text-xs">
          Thank you for your business. This is a computer-generated invoice.
        </div>
      </div>

      {/* Screen-only UI Content */}
      <div className="print:hidden space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/orders">
            <button className="p-2 bg-black/5 text-textMuted dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 dark:text-zinc-300 rounded-full transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-textMain">Order {order.id}</h2>
              <Badge variant="primary">{order.status}</Badge>
            </div>
            <p className="text-textMuted text-sm mt-1">Placed on {order.date}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Print</Button>
          <Link to={`/orders/${order.id}/edit`}>
            <Button><Edit className="w-4 h-4 mr-2" /> Edit Order</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary Items */}
          <Card className="glass">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-textMain flex items-center">
                <Package className="w-4 h-4 mr-2 text-primary" /> Order Items
              </h3>
            </div>
            <div className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-black/5 dark:bg-white/5 text-textMuted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-medium text-left">Product</th>
                    <th className="px-6 py-3 font-medium text-center">QTY</th>
                    <th className="px-6 py-3 font-medium text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.length === 0 && (
                    <tr><td colSpan="3" className="px-6 py-6 text-center text-textMuted">No items in this order.</td></tr>
                  )}
                  {items.map((item, i) => (
                    <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded bg-black/5 dark:bg-white/5 border border-border mr-3 flex-shrink-0 flex items-center justify-center">
                            <Package className="w-5 h-5 text-textMuted" />
                          </div>
                          <div>
                            <p className="font-medium text-textMain">{item.name}</p>
                            <p className="text-xs text-textMuted">ID: {item.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-textMain">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-textMain font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-6 bg-black/5 dark:bg-white/5 flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between text-textMuted"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-textMuted"><span>Shipping</span><span>${subtotal > 0 ? shipping.toFixed(2) : "0.00"}</span></div>
                  <div className="flex justify-between text-textMuted"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-textMain font-bold pt-2 border-t border-border text-base">
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline Tracking */}
          <Card className="glass">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-textMain flex items-center">
                <Truck className="w-4 h-4 mr-2 text-primary" /> Fulfillment Progress
              </h3>
            </div>
            <CardContent className="p-6">
              <div className="relative border-l-2 border-border/50 ml-3 space-y-8">
                {dynamicTimeline.map((step, i) => (
                  <div key={i} className="relative pl-10">
                    <div className={`absolute -left-[13px] top-0 w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all ${
                      step.completed 
                        ? 'bg-primary border-primary ring-4 ring-primary/10 text-white' 
                        : 'bg-card border-border text-textMuted'
                    }`}>
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold leading-none ${step.completed ? 'text-textMain' : 'text-textMuted'}`}>{step.status}</h4>
                      <p className="text-xs text-textMuted mt-1.5">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="glass">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-textMain flex items-center text-sm">
                <User className="w-4 h-4 mr-2 text-primary" /> Customer Details
              </h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-xs text-textMuted mb-1">Name</p>
                <p className="text-sm text-textMain font-medium">{order.customer || 'Unknown Customer'}</p>
              </div>
              <div>
                <p className="text-xs text-textMuted mb-1">Email</p>
                <p className="text-sm text-textMain font-medium">{order.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-textMuted mb-1">Phone</p>
                <p className="text-sm text-textMain font-medium">{order.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-textMuted mb-1">Shipping Address</p>
                <p className="text-sm text-textMain font-medium">
                  Default Tech Boulevard<br/>
                  San Francisco, CA 94105<br/>
                  United States
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-textMain flex items-center text-sm">
                <FileText className="w-4 h-4 mr-2 text-primary" /> Internal Notes
              </h3>
            </div>
            <CardContent className="p-5">
              <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-border text-sm text-textMuted italic mb-4">
                {order?.notes || 'No internal notes found for this order. Staff can add notes below to communicate instructions.'}
              </div>
              <textarea 
                className="w-full h-24 bg-card border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-textMain placeholder:text-textMuted mb-2"
                placeholder="Add a new note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
              <Button size="sm" className="w-full" onClick={handleSaveNote}>Save Note</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
  );
}
