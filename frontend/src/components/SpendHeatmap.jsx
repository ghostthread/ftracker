import { useProfile } from '../context/ProfileContext';

const getColor = (amount, max) => {
  if (amount === null) return 'bg-slate-100 opacity-30';
  if (amount === 0)    return 'bg-slate-100';
  if (max === 0) return 'bg-slate-100';
  const ratio = amount / max;
  if (ratio > 0.75) return 'bg-indigo-600';
  if (ratio > 0.40) return 'bg-indigo-400';
  if (ratio > 0.15) return 'bg-indigo-200';
  return 'bg-indigo-100';
};

export default function SpendHeatmap() {
  const { dailySpend, currentMonthKey } = useProfile();

  const max = Math.max(...dailySpend.filter(d => d.amount !== null).map(d => d.amount ?? 0), 1);
  const [year, month] = currentMonthKey.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = monthNames[parseInt(month) - 1];

  // Jul 1, 2024 = Monday (weekday index 1). Pad so grid starts on Mon.
  const startPad = 0;
  const cells = [...Array(startPad).fill(null), ...dailySpend];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Daily Spend — {monthName} {year}</h2>
        <p className="text-xs text-slate-400 mt-0.5">Darker = higher spend</p>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 gap-1.5 text-[10px] text-slate-400 font-medium mb-0.5">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          if (d === null) return <div key={`pad-${i}`} />;
          return (
            <div
              key={d.day}
              title={d.amount !== null ? `${monthName} ${d.day}: ₹${d.amount.toLocaleString('en-IN')}` : `${monthName} ${d.day}: future`}
              className={`
                aspect-square rounded-md flex items-center justify-center
                text-[10px] font-medium cursor-default transition-transform hover:scale-110
                ${getColor(d.amount, max)}
                ${d.amount !== null && d.amount > 0 ? 'text-white' : 'text-slate-400'}
              `}
            >
              {d.day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
        <span>Less</span>
        {['bg-slate-100', 'bg-indigo-100', 'bg-indigo-200', 'bg-indigo-400', 'bg-indigo-600'].map(c => (
          <span key={c} className={`w-4 h-4 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
