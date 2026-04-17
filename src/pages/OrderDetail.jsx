import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Edit, Package, User, FileText, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { useOrderStore } from '../stores/useOrderStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { orderService } from '../services/orderService';
import { formatCurrency, formatDate } from '../utils/format';

const statusStyles = {
  'Pending': 'warning',
  'In Progress': 'primary',
  'Completed': 'success',
  'Cancelled': 'danger',
  'Backordered': 'danger'
};

export default function OrderDetail() {
  const { id } = useParams();
  const { getOrderById } = useOrderStore();
  const { dispatchNotification } = useNotificationStore();
  
  const [note, setNote] = useState('');
  const order = getOrderById(id);

  useEffect(() => {
    if (order) {
      setNote(order.notes || '');
    }
  }, [id, order?.notes]);

  const handleSaveNote = () => {
    orderService.addOrderNote(id, note);
    dispatchNotification('Internal note saved and added to history', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-textMain">Order Not Found</h2>
        <p className="text-sm text-textMuted mt-2 mb-8 uppercase tracking-widest font-black opacity-50">Invalid Order Identification</p>
        <Link to="/orders">
          <Button variant="secondary"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Terminal</Button>
        </Link>
      </div>
    );
  }

  const items = order.items || [];
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 50;
  const tax = subtotal * 0.1;
  const total = subtotal > 0 ? (subtotal + shipping + tax) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Print View (Hidden in Browser) */}
      <div className="hidden print:block p-8 bg-white text-black min-h-screen">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black text-primary mb-2">INVOICE</h1>
            <p className="text-sm font-bold text-zinc-500">#{order.id}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">FastFleet Core Systems</h2>
            <p className="text-sm text-zinc-500">123 Logistics Boulevard, Tech City</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Client Recipient</h3>
            <p className="font-bold text-lg">{order.customer}</p>
            <p className="text-sm text-zinc-600">{order.email}</p>
          </div>
          <div className="text-right">
            <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Transaction Date</h3>
            <p className="font-bold">{formatDate(order.date)}</p>
          </div>
        </div>

        <table className="w-full mb-12 border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="py-4 font-black text-xs uppercase tracking-tighter">Manifest</th>
              <th className="py-4 font-black text-xs uppercase text-center">Qty</th>
              <th className="py-4 font-black text-xs uppercase text-right">Unit Price</th>
              <th className="py-4 font-black text-xs uppercase text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-zinc-200">
                <td className="py-4 font-bold text-sm">{item.name}</td>
                <td className="py-4 text-center">{item.quantity}</td>
                <td className="py-4 text-right">{formatCurrency(item.price)}</td>
                <td className="py-4 text-right font-black">{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-zinc-600 text-sm"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-zinc-600 text-sm"><span>Shipping Charge</span><span>{formatCurrency(shipping)}</span></div>
            <div className="flex justify-between text-zinc-600 text-sm"><span>Tax Analysis (10%)</span><span>{formatCurrency(tax)}</span></div>
            <div className="flex justify-between border-t border-black pt-4">
              <span className="text-xl font-black">Net Total</span>
              <span className="text-xl font-black text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main View (Browser) */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Link to="/orders">
              <button className="p-2.5 bg-card hover:bg-black/10 dark:hover:bg-white/10 text-textMuted rounded-xl transition-all border border-border">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-black text-textMain tracking-tight">Order {order.id}</h2>
                <Badge variant={statusStyles[order.status] || 'primary'}>{order.status}</Badge>
              </div>
              <p className="text-textMuted text-xs font-black uppercase tracking-widest mt-1 opacity-50">Log Generated on {formatDate(order.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="secondary" onClick={handlePrint} className="flex-1 md:flex-none"><Printer className="w-4 h-4 mr-2" /> Invoice</Button>
            <Link to={`/orders/${order.id}/edit`} className="flex-1 md:flex-none">
              <Button className="w-full"><Edit className="w-4 h-4 mr-2" /> Modify</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="font-bold text-textMain flex items-center text-sm uppercase tracking-widest">
                  <Package className="w-4 h-4 mr-3 text-primary" /> Shipment Contents
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-black/5 dark:bg-white/5 text-[10px] text-textMuted border-b border-border uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 font-black">Item Manifest</th>
                      <th className="px-6 py-4 font-black text-center">Qty</th>
                      <th className="px-6 py-4 font-black text-right">valuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {items.map((item, i) => (
                      <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 mr-4 flex-shrink-0 flex items-center justify-center text-primary font-black uppercase shadow-inner text-xs">
                              {item.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-textMain leading-tight">{item.name}</p>
                              <p className="text-[10px] text-textMuted font-black uppercase tracking-tighter opacity-50 mt-1">{item.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-textMain font-black">{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-textMain font-bold">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-8 bg-black/5 dark:bg-white/5 border-t border-border flex justify-end">
                <div className="w-72 space-y-3 p-2">
                  <div className="flex justify-between text-xs text-textMuted font-bold uppercase tracking-widest"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between text-xs text-textMuted font-bold uppercase tracking-widest"><span>Logistics Fee</span><span>{formatCurrency(shipping)}</span></div>
                  <div className="flex justify-between text-xs text-textMuted font-bold uppercase tracking-widest"><span>Service Tax</span><span>{formatCurrency(tax)}</span></div>
                  <div className="flex justify-between items-center text-textMain pt-6 border-t border-border mt-4">
                    <span className="text-sm font-black uppercase tracking-widest">Net Valuation</span>
                    <span className="text-2xl font-black text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* AUDIT LOG / HISTORY - THE NEW FEATURE */}
            <Card className="glass">
              <div className="p-6 border-b border-border">
                <h3 className="font-bold text-textMain flex items-center text-sm uppercase tracking-widest">
                  <History className="w-4 h-4 mr-3 text-primary" /> Activity Audit Log
                </h3>
              </div>
              <CardContent className="p-8">
                <div className="relative border-l-2 border-border/70 ml-3 space-y-10">
                  {(order.history || [{ date: order.date, event: 'Order Initialized', note: 'Legacy data migration' }]).map((log, i) => (
                    <div key={i} className="relative pl-10 group">
                      <div className={`absolute -left-[11px] top-0 w-5 h-5 flex items-center justify-center rounded-lg rotate-45 border-2 transition-all ${
                        i === 0 
                          ? 'bg-primary border-primary ring-4 ring-primary/10 text-white' 
                          : 'bg-card border-border text-textMuted'
                      }`}>
                        <div className="-rotate-45 font-black text-[8px]">{i + 1}</div>
                      </div>
                      <div className="transition-all group-hover:translate-x-1">
                        <div className="flex items-center gap-3">
                           <h4 className="text-xs font-black uppercase tracking-widest text-textMain">{log.event}</h4>
                           <span className="text-[10px] font-bold text-textMuted opacity-50">{log.date}</span>
                        </div>
                        <p className="text-sm text-textMuted mt-2 font-medium bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-border/50 shadow-inner italic">
                          "{log.note}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass">
              <div className="p-6 border-b border-border">
                <h3 className="font-bold text-textMain flex items-center text-sm uppercase tracking-widest">
                  <User className="w-4 h-4 mr-3 text-primary" /> Recipient File
                </h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-textMuted tracking-widest mb-1">Customer Identifier</p>
                    <p className="text-sm font-black text-textMain">{order.customer}</p>
                    <p className="text-xs text-textMuted mt-1">{order.email}</p>
                    <p className="text-xs text-textMuted">{order.phone}</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-border">
                  <p className="text-[10px] font-black uppercase text-textMuted tracking-widest mb-3">Delivery Coordinates</p>
                  <p className="text-xs font-medium text-textMain leading-relaxed p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-border shadow-inner">
                    Global Distribution Hub 7<br/>
                    Warehouse B-42, Sector 9<br/>
                    Logistics Park Central
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <div className="p-6 border-b border-border">
                <h3 className="font-bold text-textMain flex items-center text-sm uppercase tracking-widest">
                  <FileText className="w-4 h-4 mr-3 text-primary" /> Operations Memo
                </h3>
              </div>
              <CardContent className="p-6">
                <textarea 
                  className="w-full h-32 bg-black/5 dark:bg-white/5 border border-border rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary text-textMain placeholder:text-textMuted mb-4 shadow-inner resize-none transition-all"
                  placeholder="Insert secure internal memo..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
                <Button size="sm" className="w-full h-11 rounded-xl shadow-lg shadow-primary/20" onClick={handleSaveNote}>
                  Commit Memo to Log
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
