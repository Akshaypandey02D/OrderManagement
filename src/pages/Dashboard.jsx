import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ArrowUpRight, ArrowDownRight, Package, Clock, CheckCircle2, XOctagon } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

const revenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
  { name: 'Jul', value: 7000 },
];

const statsCards = [
  { title: 'Total Orders', value: '2,854', icon: Package, trend: '+12.5%', isPositive: true, color: 'text-primary' },
  { title: 'In Progress', value: '845', icon: Clock, trend: '+5.2%', isPositive: true, color: 'text-amber-500' },
  { title: 'Completed', value: '1,820', icon: CheckCircle2, trend: '+18.1%', isPositive: true, color: 'text-emerald-500' },
  { title: 'Cancelled', value: '189', icon: XOctagon, trend: '-2.4%', isPositive: false, color: 'text-rose-500' },
];

const recentOrders = [
  { id: 'ORD-7234', customer: 'Acme Corp', amount: '$4,200.00', status: 'success', date: '2 mins ago' },
  { id: 'ORD-7235', customer: 'Global Ind.', amount: '$1,850.00', status: 'primary', date: '15 mins ago' },
  { id: 'ORD-7236', customer: 'TechStart', amount: '$940.00', status: 'warning', date: '1 hour ago' },
  { id: 'ORD-7237', customer: 'Omega LLC', amount: '$12,400.00', status: 'success', date: '2 hours ago' },
  { id: 'ORD-7238', customer: 'Nexus Systems', amount: '$450.00', status: 'danger', date: '3 hours ago' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h2>
          <p className="text-zinc-400 mt-1">Welcome back. Here is what's happening with your orders today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <Card key={i} className="glass hover:-translate-y-1 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className={`text-xs mt-1 flex items-center ${stat.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass">
          <CardHeader>
            <CardTitle className="text-zinc-100">Order Volume Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Widget */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-zinc-100">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {recentOrders.map((order, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    order.status === 'success' ? 'bg-emerald-500' : 
                    order.status === 'primary' ? 'bg-primary' : 
                    order.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-zinc-100 leading-none">{order.customer}</p>
                    <p className="text-xs text-zinc-500">{order.id} • {order.amount}</p>
                  </div>
                  <div className="text-xs text-zinc-400">{order.date}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
