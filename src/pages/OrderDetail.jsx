import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Edit, Package, Truck, User, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
    const foundOrder = savedOrders.find(o => o.id === id);
    if (foundOrder) setOrder(foundOrder);
  }, [id]);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/orders">
            <button className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-white">Order {order.id}</h2>
              <Badge variant="primary">{order.status}</Badge>
            </div>
            <p className="text-zinc-400 text-sm mt-1">Placed on {order.date}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary"><Printer className="w-4 h-4 mr-2" /> Print</Button>
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
              <h3 className="font-semibold text-white flex items-center">
                <Package className="w-4 h-4 mr-2 text-primary" /> Order Items
              </h3>
            </div>
            <div className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900/50 text-zinc-400 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-medium text-left">Product</th>
                    <th className="px-6 py-3 font-medium text-center">QTY</th>
                    <th className="px-6 py-3 font-medium text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.length === 0 && (
                    <tr><td colSpan="3" className="px-6 py-6 text-center text-zinc-500">No items in this order.</td></tr>
                  )}
                  {items.map((item, i) => (
                    <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded bg-zinc-800 mr-3 flex-shrink-0 flex items-center justify-center">
                            <Package className="w-5 h-5 text-zinc-500" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{item.name}</p>
                            <p className="text-xs text-zinc-500">ID: {item.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-zinc-300">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-zinc-300">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-6 bg-zinc-900/30 flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-zinc-400"><span>Shipping</span><span>${subtotal > 0 ? shipping.toFixed(2) : "0.00"}</span></div>
                  <div className="flex justify-between text-zinc-400"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-white font-bold pt-2 border-t border-border text-base">
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline Tracking */}
          <Card className="glass">
            <div className="p-6 border-b border-border">
              <h3 className="font-semibold text-white flex items-center">
                <Truck className="w-4 h-4 mr-2 text-primary" /> Fulfillment Progress
              </h3>
            </div>
            <CardContent className="p-6">
              <div className="relative border-l border-zinc-700 ml-3 space-y-8">
                {dynamicTimeline.map((step, i) => (
                  <div key={i} className="relative pl-8">
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${
                      step.completed 
                        ? 'bg-primary border-primary ring-4 ring-primary/20' 
                        : 'bg-zinc-900 border-zinc-600'
                    }`} flex items-center justify-center>
                      {step.completed && <CheckCircle2 className="w-3 h-3 text-white absolute -left-0.5 -top-0.5" />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${step.completed ? 'text-white' : 'text-zinc-500'}`}>{step.status}</h4>
                      <p className="text-xs text-zinc-500 mt-1">{step.time}</p>
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
              <h3 className="font-semibold text-white flex items-center text-sm">
                <User className="w-4 h-4 mr-2 text-primary" /> Customer Details
              </h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Name</p>
                <p className="text-sm text-zinc-200">{order.customer || 'Unknown Customer'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Email</p>
                <p className="text-sm text-zinc-200">{order.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Phone</p>
                <p className="text-sm text-zinc-200">{order.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Shipping Address</p>
                <p className="text-sm text-zinc-200">
                  Default Tech Boulevard<br/>
                  San Francisco, CA 94105<br/>
                  United States
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-white flex items-center text-sm">
                <FileText className="w-4 h-4 mr-2 text-primary" /> Internal Notes
              </h3>
            </div>
            <CardContent className="p-5">
              <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 text-sm text-zinc-300 italic mb-4">
                "Customer requested expedited shipping if possible. Please ensure fragile stickers are applied."
              </div>
              <textarea 
                className="w-full h-24 bg-zinc-900 border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-zinc-200 placeholder:text-zinc-600"
                placeholder="Add a new note..."
              ></textarea>
              <Button size="sm" className="w-full mt-3">Save Note</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
