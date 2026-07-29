import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { categoryMap } from '../data/mockData';
import { useProfile } from '../context/ProfileContext';

const CustomTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-800">{d.icon} {d.label}</p>
      <p className="text-slate-500">₹{d.amount.toLocaleString('en-IN')} · {((d.amount / total) * 100).toFixed(1)}%</p>
    </div>
  );
};

export default function CategoryChart() {
  const { categorySpend } = useProfile();

  const total = categorySpend.reduce((s, c) => s + c.amount, 0);
  const top5 = [...categorySpend].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const pieData = top5.map(c => ({ ...c, ...categoryMap[c.id] }));

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Spend by Category</h2>
        <p className="text-xs text-slate-400 mt-0.5">Top 5 this month</p>
      </div>

      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%" cy="50%"
              innerRadius={50} outerRadius={70}
              paddingAngle={3}
              dataKey="amount"
              strokeWidth={0}
            >
              {pieData.map(d => <Cell key={d.id} fill={d.color} />)}
            </Pie>
            <Tooltip content={(props) => <CustomTooltip {...props} total={total} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs text-slate-400">Total</p>
          <p className="text-base font-bold text-slate-900">₹{(total / 1000).toFixed(1)}k</p>
        </div>
      </div>

      <div className="space-y-2">
        {pieData.map(d => (
          <div key={d.id} className="flex items-center gap-2">
            <span className="text-sm shrink-0">{d.icon}</span>
            <span className="text-xs text-slate-600 w-20 shrink-0">{d.label}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(d.amount / top5[0].amount) * 100}%`, background: d.color }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-700 w-14 text-right shrink-0">
              ₹{d.amount.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
