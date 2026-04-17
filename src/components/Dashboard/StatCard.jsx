import { Card, CardContent } from '../ui/Card';

export function StatCard({ title, value, trend, trendUp, icon: Icon, color }) {
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
