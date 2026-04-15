import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Edit, Package, Truck, User, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';

const timelineSteps = [
  { status: 'Order Placed', time: '10:00 AM, Apr 15', completed: true },
  { status: 'Processing', time: '11:30 AM, Apr 15', completed: true },
  { status: 'Packed', time: '02:15 PM, Apr 15', completed: true },
  { status: 'In Transit', time: 'Pending', completed: false },
  { status: 'Delivered', time: 'Pending', completed: false },
];

export default function OrderDetail() {
  const { id } = useParams();
  
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
              <h2 className="text-2xl font-bold text-white">Order {id || 'ORD-001'}</h2>
              <Badge variant="primary">In Progress</Badge>
            </div>
            <p className="text-zinc-400 text-sm mt-1">Placed on April 15, 2026 at 10:00 AM</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary"><Printer className="w-4 h-4 mr-2" /> Print</Button>
          <Button><Edit className="w-4 h-4 mr-2" /> Edit Order</Button>
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
                  {[1, 2].map((i) => (
                    <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded bg-zinc-800 mr-3 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-white">Premium Workspace Desk</p>
                            <p className="text-xs text-zinc-500">SKU: FUR-00{i}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-zinc-300">1</td>
                      <td className="px-6 py-4 text-right text-zinc-300">$600.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-6 bg-zinc-900/30 flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>$1,200.00</span></div>
                  <div className="flex justify-between text-zinc-400"><span>Shipping</span><span>$50.00</span></div>
                  <div className="flex justify-between text-zinc-400"><span>Tax</span><span>$125.00</span></div>
                  <div className="flex justify-between text-white font-bold pt-2 border-t border-border text-base">
                    <span>Total</span><span>$1,375.00</span>
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
                {timelineSteps.map((step, i) => (
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
                <p className="text-sm text-zinc-200">Alex Johnson (Acme Corp)</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Email</p>
                <p className="text-sm text-zinc-200">alex.j@acmecorp.com</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Phone</p>
                <p className="text-sm text-zinc-200">+1 (555) 123-4567</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Shipping Address</p>
                <p className="text-sm text-zinc-200">
                  123 Tech Boulevard, Suite 400<br/>
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
