import { TrendingUp, TrendingDown, IndianRupee, Tag, CalendarDays, ArrowLeftRight } from 'lucide-react';
import { categoryMap } from '../data/mockData';
import { useProfile } from '../context/ProfileContext';

const accentMap = {
  indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  badge: 'bg-indigo-100 text-indigo-700' },
  violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  badge: 'bg-violet-100 text-violet-700' },
  sky:     { bg: 'bg-sky-50',     icon: 'text-sky-600',     badge: 'bg-sky-100 text-sky-700' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  rose:    { bg: 'bg-rose-50',    icon: 'text-rose-600',    badge: 'bg-rose-100 text-rose-700' },
};

const fmt = (v) => `₹${v.toLocaleString('en-IN')}`;

export default function StatCards() {
  const { categorySpend, monthlySpend, currentMonthKey } = useProfile();

  const thisMonth = monthlySpend.at(-1)?.total || 0;
  const lastMonth = monthlySpend.at(-2)?.total || 0;
  const pctChange = lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : '0';
  const isOver = thisMonth > lastMonth;

  const topCat = [...categorySpend].sort((a, b) => b.amount - a.amount)[0];
  const topCatMeta = categoryMap[topCat?.id];

  const daysElapsed = parseInt(currentMonthKey.split('-')[2]) || 29;
  const dailyAvg = daysElapsed > 0 ? Math.round(thisMonth / daysElapsed) : 0;

  const cards = [
    {
      label: 'Total Spent — ' + currentMonthKey.slice(5),
      value: fmt(thisMonth),
      sub: `${fmt(lastMonth)} last month`,
      badge: `${isOver ? '+' : ''}${pctChange}%`,
      positive: !isOver,
      icon: IndianRupee,
      accent: 'indigo',
    },
    {
      label: 'Top Category',
      value: topCatMeta ? `${topCatMeta.icon} ${topCatMeta.label}` : 'N/A',
      sub: topCat ? `${fmt(topCat.amount)} this month` : 'No data',
      badge: 'Highest',
      positive: null,
      icon: Tag,
      accent: 'violet',
    },
    {
      label: 'Daily Average',
      value: fmt(dailyAvg),
      sub: `Over ${daysElapsed} days`,
      badge: `${daysElapsed} days`,
      positive: null,
      icon: CalendarDays,
      accent: 'sky',
    },
    {
      label: 'vs Last Month',
      value: isOver ? `+${fmt(thisMonth - lastMonth)}` : `-${fmt(lastMonth - thisMonth)}`,
      sub: isOver ? 'Spent more than last month' : 'Spent less than last month',
      badge: isOver ? 'Over' : 'Under',
      positive: !isOver,
      icon: ArrowLeftRight,
      accent: isOver ? 'rose' : 'emerald',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, badge, positive, icon: Icon, accent }) => {
        const a = accentMap[accent];
        return (
          <div
            key={label}
            className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex flex-col gap-3
              hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-slate-500 leading-snug">{label}</p>
              <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${a.icon}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{value}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md
                ${positive === true  ? 'bg-emerald-50 text-emerald-700' :
                  positive === false ? 'bg-rose-50 text-rose-700'       :
                  a.badge}`}
              >
                {positive === true  && <TrendingDown className="w-3 h-3" />}
                {positive === false && <TrendingUp   className="w-3 h-3" />}
                {badge}
              </span>
              <span className="text-xs text-slate-400">{sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
