import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingDown, TrendingUp, Download } from 'lucide-react';
import { categoryMap, CATEGORIES } from '../data/mockData';
import { useProfile } from '../context/ProfileContext';

const fmt = (v) => `₹${(v / 1000).toFixed(0)}k`;

const TooltipComp = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-xs space-y-1">
      <p className="font-semibold text-slate-700">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600 capitalize">{p.dataKey}</span>
          <span className="font-bold text-slate-900 ml-auto pl-3">₹{p.value.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const { expenses, budgets } = useProfile();

  const monthlyReports = useMemo(() => {
    const monthMap = {};
    expenses.forEach(e => {
      const m = e.date.slice(0, 7);
      if (!monthMap[m]) monthMap[m] = { categories: {}, txCount: 0 };
      monthMap[m].categories[e.category] = (monthMap[m].categories[e.category] ?? 0) + e.amount;
      monthMap[m].txCount++;
    });

    const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);

    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => {
        const total = Object.values(data.categories).reduce((s, v) => s + v, 0);
        const topCat = Object.entries(data.categories).sort(([, a], [, b]) => b - a)[0];
        const date = new Date(key + '-01');
        return {
          monthKey: key,
          month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
          short: date.toLocaleString('default', { month: 'short' }),
          total,
          budget: totalBudget,
          topCat: topCat?.[0],
          topAmt: topCat?.[1] ?? 0,
          categories: data.categories,
          txCount: data.txCount,
        };
      });
  }, [expenses, budgets]);

  const barData = monthlyReports.map(r => ({ month: r.short, total: r.total, budget: r.budget }));

  if (expenses.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">Monthly summaries</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center text-sm text-slate-400">
          No expense data yet. Log some expenses via Alexa or manually.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">Monthly summaries</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600
          border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
          <Download className="w-3.5 h-3.5" /> Export All
        </button>
      </div>

      {/* Overview bar chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Overview</h2>
        <p className="text-xs text-slate-400 mb-4">Actual vs budget by month</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barCategoryGap="35%" barGap={3} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<TooltipComp />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="budget" fill="#e2e8f0" radius={[3, 3, 0, 0]} name="budget" />
              <Bar dataKey="total" radius={[3, 3, 0, 0]} name="total">
                {barData.map(d => (
                  <Cell key={d.month} fill={d.total > d.budget ? '#f43f5e' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Month cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...monthlyReports].reverse().map(r => {
          const isOver = r.total > r.budget;
          const diff = Math.abs(r.total - r.budget);
          const sortedCats = CATEGORIES
            .map(c => ({ ...c, amt: r.categories[c.id] ?? 0 }))
            .filter(c => c.amt > 0)
            .sort((a, b) => b.amt - a.amt)
            .slice(0, 4);

          return (
            <div key={r.monthKey} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{r.month}</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">₹{r.total.toLocaleString('en-IN')}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md
                  ${isOver ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {isOver ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isOver ? `+₹${diff.toLocaleString('en-IN')}` : `-₹${diff.toLocaleString('en-IN')}`}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>{((r.total / r.budget) * 100).toFixed(0)}% of budget</span>
                  <span>Budget ₹{(r.budget / 1000).toFixed(0)}k</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (r.total / r.budget) * 100)}%`,
                      background: isOver ? '#f43f5e' : '#6366f1',
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                {sortedCats.map(c => (
                  <div key={c.id} className="flex items-center gap-2">
                    <span className="text-xs w-4 shrink-0">{c.icon}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(c.amt / sortedCats[0].amt) * 100}%`, background: c.color }} />
                    </div>
                    <span className="text-[11px] text-slate-500 w-14 text-right shrink-0">₹{(c.amt / 1000).toFixed(1)}k</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">{r.txCount} transactions</span>
                <button className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium">
                  View details →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
