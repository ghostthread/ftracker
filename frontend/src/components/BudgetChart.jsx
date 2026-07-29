import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { categoryMap } from '../data/mockData';
import { useProfile } from '../context/ProfileContext';

const fmt = (v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-xs space-y-1">
      <p className="font-semibold text-slate-800">{d.icon} {d.name}</p>
      <p className="text-slate-600">Spent: <span className="font-bold text-slate-900">₹{d.spent.toLocaleString('en-IN')}</span></p>
      <p className="text-slate-600">Budget: <span className="font-bold text-slate-900">₹{d.budget.toLocaleString('en-IN')}</span></p>
      <p className={d.over ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
        {d.over
          ? `Over by ₹${(d.spent - d.budget).toLocaleString('en-IN')}`
          : `₹${d.remaining.toLocaleString('en-IN')} remaining`}
      </p>
    </div>
  );
};

export default function BudgetChart() {
  const { categorySpend, budgets, currentMonthKey } = useProfile();

  const data = Object.entries(budgets).map(([id, budget]) => {
    const spent = categorySpend.find(c => c.id === id)?.amount ?? 0;
    const meta = categoryMap[id];
    const pct = spent / budget;
    return {
      name: meta.label,
      icon: meta.icon,
      spent,
      budget,
      remaining: Math.max(0, budget - spent),
      over: spent > budget,
      pct,
      color: meta.color,
    };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Budget vs Actual</h2>
          <p className="text-xs text-slate-400 mt-0.5">{currentMonthKey} · all categories</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 inline-block" /> Spent</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-200 inline-block" /> Budget</span>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="30%" barGap={2} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={40}
            />
            <YAxis
              tickFormatter={fmt}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="budget" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
            <Bar dataKey="spent" radius={[3, 3, 0, 0]}>
              {data.map(d => (
                <Cell key={d.name} fill={d.over ? '#f43f5e' : d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Over-budget callouts */}
      {data.filter(d => d.over).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.filter(d => d.over).map(d => (
            <span key={d.name} className="text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-md px-2 py-1 font-medium">
              {d.icon} {d.name} +₹{(d.spent - d.budget).toLocaleString('en-IN')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
