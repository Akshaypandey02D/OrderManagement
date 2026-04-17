import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import {
  ArrowDownRight, Package, CheckCircle2, CreditCard, Clock, Star, TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/Dashboard/StatCard';
import { useOrderStore } from '../stores/useOrderStore';
import { useProductStore } from '../stores/useProductStore';
import { Button } from '../components/ui/Button';
import { formatCurrency, formatDate } from '../utils/format';

export default function Dashboard() {
  const { orders } = useOrderStore();
  const { products } = useProductStore();

  // KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const inProgressOrders = orders.filter(o => o.status === 'In Progress').length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
  const backorderOrders = orders.filter(o => o.status === 'Backordered').length;
  const lowStockCount = products.filter(p => Number(p.stock) < (p.minQuantity || 10)).length;

  // Chart Data Preparation
  const ordersByDate = orders.reduce((acc, o) => {
    acc[o.date] = (acc[o.date] || 0) + 1;
    return acc;
  }, {});

  const revenueByDate = orders.reduce((acc, o) => {
    acc[o.date] = (acc[o.date] || 0) + (o.amount || 0);
    return acc;
  }, {});

  const performanceData = Object.keys(ordersByDate).sort().map(date => ({
    name: formatDate(date),
    orders: ordersByDate[date],
    revenue: revenueByDate[date]
  }));

  const statusStyles = {
    'Pending': 'warning',
    'In Progress': 'primary',
    'Completed': 'success',
    'Cancelled': 'danger',
    'Backordered': 'danger'
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-textMain">System Overview</h2>
            <p className="text-sm text-textMuted mt-1">Real-time performance and inventory metrics.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-1 bg-card border border-border rounded-xl">
           <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live System
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          trend="+12.5%"
          trendUp={true}
          icon={CreditCard}
          color="indigo"
        />
        <StatCard
          title="Total Orders"
          value={orders.length}
          trend="Lifetime"
          trendUp={true}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Active Orders"
          value={inProgressOrders + pendingOrders}
          trend="Processing"
          trendUp={true}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Backordered"
          value={backorderOrders}
          trend="Inventory Issue"
          trendUp={false}
          icon={Star}
          color="rose"
        />
        <StatCard
          title="Completed"
          value={completedOrders}
          trend="Fulfillment Rate"
          trendUp={true}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass border-border shadow-xl relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-0">
            <div>
              <CardTitle className="text-xl font-bold text-textMain">Revenue Analysis</CardTitle>
              <p className="text-sm text-textMuted mt-1">Financial performance over the last 30 days.</p>
            </div>
            {performanceData.length > 0 && (
               <div className="text-right">
                  <p className="text-xs font-bold text-textMuted mb-1">Total Yield</p>
                  <p className="text-lg font-bold text-emerald-500 tabular-nums">+{formatCurrency(performanceData[performanceData.length-1].revenue)}</p>
               </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-border/50">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={performanceData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
                    content={({ active, payload }) => {
                       if (active && payload && payload.length) {
                          return (
                             <div className="bg-card text-textMain px-4 py-3 rounded-xl shadow-2xl border border-border backdrop-blur-3xl">
                                <p className="text-xs font-bold text-textMuted mb-2">{payload[0].payload.name}</p>
                                <div className="space-y-1">
                                   <p className="text-lg font-bold text-primary">{formatCurrency(payload[0].value)}</p>
                                   <p className="text-xs font-medium text-textMuted">{payload[0].payload.orders} Transactions</p>
                                </div>
                             </div>
                          );
                       }
                       return null;
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                    barSize={32}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="url(#lineGradient)"
                    strokeWidth={4}
                    dot={{ fill: '#fff', stroke: 'var(--primary)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <CardTitle className="text-xl font-bold text-textMain">Top Products</CardTitle>
              <p className="text-sm text-textMuted mt-1">High volume sales drivers.</p>
            </div>
          </div>
          
          <CardContent className="p-0">
            <div className="space-y-5">
              {(() => {
                const productSales = {};
                orders.forEach(o => {
                  o.items?.forEach(item => {
                    productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
                  });
                });
                const maxVal = Math.max(...Object.values(productSales), 1);
                return Object.entries(productSales)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([name, volume]) => (
                    <div key={name} className="group cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-textMain truncate max-w-[140px] group-hover:text-primary transition-colors">{name}</span>
                        <span className="text-xs font-bold text-textMuted">{volume} units</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000" 
                          style={{ width: `${(volume / maxVal) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ));
              })()}
              
              {Object.keys(orders).length === 0 && (
                <div className="text-center py-10 opacity-30">
                   <Package className="w-10 h-10 mx-auto mb-3" />
                   <p className="text-xs font-bold">Awaiting Data</p>
                </div>
              )}
            </div>
          </CardContent>
          <div className="mt-8 pt-4 border-t border-border">
             <Link to="/products">
                <Button variant="secondary" className="w-full rounded-xl text-xs font-bold">
                   Manage Inventory
                </Button>
             </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="glass border-border shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-textMain">Recent Orders</h3>
            <Link to="/orders">
              <Button size="sm" variant="ghost" className="text-xs font-bold text-primary">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
             {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl hover:border-primary/50 transition-all group">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                         {order.customer.charAt(0)}
                      </div>
                      <div>
                         <p className="text-sm font-bold text-textMain mb-0.5">{order.customer}</p>
                         <p className="text-[10px] font-medium text-textMuted">{order.id} | {formatDate(order.date)}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-bold text-textMain mb-1">{formatCurrency(order.amount)}</p>
                      <Badge variant={statusStyles[order.status]}>{order.status}</Badge>
                   </div>
                </div>
             ))}
          </div>
        </Card>

        {lowStockCount > 0 && (
          <Card className="bg-rose-500/5 border border-rose-500/20 p-6 flex flex-col justify-center relative overflow-hidden rounded-2xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
               <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-500/20 shrink-0">
                  <AlertTriangle className="w-8 h-8" />
               </div>
               <div className="text-center md:text-left">
                  <h4 className="text-xl font-bold text-textMain mb-1">Stock Alert</h4>
                  <p className="text-sm text-textMuted mb-4">
                    There are <span className="text-rose-500 font-bold">{lowStockCount} products</span> currently below their reorder threshold.
                  </p>
                  <Link to="/products">
                    <Button className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold px-6">
                      Fix Now
                    </Button>
                  </Link>
               </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
