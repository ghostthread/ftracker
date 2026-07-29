import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { CATEGORIES, categoryMap } from '../data/mockData';
import { useProfile } from '../context/ProfileContext';

const fmt = (v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`;

const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-xs space-y-1">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map(p => {
        const meta = categoryMap[p.dataKey];
        return (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-600">{meta?.label ?? p.dataKey}</span>
            <span className="font-bold text-slate-900 ml-auto pl-3">₹{p.value.toLocaleString('en-IN')}</span>
          </div>
        );
      })}
    </div>
  );
};

const DayTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-indigo-600 font-bold">Avg ₹{payload[0].value.toLocaleString('en-IN')}</p>
    </div>
  );
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AnalyticsPage() {
  const { expenses } = useProfile();

  const { categoryTrends, topCats, byDayOfWeek, catSummary, monthLabels } = useMemo(() => {
    // Build month → category → total map
    const monthCatMap = {};
    expenses.forEach(e => {
      const m = e.date.slice(0, 7);
      if (!monthCatMap[m]) monthCatMap[m] = {};
      monthCatMap[m][e.category] = (monthCatMap[m][e.category] ?? 0) + e.amount;
    });

    const sortedMonths = Object.keys(monthCatMap).sort();
    const monthLabels = sortedMonths.map(m =>
      new Date(m + '-01').toLocaleString('default', { month: 'short' })
    );

    const categoryTrends = sortedMonths.map((m, i) => ({
      month: monthLabels[i],
      ...monthCatMap[m],
    }));

    // Top 5 categories by total spend
    const catTotals = {};
    CATEGORIES.forEach(c => { catTotals[c.id] = 0; });
    expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] ?? 0) + e.amount; });
    const topCats = Object.entries(catTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => id);

    // Average spend by day of week
    const dayTotals = Array(7).fill(0);
    const dayCounts = Array(7).fill(0);
    expenses.forEach(e => {
      const dow = new Date(e.date).getDay();
      dayTotals[dow] += e.amount;
      dayCounts[dow]++;
    });
    const byDayOfWeek = DAY_NAMES.map((day, i) => ({
      day,
      avg: dayCounts[i] ? Math.round(dayTotals[i] / dayCounts[i]) : 0,
    }));

    // Category summary table
    const catSummary = CATEGORIES.map(c => {
      const months = sortedMonths.map(m => monthCatMap[m]?.[c.id] ?? 0);
      const total = months.reduce((s, v) => s + v, 0);
      return {
        id: c.id,
        meta: c,
        months,
        total,
        avg: sortedMonths.length ? Math.round(total / sortedMonths.length) : 0,
        max: months.length ? Math.max(...months) : 0,
      };
    }).filter(r => r.total > 0).sort((a, b) => b.total - a.total);

    return { categoryTrends, topCats, byDayOfWeek, catSummary, monthLabels };
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">Spending patterns</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center text-sm text-slate-400">
          No expense data yet. Log some expenses via Alexa or manually.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Analytics</h1>
        <p className="text-xs text-slate-400 mt-0.5">Spending patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Category trend lines */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Category Trends</h2>
            <p className="text-xs text-slate-400 mt-0.5">Monthly spend per top category</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={categoryTrends} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<TrendTooltip />} />
                <Legend
                  formatter={(value) => categoryMap[value]?.label ?? value}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                  iconType="circle" iconSize={7}
                />
                {topCats.map(id => (
                  <Line
                    key={id}
                    type="monotone"
                    dataKey={id}
                    stroke={categoryMap[id]?.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Avg spend by day of week */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Spend by Day of Week</h2>
            <p className="text-xs text-slate-400 mt-0.5">Average daily spend pattern</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDayOfWeek} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<DayTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="avg" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Category Breakdown</h2>
          <p className="text-xs text-slate-400 mt-0.5">{monthLabels.length}-month summary per category</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Category</th>
                {monthLabels.map(m => (
                  <th key={m} className="px-3 py-3 text-right text-xs font-semibold text-slate-500">{m}</th>
                ))}
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Total</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Monthly Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {catSummary.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <span>{row.meta.icon}</span> {row.meta.label}
                    </span>
                  </td>
                  {row.months.map((v, i) => (
                    <td key={i} className={`px-3 py-3 text-right text-xs
                      ${v === row.max && v > 0 ? 'font-bold text-rose-600' : 'text-slate-600'}
                      ${v === 0 ? 'text-slate-300' : ''}`}
                    >
                      {v === 0 ? '—' : `₹${(v / 1000).toFixed(1)}k`}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right text-xs font-bold text-slate-900">
                    ₹{row.total.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-slate-500">
                    ₹{row.avg.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
