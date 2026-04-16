import { useState } from 'react';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { 
  ArrowDownRight, Package, CheckCircle2, ChevronRight, Calendar, Download, CreditCard, Clock
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../core/AppContext';

export default function Dashboard() {
  const { orders, products } = useAppContext();

  // Logic: Extract actual date range from orders
  const sortedDates = [...orders].map(o => o.date).sort();
  const dateRangeStr = sortedDates.length > 0 
    ? `${new Date(sortedDates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(sortedDates[sortedDates.length - 1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'No data available';

  // KPI Calculations
  const totalRevenue = orders.reduce((sum, o) => {
    const val = parseFloat(o.amount.replace(/[^0-9.-]+/g,""));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  
  const formattedRevenue = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(totalRevenue);

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const inProgressOrders = orders.filter(o => o.status === 'In Progress').length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
  const lowStockCount = products.filter(p => p.stock < (p.minQuantity || 10)).length;

  // Chart Data Preparation
  const ordersByDate = orders.reduce((acc, o) => {
    acc[o.date] = (acc[o.date] || 0) + 1;
    return acc;
  }, {});

  const revenueByDate = orders.reduce((acc, o) => {
    const val = parseFloat(o.amount.replace(/[^0-9.-]+/g,""));
    acc[o.date] = (acc[o.date] || 0) + val;
    return acc;
  }, {});

  const performanceData = Object.keys(ordersByDate).sort().map(date => ({
    name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    orders: ordersByDate[date],
    revenue: revenueByDate[date]
  }));

  return (
    <div className="space-y-10 pb-16">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-2 h-8 bg-primary rounded-full" />
           <h2 className="text-2xl font-black text-textMain tracking-tight">Analytics Command Center</h2>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="bg-card/40 backdrop-blur-md border border-border" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" /> Export Logs
          </Button>
          <Link to="/orders/new">
            <Button className="shadow-lg shadow-primary/25">
              Generate New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid - Total & Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Gross Revenue" 
          value={formattedRevenue} 
          trend="+12%" 
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
          title="In Progress" 
          value={inProgressOrders} 
          trend="Active" 
          trendUp={true} 
          icon={Clock}
          color="amber"
          className="lg:col-span-1"
        />
        <StatCard 
          title="Completed" 
          value={completedOrders} 
          trend="Success" 
          trendUp={true} 
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard 
          title="Cancelled" 
          value={cancelledOrders} 
          trend="Lost" 
          trendUp={false} 
          icon={ArrowDownRight}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
         <StatCard 
          title="Pending Approval" 
          value={pendingOrders} 
          trend="Awaiting" 
          trendUp={false} 
          icon={Package}
          color="blue"
        />
        <StatCard 
          title="Inventory Risk" 
          value={lowStockCount} 
          trend={`${lowStockCount > 0 ? 'Urgent' : 'Healthy'}`} 
          trendUp={lowStockCount === 0} 
          icon={ArrowDownRight}
          color={lowStockCount > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Sales Performance Chart */}
        <Card className="xl:col-span-2 glass border-border shadow-2xl relative overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between relative z-10">
            <div>
              <CardTitle className="text-xl font-black text-textMain">Revenue Pulse</CardTitle>
              <p className="text-sm text-textMuted font-medium italic">Advanced fulfillment & yield diagnostics</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                 <span className="text-[10px] font-black uppercase text-primary">Live stream</span>
               </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="h-[400px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={performanceData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-muted)" 
                    fontSize={10} 
                    fontWeight="bold"
                    axisLine={false} 
                    tickLine={false} 
                    dy={15}
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={10} 
                    fontWeight="bold"
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      backdropFilter: 'blur(10px)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                    }}
                    labelStyle={{ color: '#fff', fontWeight: '900', marginBottom: '4px' }}
                    itemStyle={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="url(#barGradient)" 
                    radius={[10, 10, 0, 0]} 
                    barSize={40}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={4} 
                    dot={{ fill: '#fff', stroke: 'var(--primary)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--primary)' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          {/* Subtle background flair */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] z-0 group-hover:bg-primary/20 transition-all duration-700" />
        </Card>

        {/* Recent Activity / Top Customers */}
        <Card className="glass border-border shadow-md flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-textMain">Top Fulfillments</CardTitle>
            <p className="text-sm text-textMuted">Highest value orders recently placed</p>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="text-center py-10">
                  <Package className="w-10 h-10 text-border mx-auto mb-2" />
                  <p className="text-textMuted text-sm">No activity records found</p>
                </div>
              ) : (
                [...orders]
                  .sort((a, b) => parseFloat(b.amount.replace(/[^0-9.-]+/g,"")) - parseFloat(a.amount.replace(/[^0-9.-]+/g,"")))
                  .slice(0, 6)
                  .map((order) => (
                    <div key={order.id} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {order.customer.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-textMain leading-none">{order.customer}</p>
                          <p className="text-xs text-textMuted mt-1">{order.id} • {order.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-textMain">{order.amount}</p>
                        <Badge className="text-[10px] h-4 px-1.5" variant={order.status === 'Completed' ? 'success' : 'warning'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))
              )}
            </div>
            <Link to="/orders">
              <Button variant="ghost" className="w-full mt-6 text-primary hover:bg-primary/5">
                View All Transactions <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Critical Stock Alert Bar (Lower half) */}
      {lowStockCount > 0 && (
        <Card className="border-l-4 border-l-rose-500 bg-rose-500/5 dark:bg-rose-500/10 border-border overflow-hidden">
          <CardContent className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500 text-white rounded-lg">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-textMain">Inventory Risk Detected</h4>
                <p className="text-sm text-textMuted">{lowStockCount} products are trending towards stockouts. Immediate restock recommended.</p>
              </div>
            </div>
            <Link to="/inventory/low-stock">
              <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white border-none shadow-sm">
                Manage Inventory
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ title, value, trend, trendUp, icon: Icon, color }) {
  const colorMap = {
    indigo: 'text-indigo-500 bg-indigo-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    rose: 'text-rose-500 bg-rose-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
  };

  return (
    <Card className="glass border-border shadow-sm group hover:scale-[1.02] transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-xl ${colorMap[color] || colorMap.indigo}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend}
          </div>
        </div>
        <div>
          <h4 className="text-textMuted text-xs font-bold uppercase tracking-wider">{title}</h4>
          <p className="text-2xl font-black text-textMain mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
